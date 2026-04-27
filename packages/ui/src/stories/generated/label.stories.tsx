import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Label } from "../../components/label"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Label",
      component: Label,
      tags: ["autodocs"]
    } satisfies Meta<typeof Label>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <div className="flex items-center gap-3">
          <Label htmlFor="label-demo">Project name</Label>
          <input id="label-demo" className="rounded-md border px-2 py-1 text-sm" defaultValue="UI package" />
        </div>
      </StorySurface>
      ),
    }
