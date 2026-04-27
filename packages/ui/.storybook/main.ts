import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

const require = createRequire(import.meta.url)
const storybookRoot = dirname(fileURLToPath(import.meta.url))

function packagePath(packageName: string) {
  return dirname(require.resolve(join(packageName, "package.json")))
}

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    packagePath("@storybook/addon-essentials"),
    packagePath("@storybook/addon-a11y"),
    packagePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: packagePath("@storybook/react-vite"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [
        tsconfigPaths({
          projects: [
            resolve(storybookRoot, "../tsconfig.json"),
            resolve(storybookRoot, "../../../tsconfig.json"),
          ],
        }),
      ],
    }),
}

export default config
