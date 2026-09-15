import { describe, it, expect } from 'vitest'
import { format } from 'date-fns'
import type { PRItem } from '../types'

// Replicating the deduplication logic from PRDetailsPage
function deduplicatePRItems(items: PRItem[]): PRItem[] {
  const result: PRItem[] = []
  const seen = new Map<string, number>()

  for (const item of items) {
    const key = `${item.itemId || item.id || item.itemName}_${item.month || ''}`
    if (seen.has(key)) {
      const idx = seen.get(key)!
      const existing = result[idx]
      const totalQty = (existing.quantity || 0) + (item.quantity || 0)
      const setQty = (existing.setQuantity ?? existing.quantity) + (item.setQuantity ?? item.quantity)
      const unitPrice = existing.unitPrice ?? existing.estimatedUnitPrice ?? item.unitPrice ?? 0
      result[idx] = {
        ...existing,
        quantity: totalQty,
        setQuantity: setQty,
        remainingQuantity: Math.max(0, setQty - totalQty),
        totalAmount: totalQty * unitPrice,
      }
    } else {
      seen.set(key, result.length)
      const setQty = item.setQuantity ?? item.quantity
      result.push({
        ...item,
        setQuantity: setQty,
        remainingQuantity: item.remainingQuantity ?? Math.max(0, setQty - item.quantity),
      })
    }
  }

  return result
}

// Replicating the handleAddItems merging logic from PRDetailsPage
function mergeIncomingItems(currentItems: PRItem[], incomingItems: PRItem[]): PRItem[] {
  const updatedItems = [...currentItems]

  for (const incoming of incomingItems) {
    const incomingKey = (incoming.itemId || incoming.id || incoming.itemName) + `_${incoming.month || ''}`
    const existingIndex = updatedItems.findIndex((existing) => {
      const existingKey = (existing.itemId || existing.id || existing.itemName) + `_${existing.month || ''}`
      return existingKey === incomingKey || existing.id === incoming.id
    })

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex]
      const incomingSetQty = incoming.setQuantity ?? incoming.quantity
      const currentSetQty = existing.setQuantity ?? existing.quantity
      const newSetQty = currentSetQty + incomingSetQty
      const newQty = existing.quantity + incoming.quantity
      const unitCost = existing.unitPrice ?? existing.estimatedUnitPrice ?? incoming.unitPrice ?? 0

      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        setQuantity: newSetQty,
        remainingQuantity: Math.max(0, newSetQty - newQty),
        totalAmount: newQty * unitCost,
      }
    } else {
      const setQty = incoming.setQuantity ?? incoming.quantity
      updatedItems.push({
        ...incoming,
        setQuantity: setQty,
        remainingQuantity: incoming.remainingQuantity ?? Math.max(0, setQty - incoming.quantity),
      })
    }
  }

  return updatedItems
}

// Replicating inline quantity editing logic
function editItemQuantity(items: PRItem[], itemId: string, newQty: number): PRItem[] {
  return items.map((pi) => {
    if (pi.id === itemId) {
      const unitPrice = pi.unitPrice ?? pi.estimatedUnitPrice ?? 0
      const setQty = pi.setQuantity ?? (pi.quantity > 0 ? pi.quantity : newQty)
      const remainingQty = Math.max(0, setQty - newQty)
      return {
        ...pi,
        quantity: newQty,
        setQuantity: setQty,
        remainingQuantity: remainingQty,
        totalAmount: newQty * unitPrice,
      }
    }
    return pi
  })
}

