import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Badge } from "../../components/badge"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Badge",
      component: Badge,
      tags: ["autodocs"]
    } satisfies Meta<typeof Badge>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </StorySurface>
      ),
    }
