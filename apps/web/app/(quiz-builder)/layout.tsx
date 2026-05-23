export default function QuizBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background px-4 py-4">
      {children}
    </div>
  )
}
