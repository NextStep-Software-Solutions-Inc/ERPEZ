/**
 * Mock in-memory store for sub-procurement modes.
 * This is a temporary stub until the API endpoint is available.
 *
 * TODO: Replace with real API handlers once the backend exposes
 * POST/GET /procurement-modes/:parentId/sub-modes
 */

export interface SubProcurementMode {
  id: string
  parentModeId: string
  parentModeName: string | null
  modeName: string
  description: string | null
  categoryId: string
  categoryName: string | null
  /** Must be >= parent minThreshold */
  minThreshold: number
  /** Must be <= parent maxThreshold (when parent has one) */
  maxThreshold: number | null
  isActive: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string | null
}

// Module-scoped in-memory list
let _subModes: SubProcurementMode[] = []
// Tracks which parent IDs have already been seeded to avoid duplicates
const _seededParents = new Set<string>()

export function getMockSubModes(): SubProcurementMode[] {
  return [..._subModes]
}

export function getMockSubModesForParent(
  parentModeId: string,
): SubProcurementMode[] {
  return _subModes.filter((m) => m.parentModeId === parentModeId)
}

export function addMockSubMode(
  data: Omit<SubProcurementMode, 'id' | 'createdAt' | 'updatedAt'>,
): SubProcurementMode {
  const newEntry: SubProcurementMode = {
    ...data,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }
  _subModes = [..._subModes, newEntry]
  return newEntry
}

export function removeMockSubMode(id: string): void {
  _subModes = _subModes.filter((m) => m.id !== id)
}

export function updateMockSubMode(
  id: string,
  data: Partial<Omit<SubProcurementMode, 'id' | 'createdAt' | 'parentModeId' | 'parentModeName' | 'categoryId' | 'categoryName'>>,
): SubProcurementMode | null {
  const index = _subModes.findIndex((m) => m.id === id)
  if (index === -1) return null
  const updated: SubProcurementMode = {
    ..._subModes[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  _subModes = [
    ..._subModes.slice(0, index),
    updated,
    ..._subModes.slice(index + 1),
  ]
  return updated
}

/**
 * Seeds demo sub-modes for the first two parents that have a threshold
 * configured. Called once when the tab mounts; subsequent calls are no-ops.
 */
export interface SeedableParent {
  id: string
  modeName: string | null
  minThreshold: number
  maxThreshold: number | null
  categoryId: string
  categoryName: string | null
}

export function seedMockSubModes(parents: SeedableParent[]): void {
  // Only seed parents that don't have any sub-modes currently in the store
  const eligible = parents.filter(
    (p) => !_subModes.some((m) => m.parentModeId === p.id),
  )

  // Seed the first two eligible parents with 2 sub-modes each
  eligible.slice(0, 2).forEach((parent, pIdx) => {
    _seededParents.add(parent.id)

    const baseMin = parent.minThreshold ?? 0
    const baseMax = parent.maxThreshold ?? null

    // Build two plausible sub-ranges that stay within bounds
    const ranges: Array<[number, number | null]> =
      baseMax !== null
        ? [
            [baseMin, Math.floor(baseMin + (baseMax - baseMin) * 0.4)],
            [Math.floor(baseMin + (baseMax - baseMin) * 0.4) + 1, baseMax],
          ]
        : [
            [baseMin, baseMin + 500_000],
            [baseMin + 500_001, null],
          ]

    const labels =
      pIdx === 0
        ? ['Small Value Procurement', 'Negotiated Procurement']
        : ['Limited Source Bidding', 'Direct Contracting']

    const descriptions = [
      'For goods/services below the threshold limit.',
      'For infrastructure projects requiring specialized suppliers.',
    ]

    ranges.forEach(([min, max], i) => {
      addMockSubMode({
        parentModeId: parent.id,
        parentModeName: parent.modeName,
        modeName: labels[i] ?? `Sub-mode ${i + 1}`,
        description: descriptions[i] ?? null,
        categoryId: parent.categoryId,
        categoryName: parent.categoryName,
        minThreshold: min,
        maxThreshold: max,
        isActive: true,
        isArchived: false,
      })
    })
  })
}
