"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, User, Phone, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"
import { useSession, updateUser } from "@/lib/config/auth-client"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { PrivacyNoticeModal } from "@/components/common/privacy-notice-modal"

type Step = 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const user = session?.user

  const [step, setStep] = React.useState<Step>(1)
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [consentChecked, setConsentChecked] = React.useState(false)
  const [privacyOpen, setPrivacyOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login")
    }
    if (!isPending && session && (user as any)?.onboardingCompleted) {
      const role = (user as any)?.role
      router.replace(role === "instructor" ? "/dashboard" : "/my-dashboard")
    }
  }, [isPending, session, user, router])

  React.useEffect(() => {
    if (user) {
      setFirstName((user as any).firstName ?? "")
      setLastName((user as any).lastName ?? "")
      setPhoneNumber((user as any).phoneNumber ?? "")
    }
  }, [user])

  function validateStep1() {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = "First name is required"
    if (!lastName.trim()) errs.lastName = "Last name is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleFinish() {
    setSubmitting(true)
    try {
      const result = await (updateUser as any)({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        onboardingCompleted: true,
        consentGivenAt: Date.now(),
      })
      if (result.error) throw result.error
      toast.success("Welcome to Klasee!")
      const role = (user as any)?.role
      router.replace(role === "instructor" ? "/dashboard" : "/my-dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to Klasee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s set up your profile before you get started.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {([1, 2] as const).map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                step > s
                  ? "bg-primary text-primary-foreground"
                  : step === s
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="size-4" /> : s}
            </div>
            {s < 2 && <div className="h-px flex-1 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Personal Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })) }}
                  placeholder="Juan"
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })) }}
                  placeholder="dela Cruz"
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => { if (validateStep1()) setStep(2) }}
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Almost done!</h2>
            <p className="text-sm text-muted-foreground">
              Your profile is ready. Click below to enter Klasee.
            </p>
            <div className="rounded-xl bg-muted/40 p-4 text-sm space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {firstName} {lastName}</p>
              {phoneNumber && <p><span className="text-muted-foreground">Phone:</span> {phoneNumber}</p>}
              <p><span className="text-muted-foreground">Role:</span> <span className="capitalize">{(user as any)?.role ?? "student"}</span></p>
            </div>
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="onboarding-consent"
                checked={consentChecked}
                onCheckedChange={(v) => setConsentChecked(!!v)}
                className="mt-0.5 shrink-0"
              />
              <label htmlFor="onboarding-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I have read and agree to the{" "}
                <button type="button" onClick={() => setPrivacyOpen(true)} className="underline text-primary hover:text-primary/80">
                  Privacy Notice
                </button>
                . I understand how Klasee collects and uses my personal data.
              </label>
            </div>
            <PrivacyNoticeModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button className="flex-1" onClick={handleFinish} disabled={submitting || !consentChecked}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
