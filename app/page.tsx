"use client"

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  AIDrawingCanvas,
  type AIDrawingCanvasRef,
} from "@/components/AIDrawingCanvas"
import { GameHUD } from "@/components/GameHUD"
import { GuessFeed, type GuessItem } from "@/components/GuessFeed"
import { isGuessCorrect } from "@/lib/aiGuess"
import { getSketchProgram } from "@/lib/sketchPrograms"
import {
  type Difficulty,
  getDailyChallengeWord,
  getRandomWord,
  WORDS_BY_DIFFICULTY,
} from "@/utils/wordList"

type Phase = "start" | "playing" | "won" | "lost"

const ROUND_SECONDS = 60
const AUTO_NEXT_ROUND_SECONDS = 4
const HIGH_SCORE_STORAGE_KEY = "ai-drawing-puzzle-high-score"

function computeRoundScore(
  timeLeft: number,
  attempts: number,
  aiFinished: boolean
) {
  const elapsed = ROUND_SECONDS - timeLeft
  const base = Math.max(200, 1000 - elapsed * 14)
  const attemptsPenalty = Math.max(0, attempts - 1) * 45
  const speedBonus = timeLeft * 10
  const earlyGuessBonus = aiFinished ? 0 : 200
  return Math.max(180, base - attemptsPenalty + speedBonus + earlyGuessBonus)
}

function buildHint(word: string, timeLeft: number): string {
  const revealMode =
    timeLeft > 38 ? "masked" : timeLeft > 20 ? "starter" : "vowels"
  const letters = word.split("")

  if (revealMode === "masked") {
    return letters.map((char) => (char === " " ? " " : "_")).join("")
  }

  if (revealMode === "starter") {
    let revealNext = true
    return letters
      .map((char) => {
        if (char === " ") {
          revealNext = true
          return " "
        }
        if (revealNext) {
          revealNext = false
          return char
        }
        return "_"
      })
      .join("")
  }

  let revealNext = true
  return letters
    .map((char) => {
      if (char === " ") {
        revealNext = true
        return " "
      }
      if (revealNext) {
        revealNext = false
        return char
      }
      if (/[aeiou]/.test(char)) return char
      return "_"
    })
    .join("")
}

function getHintStage(timeLeft: number): "masked" | "starter" | "vowels" {
  if (timeLeft > 38) return "masked"
  if (timeLeft > 20) return "starter"
  return "vowels"
}

function getHintProgress(timeLeft: number): number {
  const elapsed = ROUND_SECONDS - timeLeft
  if (elapsed <= 22) return (elapsed / 22) * 33
  if (elapsed <= 40) return 33 + ((elapsed - 22) / 18) * 33
  return 66 + ((elapsed - 40) / 20) * 34
}

function getNudge(word: string): string {
  const firstLetter = word[0]?.toUpperCase() ?? ""
  return `Hint: it starts with ${firstLetter}.`
}

