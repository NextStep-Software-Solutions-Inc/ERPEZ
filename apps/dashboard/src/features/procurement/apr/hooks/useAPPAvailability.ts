/**
 * Hook for validating APP availability
 * Used before APR submission to ensure source APP still exists and is valid
 */

import { useMemo } from 'react'
import type { AppMaster } from '@/features/planning/app-consolidation/types'
import { getAPPInvalidReason } from '../utils/handleAPPNotFound'
import type { APPNotFoundError } from '../utils/handleAPPNotFound'

export interface UseAPPAvailabilityOptions {
  app: AppMaster | null
  enabled?: boolean
}

export interface UseAPPAvailabilityResult {
  isAvailable: boolean
  error: APPNotFoundError | null
  isLoading: boolean
}

/**
 * Hook to check if APP is still available and valid
 * Useful for:
 * - Pre-submission validation
 * - Real-time APP availability checking
 * - Displaying error messages when APP becomes unavailable
 */
export function useAPPAvailability({
  app,
  enabled = true,
}: UseAPPAvailabilityOptions): UseAPPAvailabilityResult {
  const validation = useMemo(() => {
    if (!enabled || !app) {
      return {
        isAvailable: false,
        error: getAPPInvalidReason(null),
      }
    }

    const error = getAPPInvalidReason(app)
    return {
      isAvailable: error === null,
      error,
    }
  }, [enabled, app])

  return {
    isAvailable: validation.isAvailable,
    error: validation.error,
    isLoading: false,
  }
}
