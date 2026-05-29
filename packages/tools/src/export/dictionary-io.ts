import type { Dictionary } from '@glyph-weaver/core'
import { DictionarySchema } from '@glyph-weaver/core/schemas'

export function exportDictionary(dict: Dictionary): string {
  const result = DictionarySchema.safeParse(dict)
  if (!result.success) {
    throw new Error(`Invalid dictionary: ${result.error.message}`)
  }
  return JSON.stringify(dict, null, 2)
}

export function importDictionary(json: string): Dictionary {
  const parsed: unknown = JSON.parse(json)
  const result = DictionarySchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Failed to import dictionary: ${result.error.message}`)
  }
  return result.data
}

export function mergeDictionaries(base: Dictionary, overlay: Dictionary): Dictionary {
  const sigilIds = new Set(overlay.sigils.map((s) => s.id))
  const mergedSigils = [
    ...base.sigils.filter((s) => !sigilIds.has(s.id)),
    ...overlay.sigils,
  ]

  const signIds = new Set(overlay.signs.map((s) => s.id))
  const mergedSigns = [
    ...base.signs.filter((s) => !signIds.has(s.id)),
    ...overlay.signs,
  ]

  const spellIds = new Set(overlay.sampleSpells.map((s) => s.id))
  const mergedSpells = [
    ...base.sampleSpells.filter((s) => !spellIds.has(s.id)),
    ...overlay.sampleSpells,
  ]

  return {
    sigils: mergedSigils,
    signs: mergedSigns,
    sampleSpells: mergedSpells,
  }
}

export function validateDictionary(data: unknown): Dictionary {
  const result = DictionarySchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid dictionary: ${result.error.message}`)
  }
  return result.data
}

export function assertDictionary(data: unknown): asserts data is Dictionary {
  DictionarySchema.parse(data)
}
