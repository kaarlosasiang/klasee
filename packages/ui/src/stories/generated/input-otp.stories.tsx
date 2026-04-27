import type { Meta, StoryObj } from "@storybook/react-vite"

    import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../components/input-otp"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/InputOtp",
      component: InputOTP,
      tags: ["autodocs"]
    } satisfies Meta<typeof InputOTP>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        <StorySurface>
        <InputOTP maxLength={6} defaultValue="482913">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </StorySurface>
      ),
    }
