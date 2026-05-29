import { type FC, useState } from 'react'
import { useI18n } from '../i18n/index.js'

interface ErrorFallbackProps {
  error: Error
  message?: string
  onRetry?: () => void
  onReset?: () => void
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error, message, onRetry, onReset }) => {
  const { t } = useI18n()
  const [showStack, setShowStack] = useState(false)

  return (
    <div
      style={{
        padding: '24px',
        background: '#1a1a2e',
        color: '#e0e0e0',
        borderRadius: '8px',
        border: '1px solid #ff6b6b',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '600px',
      }}
      role="alert"
    >
      <h3 style={{ color: '#ff6b6b', margin: '0 0 8px 0', fontSize: '16px' }}>
        {message ?? t('errors.anUnexpectedError')}
      </h3>

      <button
        onClick={() => setShowStack(!showStack)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#999',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '0',
          marginBottom: '12px',
          textDecoration: 'underline',
        }}
      >
        {showStack ? t('errors.hideStack') : t('errors.showStack')} stack trace
      </button>

      {showStack && (
        <pre
          style={{
            background: '#0a0a16',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#ff6b6b',
            overflow: 'auto',
            maxHeight: '200px',
            margin: '0 0 12px 0',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error.stack ?? error.message}
        </pre>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              border: '1px solid #7b68ee',
              background: '#7b68ee',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {t('errors.retry')}
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            style={{
              padding: '8px 16px',
              border: '1px solid #666',
              background: 'transparent',
              color: '#e0e0e0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {t('errors.reset')}
          </button>
        )}
      </div>
    </div>
  )
}
