import type { UacsCodeSegmentBase, MfoPapType } from './commonTypes'

/**
 * MFO/PAP (9 digits - PREXC aligned)
 * Represents Major Final Output / Programs, Activities, and Projects
 */
export interface MfoPap extends UacsCodeSegmentBase {
  code: string // Must be exactly 9 digits
  type: MfoPapType
  parentId?: string
  prexcAligned: boolean
  children?: MfoPap[]
}
