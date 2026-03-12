"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"

import type { SketchProgram, SketchPoint } from "@/lib/sketchPrograms"

export type AIDrawingCanvasRef = {
  clear: () => void
  drawProgram: (program: SketchProgram) => Promise<void>
}

type AIDrawingCanvasProps = {
  width?: number
  height?: number
  isDrawing?: boolean
  onStrokeStart?: (strokeIndex: number) => void
}

function jitter(point: SketchPoint): SketchPoint {
  const amount = 1.25
  return {
    x: point.x + (Math.random() * 2 - 1) * amount,
    y: point.y + (Math.random() * 2 - 1) * amount,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export const AIDrawingCanvas = forwardRef<
  AIDrawingCanvasRef,
  AIDrawingCanvasProps
>(function AIDrawingCanvas(
  { width = 720, height = 480, isDrawing = false, onStrokeStart },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const runIdRef = useRef(0)

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
  }, [height, width])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    resetCanvas()
  }, [width, height, resetCanvas])

  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        runIdRef.current += 1
        resetCanvas()
      },
      drawProgram: async (program: SketchProgram) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const runId = runIdRef.current + 1
        runIdRef.current = runId

        resetCanvas()
        await sleep(450 + Math.floor(Math.random() * 500))

        for (
          let strokeIndex = 0;
          strokeIndex < program.strokes.length;
          strokeIndex += 1
        ) {
          if (runIdRef.current !== runId) return

          const stroke = program.strokes[strokeIndex]
          if (!stroke || stroke.points.length < 2) continue

          onStrokeStart?.(strokeIndex)
          ctx.beginPath()
          const first = jitter(stroke.points[0])
          ctx.moveTo(first.x, first.y)
          ctx.strokeStyle = stroke.color ?? "#0f172a"
          ctx.lineWidth = stroke.width ?? 4 + Math.random() * 1.5

          for (let index = 1; index < stroke.points.length; index += 1) {
            if (runIdRef.current !== runId) return

            const next = jitter(stroke.points[index])
            ctx.lineTo(next.x, next.y)
            ctx.stroke()

            const segmentDelay = 22 + Math.floor(Math.random() * 55)
            await sleep(segmentDelay)

            if (Math.random() < 0.12) {
              await sleep(80 + Math.floor(Math.random() * 240))
            }
          }

          await sleep(
            stroke.pauseAfterMs ?? 140 + Math.floor(Math.random() * 380)
          )
        }
      },
    }),
    [onStrokeStart, resetCanvas]
  )

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white shadow-[0_16px_36px_rgba(2,6,23,0.12)] transition-all duration-500 ${
        isDrawing
          ? "border-sky-300 ring-4 ring-sky-100"
          : "border-slate-200 shadow-[0_12px_30px_rgba(2,6,23,0.08)]"
      }`}
    >
      {isDrawing ? (
        <div className="animate-soft-pulse pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400" />
      ) : null}
      <canvas
        ref={canvasRef}
        className="max-h-[60vh] w-full"
        aria-label="AI drawing canvas"
      />
    </div>
  )
})
