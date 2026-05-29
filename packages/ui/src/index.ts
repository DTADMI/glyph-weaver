export { GlyphWeaverShell } from './components/Shell.js'
export { Header } from './components/Header.js'
export { Sidebar } from './components/Sidebar.js'
export { CanvasArea } from './components/CanvasArea.js'
export { ToolPalette } from './components/ToolPalette.js'
export { BrushSettings } from './components/BrushSettings.js'
export { DictionaryPanel } from './components/panels/DictionaryPanel.js'
export { DiagnosticsPanel } from './components/panels/DiagnosticsPanel.js'
export { SpellStateDisplay } from './components/panels/SpellStateDisplay.js'
export { SettingsPanel } from './components/panels/SettingsPanel.js'
export { FeatureFlagGate } from './components/FeatureFlagGate.js'

export { DrawingCanvas, EffectsOverlay, Paper, HistoryManager, getCursorStyle, clearCursorCache } from './canvas/index.js'

export { I18nProvider, useI18n, resolveLocale, getServerTranslations, parseAcceptLanguage } from './i18n/index.js'
export type { Locale, TranslationMap, I18nContextValue } from './i18n/index.js'

export { ThemeProvider, useTheme } from './theme/index.js'
export type { Theme } from './theme/index.js'

export { useKeyboardShortcuts, getShortcutLabel, DEFAULT_SHORTCUTS } from './shortcuts/index.js'
export type { ShortcutAction, ActionHandler } from './shortcuts/index.js'

export { useStore } from './state/index.js'
export type { ToolType, PanelState, AppStoreState, PipelineStatus } from './state/index.js'
export type { BrushSettings as BrushSettingsConfig } from './state/index.js'

export { pipelineManager } from './pipeline/index.js'
export type { PipelineManager, RingStatus, PipelineResult } from './pipeline/index.js'

export { GLYPH_WEAVER_VERSION, GLYPH_WEAVER_NAME } from '@glyph-weaver/core'

export const UI_VERSION = '0.1.0'
