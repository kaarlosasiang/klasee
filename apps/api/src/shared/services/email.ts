import { Resend } from "resend"
import { constants } from "../../config/index.js"
import LoggerInstance from "../../config/logger.js"

const resend = new Resend(constants.resendApiKey!)

const SENDER_EMAIL = "noreply@klasee.com"

export async function sendVerificationEmail(
  email: string,
  otp: string
): Promise<void> {
  const verificationUrl = `${constants.frontEndUrl}/verify-email?email=${encodeURIComponent(email)}`
  LoggerInstance.info(`Sending verification email to ${email} with OTP ${otp}`)
  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Verify your Klasee email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Welcome to Klasee! Use this verification code to confirm your email address:</p>
          <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">${otp}</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Enter Code
            </a>
          </p>
          <p>Or open this page: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This code expires soon. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${constants.frontEndUrl}/auth/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Reset your Klasee password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw error
  }
}
