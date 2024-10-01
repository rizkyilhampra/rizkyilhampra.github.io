import { defineConfig } from '@farmfe/core';
import farmPostcssPlugin from '@farmfe/js-plugin-postcss';

export default defineConfig({
  compilation: {
    presetEnv: false
  },
  plugins: [farmPostcssPlugin()]
});
