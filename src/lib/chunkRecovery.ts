const RECOVERY_KEY = 'joes-shop:chunk-recovery-at'
const REFRESH_PARAM = '_app_refresh'
const RECOVERY_COOLDOWN_MS = 30_000

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /loading chunk .+ failed/i,
  /unable to preload css/i,
]

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function lastRecoveryAt(): number {
  try {
    return Number(window.sessionStorage.getItem(RECOVERY_KEY) || 0)
  } catch {
    return 0
  }
}

function markRecovery(now: number) {
  try {
    window.sessionStorage.setItem(RECOVERY_KEY, String(now))
  } catch {
    // A cache-busted navigation still works when storage is unavailable.
  }
}

export function reloadLatestBuild(force = false): boolean {
  const now = Date.now()
  if (!force && now - lastRecoveryAt() < RECOVERY_COOLDOWN_MS) return false

  markRecovery(now)
  const url = new URL(window.location.href)
  url.searchParams.set(REFRESH_PARAM, String(now))
  window.location.replace(url.toString())
  return true
}

export function recoverChunkLoad(error: unknown, force = false): boolean {
  return isChunkLoadError(error) && reloadLatestBuild(force)
}

export function installChunkRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    const preloadEvent = event as Event & { payload?: unknown }
    if (recoverChunkLoad(preloadEvent.payload)) event.preventDefault()
  })

  // Keep the cache-busting parameter out of copied URLs after the new HTML loads.
  const url = new URL(window.location.href)
  if (url.searchParams.has(REFRESH_PARAM)) {
    url.searchParams.delete(REFRESH_PARAM)
    window.history.replaceState(window.history.state, '', url.toString())
  }
}
