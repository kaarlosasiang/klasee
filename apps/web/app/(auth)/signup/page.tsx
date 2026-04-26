import SignupForm from "@/components/forms/signup-form/form"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <h1 className="text-xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Already have an account? <a href="/login" className="underline">Sign in</a>
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}