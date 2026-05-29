'use client'

import type { ToolType } from '../state/types.js'
import { useI18n } from '../i18n/index.js'

interface ToolPaletteProps {
  currentTool: ToolType
  onSelectTool: (tool: ToolType) => void
}

const TOOLS: { id: ToolType; icon: string; shortcut: string }[] = [
  { id: 'pen', icon: 'pen', shortcut: 'B' },
  { id: 'eraser', icon: 'eraser', shortcut: 'E' },
  { id: 'select', icon: 'select', shortcut: '3' },
  { id: 'hand', icon: 'hand', shortcut: '4' },
]

function ToolIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'pen':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M 14.5 3.5 L 5.5 12.5 L 4 16 L 7.5 14.5 L 16.5 5.5 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="15" cy="5" r="1.5" />
        </svg>
      )
    case 'eraser':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="3" y="5" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    case 'select':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="4" y="4" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )
    case 'hand':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M 5 16 V 10 Q 5 6 8 5 Q 12 4 12 8 V 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="16" x2="7" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="13" y1="16" x2="13" y2="18" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    default:
      return <circle cx="10" cy="10" r="4" fill="currentColor" />
  }
}

export function ToolPalette({ currentTool, onSelectTool }: ToolPaletteProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-1 p-2">
      <span
        className="text-xs font-medium px-1 mb-1"
        style={{ color: 'var(--gw-text-muted)' }}
      >
        {t('labels.toolPalette')}
      </span>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className="flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors"
          style={{
            backgroundColor:
              currentTool === tool.id ? 'var(--gw-accent-purple)' : 'transparent',
            color:
              currentTool === tool.id ? '#fff' : 'var(--gw-text-secondary)',
          }}
          aria-label={`${t(`tools.${tool.id}`)} (${tool.shortcut})`}
          title={`${t(`tools.${tool.id}`)} (${tool.shortcut})`}
        >
          <ToolIcon icon={tool.icon} />
          <span className="hidden sm:inline text-xs">{t(`tools.${tool.id}`)}</span>
        </button>
      ))}
    </div>
  )
}
