import type { Meta, StoryObj } from "@storybook/react-vite"

    import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/dropdown-menu"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/DropdownMenu",
      component: DropdownMenu,
      tags: ["autodocs"]
    } satisfies Meta<typeof DropdownMenu>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>View docs</DropdownMenuItem>
              <DropdownMenuItem>Copy import</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Archive component</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySurface>
      ),
    }
