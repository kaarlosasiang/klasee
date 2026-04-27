import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Calendar } from "../../components/calendar"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Calendar",
      component: Calendar,
      tags: ["autodocs"]
    } satisfies Meta<typeof Calendar>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[22rem]">
        <Calendar mode="single" selected={new Date("2026-04-27")} className="rounded-xl border bg-background p-3" />
      </StorySurface>
      ),
    }
