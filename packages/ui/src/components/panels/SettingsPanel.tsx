'use client'

import { useI18n } from '../../i18n/index.js'
import { useTheme, type Theme } from '../../theme/index.js'
import { useStore } from '../../state/store.js'
import { FeatureFlagGate } from '../FeatureFlagGate.js'

export function SettingsPanel() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const config = useStore((s) => s.config)
  const updateConfig = useStore((s) => s.updateConfig)

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b shrink-0" style={{ borderColor: 'var(--gw-border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--gw-accent-gold)' }}>
          {t('panels.settings')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <FeatureFlagGate flag="enableLLMRecognition" fallback={null}>
          <section>
            <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
              {t('settings.recognition')}
            </h3>
            <label className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
                {t('settings.minConfidence')}: {config.recognition.minConfidence.toFixed(2)}
              </span>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={config.recognition.minConfidence}
                onChange={(e) =>
                  updateConfig({
                    recognition: { ...config.recognition, minConfidence: Number(e.target.value) },
                  })
                }
                className="w-full"
                aria-label={t('settings.minConfidence')}
              />
            </label>
          </section>
        </FeatureFlagGate>

        <section>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('settings.renderer')}
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
                {t('settings.particleCap')}: {config.renderer.particleCap}
              </span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={config.renderer.particleCap}
                onChange={(e) =>
                  updateConfig({
                    renderer: { ...config.renderer, particleCap: Number(e.target.value) },
                  })
                }
                className="w-full"
                aria-label={t('settings.particleCap')}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
                {t('settings.effectOpacity')}: {config.renderer.effectOpacity.toFixed(2)}
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.renderer.effectOpacity}
                onChange={(e) =>
                  updateConfig({
                    renderer: { ...config.renderer, effectOpacity: Number(e.target.value) },
                  })
                }
                className="w-full"
                aria-label={t('settings.effectOpacity')}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
                {t('settings.fps')}: {config.renderer.fps}
              </span>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={config.renderer.fps}
                onChange={(e) =>
                  updateConfig({
                    renderer: { ...config.renderer, fps: Number(e.target.value) },
                  })
                }
                className="w-full"
                aria-label={t('settings.fps')}
              />
            </label>
          </div>
        </section>

        <FeatureFlagGate flag="enableExperimentalEffects" fallback={null}>
          <section>
            <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
              {t('settings.experimentalEffects')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
              {t('settings.experimentalEffectsDesc')}
            </p>
          </section>
        </FeatureFlagGate>

        <section>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('settings.theme')}
          </h3>
          <div className="flex gap-2">
            {(['dark', 'light'] as Theme[]).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: theme === th ? 'var(--gw-accent-purple)' : 'transparent',
                  color: theme === th ? '#fff' : 'var(--gw-text-secondary)',
                  borderColor: 'var(--gw-border)',
                }}
              >
                {t(`themes.${th}`)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('settings.language')}
          </h3>
          <div className="flex gap-2">
            {(['fr', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: locale === lang ? 'var(--gw-accent-purple)' : 'transparent',
                  color: locale === lang ? '#fff' : 'var(--gw-text-secondary)',
                  borderColor: 'var(--gw-border)',
                }}
              >
                {t(`settings.language${lang === 'fr' ? 'Fr' : 'En'}`)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('settings.about')}
          </h3>
          <p className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
            {t('about.description')}
          </p>
          <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--gw-text-muted)' }}>
            {t('about.disclaimer')}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--gw-text-muted)' }}>
            <span>{t('app.version')} {config.appVersion}</span>
            <span>{t('about.license')}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
