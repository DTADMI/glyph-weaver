'use client'

import { useI18n } from '../i18n/index.js'
import { useTheme } from '../theme/index.js'
import { useStore } from '../state/store.js'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleRightPanel: () => void
  sidebarOpen: boolean
  rightPanelOpen: boolean
}

export function Header({
  onToggleSidebar,
  onToggleRightPanel,
  sidebarOpen,
  rightPanelOpen,
}: HeaderProps) {
  const { t, locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const canUndo = useStore((s: any) => s.canUndo())
  const canRedo = useStore((s: any) => s.canRedo())
  const undo = useStore((s: any) => s.undo)
  const redo = useStore((s: any) => s.redo)
  const spellState = useStore((s: any) => s.spellState)

  return (
    <header
      className="flex items-center justify-between h-header px-3 border-b shrink-0 select-none"
      style={{
        backgroundColor: 'var(--gw-bg-secondary)',
        borderColor: 'var(--gw-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded transition-colors hover:opacity-80"
          style={{ color: 'var(--gw-text-secondary)' }}
          aria-label={sidebarOpen ? t('buttons.collapse') : t('buttons.expand')}
          title={sidebarOpen ? t('buttons.collapse') : t('buttons.expand')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="15" width="16" height="2" rx="1" />
          </svg>
        </button>

        <span
          className="text-sm font-semibold tracking-wide hidden sm:inline"
          style={{ color: 'var(--gw-accent-gold)' }}
        >
          {t('app.name')}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded transition-colors disabled:opacity-30 hover:opacity-80"
          style={{ color: 'var(--gw-text-secondary)' }}
          aria-label={t('buttons.undo')}
          title={`${t('buttons.undo')} (Ctrl+Z)`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 4 7 L 1 10 L 4 13" />
            <path d="M 1 10 H 10 Q 15 10 15 5 V 4" />
          </svg>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded transition-colors disabled:opacity-30 hover:opacity-80"
          style={{ color: 'var(--gw-text-secondary)' }}
          aria-label={t('buttons.redo')}
          title={`${t('buttons.redo')} (Ctrl+Shift+Z)`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 14 7 L 17 10 L 14 13" />
            <path d="M 17 10 H 8 Q 3 10 3 5 V 4" />
          </svg>
        </button>

        {spellState && (
          <span
            className="px-2 py-0.5 text-xs rounded-full font-medium"
            style={{
              backgroundColor:
                spellState.status === 'active'
                  ? 'var(--gw-success)'
                  : spellState.status === 'prepared'
                    ? 'var(--gw-warning)'
                    : 'var(--gw-text-muted)',
              color: '#fff',
            }}
          >
            {spellState.status === 'active'
              ? t('state.active')
              : spellState.status === 'prepared'
                ? t('state.prepared')
                : t('state.invalid')}
          </span>
        )}

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--gw-border)' }} />

        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'en' | 'fr')}
          className="text-xs p-1 rounded border bg-transparent cursor-pointer"
          style={{
            color: 'var(--gw-text-secondary)',
            borderColor: 'var(--gw-border)',
          }}
          aria-label={t('labels.language')}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded transition-colors hover:opacity-80"
          style={{ color: 'var(--gw-text-secondary)' }}
          aria-label={`${t('labels.theme')}: ${theme === 'dark' ? t('themes.dark') : t('themes.light')}`}
          title={`${t('labels.theme')}: ${theme === 'dark' ? t('themes.dark') : t('themes.light')}`}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <circle cx="9" cy="9" r="4" />
              <path d="M 9 1 V 3 M 9 15 V 17 M 1 9 H 3 M 15 9 H 17 M 3.3 3.3 L 4.7 4.7 M 13.3 13.3 L 14.7 14.7 M 3.3 14.7 L 4.7 13.3 M 13.3 4.7 L 14.7 3.3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M 9 1 A 8 8 0 1 0 9 17 A 6 6 0 1 1 9 1 Z" />
            </svg>
          )}
        </button>

        <button
          onClick={onToggleRightPanel}
          className="p-1.5 rounded transition-colors hover:opacity-80"
          style={{ color: rightPanelOpen ? 'var(--gw-accent-purple)' : 'var(--gw-text-secondary)' }}
          aria-label={rightPanelOpen ? t('buttons.collapse') : t('buttons.expand')}
          title={t('panels.diagnostics')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <circle cx="9" cy="9" r="2" />
            <path d="M 9 1 V 4 M 9 14 V 17 M 1 9 H 4 M 14 9 H 17" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 3.3 3.3 L 5.4 5.4 M 12.6 12.6 L 14.7 14.7" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M 3.3 14.7 L 5.4 12.6 M 12.6 5.4 L 14.7 3.3" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </button>
      </div>
    </header>
  )
}
