import type { Meta, StoryObj } from "@storybook/react-vite"

    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/alert-dialog"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/AlertDialog",
      component: AlertDialog,
      tags: ["autodocs"]
    } satisfies Meta<typeof AlertDialog>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Archive draft</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this draft?</AlertDialogTitle>
              <AlertDialogDescription>
                The item will be hidden from the active queue but can still be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Archive</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StorySurface>
      ),
    }
