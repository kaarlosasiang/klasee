import type { Preview } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import "../src/styles/globals.css"

function PreviewFrame({
  children,
  theme,
}: {
  children: ReactNode
  theme: "light" | "dark"
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={false}
      forcedTheme={theme}
    >
      <div className={theme === "dark" ? "dark" : undefined}>
        <div className="min-h-screen bg-background p-6 text-foreground">
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}

const preview: Preview = {
  parameters: {
    layout: "centered",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Components"],
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global preview theme",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <PreviewFrame theme={context.globals.theme}>
        <Story />
      </PreviewFrame>
    ),
  ],
}

export default preview
