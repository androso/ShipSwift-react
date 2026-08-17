import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { SWSymbol } from "@/swpackage/swutil";
import "./swchart.css";

export type SWNetworkGraphNode = {
  id: string;
  title: string;
  subtitle?: string | null;
  group?: string;
  color?: string;
  level?: number;
  weight?: number;
};

export type SWNetworkGraphEdge = {
  from: string;
  to: string;
};

export type SWNetworkGraphProps = {
  nodes: SWNetworkGraphNode[];
  edges: SWNetworkGraphEdge[];
  background?: string;
  spinSpeed?: number;
  growDuration?: number;
  showsLegend?: boolean;
  showsCard?: boolean;
  onNodeSelected?: (node: SWNetworkGraphNode | null) => void;
};

type Vec3 = { x: number; y: number; z: number };
type Proj = { x: number; y: number; scale: number };

type ResolvedGraph = {
  nodes: NormalizedNode[];
  positions: Vec3[];
  edgeIndices: [number, number][];
  directPrerequisites: number[][];
  directUnlocks: number[][];
  groups: { name: string; color: string; count: number }[];
};

type NormalizedNode = {
  id: string;
  title: string;
  subtitle: string | null;
  group: string;
  color: string;
  level: number;
  weight: number;
};

class SWNetworkGraphCamera {
  rotY = 0.6;
  tilt = -0.32;
  zoom = 1.0;
  grow = 0.0;
  viewSize = { width: 0, height: 0 };
  dragging = false;
  dragMoved = false;
  lastDragLocation: { x: number; y: number } | null = null;
  dragOrigin: { x: number; y: number } | null = null;

  private start: number | null = null;
  private lastTick: number | null = null;
  private rotYTarget: number | null = null;
  private tiltTarget: number | null = null;
  private zoomTarget: number | null = null;
  private readonly fov = 1400;

  step(
    nowMs: number,
    spinSpeed: number,
    growDuration: number,
    idle: boolean,
    reduceMotion: boolean,
  ) {
    const started = this.start ?? nowMs;
    this.start = started;
    const last = this.lastTick ?? nowMs;
    const dt = Math.min(0.064, (nowMs - last) / 1000);
    this.lastTick = nowMs;

    this.grow = reduceMotion
      ? 1.02
      : Math.min(1.02, ((nowMs - started) / 1000 / Math.max(0.1, growDuration)) * 1.02);

    if (idle && !this.dragging && !reduceMotion) {
      this.rotY += spinSpeed * dt;
    }

    if (this.rotYTarget != null) {
      const k = 1 - Math.exp(-7 * dt);
      let delta = (this.rotYTarget - this.rotY) % (Math.PI * 2);
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      this.rotY += delta * k;
      if (this.tiltTarget != null) this.tilt += (this.tiltTarget - this.tilt) * k;
      if (this.zoomTarget != null) this.zoom += (this.zoomTarget - this.zoom) * k;
      if (Math.abs(delta) < 0.008) {
        this.rotYTarget = null;
        this.tiltTarget = null;
        this.zoomTarget = null;
      }
    }
  }

  focus(p: Vec3) {
    let best = 0;
    let bestZ = Number.POSITIVE_INFINITY;
    for (const candidate of [Math.atan2(-p.x, p.z), Math.atan2(-p.x, p.z) + Math.PI]) {
      const z2 = -p.x * Math.sin(candidate) + p.z * Math.cos(candidate);
      if (z2 < bestZ) {
        bestZ = z2;
        best = candidate;
      }
    }
    this.rotYTarget = best;
    this.tiltTarget = -0.18;
    this.zoomTarget = Math.max(this.zoom, 1.15);
  }

  clearFocus() {
    this.rotYTarget = null;
    this.tiltTarget = null;
    this.zoomTarget = null;
  }

