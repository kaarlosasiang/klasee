import type { Meta, StoryObj } from "@storybook/react-vite"

    import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../../components/input-group"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/InputGroup",
      component: InputGroup,
      tags: ["autodocs"]
    } satisfies Meta<typeof InputGroup>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[26rem]">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="storybook.acme.dev" />
        </InputGroup>
      </StorySurface>
      ),
    }
