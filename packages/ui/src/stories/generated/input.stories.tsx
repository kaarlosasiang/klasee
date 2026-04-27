import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Input } from "../../components/input"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Input",
      component: Input,
      tags: ["autodocs"]
    } satisfies Meta<typeof Input>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[22rem]">
        <Input placeholder="Search components" />
      </StorySurface>
      ),
    }
