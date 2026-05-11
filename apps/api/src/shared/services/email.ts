import { Resend } from "resend"
import { constants } from "../../config/index.js"

const resend = new Resend(constants.resendApiKey!)

const SENDER_EMAIL = "noreply@klasee.com"

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationLink = `${constants.frontEndUrl}/auth/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Verify your Klasee email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Welcome to Klasee! Please verify your email address by clicking the link below:</p>
          <p>
            <a href="${verificationLink}" style="background-color: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link expires in 24 hours.</p>
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