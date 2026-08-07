import type { BACMilestones } from '../types'

/**
 * Generate realistic mock milestones for a BAC line item
 * Based on random month selection for procurement timeline
 * 
 * @param _modeOfProcurement - Mode of procurement (not used in current mock)
 * @returns BACMilestones object with month/year values
 */
export function generateMockMilestones(_modeOfProcurement: string): BACMilestones {
  const baseMonth = Math.floor(Math.random() * 10) + 1 // Jan-Oct
  const nextMonth = (baseMonth % 12) + 1
  const baseYearMonth = `${String(baseMonth).padStart(2, '0')}/2024`
  const nextYearMonth = `${String(nextMonth).padStart(2, '0')}/2024`

  return {
    advertisementDate: baseYearMonth,
    submissionDate: nextYearMonth,
    noticeOfAwardDate: nextYearMonth,
    contractSigningDate: `${String((nextMonth % 12) + 1).padStart(2, '0')}/2024`,
  }
}
