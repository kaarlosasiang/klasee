import type { Meta, StoryObj } from "@storybook/react-vite"

import { Separator } from "../../components/separator"
import { StorySurface } from "../storybook-support"

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorySurface className="w-[22rem]">
      <div className="flex w-full flex-col gap-4">
        <div className="text-sm font-medium">Above the fold</div>
        <Separator />
        <div className="text-sm text-muted-foreground">Below the fold</div>
      </div>
    </StorySurface>
  ),
}
