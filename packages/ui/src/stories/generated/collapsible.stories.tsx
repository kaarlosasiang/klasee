import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/collapsible"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Collapsible",
      component: Collapsible,
      tags: ["autodocs"]
    } satisfies Meta<typeof Collapsible>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[28rem]">
        <Collapsible defaultOpen className="w-full rounded-xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium">Release notes</h3>
              <p className="text-sm text-muted-foreground">A quick summary of the UI package changes.</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">Toggle</Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-4 text-sm text-muted-foreground">
            Storybook setup, generated starter stories, and a preview shell tuned for your shared styles.
          </CollapsibleContent>
        </Collapsible>
      </StorySurface>
      ),
    }
