import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/chart"
    import { StorySurface } from "../storybook-support"
    import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

    const meta = {
      title: "Components/Chart",
      component: ChartContainer,
      tags: ["autodocs"]
    } satisfies Meta<typeof ChartContainer>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[34rem]">
        <ChartContainer
          className="min-h-[16rem] w-full"
          config={{
            signups: {
              label: "Signups",
              color: "var(--color-primary)",
            },
          }}
        >
          <AreaChart
            accessibilityLayer
            data={[
              { day: "Mon", signups: 12 },
              { day: "Tue", signups: 18 },
              { day: "Wed", signups: 15 },
              { day: "Thu", signups: 22 },
              { day: "Fri", signups: 19 },
            ]}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="signups"
              fill="var(--color-signups)"
              fillOpacity={0.25}
              stroke="var(--color-signups)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </StorySurface>
      ),
    }
