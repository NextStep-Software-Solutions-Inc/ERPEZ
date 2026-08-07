/**
 * Cost Master Atoms
 * Shared state for cost master library management and selection.
 */

import { atom } from 'jotai'
import type {
  CostItemMaster,
  CreateCostItemInput,
  UpdateCostItemInput,
} from '../types'
import { MOCK_COST_MASTER_ITEMS } from '../data/mockCostMasterData'

function generateCostItemId() {
  return `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneCostItem(item: CostItemMaster): CostItemMaster {
  return {
    ...item,
    createdDate: new Date(item.createdDate),
    lastModified: new Date(item.lastModified),
  }
}

export const costMasterItemsAtom = atom<CostItemMaster[]>(
  MOCK_COST_MASTER_ITEMS.map(cloneCostItem),
)

export const activeCostMasterItemsAtom = atom((get) =>
  get(costMasterItemsAtom).filter((item) => item.isActive),
)

export const inactiveCostMasterItemsAtom = atom((get) =>
  get(costMasterItemsAtom).filter((item) => !item.isActive),
)

export const createCostItemAtom = atom(
  null,
  (_get, set, input: CreateCostItemInput) => {
    const newItem: CostItemMaster = {
      id: generateCostItemId(),
      costItemName: input.costItemName,
      category: input.category,
      subcategory: input.subcategory ?? null,
      standardUnitCost: input.standardUnitCost,
      unitOfMeasure: input.unitOfMeasure,
      description: input.description,
    uacsCode: input.uacsCode ?? null,
    isActive: input.isActive ?? true,
    isCSE: input.isCSE ?? false,
    createdDate: new Date(),
    lastModified: new Date(),
  }

    set(costMasterItemsAtom, (prev) => [newItem, ...prev])
  },
)

export const updateCostItemAtom = atom(
  null,
  (_get, set, { costItemId, changes }: UpdateCostItemInput) => {
    set(costMasterItemsAtom, (prev) =>
      prev.map((item) =>
        item.id === costItemId
          ? {
              ...item,
              ...changes,
              subcategory: changes.subcategory ?? null,
              uacsCode: changes.uacsCode ?? null,
              isCSE: changes.isCSE ?? item.isCSE ?? false,
              lastModified: new Date(),
            }
          : item,
      ),
    )
  },
)

export const toggleCostItemActiveAtom = atom(
  null,
  (_get, set, costItemId: string) => {
    set(costMasterItemsAtom, (prev) =>
      prev.map((item) =>
        item.id === costItemId
          ? {
              ...item,
              isActive: !item.isActive,
              lastModified: new Date(),
            }
          : item,
      ),
    )
  },
)
