import type { ToolType } from '../state/types.js'

const CURSOR_CACHE = new Map<string, string>()

function createCursorSvg(shape: string, color = '#d4a853', size = 24): string {
  const key = `${shape}-${color}-${size}`
  const cached = CURSOR_CACHE.get(key)
  if (cached) return cached

  const svg = getSvgContent(shape, color, size)
  const encoded = btoa(svg)
  const url = `data:image/svg+xml;base64,${encoded}`
  CURSOR_CACHE.set(key, url)
  return url
}

function getSvgContent(shape: string, color: string, size: number): string {
  const half = size / 2
  switch (shape) {
    case 'pen':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${half}" cy="${half}" r="${half * 0.35}" fill="${color}" opacity="0.8"/>
        <circle cx="${half}" cy="${half}" r="${half * 0.15}" fill="${color}"/>
      </svg>`
    case 'eraser':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect x="${half * 0.2}" y="${half * 0.2}" width="${half * 1.6}" height="${half * 1.6}" rx="2" fill="${color}" opacity="0.7"/>
        <rect x="${half * 0.4}" y="${half * 0.4}" width="${half * 1.2}" height="${half * 1.2}" rx="1" fill="${color}" opacity="0.4"/>
      </svg>`
    case 'select':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="M ${half * 0.3} ${half * 0.3} L ${half * 1.7} ${half * 1.7}" stroke="${color}" stroke-width="2"/>
        <path d="M ${half * 1.7} ${half * 0.3} L ${half * 0.3} ${half * 1.7}" stroke="${color}" stroke-width="2"/>
        <circle cx="${half}" cy="${half}" r="2" fill="${color}"/>
      </svg>`
    case 'hand':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="M ${half * 0.5} ${half * 1.2} L ${half * 0.5} ${half * 0.5} Q ${half * 0.5} ${half * 0.2} ${half} ${half * 0.3} Q ${half * 1.5} ${half * 0.2} ${half * 1.5} ${half * 0.7} L ${half * 1.5} ${half * 1.5}" stroke="${color}" stroke-width="2" fill="none"/>
      </svg>`
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${half}" cy="${half}" r="${half * 0.3}" fill="${color}" opacity="0.8"/>
      </svg>`
  }
}

export function getCursorStyle(tool: ToolType): string {
  switch (tool) {
    case 'pen':
      return `url('${createCursorSvg('pen')}') 12 12, crosshair`
    case 'eraser':
      return `url('${createCursorSvg('eraser')}') 12 12, crosshair`
    case 'select':
      return `url('${createCursorSvg('select')}') 12 12, crosshair`
    case 'hand':
      return `url('${createCursorSvg('hand')}') 12 12, grab`
    default:
      return 'crosshair'
  }
}

export function clearCursorCache(): void {
  CURSOR_CACHE.clear()
}
