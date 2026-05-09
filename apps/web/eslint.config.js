import nextPlugin from "@next/eslint-plugin-next";
import baseConfig from "@workspace/eslint-config/next.js";

export default [
  {
    ignores: [".next", "dist", "node_modules"],
  },
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];
