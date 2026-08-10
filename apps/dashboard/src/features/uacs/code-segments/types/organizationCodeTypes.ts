import type { UacsCodeSegmentBase } from './commonTypes'

/**
 * Organization Code (12 digits)
 * Represents organizational units/departments
 */
export interface OrganizationCode extends UacsCodeSegmentBase {
  code: string // Must be exactly 12 digits
  parentId?: string
  level?: number
  departmentCode?: string
  type?: string
}

/**
 * Payload types for API requests
 */
export interface CreateOrganizationCodePayload {
  parentId?: string | null
  code: string // Must be exactly 12 digits
  name: string
  type: string
  isActive?: boolean
}

export interface UpdateOrganizationCodePayload extends Partial<CreateOrganizationCodePayload> {}
