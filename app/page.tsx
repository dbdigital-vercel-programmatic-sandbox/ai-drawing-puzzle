"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import {
  DrawingCanvas,
  type DrawingCanvasRef,
} from "@/components/DrawingCanvas"
import { GameHUD } from "@/components/GameHUD"
import { GuessFeed, type GuessItem } from "@/components/GuessFeed"
import { isGuessCorrect, requestAIGuess } from "@/lib/aiGuess"
import {
  type Difficulty,
  WORDS_BY_DIFFICULTY,
  getDailyChallengeWord,
  getRandomWord,
} from "@/utils/wordList"

type Phase = "start" | "playing" | "won" | "lost"

const ROUND_SECONDS = 60
const BRUSH_COLORS = [
  "#0f172a",
  "#ef4444",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
]
const HIGH_SCORE_STORAGE_KEY = "ai-drawing-puzzle-high-score"

function computeRoundScore(timeLeft: number) {
  const elapsed = ROUND_SECONDS - timeLeft
  const base = Math.max(200, 1000 - elapsed * 15)
  const speedBonus = timeLeft * 10
  const quickWinBonus = elapsed <= 20 ? 350 : 0
  return base + speedBonus + quickWinBonus
}

export default function Page() {
  const canvasRef = useRef<DrawingCanvasRef | null>(null)
  const isGuessingRef = useRef(false)
  const timeLeftRef = useRef(ROUND_SECONDS)
  const wordRef = useRef(WORDS_BY_DIFFICULTY.easy[0])

  const [phase, setPhase] = useState<Phase>("start")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [dailyChallenge, setDailyChallenge] = useState(false)
  const [word, setWord] = useState(WORDS_BY_DIFFICULTY.easy[0])
  const [round, setRound] = useState(1)

  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const [brushSize, setBrushSize] = useState(8)
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0])
  const [guesses, setGuesses] = useState<GuessItem[]>([])

  const canDraw = phase === "playing"

  const pointsPreview = useMemo(() => computeRoundScore(timeLeft), [timeLeft])

  const pushGuess = (entry: GuessItem) => {
    setGuesses((current) => [entry, ...current].slice(0, 24))
  }

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    wordRef.current = word
  }, [word])

  useEffect(() => {
    const value = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY)
    const parsed = value ? Number.parseInt(value, 10) : 0
    setHighScore(Number.isFinite(parsed) ? parsed : 0)
  }, [])

  useEffect(() => {
    if (score <= highScore) return
    setHighScore(score)
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score))
  }, [score, highScore])

  useEffect(() => {
    if (phase !== "playing") return

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setPhase("lost")
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== "playing") return

    let canceled = false

    const runGuess = async () => {
      if (canceled || isGuessingRef.current) return
      if (!canvasRef.current?.hasDrawing()) return

      isGuessingRef.current = true

      try {
        const imageDataUrl = canvasRef.current.getImageDataUrl()
        if (!imageDataUrl) return

        const elapsed = ROUND_SECONDS - timeLeftRef.current
        const response = await requestAIGuess({
          imageDataUrl,
          targetWord: wordRef.current,
          timeElapsed: elapsed,
        })

        if (canceled) return

        const guessValue = response.guess.trim().toLowerCase()
        if (!guessValue) return

        pushGuess({
          value: guessValue,
          source: response.source,
          timestamp: Date.now(),
        })

        if (isGuessCorrect(guessValue, wordRef.current)) {
          const earned = computeRoundScore(timeLeftRef.current)
          setRoundScore(earned)
          setScore((current) => current + earned)
          setPhase("won")
        }
      } catch {
        pushGuess({
          value: "...thinking",
          source: "fallback",
          timestamp: Date.now(),
        })
      } finally {
        if (!canceled) isGuessingRef.current = false
      }
    }

    const initialDelay = window.setTimeout(runGuess, 1200)
    const interval = window.setInterval(runGuess, 3000)

    return () => {
      canceled = true
      window.clearTimeout(initialDelay)
      window.clearInterval(interval)
    }
  }, [phase])

  const pickWord = () => {
    if (dailyChallenge) return getDailyChallengeWord()
    return getRandomWord(difficulty)
  }

  const beginRound = (nextRound: number) => {
    const chosenWord = pickWord()
    setWord(chosenWord)
    setRound(nextRound)
    setPhase("playing")
    setTimeLeft(ROUND_SECONDS)
    setRoundScore(0)
    setGuesses([])
    isGuessingRef.current = false
    canvasRef.current?.clear()
  }

  const handleStartGame = () => {
    setScore(0)
    beginRound(1)
  }

  const handleNextRound = () => beginRound(round + 1)

  const shareScore = async () => {
    const text = `I scored ${score} points in AI Drawing Puzzle. Can your drawing beat mine?`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AI Drawing Puzzle",
          text,
        })
        return
      }

      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.20),rgba(248,250,252,1)_50%)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <h1 className="text-center text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          AI Drawing Puzzle
        </h1>

        {phase === "start" ? (
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-bold text-slate-900">
              Draw fast. Beat the AI.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You get 60 seconds. Every 3 seconds the AI checks your sketch and
              tries to guess the word. Faster correct guesses earn bigger
              points.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Difficulty
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800"
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as Difficulty)
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={dailyChallenge}
                  onChange={(event) => setDailyChallenge(event.target.checked)}
                />
                Daily drawing challenge
              </label>
            </div>

            <ul className="mt-5 space-y-1 text-sm text-slate-600">
              <li>- Draw with mouse or touch</li>
              <li>- Change brush size and color any time</li>
              <li>- Base score 1000, minus points every second</li>
              <li>- Bonus if AI solves your drawing in 20 seconds</li>
            </ul>

            <button
              onClick={handleStartGame}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Start Game
            </button>
          </section>
        ) : (
          <>
            <GameHUD
              timeLeft={timeLeft}
              score={score}
              highScore={highScore}
              currentWord={word}
              round={round}
            />

            <section className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.08)] md:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Brush
                    <input
                      type="range"
                      min={2}
                      max={28}
                      value={brushSize}
                      onChange={(event) =>
                        setBrushSize(Number(event.target.value))
                      }
                      className="ml-2 align-middle"
                    />
                    <span className="ml-2 text-xs text-slate-500">
                      {brushSize}px
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    {BRUSH_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className="h-7 w-7 rounded-full border-2"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            brushColor === color ? "#0f172a" : "#cbd5e1",
                        }}
                        aria-label={`Brush color ${color}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => canvasRef.current?.clear()}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Clear Canvas
                  </button>

                  <p className="ml-auto text-xs text-slate-500">
                    Current potential: {pointsPreview} pts
                  </p>
                </div>

                <DrawingCanvas
                  ref={canvasRef}
                  brushSize={brushSize}
                  brushColor={brushColor}
                  disabled={!canDraw}
                />
              </div>

              <GuessFeed guesses={guesses} />
            </section>

            {phase === "won" ? (
              <section className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <h3 className="text-2xl font-bold text-emerald-800">
                  AI guessed it! You win this round.
                </h3>
                <p className="mt-1 text-sm text-emerald-700">
                  +{roundScore} points.{" "}
                  {ROUND_SECONDS - timeLeft <= 20
                    ? "Speed bonus unlocked."
                    : "Solid sketch."}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleNextRound}
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Next Round
                  </button>
                  <button
                    onClick={shareScore}
                    className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    Share Score
                  </button>
                </div>
              </section>
            ) : null}

            {phase === "lost" ? (
              <section className="mx-auto w-full max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
                <h3 className="text-2xl font-bold text-rose-800">
                  Time&apos;s up.
                </h3>
                <p className="mt-1 text-sm text-rose-700">
                  The AI couldn&apos;t confidently guess: {word}.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleNextRound}
                    className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Try Next Round
                  </button>
                  <button
                    onClick={shareScore}
                    className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                  >
                    Share Score
                  </button>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
