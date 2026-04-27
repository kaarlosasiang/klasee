import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/accordion"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Accordion",
      component: Accordion,
      tags: ["autodocs"]
    } satisfies Meta<typeof Accordion>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[28rem]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview">
            <AccordionTrigger>What ships with this package?</AccordionTrigger>
            <AccordionContent>
              Buttons, overlays, data display components, and the composable patterns that support them.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="story">
            <AccordionTrigger>Why a Storybook baseline?</AccordionTrigger>
            <AccordionContent>
              It gives every component a living sandbox for variants, states, and docs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </StorySurface>
      ),
    }
