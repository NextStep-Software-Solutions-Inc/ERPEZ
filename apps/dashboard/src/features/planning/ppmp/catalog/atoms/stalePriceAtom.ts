/**
 * Stale Price Atoms
 * Configuration and derived state for detecting stale pricing.
 */

import { atom } from 'jotai'
import { getDaysAgo } from '../utils/catalogFormatters'
import type { NonCseCatalogItem } from '../types'

/** Number of days after which a price is considered stale (default 180 = 6 months) */
export const stalePriceThresholdAtom = atom(180)

/**
 * Derives stale item IDs from a given list of items.
 * Use this in a component that has access to the loaded items.
 */
export function getStalePriceIds(
  items: NonCseCatalogItem[],
  thresholdDays: number,
): Set<string> {
  return new Set(
    items
      .filter((item) => getDaysAgo(item.lastSurveyDate) > thresholdDays)
      .map((item) => item.id),
  )
}

/**
 * Checks whether a single item's price is stale.
 */
export function isItemPriceStale(
  lastSurveyDate: string,
  thresholdDays: number,
): boolean {
  return getDaysAgo(lastSurveyDate) > thresholdDays
}
