import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../components/resizable"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Resizable",
      component: ResizablePanelGroup,
      tags: ["autodocs"]
    } satisfies Meta<typeof ResizablePanelGroup>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[34rem]">
        <ResizablePanelGroup direction="horizontal" className="min-h-[14rem] overflow-hidden rounded-xl border">
          <ResizablePanel defaultSize={35}>
            <div className="flex h-full items-center justify-center bg-muted text-sm font-medium">Sidebar</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <div className="flex h-full items-center justify-center text-sm font-medium">Preview canvas</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </StorySurface>
      ),
    }
