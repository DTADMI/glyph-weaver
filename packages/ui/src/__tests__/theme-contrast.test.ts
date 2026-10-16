import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'

/**
 * WCAG 2.1 AA contrast guard for the theme.
 *
 * The palette is duplicated between the UI package (`theme.css`, the shipped
 * source) and the app (`apps/web/app/globals.css`, the one actually rendered).
 * A colour edit that looks fine in one file can silently break the other, and a
 * failing ratio is invisible in review. So this test recomputes the ratios from
 * both files and fails on any pair below 4.5:1 (AA, normal text).
 *
 * The tokens below are the ones used as TEXT. `--gw-accent-purple` and
 * `--gw-accent-ink` are fills/graphics (3:1 is their bar), so they are not
 * asserted here.
 */

const here = dirname(fileURLToPath(import.meta.url))
const themeCss = readFileSync(resolve(here, '../theme/theme.css'), 'utf8')
const globalsCss = readFileSync(resolve(here, '../../../../apps/web/app/globals.css'), 'utf8')

const TEXT_TOKENS = [
  '--gw-text-primary',
  '--gw-text-secondary',
  '--gw-text-muted',
  '--gw-accent-gold',
  '--gw-success',
  '--gw-warning',
  '--gw-error',
]

const BACKGROUND_TOKENS = ['--gw-bg-primary', '--gw-bg-secondary', '--gw-bg-tertiary']

/** Badge backgrounds that carry `--gw-bg-primary` as their text colour. */
const BADGE_TOKENS = ['--gw-success', '--gw-warning', '--gw-text-muted']

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Extract the `key: value` declarations of one CSS block. */
function parseBlock(css: string, selector: string): Record<string, string> {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`bloc CSS introuvable : ${selector}`)

  const out: Record<string, string> = {}
  for (const declaration of (match[1] ?? '').split(';')) {
    const index = declaration.indexOf(':')
    if (index === -1) continue
    const key = declaration.slice(0, index).trim()
    const value = declaration.slice(index + 1).trim()
    if (key && value) out[key] = value
  }
  return out
}

function channelLuminance(value: number): number {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const digits = hex.trim().replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255)
  return 0.2126 * channelLuminance(r!) + 0.7152 * channelLuminance(g!) + 0.0722 * channelLuminance(b!)
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground)
  const b = luminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

const THEMES = [
  { name: 'sombre', selector: ':root' },
  { name: "clair", selector: "[data-theme='light']" },
] as const

describe('contraste du theme (WCAG AA 4.5:1)', () => {
  for (const file of [
    { label: 'packages/ui theme.css', css: themeCss },
    { label: 'apps/web globals.css', css: globalsCss },
  ]) {
    for (const theme of THEMES) {
      const tokens = parseBlock(file.css, theme.selector)

      it(`${file.label} - theme ${theme.name} : tout le texte atteint 4.5:1`, () => {
        const failures: string[] = []
        for (const text of TEXT_TOKENS) {
          for (const background of BACKGROUND_TOKENS) {
            const ratio = contrast(tokens[text]!, tokens[background]!)
            if (ratio < 4.5) {
              failures.push(`${text} (${tokens[text]}) sur ${background} (${tokens[background]}) = ${ratio.toFixed(2)}`)
            }
          }
        }
        expect(failures, failures.join(' | ')).toEqual([])
      })

      it(`${file.label} - theme ${theme.name} : les pastilles d'etat restent lisibles`, () => {
        const failures: string[] = []
        for (const badge of BADGE_TOKENS) {
          const ratio = contrast(tokens['--gw-bg-primary']!, tokens[badge]!)
          if (ratio < 4.5) {
            failures.push(`--gw-bg-primary sur ${badge} (${tokens[badge]}) = ${ratio.toFixed(2)}`)
          }
        }
        expect(failures, failures.join(' | ')).toEqual([])
      })
    }
  }

  it('les deux fichiers definissent les memes couleurs (pas de derive)', () => {
    const drift: string[] = []
    for (const theme of THEMES) {
      const a = parseBlock(themeCss, theme.selector)
      const b = parseBlock(globalsCss, theme.selector)
      for (const token of [...TEXT_TOKENS, ...BACKGROUND_TOKENS]) {
        if (a[token] !== b[token]) {
          drift.push(`${theme.name} ${token}: theme.css=${a[token]} globals.css=${b[token]}`)
        }
      }
    }
    expect(drift, drift.join(' | ')).toEqual([])
  })

  it('@theme (classes Tailwind) et :root (variables inline) sont alignes', () => {
    const tw = parseBlock(globalsCss, '@theme')
    const root = parseBlock(globalsCss, ':root')
    const drift: string[] = []
    for (const token of [...TEXT_TOKENS, ...BACKGROUND_TOKENS]) {
      const colorKey = `--color-gw-${token.replace('--gw-', '')}`
      if (tw[colorKey] !== root[token]) {
        drift.push(`${colorKey}=${tw[colorKey]} vs ${token}=${root[token]}`)
      }
    }
    expect(drift, drift.join(' | ')).toEqual([])
  })
})
