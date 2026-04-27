import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Toaster } from "../../components/sonner"
    import { StorySurface } from "../storybook-support"
    import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Sonner",
      component: Toaster,
      tags: ["autodocs"]
    } satisfies Meta<typeof Toaster>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => toast.success("Storybook toast preview is live.")}>
            Trigger toast
          </Button>
          <Toaster richColors />
        </div>
      </StorySurface>
      ),
    }
