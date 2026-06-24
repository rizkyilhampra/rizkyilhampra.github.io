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

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          .distance((link) =>
            isTagNode(nodeById.get(idOf(link.source))) ||
            isTagNode(nodeById.get(idOf(link.target)))
              ? 55
              : 42
          )
          .strength(0.4)
      )
      .force("charge", forceManyBody().strength(nodes.length > 60 ? -90 : -160))
      .force("collide", forceCollide().radius((d) => radiusOf(d) + 4))
      .force("x", forceX(width / 2).strength(0.05))
      .force("y", forceY(height / 2).strength(0.05))
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
      simulation.force("x", forceX(width / 2).strength(0.05));
      simulation.force("y", forceY(height / 2).strength(0.05));
      draw();
    };

    if (reduceMotion) {
      // Static layout: settle synchronously, then render once. No anim loop.
      simulation.stop();
      for (let i = 0; i < 250; i++) simulation.tick();
      resize();
    } else {
      simulation.on("tick", draw);
      resize();
    }

    // --- interaction --------------------------------------------------------
    let dragNode = null;
    let panning = null;
    let downAt = null;
    let moved = false;

    const findNode = (px, py) => {
      const { x, y } = toGraph(px, py);
      // generous radius so small nodes are tappable
      return simulation.find(x, y, 24 / transform.k) ?? null;
    };

    const onPointerMove = (event) => {
      const { px, py } = pointerPos(event);
      if (dragNode) {
        const { x, y } = toGraph(px, py);
        dragNode.fx = x;
        dragNode.fy = y;
        moved = true;
        if (reduceMotion) draw();
        return;
      }
      if (panning) {
        transform.x = panning.tx + (px - panning.px);
        transform.y = panning.ty + (py - panning.py);
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
      downAt = { px, py };
      moved = false;
      const hit = findNode(px, py);
      canvas.setPointerCapture?.(event.pointerId);
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

    const onPointerUp = (event) => {
      const { px, py } = pointerPos(event);
      const isClick =
        downAt &&
        !moved &&
        Math.hypot(px - downAt.px, py - downAt.py) < 5;

      if (dragNode) {
        const target = dragNode;
        if (!reduceMotion) simulation.alphaTarget(0);
        target.fx = null;
        target.fy = null;
        if (isClick) navigateTo(target);
        dragNode = null;
      }
      panning = null;
      downAt = null;
      canvas.style.cursor = "grab";
      canvas.releasePointerCapture?.(event.pointerId);
    };

    const onWheel = (event) => {
      event.preventDefault();
      const { px, py } = pointerPos(event);
      const factor = Math.exp(-event.deltaY * 0.001);
      const k = clamp(transform.k * factor, 0.3, 4);
      // keep the point under the cursor fixed
      transform.x = px - ((px - transform.x) * k) / transform.k;
      transform.y = py - ((py - transform.y) * k) / transform.k;
      transform.k = k;
      draw();
    };

    const navigateTo = (node) => {
      if (!onNavigate) return;
      if (isTagNode(node)) onNavigate(`/til/tags/${encodeURIComponent(node.label)}`);
      else onNavigate(`/til/${node.id}`);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
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
      canvas.removeEventListener("pointerup", onPointerUp);
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
