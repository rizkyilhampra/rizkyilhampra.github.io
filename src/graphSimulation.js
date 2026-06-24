// d3-force simulation setup for the canvas graph (GraphView.jsx), extracted so
// the component holds only the render/interaction loop. The force tuning differs
// between the per-note local graph (`isLocal`) and the full-garden global view.

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
import { idOf } from "./graphRender";

// (Re)apply the width/height-dependent centering forces. Shared by the initial
// build and the resize handler so the layout recenters when the canvas resizes.
//
// Isotropic center gravity (equal X and Y pull) is what makes the full garden a
// FILLED circle: every node is drawn to the centre equally while charge pushes
// them apart equally, so they pack into a round disc at any node count. (Quartz's
// forceRadial only fills for hundreds of nodes — with our ~20 it just rings them
// onto the rim, hence center gravity instead.) The local graph keeps a softer
// pull so its few labelled nodes stay spread.
export function applyViewportForces(simulation, { isLocal, width, height }) {
  return simulation
    .force("x", forceX(width / 2).strength(isLocal ? 0.05 : 0.06))
    .force("y", forceY(height / 2).strength(isLocal ? 0.05 : 0.06))
    .force("center", forceCenter(width / 2, height / 2));
}

// Build the force simulation for a graph view.
//
// The full-garden views (no focusId → !isLocal) mirror Quartz/Obsidian's global
// graph: gentle repulsion + short links + center gravity pull the nodes into a
// round, evenly-spread blob. The per-note graph (isLocal) instead spreads
// neighbors wide so its always-on labels don't collide.
//
// `radiusOf` and `nodeById` are supplied by the caller so collision matches the
// rendered node size and we don't rebuild the id map the component already has.
export function createGraphSimulation(
  nodes,
  links,
  { isLocal, width, height, radiusOf, nodeById }
) {
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
    );

  return applyViewportForces(simulation, { isLocal, width, height });
}
