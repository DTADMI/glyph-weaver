import { DictionarySchema } from '@glyph-weaver/core'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function validateDictionary(dictionary: unknown): ValidationResult {
  const result = DictionarySchema.safeParse(dictionary)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return { valid: false, errors }
}

export function assertValidDictionary(dictionary: unknown): void {
  const result = validateDictionary(dictionary)
  if (!result.valid) {
    const messages = result.errors.map((e) => `  ${e.path}: ${e.message}`).join('\n')
    throw new Error(`Dictionary validation failed:\n${messages}`)
  }
}
