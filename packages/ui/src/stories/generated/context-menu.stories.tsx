import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../components/context-menu"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/ContextMenu",
      component: ContextMenu,
      tags: ["autodocs"]
    } satisfies Meta<typeof ContextMenu>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[22rem]">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Right click this surface
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </StorySurface>
      ),
    }
