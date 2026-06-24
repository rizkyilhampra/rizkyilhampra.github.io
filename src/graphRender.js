// Pure, closure-free helpers for the canvas graph (GraphView.jsx): id/geometry
// math, node sizing, and theme/color resolution. Kept here so the component file
// holds only the stateful render/interaction loop.

import { isTagNode } from "./graphData";

// d3-force mutates link.source/target from id strings into node objects once the
// simulation starts; accept either form.
export function idOf(end) {
  return typeof end === "object" && end !== null ? end.id : end;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Node radius grows with connectivity (degree); the focus/current note is
// enlarged. `focusId` is the per-note graph's centre (null on the full garden).
export function nodeRadius(node, focusId) {
  const base = isTagNode(node) ? 3.2 : 4;
  const grow = Math.sqrt(node.degree ?? 0) * 1.6;
  return (node.focus || node.id === focusId ? 6 : base) + grow;
}

export function nodeFill(node, isActive, visited, theme) {
  if (node.focus || isActive) return hsl(theme.primary, 1);
  if (isTagNode(node)) return hsl(theme.primary, 0.45);
  // Visited notes read brighter than the muted unvisited ones (Quartz's cue).
  if (visited.has(node.id)) return hsl(theme.foreground, 0.85);
  return hsl(theme.mutedForeground, 0.85);
}

export function labelOf(node) {
  return isTagNode(node) ? `#${node.label}` : node.title ?? node.id;
}

// CSS custom properties hold bare HSL components ("152 38% 33%"); wrap them so
// canvas gets a valid color with optional alpha.
export function hsl(components, alpha = 1) {
  return `hsl(${components} / ${alpha})`;
}

export function readTheme(el) {
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
