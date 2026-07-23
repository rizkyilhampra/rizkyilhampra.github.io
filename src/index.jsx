import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./assets/fonts/iosevka.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./style.css";
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { normalizePath } from "./routeMetadata";

const container = document.querySelector("#root");
const prerenderedRouteData = window.__PRERENDERED_ROUTE__;
const currentPath = normalizePath(window.location.pathname);
const isMatchingPrerender =
  prerenderedRouteData &&
  normalizePath(prerenderedRouteData.path) === currentPath;
const routeData = isMatchingPrerender ? prerenderedRouteData : undefined;
const app = (
  <React.StrictMode>
    <App
      initialPath={currentPath}
      routeData={routeData}
      prerender={Boolean(routeData)}
    />
  </React.StrictMode>
);

if (routeData) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
