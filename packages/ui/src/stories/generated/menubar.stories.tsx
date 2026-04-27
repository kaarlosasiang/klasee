import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "../../components/menubar"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Menubar",
      component: Menubar,
      tags: ["autodocs"]
    } satisfies Meta<typeof Menubar>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New story</MenubarItem>
              <MenubarItem>Duplicate</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Archive</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </StorySurface>
      ),
    }
