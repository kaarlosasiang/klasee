import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "../../components/button-group"
    import { StorySurface } from "../storybook-support"
    import { Button } from "@workspace/ui/components/button"

    const meta = {
      title: "Components/ButtonGroup",
      component: ButtonGroup,
      tags: ["autodocs"]
    } satisfies Meta<typeof ButtonGroup>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <ButtonGroup>
          <Button variant="outline">Back</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Preview</Button>
          <ButtonGroupText>Status: Draft</ButtonGroupText>
        </ButtonGroup>
      </StorySurface>
      ),
    }
