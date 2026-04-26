import { SignOutButton } from "@/components/sign-out-button"

export default function InstructorDashboardPage() {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
        <SignOutButton />
      </div>
      <p>
        Welcome to your dashboard! Here you can manage your courses, view
        analytics, and more.
      </p>
    </div>
  )
}
