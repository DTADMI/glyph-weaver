import { z } from 'zod'
import { PointSchema } from '@glyph-weaver/core/schemas'

export const StrokeSchema = z.object({
  id: z.string(),
  points: z.array(PointSchema),
  color: z.string(),
  width: z.number(),
  timestamp: z.number(),
})

export const ProjectDataSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  strokes: z.array(StrokeSchema),
  config: z.record(z.string(), z.unknown()),
  name: z.string(),
})

export type ProjectData = z.infer<typeof ProjectDataSchema>
