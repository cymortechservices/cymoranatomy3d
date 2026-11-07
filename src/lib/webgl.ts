/** Detects whether a WebGL context can be created, so the app can show a 2D fallback instead of crashing. */
let cached: boolean | null = null

export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    cached = !!gl
  } catch {
    cached = false
  }
  return cached
}
