'use client'

import { useState, useMemo } from 'react'
import { loadDictionary } from '@glyph-weaver/dictionary'
import type { SigilEntry, SignEntry, SampleSpellEntry } from '@glyph-weaver/core'
import { useI18n } from '../../i18n/index.js'

type DictionaryTab = 'sigils' | 'signs' | 'samples'

export function DictionaryPanel() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<DictionaryTab>('sigils')
  const [search, setSearch] = useState('')
  const dictionary = useMemo(() => loadDictionary(), [])

  const filter = <T extends { id: string; displayName: string }>(items: T[]) =>
    search.trim()
      ? items.filter(
          (item) =>
            item.id.toLowerCase().includes(search.toLowerCase()) ||
            item.displayName.toLowerCase().includes(search.toLowerCase()),
        )
      : items

  const filteredSigils = useMemo(() => filter(dictionary.sigils), [search, dictionary.sigils])
  const filteredSigns = useMemo(() => filter(dictionary.signs), [search, dictionary.signs])
  const filteredSamples = useMemo(() => filter(dictionary.sampleSpells), [search, dictionary.sampleSpells])

  const tabs: { id: DictionaryTab; label: string }[] = [
    { id: 'sigils', label: t('labels.sigils') },
    { id: 'signs', label: t('labels.signs') },
    { id: 'samples', label: t('labels.sampleSpells') },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b shrink-0" style={{ borderColor: 'var(--gw-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-2 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--gw-accent-gold)' : 'var(--gw-text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--gw-accent-gold)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-2 shrink-0">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t('labels.search')}...`}
          className="w-full px-2 py-1 text-xs rounded border bg-transparent"
          style={{
            color: 'var(--gw-text-primary)',
            borderColor: 'var(--gw-border)',
            backgroundColor: 'var(--gw-bg-tertiary)',
          }}
          aria-label={t('labels.search')}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'sigils' && (
          <SigilList sigils={filteredSigils} t={t} emptyMessage={t('dictionary.noSigils')} />
        )}
        {activeTab === 'signs' && (
          <SignList signs={filteredSigns} t={t} emptyMessage={t('dictionary.noSigns')} />
        )}
        {activeTab === 'samples' && (
          <SampleList samples={filteredSamples} t={t} emptyMessage={t('dictionary.noSamples')} />
        )}
      </div>
    </div>
  )
}

function SigilList({
  sigils,
  emptyMessage,
  t,
}: {
  sigils: SigilEntry[]
  emptyMessage: string
  t: (key: string) => string
}) {
  if (sigils.length === 0) {
    return <p className="text-xs text-center py-4" style={{ color: 'var(--gw-text-muted)' }}>{emptyMessage}</p>
  }
  return (
    <div className="flex flex-col gap-2">
      {sigils.map((sigil) => (
        <div
          key={sigil.id}
          className="p-2 rounded text-xs border"
          style={{ borderColor: 'var(--gw-border)', backgroundColor: 'var(--gw-bg-tertiary)' }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium" style={{ color: 'var(--gw-accent-gold)' }}>{sigil.displayName}</span>
            <span className="opacity-60" style={{ color: 'var(--gw-text-muted)' }}>{sigil.element}</span>
          </div>
          <div className="flex flex-wrap gap-1" style={{ color: 'var(--gw-text-secondary)' }}>
            <span>{t('labels.force')}: {sigil.semantic.force}</span>
            <span>{t('labels.focus')}: {sigil.semantic.focus}</span>
            <span>{t('labels.spread')}: {sigil.semantic.spread}</span>
            <span>{t('labels.range')}: {sigil.semantic.range}</span>
          </div>
          <div className="mt-1" style={{ color: 'var(--gw-text-muted)' }}>
            {t('dictionary.layer')}: {sigil.allowedLayers.join(', ')}
          </div>
        </div>
      ))}
    </div>
  )
}

function SignList({
  signs,
  emptyMessage,
  t,
}: {
  signs: SignEntry[]
  emptyMessage: string
  t: (key: string) => string
}) {
  if (signs.length === 0) {
    return <p className="text-xs text-center py-4" style={{ color: 'var(--gw-text-muted)' }}>{emptyMessage}</p>
  }
  return (
    <div className="flex flex-col gap-2">
      {signs.map((sign) => (
        <div
          key={sign.id}
          className="p-2 rounded text-xs border"
          style={{ borderColor: 'var(--gw-border)', backgroundColor: 'var(--gw-bg-tertiary)' }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium" style={{ color: 'var(--gw-accent-gold)' }}>{sign.displayName}</span>
            <span className="opacity-60" style={{ color: 'var(--gw-text-muted)' }}>{sign.semantic.manifestation}</span>
          </div>
          {sign.sourceNotes && (
            <p className="mb-1" style={{ color: 'var(--gw-text-secondary)' }}>{sign.sourceNotes}</p>
          )}
          <div className="flex flex-wrap gap-1" style={{ color: 'var(--gw-text-secondary)' }}>
            <span>{t('labels.force')}: {sign.semantic.force}</span>
            <span>{t('labels.focus')}: {sign.semantic.focus}</span>
            <span>{t('labels.spread')}: {sign.semantic.spread}</span>
          </div>
          <div className="mt-1" style={{ color: 'var(--gw-text-muted)' }}>
            {t('dictionary.layer')}: {sign.allowedLayers.join(', ')}
          </div>
        </div>
      ))}
    </div>
  )
}

function SampleList({
  samples,
  emptyMessage,
  t,
}: {
  samples: SampleSpellEntry[]
  emptyMessage: string
  t: (key: string) => string
}) {
  if (samples.length === 0) {
    return <p className="text-xs text-center py-4" style={{ color: 'var(--gw-text-muted)' }}>{emptyMessage}</p>
  }
  return (
    <div className="flex flex-col gap-2">
      {samples.map((sample) => (
        <div
          key={sample.id}
          className="p-2 rounded text-xs border"
          style={{ borderColor: 'var(--gw-border)', backgroundColor: 'var(--gw-bg-tertiary)' }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium" style={{ color: 'var(--gw-accent-gold)' }}>{sample.displayName}</span>
            <span className="opacity-60" style={{ color: 'var(--gw-text-muted)' }}>{sample.element}</span>
          </div>
          <p style={{ color: 'var(--gw-text-secondary)' }}>{sample.description}</p>
          <div className="mt-1" style={{ color: 'var(--gw-text-muted)' }}>
            {t('labels.manifestation')}: {sample.manifestations.join(', ')}
          </div>
        </div>
      ))}
    </div>
  )
}