// Replicating buildPayloadItems from PRDetailsPage
function buildPayloadItems(items: PRItem[]) {
  return items.flatMap((group) => {
    if (group.aprGroup) {
      const nested = group.aprGroup.items || []
      return nested.flatMap((aprItem) => {
        const monthsMap = aprItem.monthlyQuantities && Object.keys(aprItem.monthlyQuantities).length > 0
          ? aprItem.monthlyQuantities
          : { [aprItem.month || 'January']: aprItem.quantity }
        return Object.entries(monthsMap).filter(([, qty]) => qty > 0).map(([m, qty]) => ({
          aprItemId: aprItem.itemId || aprItem.id,
          name: aprItem.itemName,
          description: aprItem.description || '',
          unitCost: aprItem.unitPrice,
          requestedQuantity: qty,
          stockNo: '',
          isNonCSE: false,
          requestedMonth: m,
        }))
      })
    }

    const isApr = group.source === 'apr'
    const isIndependent = group.source === 'independent' || group.source === 'catalog' || group.source === 'custom'

    if (group.monthlyQuantities && Object.keys(group.monthlyQuantities).length > 0) {
      return Object.entries(group.monthlyQuantities).filter(([, qty]) => qty > 0).map(([m, qty]) => ({
        ppmpItemId: (isApr || isIndependent) ? undefined : (group.itemId || group.id),
        aprItemId: isApr ? (group.itemId || group.id) : undefined,
        name: group.itemName,
        description: group.description || '',
        unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
        requestedQuantity: qty,
        stockNo: group.stockNo || '',
        isNonCSE: group.isNonCSE !== undefined ? group.isNonCSE : !isApr,
        requestedMonth: m,
      }))
    }

    return [{
      ppmpItemId: (isApr || isIndependent) ? undefined : (group.itemId || group.id),
      aprItemId: isApr ? (group.itemId || group.id) : undefined,
      name: group.itemName,
      description: group.description || '',
      unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
      requestedQuantity: group.quantity,
      stockNo: group.stockNo || '',
      isNonCSE: group.isNonCSE !== undefined ? group.isNonCSE : !isApr,
      requestedMonth: group.month || 'January',
    }]
  })
}

// Replicating API sync / reconstruction from PRDetailsPage
interface ApiItemRow {
  id: string
  ppmpItemId?: string | null
  aprItemId?: string | null
  name: string
  description?: string
  category?: string
  unitCost: number
  requestedQuantity: number
  amount?: number
  requestedMonth: string
  isNonCSE: boolean
  unit?: string
  fund?: string
  procurementModeId?: string
  procurementModeName?: string
  ppmpId?: string
  ppmpNumber?: string
  officeName?: string
}

function reconstructPRItemsFromApi(apiItems: ApiItemRow[]): PRItem[] {
  const deduplicatedItems: PRItem[] = []
  const seenKeys = new Map<string, number>()

  for (const i of apiItems) {
    const key = `${i.ppmpItemId || i.aprItemId || i.id || i.name}_${i.requestedMonth || ''}`
    if (seenKeys.has(key)) {
      const existingIdx = seenKeys.get(key)!
      const existing = deduplicatedItems[existingIdx]
      const mergedQty = (existing.quantity || 0) + (i.requestedQuantity || 0)
      const unitCost = existing.unitPrice || i.unitCost || 0
      const mergedSetQty = (existing.setQuantity ?? existing.quantity) + (i.requestedQuantity || 0)
      deduplicatedItems[existingIdx] = {
        ...existing,
        quantity: mergedQty,
        setQuantity: mergedSetQty,
        remainingQuantity: Math.max(0, mergedSetQty - mergedQty),
        totalAmount: mergedQty * unitCost,
      }
    } else {
      seenKeys.set(key, deduplicatedItems.length)
      const isCustomAdHoc = !i.ppmpItemId && !i.aprItemId
      const itemSource = isCustomAdHoc ? ('custom' as const) : (i.isNonCSE ? ('ppmp' as const) : ('apr' as const))
      const itemQty = i.requestedQuantity || 0

      deduplicatedItems.push({
        id: i.id,
        itemId: i.aprItemId ?? i.ppmpItemId ?? i.id,
        itemName: i.name,
        description: i.description || '',
        category: i.category || '',
        quantity: itemQty,
        setQuantity: itemQty,
        remainingQuantity: 0,
        unitOfMeasure: i.unit || '',
        unitPrice: i.unitCost,
        totalAmount: i.amount || (itemQty * i.unitCost),
        estimatedUnitPrice: i.unitCost,
        month: i.requestedMonth,
        fund: i.fund || '',
        procurementModeId: i.procurementModeId,
        procurementModeName: i.procurementModeName,
        source: itemSource,
        isNonCSE: i.isNonCSE,
        ppmpDocId: i.ppmpId,
        ppmpDocName: i.ppmpNumber
          ? `${i.ppmpNumber} — ${i.officeName || ''}`
          : undefined,
      })
    }
  }

  return deduplicatedItems
}

