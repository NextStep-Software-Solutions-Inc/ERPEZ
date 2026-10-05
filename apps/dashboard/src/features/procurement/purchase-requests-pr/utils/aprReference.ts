/**
 * APR Reference Utilities
 * Robust, null-safe helpers for extracting and resolving relational APR properties
 * across PR components, with strict boundaries to handle any description format drift.
 */

import type { PurchaseRequest } from '../types'

export interface ParsedAPRReference {
  aprId?: string
  aprNumber?: string
}

/**
 * Safely parses APR ID or APR Number from a description string if present.
 * Uses strict boundaries to prevent runtime exceptions or malformed values.
 */
export function parseAprReferenceFromDescription(
  description?: string | null
): ParsedAPRReference {
  if (typeof description !== 'string' || !description.trim()) {
    return {}
  }

  let aprId: string | undefined
  let aprNumber: string | undefined

  try {
    // 1. Explicit tag: [APR:UUID-or-Code]
    const idMatch = description.match(/\[APR:\s*([a-zA-Z0-9_-]+)\s*\]/i)
    if (idMatch?.[1]) {
      const candidateId = idMatch[1].trim()
      if (
        candidateId.length > 0 &&
        candidateId.toLowerCase() !== 'null' &&
        candidateId.toLowerCase() !== 'undefined'
      ) {
        aprId = candidateId
      }
    }

    // 2. Prefixed phrase: "Sourced from APR: APR-2026-002"
    // Stops before brackets, semicolons, commas, or line endings
    const numMatch = description.match(/Sourced from APR:\s*([^\[;,<\n\r]+)/i)
    if (numMatch?.[1]) {
      const candidateNum = numMatch[1].trim()
      if (
        candidateNum.length > 0 &&
        candidateNum.toLowerCase() !== 'null' &&
        candidateNum.toLowerCase() !== 'undefined'
      ) {
        aprNumber = candidateNum
      }
    }
  } catch (err) {
    console.warn('Failed to parse APR reference from description string:', err)
  }

  return { aprId, aprNumber }
}

/**
 * Resolves the authoritative relational APR identifiers for a given Purchase Request.
 * Prioritizes direct entity/header relational properties, then item-level relations,
 * and finally falls back to safe text parsing with boundary checks.
 */
export function resolveRelationalAPR(
  pr?: Partial<PurchaseRequest> | null
): ParsedAPRReference {
  if (!pr) return {}

  const header = pr.headerDetails
  const items = Array.isArray(pr.items) ? pr.items : []
  const descFallback = parseAprReferenceFromDescription(header?.description)

  // APR ID: header -> root PR -> item relation -> parsed fallback
  const candidateId =
    (typeof header?.aprId === 'string' && header.aprId.trim()) ||
    (typeof pr.aprId === 'string' && pr.aprId.trim()) ||
    items.find((it) => typeof it.aprId === 'string' && it.aprId.trim())?.aprId?.trim() ||
    descFallback.aprId

  // APR Number: header -> root PR -> item relation -> parsed fallback
  const candidateNumber =
    (typeof header?.aprNumber === 'string' && header.aprNumber.trim()) ||
    (typeof pr.aprNumber === 'string' && pr.aprNumber.trim()) ||
    items.find((it) => typeof it.aprNumber === 'string' && it.aprNumber.trim())?.aprNumber?.trim() ||
    descFallback.aprNumber

  return {
    aprId: candidateId || undefined,
    aprNumber: candidateNumber || undefined,
  }
}
