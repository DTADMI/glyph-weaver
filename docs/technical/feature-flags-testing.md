# Feature Flags

All feature flags are defined in `packages/core/src/feature-flags.ts` and re-exported from `packages/ui/src/lib/feature-flags.ts`.

## Flag Definitions

| Flag | Default | Purpose |
| --- | --- | --- |
| `enableMultiRing` | `false` | Gates multi-ring spell compilation |
| `enableMultiSigil` | `false` | Gates multi-element spells (multiple sigils) |
| `enableDSL` | `false` | Gates WHA-DSL (Witch Hat Atelier Domain Specific Language) features |
| `enableExperimentalEffects` | `false` | Gates dark, lightning, ice, nature, arcane elemental effects |
| `enableLLMRecognition` | `false` | Gates LLM-based glyph recognition |

## Flag Controls

### Querying a flag

```typescript
import { getFeatureFlag } from '@glyph-weaver/core'

if (getFeatureFlag('enableDSL')) {
  // DSL features enabled
}
```

### Overriding flags for testing

```typescript
import { setFeatureFlagOverrides, clearFeatureFlagOverrides } from '@glyph-weaver/core'

// Enable specific flags
setFeatureFlagOverrides({ enableDSL: true, enableExperimentalEffects: true })

// Reset all overrides
clearFeatureFlagOverrides()
```

### React component gating

Use the `FeatureFlagGate` component to conditionally render UI:

```tsx
import { FeatureFlagGate } from '@glyph-weaver/ui'

<FeatureFlagGate flag="enableExperimentalEffects" fallback={null}>
  <ExperimentalEffectSelector />
</FeatureFlagGate>
```

## Testing Each Flag

### enableMultiRing

1. Set `enableMultiRing: true` via `setFeatureFlagOverrides`
2. Verify multi-ring UI elements appear in the shell
3. Verify single-ring behavior when flag is `false`
4. Verify ring-level AST nodes are generated correctly

### enableMultiSigil

1. Enable the flag and open the Dictionary Panel
2. Verify sample spells with multiple sigils are visible in the Samples tab
3. Verify the Samples tab is hidden when the flag is `false`
4. Verify multi-sigil spell compilation produces correct SpellIR

### enableDSL

1. Enable the flag and verify DSL-related panels are visible
2. Verify the SpellStateDisplay panel renders when the flag is `true`
3. Verify WHA-DSL lexer/parser features are accessible
4. Verify DSL input/output is gated correctly

### enableExperimentalEffects

1. Enable the flag and verify experimental effect selectors appear in Sidebar
2. Verify SettingsPanel shows experimental effect configuration options
3. Verify dark, lightning, ice, nature, and arcane elements are available
4. Verify experimental effects are hidden when the flag is `false`

### enableLLMRecognition

1. Enable the flag and verify LLM-related recognition UI is visible
2. Verify recognition confidence threshold settings appear
3. Verify LLM calls are gated (no API calls when flag is `false`)
4. Verify fallback recognition still works without LLM

## Guardrails

- Flags default to `false` — no experimental or incomplete features ship by default
- Flag overrides are in-memory only and reset on page reload
- `FeatureFlagGate` renders nothing (or configured fallback) when a flag is disabled
- All new pre-release features must be gated behind a flag
