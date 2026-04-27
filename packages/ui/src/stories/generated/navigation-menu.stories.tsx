import type { Meta, StoryObj } from "@storybook/react-vite"

    import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../../components/navigation-menu"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/NavigationMenu",
      component: NavigationMenu,
      tags: ["autodocs"]
    } satisfies Meta<typeof NavigationMenu>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[36rem]">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-1 p-1 md:w-[22rem]">
                  <NavigationMenuLink href="/">Button</NavigationMenuLink>
                  <NavigationMenuLink href="/">Dialog</NavigationMenuLink>
                  <NavigationMenuLink href="/">Table</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">Docs</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      </StorySurface>
      ),
    }