  project(positions: Vec3[], size: { width: number; height: number }): Proj[] {
    const cy = Math.cos(this.rotY);
    const sy = Math.sin(this.rotY);
    const ct = Math.cos(this.tilt);
    const st = Math.sin(this.tilt);
    const centerX = size.width * 0.5;
    const centerY = size.height * 0.52;
    const scale = Math.min(size.width / 1500, size.height / 1780) * this.zoom;
    return positions.map((p) => {
      const x = p.x * cy + p.z * sy;
      const z = -p.x * sy + p.z * cy;
      const y2 = p.y * ct - z * st;
      const z2 = p.y * st + z * ct;
      const pf = this.fov / Math.max(this.fov * 0.08, this.fov + z2 * scale * 1.6);
      return {
        x: centerX + x * scale * pf,
        y: centerY - y2 * scale * pf,
        scale: pf,
      };
    });
  }

  dotRadius(weight: number, depthScale: number): number {
    return (2.3 + Math.sqrt(Math.max(0, weight)) * 7.5) * depthScale * Math.min(1.6, Math.max(0.9, this.zoom));
  }
}

function normalizeNode(node: SWNetworkGraphNode): NormalizedNode {
  return {
    id: node.id,
    title: node.title,
    subtitle: node.subtitle ?? null,
    group: node.group ?? "",
    color: node.color ?? "var(--sw-blue)",
    level: node.level ?? 0.5,
    weight: node.weight ?? 0.3,
  };
}

function stableHash(s: string): bigint {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  const bytes = new TextEncoder().encode(s);
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return hash;
}

function resolveGraph(
  inputNodes: SWNetworkGraphNode[],
  inputEdges: SWNetworkGraphEdge[],
): ResolvedGraph {
  const nodes = inputNodes.map(normalizeNode);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const worldHeight = 1600;
  const maxRadius = 620;
  const placementOrder = nodes
    .map((_, i) => i)
    .sort((a, b) => nodes[a].level - nodes[b].level);
  const rank = new Array<number>(nodes.length).fill(0);
  placementOrder.forEach((i, r) => {
    rank[i] = r;
  });
  const positions: Vec3[] = nodes.map((node, i) => {
    const hash = stableHash(node.id);
    const jitterA = Number(hash & 0xffffn) / 65535;
    const jitterB = Number((hash >> 16n) & 0xffffn) / 65535;
    const angle = goldenAngle * rank[i] + jitterA * 0.9;
    const radius = maxRadius * (0.3 + 0.7 * node.level) * (0.75 + 0.45 * jitterB);
    const y = (node.level - 0.5) * worldHeight + (jitterA - 0.5) * 70;
    return { x: radius * Math.cos(angle), y, z: radius * Math.sin(angle) };
  });

  const indexOf = new Map<string, number>();
  nodes.forEach((node, i) => indexOf.set(node.id, i));
  const edgeIndices: [number, number][] = [];
  const pre = nodes.map(() => [] as number[]);
  const next = nodes.map(() => [] as number[]);
  for (const edge of inputEdges) {
    const a = indexOf.get(edge.from);
    const b = indexOf.get(edge.to);
    if (a == null || b == null) continue;
    edgeIndices.push([a, b]);
    pre[a].push(b);
    next[b].push(a);
  }

  const seen = new Map<string, number>();
  const groups: { name: string; color: string; count: number }[] = [];
  for (const node of nodes) {
    if (!node.group) continue;
    const idx = seen.get(node.group);
    if (idx != null) {
      groups[idx].count += 1;
    } else {
      seen.set(node.group, groups.length);
      groups.push({ name: node.group, color: node.color, count: 1 });
    }
  }

  return {
    nodes,
    positions,
    edgeIndices,
    directPrerequisites: pre.map((list) =>
      [...list].sort((a, b) => nodes[a].level - nodes[b].level),
    ),
    directUnlocks: next.map((list) =>
      [...list].sort((a, b) => nodes[a].level - nodes[b].level),
    ),
    groups,
  };
}

