type GuessItem = {
  value: string
  source: "openai" | "fallback"
  timestamp: number
}

type GuessFeedProps = {
  guesses: GuessItem[]
}

export function GuessFeed({ guesses }: GuessFeedProps) {
  return (
    <aside className="h-full rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
          AI Guess Feed
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
          Live
        </span>
      </div>

      {guesses.length === 0 ? (
        <p className="text-sm text-slate-500">
          Start drawing to see live guesses.
        </p>
      ) : (
        <ul className="space-y-2">
          {guesses.map((guess) => (
            <li
              key={`${guess.timestamp}-${guess.value}`}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-sm font-medium text-slate-800">
                AI thinks: {guess.value}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export type { GuessItem }
