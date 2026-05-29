'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '../../i18n/index.js'
import { useStore } from '../../state/store.js'

type DiagSection = 'parser' | 'ast' | 'ir' | 'warnings'

export function DiagnosticsPanel() {
  const { t } = useI18n()
  const spellState = useStore((s) => s.spellState)
  const strokes = useStore((s) => s.strokes)
  const [expanded, setExpanded] = useState<Record<DiagSection, boolean>>({
    parser: true,
    ast: false,
    ir: false,
    warnings: true,
  })
  const [copyMsg, setCopyMsg] = useState<string | null>(null)

  const toggle = (section: DiagSection) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }))

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg(t('diagnostics.copySuccess'))
      setTimeout(() => setCopyMsg(null), 2000)
    } catch {
      // clipboard not available
    }
  }, [t])

  const parserData = JSON.stringify(
    {
      strokeCount: strokes.length,
      totalPoints: strokes.reduce((sum, s) => sum + s.points.length, 0),
      strokes: strokes.map((s) => ({
        id: s.id,
        points: s.points.length,
        color: s.color,
        width: s.width,
        timestamp: s.timestamp,
      })),
    },
    null,
    2,
  )

  const astData = spellState
    ? JSON.stringify(
        {
          type: spellState.type,
          valid: spellState.valid,
          element: spellState.element,
          manifestations: spellState.manifestations,
        },
        null,
        2,
      )
    : t('diagnostics.noData')

  const irData = spellState
    ? JSON.stringify(
        {
          status: spellState.status,
          active: spellState.active,
          element: spellState.element,
          elementConfidence: spellState.elementConfidence,
          force: spellState.force,
          spread: spellState.spread,
          focus: spellState.focus,
          range: spellState.range,
          duration: spellState.duration,
          stability: spellState.stability,
          quality: spellState.quality,
          manifestations: Object.keys(spellState.manifestations),
          warnings: spellState.warnings,
        },
        null,
        2,
      )
    : t('diagnostics.noData')

  const warningsData = spellState?.warnings?.length
    ? spellState.warnings.join('\n')
    : '-'

  const sections: {
    id: DiagSection
    labelKey: string
    content: string
  }[] = [
    { id: 'parser', labelKey: 'diagnostics.rawParser', content: parserData },
    { id: 'ast', labelKey: 'diagnostics.structuredAST', content: astData },
    { id: 'ir', labelKey: 'diagnostics.spellBehavior', content: irData },
    { id: 'warnings', labelKey: 'diagnostics.warnings', content: warningsData },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b shrink-0" style={{ borderColor: 'var(--gw-border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--gw-accent-gold)' }}>
          {t('panels.diagnostics')}
        </span>
        {copyMsg && (
          <span className="text-xs" style={{ color: 'var(--gw-success)' }}>
            {copyMsg}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border rounded overflow-hidden"
            style={{ borderColor: 'var(--gw-border)' }}
          >
            <button
              onClick={() => toggle(section.id)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'var(--gw-bg-tertiary)',
                color: 'var(--gw-text-secondary)',
              }}
            >
              <span>{t(section.labelKey)}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(section.content)
                  }}
                  className="p-0.5 rounded hover:opacity-70"
                  style={{ color: 'var(--gw-text-muted)' }}
                  aria-label={t('buttons.copy')}
                  title={t('buttons.copy')}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="3" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 1 3 L 1 10 Q 1 11 2 11 L 8 11" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </button>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  style={{ transform: expanded[section.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M 3 5 L 6 8 L 9 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </button>
            {expanded[section.id] && (
              <pre
                className="p-2 text-xs font-mono overflow-x-auto m-0"
                style={{
                  color: 'var(--gw-text-primary)',
                  backgroundColor: 'var(--gw-bg-primary)',
                  maxHeight: '200px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {section.content}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
