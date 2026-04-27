import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../components/carousel"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Carousel",
      component: Carousel,
      tags: ["autodocs"]
    } satisfies Meta<typeof Carousel>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface className="w-[30rem]">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            {["Overview", "States", "Variants"].map((label) => (
              <CarouselItem key={label}>
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted font-medium">
                  {label}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </StorySurface>
      ),
    }
