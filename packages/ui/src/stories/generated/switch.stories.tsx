import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Switch } from "../../components/switch"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Switch",
      component: Switch,
      tags: ["autodocs"]
    } satisfies Meta<typeof Switch>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <div className="flex items-center gap-3">
          <Switch id="storybook-switch" defaultChecked />
          <label htmlFor="storybook-switch" className="text-sm font-medium">
            Enable review mode
          </label>
        </div>
      </StorySurface>
      ),
    }
