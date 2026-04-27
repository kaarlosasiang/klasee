import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/tabs"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Tabs",
      component: Tabs,
      tags: ["autodocs"]
    } satisfies Meta<typeof Tabs>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[30rem]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 rounded-xl border p-4 text-sm">
            Primary usage guidance and composition hints live here.
          </TabsContent>
          <TabsContent value="states" className="mt-4 rounded-xl border p-4 text-sm">
            Focus, hover, empty, error, disabled, and loading states.
          </TabsContent>
          <TabsContent value="notes" className="mt-4 rounded-xl border p-4 text-sm">
            Add richer interactions later for components that need them.
          </TabsContent>
        </Tabs>
      </StorySurface>
      ),
    }
