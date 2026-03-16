import { Octokit } from '@octokit/rest';

// ---------------------------------------------------------------------------
// GitHub API client — wraps Octokit for clean repo read/write operations
// ---------------------------------------------------------------------------
// Hardened: updateFile and createFile retry on 409/422 (stale SHA) by
//           re-fetching the fresh SHA and retrying once automatically.
// ---------------------------------------------------------------------------

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function parseRepo(repoEnv: string): { owner: string; repo: string } {
  const [owner, repo] = repoEnv.split('/');
  if (!owner || !repo) throw new Error(`Invalid repo format: ${repoEnv}`);
  return { owner, repo };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
}

export interface FileContent {
  content: string;
  sha: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  date: Date;
  author: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export async function getFileContent(
  repoEnv: string,
  path: string,
): Promise<FileContent | null> {
  const { owner, repo } = parseRepo(repoEnv);
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(data) || data.type !== 'file') return null;
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (err: unknown) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function listDirectory(
  repoEnv: string,
  path: string,
): Promise<GitHubFile[]> {
  const { owner, repo } = parseRepo(repoEnv);
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (!Array.isArray(data)) return [];
    return data
      .filter((f) => f.type === 'file' || f.type === 'dir')
      .map((f) => ({
        name: f.name,
        path: f.path,
        sha: f.sha,
        type: f.type as 'file' | 'dir',
      }));
  } catch (err: unknown) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

export async function getRecentCommits(
  repoEnv: string,
  since: Date,
  path?: string,
): Promise<CommitInfo[]> {
  const { owner, repo } = parseRepo(repoEnv);
  try {
    const params: Parameters<typeof octokit.repos.listCommits>[0] = {
      owner,
      repo,
      since: since.toISOString(),
      per_page: 100,
    };
    if (path) params.path = path;

    const { data } = await octokit.repos.listCommits(params);
    return data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      date: new Date(c.commit.committer?.date ?? c.commit.author?.date ?? ''),
      author: c.commit.author?.name ?? 'unknown',
      url: c.html_url,
    }));
  } catch (err: unknown) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

export async function getFileLastCommitDate(
  repoEnv: string,
  path: string,
): Promise<Date | null> {
  const { owner, repo } = parseRepo(repoEnv);
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      path,
      per_page: 1,
    });
    if (!data.length) return null;
    const raw = data[0].commit.committer?.date ?? data[0].commit.author?.date;
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/**
 * Creates (or updates) a file at the given path.
 * Retries once automatically if a 409/422 Conflict arises from a stale SHA —
 * fetches the fresh SHA and replays the write.
 */
export async function createFile(
  repoEnv: string,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const { owner, repo } = parseRepo(repoEnv);
  const encoded = Buffer.from(content, 'utf-8').toString('base64');

  // Fetch the current SHA (if file exists) so GitHub accepts the write
  const existing = await getFileContent(repoEnv, path);
  let sha = existing?.sha;

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encoded,
      ...(sha ? { sha } : {}),
    });
  } catch (err: unknown) {
    if (isConflict(err)) {
      // Stale SHA — re-fetch and retry once
      console.log(
        `[github] createFile conflict on "${path}" — SHA stale, re-fetching and retrying…`,
      );
      const fresh = await octokit.repos.getContent({ owner, repo, path });
      sha = (fresh.data as { sha: string }).sha;
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encoded,
        sha,
      });
      console.log(`[github] createFile self-healed for "${path}" (fresh SHA: ${sha})`);
    } else {
      throw err;
    }
  }
}

/**
 * Updates an existing file at the given path using the provided SHA.
 * Retries once automatically if a 409/422 Conflict arises from a stale SHA —
 * fetches the fresh SHA and replays the write.
 */
export async function updateFile(
  repoEnv: string,
  path: string,
  content: string,
  message: string,
  sha: string,
): Promise<void> {
  const { owner, repo } = parseRepo(repoEnv);
  const encoded = Buffer.from(content, 'utf-8').toString('base64');

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encoded,
      sha,
    });
  } catch (err: unknown) {
    if (isConflict(err)) {
      // Stale SHA — re-fetch and retry once
      console.log(
        `[github] updateFile conflict on "${path}" — SHA stale, re-fetching and retrying…`,
      );
      const current = await octokit.repos.getContent({ owner, repo, path });
      const freshSha = (current.data as { sha: string }).sha;
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encoded,
        sha: freshSha,
      });
      console.log(`[github] updateFile self-healed for "${path}" (fresh SHA: ${freshSha})`);
    } else {
      throw err;
    }
  }
}

export async function deleteFile(
  repoEnv: string,
  path: string,
  message: string,
  sha: string,
): Promise<void> {
  const { owner, repo } = parseRepo(repoEnv);
  await octokit.repos.deleteFile({ owner, repo, path, message, sha });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status: number }).status === 404
  );
}

/** 409 Conflict or 422 Unprocessable Entity both indicate a stale SHA. */
function isConflict(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('status' in err)) return false;
  const status = (err as { status: number }).status;
  return status === 409 || status === 422;
}
