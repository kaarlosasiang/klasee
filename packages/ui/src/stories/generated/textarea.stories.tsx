import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Textarea } from "../../components/textarea"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Textarea",
      component: Textarea,
      tags: ["autodocs"]
    } satisfies Meta<typeof Textarea>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[26rem]">
        <Textarea defaultValue="Storybook stories make visual regressions easier to spot before they land in the app." />
      </StorySurface>
      ),
    }
