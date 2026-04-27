import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../components/empty"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Empty",
      component: Empty,
      tags: ["autodocs"]
    } satisfies Meta<typeof Empty>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[28rem]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">+</EmptyMedia>
            <EmptyTitle>No story selected</EmptyTitle>
            <EmptyDescription>
              Choose a component from the sidebar to inspect it in isolation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            This pattern is handy for dashboards, inboxes, and filtered views with no results.
          </EmptyContent>
        </Empty>
      </StorySurface>
      ),
    }
