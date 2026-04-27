import type { Meta, StoryObj } from "@storybook/react-vite"

    import { RadioGroup, RadioGroupItem } from "../../components/radio-group"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/RadioGroup",
      component: RadioGroup,
      tags: ["autodocs"]
    } satisfies Meta<typeof RadioGroup>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <RadioGroup defaultValue="team" className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="team" />
            Team
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="workspace" />
            Workspace
          </label>
        </RadioGroup>
      </StorySurface>
      ),
    }