export default function Page() {
  const canvasRef = useRef<AIDrawingCanvasRef | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timeLeftRef = useRef(ROUND_SECONDS)
  const wordRef = useRef(WORDS_BY_DIFFICULTY.easy[0])
  const nudgesRef = useRef({ first: false, second: false })

  const [phase, setPhase] = useState<Phase>("start")
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [dailyChallenge, setDailyChallenge] = useState(false)
  const [word, setWord] = useState(WORDS_BY_DIFFICULTY.easy[0])
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [savedHighScore] = useState(() => {
    if (typeof window === "undefined") return 0
    const value = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY)
    const parsed = value ? Number.parseInt(value, 10) : 0
    return Number.isFinite(parsed) ? parsed : 0
  })
  const [guessInput, setGuessInput] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [aiFinished, setAiFinished] = useState(false)
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(
    null
  )
  const [guesses, setGuesses] = useState<GuessItem[]>([])

  const hint = useMemo(() => buildHint(word, timeLeft), [word, timeLeft])
  const hintStage = useMemo(() => getHintStage(timeLeft), [timeLeft])
  const hintProgress = useMemo(() => getHintProgress(timeLeft), [timeLeft])
  const highScore = Math.max(savedHighScore, score)

  const playGuessSound = useCallback((isCorrect: boolean) => {
    if (typeof window === "undefined") return

    const AudioConstructor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext
        }
      ).webkitAudioContext

    if (!AudioConstructor) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioConstructor()
    }

    const context = audioContextRef.current
    if (!context) return

    if (context.state === "suspended") {
      void context.resume()
    }

    const startAt = context.currentTime
    const notes = isCorrect ? [523.25, 659.25, 783.99] : [320, 260, 190]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      const noteStart = startAt + index * 0.08
      const noteEnd = noteStart + 0.16

      oscillator.type = isCorrect ? "triangle" : "sawtooth"
      oscillator.frequency.value = frequency

      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.exponentialRampToValueAtTime(
        isCorrect ? 0.09 : 0.07,
        noteStart + 0.025
      )
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(noteStart)
      oscillator.stop(noteEnd)
    })
  }, [])

  const pushMessage = (value: string, source: GuessItem["source"]) => {
    setGuesses((current) =>
      [{ value, source, timestamp: Date.now() }, ...current].slice(0, 24)
    )
  }

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    wordRef.current = word
  }, [word])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (score <= savedHighScore) return
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score))
  }, [score, savedHighScore])

  useEffect(
    () => () => {
      const context = audioContextRef.current
      if (!context) return
      void context.close()
    },
    []
  )

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

    if (timeLeft <= 35 && !nudgesRef.current.first) {
      nudgesRef.current.first = true
      pushMessage(getNudge(wordRef.current), "ai")
    }

    if (timeLeft <= 18 && !nudgesRef.current.second) {
      nudgesRef.current.second = true
      pushMessage(
        "Last hint: say your best guess, even if you are unsure.",
        "ai"
      )
    }
  }, [phase, timeLeft])

  useEffect(() => {
    if (phase !== "playing") return

    let canceled = false
    const canvas = canvasRef.current

    const runAIDrawing = async () => {
      pushMessage("Okay, I am thinking...", "ai")
      await new Promise((resolve) => window.setTimeout(resolve, 500))
      if (canceled) return

      pushMessage("Starting with the rough outline.", "ai")
      const program = getSketchProgram(wordRef.current)
      await canvas?.drawProgram(program)

      if (canceled) return

      setAiFinished(true)
      pushMessage("Done sketching. What is it?", "ai")
    }

    void runAIDrawing()

    return () => {
      canceled = true
      canvas?.clear()
    }
  }, [phase, word])

  const pickWord = useCallback(() => {
    if (dailyChallenge) return getDailyChallengeWord()
    return getRandomWord(difficulty)
  }, [dailyChallenge, difficulty])

  const beginRound = useCallback(
    (nextRound: number) => {
      const chosenWord = pickWord()
      setWord(chosenWord)
      setRound(nextRound)
      setPhase("playing")
      setTimeLeft(ROUND_SECONDS)
      setRoundScore(0)
      setGuessInput("")
      setAttempts(0)
      setAiFinished(false)
      setAutoNextCountdown(null)
      nudgesRef.current = { first: false, second: false }
      setGuesses([])
      canvasRef.current?.clear()
    },
    [pickWord]
  )

  const handleStartGame = () => {
    setScore(0)
    beginRound(1)
  }

  const handleNextRound = () => beginRound(round + 1)

  useEffect(() => {
    if (phase !== "won") return

    const timer = window.setInterval(() => {
      setAutoNextCountdown((current) => {
        if (current === null) return null
        if (current <= 1) {
          window.clearInterval(timer)
          beginRound(round + 1)
          return null
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase, round, beginRound])

  const handleSubmitGuess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (phase !== "playing") return

    const rawGuess = guessInput.trim().toLowerCase()
    if (!rawGuess) return

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    pushMessage(rawGuess, "you")
    setGuessInput("")

    if (isGuessCorrect(rawGuess, wordRef.current)) {
      playGuessSound(true)
      const earned = computeRoundScore(
        timeLeftRef.current,
        nextAttempts,
        aiFinished
      )
      setRoundScore(earned)
      setScore((current) => current + earned)
      setAutoNextCountdown(AUTO_NEXT_ROUND_SECONDS)
      setPhase("won")
      pushMessage("Yes! You got it.", "ai")
      return
    }

    playGuessSound(false)

    if (nextAttempts % 3 === 0) {
      pushMessage("Good try. Keep going.", "ai")
    }
  }

  const shareScore = async () => {
    const text = `I scored ${score} points in AI Drawing Puzzle. Can you guess what the AI draws?`

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
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.26),rgba(248,250,252,1)_42%),linear-gradient(140deg,rgba(14,116,144,0.06),rgba(22,163,74,0.06))] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <h1 className="animate-fade-in-up text-center text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          AI Drawing Puzzle
        </h1>

        {phase === "start" ? (
          <section className="animate-fade-in-up mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_38px_rgba(15,23,42,0.14)]">
            <h2 className="text-xl font-bold text-slate-900">
              The AI draws. You guess.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You get 60 seconds to figure out what the AI is sketching in real
              time. Guess earlier for bigger points.
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
              <li>- Watch the AI sketch one stroke at a time</li>
              <li>- Type guesses in the chat panel</li>
              <li>- Fewer attempts and faster guesses score higher</li>
              <li>- Hints unlock as time runs down</li>
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
              hint={hint}
              hintProgress={hintProgress}
              hintStage={hintStage}
              round={round}
              attempts={attempts}
            />

            {phase === "won" || phase === "lost" ? (
              <section className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {phase === "won"
                      ? `Round cleared (+${roundScore} pts). Next round starts in ${autoNextCountdown ?? 0}s.`
                      : `Round over. The drawing was ${word}.`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleNextRound}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Next Round
                    </button>
                    <button
                      onClick={shareScore}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Share Score
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="animate-fade-in-up rounded-3xl border border-slate-200/80 bg-white/92 p-4 shadow-[0_16px_36px_rgba(2,6,23,0.12)] md:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-500">
                    {aiFinished
                      ? "AI finished drawing. Submit your best guess."
                      : "AI is drawing right now..."}
                  </p>
                </div>

                <AIDrawingCanvas
                  ref={canvasRef}
                  isDrawing={phase === "playing" && !aiFinished}
                  onStrokeStart={(strokeIndex) => {
                    if (strokeIndex === 2) {
                      pushMessage("Adding some details...", "ai")
                    }
                    if (strokeIndex === 4) {
                      pushMessage("This one is a bit messy, sorry.", "ai")
                    }
                  }}
                />

                <form onSubmit={handleSubmitGuess} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(event) => setGuessInput(event.target.value)}
                    placeholder="Type your guess..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 ring-sky-200 transition outline-none focus:ring"
                    disabled={phase !== "playing"}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={phase !== "playing"}
                  >
                    Guess
                  </button>
                </form>
              </div>

              <GuessFeed guesses={guesses} />
            </section>
          </>
        )}
      </div>
    </main>
  )
}
