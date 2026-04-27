import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "../../components/sidebar"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Sidebar",
      component: Sidebar,
      tags: ["autodocs"],
  parameters: {
  layout: "fullscreen"
}
    } satisfies Meta<typeof Sidebar>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="h-[28rem] w-[42rem] items-stretch p-0">
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon">
            <SidebarHeader className="border-b p-2">
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Library</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>Overview</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Components</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Accessibility</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-2 text-xs text-muted-foreground">
              Shared UI package
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex items-center justify-center border-l">
            <div className="text-sm text-muted-foreground">Main content area</div>
          </SidebarInset>
        </SidebarProvider>
      </StorySurface>
      ),
    }
