import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/card"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Card",
      component: Card,
      tags: ["autodocs"]
    } satisfies Meta<typeof Card>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[24rem]">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>UI package</CardTitle>
            <CardDescription>Reusable primitives for forms, navigation, and overlays.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Storybook gives the package one place to browse and validate each state.
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm">Open docs</Button>
          </CardFooter>
        </Card>
      </StorySurface>
      ),
    }
