import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "../../components/item"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Item",
      component: Item,
      tags: ["autodocs"]
    } satisfies Meta<typeof Item>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[30rem]">
        <Item className="w-full">
          <ItemContent>
            <ItemHeader>
              <ItemTitle>Sidebar</ItemTitle>
              <ItemActions>
                <Button variant="ghost" size="sm">Inspect</Button>
              </ItemActions>
            </ItemHeader>
            <ItemDescription>Responsive navigation primitive with mobile sheet support and keyboard toggle.</ItemDescription>
            <ItemFooter>
              <span className="text-xs text-muted-foreground">Updated for Storybook</span>
              <span className="text-xs font-medium">Ready</span>
            </ItemFooter>
          </ItemContent>
        </Item>
      </StorySurface>
      ),
    }
