import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "../../components/avatar"
    import { StoryStack } from "../storybook-support"


    const meta = {
      title: "Components/Avatar",
      component: Avatar,
      tags: ["autodocs"]
    } satisfies Meta<typeof Avatar>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StoryStack className="items-center">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="Avery" />
          <AvatarFallback>AV</AvatarFallback>
          <AvatarBadge className="bg-emerald-500" />
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JW</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MN</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </StoryStack>
      ),
    }
