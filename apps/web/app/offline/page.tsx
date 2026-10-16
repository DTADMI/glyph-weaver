import { cookies, headers } from 'next/headers'
import { getServerTranslations, resolveLocale } from '@glyph-weaver/ui'

export const metadata = { title: 'Glyph Weaver - Offline' }

/**
 * Fallback the service worker serves when a navigation cannot reach the
 * network. It lives in the app (not in the service worker) so it inherits the
 * theme and the locale, and it tells the truth: the drawing is in the browser,
 * nothing was sent anywhere.
 */
export default async function OfflinePage() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('glyph-weaver-locale')?.value
  const acceptLanguage = (await headers()).get('accept-language') ?? undefined
  const locale = resolveLocale(localeCookie, acceptLanguage)
  const { t } = getServerTranslations(locale)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-gw-accent-gold">{t('offline.title')}</h1>
      <p className="max-w-md text-gw-text-secondary">{t('offline.message')}</p>
      <a
        href="/"
        className="rounded-md border border-gw-border-active px-4 py-2 text-gw-text-primary transition-colors hover:bg-gw-bg-tertiary"
      >
        {t('offline.retry')}
      </a>
    </main>
  )
}
