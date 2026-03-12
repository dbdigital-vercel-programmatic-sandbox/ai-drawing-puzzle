type GuessPayload = {
  imageDataUrl: string
  targetWord: string
  timeElapsed: number
}

type GuessResponse = {
  guess: string
  source: "openai" | "fallback"
}

const NORMALIZATION_MAP: Record<string, string> = {
  kitty: "cat",
  kitten: "cat",
  automobile: "car",
  vehicle: "car",
  sneakers: "shoe",
  sneaker: "shoe",
  trainers: "shoe",
}

export function normalizeLabel(label: string): string {
  const cleaned = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
  return NORMALIZATION_MAP[cleaned] ?? cleaned
}

export function isGuessCorrect(guess: string, targetWord: string): boolean {
  const normalizedGuess = normalizeLabel(guess)
  const normalizedTarget = normalizeLabel(targetWord)

  if (!normalizedGuess || !normalizedTarget) return false
  if (normalizedGuess === normalizedTarget) return true

  const tokens = normalizedGuess.split(" ")
  return tokens.includes(normalizedTarget)
}

export async function requestAIGuess(
  payload: GuessPayload
): Promise<GuessResponse> {
  const response = await fetch("/api/guess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Guess request failed")
  }

  const data = (await response.json()) as GuessResponse
  return data
}
