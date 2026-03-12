type GameHUDProps = {
  timeLeft: number
  score: number
  highScore: number
  currentWord: string
  round: number
}

export function GameHUD({
  timeLeft,
  score,
  highScore,
  currentWord,
  round,
}: GameHUDProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">Time</p>
          <p className="text-2xl font-bold text-slate-900">{timeLeft}s</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Score
          </p>
          <p className="text-2xl font-bold text-slate-900">{score}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            High Score
          </p>
          <p className="text-2xl font-bold text-slate-900">{highScore}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs tracking-wide text-emerald-600 uppercase">
            Word
          </p>
          <p className="text-2xl font-bold text-emerald-800 capitalize">
            {currentWord}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Round
          </p>
          <p className="text-2xl font-bold text-slate-900">{round}</p>
        </div>
      </div>
    </header>
  )
}
