import type { Point, RingCandidate } from '@glyph-weaver/core'
import type { CleanedStroke } from './stroke-capture.js'
import { roundness, smoothness, computeNeatness } from './ring-metrics.js'

interface CircleFit {
  center: Point
  radius: number
  error: number
}

function fitCircleLeastSquares(points: Point[]): CircleFit {
  if (points.length < 3) {
    return { center: { x: 0, y: 0 }, radius: 0, error: Infinity }
  }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0
  let sumX3 = 0
  let sumY3 = 0
  let sumX2Y = 0
  let sumXY2 = 0
  let sumZ = 0
  let sumZX = 0
  let sumZY = 0
  const n = points.length

  for (let i = 0; i < n; i++) {
    const p = points[i]!
    const x = p.x
    const y = p.y
    const z = x * x + y * y
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
    sumX3 += x * x * x
    sumY3 += y * y * y
    sumX2Y += x * x * y
    sumXY2 += x * y * y
    sumZ += z
    sumZX += z * x
    sumZY += z * y
  }

  const a11 = 2 * (sumX2 - sumX * sumX / n)
  const a12 = 2 * (sumXY - sumX * sumY / n)
  const a21 = 2 * (sumXY - sumX * sumY / n)
  const a22 = 2 * (sumY2 - sumY * sumY / n)

  const b1 = sumX3 + sumXY2 - sumX * sumZ / n - sumX * (sumX2 + sumY2) / n + (sumX2 + sumY2) * sumX / n
  const b2 = sumX2Y + sumY3 - sumY * sumZ / n - sumY * (sumX2 + sumY2) / n + (sumX2 + sumY2) * sumY / n

  const det = a11 * a22 - a12 * a21
  if (Math.abs(det) < 1e-12) {
    const cx = sumX / n
    const cy = sumY / n
    let rSum = 0
    for (let i = 0; i < n; i++) {
      const dx = points[i]!.x - cx
      const dy = points[i]!.y - cy
      rSum += Math.sqrt(dx * dx + dy * dy)
    }
    return { center: { x: cx, y: cy }, radius: rSum / n, error: 0 }
  }

  const cx = (a22 * b1 - a12 * b2) / det
  const cy = (-a21 * b1 + a11 * b2) / det

  let totalRadius = 0
  let totalError = 0
  for (let i = 0; i < n; i++) {
    const dx = points[i]!.x - cx
    const dy = points[i]!.y - cy
    const r = Math.sqrt(dx * dx + dy * dy)
    totalRadius += r
  }
  const radius = totalRadius / n

  for (let i = 0; i < n; i++) {
    const dx = points[i]!.x - cx
    const dy = points[i]!.y - cy
    const diff = Math.abs(Math.sqrt(dx * dx + dy * dy) - radius)
    totalError += diff * diff
  }
  const error = Math.sqrt(totalError / n) / radius

  return { center: { x: cx, y: cy }, radius, error }
}

export function detectRing(
  strokes: CleanedStroke[],
): RingCandidate {
  if (strokes.length === 0) {
    return createEmptyRing()
  }

  const allPoints: Point[] = []
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i]!
    for (let j = 0; j < s.points.length; j++) {
      allPoints.push(s.points[j]!)
    }
  }

  if (allPoints.length < 8) {
    return { ...createEmptyRing(), found: false }
  }

  const fit = fitCircleLeastSquares(allPoints)
  if (fit.radius <= 0 || fit.radius > 10 || fit.error > 0.5) {
    return { ...createEmptyRing(), found: false }
  }

  const r = roundness(allPoints, fit.center, fit.radius)
  if (r < 0.3) {
    return { ...createEmptyRing(), found: false }
  }

  const completeness = detectCompleteness(allPoints, fit.center)
  const ringStrokeIds: string[] = []
  const threshold = fit.radius * 0.3

  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i]!
    let nearRing = 0
    for (let j = 0; j < s.points.length; j++) {
      const dx = s.points[j]!.x - fit.center.x
      const dy = s.points[j]!.y - fit.center.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (Math.abs(dist - fit.radius) < threshold) {
        nearRing++
      }
    }
    if (nearRing > s.points.length * 0.3) {
      ringStrokeIds.push(s.id)
    }
  }

  const s = smoothness(allPoints)

  return {
    found: true,
    center: fit.center,
    radius: fit.radius,
    complete: completeness.complete,
    activationEvent: false,
    completeness: completeness.completeness,
    strokeIds: ringStrokeIds,
    gap: completeness.gap,
    gapArcLength: completeness.gapArcLength,
    coverageRatio: completeness.coverageRatio,
    roundness: r,
    lineSmoothness: s,
    neatness: computeNeatness(allPoints, fit.center, fit.radius),
    overdrawAmount: computeOverdraw(allPoints, fit.center, fit.radius, fit.error),
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
  }
}

