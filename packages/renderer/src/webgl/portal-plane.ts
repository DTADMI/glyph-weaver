import type { RingCandidate } from '@glyph-weaver/core'
import type { Direction3D } from '@glyph-weaver/core'
import { applyTilt } from '../direction.js'

export interface PortalProjection {
  centerX: number
  centerY: number
  radiusX: number
  radiusY: number
  rotationDeg: number
  tiltDeg: number
}

export function projectPortal(
  ring: RingCandidate,
  direction?: Direction3D,
  centerX: number = 0,
  centerY: number = 0,
): PortalProjection {
  const cx = ring.center ? ring.center.x : 0
  const cy = ring.center ? ring.center.y : 0
  const radius = ring.radius

  if (!direction) {
    return {
      centerX: centerX + cx,
      centerY: centerY + cy,
      radiusX: radius,
      radiusY: radius,
      rotationDeg: 0,
      tiltDeg: 0,
    }
  }

  const tiltDeg = direction.tiltFromZDeg ?? 0
  const tiltRad = (tiltDeg * Math.PI) / 180
  const cosTilt = Math.cos(tiltRad)
  const radiusY = radius * cosTilt
  const radiusX = radius

  const angleDeg = Math.atan2(direction.y, direction.x) * (180 / Math.PI)
  const tilted = applyTilt(cx, cy, tiltDeg * 0.5)

  return {
    centerX: centerX + tilted.x,
    centerY: centerY + tilted.y,
    radiusX,
    radiusY: Math.max(radiusY, radius * 0.1),
    rotationDeg: angleDeg,
    tiltDeg,
  }
}

export function portalOutDirection(direction: Direction3D): { x: number; y: number } {
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
  if (length < 1e-9) {
    return { x: 0, y: -1 }
  }
  return {
    x: direction.x / length,
    y: direction.y / length,
  }
}