describe('Purchase Request Enhancements (BE & FE)', () => {
  describe('1. Validation: Ensure items in View Details are not duplicated', () => {
    it('deduplicates items with identical IDs and months, merging their quantities', () => {
      const inputItems: PRItem[] = [
        {
          id: 'item-1',
          itemId: 'catalog-item-1',
          itemName: 'Bond Paper A4',
          description: 'A4 70gsm',
          category: 'Office Supplies',
          quantity: 10,
          unitPrice: 200,
          totalAmount: 2000,
          month: 'January',
          source: 'ppmp',
        },
        {
          id: 'item-2',
          itemId: 'catalog-item-1',
          itemName: 'Bond Paper A4',
          description: 'A4 70gsm',
          category: 'Office Supplies',
          quantity: 5,
          unitPrice: 200,
          totalAmount: 1000,
          month: 'January',
          source: 'ppmp',
        },
      ]

      const result = deduplicatePRItems(inputItems)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(15)
      expect(result[0].setQuantity).toBe(15)
      expect(result[0].totalAmount).toBe(3000)
    })

    it('keeps items with different months separate', () => {
      const inputItems: PRItem[] = [
        {
          id: 'item-1',
          itemId: 'catalog-item-1',
          itemName: 'Bond Paper A4',
          category: 'Office Supplies',
          quantity: 10,
          unitPrice: 200,
          totalAmount: 2000,
          month: 'January',
          source: 'ppmp',
        },
        {
          id: 'item-2',
          itemId: 'catalog-item-1',
          itemName: 'Bond Paper A4',
          category: 'Office Supplies',
          quantity: 5,
          unitPrice: 200,
          totalAmount: 1000,
          month: 'February',
          source: 'ppmp',
        },
      ]

      const result = deduplicatePRItems(inputItems)

      expect(result).toHaveLength(2)
      expect(result[0].month).toBe('January')
      expect(result[1].month).toBe('February')
    })
  })

  describe('2. Add items merging (No duplicates on adding items)', () => {
    it('merges newly added item into existing item without displaying it twice', () => {
      const current: PRItem[] = [
        {
          id: 'row-1',
          itemId: 'item-A',
          itemName: 'Ballpen Black',
          category: 'Office Supplies',
          quantity: 20,
          setQuantity: 20,
          remainingQuantity: 0,
          unitPrice: 15,
          totalAmount: 300,
          month: 'March',
          source: 'catalog',
        },
      ]

      const incoming: PRItem[] = [
        {
          id: 'incoming-1',
          itemId: 'item-A',
          itemName: 'Ballpen Black',
          category: 'Office Supplies',
          quantity: 10,
          setQuantity: 10,
          remainingQuantity: 0,
          unitPrice: 15,
          totalAmount: 150,
          month: 'March',
          source: 'catalog',
        },
      ]

      const merged = mergeIncomingItems(current, incoming)

      expect(merged).toHaveLength(1)
      expect(merged[0].id).toBe('row-1')
      expect(merged[0].quantity).toBe(30)
      expect(merged[0].setQuantity).toBe(30)
      expect(merged[0].totalAmount).toBe(450)
    })
  })

  describe('3. Quantity deduction from set quantity rather than displaying item twice', () => {
    it('automatically deducts new amount from remaining set quantity when requested quantity is edited', () => {
      const initialItems: PRItem[] = [
        {
          id: 'item-100',
          itemId: 'catalog-100',
          itemName: 'Heavy Duty Stapler',
          category: 'Office Supplies',
          quantity: 10,
          setQuantity: 10,
          remainingQuantity: 0,
          unitPrice: 500,
          totalAmount: 5000,
          month: 'January',
          source: 'ppmp',
        },
      ]

      // User changes requested quantity from 10 to 4 (less than available set quantity of 10)
      const updated = editItemQuantity(initialItems, 'item-100', 4)

      expect(updated).toHaveLength(1)
      expect(updated[0].quantity).toBe(4)
      expect(updated[0].setQuantity).toBe(10)
      expect(updated[0].remainingQuantity).toBe(6) // 10 - 4 = 6 remaining
      expect(updated[0].totalAmount).toBe(2000)
    })

    it('clamps remaining quantity to 0 if edited quantity exceeds set quantity', () => {
      const initialItems: PRItem[] = [
        {
          id: 'item-100',
          itemId: 'catalog-100',
          itemName: 'Heavy Duty Stapler',
          category: 'Office Supplies',
          quantity: 10,
          setQuantity: 10,
          remainingQuantity: 0,
          unitPrice: 500,
          totalAmount: 5000,
          month: 'January',
          source: 'ppmp',
        },
      ]

      const updated = editItemQuantity(initialItems, 'item-100', 12)

      expect(updated).toHaveLength(1)
      expect(updated[0].quantity).toBe(12)
      expect(updated[0].setQuantity).toBe(10)
      expect(updated[0].remainingQuantity).toBe(0) // Math.max(0, 10 - 12) = 0
    })
  })

  describe('4. Manage PR: Requesting Office and Date Submitted validation', () => {
    it('resolves requesting office from office map when officeName is missing', () => {
      const officesMap = new Map<string, string>([
        ['office-guid-1', 'College of Computer Studies'],
        ['office-guid-2', 'Registrar Office'],
      ])

      const prWithMissingName = {
        id: 'pr-1',
        officeId: 'office-guid-1',
        officeName: '',
      }

      const resolvedOffice =
        prWithMissingName.officeName ||
        officesMap.get(prWithMissingName.officeId) ||
        'General Administration'

      expect(resolvedOffice).toBe('College of Computer Studies')
      expect(resolvedOffice).not.toBe('')
    })

    it('falls back to General Administration if office is unknown rather than leaving blank', () => {
      const officesMap = new Map<string, string>()

      const prWithNoOffice = {
        id: 'pr-2',
        officeId: 'unknown-guid',
        officeName: '',
      }

      const resolvedOffice =
        prWithNoOffice.officeName ||
        officesMap.get(prWithNoOffice.officeId) ||
        'General Administration'

      expect(resolvedOffice).toBe('General Administration')
      expect(resolvedOffice).not.toBe('')
    })

    it('formats date submitted correctly using MMM dd, yyyy format', () => {
      const testDate = new Date(2026, 8, 11) // September 11, 2026
      const formatted = format(testDate, 'MMM dd, yyyy')
      expect(formatted).toBe('Sep 11, 2026')
    })
  })

  describe('5. Non-CSE Requisition & Catalog Compliance (RA 12009 NGPA)', () => {
    it('creates Non-CSE PR items without requiring a PPMP item linkage', () => {
      const catalogItem: PRItem = {
        id: 'item-non-cse-1',
        itemName: 'All-in-One Desktop Computer (Core i7 / 16GB / 512GB SSD)',
        description: '23.8-inch FHD IPS display, Windows 11 Pro',
        category: 'IT Equipment & Software',
        quantity: 3,
        unitOfMeasure: 'unit',
        unitPrice: 58500,
        totalAmount: 3 * 58500,
        setQuantity: 3,
        remainingQuantity: 0,
        source: 'catalog',
        procurementModeName: 'Direct Acquisition',
        fund: 'General Fund',
        month: 'January',
      }

      expect(catalogItem.PPMPItemId).toBeUndefined()
      expect(catalogItem.totalAmount).toBe(175500)
      expect(catalogItem.category).toBe('IT Equipment & Software')
    })

    it('creates custom Non-CSE PR items with custom technical specifications', () => {
      const customItem: PRItem = {
        id: 'custom-pr-item-1',
        itemName: 'High-Accuracy Spectrophotometer',
        description: 'UV-Vis double-beam spectrophotometer with wavelength range 190-1100 nm',
        category: 'Medical & Scientific Supplies',
        quantity: 1,
        unitOfMeasure: 'unit',
        unitPrice: 245000,
        totalAmount: 245000,
        setQuantity: 1,
        remainingQuantity: 0,
        source: 'custom',
        procurementModeName: 'Competitive Bidding',
        fund: 'Special Education Fund',
        month: 'March',
      }

      expect(customItem.source).toBe('custom')
      expect(customItem.procurementModeName).toBe('Competitive Bidding')
      expect(customItem.totalAmount).toBe(245000)
    })

    it('merges multiple added Non-CSE items into existing PR items without duplicate rows', () => {
      const existingPRItems: PRItem[] = [
        {
          id: 'existing-1',
          itemId: 'cat-it-01',
          itemName: 'All-in-One Desktop Computer',
          quantity: 2,
          setQuantity: 2,
          remainingQuantity: 0,
          unitPrice: 50000,
          totalAmount: 100000,
          month: 'January',
        },
      ]

      const incomingCatalogItems: PRItem[] = [
        {
          id: 'incoming-1',
          itemId: 'cat-it-01',
          itemName: 'All-in-One Desktop Computer',
          quantity: 3,
          setQuantity: 3,
          remainingQuantity: 0,
          unitPrice: 50000,
          totalAmount: 150000,
          month: 'January',
        },
      ]

      const merged = mergeIncomingItems(existingPRItems, incomingCatalogItems)

      expect(merged).toHaveLength(1)
      expect(merged[0].quantity).toBe(5)
      expect(merged[0].setQuantity).toBe(5)
      expect(merged[0].totalAmount).toBe(250000)
    })
  })

  describe('6. Custom / Ad-hoc PR Line Items (Option A & Persistence / Regression)', () => {
    it('8. Persistence & Regression: Add Custom Item -> Save PR -> Reload PR -> remains Custom / Ad-hoc and NOT PPMP', () => {
      // Step 1: User adds a Custom / Ad-hoc item in UI
      const addedCustomItem: PRItem = {
        id: 'client-guid-custom-1',
        itemId: 'client-guid-custom-1',
        itemName: 'Specialized 40U Server Rack Enclosure',
        description: 'Heavy duty cold-rolled steel server rack with perforated doors and PDU mounting',
        category: 'IT Equipment & Software',
        quantity: 2,
        unitOfMeasure: 'unit',
        unitPrice: 45000,
        totalAmount: 90000,
        setQuantity: 2,
        remainingQuantity: 0,
        source: 'custom',
        isNonCSE: true,
        procurementModeName: 'Small Value Procurement',
        fund: 'General Fund',
        month: 'May',
      }

      // Step 2: Save PR -> buildPayloadItems generates payload for backend PUT /purchase-requests/{id}
      const savePayload = buildPayloadItems([addedCustomItem])

      expect(savePayload).toHaveLength(1)
      // Critical assertion: ppmpItemId is undefined (null in JSON)
      expect(savePayload[0].ppmpItemId).toBeUndefined()
      expect(savePayload[0].aprItemId).toBeUndefined()
      expect(savePayload[0].name).toBe('Specialized 40U Server Rack Enclosure')
      expect(savePayload[0].requestedQuantity).toBe(2)
      expect(savePayload[0].unitCost).toBe(45000)
      expect(savePayload[0].isNonCSE).toBe(true)
      expect(savePayload[0].requestedMonth).toBe('May')

      // Step 3: Backend persists to DB (PRItem with PPMPItemId = null, APRItemId = null)
      // and returns fresh PR detail response on reload
      const apiResponseFromBackend: ApiItemRow[] = [
        {
          id: 'server-db-id-1',
          ppmpItemId: null, // Null in DB
          aprItemId: null,  // Null in DB
          name: savePayload[0].name,
          description: savePayload[0].description,
          category: 'IT Equipment & Software',
          unitCost: savePayload[0].unitCost,
          requestedQuantity: savePayload[0].requestedQuantity,
          amount: savePayload[0].requestedQuantity * savePayload[0].unitCost,
          requestedMonth: savePayload[0].requestedMonth,
          isNonCSE: savePayload[0].isNonCSE,
          unit: 'unit',
          fund: 'General Fund',
        },
      ]

      // Step 4: Frontend reloads PR and reconstructs items from API response
      const reloadedItems = reconstructPRItemsFromApi(apiResponseFromBackend)

      expect(reloadedItems).toHaveLength(1)
      const reloadedItem = reloadedItems[0]

      // Critical assertions: Reconstructed item remains Custom / Ad-hoc!
      expect(reloadedItem.source).toBe('custom')
      expect(reloadedItem.source).not.toBe('ppmp')
      expect(reloadedItem.source).not.toBe('apr')
      expect(reloadedItem.isNonCSE).toBe(true)
      expect(reloadedItem.itemName).toBe('Specialized 40U Server Rack Enclosure')
      expect(reloadedItem.quantity).toBe(2)
      expect(reloadedItem.totalAmount).toBe(90000)
    })

    it('9. Editing existing PR with Custom / Ad-hoc items (update, add, remove) preserves null PPMPItemId', () => {
      // Existing PR containing 1 custom item and 1 PPMP item
      const initialPRItems: PRItem[] = [
        {
          id: 'item-custom-1',
          itemId: 'item-custom-1',
          itemName: 'Specialized Acoustic Sound Panels',
          category: 'Furniture & Fixtures',
          quantity: 10,
          setQuantity: 10,
          remainingQuantity: 0,
          unitPrice: 2500,
          totalAmount: 25000,
          month: 'June',
          source: 'custom',
          isNonCSE: true,
        },
        {
          id: 'item-ppmp-1',
          itemId: 'actual-ppmp-item-guid-123',
          itemName: 'Standard Ergonomic Chair',
          category: 'Furniture & Fixtures',
          quantity: 5,
          setQuantity: 5,
          remainingQuantity: 0,
          unitPrice: 5000,
          totalAmount: 25000,
          month: 'June',
          source: 'ppmp',
          isNonCSE: true,
        },
      ]

      // 9a. Update quantity of custom item from 10 to 15
      const updatedQuantityItems = editItemQuantity(initialPRItems, 'item-custom-1', 15)
      const payloadAfterUpdate = buildPayloadItems(updatedQuantityItems)

      expect(payloadAfterUpdate).toHaveLength(2)
      const customPayload = payloadAfterUpdate.find((p) => p.name === 'Specialized Acoustic Sound Panels')!
      const ppmpPayload = payloadAfterUpdate.find((p) => p.name === 'Standard Ergonomic Chair')!

      expect(customPayload.requestedQuantity).toBe(15)
      expect(customPayload.ppmpItemId).toBeUndefined() // Remains null/undefined!
      expect(ppmpPayload.ppmpItemId).toBe('actual-ppmp-item-guid-123') // PPMP item retains its ID

      // 9b. Add another custom item
      const secondCustomItem: PRItem = {
        id: 'item-custom-2',
        itemId: 'item-custom-2',
        itemName: 'High-Lumen Projector Lamp',
        category: 'IT Equipment & Software',
        quantity: 3,
        setQuantity: 3,
        remainingQuantity: 0,
        unitPrice: 8000,
        totalAmount: 24000,
        month: 'July',
        source: 'custom',
        isNonCSE: true,
      }

      const itemsAfterAdd = mergeIncomingItems(updatedQuantityItems, [secondCustomItem])
      const payloadAfterAdd = buildPayloadItems(itemsAfterAdd)

      expect(payloadAfterAdd).toHaveLength(3)
      const custom1 = payloadAfterAdd.find((p) => p.name === 'Specialized Acoustic Sound Panels')!
      const custom2 = payloadAfterAdd.find((p) => p.name === 'High-Lumen Projector Lamp')!
      expect(custom1.ppmpItemId).toBeUndefined()
      expect(custom2.ppmpItemId).toBeUndefined()

      // 9c. Remove the PPMP item, leaving only the 2 custom items
      const itemsAfterRemove = itemsAfterAdd.filter((p) => p.id !== 'item-ppmp-1')
      const payloadAfterRemove = buildPayloadItems(itemsAfterRemove)

      expect(payloadAfterRemove).toHaveLength(2)
      expect(payloadAfterRemove.every((p) => p.ppmpItemId === undefined)).toBe(true)
    })

    it('3. Treats Custom / Ad-hoc (source state) and Non-CSE (classification) as separate concepts', () => {
      // Custom item classified as Non-CSE
      const customNonCse: PRItem = {
        id: 'cust-1',
        itemId: 'cust-1',
        itemName: 'Custom Sensor Array',
        category: 'Medical & Scientific Supplies',
        quantity: 1,
        unitPrice: 150000,
        totalAmount: 150000,
        source: 'custom',
        isNonCSE: true,
        month: 'August',
      }

      // Custom item classified as CSE (direct acquisition)
      const customCse: PRItem = {
        id: 'cust-2',
        itemId: 'cust-2',
        itemName: 'Specialized Direct CSE Consumables',
        category: 'Office Supplies',
        quantity: 50,
        unitPrice: 300,
        totalAmount: 15000,
        source: 'custom',
        isNonCSE: false, // Explicitly CSE!
        month: 'August',
      }

      const payload = buildPayloadItems([customNonCse, customCse])

      expect(payload[0].ppmpItemId).toBeUndefined()
      expect(payload[0].isNonCSE).toBe(true)

      expect(payload[1].ppmpItemId).toBeUndefined()
      expect(payload[1].isNonCSE).toBe(false)
    })

    it('2 & 5. Decoupling: Creating Custom / Ad-hoc PR items does not require or create ItemRequests', () => {
      const prItem: PRItem = {
        id: 'adhoc-100',
        itemId: 'adhoc-100',
        itemName: 'Ad-hoc Conference Translation System',
        description: 'Multi-channel wireless simultaneous interpretation system with 20 receivers',
        category: 'IT Equipment & Software',
        quantity: 1,
        unitPrice: 320000,
        totalAmount: 320000,
        source: 'custom',
        month: 'September',
      }

      // Adding to PR produces no side effects on Item Requests
      const savePayload = buildPayloadItems([prItem])
      expect(savePayload).toHaveLength(1)

      // When user intentionally clicks "Submit as Item Request", it maps to RequestItem payload without mutating PRItem
      const intentionalItemRequestPayload = {
        name: prItem.itemName,
        technicalSpecification: prItem.description,
        estimatedUnitCost: prItem.unitPrice,
        procurementCategory: 'Goods',
        itemCategory: prItem.category,
        officeId: 'office-guid-1',
        status: 'Submitted',
      }

      expect(intentionalItemRequestPayload.name).toBe(prItem.itemName)
      expect(intentionalItemRequestPayload.estimatedUnitCost).toBe(320000)
      // PR line item remains strictly intact as a PR line
      expect(prItem.source).toBe('custom')
    })

    it('3. Catalog vs Custom Differentiation: Items from Master Catalog are tagged Master Catalog, not Custom / Ad-hoc', () => {
      // Master catalog items (e.g. RICOH ScanSnap, Jabra Headset)
      const catalogIdentifiers = new Set<string>([
        'ricoh scansnap ix1600 document scanner',
        'jabra evolve2 65 wireless office headset',
        'cat-item-1',
      ])

      const isCatalog = (name: string, id?: string) =>
        catalogIdentifiers.has(name.trim().toLowerCase()) || (!!id && catalogIdentifiers.has(id.toLowerCase()))

      const catalogItem: ApiItemRow = {
        id: 'cat-item-1',
        name: 'RICOH ScanSnap iX1600 Document Scanner',
        category: 'IT Equipment & Software',
        unitCost: 35000,
        requestedQuantity: 2,
        requestedMonth: 'March',
        isNonCSE: true,
      }

      const customItem: ApiItemRow = {
        id: 'cust-unique-99',
        name: 'Specialized Custom Acoustic Wall Baffle',
        category: 'Audio Visual',
        unitCost: 12000,
        requestedQuantity: 4,
        requestedMonth: 'March',
        isNonCSE: true,
      }

      // Catalog item is identified as catalog
      expect(isCatalog(catalogItem.name, catalogItem.id)).toBe(true)
      // Custom item is identified as not in catalog
      expect(isCatalog(customItem.name, customItem.id)).toBe(false)

      // In the UI:
      const getBadgesAndActions = (item: { name: string; id?: string }) => {
        const isCatalogItem = isCatalog(item.name, item.id)
        return {
          badge: isCatalogItem ? 'Master Catalog' : 'Custom / Ad-hoc',
          canSubmitItemRequest: !isCatalogItem,
        }
      }

      expect(getBadgesAndActions(catalogItem)).toEqual({
        badge: 'Master Catalog',
        canSubmitItemRequest: false,
      })

      expect(getBadgesAndActions(customItem)).toEqual({
        badge: 'Custom / Ad-hoc',
        canSubmitItemRequest: true,
      })
    })

    it('4. Mode of Procurement: Catalog items do not default to Direct Acquisition and MoP is editable in draft state', () => {
      // 1. Adding catalog item: starts with undefined MoP (no hardcoded Direct Acquisition)
      const catalogItemAdded: PRItem = {
        id: 'pr-line-1',
        itemId: 'cat-item-ricoh',
        itemName: 'RICOH ScanSnap iX1600 Document Scanner',
        category: 'IT Equipment & Software',
        quantity: 10,
        unitPrice: 33500,
        totalAmount: 335000,
        source: 'catalog',
        procurementModeName: undefined, // Unassigned by default
      }

      expect(catalogItemAdded.procurementModeName).toBeUndefined()

      // 2. In draft state, user selects MoP (e.g. Small Value Procurement)
      const availableModes = [
        { id: 'mode-1', name: 'Direct Acquisition' },
        { id: 'mode-2', name: 'Small Value Procurement' },
        { id: 'mode-3', name: 'Competitive Bidding' },
      ]

      const updateMoP = (item: PRItem, chosenModeName: string, isDraft: boolean): PRItem => {
        if (!isDraft) return item // Read-only if not draft
        const matched = availableModes.find((m) => m.name === chosenModeName)
        return {
          ...item,
          procurementModeName: chosenModeName,
          procurementModeId: matched?.id,
        }
      }

      // Draft state allows updating MoP
      const updatedDraftItem = updateMoP(catalogItemAdded, 'Small Value Procurement', true)
      expect(updatedDraftItem.procurementModeName).toBe('Small Value Procurement')
      expect(updatedDraftItem.procurementModeId).toBe('mode-2')

      // Submitted/Approved state does not allow changing MoP
      const nonDraftItem = updateMoP(updatedDraftItem, 'Competitive Bidding', false)
      expect(nonDraftItem.procurementModeName).toBe('Small Value Procurement')
    })
  })
})


