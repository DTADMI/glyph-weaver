import type { Direction3D } from '@glyph-weaver/core'

export function screenDirection(direction3D: Direction3D): { x: number; y: number; length: number } {
  const x = direction3D.x
  const y = direction3D.y
  const length = Math.sqrt(x * x + y * y)
  if (length < 1e-9) {
    return { x: 0, y: 0, length: 0 }
  }
  return { x: x / length, y: y / length, length }
}

export function applyTilt(x: number, y: number, tiltDeg: number): { x: number; y: number } {
  if (tiltDeg === 0) {
    return { x, y }
  }
  const tiltRad = (tiltDeg * Math.PI) / 180
  const cosT = Math.cos(tiltRad)
  const sinT = Math.sin(tiltRad)
  const tiltedX = x * cosT - y * sinT
  const tiltedY = x * sinT + y * cosT
  return { x: tiltedX, y: tiltedY }
}

export function project3Dto2D(
  point3D: { x: number; y: number; z: number },
  camera: { fov: number; near: number; far: number },
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number; depth: number } {
  const fovRad = (camera.fov * Math.PI) / 180
  const f = 1.0 / Math.tan(fovRad / 2)
  const rangeInv = 1.0 / (camera.far - camera.near)

  const clipX = f * point3D.x
  const clipY = f * point3D.y * (viewportWidth / viewportHeight)
  const clipZ = -(camera.far + camera.near) * rangeInv * point3D.z - 2 * camera.far * camera.near * rangeInv

  if (Math.abs(point3D.z) < 1e-9) {
    return {
      x: point3D.x * viewportWidth * 0.5 + viewportWidth * 0.5,
      y: -point3D.y * viewportHeight * 0.5 + viewportHeight * 0.5,
      depth: point3D.z,
    }
  }

  const w = -point3D.z
  const ndcX = clipX / w
  const ndcY = clipY / w

  return {
    x: (ndcX * 0.5 + 0.5) * viewportWidth,
    y: (-ndcY * 0.5 + 0.5) * viewportHeight,
    depth: clipZ / w,
  }
}
