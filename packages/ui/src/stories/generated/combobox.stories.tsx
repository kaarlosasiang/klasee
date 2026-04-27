import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from "../../components/combobox"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Combobox",
      component: Combobox,
      tags: ["autodocs"]
    } satisfies Meta<typeof Combobox>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[24rem]">
        <Combobox>
          <ComboboxInput placeholder="Pick a dependency" />
          <ComboboxContent>
            <ComboboxEmpty>No match found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxItem value="React">React</ComboboxItem>
                <ComboboxItem value="Next.js">Next.js</ComboboxItem>
                <ComboboxItem value="Storybook">Storybook</ComboboxItem>
                <ComboboxItem value="Radix">Radix</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </StorySurface>
      ),
    }
