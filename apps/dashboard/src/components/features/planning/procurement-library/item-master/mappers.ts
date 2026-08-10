import type { ItemMaster } from '../types'
import type { ProcurementItem } from './types'

const normalizeItemType = (type: string): ItemMaster['itemType'] => {
  const map: Record<string, ItemMaster['itemType']> = {
    expendable: 'Expendable',
    Expendable: 'Expendable',
    'semi expendable': 'SemiExpendable',
    semiexpendable: 'SemiExpendable',
    SemiExpendable: 'SemiExpendable',
    equipment: 'Equipment',
    Equipment: 'Equipment',
    ppe: 'PPE',
    PPE: 'PPE',
  }
  return map[type] ?? 'Expendable'
}

export const mapProcurementItemToItemMaster = (
  item: ProcurementItem,
): ItemMaster => {
  const mapped: ItemMaster = {
    id: item.id,
    itemName: item.name,
    // Prefer code fields when available; fall back to name when not provided
    uacsCode: (item as ProcurementItem).objectCodeName,
    uacsDescription: item.objectCodeName,
    isCSE: item.isCSE,
    // UNSPSC: prefer explicit code field if backend provides it
    unspscCode: (item as ProcurementItem).unspscCodeName,
    minimumTechnicalSpecifications: item.specifications ?? '',
    // UOM: prefer code when available, otherwise use name
    uom: (item as ProcurementItem).uomName ?? '',
    itemType: normalizeItemType(item.type),
    status: item.isActive ? 'active' : 'inactive',
    itemLife: String(item.itemLife ?? ''),
    itemLifeUnit: 'years',
    // Normalize productCode across possible backend naming
    productCode: (item as any).productCode ?? (item as any).product_code ?? (item as any).product?.code ?? '',
    imageURL: item.imageURL ?? '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    objectCodeId: item.objectCodeId,
    unspscCodeId: item.unspscCodeId,
    uomId: item.uomId,
    objectCodeName: item.objectCodeName,
    unspscCodeName: item.unspscCodeName,
    uomName: item.uomName,
    isActive: item.isActive,
  }
  return mapped
}

export const mapProcurementItemsToItemMasters = (
  items: ProcurementItem[],
): ItemMaster[] => {
  return items.map(mapProcurementItemToItemMaster)
}
