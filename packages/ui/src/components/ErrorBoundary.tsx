import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useI18n } from '../i18n/index.js'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

function ErrorBoundaryFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { t } = useI18n()
  return (
    <div
      style={{
        padding: '24px',
        background: '#1a1a2e',
        color: '#e0e0e0',
        borderRadius: '8px',
        border: '1px solid #ff6b6b',
        fontFamily: 'system-ui, sans-serif',
      }}
      role="alert"
    >
      <h3 style={{ color: '#ff6b6b', margin: '0 0 12px 0' }}>{t('errors.somethingWentWrong')}</h3>
      <pre
        style={{
          background: '#0a0a16',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#ff6b6b',
          overflow: 'auto',
          maxHeight: '200px',
          margin: '0 0 12px 0',
        }}
      >
        {error?.message}
      </pre>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          border: '1px solid #7b68ee',
          background: 'transparent',
          color: '#e0e0e0',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {t('errors.retry')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return <ErrorBoundaryFallback error={this.state.error} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
