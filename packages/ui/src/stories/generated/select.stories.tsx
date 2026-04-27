import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/select"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Select",
      component: Select,
      tags: ["autodocs"]
    } satisfies Meta<typeof Select>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <Select defaultValue="storybook">
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Pick a tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tooling</SelectLabel>
              <SelectItem value="storybook">Storybook</SelectItem>
              <SelectItem value="vite">Vite</SelectItem>
              <SelectItem value="turbo">Turborepo</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </StorySurface>
      ),
    }