function createEmptyRing(): RingCandidate {
  return {
    found: false,
    center: null,
    radius: 0,
    complete: false,
    activationEvent: false,
    completeness: 0,
    strokeIds: [],
    gap: 0,
    gapArcLength: 0,
    coverageRatio: 0,
    roundness: 0,
    lineSmoothness: 0,
    neatness: 0,
    overdrawAmount: 0,
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
  }
}

export function detectCompleteness(
  points: Point[],
  center: Point,
): { complete: boolean; completeness: number; gap: number; gapArcLength: number; coverageRatio: number } {
  if (points.length < 3) {
    return { complete: false, completeness: 0, gap: 360, gapArcLength: 0, coverageRatio: 0 }
  }

  const angles: number[] = []
  for (let i = 0; i < points.length; i++) {
    const dx = points[i]!.x - center.x
    const dy = points[i]!.y - center.y
    if (Math.abs(dx) < 1e-8 && Math.abs(dy) < 1e-8) continue
    angles.push(Math.atan2(dy, dx) * (180 / Math.PI))
  }

  if (angles.length < 2) {
    return { complete: false, completeness: 0, gap: 360, gapArcLength: 0, coverageRatio: 0 }
  }

  angles.sort((a, b) => a - b)

  let maxGap = 0
  for (let i = 1; i < angles.length; i++) {
    const gap = angles[i]! - angles[i - 1]!
    if (gap > maxGap) maxGap = gap
  }
  const wrapGap = 360 - angles[angles.length - 1]! + angles[0]!
  if (wrapGap > maxGap) maxGap = wrapGap

  const gapRad = (maxGap * Math.PI) / 180
  let avgRadius = 0
  for (let i = 0; i < points.length; i++) {
    const dx = points[i]!.x - center.x
    const dy = points[i]!.y - center.y
    avgRadius += Math.sqrt(dx * dx + dy * dy)
  }
  avgRadius /= points.length

  const gapArcLength = gapRad * avgRadius
  const completeness = Math.max(0, Math.min(1, (360 - maxGap) / 360))
  const coverageRatio = 1 - maxGap / 360

  return {
    complete: maxGap < 15,
    completeness,
    gap: maxGap,
    gapArcLength,
    coverageRatio,
  }
}

export function computeRingQuality(ring: {
  center: Point
  radius: number
  points: Point[]
}): { roundness: number; lineSmoothness: number; neatness: number; overdrawAmount: number } {
  const r = roundness(ring.points, ring.center, ring.radius)
  const s = smoothness(ring.points)
  const n = computeNeatness(ring.points, ring.center, ring.radius)
  const o = computeOverdraw(ring.points, ring.center, ring.radius, 0)

  return {
    roundness: r,
    lineSmoothness: s,
    neatness: n,
    overdrawAmount: o,
  }
}

function computeOverdraw(
  points: Point[],
  _center: Point,
  radius: number,
  error: number,
): number {
  if (points.length < 2) return 0

  let totalLength = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x
    const dy = points[i]!.y - points[i - 1]!.y
    totalLength += Math.sqrt(dx * dx + dy * dy)
  }

  const expectedCircumference = 2 * Math.PI * radius
  if (expectedCircumference <= 0) return 0

  const ratio = totalLength / expectedCircumference
  return Math.max(0, ratio - 1) * (1 + error)
}

