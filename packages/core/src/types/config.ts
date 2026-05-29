export interface RecognitionConfig {
  minConfidence: number
  rotationResolution: number
  rasterGridSize: number
  maskRadius: number
  inkOverlapThreshold: number
  structuralWeight: number
  compositionalWeight: number
  positionWeight: number
  sizeWeight: number
}

export interface RendererConfig {
  particleCap: number
  portalOpacity: number
  effectOpacity: number
  defaultEffectScale: number
  minEffectScale: number
  maxEffectScale: number
  defaultDuration: number
  minDuration: number
  maxDuration: number
  fps: number
}

export interface CompilerConfig {
  maxForce: number
  maxSpread: number
  maxFocus: number
  maxRange: number
  defaultGravity: number
  maxTiltDeg: number
}

export interface AppConfig {
  appVersion: string
  appName: string
  recognition: RecognitionConfig
  renderer: RendererConfig
  compiler: CompilerConfig
}
