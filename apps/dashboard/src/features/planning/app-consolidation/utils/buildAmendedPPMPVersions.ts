import {
  getMockAmendedPPMPsByPPMPId,
  getMockPPMPsByPPMPId,
  MOCK_AMENDED_PPMPS,
} from '../__mocks__/ppmpMocks'
import type { PPMPVersion } from '../types'

/**
 * Build amended PPMP versions for the supplemental APP dialog.
 * Groups amended items by their base PPMP and creates selectable versions.
 * 
 * @returns Array of PPMP versions ready for selection UI
 */
export function buildAmendedPPMPVersions(): PPMPVersion[] {
  // Extract unique base PPMP IDs from amended items
  const basePPMPIds = new Set<string>()
  MOCK_AMENDED_PPMPS.forEach((item) => {
    const baseId = item.id.replace('-v1.1', '').split('-').slice(0, 3).join('-')
    basePPMPIds.add(baseId)
  })

  // Build version objects for each amended PPMP
  const versions: PPMPVersion[] = []
  basePPMPIds.forEach((baseId) => {
    const amendedItems = getMockAmendedPPMPsByPPMPId(`${baseId}-v1.1`)
    const baselineItems = getMockPPMPsByPPMPId(baseId)

    if (amendedItems.length === 0) return

    // Calculate delta quantities
    const deltaCount = amendedItems.length - baselineItems.length
    const totalAmendedBudget = amendedItems.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalBaseBudget = baselineItems.reduce((sum, item) => sum + item.totalAmount, 0)
    const budgetIncrease = totalAmendedBudget - totalBaseBudget

    versions.push({
      id: `ppmp-version-${baseId}`,
      ppmpId: baseId,
      version: '1.1',
      label: `${baseId} (Amended)`,
      description: `${amendedItems.length} items (${deltaCount > 0 ? '+' : ''}${deltaCount} new), ₱${budgetIncrease.toLocaleString('en-PH')} budget change`,
      items: amendedItems,
    })
  })

  return versions
}
