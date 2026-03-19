// services/intelligence/src/lib/railway-api.ts
// Railway GraphQL API wrapper — 5 operator functions

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DeploymentInfo {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'DEPLOYING' | 'BUILDING' | 'CRASHED' | 'REMOVED' | 'SLEEPING';
  canRollback: boolean;
  createdAt: string;
  url?: string;
}

export interface RailwayApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

// ─── GraphQL Queries (verbatim from spec) ───────────────────────────────────

const GET_LATEST_DEPLOYMENT_QUERY = `
  query GetLatestDeployment($serviceId: String!, $environmentId: String!) {
    deployments(
      first: 5
      input: {
        serviceId: $serviceId
        environmentId: $environmentId
      }
    ) {
      edges {
        node {
          id
          status
          canRollback
          createdAt
          staticUrl
        }
      }
    }
  }
`;

const GET_DEPLOYMENT_LOGS_QUERY = `
  query GetDeploymentLogs($deploymentId: String!, $limit: Int!) {
    deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
      message
      timestamp
      severity
    }
  }
`;

const RESTART_DEPLOYMENT_MUTATION = `
  mutation RestartDeployment($deploymentId: String!) {
    deploymentRestart(id: $deploymentId)
  }
`;

const REDEPLOY_SERVICE_MUTATION = `
  mutation RedeployService($serviceId: String!, $environmentId: String!) {
    serviceInstanceRedeploy(
      serviceId: $serviceId
      environmentId: $environmentId
    )
  }
`;

const ROLLBACK_DEPLOYMENT_MUTATION = `
  mutation RollbackDeployment($deploymentId: String!) {
    deploymentRollback(id: $deploymentId)
  }
`;

// ─── Core Request Helper ────────────────────────────────────────────────────

async function railwayRequest<T>(
  query: string,
  variables: Record<string, unknown>,
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

  const json = (await res.json()) as RailwayApiResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Railway API error: ${json.errors[0].message}`);
  }
  return json.data as T;
}

// ─── Exported Functions ─────────────────────────────────────────────────────

export async function getLatestDeployment(
  serviceId: string,
  environmentId: string,
): Promise<{ current: DeploymentInfo; prior: DeploymentInfo | null }> {
  const data = await railwayRequest<{
    deployments: {
      edges: Array<{
        node: {
          id: string;
          status: DeploymentInfo['status'];
          canRollback: boolean;
          createdAt: string;
          staticUrl?: string;
        };
      }>;
    };
  }>(GET_LATEST_DEPLOYMENT_QUERY, { serviceId, environmentId });

  const mapNode = (node: {
    id: string;
    status: DeploymentInfo['status'];
    canRollback: boolean;
    createdAt: string;
    staticUrl?: string;
  }): DeploymentInfo => ({
    id: node.id,
    status: node.status,
    canRollback: node.canRollback,
    createdAt: node.createdAt,
    url: node.staticUrl,
  });

  // Sort by createdAt descending — Railway may return deployments ordered by
  // updatedAt (status-change time), which causes superseded FAILED deployments
  // to appear before the active SUCCESS one. We always want the most recently
  // CREATED deployment as current, then find the first prior SUCCESS.
  const sorted = data.deployments.edges
    .slice()
    .sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime());

  const current = sorted[0] ? mapNode(sorted[0].node) : (null as unknown as DeploymentInfo);

  // prior = most recent non-current deployment that was active (SUCCESS/SLEEPING)
  // Used for rollback target — skip FAILED superseded deployments
  const priorNode = sorted.slice(1).find(
    (e) => e.node.status === 'SUCCESS' || e.node.status === 'SLEEPING',
  );
  const prior = priorNode ? mapNode(priorNode.node) : null;

  return { current, prior };
}

export async function getDeploymentLogs(
  deploymentId: string,
  limit = 50,
): Promise<string[]> {
  const data = await railwayRequest<{
    deploymentLogs: Array<{ message: string; timestamp: string; severity: string }>;
  }>(GET_DEPLOYMENT_LOGS_QUERY, { deploymentId, limit });

  return (data.deploymentLogs ?? []).map((l) => `[${l.severity}] ${l.message}`);
}

export async function restartDeployment(deploymentId: string): Promise<boolean> {
  try {
    await railwayRequest(RESTART_DEPLOYMENT_MUTATION, { deploymentId });
    return true;
  } catch (err) {
    console.error('[railway-api] restartDeployment failed:', (err as Error).message);
    return false;
  }
}

export async function redeployService(
  serviceId: string,
  environmentId: string,
): Promise<boolean> {
  try {
    await railwayRequest(REDEPLOY_SERVICE_MUTATION, { serviceId, environmentId });
    return true;
  } catch (err) {
    console.error('[railway-api] redeployService failed:', (err as Error).message);
    return false;
  }
}

export async function rollbackDeployment(deploymentId: string): Promise<boolean> {
  try {
    await railwayRequest(ROLLBACK_DEPLOYMENT_MUTATION, { deploymentId });
    return true;
  } catch (err) {
    console.error('[railway-api] rollbackDeployment failed:', (err as Error).message);
    return false;
  }
}
