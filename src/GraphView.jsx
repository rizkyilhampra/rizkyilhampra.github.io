import { useEffect, useMemo, useRef } from "react";
import { isTagNode } from "./graphData";
import { getVisited } from "./visited";
import { createGraphSimulation, applyViewportForces } from "./graphSimulation";
import {
  clamp,
  hsl,
  idOf,
  labelOf,
  nodeFill,
  nodeRadius,
  readTheme,
} from "./graphRender";

// Self-contained force-directed graph rendered on a 2D canvas. Reverse-engineered
// from Quartz's graph view but without pixi.js/WebGL — the garden is small enough
// for Canvas. d3-force runs the simulation; pan/zoom/drag/hover are hand-rolled on
// pointer events so we only depend on the one package.
//
// Props:
//   nodes, links  — from buildGraph()/localGraph() in graphData.js
//   focusId       — node id to emphasize (the current note on a local graph)
//   onNavigate    — SPA navigator; note nodes -> /til/<slug>, tags -> /til/tags/<tag>
//   height        — fixed canvas height in px; omit to fill the wrapper's height
//                   (let CSS/`className` size it) — width is always responsive
//   className     — wrapper classes
export function GraphView({
  nodes: rawNodes,
  links: rawLinks,
  focusId = null,
  onNavigate,
  height: heightProp = null,
  className = "",
}) {
  // Slugs the reader has already opened — visited note nodes render brighter.
  // Read once per mount; new visits show on the next navigation's fresh graph.
  const visited = useMemo(() => getVisited(), []);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");

    // Clone so d3's in-place mutation never touches the caller's data.
    const nodes = rawNodes.map((node) => ({ ...node }));
    const links = rawLinks.map((link) => ({
      source: idOf(link.source),
      target: idOf(link.target),
    }));
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    // Adjacency for hover highlighting (resolved to ids).
    const neighbors = new Map(nodes.map((node) => [node.id, new Set()]));
    for (const link of links) {
      neighbors.get(link.source)?.add(link.target);
      neighbors.get(link.target)?.add(link.source);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = container.clientWidth || 320;
    // Fixed height when given; otherwise track the wrapper so a fluid-height
    // container (e.g. a vh-sized modal panel) drives the canvas — no caller
    // needs to measure and feed a pixel number back in.
    let height = heightProp ?? container.clientHeight ?? 260;
    const transform = { x: 0, y: 0, k: 1 };
    let hoverId = null;
    let theme = readTheme(container);

    // Eased highlight factor for the hover dim/undim (A): 0 = resting (everything
    // full opacity), 1 = a node is focused (non-neighbors dimmed). `activeId` is
    // the highlighted node; it's retained while the dim animates *out* so the
    // fade-back is smooth instead of snapping when the pointer leaves. A
    // standalone ticker animates `highlight` toward `highlightTarget` so a settled
    // graph — where the d3 simulation has stopped ticking draw() — still fades.
    let activeId = focusId;
    let highlight = focusId ? 1 : 0;
    let highlightTarget = highlight;
    let highlightRaf = null;
    // Snap to a final value and redraw, releasing the retained node back to the
    // focus once the dim has fully eased out. Shared by the RAF settle and the
    // reduce-motion snap so the "release" rule lives in one place.
    const settleHighlight = (value) => {
      highlight = value;
      if (value === 0) activeId = focusId; // release retained node
      draw();
    };
    const stepHighlight = () => {
      highlightRaf = null;
      const delta = highlightTarget - highlight;
      if (Math.abs(delta) < 0.01) {
        settleHighlight(highlightTarget);
        return;
      }
      highlight += delta * 0.2;
      draw();
      highlightRaf = requestAnimationFrame(stepHighlight);
    };
    const setHighlight = (target) => {
      highlightTarget = target;
      if (reduceMotion) {
        settleHighlight(target);
        return;
      }
      if (highlightRaf == null) highlightRaf = requestAnimationFrame(stepHighlight);
    };
    // Point the highlight at a node (or back to the focus/resting state).
    const setActive = (id) => {
      const next = id ?? focusId;
      if (next != null) {
        activeId = next;
        setHighlight(1);
      } else {
        setHighlight(0); // keep activeId until the fade-out settles
      }
    };

    const radiusOf = (node) => nodeRadius(node, focusId);

    // Per-note graphs (focusId) get the wide-spread local tuning; the full garden
    // gets the packed-disc global tuning. See graphSimulation.js for the forces.
    const isLocal = Boolean(focusId);
    const simulation = createGraphSimulation(nodes, links, {
      isLocal,
      width,
      height,
      radiusOf,
      nodeById,
    });

    // --- coordinate helpers -------------------------------------------------
    const toGraph = (px, py) => ({
      x: (px - transform.x) / transform.k,
      y: (py - transform.y) / transform.k,
    });
    const pointerPos = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { px: event.clientX - rect.left, py: event.clientY - rect.top };
    };
    // Scale to k while keeping graph point (gx, gy) pinned under screen point
    // (sx, sy). Shared by wheel zoom and pinch zoom.
    const zoomAround = (sx, sy, gx, gy, k) => {
      transform.k = k;
      transform.x = sx - gx * k;
      transform.y = sy - gy * k;
    };

    // --- rendering ----------------------------------------------------------
    // The active node's neighbor set only changes when `activeId` does, but the
    // fade ticker redraws every frame — cache it so we don't rebuild an
    // identical Set on each of those frames.
    let activeSetId;
    let activeSetCache = null;
    const activeSetFor = (id) => {
      if (id !== activeSetId) {
        activeSetId = id;
        activeSetCache = id ? new Set([id, ...(neighbors.get(id) ?? [])]) : null;
      }
      return activeSetCache;
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const active = activeId;
      const activeSet = activeSetFor(active);
      // How strongly to dim/lift right now — `highlight` eases this 0↔1 so the
      // hover focus fades rather than snapping (A). At 0 nothing is dimmed.
      const dimAlpha = 1 - 0.65 * highlight; // non-neighbor node opacity: 1 → 0.35
      // Labels for non-focused nodes fade in gradually as you zoom in (B),
      // replacing the old hard k>1.6 cutoff (Quartz uses max((scale-1)/3.75, 0)).
      const zoomLabelAlpha = clamp(transform.k - 1.2, 0, 1);

      // edges
      ctx.lineWidth = 1 / transform.k;
      for (const link of links) {
        const s = nodeById.get(idOf(link.source));
        const t = nodeById.get(idOf(link.target));
        if (!s || !t) continue;
        const lit =
          activeSet && (idOf(link.source) === active || idOf(link.target) === active);
        ctx.strokeStyle = lit
          ? hsl(theme.primary, 0.5 + 0.2 * highlight)
          : hsl(theme.border, 0.5 - 0.25 * highlight);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      // nodes
      for (const node of nodes) {
        const r = radiusOf(node);
        const inCluster = !activeSet || activeSet.has(node.id);
        const fill = nodeFill(node, node.id === active, visited, theme);
        ctx.globalAlpha = inCluster ? 1 : dimAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        // labels: focus + hovered cluster always full; everyone else fades in
        // with zoom. Take the stronger of the two so a hovered node stays lit.
        const clusterLabel = activeSet && activeSet.has(node.id) ? 1 : 0;
        const labelAlpha = Math.max(clusterLabel, zoomLabelAlpha * (inCluster ? 1 : dimAlpha));
        if (labelAlpha > 0.02) {
          ctx.globalAlpha = labelAlpha;
          ctx.fillStyle = hsl(theme.foreground, 0.9);
          ctx.font = `${10 / transform.k + 1}px ui-sans-serif, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(labelOf(node), node.x, node.y + r + 2);
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    // Until the viewer interacts, we auto-frame the layout so every node stays
    // on screen — small containers (the homepage preview) otherwise show a
    // cluster that spread well past the canvas, looking "zoomed in".
    let userInteracted = false;

    // Frame all nodes into the viewport with padding. The force layout keeps
    // the centroid centered but never constrains the spread, so without this a
    // tight container clips most of the graph.
    const fitView = () => {
      if (!nodes.length) return;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const node of nodes) {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) continue;
        const r = radiusOf(node);
        minX = Math.min(minX, node.x - r);
        maxX = Math.max(maxX, node.x + r);
        minY = Math.min(minY, node.y - r);
        maxY = Math.max(maxY, node.y + r);
      }
      if (!Number.isFinite(minX)) return;
      const pad = 24;
      const gw = Math.max(maxX - minX, 1);
      const gh = Math.max(maxY - minY, 1);
      // Zoom that makes the cluster exactly fill the viewport (minus padding).
      const fitK = Math.min((width - pad * 2) / gw, (height - pad * 2) / gh);

      // Per-note graphs (focusId set) use a FIXED zoom so every note renders at
      // the same scale — fit-to-bounds would couple the zoom to each note's
      // neighbor count and layout shape, making the graph look more/less
      // zoomed-in from note to note. The force layout already uses fixed link
      // distances, so a constant zoom is visually consistent across notes; we
      // only fall back to fitK (zoom out) if a rare large neighborhood would
      // otherwise overflow. The full-garden views (no focusId) genuinely vary
      // in size, so they keep fit-to-bounds with a slight margin.
      const FOCUS_ZOOM = 1;
      const k = clamp(
        focusId ? Math.min(FOCUS_ZOOM, fitK) : fitK * 0.85,
        0.2,
        2
      );
      transform.k = k;
      transform.x = width / 2 - ((minX + maxX) / 2) * k;
      transform.y = height / 2 - ((minY + maxY) / 2) * k;
    };

    // Keep the bitmap matched to CSS size * DPR for crisp lines.
    const resize = () => {
      width = container.clientWidth || width;
      if (heightProp == null) height = container.clientHeight || height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      applyViewportForces(simulation, { isLocal, width, height });
      if (!userInteracted) fitView();
      draw();
    };

    if (reduceMotion) {
      // Static layout: settle synchronously, then render once. No anim loop.
      simulation.stop();
      for (let i = 0; i < 250; i++) simulation.tick();
      resize();
    } else {
      // Warm up off-screen so we have real positions to frame (resize() fits
      // them), then continue a gentle animated settle. The warm-up means the
      // initial fit is already close, so we only re-frame once on settle rather
      // than rescanning bounds every tick.
      simulation.stop();
      for (let i = 0; i < 80; i++) simulation.tick();
      simulation.on("tick", draw);
      simulation.on("end", () => {
        if (!userInteracted) {
          fitView();
          draw();
        }
      });
      resize();
      simulation.alpha(0.3).restart();
    }

    // --- interaction --------------------------------------------------------
    let dragNode = null;
    let panning = null;
    let downAt = null;
    let moved = false;
    // Active pointers for multitouch pinch-zoom (mobile). One pointer pans or
    // drags; two pointers pinch to zoom around their midpoint.
    const pointers = new Map();
    let pinch = null;

    // From here on the user drives the view, so auto-framing stops.
    const markUserControlled = () => {
      userInteracted = true;
    };

    // Distance + midpoint of the two active pointers (the pinch geometry).
    const pinchGeom = () => {
      const it = pointers.values();
      const a = it.next().value;
      const b = it.next().value;
      return {
        dist: Math.hypot(a.px - b.px, a.py - b.py) || 1,
        mx: (a.px + b.px) / 2,
        my: (a.py + b.py) / 2,
      };
    };

    const findNode = (px, py) => {
      const { x, y } = toGraph(px, py);
      // generous radius so small nodes are tappable
      return simulation.find(x, y, 24 / transform.k) ?? null;
    };

    // Build a pinch session: record the start distance and the graph point
    // under the midpoint so we can keep it anchored while scaling.
    const beginPinch = () => {
      const { dist, mx, my } = pinchGeom();
      const { x: gx, y: gy } = toGraph(mx, my);
      pinch = { dist, k: transform.k, gx, gy };
      // A pinch supersedes any pan/drag that a single finger started.
      panning = null;
      if (dragNode) {
        if (!reduceMotion) simulation.alphaTarget(0);
        dragNode.fx = null;
        dragNode.fy = null;
        dragNode = null;
      }
    };

    const onPointerMove = (event) => {
      const { px, py } = pointerPos(event);
      if (pointers.has(event.pointerId)) {
        pointers.set(event.pointerId, { px, py });
      }

      // Two fingers down → pinch zoom around the live midpoint.
      if (pinch && pointers.size >= 2) {
        const { dist, mx, my } = pinchGeom();
        const k = clamp((pinch.k * dist) / pinch.dist, 0.3, 4);
        zoomAround(mx, my, pinch.gx, pinch.gy, k);
        markUserControlled();
        moved = true;
        draw();
        return;
      }

      if (dragNode) {
        const { x, y } = toGraph(px, py);
        dragNode.fx = x;
        dragNode.fy = y;
        moved = true;
        // Manipulating a node counts as interaction; otherwise the settle-time
        // auto-fit would rescale the whole view under the dragging finger.
        markUserControlled();
        if (reduceMotion) draw();
        return;
      }
      if (panning) {
        transform.x = panning.tx + (px - panning.px);
        transform.y = panning.ty + (py - panning.py);
        markUserControlled();
        moved = true;
        draw();
        return;
      }
      const hit = findNode(px, py);
      const nextHover = hit?.id ?? null;
      canvas.style.cursor = hit ? "pointer" : "grab";
      if (nextHover !== hoverId) {
        hoverId = nextHover;
        setActive(nextHover); // eased dim/undim drives the redraw
      }
    };

    const onPointerDown = (event) => {
      const { px, py } = pointerPos(event);
      pointers.set(event.pointerId, { px, py });
      canvas.setPointerCapture?.(event.pointerId);

      // Second finger down → switch to a pinch and abandon pan/drag.
      if (pointers.size === 2) {
        beginPinch();
        return;
      }
      if (pointers.size > 2) return;

      downAt = { px, py };
      moved = false;
      const hit = findNode(px, py);
      if (hit) {
        dragNode = hit;
        if (!reduceMotion) simulation.alphaTarget(0.2).restart();
        const { x, y } = toGraph(px, py);
        dragNode.fx = x;
        dragNode.fy = y;
      } else {
        panning = { px, py, tx: transform.x, ty: transform.y };
        canvas.style.cursor = "grabbing";
      }
    };

    const endPointer = (event) => {
      const { px, py } = pointerPos(event);
      pointers.delete(event.pointerId);
      canvas.releasePointerCapture?.(event.pointerId);

      // Decide what this release meant — end a pinch, or finish a drag/click.
      // A remaining finger after a pinch stays inert until re-pressed rather
      // than jumping the view into a pan.
      if (pinch) {
        if (pointers.size < 2) pinch = null;
      } else if (dragNode) {
        const isClick =
          downAt && !moved && Math.hypot(px - downAt.px, py - downAt.py) < 5;
        if (!reduceMotion) simulation.alphaTarget(0);
        dragNode.fx = null;
        dragNode.fy = null;
        if (isClick) navigateTo(dragNode);
        dragNode = null;
      }

      // Shared teardown of transient pointer state.
      panning = null;
      downAt = null;
      canvas.style.cursor = "grab";
    };

    const onWheel = (event) => {
      event.preventDefault();
      const { px, py } = pointerPos(event);
      const { x: gx, y: gy } = toGraph(px, py);
      const k = clamp(transform.k * Math.exp(-event.deltaY * 0.001), 0.3, 4);
      zoomAround(px, py, gx, gy, k); // keep the point under the cursor fixed
      markUserControlled();
      draw();
    };

    const navigateTo = (node) => {
      if (!onNavigate) return;
      if (isTagNode(node)) onNavigate(`/til/tags/${encodeURIComponent(node.label)}`);
      else onNavigate(`/til/${node.id}`);
    };

    // Cursor left the canvas while hovering — release the highlight so the dim
    // fades back out instead of staying stuck on the last node.
    const onPointerLeave = () => {
      if (hoverId !== null) {
        hoverId = null;
        setActive(null);
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Track light/dark toggle (App flips the `dark` class on <html>).
    const themeObserver = new MutationObserver(() => {
      theme = readTheme(container);
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      simulation.stop();
      if (highlightRaf != null) cancelAnimationFrame(highlightRaf);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [rawNodes, rawLinks, focusId, heightProp, onNavigate, visited]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={heightProp == null ? undefined : { height: heightProp }}
    >
      <canvas ref={canvasRef} className="block touch-none select-none" />
    </div>
  );
}
