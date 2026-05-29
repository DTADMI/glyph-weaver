import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from '../config.js'

describe('DEFAULT_CONFIG', () => {
  it('loads with all required top-level keys', () => {
    expect(DEFAULT_CONFIG).toBeDefined()
    expect(DEFAULT_CONFIG.appVersion).toBe('0.1.0')
    expect(DEFAULT_CONFIG.appName).toBe('Glyph Weaver')
    expect(DEFAULT_CONFIG.recognition).toBeDefined()
    expect(DEFAULT_CONFIG.renderer).toBeDefined()
    expect(DEFAULT_CONFIG.compiler).toBeDefined()
  })

  it('has valid recognition config', () => {
    const { recognition } = DEFAULT_CONFIG
    expect(recognition.minConfidence).toBeGreaterThan(0)
    expect(recognition.minConfidence).toBeLessThan(1)
    expect(recognition.rotationResolution).toBeGreaterThan(0)
    expect(recognition.rasterGridSize).toBeGreaterThan(0)
  })

  it('has valid renderer config', () => {
    const { renderer } = DEFAULT_CONFIG
    expect(renderer.particleCap).toBeGreaterThan(0)
    expect(renderer.fps).toBe(60)
    expect(renderer.defaultDuration).toBeGreaterThan(0)
    expect(renderer.minDuration).toBeLessThan(renderer.maxDuration)
  })

  it('has valid compiler config', () => {
    const { compiler } = DEFAULT_CONFIG
    expect(compiler.maxForce).toBeGreaterThan(0)
    expect(compiler.maxForce).toBeLessThanOrEqual(1)
    expect(compiler.maxTiltDeg).toBeGreaterThan(0)
  })
})
