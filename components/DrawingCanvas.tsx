"use client"

import {
  forwardRef,
  type PointerEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"

export type DrawingCanvasRef = {
  clear: () => void
  getImageDataUrl: () => string
  hasDrawing: () => boolean
}

type DrawingCanvasProps = {
  width?: number
  height?: number
  brushSize: number
  brushColor: string
  disabled?: boolean
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas(
    { width = 720, height = 480, brushSize, brushColor, disabled = false },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const isDrawingRef = useRef(false)
    const hasInkRef = useRef(false)

    const resetCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      hasInkRef.current = false
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
        clear: () => resetCanvas(),
        getImageDataUrl: () => {
          const canvas = canvasRef.current
          return canvas ? canvas.toDataURL("image/png") : ""
        },
        hasDrawing: () => hasInkRef.current,
      }),
      [resetCanvas]
    )

    const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    }

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      const point = getPoint(event)

      event.preventDefault()
      canvas.setPointerCapture(event.pointerId)
      isDrawingRef.current = true

      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
    }

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
      if (disabled || !isDrawingRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      const point = getPoint(event)

      event.preventDefault()
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      hasInkRef.current = true
    }

    const handlePointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return

      const canvas = canvasRef.current
      if (!canvas) return

      event.preventDefault()
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
      isDrawingRef.current = false
    }

    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
        <canvas
          ref={canvasRef}
          className="max-h-[60vh] w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          aria-label="Drawing canvas"
        />
        {disabled ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/30 text-lg font-semibold text-white backdrop-blur-[1px]">
            Round complete
          </div>
        ) : null}
      </div>
    )
  }
)
