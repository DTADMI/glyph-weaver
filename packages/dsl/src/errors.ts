export type DslSeverity = 'error' | 'warning'

export class DslError {
  message: string
  line: number
  column: number
  severity: DslSeverity

  constructor(message: string, line: number, column: number, severity: DslSeverity = 'error') {
    this.message = message
    this.line = line
    this.column = column
    this.severity = severity
  }
}

export function formatError(error: DslError): string {
  return `[${error.severity.toUpperCase()}] L${error.line}:${error.column} - ${error.message}`
}

export function formatErrors(errors: DslError[]): string {
  return errors.map(formatError).join('\n')
}
