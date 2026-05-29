'use client'

import { ToolPalette } from './ToolPalette.js'
import { BrushSettings } from './BrushSettings.js'
import { FeatureFlagGate } from './FeatureFlagGate.js'
import { useI18n } from '../i18n/index.js'
import { useStore } from '../state/store.js'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useI18n()
  const currentTool = useStore((s) => s.currentTool)
  const brushSettings = useStore((s) => s.brushSettings)
  const setTool = useStore((s) => s.setTool)
  const setBrush = useStore((s) => s.setBrush)
  const togglePanel = useStore((s) => s.togglePanel)
  const panels = useStore((s) => s.panels)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className="fixed lg:static z-40 top-header h-[calc(100%-var(--gw-header-height))] left-0 w-sidebar overflow-y-auto border-r transition-transform duration-200"
        style={{
          backgroundColor: 'var(--gw-bg-secondary)',
          borderColor: 'var(--gw-border)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex justify-between items-center p-2 border-b lg:hidden" style={{ borderColor: 'var(--gw-border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('app.name')}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded"
            style={{ color: 'var(--gw-text-secondary)' }}
            aria-label={t('buttons.close')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M 4 4 L 12 12 M 12 4 L 4 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <ToolPalette currentTool={currentTool} onSelectTool={setTool} />

        <div className="mx-2 border-t" style={{ borderColor: 'var(--gw-border)' }} />

        <BrushSettings settings={brushSettings} onChange={setBrush} />

        <FeatureFlagGate flag="enableExperimentalEffects" fallback={null}>
          <div className="mx-2 border-t" style={{ borderColor: 'var(--gw-border)' }} />
          <div className="p-2">
            <span className="text-xs font-medium px-1" style={{ color: 'var(--gw-text-muted)' }}>
              {t('labels.experimentalEffects')}
            </span>
          </div>
        </FeatureFlagGate>

        <div className="mx-2 border-t" style={{ borderColor: 'var(--gw-border)' }} />

        <div className="p-2 flex flex-col gap-1">
          <span className="text-xs font-medium px-1" style={{ color: 'var(--gw-text-muted)' }}>
            {t('labels.dictionary')}
          </span>
          <button
            onClick={() => togglePanel('dictionary')}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors w-full text-left"
            style={{
              backgroundColor: panels.dictionary ? 'var(--gw-accent-purple)' : 'transparent',
              color: panels.dictionary ? '#fff' : 'var(--gw-text-secondary)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1" />
              <line x1="6" y1="5" x2="6" y2="15" stroke="currentColor" strokeWidth="1" />
            </svg>
            {t('panels.dictionary')}
          </button>

          <button
            onClick={() => togglePanel('diagnostics')}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors w-full text-left"
            style={{
              backgroundColor: panels.diagnostics ? 'var(--gw-accent-purple)' : 'transparent',
              color: panels.diagnostics ? '#fff' : 'var(--gw-text-secondary)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M 8 4 V 8 L 11 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            {t('panels.diagnostics')}
          </button>

          <button
            onClick={() => togglePanel('spellState')}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors w-full text-left"
            style={{
              backgroundColor: panels.spellState ? 'var(--gw-accent-purple)' : 'transparent',
              color: panels.spellState ? '#fff' : 'var(--gw-text-secondary)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M 8 1 L 10.5 5.5 L 15 6.5 L 11.5 10 L 12 14.5 L 8 12.5 L 4 14.5 L 4.5 10 L 1 6.5 L 5.5 5.5 Z"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            {t('panels.spellState')}
          </button>

          <button
            onClick={() => togglePanel('settings')}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors w-full text-left"
            style={{
              backgroundColor: panels.settings ? 'var(--gw-accent-purple)' : 'transparent',
              color: panels.settings ? '#fff' : 'var(--gw-text-secondary)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M 8 1 V 3 M 8 13 V 15 M 1 8 H 3 M 13 8 H 15 M 3.05 3.05 L 4.46 4.46 M 11.54 11.54 L 12.95 12.95 M 3.05 12.95 L 4.46 11.54 M 11.54 4.46 L 12.95 3.05" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            {t('panels.settings')}
          </button>
        </div>
      </aside>
    </>
  )
}
