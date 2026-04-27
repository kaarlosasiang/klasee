import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "../../components/skeleton"
import { StorySurface } from "../storybook-support"

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorySurface className="w-[26rem]">
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </StorySurface>
  ),
}
