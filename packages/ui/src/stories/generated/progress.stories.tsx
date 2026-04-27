import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Progress } from "../../components/progress"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Progress",
      component: Progress,
      tags: ["autodocs"]
    } satisfies Meta<typeof Progress>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[24rem]">
        <Progress value={68} className="w-full" />
      </StorySurface>
      ),
    }
