import type { Meta, StoryObj } from "@storybook/react-vite"

import { ScrollArea, ScrollBar } from "../../components/scroll-area"
import { StorySurface } from "../storybook-support"

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorySurface className="w-[24rem]">
      <ScrollArea className="h-40 w-full rounded-xl border">
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="rounded-lg border p-3 text-sm">
              Component state #{index + 1}
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
    </StorySurface>
  ),
}
