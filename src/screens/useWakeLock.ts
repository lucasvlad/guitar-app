import { useEffect } from 'react'

// Keeps the screen on while active. The lock drops when the page is hidden,
// so it is re-requested when the page becomes visible. Failures are ignored.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let live = true
    const request = () => {
      if (document.visibilityState !== 'visible') return
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (live) lock = l
          else l.release().catch(() => {})
        })
        .catch(() => {})
    }
    const onVisibility = () => request()
    request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      live = false
      document.removeEventListener('visibilitychange', onVisibility)
      lock?.release().catch(() => {})
    }
  }, [active])
}
