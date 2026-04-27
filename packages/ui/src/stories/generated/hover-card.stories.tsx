import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/hover-card"
import { StorySurface } from "../storybook-support"

const meta = {
  title: "Components/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <StorySurface>
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <a
            href="/"
            className="text-sm font-medium underline underline-offset-4"
          >
            Hover for team details
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="flex flex-col gap-2">
            <div className="font-medium">Design system maintainers</div>
            <p className="text-sm text-muted-foreground">
              The shared UI package is maintained by product design and frontend
              platform together.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </StorySurface>
  ),
}
