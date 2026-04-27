import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Button } from "../../components/button"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Button",
      component: Button,
      tags: ["autodocs"]
    } satisfies Meta<typeof Button>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </StorySurface>
      ),
    }
