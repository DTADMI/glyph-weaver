export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Args) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delayMs)
  }
}

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  intervalMs: number,
): (...args: Args) => void {
  let lastTime = 0
  let pendingArgs: Args | null = null
  let pendingTimer: ReturnType<typeof setTimeout> | null = null

  return (...args: Args) => {
    const now = Date.now()
    if (now - lastTime >= intervalMs) {
      lastTime = now
      fn(...args)
    } else {
      pendingArgs = args
      if (pendingTimer === null) {
        pendingTimer = setTimeout(() => {
          pendingTimer = null
          lastTime = Date.now()
          if (pendingArgs) {
            fn(...pendingArgs)
            pendingArgs = null
          }
        }, intervalMs - (now - lastTime))
      }
    }
  }
}
