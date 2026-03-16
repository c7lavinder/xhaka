const GITHUB_TOKEN = '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';
const GITHUB_REPO = process.env.GITHUB_REPO || 'c7lavinder/xhaka';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

async function githubFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'xhaka-control-room',
    },
    next: { revalidate: 60 },
  });
}

export async function fetchFromGitHub(path: string): Promise<string> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
    const res = await githubFetch(url);
    if (!res.ok) return '';
    const data = await res.json() as { content?: string };
    if (data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return '';
  } catch {
    return '';
  }
}

export async function listGitHubDir(path: string): Promise<GitHubFile[]> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
    const res = await githubFetch(url);
    if (!res.ok) return [];
    const data = await res.json() as GitHubFile[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getFileCommitDate(path: string): Promise<string> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?path=${path}&per_page=1`;
    const res = await githubFetch(url);
    if (!res.ok) return new Date().toISOString();
    const data = await res.json() as GitHubCommit[];
    if (data.length > 0) {
      return data[0].commit.committer.date;
    }
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function getRecentCommits(count: number = 5): Promise<GitHubCommit[]> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=${count}&branch=${GITHUB_BRANCH}`;
    const res = await githubFetch(url);
    if (!res.ok) return [];
    const data = await res.json() as GitHubCommit[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getRepoStats() {
  try {
    const [commitsRes, treeRes] = await Promise.all([
      githubFetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`),
      githubFetch(`https://api.github.com/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`)
    ]);

    let lastCommit = null;
    let totalFiles = 0;

    if (commitsRes.ok) {
      const commits = await commitsRes.json() as GitHubCommit[];
      if (commits.length > 0) lastCommit = commits[0];
    }

    if (treeRes.ok) {
      const tree = await treeRes.json() as { tree: { type: string }[] };
      totalFiles = tree.tree?.filter(f => f.type === 'blob').length || 0;
    }

    return { lastCommit, totalFiles };
  } catch {
    return { lastCommit: null, totalFiles: 0 };
  }
}

export async function parseResultsTsv(content: string) {
  if (!content) return [];
  const lines = content.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
  return lines.map(line => {
    const parts = line.split('\t');
    return {
      timestamp: parts[0] || '',
      jobName: parts[1] || '',
      status: parts[2] || '',
      durationMs: parseInt(parts[3] || '0', 10),
      score: parts[4] || '',
      notes: parts[5] || '',
    };
  }).reverse();
}
