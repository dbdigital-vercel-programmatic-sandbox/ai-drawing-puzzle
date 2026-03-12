import { NextResponse } from "next/server"

import { ALL_WORDS } from "@/utils/wordList"

type GuessBody = {
  imageDataUrl?: string
  targetWord?: string
  timeElapsed?: number
}

function fallbackGuess(targetWord: string, timeElapsed: number): string {
  const clampedElapsed = Math.max(0, Math.min(60, timeElapsed))
  const chanceToSolve = Math.min(0.2 + clampedElapsed * 0.0125, 0.92)

  if (Math.random() < chanceToSolve) {
    return targetWord
  }

  const options = ALL_WORDS.filter((word) => word !== targetWord)
  return options[Math.floor(Math.random() * options.length)]
}

function cleanGuess(rawGuess: string): string {
  return rawGuess
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4)
    .join(" ")
}

export async function POST(req: Request) {
  const body = (await req.json()) as GuessBody
  const targetWord = (body.targetWord ?? "").toLowerCase().trim()
  const timeElapsed = Number.isFinite(body.timeElapsed)
    ? Number(body.timeElapsed)
    : 0

  if (!body.imageDataUrl || !targetWord) {
    return NextResponse.json(
      { error: "Missing image or target" },
      { status: 400 }
    )
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      guess: fallbackGuess(targetWord, timeElapsed),
      source: "fallback",
    })
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "You are classifying a simple sketch game drawing. Reply with one short object label only, lowercase, no punctuation.",
              },
              {
                type: "input_image",
                image_url: body.imageDataUrl,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        guess: fallbackGuess(targetWord, timeElapsed),
        source: "fallback",
      })
    }

    const data = (await response.json()) as { output_text?: string }
    const guess = cleanGuess(data.output_text ?? "")

    if (!guess) {
      return NextResponse.json({
        guess: fallbackGuess(targetWord, timeElapsed),
        source: "fallback",
      })
    }

    return NextResponse.json({ guess, source: "openai" })
  } catch {
    return NextResponse.json({
      guess: fallbackGuess(targetWord, timeElapsed),
      source: "fallback",
    })
  }
}
