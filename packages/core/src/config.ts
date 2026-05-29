import type { AppConfig } from './types/config.js'

export const DEFAULT_CONFIG: AppConfig = {
  appVersion: '0.1.0',
  appName: 'Glyph Weaver',
  recognition: {
    minConfidence: 0.65,
    rotationResolution: 360,
    rasterGridSize: 64,
    maskRadius: 3,
    inkOverlapThreshold: 0.3,
    structuralWeight: 0.25,
    compositionalWeight: 0.15,
    positionWeight: 0.30,
    sizeWeight: 0.10,
  },
  renderer: {
    particleCap: 500,
    portalOpacity: 0.15,
    effectOpacity: 0.85,
    defaultEffectScale: 1.5,
    minEffectScale: 1.0,
    maxEffectScale: 2.35,
    defaultDuration: 4.0,
    minDuration: 0.65,
    maxDuration: 8.5,
    fps: 60,
  },
  compiler: {
    maxForce: 1.0,
    maxSpread: 1.0,
    maxFocus: 1.0,
    maxRange: 1.0,
    defaultGravity: 1.0,
    maxTiltDeg: 76,
  },
}
