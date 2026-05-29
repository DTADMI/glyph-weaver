import { describe, it, expect } from 'vitest'
import { TemplateMaker } from '../template-maker/template-maker.js'
import type { Point } from '@glyph-weaver/core'

describe('TemplateMaker', () => {
  describe('startRecording', () => {
    it('should initialize empty strokes', () => {
      const maker = new TemplateMaker({ canvasWidth: 400, canvasHeight: 300 })
      maker.startRecording()
      expect(maker.strokeCount).toBe(0)
    })

    it('should accept canvas dimensions', () => {
      const maker = new TemplateMaker()
      maker.startRecording(640, 480)
      const template = maker.finishRecording()
      expect(template.sourceAspectRatio).toBeCloseTo(640 / 480)
    })
  })

  describe('addStroke / normalization', () => {
    it('should normalize points to 0-1 space', () => {
      const maker = new TemplateMaker({ canvasWidth: 100, canvasHeight: 100 })
      maker.startRecording()

      const points: Point[] = [
        { x: 50, y: 50 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ]
      maker.addStroke(points)

      const template = maker.exportTemplate()
      expect(template.strokes).toHaveLength(1)
      expect(template.strokes[0]!).toHaveLength(3)
      expect(template.strokes[0]![0]!).toEqual({ x: 0.5, y: 0.5 })
      expect(template.strokes[0]![1]!).toEqual({ x: 1, y: 0 })
      expect(template.strokes[0]![2]!).toEqual({ x: 0, y: 1 })
    })

    it('should handle different aspect ratios', () => {
      const maker = new TemplateMaker({ canvasWidth: 800, canvasHeight: 600 })
      maker.startRecording()
      maker.addStroke([{ x: 400, y: 300 }])
      const template = maker.finishRecording()
      expect(template.sourceAspectRatio).toBeCloseTo(800 / 600)
      expect(template.strokes[0]![0]!).toEqual({ x: 0.5, y: 0.5 })
    })

    it('should not record when not started', () => {
      const maker = new TemplateMaker()
      maker.addStroke([{ x: 50, y: 50 }])
      expect(maker.strokeCount).toBe(0)
    })

    it('should accumulate multiple strokes', () => {
      const maker = new TemplateMaker({ canvasWidth: 200, canvasHeight: 200 })
      maker.startRecording()
      maker.addStroke([{ x: 20, y: 20 }])
      maker.addStroke([{ x: 80, y: 80 }])
      maker.addStroke([{ x: 120, y: 60 }])
      expect(maker.strokeCount).toBe(3)
    })
  })

  describe('finishRecording', () => {
    it('should return template with correct structure', () => {
      const maker = new TemplateMaker({ canvasWidth: 200, canvasHeight: 100 })
      maker.startRecording()
      maker.addStroke([{ x: 20, y: 20 }, { x: 180, y: 80 }])
      const template = maker.finishRecording()

      expect(template).toHaveProperty('sourceAspectRatio')
      expect(template).toHaveProperty('strokes')
      expect(template.sourceAspectRatio).toBe(2)
      expect(template.strokes[0]![0]!).toEqual({ x: 0.1, y: 0.2 })
      expect(template.strokes[0]![1]!).toEqual({ x: 0.9, y: 0.8 })
    })

    it('should stop recording after finish', () => {
      const maker = new TemplateMaker()
      maker.startRecording()
      maker.finishRecording()
      maker.addStroke([{ x: 50, y: 50 }])
      expect(maker.strokeCount).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all strokes', () => {
      const maker = new TemplateMaker({ canvasWidth: 200, canvasHeight: 200 })
      maker.startRecording()
      maker.addStroke([{ x: 10, y: 10 }])
      maker.addStroke([{ x: 20, y: 20 }])
      expect(maker.strokeCount).toBe(2)
      maker.clear()
      expect(maker.strokeCount).toBe(0)
    })
  })

  describe('getBounds', () => {
    it('should return null for empty strokes', () => {
      const maker = new TemplateMaker()
      expect(maker.getBounds()).toBeNull()
    })

    it('should compute bounds in normalized space', () => {
      const maker = new TemplateMaker({ canvasWidth: 100, canvasHeight: 100 })
      maker.startRecording()
      maker.addStroke([{ x: 20, y: 30 }, { x: 80, y: 70 }])
      const bounds = maker.getBounds()!

      expect(bounds.minX).toBeCloseTo(0.2)
      expect(bounds.minY).toBeCloseTo(0.3)
      expect(bounds.maxX).toBeCloseTo(0.8)
      expect(bounds.maxY).toBeCloseTo(0.7)
      expect(bounds.width).toBeCloseTo(0.6)
      expect(bounds.height).toBeCloseTo(0.4)
    })
  })

  describe('pointCount', () => {
    it('should count total points across strokes', () => {
      const maker = new TemplateMaker({ canvasWidth: 200, canvasHeight: 200 })
      maker.startRecording()
      maker.addStroke([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])
      maker.addStroke([{ x: 3, y: 3 }])
      expect(maker.pointCount).toBe(4)
    })
  })
})
