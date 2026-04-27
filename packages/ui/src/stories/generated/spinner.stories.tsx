import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Spinner } from "../../components/spinner"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Spinner",
      component: Spinner,
      tags: ["autodocs"]
    } satisfies Meta<typeof Spinner>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Spinner />
      </StorySurface>
      ),
    }
