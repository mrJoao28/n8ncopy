import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  if (nodes.length <= 1) return nodes;

  const nodeIds = new Set(nodes.map((node) => node.id));

  // Only use edges that belong to nodes in this workflow. This also prevents
  // malformed/cross-workflow connections from producing unexpected results.
  const edges: [string, string][] = connections
    .filter(
      (connection) =>
        nodeIds.has(connection.fromNodeId) && nodeIds.has(connection.toNodeId),
    )
    .map((connection) => [connection.fromNodeId, connection.toNodeId]);

  let sortedNodeIds: string[];

  try {
    sortedNodeIds = toposort(edges);
  } catch (error) {
    if (error instanceof Error && /cycle/i.test(error.message)) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  // `toposort` only returns nodes that participate in an edge. The previous
  // implementation added self-edges for isolated nodes, which makes a
  // perfectly valid isolated node look like a cycle to toposort.
  const sortedSet = new Set(sortedNodeIds);
  for (const node of nodes) {
    if (!sortedSet.has(node.id)) {
      sortedNodeIds.push(node.id);
    }
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return sortedNodeIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is Node => Boolean(node));
};