function lineageOf(graph: ResolvedGraph, i: number): { nodes: Set<number>; edges: Set<number> } {
  const nodeSet = new Set<number>([i]);
  const edgeSet = new Set<number>();
  const queue = [i];
  while (queue.length > 0) {
    const u = queue.pop()!;
    graph.edgeIndices.forEach((edge, k) => {
      if (edge[0] !== u) return;
      edgeSet.add(k);
      if (!nodeSet.has(edge[1])) {
        nodeSet.add(edge[1]);
        queue.push(edge[1]);
      }
    });
  }
  return { nodes: nodeSet, edges: edgeSet };
}

function canvasColor(input: string): string {
  const match = input.match(/^var\((--[^)]+)\)$/);
  if (match && typeof document !== "undefined") {
    const value = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
    return value || input;
  }
  return input;
}

function withAlpha(color: string, alpha: number): string {
  const resolved = canvasColor(color);
  const hex = resolved.replace("#", "");
  if (hex.length === 6 && /^[0-9a-fA-F]+$/.test(hex)) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const rgb = resolved.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/,
  );
  if (rgb) {
    return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
  }
  return resolved;
}

function SWNetworkGraphView({
  nodes,
  edges,
  background = "rgb(10, 13, 23)",
  spinSpeed = 0.18,
  growDuration = 2.8,
  showsLegend = true,
  showsCard = true,
  onNodeSelected,
}: SWNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef(new SWNetworkGraphCamera());
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchBaseZoom = useRef<number | null>(null);
  const pinchBaseDist = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const lineageNodesRef = useRef(new Set<number>());
  const lineageEdgesRef = useRef(new Set<number>());
  const hiddenGroupsRef = useRef(new Set<string>());
  const onNodeSelectedRef = useRef(onNodeSelected);
  onNodeSelectedRef.current = onNodeSelected;

  const graph = useMemo(() => resolveGraph(nodes, edges), [nodes, edges]);
  const graphRef = useRef(graph);
  graphRef.current = graph;

  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [filterPresented, setFilterPresented] = useState(false);

  selectedRef.current = selected;
  hiddenGroupsRef.current = hiddenGroups;

  useEffect(() => {
    clearSelection(false);
  }, [nodes, edges]);

  function select(index: number, pushHistory: boolean) {
    setSelected((current) => {
      if (pushHistory && current != null && current !== index) {
        setHistory((h) => [...h, current]);
      }
      return index;
    });
    const result = lineageOf(graphRef.current, index);
    lineageNodesRef.current = result.nodes;
    lineageEdgesRef.current = result.edges;
    cameraRef.current.focus(graphRef.current.positions[index]);
    onNodeSelectedRef.current?.(graphRef.current.nodes[index]);
  }

  function clearSelection(notify = true) {
    if (selectedRef.current == null) return;
    setSelected(null);
    setHistory([]);
    lineageNodesRef.current = new Set();
    lineageEdgesRef.current = new Set();
    cameraRef.current.clearFocus();
    if (notify) onNodeSelectedRef.current?.(null);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const loop = (now: number) => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const camera = cameraRef.current;
      const resolved = graphRef.current;
      camera.viewSize = { width, height };
      camera.step(now, spinSpeed, growDuration, selectedRef.current == null, reduceQuery.matches);
      drawGraph(ctx, resolved, camera, {
        width,
        height,
        background,
        selected: selectedRef.current,
        lineageNodes: lineageNodesRef.current,
        lineageEdges: lineageEdgesRef.current,
        hiddenGroups: hiddenGroupsRef.current,
        reduceMotion: reduceQuery.matches,
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [background, spinSpeed, growDuration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const camera = cameraRef.current;
      const factor = event.deltaY > 0 ? 0.95 : 1.05;
      camera.zoom = Math.max(0.5, Math.min(4, camera.zoom * factor));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const pt = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    pointersRef.current.set(event.pointerId, pt);
    if (pointersRef.current.size === 1) {
      const camera = cameraRef.current;
      camera.lastDragLocation = pt;
      camera.dragOrigin = pt;
      camera.dragging = true;
      camera.dragMoved = false;
    } else if (pointersRef.current.size === 2) {
      pinchBaseZoom.current = cameraRef.current.zoom;
      pinchBaseDist.current = pointerDistance(pointersRef.current);
    }
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const pt = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    pointersRef.current.set(event.pointerId, pt);
    const camera = cameraRef.current;
    if (pointersRef.current.size >= 2) {
      const dist = pointerDistance(pointersRef.current);
      const baseZoom = pinchBaseZoom.current ?? camera.zoom;
      const baseDist = pinchBaseDist.current ?? dist;
      if (baseDist > 0) {
        camera.zoom = Math.max(0.5, Math.min(4, baseZoom * (dist / baseDist)));
      }
      return;
    }
    const last = camera.lastDragLocation ?? pt;
    const dx = pt.x - last.x;
    const dy = pt.y - last.y;
    camera.lastDragLocation = pt;
    camera.dragging = true;
    if (camera.dragOrigin) {
      const travel = Math.hypot(pt.x - camera.dragOrigin.x, pt.y - camera.dragOrigin.y);
      if (travel > 3) camera.dragMoved = true;
    }
    camera.rotY += dx * 0.0055;
    camera.tilt = Math.max(-1.1, Math.min(0.15, camera.tilt - dy * 0.003));
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const camera = cameraRef.current;
    const wasTap = pointersRef.current.size <= 1 && !camera.dragMoved;
    const pt = pointersRef.current.get(event.pointerId) ?? {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    };
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchBaseZoom.current = null;
      pinchBaseDist.current = null;
    }
    if (pointersRef.current.size === 0) {
      camera.lastDragLocation = null;
      camera.dragOrigin = null;
      camera.dragging = false;
      const moved = camera.dragMoved;
      camera.dragMoved = false;
      if (wasTap && !moved) {
        const hit = pick(pt, graphRef.current, camera, hiddenGroupsRef.current);
        if (hit != null) select(hit, true);
        else clearSelection();
      }
    }
  };

  const selectedNode = selected != null ? graph.nodes[selected] : null;
  const totalPrereqs = selected != null ? Math.max(0, lineageNodesRef.current.size - 1) : 0;

  return (
    <div className="sw-network-graph" ref={wrapRef} style={{ background }}>
      <canvas
        ref={canvasRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      />
      {showsLegend ? (
        <button
          type="button"
          className="sw-network-filter-btn"
          aria-label="Graph Filters"
          onClick={() => {
            clearSelection();
            setFilterPresented(true);
          }}
        >
          <SWSymbol
            name={
              hiddenGroups.size === 0
                ? "line.3.horizontal.decrease.circle"
                : "line.3.horizontal.decrease.circle"
            }
            color="#fff"
            size={20}
          />
        </button>
      ) : null}

      {filterPresented ? (
        <div className="sw-network-sheet">
          <div className="sw-network-sheet-header">
            <h3>Filter</h3>
            <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
              <button
                type="button"
                disabled={hiddenGroups.size === 0}
                onClick={() => setHiddenGroups(new Set())}
              >
                Select All
              </button>
              <button
                type="button"
                disabled={hiddenGroups.size === graph.groups.length}
                onClick={() => setHiddenGroups(new Set(graph.groups.map((g) => g.name)))}
              >
                Clear All
              </button>
              <button type="button" onClick={() => setFilterPresented(false)}>
                Done
              </button>
            </div>
          </div>
          <div className="sw-network-muted">Groups ({graph.groups.length})</div>
          {graph.groups.map((group) => {
            const isOff = hiddenGroups.has(group.name);
            return (
              <button
                key={group.name}
                type="button"
                className="sw-network-row"
                onClick={() => {
                  setHiddenGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.name)) next.delete(group.name);
                    else next.add(group.name);
                    return next;
                  });
                }}
              >
                <span className="sw-network-dot" style={{ background: canvasColor(group.color) }} />
                <span>{group.name}</span>
                <span className="sw-network-muted">{group.count}</span>
                <span style={{ marginLeft: "auto" }}>{isOff ? "○" : "●"}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {showsCard && selected != null && selectedNode ? (
        <div className="sw-network-sheet">
          <div className="sw-network-sheet-header">
            {history.length > 0 ? (
              <button
                type="button"
                aria-label="Back"
                onClick={() => {
                  const previous = history[history.length - 1];
                  setHistory((h) => h.slice(0, -1));
                  if (previous != null) select(previous, false);
                }}
              >
                <SWSymbol name="chevron.left" size={18} />
              </button>
            ) : (
              <span />
            )}
            <h3>{selectedNode.title}</h3>
            <button type="button" onClick={() => clearSelection()}>
              Done
            </button>
          </div>
          <div className="sw-network-row" style={{ pointerEvents: "none" }}>
            <span className="sw-network-dot" style={{ background: canvasColor(selectedNode.color) }} />
            <div>
              {cardSubtitle(selectedNode) ? (
                <div className="sw-network-muted">{cardSubtitle(selectedNode)}</div>
              ) : null}
              <div>
                {totalPrereqs === 1
                  ? "1 prerequisite in total"
                  : `${totalPrereqs} prerequisites in total`}
              </div>
            </div>
          </div>
          <CardRows
            title="Builds on"
            indices={graph.directPrerequisites[selected] ?? []}
            graph={graph}
            onPick={(index) => select(index, true)}
          />
          <CardRows
            title="Unlocks"
            indices={graph.directUnlocks[selected] ?? []}
            graph={graph}
            onPick={(index) => select(index, true)}
          />
        </div>
      ) : null}
    </div>
  );
}

function CardRows({
  title,
  indices,
  graph,
  onPick,
}: {
  title: string;
  indices: number[];
  graph: ResolvedGraph;
  onPick: (index: number) => void;
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="sw-network-muted">{title}</div>
      {indices.length === 0 ? (
        <div className="sw-network-muted">nothing yet</div>
      ) : (
        indices.map((j) => (
          <button key={j} type="button" className="sw-network-row" onClick={() => onPick(j)}>
            <span
              className="sw-network-dot"
              style={{ width: 8, height: 8, background: canvasColor(graph.nodes[j].color) }}
            />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {graph.nodes[j].title}
            </span>
            {graph.nodes[j].subtitle ? (
              <span className="sw-network-muted" style={{ marginLeft: "auto" }}>
                {graph.nodes[j].subtitle}
              </span>
            ) : null}
          </button>
        ))
      )}
    </div>
  );
}

function cardSubtitle(node: NormalizedNode): string | null {
  if (node.group && node.subtitle) return `${node.group} · ${node.subtitle}`;
  if (node.group) return node.group;
  if (node.subtitle) return node.subtitle;
  return null;
}

function pointerDistance(pointers: Map<number, { x: number; y: number }>): number {
  const pts = Array.from(pointers.values());
  if (pts.length < 2) return 0;
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

function pick(
  point: { x: number; y: number },
  graph: ResolvedGraph,
  camera: SWNetworkGraphCamera,
  hiddenGroups: Set<string>,
): number | null {
  const proj = camera.project(graph.positions, camera.viewSize);
  const grow = camera.grow;
  let best: number | null = null;
  let bestDist = 20 * 20;
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const node = graph.nodes[i];
    if (hiddenGroups.has(node.group) || node.level > grow) continue;
    const dx = proj[i].x - point.x;
    const dy = proj[i].y - point.y;
    const dist = dx * dx + dy * dy;
    const reach = Math.max(11, camera.dotRadius(node.weight, proj[i].scale) + 6);
    if (dist < reach * reach && dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function drawGraph(
  ctx: CanvasRenderingContext2D,
  graph: ResolvedGraph,
  camera: SWNetworkGraphCamera,
  opts: {
    width: number;
    height: number;
    background: string;
    selected: number | null;
    lineageNodes: Set<number>;
    lineageEdges: Set<number>;
    hiddenGroups: Set<string>;
    reduceMotion: boolean;
  },
) {
  ctx.clearRect(0, 0, opts.width, opts.height);
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, opts.width, opts.height);

  const proj = camera.project(graph.positions, { width: opts.width, height: opts.height });
  const grow = opts.reduceMotion ? 1.02 : camera.grow;
  const hasSelection = opts.lineageNodes.size > 0;

  const nodeVisible = (i: number) =>
    !opts.hiddenGroups.has(graph.nodes[i].group) && graph.nodes[i].level <= grow;

  for (let k = 0; k < graph.edgeIndices.length; k += 1) {
    const [a, b] = graph.edgeIndices[k];
    if (!nodeVisible(a) || !nodeVisible(b)) continue;
    ctx.beginPath();
    ctx.moveTo(proj[a].x, proj[a].y);
    ctx.lineTo(proj[b].x, proj[b].y);
    if (hasSelection && opts.lineageEdges.has(k)) {
      ctx.strokeStyle = withAlpha(graph.nodes[b].color, 0.75);
      ctx.lineWidth = 1.6;
    } else {
      const alpha = hasSelection ? 0.04 : 0.06;
      const depth = (proj[a].scale + proj[b].scale) / 2;
      ctx.strokeStyle = `rgba(150, 166, 204, ${alpha * depth})`;
      ctx.lineWidth = 1;
    }
    ctx.stroke();
  }

  const order = proj.map((_, i) => i).sort((a, b) => proj[a].scale - proj[b].scale);
  for (const i of order) {
    if (!nodeVisible(i)) continue;
    const node = graph.nodes[i];
    const inLineage = hasSelection ? opts.lineageNodes.has(i) : true;
    const isFocus = i === opts.selected;
    const dim = hasSelection && !inLineage ? 0.1 : 1;
    const p = proj[i];
    const radius = camera.dotRadius(node.weight, p.scale) * (isFocus ? 1.6 : 1);
    const alpha = dim * (0.55 + 0.45 * Math.min(1, p.scale * p.scale));

    ctx.save();
    if (isFocus || (hasSelection && inLineage)) {
      ctx.shadowColor = canvasColor(node.color);
      ctx.shadowBlur = isFocus ? 9 : 4.5;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(node.color, alpha);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(8, 10, 18, ${0.5 * dim})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isFocus) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }
}

const math = "rgb(89, 158, 255)";
const geometry = "rgb(184, 133, 255)";
const reading = "rgb(255, 158, 77)";
const science = "rgb(77, 209, 143)";

export const sampleNodes: SWNetworkGraphNode[] = [
  { id: "counting", title: "Counting", subtitle: "age 4", group: "Math", color: math, level: 0.02, weight: 0.9 },
  { id: "number-sense", title: "Number Sense", subtitle: "age 5", group: "Math", color: math, level: 0.1, weight: 0.7 },
  { id: "addition", title: "Addition", subtitle: "age 5", group: "Math", color: math, level: 0.18, weight: 0.6 },
  { id: "subtraction", title: "Subtraction", subtitle: "age 6", group: "Math", color: math, level: 0.24, weight: 0.5 },
  { id: "multiplication", title: "Multiplication", subtitle: "age 7", group: "Math", color: math, level: 0.38, weight: 0.6 },
  { id: "division", title: "Division", subtitle: "age 8", group: "Math", color: math, level: 0.46, weight: 0.5 },
  { id: "fractions", title: "Fractions", subtitle: "age 8", group: "Math", color: math, level: 0.55, weight: 0.7 },
  { id: "decimals", title: "Decimals", subtitle: "age 9", group: "Math", color: math, level: 0.64, weight: 0.4 },
  { id: "ratios", title: "Ratios", subtitle: "age 10", group: "Math", color: math, level: 0.74, weight: 0.4 },
  { id: "equations", title: "Simple Equations", subtitle: "age 11", group: "Math", color: math, level: 0.86, weight: 0.6 },
  { id: "algebra", title: "Algebra", subtitle: "age 12", group: "Math", color: math, level: 0.96, weight: 0.9 },
  { id: "shapes", title: "Basic Shapes", subtitle: "age 4", group: "Geometry", color: geometry, level: 0.05, weight: 0.6 },
  { id: "symmetry", title: "Symmetry", subtitle: "age 6", group: "Geometry", color: geometry, level: 0.28, weight: 0.4 },
  { id: "angles", title: "Angles", subtitle: "age 8", group: "Geometry", color: geometry, level: 0.5, weight: 0.5 },
  { id: "perimeter", title: "Perimeter & Area", subtitle: "age 9", group: "Geometry", color: geometry, level: 0.62, weight: 0.5 },
  { id: "volume", title: "Volume", subtitle: "age 10", group: "Geometry", color: geometry, level: 0.76, weight: 0.4 },
  { id: "coordinates", title: "Coordinates", subtitle: "age 11", group: "Geometry", color: geometry, level: 0.88, weight: 0.5 },
  { id: "phonics", title: "Phonics", subtitle: "age 4", group: "Reading", color: reading, level: 0.03, weight: 0.9 },
  { id: "sight-words", title: "Sight Words", subtitle: "age 5", group: "Reading", color: reading, level: 0.12, weight: 0.5 },
  { id: "fluency", title: "Reading Fluency", subtitle: "age 6", group: "Reading", color: reading, level: 0.3, weight: 0.6 },
  { id: "comprehension", title: "Comprehension", subtitle: "age 7", group: "Reading", color: reading, level: 0.44, weight: 0.7 },
  { id: "summarizing", title: "Summarizing", subtitle: "age 9", group: "Reading", color: reading, level: 0.6, weight: 0.4 },
  { id: "essays", title: "Essay Writing", subtitle: "age 11", group: "Reading", color: reading, level: 0.84, weight: 0.6 },
  { id: "observation", title: "Observation", subtitle: "age 4", group: "Science", color: science, level: 0.06, weight: 0.5 },
  { id: "measurement", title: "Measurement", subtitle: "age 6", group: "Science", color: science, level: 0.26, weight: 0.5 },
  { id: "states-matter", title: "States of Matter", subtitle: "age 8", group: "Science", color: science, level: 0.48, weight: 0.4 },
  { id: "food-chains", title: "Food Chains", subtitle: "age 9", group: "Science", color: science, level: 0.58, weight: 0.4 },
  { id: "experiments", title: "Fair Experiments", subtitle: "age 10", group: "Science", color: science, level: 0.72, weight: 0.6 },
  { id: "forces", title: "Forces & Motion", subtitle: "age 11", group: "Science", color: science, level: 0.9, weight: 0.5 },
];

export const sampleEdges: SWNetworkGraphEdge[] = [
  { from: "number-sense", to: "counting" },
  { from: "addition", to: "number-sense" },
  { from: "subtraction", to: "addition" },
  { from: "multiplication", to: "addition" },
  { from: "division", to: "multiplication" },
  { from: "division", to: "subtraction" },
  { from: "fractions", to: "division" },
  { from: "decimals", to: "fractions" },
  { from: "ratios", to: "fractions" },
  { from: "ratios", to: "decimals" },
  { from: "equations", to: "ratios" },
  { from: "equations", to: "multiplication" },
  { from: "algebra", to: "equations" },
  { from: "algebra", to: "coordinates" },
  { from: "symmetry", to: "shapes" },
  { from: "angles", to: "symmetry" },
  { from: "perimeter", to: "angles" },
  { from: "perimeter", to: "multiplication" },
  { from: "volume", to: "perimeter" },
  { from: "coordinates", to: "angles" },
  { from: "coordinates", to: "number-sense" },
  { from: "sight-words", to: "phonics" },
  { from: "fluency", to: "sight-words" },
  { from: "comprehension", to: "fluency" },
  { from: "summarizing", to: "comprehension" },
  { from: "essays", to: "summarizing" },
  { from: "measurement", to: "observation" },
  { from: "measurement", to: "number-sense" },
  { from: "states-matter", to: "measurement" },
  { from: "food-chains", to: "observation" },
  { from: "experiments", to: "measurement" },
  { from: "experiments", to: "states-matter" },
  { from: "forces", to: "experiments" },
  { from: "forces", to: "angles" },
];

export const SWNetworkGraph = Object.assign(SWNetworkGraphView, {
  sampleNodes,
  sampleEdges,
});
