/**
 * Centralized constants for APP (Annual Procurement Plan) consolidation feature
 * Ensures consistency across all dialogs, tables, and forms
 */

/**
 * Standard Mode of Procurement (MoP) options
 * These values are used consistently across:
 * - EditAPPBACDialog (BAC auto-population)
 * - BACLineItemsTable (MoP dropdown)
 * - Any other components that reference procurement modes
 *
 * IMPORTANT: Do not use different casing or wording elsewhere in the feature.
 * If MoP values come from backend API, ensure they match these values exactly.
 */
export const MODE_OF_PROCUREMENT_OPTIONS = [
  'Competitive Bidding',
  'Canvassing / Limited Source Bidding',
  'Direct Contracting',
  'Agency-to-Agency Procurement',
] as const

export type ModeOfProcurement = (typeof MODE_OF_PROCUREMENT_OPTIONS)[number]

/**
 * Helper function to validate if a string is a valid MoP
 */
export function isValidModeOfProcurement(value: string): value is ModeOfProcurement {
  return MODE_OF_PROCUREMENT_OPTIONS.includes(value as ModeOfProcurement)
}

/**
 * Helper to get all MoP options as an array
 * Useful for dropdowns and form validation
 */
export function getMoPOptions(): readonly string[] {
  return MODE_OF_PROCUREMENT_OPTIONS
}
