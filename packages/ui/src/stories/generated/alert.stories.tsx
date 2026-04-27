import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Alert, AlertAction, AlertDescription, AlertTitle } from "../../components/alert"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/Alert",
      component: Alert,
      tags: ["autodocs"]
    } satisfies Meta<typeof Alert>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[28rem]">
        <Alert>
          <AlertTitle>Team space updated</AlertTitle>
          <AlertDescription>
            Your component inventory and docs now share the same visual source of truth.
          </AlertDescription>
          <AlertAction asChild>
            <Button size="sm">Review</Button>
          </AlertAction>
        </Alert>
      </StorySurface>
      ),
    }
