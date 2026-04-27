import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../components/drawer"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Drawer",
      component: Drawer,
      tags: ["autodocs"]
    } satisfies Meta<typeof Drawer>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Publish checklist</DrawerTitle>
              <DrawerDescription>
                Review docs, accessibility notes, and the key component states before shipping.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Continue</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </StorySurface>
      ),
    }
