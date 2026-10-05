/**
 * APR Optimistic Local Storage Utilities
 * Provides resilient, TTL-bounded caching for optimistic APR-to-PR links
 * with automatic cross-tab synchronization and proactive garbage collection on mount.
 */

export interface OptimisticAPR_PR {
  id: string
  prNumber: string
  status: string
  timestamp: number
}

export const APR_PR_STORAGE_PREFIX = 'apr_pr_'
export const APR_PR_DEFAULT_TTL_MS = 60 * 1000 // 60 seconds

/**
 * Sweeps and removes all stale, expired, or malformed `apr_pr_*` entries from localStorage.
 * Safe to execute on page mount, unmount, or during transitions.
 */
export function sweepStaleOptimisticPRs(ttlMs = APR_PR_DEFAULT_TTL_MS): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    const keysToRemove: string[] = []
    const now = Date.now()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(APR_PR_STORAGE_PREFIX)) {
        const item = localStorage.getItem(key)
        if (!item) {
          keysToRemove.push(key)
          continue
        }

        try {
          const parsed = JSON.parse(item)
          const timestamp = typeof parsed?.timestamp === 'number' ? parsed.timestamp : 0
          const hasValidProps = parsed?.id && parsed?.prNumber
          const isExpired = !timestamp || now - timestamp > ttlMs

          if (!hasValidProps || isExpired) {
            keysToRemove.push(key)
          }
        } catch {
          // Unparseable / corrupted JSON
          keysToRemove.push(key)
        }
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch (err) {
    console.warn('Failed to sweep stale optimistic PR storage:', err)
  }
}

/**
 * Saves an optimistic PR mapping for an APR with an active timestamp.
 * Also triggers a sweep of stale entries to prevent storage bloat.
 */
export function saveOptimisticPR(
  aprId: string,
  pr: { id: string; prNumber: string; status?: string }
): void {
  if (!aprId || typeof window === 'undefined' || !window.localStorage) return

  try {
    // Proactively clean up expired entries before writing
    sweepStaleOptimisticPRs()

    const key = `${APR_PR_STORAGE_PREFIX}${aprId}`
    const payload: OptimisticAPR_PR = {
      id: pr.id,
      prNumber: pr.prNumber,
      status: pr.status || 'Draft',
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (err) {
    console.warn(`Failed to save optimistic PR for APR ${aprId}:`, err)
  }
}

/**
 * Retrieves the optimistic PR for an APR if present and not expired.
 * Automatically purges the key if expired.
 */
export function getOptimisticPR(
  aprId: string,
  ttlMs = APR_PR_DEFAULT_TTL_MS
): OptimisticAPR_PR | null {
  if (!aprId || typeof window === 'undefined' || !window.localStorage) return null

  const key = `${APR_PR_STORAGE_PREFIX}${aprId}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as OptimisticAPR_PR
    const timestamp = typeof parsed?.timestamp === 'number' ? parsed.timestamp : 0
    const isExpired = !timestamp || Date.now() - timestamp > ttlMs

    if (isExpired || !parsed?.id || !parsed?.prNumber) {
      localStorage.removeItem(key)
      return null
    }

    return parsed
  } catch (err) {
    localStorage.removeItem(key)
    return null
  }
}

/**
 * Removes the optimistic PR entry for an APR.
 */
export function removeOptimisticPR(aprId: string): void {
  if (!aprId || typeof window === 'undefined' || !window.localStorage) return

  try {
    localStorage.removeItem(`${APR_PR_STORAGE_PREFIX}${aprId}`)
  } catch (err) {
    console.warn(`Failed to remove optimistic PR for APR ${aprId}:`, err)
  }
}
