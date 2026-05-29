export type FeatureFlag = 'enableMultiRing'
  | 'enableMultiSigil'
  | 'enableDSL'
  | 'enableExperimentalEffects'
  | 'enableLLMRecognition'

const FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  enableMultiRing: false,
  enableMultiSigil: false,
  enableDSL: false,
  enableExperimentalEffects: false,
  enableLLMRecognition: false,
}

let overrides: Partial<Record<FeatureFlag, boolean>> = {}

export function getFeatureFlag(flag: FeatureFlag): boolean {
  if (flag in overrides) {
    return overrides[flag]!
  }
  return FLAG_DEFAULTS[flag]
}

export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const result = {} as Record<FeatureFlag, boolean>
  for (const flag of Object.keys(FLAG_DEFAULTS) as FeatureFlag[]) {
    result[flag] = getFeatureFlag(flag)
  }
  return result
}

export function setFeatureFlagOverrides(newOverrides: Partial<Record<FeatureFlag, boolean>>): void {
  overrides = { ...newOverrides }
}

export function clearFeatureFlagOverrides(): void {
  overrides = {}
}
