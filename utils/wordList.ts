export type Difficulty = "easy" | "medium" | "hard"

export const WORDS_BY_DIFFICULTY: Record<Difficulty, string[]> = {
  easy: [
    "cat",
    "house",
    "tree",
    "car",
    "apple",
    "fish",
    "sun",
    "star",
    "chair",
    "shoe",
  ],
  medium: [
    "guitar",
    "backpack",
    "camera",
    "rocket",
    "butterfly",
    "hamburger",
    "basketball",
    "candle",
    "clock",
    "airplane",
  ],
  hard: [
    "lighthouse",
    "windmill",
    "toothbrush",
    "headphones",
    "microscope",
    "skateboard",
    "submarine",
    "dragon",
    "firetruck",
    "hot air balloon",
  ],
}

export const ALL_WORDS = [
  ...WORDS_BY_DIFFICULTY.easy,
  ...WORDS_BY_DIFFICULTY.medium,
  ...WORDS_BY_DIFFICULTY.hard,
]

export function getRandomWord(difficulty: Difficulty): string {
  const words = WORDS_BY_DIFFICULTY[difficulty]
  return words[Math.floor(Math.random() * words.length)]
}

export function getDailyChallengeWord(date = new Date()): string {
  const daySeed = Math.floor(date.getTime() / 86_400_000)
  return ALL_WORDS[daySeed % ALL_WORDS.length]
}
