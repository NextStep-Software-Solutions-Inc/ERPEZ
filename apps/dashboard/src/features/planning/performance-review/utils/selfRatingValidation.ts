import type { EvaluationSession } from '../types'
import type { PerformanceCalculationResult } from '../hooks/usePerformanceCalculation'

export function validateSelfRatingSubmission(
  session: EvaluationSession,
  calc: PerformanceCalculationResult,
) {
  const incomplete = session.kpiItems.filter(
    (item) => calc.kpiAverages[item.id]?.self === null,
  )
  if (incomplete.length > 0) {
    return `Complete ratings for: ${incomplete
      .slice(0, 2)
      .map((item) => item.successIndicator)
      .join(', ')}${incomplete.length > 2 ? ` + ${incomplete.length - 2} more` : ''}`
  }

  const missingMov = session.kpiItems.filter(
    (item) => item.isMOVEditable && item.movFiles.length === 0,
  )
  if (missingMov.length > 0) {
    return `Missing MOV evidence for: ${missingMov
      .slice(0, 2)
      .map((item) => item.successIndicator)
      .join(', ')}${missingMov.length > 2 ? ` + ${missingMov.length - 2} more` : ''}`
  }

  const missingJustification = session.kpiItems.filter(
    (item) => item.actual.trim() && !item.justification.trim(),
  )
  if (missingJustification.length > 0) {
    return `Justification required for items with actual accomplishment: ${missingJustification
      .slice(0, 2)
      .map((item) => item.successIndicator)
      .join(', ')}`
  }

  return null
}
