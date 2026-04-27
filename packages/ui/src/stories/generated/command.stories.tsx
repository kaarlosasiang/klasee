import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "../../components/command"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Command",
      component: Command,
      tags: ["autodocs"]
    } satisfies Meta<typeof Command>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[28rem]">
        <Command className="w-full rounded-xl border">
          <CommandInput placeholder="Search a component..." />
          <CommandList>
            <CommandEmpty>No component found.</CommandEmpty>
            <CommandGroup heading="Common">
              <CommandItem>
                Button
                <CommandShortcut>B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                Dialog
                <CommandShortcut>D</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Data">
              <CommandItem>Table</CommandItem>
              <CommandItem>Chart</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </StorySurface>
      ),
    }
