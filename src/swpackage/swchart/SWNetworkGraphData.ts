import { DOMAIN_COLORS, EDGE_TABLE, NODE_TABLE } from "./marbleTables";
import type { SWNetworkGraphEdge, SWNetworkGraphNode } from "./SWNetworkGraph";

type ParsedTopic = {
  id: string;
  name: string;
  subject: string;
  domain: string;
  ageStart: number;
  ageEnd: number;
  centrality: number;
};

function parseNodes(): SWNetworkGraphNode[] {
  const rows = NODE_TABLE.split("\n");
  const parsed: ParsedTopic[] = [];
  const mids: number[] = [];
  for (const row of rows) {
    if (!row) continue;
    const fields = row.split("|");
    if (fields.length !== 7) continue;
    const ageStart = Number.parseInt(fields[4], 10);
    const ageEnd = Number.parseInt(fields[5], 10);
    const centrality = Number.parseFloat(fields[6]);
    if (!Number.isFinite(ageStart) || !Number.isFinite(ageEnd) || !Number.isFinite(centrality)) {
      continue;
    }
    parsed.push({
      id: fields[0],
      name: fields[1],
      subject: fields[2],
      domain: fields[3],
      ageStart,
      ageEnd,
      centrality,
    });
    mids.push((ageStart + ageEnd) / 2);
  }
  const minMid = mids.length > 0 ? Math.min(...mids) : 0;
  const maxMid = mids.length > 0 ? Math.max(...mids) : 1;
  const span = Math.max(0.001, maxMid - minMid);
  return parsed.map((topic, i) => ({
    id: topic.id,
    title: topic.name,
    subtitle: `age ${topic.ageStart}\u2013${topic.ageEnd}`,
    group: topic.subject,
    color: DOMAIN_COLORS[topic.domain] ?? "#8A8F98",
    level: (mids[i] - minMid) / span,
    weight: topic.centrality,
  }));
}

function parseEdges(): SWNetworkGraphEdge[] {
  const edges: SWNetworkGraphEdge[] = [];
  for (const row of EDGE_TABLE.split("\n")) {
    if (!row) continue;
    const fields = row.split(">");
    if (fields.length !== 2) continue;
    edges.push({ from: fields[0], to: fields[1] });
  }
  return edges;
}

let cachedNodes: SWNetworkGraphNode[] | undefined;
let cachedEdges: SWNetworkGraphEdge[] | undefined;

export const SWNetworkGraphData = {
  get nodes(): SWNetworkGraphNode[] {
    cachedNodes ??= parseNodes();
    return cachedNodes;
  },
  get edges(): SWNetworkGraphEdge[] {
    cachedEdges ??= parseEdges();
    return cachedEdges;
  },
};
