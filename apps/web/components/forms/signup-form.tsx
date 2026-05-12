"use client"

import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignUpInput, signUpSchema } from "@workspace/validators"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field"

import { toast } from "sonner"

import { Input } from "@workspace/ui/components/input"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"
import { signInWithSocial } from "@/lib/config/auth-client"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { signup } = useAuth()
  const { isLoading, error } = useAuthStore()
  const { control, handleSubmit } = useForm<SignUpInput>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit: SubmitHandler<SignUpInput> = async (data) => {
    try {
      await signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role
      )
    } catch (err: any) {
      toast.error(error || err.message || "An error occurred during sign up")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-16 items-center justify-center rounded-md">
                <Image
                  src={"/klasee-icon.png"}
                  alt="Klasee Icon"
                  width={50}
                  height={50}
                  unoptimized
                />
              </div>
              <span className="sr-only">Klasee</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Klasee</h1>
            <FieldDescription>
              Already have an account? <Link href={"/login"}>Sign in</Link>
            </FieldDescription>
          </div>
          <div className="flex items-start gap-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input
                    {...field}
                    id="first-name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="John"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input
                    {...field}
                    id="last-name"
                    aria-invalid={fieldState.invalid}
                    type="text"
                    placeholder="Doe"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="m@example.com"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" onClick={() => signInWithSocial("github")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.293 9.395 7.868 10.919.575.107.787-.244.787-.542
       0-.268-.01-1.154-.016-2.096-3.2.696-3.878-1.37-3.878-1.37-.523-1.328-1.278-1.68-1.278-1.68-1.044-.714.08-.699.08-.699
       1.155.081 1.763 1.186 1.763 1.186 1.027 1.76 2.694 1.252 3.35.958.103-.744.402-1.252.73-1.54-2.554-.291-5.236-1.277-5.236-5.683
       0-1.256.45-2.283 1.186-3.089-.118-.29-.514-1.463.112-3.05 0 0 .966-.309 3.166 1.18a10.9 10.9 0 0 1 2.883-.388
       10.9 10.9 0 0 1 2.883.388c2.2-1.489 3.164-1.18 3.164-1.18.628 1.587.232 2.76.114 3.05.74.806 1.184 1.833 1.184 3.089
       0 4.418-2.687 5.389-5.25 5.673.413.356.781 1.065.781 2.148 0 1.55-.014 2.796-.014 3.177 0 .3.208.655.794.544
       C20.21 21.39 23.5 17.084 23.5 12 23.5 5.648 18.352.5 12 .5Z"
                />
              </svg>
              Continue with GitHub
            </Button>
            <Button variant="outline" type="button" onClick={() => signInWithSocial("google")}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
