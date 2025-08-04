import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/iosevka/500.css";
import "@fontsource/iosevka/600.css";
import "./style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.querySelector("#root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
