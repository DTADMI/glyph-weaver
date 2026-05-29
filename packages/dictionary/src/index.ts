import type { Dictionary } from '@glyph-weaver/core'
import { sigils } from './sigils.js'
import { signs } from './signs.js'
import { sampleSpells } from './sample-spells.js'

export { sigils } from './sigils.js'
export { signs } from './signs.js'
export { sampleSpells } from './sample-spells.js'

export const DEFAULT_DICTIONARY: Dictionary = {
  sigils,
  signs,
  sampleSpells,
}

export function loadDictionary(): Dictionary {
  return DEFAULT_DICTIONARY
}
