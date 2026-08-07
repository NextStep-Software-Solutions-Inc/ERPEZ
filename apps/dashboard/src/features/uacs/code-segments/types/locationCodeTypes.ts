import type { UacsCodeSegmentBase } from './commonTypes'

/**
 * Location Code (9 digits)
 * Represents geographical locations
 */
export interface LocationCode extends UacsCodeSegmentBase {
  code: string // Must be exactly 9 digits
  region?: string
  province?: string
  municipality?: string
}

/**
 * Payload types for API requests
 */
export interface CreateLocationCodePayload {
  code: string // Must be exactly 9 digits
  name: string
  region?: string
  province?: string
  municipality?: string
  isActive?: boolean
}

export interface UpdateLocationCodePayload extends Partial<CreateLocationCodePayload> {}
