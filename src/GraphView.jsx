import { useEffect, useRef } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { isTagNode } from "./graphData";

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

    const radiusOf = (node) => {
      const base = isTagNode(node) ? 3.2 : 4;
      const grow = Math.sqrt(node.degree ?? 0) * 1.6;
      return (node.focus || node.id === focusId ? 6 : base) + grow;
    };

    // The full-garden views (no focusId) mirror Quartz/Obsidian's global graph:
    // gentle repulsion + short links + a radial force pull the nodes into a
    // round, evenly-spread blob. The per-note graph (focusId) instead spreads
    // neighbors wide so its always-on labels don't collide, and skips the
    // radial force — a handful of nodes shouldn't be forced onto a ring.
    const isLocal = Boolean(focusId);

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          .distance((link) => {
            const isTag =
              isTagNode(nodeById.get(idOf(link.source))) ||
              isTagNode(nodeById.get(idOf(link.target)));
            if (isLocal) return isTag ? 110 : 95;
            return isTag ? 35 : 30;
          })
          .strength(0.4)
      )
      // Quartz uses -100*repelForce (=-50); the strong -160 we had blew the
      // garden apart. Keep the wider repulsion only for the small local graph.
      .force("charge", forceManyBody().strength(isLocal ? -160 : -90))
      .force(
        "collide",
        forceCollide()
          .radius((d) => radiusOf(d) + 4)
          .iterations(isLocal ? 1 : 3)
      )
      // Isotropic center gravity (equal X and Y pull) is what makes the full
      // garden a FILLED circle: every node is drawn to the centre equally while
      // charge pushes them apart equally, so they pack into a round disc at any
      // node count. (Quartz's forceRadial only fills for hundreds of nodes —
      // with our ~20 it just rings them onto the rim, hence center gravity
      // instead.) The local graph keeps a softer pull so its few labelled nodes
      // stay spread.
      .force("x", forceX(width / 2).strength(isLocal ? 0.05 : 0.06))
      .force("y", forceY(height / 2).strength(isLocal ? 0.05 : 0.06))
      .force("center", forceCenter(width / 2, height / 2));

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
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const active = hoverId ?? focusId;
      const activeSet = active
        ? new Set([active, ...(neighbors.get(active) ?? [])])
        : null;

      // edges
      ctx.lineWidth = 1 / transform.k;
      for (const link of links) {
        const s = nodeById.get(idOf(link.source));
        const t = nodeById.get(idOf(link.target));
        if (!s || !t) continue;
        const lit =
          activeSet && (idOf(link.source) === active || idOf(link.target) === active);
        ctx.strokeStyle = lit
          ? hsl(theme.primary, 0.7)
          : hsl(theme.border, activeSet ? 0.25 : 0.5);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      // nodes
      for (const node of nodes) {
        const r = radiusOf(node);
        const isActive = !activeSet || activeSet.has(node.id);
        const fill = nodeFill(node, node.id === active, theme);
        ctx.globalAlpha = isActive ? 1 : 0.35;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        // labels: focus + hovered cluster always; everyone once zoomed in.
        const showLabel =
          node.id === active ||
          (activeSet && activeSet.has(node.id)) ||
          transform.k > 1.6;
        if (showLabel) {
          ctx.globalAlpha = isActive ? 1 : 0.4;
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
      simulation.force("center", forceCenter(width / 2, height / 2));
      simulation.force("x", forceX(width / 2).strength(isLocal ? 0.05 : 0.06));
      simulation.force("y", forceY(height / 2).strength(isLocal ? 0.05 : 0.06));
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
        draw();
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

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
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
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      canvas.removeEventListener("wheel", onWheel);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [rawNodes, rawLinks, focusId, heightProp, onNavigate]);

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

function nodeFill(node, isActive, theme) {
  if (node.focus || isActive) return hsl(theme.primary, 1);
  if (isTagNode(node)) return hsl(theme.primary, 0.45);
  return hsl(theme.mutedForeground, 0.85);
}

function labelOf(node) {
  return isTagNode(node) ? `#${node.label}` : node.title ?? node.id;
}

function idOf(end) {
  return typeof end === "object" && end !== null ? end.id : end;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// CSS custom properties hold bare HSL components ("152 38% 33%"); wrap them so
// canvas gets a valid color with optional alpha.
function hsl(components, alpha = 1) {
  return `hsl(${components} / ${alpha})`;
}

function readTheme(el) {
  const style = getComputedStyle(el);
  const read = (name) => style.getPropertyValue(name).trim();
  return {
    background: read("--background"),
    foreground: read("--foreground"),
    primary: read("--primary"),
    mutedForeground: read("--muted-foreground"),
    border: read("--border"),
  };
}
