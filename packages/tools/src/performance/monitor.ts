export interface FrameTiming {
  timestamp: number
  frameTimeMs: number
  fps: number
}

export interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface PerformanceReport {
  averageFPS: number
  minFPS: number
  maxFPS: number
  averageFrameTimeMs: number
  droppedFrames: number
  totalFrames: number
  elapsedTimeMs: number
  memoryPeak?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  eventCounts: Record<string, number>
}

export class PerformanceMonitor {
  private frameHistory: FrameTiming[] = []
  private memorySnapshots: MemorySnapshot[] = []
  private eventCounts: Map<string, number> = new Map()
  private startTime = 0
  private lastFrameTime = 0
  private enabled = false
  private readonly maxHistory = 600
  private readonly memoryInterval: ReturnType<typeof setInterval> | null = null
  private droppedFrameThresholdMs: number

  constructor(options: { droppedFrameThresholdMs?: number; memorySamplingIntervalMs?: number } = {}) {
    this.droppedFrameThresholdMs = options.droppedFrameThresholdMs ?? 33.34

    if (typeof performance !== 'undefined' && 'memory' in performance) {
      this.memoryInterval = setInterval(() => {
        this.sampleMemory()
      }, options.memorySamplingIntervalMs ?? 5000)
    }
  }

  start(): void {
    this.enabled = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.frameHistory = []
    this.memorySnapshots = []
    this.eventCounts.clear()
  }

  stop(): PerformanceReport {
    this.enabled = false
    return this.generateReport()
  }

  recordFrame(): void {
    if (!this.enabled) return
    const now = performance.now()
    const frameTimeMs = now - this.lastFrameTime
    const fps = frameTimeMs > 0 ? 1000 / frameTimeMs : 0
    this.lastFrameTime = now
    this.frameHistory.push({ timestamp: now, frameTimeMs, fps })
    if (this.frameHistory.length > this.maxHistory) {
      this.frameHistory.shift()
    }
  }

  recordEvent(name: string): void {
    this.eventCounts.set(name, (this.eventCounts.get(name) ?? 0) + 1)
  }

  getCurrentFPS(): number {
    if (this.frameHistory.length === 0) return 0
    const recent = this.frameHistory.slice(-60)
    const totalFps = recent.reduce((sum, f) => sum + f.fps, 0)
    return totalFps / recent.length
  }

  generateReport(): PerformanceReport {
    const elapsedMs = this.frameHistory.length > 0
      ? this.frameHistory[this.frameHistory.length - 1]!.timestamp - this.startTime
      : 0

    const fpss = this.frameHistory.map((f) => f.fps)
    const frameTimes = this.frameHistory.map((f) => f.frameTimeMs)
    const avgFps = fpss.length > 0 ? fpss.reduce((a, b) => a + b, 0) / fpss.length : 0
    const avgFrameTime = frameTimes.length > 0 ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length : 0
    const minFps = fpss.length > 0 ? Math.min(...fpss) : 0
    const maxFps = fpss.length > 0 ? Math.max(...fpss) : 0
    const droppedFrames = frameTimes.filter((t) => t > this.droppedFrameThresholdMs).length

    const report: PerformanceReport = {
      averageFPS: avgFps,
      minFPS: minFps,
      maxFPS: maxFps,
      averageFrameTimeMs: avgFrameTime,
      droppedFrames,
      totalFrames: this.frameHistory.length,
      elapsedTimeMs: elapsedMs,
      eventCounts: Object.fromEntries(this.eventCounts),
    }

    if (this.memorySnapshots.length > 0) {
      const peak = this.memorySnapshots.reduce((prev, curr) =>
        curr.usedJSHeapSize > prev.usedJSHeapSize ? curr : prev,
      )
      report.memoryPeak = {
        usedJSHeapSize: peak.usedJSHeapSize,
        totalJSHeapSize: peak.totalJSHeapSize,
        jsHeapSizeLimit: peak.jsHeapSizeLimit,
      }
    }

    return report
  }

  reset(): void {
    this.frameHistory = []
    this.memorySnapshots = []
    this.eventCounts.clear()
    this.startTime = 0
    this.lastFrameTime = 0
    this.enabled = false
  }

  dispose(): void {
    this.stop()
    if (this.memoryInterval !== null) {
      clearInterval(this.memoryInterval)
    }
  }

  private sampleMemory(): void {
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }
    }
    if (!perf.memory) return
    this.memorySnapshots.push({
      timestamp: performance.now(),
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
    })
  }
}
