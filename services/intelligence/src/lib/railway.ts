// ---------------------------------------------------------------------------
// Railway API client — pull deployment logs via GraphQL
// ---------------------------------------------------------------------------

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

interface RailwayDeployment {
  id: string;
  status: string;
  createdAt: string;
  url: string | null;
}

interface RailwayLog {
  timestamp: string;
  message: string;
  severity: string;
}

async function railwayQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) throw new Error('RAILWAY_API_TOKEN not set');

  const res = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Railway API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown[] };
  if (json.errors?.length) {
    throw new Error(`Railway GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Get recent failed deployments for a service
// ---------------------------------------------------------------------------

export async function getFailedDeployments(
  serviceId: string,
  since: Date,
): Promise<RailwayDeployment[]> {
  const query = `
    query GetDeployments($serviceId: String!, $limit: Int!) {
      deployments(input: { serviceId: $serviceId }, first: $limit) {
        edges {
          node {
            id
            status
            createdAt
            staticUrl
          }
        }
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      deployments: {
        edges: Array<{
          node: { id: string; status: string; createdAt: string; staticUrl: string | null };
        }>;
      };
    }>(query, { serviceId, limit: 20 });

    return data.deployments.edges
      .map((e) => ({
        id: e.node.id,
        status: e.node.status,
        createdAt: e.node.createdAt,
        url: e.node.staticUrl,
      }))
      .filter(
        (d) =>
          (d.status === 'FAILED' || d.status === 'CRASHED') &&
          new Date(d.createdAt) >= since,
      );
  } catch (err) {
    console.warn('[railway] Failed to fetch deployments:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Get logs for a specific deployment
// ---------------------------------------------------------------------------

export async function getDeploymentLogs(
  deploymentId: string,
): Promise<RailwayLog[]> {
  const query = `
    query GetDeploymentLogs($deploymentId: String!) {
      deploymentLogs(deploymentId: $deploymentId) {
        timestamp
        message
        severity
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      deploymentLogs: RailwayLog[];
    }>(query, { deploymentId });

    return data.deploymentLogs ?? [];
  } catch (err) {
    console.warn('[railway] Failed to fetch deployment logs:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Get a readable summary of recent failures
// ---------------------------------------------------------------------------

export async function getRecentFailureSummary(
  serviceId: string,
  since: Date,
): Promise<string> {
  const failed = await getFailedDeployments(serviceId, since);

  if (!failed.length) {
    return 'No failed deployments in the specified time range.';
  }

  const summaries: string[] = [];

  for (const deployment of failed.slice(0, 5)) {
    // Cap at 5 failures to avoid token explosion
    const logs = await getDeploymentLogs(deployment.id);
    const errorLogs = logs
      .filter(
        (l) =>
          l.severity === 'ERROR' ||
          l.message.toLowerCase().includes('error') ||
          l.message.toLowerCase().includes('failed'),
      )
      .slice(0, 20);

    const logText = errorLogs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');

    summaries.push(
      `Deployment ${deployment.id} (${deployment.status}) at ${deployment.createdAt}:\n${logText || 'No error logs captured.'}`,
    );
  }

  return summaries.join('\n\n---\n\n');
}
