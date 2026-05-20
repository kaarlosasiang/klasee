interface LmsTipCardProps {
  title: string
  description: string
  backgroundColor?: string
}

export function LmsTipCard({
  title,
  description,
  backgroundColor = "from-white via-primary/20 to-primary",
}: LmsTipCardProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-b-3xl bg-linear-to-b ${backgroundColor} p-4`}
    >
      <div className={`absolute inset-x-0 top-0 h-1/2`} />
      {/* Decorative element */}
      <div className="absolute right-0 bottom-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-blue-300/30" />
      <div className="absolute right-20 bottom-0 mr-0 -mb-20 h-40 w-40 rounded-full bg-blue-500/20" />

      <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:gap-2">
        {/* Owl mascot */}
        <div className="h-32 w-32 shrink-0 md:h-40 md:w-40">
          <img
            src="/klasee-avatar.png"
            alt="Educational mascot owl"
            className="h-full w-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Message bubble */}
        <div className="relative max-w-[500px] grow shadow-lg">
          <div className="relative rounded-2xl bg-white p-4 shadow-lg md:p-5">
            <h3 className="mb-1 text-sm font-bold text-balance text-blue-900 md:text-base">
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-pretty text-gray-600 md:text-sm">
              {description}
            </p>
            {/* Arrow pointer */}
            <div className="absolute top-6 left-0 -ml-2 h-0 w-0 border-t-8 border-r-8 border-b-8 border-t-transparent border-r-white border-b-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
