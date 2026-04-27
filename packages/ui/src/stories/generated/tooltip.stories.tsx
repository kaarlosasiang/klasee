import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/tooltip"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Tooltip",
      component: Tooltip,
      tags: ["autodocs"]
    } satisfies Meta<typeof Tooltip>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover target</Button>
            </TooltipTrigger>
            <TooltipContent>Helpful context lives here.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </StorySurface>
      ),
    }
