export type SketchPoint = {
  x: number
  y: number
}

export type SketchStroke = {
  points: SketchPoint[]
  width?: number
  color?: string
  pauseAfterMs?: number
}

export type SketchProgram = {
  strokes: SketchStroke[]
}

function line(a: SketchPoint, b: SketchPoint): SketchPoint[] {
  return [a, b]
}

function poly(points: SketchPoint[]): SketchPoint[] {
  return points
}

function circle(cx: number, cy: number, r: number, steps = 28): SketchPoint[] {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = (Math.PI * 2 * index) / steps
    return { x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r }
  })
}

function arc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
  steps = 20
): SketchPoint[] {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = start + ((end - start) * index) / steps
    return { x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r }
  })
}

const PROGRAMS: Record<string, SketchProgram> = {
  cat: {
    strokes: [
      { points: circle(360, 240, 95) },
      {
        points: poly([
          { x: 295, y: 170 },
          { x: 320, y: 110 },
          { x: 350, y: 175 },
        ]),
      },
      {
        points: poly([
          { x: 370, y: 175 },
          { x: 400, y: 110 },
          { x: 425, y: 170 },
        ]),
      },
      { points: line({ x: 335, y: 230 }, { x: 345, y: 230 }) },
      { points: line({ x: 375, y: 230 }, { x: 385, y: 230 }) },
      {
        points: poly([
          { x: 360, y: 245 },
          { x: 352, y: 260 },
          { x: 368, y: 260 },
          { x: 360, y: 245 },
        ]),
      },
      { points: line({ x: 320, y: 255 }, { x: 280, y: 250 }) },
      { points: line({ x: 400, y: 255 }, { x: 440, y: 250 }) },
    ],
  },
  house: {
    strokes: [
      {
        points: poly([
          { x: 255, y: 310 },
          { x: 465, y: 310 },
          { x: 465, y: 190 },
          { x: 255, y: 190 },
          { x: 255, y: 310 },
        ]),
      },
      {
        points: poly([
          { x: 240, y: 190 },
          { x: 360, y: 110 },
          { x: 480, y: 190 },
        ]),
      },
      {
        points: poly([
          { x: 335, y: 310 },
          { x: 335, y: 240 },
          { x: 385, y: 240 },
          { x: 385, y: 310 },
        ]),
      },
      {
        points: poly([
          { x: 275, y: 220 },
          { x: 315, y: 220 },
          { x: 315, y: 255 },
          { x: 275, y: 255 },
          { x: 275, y: 220 },
        ]),
      },
    ],
  },
  tree: {
    strokes: [
      {
        points: poly([
          { x: 340, y: 320 },
          { x: 340, y: 250 },
          { x: 380, y: 250 },
          { x: 380, y: 320 },
        ]),
      },
      { points: circle(320, 220, 55) },
      { points: circle(380, 215, 55) },
      { points: circle(350, 170, 58) },
    ],
  },
  car: {
    strokes: [
      {
        points: poly([
          { x: 230, y: 285 },
          { x: 490, y: 285 },
          { x: 520, y: 245 },
          { x: 450, y: 205 },
          { x: 300, y: 205 },
          { x: 250, y: 245 },
          { x: 230, y: 285 },
        ]),
      },
      { points: circle(300, 290, 28) },
      { points: circle(450, 290, 28) },
      { points: line({ x: 320, y: 210 }, { x: 360, y: 250 }) },
    ],
  },
  apple: {
    strokes: [
      { points: circle(335, 250, 72) },
      { points: circle(390, 250, 72) },
      { points: line({ x: 360, y: 145 }, { x: 375, y: 110 }) },
      { points: arc(395, 125, 30, Math.PI * 0.8, Math.PI * 1.9) },
    ],
  },
  fish: {
    strokes: [
      { points: arc(350, 240, 90, Math.PI * 0.15, Math.PI * 1.85) },
      { points: arc(350, 240, 90, Math.PI * -0.15, Math.PI * -1.85) },
      {
        points: poly([
          { x: 425, y: 240 },
          { x: 500, y: 190 },
          { x: 500, y: 290 },
          { x: 425, y: 240 },
        ]),
      },
      { points: circle(305, 220, 6) },
    ],
  },
  sun: {
    strokes: [
      { points: circle(360, 225, 65) },
      { points: line({ x: 360, y: 125 }, { x: 360, y: 85 }) },
      { points: line({ x: 360, y: 325 }, { x: 360, y: 365 }) },
      { points: line({ x: 260, y: 225 }, { x: 220, y: 225 }) },
      { points: line({ x: 460, y: 225 }, { x: 500, y: 225 }) },
      { points: line({ x: 292, y: 157 }, { x: 264, y: 129 }) },
      { points: line({ x: 428, y: 293 }, { x: 456, y: 321 }) },
    ],
  },
  star: {
    strokes: [
      {
        points: poly([
          { x: 360, y: 120 },
          { x: 392, y: 205 },
          { x: 484, y: 205 },
          { x: 410, y: 258 },
          { x: 438, y: 342 },
          { x: 360, y: 290 },
          { x: 282, y: 342 },
          { x: 310, y: 258 },
          { x: 236, y: 205 },
          { x: 328, y: 205 },
          { x: 360, y: 120 },
        ]),
      },
    ],
  },
  chair: {
    strokes: [
      {
        points: poly([
          { x: 300, y: 290 },
          { x: 430, y: 290 },
          { x: 430, y: 240 },
          { x: 300, y: 240 },
          { x: 300, y: 290 },
        ]),
      },
      { points: line({ x: 315, y: 240 }, { x: 315, y: 140 }) },
      { points: line({ x: 415, y: 240 }, { x: 415, y: 140 }) },
      { points: line({ x: 320, y: 290 }, { x: 320, y: 345 }) },
      { points: line({ x: 410, y: 290 }, { x: 410, y: 345 }) },
    ],
  },
  shoe: {
    strokes: [
      {
        points: poly([
          { x: 250, y: 285 },
          { x: 440, y: 285 },
          { x: 470, y: 300 },
          { x: 490, y: 320 },
          { x: 250, y: 320 },
          { x: 250, y: 285 },
        ]),
      },
      { points: line({ x: 305, y: 292 }, { x: 365, y: 292 }) },
      { points: line({ x: 305, y: 301 }, { x: 365, y: 301 }) },
      { points: line({ x: 305, y: 310 }, { x: 365, y: 310 }) },
    ],
  },
  guitar: {
    strokes: [
      { points: circle(325, 250, 58) },
      { points: circle(390, 210, 46) },
      {
        points: poly([
          { x: 420, y: 130 },
          { x: 500, y: 90 },
          { x: 515, y: 125 },
          { x: 435, y: 165 },
          { x: 420, y: 130 },
        ]),
      },
      { points: line({ x: 440, y: 120 }, { x: 300, y: 285 }) },
    ],
  },
  backpack: {
    strokes: [
      {
        points: poly([
          { x: 280, y: 320 },
          { x: 450, y: 320 },
          { x: 450, y: 160 },
          { x: 280, y: 160 },
          { x: 280, y: 320 },
        ]),
      },
      { points: arc(365, 160, 45, Math.PI, Math.PI * 2) },
      {
        points: poly([
          { x: 325, y: 250 },
          { x: 405, y: 250 },
          { x: 405, y: 285 },
          { x: 325, y: 285 },
          { x: 325, y: 250 },
        ]),
      },
    ],
  },
  camera: {
    strokes: [
      {
        points: poly([
          { x: 255, y: 300 },
          { x: 465, y: 300 },
          { x: 465, y: 190 },
          { x: 255, y: 190 },
          { x: 255, y: 300 },
        ]),
      },
      { points: circle(360, 245, 42) },
      {
        points: poly([
          { x: 300, y: 190 },
          { x: 340, y: 160 },
          { x: 390, y: 160 },
          { x: 420, y: 190 },
        ]),
      },
    ],
  },
  rocket: {
    strokes: [
      {
        points: poly([
          { x: 360, y: 120 },
          { x: 410, y: 220 },
          { x: 360, y: 355 },
          { x: 310, y: 220 },
          { x: 360, y: 120 },
        ]),
      },
      { points: circle(360, 230, 20) },
      {
        points: poly([
          { x: 310, y: 260 },
          { x: 265, y: 305 },
          { x: 315, y: 305 },
        ]),
      },
      {
        points: poly([
          { x: 410, y: 260 },
          { x: 455, y: 305 },
          { x: 405, y: 305 },
        ]),
      },
    ],
  },
  butterfly: {
    strokes: [
      { points: circle(360, 240, 10) },
      { points: circle(315, 220, 52) },
      { points: circle(405, 220, 52) },
      { points: circle(325, 280, 42) },
      { points: circle(395, 280, 42) },
      { points: line({ x: 355, y: 220 }, { x: 338, y: 185 }) },
      { points: line({ x: 365, y: 220 }, { x: 382, y: 185 }) },
    ],
  },
  hamburger: {
    strokes: [
      { points: arc(360, 260, 120, Math.PI, Math.PI * 2) },
      { points: line({ x: 240, y: 260 }, { x: 480, y: 260 }) },
      { points: line({ x: 250, y: 290 }, { x: 470, y: 290 }) },
      { points: arc(360, 312, 120, 0, Math.PI) },
    ],
  },
  basketball: {
    strokes: [
      { points: circle(360, 240, 95) },
      { points: line({ x: 265, y: 240 }, { x: 455, y: 240 }) },
      { points: line({ x: 360, y: 145 }, { x: 360, y: 335 }) },
      { points: arc(360, 240, 95, Math.PI * 0.4, Math.PI * 1.6) },
      { points: arc(360, 240, 95, Math.PI * -0.6, Math.PI * 0.6) },
    ],
  },
  candle: {
    strokes: [
      {
        points: poly([
          { x: 325, y: 330 },
          { x: 395, y: 330 },
          { x: 395, y: 185 },
          { x: 325, y: 185 },
          { x: 325, y: 330 },
        ]),
      },
      { points: arc(360, 175, 16, Math.PI * 0.9, Math.PI * 2.1) },
      {
        points: poly([
          { x: 360, y: 155 },
          { x: 345, y: 120 },
          { x: 360, y: 95 },
          { x: 375, y: 120 },
          { x: 360, y: 155 },
        ]),
      },
    ],
  },
  clock: {
    strokes: [
      { points: circle(360, 240, 100) },
      { points: line({ x: 360, y: 240 }, { x: 360, y: 180 }) },
      { points: line({ x: 360, y: 240 }, { x: 405, y: 260 }) },
    ],
  },
  airplane: {
    strokes: [
      {
        points: poly([
          { x: 230, y: 240 },
          { x: 500, y: 240 },
        ]),
      },
      {
        points: poly([
          { x: 315, y: 240 },
          { x: 390, y: 175 },
          { x: 395, y: 175 },
          { x: 355, y: 240 },
        ]),
      },
      {
        points: poly([
          { x: 350, y: 240 },
          { x: 395, y: 315 },
          { x: 390, y: 315 },
          { x: 325, y: 240 },
        ]),
      },
      {
        points: poly([
          { x: 230, y: 240 },
          { x: 260, y: 220 },
          { x: 260, y: 260 },
          { x: 230, y: 240 },
        ]),
      },
    ],
  },
  lighthouse: {
    strokes: [
      {
        points: poly([
          { x: 320, y: 330 },
          { x: 400, y: 330 },
          { x: 380, y: 160 },
          { x: 340, y: 160 },
          { x: 320, y: 330 },
        ]),
      },
      {
        points: poly([
          { x: 330, y: 160 },
          { x: 390, y: 160 },
          { x: 390, y: 130 },
          { x: 330, y: 130 },
          { x: 330, y: 160 },
        ]),
      },
      { points: line({ x: 390, y: 145 }, { x: 450, y: 125 }) },
      { points: line({ x: 330, y: 145 }, { x: 270, y: 125 }) },
    ],
  },
  windmill: {
    strokes: [
      { points: line({ x: 360, y: 230 }, { x: 360, y: 340 }) },
      {
        points: poly([
          { x: 360, y: 230 },
          { x: 450, y: 190 },
          { x: 360, y: 205 },
        ]),
      },
      {
        points: poly([
          { x: 360, y: 230 },
          { x: 390, y: 320 },
          { x: 350, y: 245 },
        ]),
      },
      {
        points: poly([
          { x: 360, y: 230 },
          { x: 270, y: 270 },
          { x: 345, y: 240 },
        ]),
      },
      {
        points: poly([
          { x: 360, y: 230 },
          { x: 330, y: 140 },
          { x: 370, y: 215 },
        ]),
      },
    ],
  },
  toothbrush: {
    strokes: [
      {
        points: poly([
          { x: 220, y: 280 },
          { x: 470, y: 280 },
          { x: 470, y: 305 },
          { x: 220, y: 305 },
          { x: 220, y: 280 },
        ]),
      },
      { points: line({ x: 460, y: 280 }, { x: 460, y: 250 }) },
      { points: line({ x: 445, y: 280 }, { x: 445, y: 252 }) },
      { points: line({ x: 430, y: 280 }, { x: 430, y: 254 }) },
    ],
  },
  headphones: {
    strokes: [
      { points: arc(360, 230, 100, Math.PI, Math.PI * 2) },
      {
        points: poly([
          { x: 255, y: 220 },
          { x: 285, y: 220 },
          { x: 285, y: 285 },
          { x: 255, y: 285 },
          { x: 255, y: 220 },
        ]),
      },
      {
        points: poly([
          { x: 435, y: 220 },
          { x: 465, y: 220 },
          { x: 465, y: 285 },
          { x: 435, y: 285 },
          { x: 435, y: 220 },
        ]),
      },
    ],
  },
  microscope: {
    strokes: [
      { points: line({ x: 300, y: 325 }, { x: 455, y: 325 }) },
      { points: line({ x: 360, y: 315 }, { x: 330, y: 235 }) },
      {
        points: poly([
          { x: 335, y: 238 },
          { x: 405, y: 182 },
          { x: 420, y: 202 },
          { x: 350, y: 258 },
          { x: 335, y: 238 },
        ]),
      },
      { points: arc(390, 292, 42, Math.PI * 1.1, Math.PI * 2) },
    ],
  },
  skateboard: {
    strokes: [
      { points: arc(360, 270, 130, Math.PI * 0.15, Math.PI * 0.85) },
      { points: line({ x: 245, y: 290 }, { x: 475, y: 290 }) },
      { points: circle(285, 305, 16) },
      { points: circle(435, 305, 16) },
    ],
  },
  submarine: {
    strokes: [
      { points: arc(350, 285, 115, Math.PI, Math.PI * 2) },
      { points: line({ x: 235, y: 285 }, { x: 465, y: 285 }) },
      {
        points: poly([
          { x: 320, y: 285 },
          { x: 320, y: 235 },
          { x: 390, y: 235 },
          { x: 390, y: 285 },
        ]),
      },
      { points: circle(350, 265, 9) },
      { points: circle(380, 265, 9) },
    ],
  },
  dragon: {
    strokes: [
      {
        points: poly([
          { x: 250, y: 280 },
          { x: 320, y: 210 },
          { x: 395, y: 205 },
          { x: 455, y: 235 },
          { x: 420, y: 295 },
          { x: 330, y: 305 },
          { x: 250, y: 280 },
        ]),
      },
      {
        points: poly([
          { x: 395, y: 205 },
          { x: 430, y: 165 },
          { x: 442, y: 205 },
        ]),
      },
      {
        points: poly([
          { x: 335, y: 210 },
          { x: 300, y: 165 },
          { x: 295, y: 215 },
        ]),
      },
      { points: line({ x: 452, y: 243 }, { x: 500, y: 215 }) },
    ],
  },
  firetruck: {
    strokes: [
      {
        points: poly([
          { x: 220, y: 290 },
          { x: 470, y: 290 },
          { x: 470, y: 220 },
          { x: 220, y: 220 },
          { x: 220, y: 290 },
        ]),
      },
      {
        points: poly([
          { x: 470, y: 290 },
          { x: 525, y: 290 },
          { x: 525, y: 245 },
          { x: 470, y: 245 },
        ]),
      },
      { points: line({ x: 250, y: 220 }, { x: 425, y: 170 }) },
      { points: circle(285, 300, 20) },
      { points: circle(455, 300, 20) },
    ],
  },
  "hot air balloon": {
    strokes: [
      { points: circle(360, 180, 90) },
      { points: line({ x: 315, y: 250 }, { x: 335, y: 305 }) },
      { points: line({ x: 405, y: 250 }, { x: 385, y: 305 }) },
      {
        points: poly([
          { x: 330, y: 305 },
          { x: 390, y: 305 },
          { x: 390, y: 340 },
          { x: 330, y: 340 },
          { x: 330, y: 305 },
        ]),
      },
    ],
  },
}

function fallbackProgram(seedWord: string): SketchProgram {
  const seed = seedWord
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const cx = 320 + (seed % 80)
  const cy = 180 + (seed % 120)
  return {
    strokes: [
      { points: circle(cx, cy, 70 + (seed % 20)) },
      {
        points: line(
          { x: cx - 130, y: cy + 110 },
          { x: cx + 130, y: cy + 110 }
        ),
      },
      {
        points: poly([
          { x: cx - 50, y: cy + 110 },
          { x: cx, y: cy + 150 },
          { x: cx + 50, y: cy + 110 },
        ]),
      },
    ],
  }
}

export function getSketchProgram(word: string): SketchProgram {
  const normalized = word.toLowerCase().trim()
  return PROGRAMS[normalized] ?? fallbackProgram(normalized)
}
