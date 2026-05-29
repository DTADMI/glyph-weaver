import type { Point } from '@glyph-weaver/core'
import type { CleanedStroke } from './stroke-capture.js'

class UnionFind {
  parent: number[]
  rank: number[]

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n)
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
      this.rank[i] = 0
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]!)
    }
    return this.parent[x]!
  }

  union(a: number, b: number): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return
    if (this.rank[ra]! < this.rank[rb]!) {
      this.parent[ra] = rb
    } else if (this.rank[ra]! > this.rank[rb]!) {
      this.parent[rb] = ra
    } else {
      this.parent[rb] = ra
      this.rank[ra] = (this.rank[ra] ?? 0) + 1
    }
  }

  groups(): number[][] {
    const map = new Map<number, number[]>()
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i)
      const group = map.get(root)
      if (group) {
        group.push(i)
      } else {
        map.set(root, [i])
      }
    }
    return Array.from(map.values())
  }
}

function strokeDistance(a: CleanedStroke, b: CleanedStroke): number {
  const dx = a.center.x - b.center.x
  const dy = a.center.y - b.center.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function connectedComponents(
  strokes: CleanedStroke[],
  distanceThreshold: number,
): number[][] {
  if (strokes.length === 0) return []
  if (strokes.length === 1) return [[0]]

  const uf = new UnionFind(strokes.length)

  for (let i = 0; i < strokes.length; i++) {
    for (let j = i + 1; j < strokes.length; j++) {
      if (strokeDistance(strokes[i]!, strokes[j]!) < distanceThreshold) {
        uf.union(i, j)
      }
    }
  }

  return uf.groups()
}

export function segmentStrokes(
  strokes: CleanedStroke[],
  eps: number,
  minPts: number,
): number[][] {
  if (strokes.length === 0) return []

  const visited = new Array(strokes.length).fill(false)
  const noise = new Array(strokes.length).fill(false)
  const clusters: number[][] = []

  function regionQuery(idx: number): number[] {
    const neighbors: number[] = []
    for (let i = 0; i < strokes.length; i++) {
      if (i === idx) continue
      if (strokeDistance(strokes[idx]!, strokes[i]!) < eps) {
        neighbors.push(i)
      }
    }
    return neighbors
  }

  function expandCluster(idx: number, neighbors: number[]): number[] {
    const cluster: number[] = [idx]
    visited[idx] = true

    let i = 0
    while (i < neighbors.length) {
      const ni = neighbors[i]!
      if (!visited[ni]) {
        visited[ni] = true
        const nn = regionQuery(ni)
        if (nn.length >= minPts) {
          for (let j = 0; j < nn.length; j++) {
            if (!neighbors.includes(nn[j]!)) {
              neighbors.push(nn[j]!)
            }
          }
        }
      }
      if (!noise[ni]) {
        cluster.push(ni)
      }
      i++
    }

    return cluster
  }

  for (let i = 0; i < strokes.length; i++) {
    if (visited[i]) continue
    visited[i] = true

    const neighbors = regionQuery(i)
    if (neighbors.length < minPts) {
      noise[i] = true
    } else {
      clusters.push(expandCluster(i, neighbors))
    }
  }

  return clusters
}

export function computeBounds(strokes: CleanedStroke[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let i = 0; i < strokes.length; i++) {
    const b = strokes[i]!.bounds
    if (b.minX < minX) minX = b.minX
    if (b.minY < minY) minY = b.minY
    if (b.maxX > maxX) maxX = b.maxX
    if (b.maxY > maxY) maxY = b.maxY
  }

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function computeCentroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 }
  let sumX = 0
  let sumY = 0
  for (let i = 0; i < points.length; i++) {
    sumX += points[i]!.x
    sumY += points[i]!.y
  }
  return { x: sumX / points.length, y: sumY / points.length }
}
