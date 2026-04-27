import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Slider } from "../../components/slider"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Slider",
      component: Slider,
      tags: ["autodocs"]
    } satisfies Meta<typeof Slider>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[24rem]">
        <Slider defaultValue={[35]} max={100} step={5} className="w-full" />
      </StorySurface>
      ),
    }
