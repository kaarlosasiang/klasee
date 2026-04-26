import { z } from "zod"

export const UserRole = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const

interface SignUpData {
  name: string
  email: string
  password: string
  role: UserRole
  confirmPassword: string
}

interface SignInData {
  email: string
  password: string
}

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    role: z.enum(["student", "instructor", "admin"], { required_error: "Please select a role" }),
    confirmPassword: z.string(),
  })
  .refine((data: SignUpData) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UserRole = (typeof UserRole)[keyof typeof UserRole]
