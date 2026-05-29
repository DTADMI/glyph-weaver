'use client'

import type { BrushSettings } from '../state/types.js'
import { useI18n } from '../i18n/index.js'

interface BrushSettingsProps {
  settings: BrushSettings
  onChange: (settings: Partial<BrushSettings>) => void
}

export function BrushSettings({ settings, onChange }: BrushSettingsProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-3 p-2">
      <span
        className="text-xs font-medium px-1"
        style={{ color: 'var(--gw-text-muted)' }}
      >
        {t('labels.brushSettings')}
      </span>

      <label className="flex flex-col gap-1">
        <span className="text-xs" style={{ color: 'var(--gw-text-secondary)' }}>
          {t('brush.size')}: {settings.size}px
        </span>
        <input
          type="range"
          min="1"
          max="40"
          value={settings.size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-full"
          aria-label={t('brush.size')}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs" style={{ color: 'var(--gw-text-secondary)' }}>
          {t('brush.opacity')}: {Math.round(settings.opacity * 100)}{t('labels.percent')}
        </span>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={settings.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
          className="w-full"
          aria-label={t('brush.opacity')}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs" style={{ color: 'var(--gw-text-secondary)' }}>
          {t('brush.color')}
        </span>
        <input
          type="color"
          value={settings.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-full h-7 rounded cursor-pointer border"
          style={{ borderColor: 'var(--gw-border)', background: 'transparent' }}
          aria-label={t('brush.color')}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs" style={{ color: 'var(--gw-text-secondary)' }}>
          {t('brush.inkType')}
        </span>
        <select
          value={settings.inkType}
          onChange={(e) =>
            onChange({ inkType: e.target.value as BrushSettings['inkType'] })
          }
          className="text-xs p-1.5 rounded border bg-transparent"
          style={{
            color: 'var(--gw-text-primary)',
            borderColor: 'var(--gw-border)',
            backgroundColor: 'var(--gw-bg-tertiary)',
          }}
          aria-label={t('brush.inkType')}
        >
          <option value="standard">{t('brush.standard')}</option>
          <option value="watercolor">{t('brush.watercolor')}</option>
          <option value="charcoal">{t('brush.charcoal')}</option>
        </select>
      </label>
    </div>
  )
}
