import type { Point } from '@glyph-weaver/core'

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function roundness(
  points: Point[],
  center: Point,
  radius: number,
): number {
  if (points.length < 4) return 0
  if (radius <= 0) return 0

  const distances: number[] = new Array(points.length)
  for (let i = 0; i < points.length; i++) {
    distances[i] = distance(points[i]!, center) / radius
  }

  let sum = 0
  for (let i = 0; i < distances.length; i++) {
    sum += distances[i]!
  }
  const mean = sum / distances.length

  let variance = 0
  for (let i = 0; i < distances.length; i++) {
    const diff = distances[i]! - mean
    variance += diff * diff
  }
  variance /= distances.length

  const circularity = Math.max(0, 1 - Math.sqrt(variance))
  const amplitude = Math.sqrt(variance)

  return 1 / (1 + amplitude) * circularity
}

export function smoothness(points: Point[]): number {
  if (points.length < 4) return 0

  let totalCurvature = 0
  let count = 0

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!
    const curr = points[i]!
    const next = points[i + 1]!

    const v1x = curr.x - prev.x
    const v1y = curr.y - prev.y
    const v2x = next.x - curr.x
    const v2y = next.y - curr.y

    const len1 = Math.sqrt(v1x * v1x + v1y * v1y)
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y)

    if (len1 < 1e-10 || len2 < 1e-10) continue

    const dot = (v1x * v2x + v1y * v2y) / (len1 * len2)
    const clamped = Math.max(-1, Math.min(1, dot))
    const angle = Math.acos(clamped)

    totalCurvature += angle
    count++
  }

  if (count === 0) return 0
  const avgCurvature = totalCurvature / count
  return Math.max(0, 1 - avgCurvature / Math.PI)
}

export function computeNeatness(
  points: Point[],
  center: Point,
  radius: number,
): number {
  const r = roundness(points, center, radius)
  const s = smoothness(points)
  return 0.6 * r + 0.4 * s
}
