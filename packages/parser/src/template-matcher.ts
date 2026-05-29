import type {
  Point,
  StrokeTemplate,
  StrokeTemplatePoint,
  SigilEntry,
  SignEntry,
  RecognitionConfig,
  SymbolCandidate,
} from '@glyph-weaver/core'

function rasterizeStrokes(
  strokes: Point[][],
  gridSize: number,
): number[][] {
  const grid: number[][] = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0))

  for (let si = 0; si < strokes.length; si++) {
    const points = strokes[si]!
    for (let i = 0; i < points.length; i++) {
      const gx = Math.round((points[i]!.x + 0.5) * (gridSize - 1))
      const gy = Math.round((points[i]!.y + 0.5) * (gridSize - 1))
      if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
        grid[gy]![gx] = 1
      }
    }

    for (let i = 1; i < points.length; i++) {
      const x0 = (points[i - 1]!.x + 0.5) * (gridSize - 1)
      const y0 = (points[i - 1]!.y + 0.5) * (gridSize - 1)
      const x1 = (points[i]!.x + 0.5) * (gridSize - 1)
      const y1 = (points[i]!.y + 0.5) * (gridSize - 1)

      const dx = Math.abs(x1 - x0)
      const dy = Math.abs(y1 - y0)
      const steps = Math.max(1, Math.ceil(Math.max(dx, dy)))

      for (let t = 0; t <= steps; t++) {
        const gx = Math.round(x0 + (t / steps) * (x1 - x0))
        const gy = Math.round(y0 + (t / steps) * (y1 - y0))
        if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
          grid[gy]![gx] = 1
        }
      }
    }
  }

  return grid
}

function dilateGrid(grid: number[][], maskRadius: number): number[][] {
  const size = grid.length
  const dilated: number[][] = Array.from({ length: size }, () => new Array(size).fill(0))

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y]![x] === 1) {
        for (let dy = -maskRadius; dy <= maskRadius; dy++) {
          for (let dx = -maskRadius; dx <= maskRadius; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
              dilated[ny]![nx] = 1
            }
          }
        }
      }
    }
  }

  return dilated
}

function computeInkOverlap(gridA: number[][], gridB: number[][]): number {
  const size = gridA.length
  let overlap = 0
  let total = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = gridA[y]![x]!
      const b = gridB[y]![x]!
      if (a === 1 && b === 1) overlap++
      if (a === 1 || b === 1) total++
    }
  }

  if (total === 0) return 0
  return overlap / total
}

function templateToPoints(template: StrokeTemplate): Point[][] {
  return template.strokes.map((stroke) =>
    stroke.map((pt: StrokeTemplatePoint) => ({
      x: pt.x * 2 - 1,
      y: pt.y * 2 - 1,
    })),
  )
}

export function templateMatch(
  candidate: Point[][],
  template: StrokeTemplate,
  gridSize: number,
  maskRadius: number,
): number {
  const candGrid = rasterizeStrokes(candidate, gridSize)
  const candDilated = dilateGrid(candGrid, maskRadius)

  const templatePoints = templateToPoints(template)
  const tmplGrid = rasterizeStrokes(templatePoints, gridSize)
  const tmplDilated = dilateGrid(tmplGrid, maskRadius)

  const overlap = computeInkOverlap(candDilated, tmplDilated)

  let tmplInk = 0
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (tmplDilated[y]![x] === 1) tmplInk++
    }
  }

  let candCovered = 0
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (tmplDilated[y]![x] === 1 && candDilated[y]![x] === 1) candCovered++
    }
  }

  const coverage = tmplInk > 0 ? candCovered / tmplInk : 0
  return 0.5 * overlap + 0.5 * coverage
}

function rotatePoints(points: Point[][], angleRad: number): Point[][] {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  return points.map((stroke) =>
    stroke.map((p) => ({
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos,
    })),
  )
}

export function rotationInvariantMatch(
  candidate: Point[][],
  entry: SigilEntry | SignEntry,
  config: RecognitionConfig,
): number {
  const resolution = config.rotationResolution
  let bestScore = 0

  for (let i = 0; i < resolution; i++) {
    const angleRad = (i / resolution) * 2 * Math.PI
    const rotated = rotatePoints(candidate, angleRad)
    const score = templateMatch(rotated, entry.strokeTemplate, config.rasterGridSize, config.maskRadius)
    if (score > bestScore) {
      bestScore = score
    }
  }

  return bestScore
}

export function computeStructuralScore(
  candidate: SymbolCandidate,
  template: StrokeTemplate,
): number {
  let score = 0
  let weightSum = 0

  const templateStrokeCount = template.strokes.length
  const candidateStrokeCount = candidate.rawStrokeCount
  const strokeCountRatio = Math.min(candidateStrokeCount, templateStrokeCount) /
    Math.max(candidateStrokeCount, templateStrokeCount)
  score += strokeCountRatio * 0.3
  weightSum += 0.3

  const closednessDiff = Math.abs(candidate.closedness - computeTemplateClosedness(template))
  score += (1 - closednessDiff) * 0.2
  weightSum += 0.2

  const elongationScore = 0.2
  weightSum += elongationScore

  const aspectDiff = computeAspectDiff(candidate, template)
  score += (1 - aspectDiff) * 0.3
  weightSum += 0.3

  return weightSum > 0 ? score / weightSum : 0
}

function computeTemplateClosedness(template: StrokeTemplate): number {
  let closed = 0
  for (let i = 0; i < template.strokes.length; i++) {
    const stroke = template.strokes[i]!
    if (stroke.length < 2) continue
    const first = stroke[0]!
    const last = stroke[stroke.length - 1]!
    const dx = first.x - last.x
    const dy = first.y - last.y
    if (Math.sqrt(dx * dx + dy * dy) < 0.05) closed++
  }
  return template.strokes.length > 0 ? closed / template.strokes.length : 0
}

function computeAspectDiff(candidate: SymbolCandidate, template: StrokeTemplate): number {
  const candAspect = candidate.bounds.maxX - candidate.bounds.minX > 0
    ? (candidate.bounds.maxY - candidate.bounds.minY) / (candidate.bounds.maxX - candidate.bounds.minX)
    : 1

  const tmplAspect = template.sourceAspectRatio

  return Math.min(1, Math.abs(candAspect - tmplAspect) / Math.max(candAspect, tmplAspect, 1))
}

export function computeCompositionalScore(
  candidate: SymbolCandidate,
  template: StrokeTemplate,
): number {
  if (template.strokes.length === 0) return 0

  const countMatch = Math.min(candidate.rawStrokeCount, template.strokes.length) /
    Math.max(candidate.rawStrokeCount, template.strokes.length, 1)

  return countMatch * 0.5 + 0.5
}
