/**
 * Transform Personnel Data Utility
 * Converts API personnel position response to user profile format
 * Location: src/features/planning/market-scoping/utils/
 */

import type { PersonnelPosition } from '../handlers/getPersonnelPositionsRequest'

export interface TransformedUserProfile {
  userId: string
  name: string
  designation: string
  departmentUnit: string
  agencyName: string
}

/**
 * Transforms PersonnelPosition data to UserProfile format
 */
export function transformPersonnelToUserProfile(
  personnel: PersonnelPosition
): TransformedUserProfile {
  return {
    userId: personnel.userId,
    name: personnel.user.fullName,
    designation: personnel.position.title,
    departmentUnit: personnel.position.officeName || personnel.user.officeName,
    agencyName: personnel.user.officeName,
  }
}
