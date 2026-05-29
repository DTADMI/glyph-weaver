import type { Stroke } from '@glyph-weaver/core'
import { ProjectDataSchema, type ProjectData } from './project-schema.js'

export type { ProjectData } from './project-schema.js'

export function exportProject(
  strokes: Stroke[],
  config: Record<string, unknown>,
  name: string,
): ProjectData {
  return {
    version: '0.1.0',
    timestamp: Date.now(),
    strokes,
    config,
    name,
  }
}

export function importProject(data: ProjectData): { strokes: Stroke[]; config: Record<string, unknown>; name: string } {
  return {
    strokes: data.strokes,
    config: data.config,
    name: data.name,
  }
}

export function validateProject(data: unknown): ProjectData {
  return ProjectDataSchema.parse(data)
}

export function isValidProject(data: unknown): data is ProjectData {
  return ProjectDataSchema.safeParse(data).success
}

export function serializeProject(data: ProjectData): string {
  return JSON.stringify(data, null, 2)
}

export function deserializeProject(json: string): ProjectData {
  const parsed: unknown = JSON.parse(json)
  return validateProject(parsed)
}
