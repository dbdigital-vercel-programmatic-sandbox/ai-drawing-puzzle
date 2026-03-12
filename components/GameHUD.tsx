type GameHUDProps = {
  timeLeft: number
  score: number
  highScore: number
  hint: string
  hintProgress: number
  hintStage: "masked" | "starter" | "vowels"
  round: number
  attempts: number
}

export function GameHUD({
  timeLeft,
  score,
  highScore,
  hint,
  hintProgress,
  hintStage,
  round,
  attempts,
}: GameHUDProps) {
  return (
    <header className="animate-fade-in-up rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.1)] backdrop-blur md:p-5">
      <div className="mb-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          <span>Hint meter</span>
          <span>{Math.round(hintProgress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 transition-[width] duration-500"
            style={{ width: `${hintProgress}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase">
          <span
            className={`rounded-full px-2 py-1 ${
              hintStage === "masked"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Masked
          </span>
          <span
            className={`rounded-full px-2 py-1 ${
              hintStage === "starter"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Starter letters
          </span>
          <span
            className={`rounded-full px-2 py-1 ${
              hintStage === "vowels"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Vowels open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl bg-slate-50/85 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">Time</p>
          <p className="text-2xl font-bold text-slate-900">{timeLeft}s</p>
        </div>
        <div className="rounded-xl bg-slate-50/85 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Score
          </p>
          <p className="text-2xl font-bold text-slate-900">{score}</p>
        </div>
        <div className="rounded-xl bg-slate-50/85 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            High Score
          </p>
          <p className="text-2xl font-bold text-slate-900">{highScore}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs tracking-wide text-emerald-600 uppercase">
            Hint
          </p>
          <p className="text-lg font-black tracking-[0.16em] text-emerald-800">
            {hint}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50/85 p-3">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Round
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {round} · {attempts} tries
          </p>
        </div>
      </div>
    </header>
  )
}
