import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Checkbox } from "../../components/checkbox"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Checkbox",
      component: Checkbox,
      tags: ["autodocs"]
    } satisfies Meta<typeof Checkbox>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <div className="flex items-center gap-3">
          <Checkbox id="storybook-checkbox" defaultChecked />
          <label htmlFor="storybook-checkbox" className="text-sm font-medium">
            Include component stories in the review checklist
          </label>
        </div>
      </StorySurface>
      ),
    }
