import { defineConfig } from "@farmfe/core";
import farmPostcssPlugin from "@farmfe/js-plugin-postcss";

export default defineConfig({
  compilation: {
    input: {
      prerender: "./src/prerender-entry.jsx",
    },
    output: {
      path: "./dist-ssr",
      targetEnv: "node",
      format: "cjs",
    },
    presetEnv: false,
  },
  plugins: [
    farmPostcssPlugin(),
    [
      "@farmfe/plugin-react",
      {
        runtime: "automatic",
      },
    ],
  ],
});
