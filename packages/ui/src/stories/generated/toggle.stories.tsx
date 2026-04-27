import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Toggle } from "../../components/toggle"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Toggle",
      component: Toggle,
      tags: ["autodocs"]
    } satisfies Meta<typeof Toggle>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Toggle defaultPressed>Bold</Toggle>
      </StorySurface>
      ),
    }
