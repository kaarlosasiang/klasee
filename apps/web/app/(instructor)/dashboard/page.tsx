import Image from "next/image"

export default function InstructorDashboardPage() {
  return (
    <div>
      <Image
        src={"/klasee-avatar.png"}
        alt="Klasee Avatar"
        width={100}
        height={100}
        unoptimized
      />
      Instructor Dashboard
    </div>
  )
}