export function detectMultipleRings(
  strokes: CleanedStroke[],
  primaryRing: RingCandidate,
): { unsupportedMultipleRings: RingCandidate[]; unsupportedNestedRings: RingCandidate[] } {
  if (strokes.length < 4 || !primaryRing.found || primaryRing.center === null) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [] }
  }

  const remainingStrokes = strokes.filter((s) => !primaryRing.strokeIds.includes(s.id))
  if (remainingStrokes.length < 3) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [] }
  }

  const allRemainingPoints: Point[] = []
  for (let i = 0; i < remainingStrokes.length; i++) {
    for (let j = 0; j < remainingStrokes[i]!.points.length; j++) {
      allRemainingPoints.push(remainingStrokes[i]!.points[j]!)
    }
  }

  if (allRemainingPoints.length < 8) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [] }
  }

  const fit = fitCircleLeastSquares(allRemainingPoints)
  if (fit.radius <= 0 || fit.error > 0.4) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [] }
  }

  const r = roundness(allRemainingPoints, fit.center, fit.radius)
  if (r < 0.3) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [] }
  }

  const completeness = detectCompleteness(allRemainingPoints, fit.center)
  const ringIds: string[] = []
  const threshold = fit.radius * 0.25

  for (let i = 0; i < remainingStrokes.length; i++) {
    const s = remainingStrokes[i]!
    let nearRing = 0
    for (let j = 0; j < s.points.length; j++) {
      const dx = s.points[j]!.x - fit.center.x
      const dy = s.points[j]!.y - fit.center.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (Math.abs(dist - fit.radius) < threshold) {
        nearRing++
      }
    }
    if (nearRing > s.points.length * 0.3) {
      ringIds.push(s.id)
    }
  }

  const distFromPrimary = Math.sqrt(
    (fit.center.x - primaryRing.center.x) ** 2 + (fit.center.y - primaryRing.center.y) ** 2,
  )

  const additionalRing: RingCandidate = {
    found: true,
    center: fit.center,
    radius: fit.radius,
    complete: completeness.complete,
    activationEvent: false,
    completeness: completeness.completeness,
    strokeIds: ringIds,
    gap: completeness.gap,
    gapArcLength: completeness.gapArcLength,
    coverageRatio: completeness.coverageRatio,
    roundness: r,
    lineSmoothness: smoothness(allRemainingPoints),
    neatness: computeNeatness(allRemainingPoints, fit.center, fit.radius),
    overdrawAmount: computeOverdraw(allRemainingPoints, fit.center, fit.radius, fit.error),
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
  }

  if (distFromPrimary < primaryRing.radius * 0.3) {
    return { unsupportedMultipleRings: [], unsupportedNestedRings: [additionalRing] }
  }

  return { unsupportedMultipleRings: [additionalRing], unsupportedNestedRings: [] }
}

export function detectActivation(
  strokeHistory: { strokes: { points: Point[] }[]; timestamp: number }[],
): boolean {
  if (strokeHistory.length < 2) return false

  const latest = strokeHistory[strokeHistory.length - 1]!
  const previous = strokeHistory[strokeHistory.length - 2]!

  function isClosed(strokes: { points: Point[] }[]): boolean {
    if (strokes.length === 0) return false
    const allPoints: Point[] = []
    for (let i = 0; i < strokes.length; i++) {
      for (let j = 0; j < strokes[i]!.points.length; j++) {
        allPoints.push(strokes[i]!.points[j]!)
      }
    }
    if (allPoints.length < 2) return false
    const first = allPoints[0]!
    const last = allPoints[allPoints.length - 1]!
    const dx = first.x - last.x
    const dy = first.y - last.y
    return Math.sqrt(dx * dx + dy * dy) < 0.05
  }

  const prevClosed = isClosed(previous.strokes)
  const currClosed = isClosed(latest.strokes)

  return !prevClosed && currClosed
}
