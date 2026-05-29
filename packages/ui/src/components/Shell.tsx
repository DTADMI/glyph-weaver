'use client'

import { useState, useCallback, useEffect } from 'react'
import { Header } from './Header.js'
import { Sidebar } from './Sidebar.js'
import { CanvasArea } from './CanvasArea.js'
import { DictionaryPanel } from './panels/DictionaryPanel.js'
import { DiagnosticsPanel } from './panels/DiagnosticsPanel.js'
import { SpellStateDisplay } from './panels/SpellStateDisplay.js'
import { SettingsPanel } from './panels/SettingsPanel.js'
import { FeatureFlagGate } from './FeatureFlagGate.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { LoadingSpinner } from './LoadingSpinner.js'
import { useStore } from '../state/store.js'
import { useKeyboardShortcuts } from '../shortcuts/keyboard-shortcuts.js'
import { useI18n } from '../i18n/index.js'
import { PipelineManager } from '../pipeline/pipeline-manager.js'

export function GlyphWeaverShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const panels = useStore((s) => s.panels)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const clear = useStore((s) => s.clear)
  const setTool = useStore((s) => s.setTool)
  const togglePanel = useStore((s) => s.togglePanel)
  const setPipelineManager = useStore((s) => s.setPipelineManager)
  const config = useStore((s) => s.config)
  const { t } = useI18n()

  useEffect(() => {
    const pm = new PipelineManager(config)
    setPipelineManager(pm)
    setInitializing(false)
  }, [config, setPipelineManager])

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'undo':
          undo()
          break
        case 'redo':
          redo()
          break
        case 'save':
          console.log('save not yet implemented')
          break
        case 'export':
          console.log('export not yet implemented')
          break
        case 'clear':
          clear()
          break
        case 'tool:pen':
          setTool('pen')
          break
        case 'tool:eraser':
          setTool('eraser')
          break
        case 'tool:select':
          setTool('select')
          break
        case 'tool:hand':
          setTool('hand')
          break
        case 'toggle:diagnostics':
          togglePanel('diagnostics')
          break
        case 'search':
          togglePanel('dictionary')
          break
        case 'help':
          togglePanel('settings')
          break
      }
    },
    [undo, redo, clear, setTool, togglePanel],
  )

  useKeyboardShortcuts(handleAction)

  const activeRightPanel =
    panels.diagnostics
      ? 'diagnostics'
      : panels.spellState
        ? 'spellState'
        : panels.settings
          ? 'settings'
          : panels.dictionary
            ? 'dictionary'
            : null

  const rightPanelHasContent = activeRightPanel !== null

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ minWidth: '320px' }}>
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
        rightPanelOpen={rightPanelOpen}
      />

      <ErrorBoundary>
        {initializing ? (
          <div className="flex flex-1 items-center justify-center overflow-hidden relative">
            <LoadingSpinner message={t('shell.initializing')} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden relative">
            <FeatureFlagGate flag="enableMultiRing" fallback={null}>
              <div className="hidden" data-feature="multi-ring" />
            </FeatureFlagGate>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <CanvasArea />

            {rightPanelOpen && rightPanelHasContent && (
              <>
                <div
                  className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                  onClick={() => setRightPanelOpen(false)}
                  aria-hidden="true"
                />
                <aside
                  className="fixed lg:static z-40 top-header right-0 h-[calc(100%-var(--gw-header-height))] w-sidebar overflow-y-auto border-l transition-transform duration-200"
                  style={{
                    backgroundColor: 'var(--gw-bg-secondary)',
                    borderColor: 'var(--gw-border)',
                  }}
                >
                  <div className="flex justify-between items-center p-2 border-b lg:hidden" style={{ borderColor: 'var(--gw-border)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--gw-text-secondary)' }}>
                      {t(`panels.${activeRightPanel}`)}
                    </span>
                    <button
                      onClick={() => setRightPanelOpen(false)}
                      className="p-1 rounded"
                      style={{ color: 'var(--gw-text-secondary)' }}
                      aria-label={t('buttons.close')}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M 4 4 L 12 12 M 12 4 L 4 12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>

                  {activeRightPanel === 'diagnostics' && <DiagnosticsPanel />}
                  {activeRightPanel === 'spellState' && (
                    <FeatureFlagGate flag="enableDSL" fallback={null}>
                      <SpellStateDisplay />
                    </FeatureFlagGate>
                  )}
                  {activeRightPanel === 'settings' && <SettingsPanel />}
                  {activeRightPanel === 'dictionary' && <DictionaryPanel />}
                </aside>
              </>
            )}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
