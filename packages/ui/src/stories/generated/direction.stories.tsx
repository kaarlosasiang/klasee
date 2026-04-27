import type { Meta, StoryObj } from "@storybook/react-vite"

    import { DirectionProvider } from "../../components/direction"
    import { StoryGrid } from "../storybook-support"


    const meta = {
      title: "Components/Direction",
      component: DirectionProvider,
      tags: ["autodocs"]
    } satisfies Meta<typeof DirectionProvider>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StoryGrid className="max-w-3xl">
        <DirectionProvider dir="ltr">
          <div className="rounded-xl border p-4 text-sm">
            <div className="font-medium">Left to right</div>
            <p className="mt-2 text-muted-foreground">Controls and layout flow read the default direction.</p>
          </div>
        </DirectionProvider>
        <DirectionProvider dir="rtl">
          <div className="rounded-xl border p-4 text-right text-sm">
            <div className="font-medium">Right to left</div>
            <p className="mt-2 text-muted-foreground">This wrapper lets components opt into mirrored direction safely.</p>
          </div>
        </DirectionProvider>
      </StoryGrid>
      ),
    }
