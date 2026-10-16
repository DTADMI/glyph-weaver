import { ImageResponse } from 'next/og'

// The icon is generated from code, not committed as a binary: the app has no
// brand asset file, and a single source keeps the favicon, the Apple touch icon
// and the PWA icons identical. The ring is the app's own motif (glyph rings).
export const dynamic = 'force-static'

export function generateStaticParams() {
  return [{ size: '192' }, { size: '512' }]
}

function GlyphIcon({ px }: { px: number }) {
  const stroke = Math.max(3, Math.round(px * 0.045))
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1423',
      }}
    >
      <div
        style={{
          width: px * 0.64,
          height: px * 0.64,
          borderRadius: '50%',
          border: `${stroke}px solid #d4a853`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: px * 0.38,
            height: px * 0.38,
            borderRadius: '50%',
            border: `${stroke}px solid #7b5ea7`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: px * 0.12,
              height: px * 0.12,
              borderRadius: '50%',
              backgroundColor: '#f0e6d3',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const px = size === '512' ? 512 : 192
  return new ImageResponse(<GlyphIcon px={px} />, { width: px, height: px })
}
