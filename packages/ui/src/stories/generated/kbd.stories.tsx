import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Kbd, KbdGroup } from "../../components/kbd"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Kbd",
      component: Kbd,
      tags: ["autodocs"]
    } satisfies Meta<typeof Kbd>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="gap-2">
        <KbdGroup>
          <Kbd>Shift</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <Kbd>Esc</Kbd>
      </StorySurface>
      ),
    }
