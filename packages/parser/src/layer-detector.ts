import type { Point, LayerLabel } from '@glyph-weaver/core'

export function detectLayer(
  candidateCenter: Point,
  ringCenter: Point,
  ringRadius: number,
): LayerLabel {
  if (ringRadius <= 0) return 'unknown'

  const dist = computeRadiusNorm(candidateCenter, ringCenter, ringRadius)

  if (dist < 0.25) return 'center'
  if (dist < 0.75) return 'middle'
  return 'outer'
}

export function computeRadiusNorm(
  candidateCenter: Point,
  ringCenter: Point,
  ringRadius: number,
): number {
  if (ringRadius <= 0) return 0

  const dx = candidateCenter.x - ringCenter.x
  const dy = candidateCenter.y - ringCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  return Math.min(1, dist / ringRadius)
}

export function computeAngleDeg(
  candidateCenter: Point,
  ringCenter: Point,
): number {
  const dx = candidateCenter.x - ringCenter.x
  const dy = candidateCenter.y - ringCenter.y

  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return 0

  let angle = Math.atan2(dy, dx) * (180 / Math.PI)
  if (angle < 0) angle += 360
  return angle
}

export function computeOrientationDeg(strokes: Point[][]): number {
  if (strokes.length === 0) return 0

  const allPoints: Point[] = []
  for (let i = 0; i < strokes.length; i++) {
    const stroke = strokes[i]!
    for (let j = 0; j < stroke.length; j++) {
      allPoints.push(stroke[j]!)
    }
  }

  if (allPoints.length < 2) return 0

  let sumX = 0
  let sumY = 0
  for (let i = 0; i < allPoints.length; i++) {
    sumX += allPoints[i]!.x
    sumY += allPoints[i]!.y
  }
  const cx = sumX / allPoints.length
  const cy = sumY / allPoints.length

  let cov00 = 0
  let cov11 = 0
  let cov01 = 0
  for (let i = 0; i < allPoints.length; i++) {
    const dx = allPoints[i]!.x - cx
    const dy = allPoints[i]!.y - cy
    cov00 += dx * dx
    cov11 += dy * dy
    cov01 += dx * dy
  }

  if (Math.abs(cov00) < 1e-9 && Math.abs(cov01) < 1e-9) return 0

  const theta = 0.5 * Math.atan2(2 * cov01, cov00 - cov11)
  let deg = theta * (180 / Math.PI)
  if (deg < 0) deg += 180
  return deg
}
