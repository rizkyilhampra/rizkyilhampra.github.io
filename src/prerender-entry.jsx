import { renderToString } from "react-dom/server";
import App from "./App";

export function renderRoute({ path, routeData }) {
  return renderToString(
    <App initialPath={path} routeData={routeData} prerender />
  );
}
