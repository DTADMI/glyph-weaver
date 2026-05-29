import { type FC } from 'react'
import { useI18n } from '../i18n/index.js'

interface LoadingSpinnerProps {
  size?: number
  color?: string
  message?: string
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 32,
  color = '#7b68ee',
  message,
}) => {
  const { t } = useI18n()
  const borderWidth = Math.max(3, Math.round(size * 0.1))

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: message ? '8px' : '0',
      }}
      role="status"
      aria-label={message ?? t('common.loading')}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `${borderWidth}px solid rgba(123, 104, 238, 0.2)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'gw-spin 0.8s linear infinite',
        }}
      />
      {message && (
        <span
          style={{
            color: '#999',
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {message}
        </span>
      )}
    </div>
  )
}
