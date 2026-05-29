import type { Point } from '@glyph-weaver/core'

export interface CleanedStroke {
  id: string
  points: Point[]
  rawPoints: Point[]
  center: { x: number; y: number }
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }
}

export function normalizeStroke(points: Point[]): Point[] {
  if (points.length === 0) return []
  if (points.length === 1) return [{ x: 0, y: 0 }]

  let sumX = 0
  let sumY = 0
  for (let i = 0; i < points.length; i++) {
    sumX += points[i]!.x
    sumY += points[i]!.y
  }
  const meanX = sumX / points.length
  const meanY = sumY / points.length

  const centered: Point[] = new Array(points.length)
  for (let i = 0; i < points.length; i++) {
    centered[i] = { x: points[i]!.x - meanX, y: points[i]!.y - meanY }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < centered.length; i++) {
    const p = centered[i]!
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = Math.max(rangeX, rangeY)

  const result: Point[] = []
  for (let i = 0; i < centered.length; i++) {
    const scaled: Point = { x: centered[i]!.x / scale, y: centered[i]!.y / scale }
    if (result.length === 0) {
      result.push(scaled)
      continue
    }
    const last = result[result.length - 1]!
    const dx = scaled.x - last.x
    const dy = scaled.y - last.y
    if (dx * dx + dy * dy > 1e-10) {
      result.push(scaled)
    }
  }

  return result
}

export function smoothStroke(points: Point[]): Point[] {
  if (points.length < 3) return points.map((p) => ({ ...p }))

  const windowSize = 3
  const half = Math.floor(windowSize / 2)
  const result: Point[] = new Array(points.length)

  for (let i = 0; i < points.length; i++) {
    let sumX = 0
    let sumY = 0
    let count = 0
    const start = Math.max(0, i - half)
    const end = Math.min(points.length - 1, i + half)
    for (let j = start; j <= end; j++) {
      sumX += points[j]!.x
      sumY += points[j]!.y
      count++
    }
    result[i] = { x: sumX / count, y: sumY / count }
  }

  return result
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const len = dx * dx + dy * dy
  if (len === 0) {
    const px = point.x - lineStart.x
    const py = point.y - lineStart.y
    return Math.sqrt(px * px + py * py)
  }
  return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / Math.sqrt(len)
}

export function simplifyStroke(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points.map((p) => ({ ...p }))

  let maxDist = 0
  let maxIdx = 0
  const first = points[0]!
  const last = points[points.length - 1]!

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i]!, first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyStroke(points.slice(0, maxIdx + 1), tolerance)
    const right = simplifyStroke(points.slice(maxIdx), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [{ x: first.x, y: first.y }, { x: last.x, y: last.y }]
}

export function computeCenterAndBounds(points: Point[]): {
  center: { x: number; y: number }
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number }
} {
  if (points.length === 0) {
    return {
      center: { x: 0, y: 0 },
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let sumX = 0
  let sumY = 0

  for (let i = 0; i < points.length; i++) {
    const p = points[i]!
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
    sumX += p.x
    sumY += p.y
  }

  return {
    center: { x: sumX / points.length, y: sumY / points.length },
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  }
}
