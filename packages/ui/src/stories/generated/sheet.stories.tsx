import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../../components/sheet"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Sheet",
      component: Sheet,
      tags: ["autodocs"]
    } satisfies Meta<typeof Sheet>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Inspect component</SheetTitle>
              <SheetDescription>
                Side panels are useful for docs, metadata, and secondary workflows.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </StorySurface>
      ),
    }
