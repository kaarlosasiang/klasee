import type { Meta, StoryObj } from "@storybook/react-vite"

    import { AspectRatio } from "../../components/aspect-ratio"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/AspectRatio",
      component: AspectRatio,
      tags: ["autodocs"]
    } satisfies Meta<typeof AspectRatio>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[26rem]">
        <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-xl border bg-muted">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary">
            <span className="text-sm font-medium text-muted-foreground">16:9 media slot</span>
          </div>
        </AspectRatio>
      </StorySurface>
      ),
    }
