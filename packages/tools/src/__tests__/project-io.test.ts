import { describe, it, expect } from 'vitest'
import {
  exportProject,
  importProject,
  validateProject,
  serializeProject,
  deserializeProject,
  isValidProject,
} from '../export/project-io.js'
import type { Stroke } from '@glyph-weaver/core'

describe('project-io', () => {
  const sampleStrokes: Stroke[] = [
    {
      id: 's1',
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
      color: '#ff0000',
      width: 2,
      timestamp: 1700000000000,
    },
  ]

  const sampleConfig: Record<string, unknown> = {
    canvasWidth: 800,
    canvasHeight: 600,
    gridSize: 64,
  }

  describe('exportProject / importProject roundtrip', () => {
    it('should serialize and deserialize project data', () => {
      const exported = exportProject(sampleStrokes, sampleConfig, 'Test Project')
      const imported = importProject(exported)

      expect(imported.strokes).toEqual(sampleStrokes)
      expect(imported.config).toEqual(sampleConfig)
      expect(imported.name).toBe('Test Project')
    })

    it('should include version and timestamp', () => {
      const exported = exportProject(sampleStrokes, sampleConfig, 'Test')
      expect(exported.version).toBe('0.1.0')
      expect(typeof exported.timestamp).toBe('number')
      expect(exported.timestamp).toBeGreaterThan(0)
    })
  })

  describe('validateProject', () => {
    it('should validate correct project data', () => {
      const data = exportProject(sampleStrokes, sampleConfig, 'Valid')
      expect(() => validateProject(data)).not.toThrow()
      const validated = validateProject(data)
      expect(validated.name).toBe('Valid')
    })

    it('should throw on invalid project data', () => {
      expect(() => validateProject({})).toThrow()
      expect(() => validateProject(null)).toThrow()
      expect(() => validateProject(undefined)).toThrow()
      expect(() => validateProject({ version: 123 })).toThrow()
    })

    it('should reject strokes with wrong types', () => {
      const bad = {
        version: '0.1.0',
        timestamp: Date.now(),
        strokes: [{ id: 42, points: 'not-an-array', color: '#000', width: '2', timestamp: 'now' }],
        config: {},
        name: 'Bad',
      }
      expect(() => validateProject(bad)).toThrow()
    })
  })

  describe('isValidProject', () => {
    it('should return true for valid data', () => {
      const data = exportProject(sampleStrokes, sampleConfig, 'Test')
      expect(isValidProject(data)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isValidProject(null)).toBe(false)
      expect(isValidProject({})).toBe(false)
      expect(isValidProject(42)).toBe(false)
    })
  })

  describe('serializeProject / deserializeProject roundtrip', () => {
    it('should serialize and deserialize', () => {
      const data = exportProject(sampleStrokes, sampleConfig, 'JSON Test')
      const json = serializeProject(data)
      const parsed = deserializeProject(json)

      expect(parsed.name).toBe('JSON Test')
      expect(parsed.strokes).toHaveLength(1)
      expect(parsed.strokes[0]!.id).toBe('s1')
    })

    it('should throw on invalid JSON string', () => {
      expect(() => deserializeProject('{"version":"bad"}')).toThrow()
    })
  })
})
