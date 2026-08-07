// UNSPSC Code Types based on API documentation

// Re-export the canonical API type to avoid duplication and drift.
// Use the UNSPSCCodeResponse defined in the procurement-library types as the single source of truth.
export type { UNSPSCCodeResponse as UNSPSCCode } from '../../components/features/planning/procurement-library/types'
import type { UNSPSCCodeResponse } from '../../components/features/planning/procurement-library/types'

export type UNSPSCCodeWithChildren = UNSPSCCodeResponse & {
  children?: UNSPSCCodeWithChildren[] | null
}
