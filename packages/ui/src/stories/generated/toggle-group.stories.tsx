import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ToggleGroup, ToggleGroupItem } from "../../components/toggle-group"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/ToggleGroup",
      component: ToggleGroup,
      tags: ["autodocs"]
    } satisfies Meta<typeof ToggleGroup>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <ToggleGroup type="single" defaultValue="preview">
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
          <ToggleGroupItem value="docs">Docs</ToggleGroupItem>
          <ToggleGroupItem value="tests">Tests</ToggleGroupItem>
        </ToggleGroup>
      </StorySurface>
      ),
    }
