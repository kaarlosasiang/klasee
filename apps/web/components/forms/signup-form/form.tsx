"use client"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpInput } from "@workspace/validators"
import { signUp } from "@/lib/config/auth-client"
import { useRouter } from "next/navigation"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  })

  const onSubmit = async (data: SignUpInput) => {
    const redirect = data.role === "instructor" ? "/dashboard" : "/my-dashboard"
    try {
      setIsLoading(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (signUp.email as any)({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        callbackURL: redirect,
      })
      if (error) throw new Error(error.message ?? "Sign-up failed")
      router.push(redirect)
    } catch (e) {
      console.error("Sign-up error:", e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                type="text"
                autoComplete="name"
                placeholder="John Doe"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                aria-invalid={fieldState.invalid}
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                {...field}
                id="password"
                aria-invalid={fieldState.invalid}
                type="password"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                {...field}
                id="confirmPassword"
                aria-invalid={fieldState.invalid}
                type="password"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>I am a</FieldLabel>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  htmlFor="role-student"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-input p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem value="student" id="role-student" />
                  <span className="text-sm font-medium">Student</span>
                </label>
                <label
                  htmlFor="role-instructor"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-input p-3 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem value="instructor" id="role-instructor" />
                  <span className="text-sm font-medium">Instructor</span>
                </label>
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
