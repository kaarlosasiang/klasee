import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../../components/popover"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Popover",
      component: Popover,
      tags: ["autodocs"]
    } satisfies Meta<typeof Popover>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <PopoverHeader>
              <PopoverTitle>Review status</PopoverTitle>
              <PopoverDescription>
                Stories are generated, but a few advanced components may still want richer hand-authored scenarios.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </StorySurface>
      ),
    }
