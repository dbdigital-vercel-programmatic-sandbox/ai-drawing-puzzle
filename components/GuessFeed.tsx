type GuessItem = {
  value: string
  source: "ai" | "you"
  timestamp: number
}

type GuessFeedProps = {
  guesses: GuessItem[]
}

export function GuessFeed({ guesses }: GuessFeedProps) {
  return (
    <aside className="animate-fade-in-up h-full rounded-3xl border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.1)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
          Guess Feed
        </h2>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-700">
          Live
        </span>
      </div>

      {guesses.length === 0 ? (
        <p className="animate-soft-pulse text-sm text-slate-500">
          Messages appear here as the round unfolds.
        </p>
      ) : (
        <ul className="max-h-[56vh] space-y-2 overflow-y-auto pr-1">
          {guesses.map((guess, index) => (
            <li
              key={`${guess.timestamp}-${guess.value}`}
              className="animate-feed-in rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {guess.source === "ai" ? "AI" : "You"}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {guess.value}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export type { GuessItem }
