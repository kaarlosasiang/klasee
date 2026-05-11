"use client"

import { useState } from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"

export default function VerifyEmailForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("")
  const { verifyEmail, resendVerificationOtp } = useAuth()
  const { isLoading, error } = useAuthStore()

  const canSubmit = Boolean(email) && otp.length === 6 && !isLoading

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email) {
      toast.error("Missing email address. Please sign up again.")
      return
    }

    if (otp.length !== 6) {
      toast.error("Enter the 6-digit verification code.")
      return
    }

    try {
      await verifyEmail(email, otp)
      toast.success("Email verified. You can sign in now.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid verification code."
      )
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing email address. Please sign up again.")
      return
    }

    try {
      await resendVerificationOtp(email)
      setOtp("")
      toast.success("A new verification code was sent.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to resend code."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="mx-auto max-w-md bg-transparent">
        <CardHeader>
          <CardTitle>Verify your Email</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address:{" "}
            <span className="font-medium">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button
                variant="outline"
                size="xs"
                type="button"
                disabled={isLoading || !email}
                onClick={handleResend}
              >
                <RefreshCwIcon />
                {isLoading ? "Sending..." : "Resend Code"}
              </Button>
            </div>
            <InputOTP
              maxLength={6}
              id="otp-verification"
              value={otp}
              onChange={setOtp}
              disabled={isLoading || !email}
              aria-invalid={Boolean(error)}
              required
            >
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <FieldError>{error}</FieldError>}
            <FieldDescription>
              <a href="#">I no longer have access to this email address.</a>
            </FieldDescription>
          </Field>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Having trouble signing in?{" "}
              <a
                href="#"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Contact support
              </a>
            </div>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
