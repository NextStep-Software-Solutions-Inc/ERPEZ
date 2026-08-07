/**
 * useStalePriceDetection
 * Calculates stale price state for a single item or list of items.
 */

import { useAtomValue } from 'jotai'
import {
  stalePriceThresholdAtom,
  isItemPriceStale,
} from '../atoms/stalePriceAtom'
import { getDaysAgo } from '../utils/catalogFormatters'

export function useStalePriceDetection(lastSurveyDate: string) {
  const threshold = useAtomValue(stalePriceThresholdAtom)
  const daysAgo = getDaysAgo(lastSurveyDate)
  const isStale = isItemPriceStale(lastSurveyDate, threshold)

  return { isStale, daysAgo, threshold }
}
