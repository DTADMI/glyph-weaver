import type { RecognizedSign, RingCandidate, Direction3D, DirectionMode } from '@glyph-weaver/core'

export interface DirectionResult {
  direction: Direction3D
  coherence: number
}

export function computeDirection(signs: RecognizedSign[], ring: RingCandidate): DirectionResult {
  const recognized = signs.filter((s) => s.recognized)

  if (recognized.length === 0) {
    return {
      direction: defaultDirection(),
      coherence: 0,
    }
  }

  const directionalModes: DirectionMode[] = ['position', 'orientation', 'inward']
  const results: { direction: Direction3D; coherence: number; weight: number }[] = []

  for (const mode of directionalModes) {
    const modeSigns = recognized.filter((s) => s.semantic.directionMode === mode)
    if (modeSigns.length === 0) {
      continue
    }

    const partial = computeDirectionForMode(modeSigns, ring, mode)
    results.push({
      direction: partial.direction,
      coherence: partial.coherence,
      weight: modeSigns.length,
    })
  }

  if (results.length === 0) {
    return { direction: defaultDirection(), coherence: 0 }
  }

  if (results.length === 1) {
    return { direction: results[0]!.direction, coherence: results[0]!.coherence }
  }

  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0)
  const x = results.reduce((sum, r) => sum + r.direction.x * r.weight, 0) / totalWeight
  const y = results.reduce((sum, r) => sum + r.direction.y * r.weight, 0) / totalWeight
  const z = results.reduce((sum, r) => sum + r.direction.z * r.weight, 0) / totalWeight
  const avgCoherence = results.reduce((sum, r) => sum + r.coherence * r.weight, 0) / totalWeight

  const len = Math.sqrt(x * x + y * y + z * z) || 1

  return {
    direction: {
      x: x / len,
      y: y / len,
      z: z / len,
      xTiltDeg: Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI),
      yTiltDeg: Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI),
      tiltFromZDeg: Math.acos(clamp(z / len, -1, 1)) * (180 / Math.PI),
    },
    coherence: avgCoherence,
  }
}

function computeDirectionForMode(
  signs: RecognizedSign[],
  ring: RingCandidate,
  mode: DirectionMode,
): { direction: Direction3D; coherence: number } {
  switch (mode) {
    case 'position':
      return computePositionDirection(signs, ring)
    case 'orientation':
      return computeOrientationDirection(signs)
    case 'inward':
      return computeInwardDirection(ring)
  }
}

function computePositionDirection(
  signs: RecognizedSign[],
  ring: RingCandidate,
): { direction: Direction3D; coherence: number } {
  if (signs.length === 0) {
    return { direction: defaultDirection(), coherence: 0 }
  }

  let totalX = 0
  let totalY = 0
  let totalWeight = 0

  for (const sign of signs) {
    const rad = sign.angleDeg * (Math.PI / 180)
    const weight = sign.confidence
    totalX += Math.cos(rad) * weight
    totalY += Math.sin(rad) * weight
    totalWeight += weight
  }

  const avgX = totalWeight > 0 ? totalX / totalWeight : 0
  const avgY = totalWeight > 0 ? totalY / totalWeight : 0

  const radius = ring.radius || 1
  const dx = avgX * radius
  const dy = avgY * radius

  const len = Math.sqrt(dx * dx + dy * dy + 1) || 1

  const angles = signs.map((s) => s.angleDeg * (Math.PI / 180))
  const coherence = computeCircularCoherence(angles)

  return {
    direction: {
      x: dx / len,
      y: dy / len,
      z: 1 / len,
      xTiltDeg: Math.atan2(dy, Math.sqrt(dx * dx + 1)) * (180 / Math.PI),
      yTiltDeg: Math.atan2(dx, Math.sqrt(dy * dy + 1)) * (180 / Math.PI),
      tiltFromZDeg: Math.acos(clamp(1 / len, -1, 1)) * (180 / Math.PI),
    },
    coherence,
  }
}

function computeOrientationDirection(
  signs: RecognizedSign[],
): { direction: Direction3D; coherence: number } {
  if (signs.length === 0) {
    return { direction: defaultDirection(), coherence: 0 }
  }

  let totalX = 0
  let totalY = 0
  let totalWeight = 0

  for (const sign of signs) {
    const rad = sign.semantic.manifestation ? (sign.angleDeg * Math.PI) / 180 : 0
    const dx = Math.cos(rad)
    const dy = Math.sin(rad)
    const weight = sign.confidence
    totalX += dx * weight
    totalY += dy * weight
    totalWeight += weight
  }

  const avgX = totalWeight > 0 ? totalX / totalWeight : 0
  const avgY = totalWeight > 0 ? totalY / totalWeight : 0

  const len = Math.sqrt(avgX * avgX + avgY * avgY + 1) || 1

  const angles = signs.map((s) => s.angleDeg * (Math.PI / 180))
  const coherence = computeCircularCoherence(angles)

  return {
    direction: {
      x: avgX / len,
      y: avgY / len,
      z: 1 / len,
      xTiltDeg: Math.atan2(avgY, Math.sqrt(avgX * avgX + 1)) * (180 / Math.PI),
      yTiltDeg: Math.atan2(avgX, Math.sqrt(avgY * avgY + 1)) * (180 / Math.PI),
      tiltFromZDeg: Math.acos(clamp(1 / len, -1, 1)) * (180 / Math.PI),
    },
    coherence,
  }
}

function computeInwardDirection(
  ring: RingCandidate,
): { direction: Direction3D; coherence: number } {
  const center = ring.center
  if (!center) {
    return { direction: defaultDirection(), coherence: 1 }
  }

  return {
    direction: {
      x: 0,
      y: 0,
      z: 1,
      xTiltDeg: 0,
      yTiltDeg: 0,
      tiltFromZDeg: 0,
    },
    coherence: 1,
  }
}

function computeCircularCoherence(angles: number[]): number {
  if (angles.length <= 1) {
    return 1
  }

  let sumSin = 0
  let sumCos = 0

  for (const a of angles) {
    sumSin += Math.sin(a)
    sumCos += Math.cos(a)
  }

  const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / angles.length
  return clamp(r, 0, 1)
}

function defaultDirection(): Direction3D {
  return {
    x: 0,
    y: 0,
    z: 1,
    xTiltDeg: 0,
    yTiltDeg: 0,
    tiltFromZDeg: 0,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
