import type { Meta, StoryObj } from "@storybook/react-vite"

    import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "../../components/native-select"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/NativeSelect",
      component: NativeSelect,
      tags: ["autodocs"]
    } satisfies Meta<typeof NativeSelect>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[22rem]">
        <NativeSelect defaultValue="storybook">
          <NativeSelectOptGroup label="Tooling">
            <NativeSelectOption value="storybook">Storybook</NativeSelectOption>
            <NativeSelectOption value="vite">Vite</NativeSelectOption>
            <NativeSelectOption value="turbo">Turborepo</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </StorySurface>
      ),
    }
