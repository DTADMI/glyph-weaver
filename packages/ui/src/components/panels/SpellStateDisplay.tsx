'use client'

import { useI18n } from '../../i18n/index.js'
import { useStore } from '../../state/store.js'

export function SpellStateDisplay() {
  const { t } = useI18n()
  const spellState = useStore((s: any) => s.spellState)

  if (!spellState) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
          {t('diagnostics.noData')}
        </p>
      </div>
    )
  }

  const statusColor =
    spellState.status === 'active'
      ? 'var(--gw-success)'
      : spellState.status === 'prepared'
        ? 'var(--gw-warning)'
        : 'var(--gw-error)'

  const statusLabel =
    spellState.status === 'active'
      ? t('state.active')
      : spellState.status === 'prepared'
        ? t('state.prepared')
        : t('state.invalid')

  const elementIcons: Record<string, string> = {
    fire: '\u{1F525}',
    water: '\u{1F4A7}',
    wind: '\u{1F4A8}',
    earth: '\u{1FAA8}',
    light: '\u{2728}',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b shrink-0" style={{ borderColor: 'var(--gw-border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--gw-accent-gold)' }}>
          {t('panels.spellState')}
        </span>
        <span
          className="px-2 py-0.5 text-xs rounded-full font-medium"
          style={{ backgroundColor: statusColor, color: '#fff' }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {spellState.element && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{elementIcons[spellState.element] ?? '\u{2728}'}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--gw-text-primary)' }}>
              {spellState.element}
            </span>
            <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
              {t('diagnostics.confidence')}: {Math.round(spellState.elementConfidence * 100)}{t('labels.percent')}
            </span>
          </div>
        )}

        {Object.keys(spellState.manifestations).length > 0 && (
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--gw-text-secondary)' }}>
              {t('labels.manifestation')}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.keys(spellState.manifestations).map((m) => (
                <span
                  key={m}
                  className="px-1.5 py-0.5 text-xs rounded border"
                  style={{ borderColor: 'var(--gw-border)', color: 'var(--gw-text-secondary)' }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        <BarMeter label={t('labels.quality')} value={spellState.quality} max={1} color="var(--gw-success)" />
        <BarMeter label={t('labels.stability')} value={spellState.stability} max={1} color="var(--gw-accent-purple)" />

        <div>
          <span className="text-xs" style={{ color: 'var(--gw-text-secondary)' }}>
            {t('labels.duration')}
          </span>
          <span className="text-xs ml-2 font-medium" style={{ color: 'var(--gw-text-primary)' }}>
            {spellState.duration.toFixed(1)}{t('labels.seconds')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <StatRow label={t('labels.force')} value={spellState.force} />
          <StatRow label={t('labels.spread')} value={spellState.spread} />
          <StatRow label={t('labels.focus')} value={spellState.focus} />
          <StatRow label={t('labels.range')} value={spellState.range} />
        </div>

        {spellState.warnings.length > 0 && (
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--gw-warning)' }}>
              {t('labels.warnings')}
            </span>
            <ul className="mt-1 flex flex-col gap-0.5">
              {spellState.warnings.map((w: any, i: any) => (
                <li key={i} className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function BarMeter({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: 'var(--gw-text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--gw-text-muted)' }}>{Math.round(pct)}%</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--gw-bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: 'var(--gw-text-muted)' }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: 'var(--gw-text-primary)' }}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}
