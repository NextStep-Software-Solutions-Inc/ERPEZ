/**
 * Add Items Modal
 * Modal for selecting items from PPMP or APR
 */

import React, { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  Search,
  Loader2,
  Info,
  RotateCcw,
  Building2,
  Boxes,
  Laptop,
  Headphones,
  Printer,
  Package,
  BatteryCharging,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PRItem, ProcessedPPMPItem, ProcessedPPMPDoc, SourceAPRItem } from '../types'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import {
  usePurchaseRequestEligiblePpmps,
  usePurchaseRequestEligiblePpmpsByOffice,
  usePurchaseRequestEligibleAprs,
} from '../handlers/hooks'
import type { EligiblePpmpItemMonthAllocation } from '../types/apiTypes'
import type { EligibleAPRItemResponse } from '../handlers/getPurchaseRequestEligibleAprsRequest'

// Simple UUID v4 generator using native Crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Fixed ordered list of months — used for all month dropdowns throughout the procurement module
export const ORDERED_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getCategoryIcon(category?: string, name?: string) {
  const text = `${category || ''} ${name || ''}`.toLowerCase()
  if (
    text.includes('screen') ||
    text.includes('monitor') ||
    text.includes('scanner') ||
    text.includes('laptop') ||
    text.includes('pc') ||
    text.includes('computer') ||
    text.includes('it equipment') ||
    text.includes('ict equipment')
  ) {
    return { icon: Laptop, color: 'text-purple-600 bg-purple-50 border-purple-200' }
  }
  if (
    text.includes('headset') ||
    text.includes('audio') ||
    text.includes('accessory') ||
    text.includes('accessories') ||
    text.includes('ict accessories')
  ) {
    return { icon: Headphones, color: 'text-blue-600 bg-blue-50 border-blue-200' }
  }
  if (text.includes('battery') || text.includes('supplies') || text.includes('supply')) {
    return { icon: BatteryCharging, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  }
  if (
    text.includes('binding') ||
    text.includes('punching') ||
    text.includes('machine') ||
    text.includes('printer') ||
    text.includes('office equipment')
  ) {
    return { icon: Printer, color: 'text-amber-600 bg-amber-50 border-amber-200' }
  }
  return { icon: Package, color: 'text-slate-600 bg-slate-50 border-slate-200' }
}

function getCategoryBadgeStyle(category?: string) {
  const cat = (category || '').toLowerCase()
  if (cat.includes('ict equipment') || cat.includes('it equipment') || cat.includes('software')) {
    return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50'
  }
  if (cat.includes('accessories') || cat.includes('accessory') || cat.includes('ict accessories')) {
    return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50'
  }
  if (cat.includes('supplies') || cat.includes('supply')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
  }
  if (cat.includes('office equipment') || cat.includes('office') || cat.includes('equipment')) {
    return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
  }
  return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50'
}

export interface SourceAPR {
  id: string
  aprNumber: string
  status: string
  totalAmount: number
  officeName: string
  officeCode: string
  items: SourceAPRItem[]
}

interface AddItemsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prType: 'non-cse' | 'out-of-stock' | 'consolidated'
  onAddItems: (items: PRItem[]) => void
  /** UUID of the PR being edited */
  prId?: string
  /** Office ID to query eligible items for when creating a new PR without prId */
  officeId?: string
  /** Current items in the PR to filter out from the eligible list */
  currentItems?: PRItem[]
}

export function AddItemsModal({
  open,
  onOpenChange,
  prType,
  onAddItems,
  prId,
  officeId,
  currentItems,
}: AddItemsModalProps) {
  // selectedNonCseRows stores selected individual items (composite id: `${ppmpItemId}-${month}` or `${ppmpItemId}`)
  const [selectedNonCseRows, setSelectedNonCseRows] = useState<Set<string>>(new Set())
  // expandedDocs stores which PPMP docs are expanded to show items
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())
  // For APR: selectedAPR stores selected APR ids
  const [selectedAPR, setSelectedAPR] = useState<Set<string>>(new Set())
  // track edited 'Total Required' per APR item so Deficit can be recalculated
  const [editedNeededMap] = useState<Record<string, number>>({})
  // track per-row edited quantities for Non-CSE items
  const [editedQuantityMap, setEditedQuantityMap] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')

  const { activePR } = usePurchaseRequestStore()
  const officeIdToUse =
    officeId ??
    activePR?.officeCode ??
    activePR?.headerDetails?.officeId ??
    (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_TEMP_OFFICE_ID : undefined) ??
    ''

  const isPrMode = Boolean(prId)
  const isOfficeMode = !isPrMode && Boolean(officeIdToUse)

  const {
    data: prEligiblePpmpsResponse,
    isLoading: isPrPpmpsLoading,
    isError: isPrPpmpsError,
    error: prPpmpsError,
  } = usePurchaseRequestEligiblePpmps({
    pathParams: { id: prId ?? '' },
    enabled: open && prType === 'non-cse' && isPrMode,
  })

  const {
    data: officeEligiblePpmpsResponse,
    isLoading: isOfficePpmpsLoading,
    isError: isOfficePpmpsError,
    error: officePpmpsError,
  } = usePurchaseRequestEligiblePpmpsByOffice({
    pathParams: {},
    queryParams: { officeId: officeIdToUse },
    enabled: open && prType === 'non-cse' && isOfficeMode,
  })

  const eligiblePpmpsResponse = isPrMode ? prEligiblePpmpsResponse : officeEligiblePpmpsResponse
  const isPpmpsLoading = isPrMode ? isPrPpmpsLoading : isOfficePpmpsLoading
  const isPpmpsError = isPrMode ? isPrPpmpsError : isOfficePpmpsError
  const ppmpsError = isPrMode ? prPpmpsError : officePpmpsError

  // Build the PPMP docs list from API response
  const ppmpDocs = useMemo<ProcessedPPMPDoc[]>(() => {
    if (prType !== 'non-cse') return []
    if (eligiblePpmpsResponse && eligiblePpmpsResponse.data) {
      return eligiblePpmpsResponse.data
        .map((doc) => {
          const processedItems: ProcessedPPMPItem[] = doc.items.map((item) => {
            const matchingPrItems = currentItems?.filter(prItem => prItem.itemId === item.ppmpItemId || prItem.id === item.ppmpItemId) || []
            
            const hasMonthly = item.hasMonthlyAllocations ?? (item.monthlyAllocations && item.monthlyAllocations.length > 0)

            const adjustedMonthlyAllocations = (item.monthlyAllocations || []).map(alloc => {
              const matchingPrMonth = matchingPrItems.find(prItem => prItem.month === alloc.month)
              if (matchingPrMonth) {
                return {
                  ...alloc,
                  availableQuantity: Math.max(0, alloc.availableQuantity - matchingPrMonth.quantity)
                }
              }
              return alloc
            }).filter(alloc => alloc.availableQuantity > 0)

            const totalPrQtyForThisItem = matchingPrItems.reduce((sum, prItem) => sum + prItem.quantity, 0)
            const itemAvailableQty = Math.max(0, (item.availableQuantity ?? item.plannedQuantity ?? 0) - totalPrQtyForThisItem)

            return {
              id: item.ppmpItemId,
              itemId: item.ppmpItemId,
              itemName: item.itemName,
              description: item.description,
              category: item.category,
              itemCategory: item.itemCategory,
              uacsCode: item.uacsCode,
              isCse: false,
              unitOfMeasure: item.unit,
              estimatedUnitPrice: item.unitPrice,
              totalAmount: item.totalAvailableAmount,
              fund: item.fund,
              hasMonthlyAllocations: hasMonthly,
              availableQuantity: hasMonthly ? adjustedMonthlyAllocations.reduce((s, a) => s + a.availableQuantity, 0) : itemAvailableQty,
              plannedQuantity: item.plannedQuantity ?? item.availableQuantity,
              monthlyAllocations: adjustedMonthlyAllocations,
              procurementModeId: item.procurementModeId,
              procurementModeName: item.procurementModeName,
            }
          }).filter(item => item.hasMonthlyAllocations ? item.monthlyAllocations.length > 0 : (item.availableQuantity ?? 0) > 0)

          return {
            id: doc.ppmpId,
            documentName: `${doc.ppmpNumber} — ${doc.officeName}`,
            officeCode: doc.officeId,
            officeName: doc.officeName,
            items: processedItems,
          }
        })
        .filter((doc) => doc.items.length > 0)
    }
    return []
  }, [prType, eligiblePpmpsResponse, currentItems])

  // Automatically expand all documents on load
  useEffect(() => {
    if (ppmpDocs.length > 0) {
      setExpandedDocs(new Set(ppmpDocs.map(d => d.id)))
    }
  }, [ppmpDocs])

  const { data: eligibleAprsResponse } = usePurchaseRequestEligibleAprs({
    pathParams: { id: prId ?? '' },
    enabled: open && prType === 'out-of-stock' && Boolean(prId),
  })

  const sourceItems = useMemo<SourceAPR[]>(() => {
    if (prType !== 'out-of-stock') return []
    if (eligibleAprsResponse && eligibleAprsResponse.data) {
      return eligibleAprsResponse.data
        .map(apr => {
          const filteredItems = apr.items.filter(
            (item) =>
              !currentItems?.some((prItem) =>
                prItem.aprGroup?.items?.some(
                  (i) => i.itemId === item.aprItemId || i.id === item.aprItemId
                )
              )
          )
          const items: SourceAPRItem[] = filteredItems.map((item: EligibleAPRItemResponse) => ({
            id: item.aprItemId,
            itemName: item.itemName,
            category: item.category,
            quantity: item.totalRequired,
            unitPrice: item.unitPrice,
            totalAmount: item.totalRequired * item.unitPrice,
            monthlyQuantities: item.monthlyAllocations,
            outOfStockQuantity: item.deficit,
            currentFulfilled: item.currentFulfilled,
            totalRequired: item.totalRequired,
            unitOfMeasure: item.unit,
            fund: item.fund,
            month: undefined,
          }))

          return {
            id: apr.aprId,
            aprNumber: apr.aprNumber,
            status: 'approved',
            totalAmount: apr.totalAmount,
            officeName: apr.officeName,
            officeCode: apr.officeId,
            items,
          }
        })
        .filter(apr => apr.items.length > 0)
    }
    return []
  }, [prType, eligibleAprsResponse, currentItems])

  // Filter PPMP items for non-CSE PRs
  const filteredPPMPDocs = useMemo(() => {
    if (prType !== 'non-cse') return []
    const term = searchTerm.trim().toLowerCase()
    return ppmpDocs.map((doc: ProcessedPPMPDoc) => {
      const nonCseItems = doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)
      const matchesDoc = !term || (doc.documentName || '').toLowerCase().includes(term) || (doc.officeCode || '').toLowerCase().includes(term) || (doc.officeName || '').toLowerCase().includes(term)

      const filteredItems = nonCseItems.filter((item: ProcessedPPMPItem) => {
        const matchesSearch = matchesDoc || 
          item.itemName.toLowerCase().includes(term) || 
          (item.description && item.description.toLowerCase().includes(term)) ||
          item.category.toLowerCase().includes(term) ||
          (item.itemCategory && item.itemCategory.toLowerCase().includes(term)) ||
          (item.uacsCode && item.uacsCode.toLowerCase().includes(term))

        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter || item.itemCategory === categoryFilter
        const matchesMonth = monthFilter === 'all' || 
          (!item.hasMonthlyAllocations) ||
          (item.monthlyAllocations && item.monthlyAllocations.some((m: EligiblePpmpItemMonthAllocation) => m.month === monthFilter && m.availableQuantity > 0)) ||
          (item.monthlyQuantities
            ? Object.keys(item.monthlyQuantities).includes(monthFilter) && (item.monthlyQuantities[monthFilter] || 0) > 0
            : item.month === monthFilter)
        const matchesFund = fundFilter === 'all' || item.fund === fundFilter
        const itemMode = item.procurementModeName || 'Direct Acquisition'
        const matchesMode = modeFilter === 'all' || itemMode === modeFilter
        return matchesSearch && matchesCategory && matchesMonth && matchesFund && matchesMode
      })
      return { ...doc, items: filteredItems }
    }).filter((doc: ProcessedPPMPDoc) => doc.items.length > 0)
  }, [ppmpDocs, searchTerm, categoryFilter, monthFilter, fundFilter, modeFilter, prType])

  // Get unique procurement modes
  const procurementModes = useMemo(() => {
    if (prType === 'non-cse') {
      const modeSet = new Set<string>()
      ppmpDocs.forEach((d: ProcessedPPMPDoc) => {
        d.items.forEach((i: ProcessedPPMPItem) => {
          if (!i.isCse && i.procurementModeName) {
            modeSet.add(i.procurementModeName)
          }
        })
      })
      return Array.from(modeSet).sort()
    }
    return []
  }, [prType, ppmpDocs])

  // Get unique categories and filters
  const categories = useMemo(() => {
    if (prType === 'non-cse') {
      const catSet = new Set<string>()
      ppmpDocs.forEach((doc: ProcessedPPMPDoc) => {
        doc.items.forEach((i: ProcessedPPMPItem) => {
          if (!i.isCse) {
            if (i.itemCategory) catSet.add(i.itemCategory)
            else if (i.category) catSet.add(i.category)
          }
        })
      })
      return Array.from(catSet).sort()
    }
    return Array.from(
      new Set(
        sourceItems
          .flatMap((apr: SourceAPR) =>
            apr.items.map((item: SourceAPRItem) => item.category),
          )
          .filter(Boolean)
          .filter((cat: string) => cat !== 'CSE'),
      ),
    ).sort()
  }, [ppmpDocs, sourceItems, prType])

  const months = useMemo(() => {
    if (prType === 'non-cse') {
      const monthSet = new Set<string>()
      ppmpDocs.forEach((doc: ProcessedPPMPDoc) => {
        doc.items.forEach((i: ProcessedPPMPItem) => {
          if (!i.isCse && i.hasMonthlyAllocations) {
            (i.monthlyAllocations || []).forEach((a) => {
              if (a.month && (a.availableQuantity || 0) > 0) monthSet.add(a.month)
            })
          }
        })
      })
      return Array.from(monthSet)
    }
    return ORDERED_MONTHS
  }, [prType, ppmpDocs])

  const funds = useMemo(() => {
    if (prType === 'non-cse') {
      const fundSet = new Set<string>()
      ppmpDocs.forEach((d: ProcessedPPMPDoc) => {
        d.items.forEach((i: ProcessedPPMPItem) => {
          if (!i.isCse && i.fund) fundSet.add(i.fund)
        })
      })
      return Array.from(fundSet).sort()
    }
    return Array.from(new Set(sourceItems.flatMap((apr: SourceAPR) => apr.items.map((item: SourceAPRItem) => item.fund).filter(Boolean)))).sort()
  }, [prType, ppmpDocs, sourceItems])

  // Filter APRs list by search and filters (for out-of-stock flow)
  const filteredAPRs = useMemo(() => {
    if (prType === 'non-cse') return []
    const term = searchTerm.trim().toLowerCase()

    return sourceItems.filter((apr: SourceAPR) => {
      if (!apr.items || !apr.items.some((it: SourceAPRItem) => (it.outOfStockQuantity || 0) > 0)) return false

      const matchesAprOrOffice = Boolean(term) && (
        (apr.aprNumber || '').toLowerCase().includes(term) ||
        ((apr.officeName || apr.officeCode || '').toLowerCase().includes(term))
      )

      const hasMatchingItem = apr.items.some((item: SourceAPRItem) => {
        if ((item.outOfStockQuantity || 0) <= 0) return false
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
        const matchesMonth = monthFilter === 'all' || item.month === monthFilter
        const matchesFund = fundFilter === 'all' || item.fund === fundFilter
        if (!matchesCategory || !matchesMonth || !matchesFund) return false

        if (!term) return true

        const matchesItemName = (item.itemName || '').toLowerCase().includes(term)
        return matchesItemName || matchesAprOrOffice
      })

      return hasMatchingItem
    })
  }, [sourceItems, searchTerm, categoryFilter, monthFilter, fundFilter, prType])

  // Count distinct Non-CSE PPMP items that have at least one month selected
  const selectedNonCseItemsCount = useMemo(() => {
    if (prType !== 'non-cse') return 0
    let count = 0
    for (const doc of ppmpDocs) {
      for (const it of doc.items) {
        if (
          !it.isCse &&
          (it.monthlyAllocations || []).some((alloc: EligiblePpmpItemMonthAllocation) =>
            selectedNonCseRows.has(`${it.id}-${alloc.month}`)
          )
        ) {
          count++
        }
      }
    }
    return count
  }, [prType, ppmpDocs, selectedNonCseRows])

  const selectedCount = prType === 'non-cse' ? selectedNonCseItemsCount : selectedAPR.size

  const toggleExpandDoc = (docId: string) => {
    const newExpanded = new Set(expandedDocs)
    if (newExpanded.has(docId)) newExpanded.delete(docId)
    else newExpanded.add(docId)
    setExpandedDocs(newExpanded)
  }

  const [expandedNonCseItems, setExpandedNonCseItems] = useState<Set<string>>(new Set())
  const toggleExpandNonCseItem = (itemId: string) => {
    const newExpanded = new Set(expandedNonCseItems)
    if (newExpanded.has(itemId)) newExpanded.delete(itemId)
    else newExpanded.add(itemId)
    setExpandedNonCseItems(newExpanded)
  }

  const [expandedAPRs, setExpandedAPRs] = useState<Set<string>>(new Set())

  const toggleAPR = (aprId: string) => {
    const newSelected = new Set(selectedAPR)
    if (newSelected.has(aprId)) newSelected.delete(aprId)
    else newSelected.add(aprId)
    setSelectedAPR(newSelected)
  }

  const toggleExpandAPR = (aprId: string) => {
    const newExpanded = new Set(expandedAPRs)
    if (newExpanded.has(aprId)) newExpanded.delete(aprId)
    else newExpanded.add(aprId)
    setExpandedAPRs(newExpanded)
  }

  const handleClearAll = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setMonthFilter('all')
    setFundFilter('all')
    setModeFilter('all')
  }

  const handleToggleItem = (it: ProcessedPPMPItem, checked: boolean) => {
    const newSelected = new Set(selectedNonCseRows)
    if (it.hasMonthlyAllocations) {
      (it.monthlyAllocations || []).forEach((alloc) => {
        const key = `${it.id}-${alloc.month}`
        if (checked) {
          newSelected.add(key)
          setEditedQuantityMap(prev => ({ ...prev, [key]: alloc.availableQuantity ?? 0 }))
        } else {
          newSelected.delete(key)
          setEditedQuantityMap(prev => {
            const copy = { ...prev }
            delete copy[key]
            return copy
          })
        }
      })
    } else {
      const maxAvail = it.availableQuantity ?? 0
      if (checked) {
        newSelected.add(it.id)
        setEditedQuantityMap(prev => ({ ...prev, [it.id]: Math.min(1, maxAvail) }))
      } else {
        newSelected.delete(it.id)
        setEditedQuantityMap(prev => {
          const copy = { ...prev }
          delete copy[it.id]
          return copy
        })
      }
    }
    setSelectedNonCseRows(newSelected)
  }

  const handleToggleAllDoc = (doc: ProcessedPPMPDoc, checked: boolean) => {
    const newSelected = new Set(selectedNonCseRows)
    const nonCseItems = doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)
    nonCseItems.forEach((it: ProcessedPPMPItem) => {
      if (it.hasMonthlyAllocations) {
        (it.monthlyAllocations || []).forEach((alloc) => {
          const key = `${it.id}-${alloc.month}`
          if (checked) {
            newSelected.add(key)
            setEditedQuantityMap(prev => ({ ...prev, [key]: alloc.availableQuantity ?? 0 }))
          } else {
            newSelected.delete(key)
            setEditedQuantityMap(prev => {
              const copy = { ...prev }
              delete copy[key]
              return copy
            })
          }
        })
      } else {
        const maxAvail = it.availableQuantity ?? 0
        if (checked) {
          newSelected.add(it.id)
          setEditedQuantityMap(prev => ({ ...prev, [it.id]: Math.min(1, maxAvail) }))
        } else {
          newSelected.delete(it.id)
          setEditedQuantityMap(prev => {
            const copy = { ...prev }
            delete copy[it.id]
            return copy
          })
        }
      }
    })
    setSelectedNonCseRows(newSelected)
  }

  // Calculated selected items and totals
  const { totalSelectedItemsCount, totalRequestedAmount } = useMemo(() => {
    let count = 0
    let amount = 0

    if (prType === 'non-cse') {
      for (const doc of ppmpDocs) {
        for (const it of doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)) {
          if (it.hasMonthlyAllocations) {
            for (const alloc of (it.monthlyAllocations || [])) {
              const key = `${it.id}-${alloc.month}`
              if (selectedNonCseRows.has(key)) {
                count++
                const qty = editedQuantityMap[key] !== undefined ? editedQuantityMap[key] : (alloc.availableQuantity || 0)
                amount += qty * (it.estimatedUnitPrice || 0)
              }
            }
          } else {
            if (selectedNonCseRows.has(it.id)) {
              count++
              const qty = editedQuantityMap[it.id] !== undefined ? editedQuantityMap[it.id] : (it.availableQuantity || 0)
              amount += qty * (it.estimatedUnitPrice || 0)
            }
          }
        }
      }
    } else {
      count = selectedAPR.size
      amount = Array.from(selectedAPR).reduce((sum, aprId) => {
        const apr = sourceItems.find(a => a.id === aprId)
        if (!apr) return sum
        return sum + apr.items.reduce((s, it) => {
          const outQty = it.outOfStockQuantity || 0
          return s + (outQty > 0 ? it.unitPrice * outQty : 0)
        }, 0)
      }, 0)
    }

    return { totalSelectedItemsCount: count, totalRequestedAmount: amount }
  }, [prType, ppmpDocs, selectedNonCseRows, editedQuantityMap, selectedAPR, sourceItems])

  const handleAddItems = () => {
    const itemsToAdd: PRItem[] = []

    if (prType === 'non-cse') {
      for (const doc of ppmpDocs) {
        for (const it of doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)) {
          if (!it.hasMonthlyAllocations) {
            if (selectedNonCseRows.has(it.id)) {
              const maxAvail = it.availableQuantity ?? 0
              const editedQty = editedQuantityMap[it.id] !== undefined ? editedQuantityMap[it.id] : maxAvail
              if (editedQty <= 0) continue

              itemsToAdd.push({
                id: generateUUID(),
                itemId: it.itemId,
                itemName: it.itemName,
                category: it.itemCategory || it.category,
                quantity: editedQty,
                unitOfMeasure: it.unitOfMeasure,
                unitPrice: it.estimatedUnitPrice,
                totalAmount: editedQty * (it.estimatedUnitPrice || 0),
                fund: it.fund,
                procurementModeId: it.procurementModeId,
                procurementModeName: it.procurementModeName,
                source: 'ppmp',
                setQuantity: maxAvail,
                remainingQuantity: Math.max(0, maxAvail - editedQty),
                ppmpDocId: doc.id,
                ppmpDocName: doc.documentName,
              })
            }
          } else {
            for (const alloc of (it.monthlyAllocations || [])) {
              const compositeKey = `${it.id}-${alloc.month}`
              if (selectedNonCseRows.has(compositeKey)) {
                const maxAllocAvail = alloc.availableQuantity || 0
                const editedQty = editedQuantityMap[compositeKey] !== undefined ? editedQuantityMap[compositeKey] : maxAllocAvail
                if (editedQty <= 0) continue

                itemsToAdd.push({
                  id: generateUUID(),
                  itemId: it.itemId,
                  itemName: it.itemName,
                  category: it.itemCategory || it.category,
                  quantity: editedQty,
                  unitOfMeasure: it.unitOfMeasure,
                  unitPrice: it.estimatedUnitPrice,
                  totalAmount: editedQty * (it.estimatedUnitPrice || 0),
                  month: alloc.month,
                  fund: it.fund,
                  procurementModeId: it.procurementModeId,
                  procurementModeName: it.procurementModeName,
                  source: 'ppmp',
                  setQuantity: maxAllocAvail,
                  remainingQuantity: Math.max(0, maxAllocAvail - editedQty),
                  ppmpDocId: doc.id,
                  ppmpDocName: doc.documentName,
                })
              }
            }
          }
        }
      }
    } else {
      const selectedAprs = sourceItems.filter((apr: SourceAPR) => selectedAPR.has(apr.id))

      for (const apr of selectedAprs) {
        const nested: PRItem[] = apr.items
          .filter((it: SourceAPRItem) => (it.outOfStockQuantity || 0) > 0)
          .map((it: SourceAPRItem) => {
            const originalNeeded = (it.quantity || 0)
            const originalOut = (it.outOfStockQuantity || 0)
            const totalGot = Math.max(0, originalNeeded - originalOut)
            const editedNeeded = typeof editedNeededMap[it.id] === 'number' ? editedNeededMap[it.id] : originalNeeded
            const recomputedDeficit = Math.max(0, editedNeeded - totalGot)

            const requestedQuantity = recomputedDeficit > 0 ? recomputedDeficit : originalOut
            const requestedMonth = it.month ?? (it.monthlyQuantities && Object.keys(it.monthlyQuantities).length > 0 ? Object.keys(it.monthlyQuantities)[0] : undefined)

            return {
              id: generateUUID(),
              itemId: it.id,
              itemName: it.itemName,
              category: it.category,
              quantity: requestedQuantity,
              unitOfMeasure: it.unitOfMeasure,
              unitPrice: it.unitPrice,
              totalAmount: requestedQuantity * (it.unitPrice || 0),
              month: requestedMonth,
              fund: it.fund,
              source: 'apr' as const,
              aprId: apr.id,
              aprNumber: apr.aprNumber,
              aprOffice: apr.officeName,
              aprTotalAmount: apr.totalAmount,
            }
          })

        itemsToAdd.push({
          id: generateUUID(),
          itemId: generateUUID(),
          itemName: `APR #${apr.aprNumber} (${apr.officeName})`,
          category: 'Consolidated APR',
          quantity: 1,
          unitOfMeasure: 'group',
          unitPrice: apr.totalAmount,
          totalAmount: apr.totalAmount,
          month: undefined,
          fund: '',
          source: 'apr',
          aprId: apr.id,
          aprNumber: apr.aprNumber,
          aprOffice: apr.officeName,
          aprTotalAmount: apr.totalAmount,
          aprGroup: {
            id: apr.id,
            aprId: apr.id,
            aprNumber: apr.aprNumber,
            officeName: apr.officeName,
            officeCode: apr.officeCode,
            totalAmount: apr.totalAmount,
            items: nested,
          },
        })
      }
    }

    onAddItems(itemsToAdd)
    setSelectedNonCseRows(new Set())
    setSelectedAPR(new Set())
    setSearchTerm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="2xl"
        className="w-full max-w-6xl h-[88vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border bg-white"
      >
        <DialogHeader className="px-6 pt-6 pb-3 border-b bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shadow-2xs">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {prType === 'non-cse' ? 'Add Office PPMP Items' : 'Add APR Items'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {prType === 'non-cse'
                  ? 'Select approved Non-CSE items to add to this PPMP'
                  : 'Select out-of-stock items from approved APR'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="overflow-y-auto px-6 py-4 flex-1 min-h-0 space-y-4 bg-muted/5">
          {/* Subtle Informational Indicator */}
          {prType === 'non-cse' && (
            <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="p-1 rounded-full bg-purple-100 text-purple-600 mt-0.5 flex-shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-purple-950">Only Non-CSE items are shown.</p>
                <p className="text-purple-800/80 mt-0.5">
                  These items come from approved Non-CSE Item Requests and are maintained by the Tech Rep / Admin.
                </p>
              </div>
            </div>
          )}

          {/* Top filter bar */}
          <div className="flex flex-wrap gap-2.5 items-center justify-between">
            <div className="flex flex-wrap gap-2.5 items-center flex-1 min-w-[280px]">
              <div className="flex-1 min-w-[240px] max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={prType === 'non-cse' ? 'Search by item name, category, or UACS code...' : 'Search by APR number, office, or item...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs bg-white rounded-lg shadow-2xs"
                  />
                </div>
              </div>

              <div className="w-[140px]">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs bg-white rounded-lg shadow-2xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {months.length > 0 && (
                <div className="w-[130px]">
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="h-9 text-xs bg-white rounded-lg shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="w-[130px]">
                <Select value={fundFilter} onValueChange={setFundFilter}>
                  <SelectTrigger className="h-9 text-xs bg-white rounded-lg shadow-2xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Funds</SelectItem>
                    {funds.filter((f): f is string => typeof f === 'string' && f.length > 0).map((fund) => (
                      <SelectItem key={fund} value={fund}>{fund}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {procurementModes.length > 0 && (
                <div className="w-[160px]">
                  <Select value={modeFilter} onValueChange={setModeFilter}>
                    <SelectTrigger className="h-9 text-xs bg-white rounded-lg shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      {procurementModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {(searchTerm || categoryFilter !== 'all' || monthFilter !== 'all' || fundFilter !== 'all' || modeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2.5 rounded-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </div>

          {/* For Non-CSE PRs show list of Office PPMPs with refined table view */}
          {prType === 'non-cse' ? (
            <div className="space-y-4">
              {isPpmpsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p>Loading eligible PPMP items from approved APP...</p>
                </div>
              ) : isPpmpsError ? (
                <div className="border border-destructive/30 bg-destructive/5 text-destructive rounded-xl p-5 text-sm space-y-2">
                  <p className="font-semibold text-base">Failed to load eligible PPMP items</p>
                  <p className="text-xs text-destructive/80">
                    {(ppmpsError as any)?.response?.data?.message || (ppmpsError as any)?.message || 'An error occurred while communicating with the server.'}
                  </p>
                </div>
              ) : filteredPPMPDocs.length === 0 ? (
                <div className="text-center py-16 text-sm border border-dashed rounded-xl bg-white space-y-2 p-6">
                  <p className="font-medium text-foreground">No eligible Non-CSE items found</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Items must be approved Non-CSE items belonging to an approved PPMP, consolidated into an approved APP, and within your office budget allocation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPPMPDocs.map((doc: ProcessedPPMPDoc) => {
                    const isExpanded = expandedDocs.has(doc.id)
                    const nonCseItems = doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)

                    if (nonCseItems.length === 0) return null

                    const ppmpTotal = nonCseItems.reduce((s: number, it: ProcessedPPMPItem) => s + (it.totalAmount || 0), 0)

                    const isAllDocSelected = nonCseItems.length > 0 && nonCseItems.every((it: ProcessedPPMPItem) => {
                      if (it.hasMonthlyAllocations) {
                        return (it.monthlyAllocations || []).every((alloc) => selectedNonCseRows.has(`${it.id}-${alloc.month}`))
                      }
                      return selectedNonCseRows.has(it.id)
                    })

                    const docTotalRequested = nonCseItems.reduce((sum, it) => {
                      if (it.hasMonthlyAllocations) {
                        return sum + (it.monthlyAllocations || []).reduce((mSum, alloc) => {
                          const key = `${it.id}-${alloc.month}`
                          if (selectedNonCseRows.has(key)) {
                            const qty = editedQuantityMap[key] !== undefined ? editedQuantityMap[key] : (alloc.availableQuantity || 0)
                            return mSum + qty * (it.estimatedUnitPrice || 0)
                          }
                          return mSum
                        }, 0)
                      } else {
                        if (selectedNonCseRows.has(it.id)) {
                          const qty = editedQuantityMap[it.id] !== undefined ? editedQuantityMap[it.id] : (it.availableQuantity || 0)
                          return sum + qty * (it.estimatedUnitPrice || 0)
                        }
                        return sum
                      }
                    }, 0)

                    return (
                      <div key={doc.id} className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-white">
                        {/* PPMP Header - Expandable */}
                        <div
                          className="px-4 py-3.5 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition select-none bg-muted/10 border-b"
                          onClick={() => toggleExpandDoc(doc.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                {doc.documentName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Office: {doc.officeName || doc.officeCode} • {nonCseItems.length} Non-CSE item{nonCseItems.length !== 1 ? 's' : ''} available
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge className="bg-primary/90 hover:bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-md shadow-2xs">
                                ₱{ppmpTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground tracking-tight mt-0.5">Available Budget</div>
                            </div>
                            <div className="text-muted-foreground p-1">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Items Table View */}
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                                  <TableHead className="w-12 text-center py-3">
                                    <Checkbox
                                      checked={isAllDocSelected}
                                      onCheckedChange={(checked) => handleToggleAllDoc(doc, !!checked)}
                                    />
                                  </TableHead>
                                  <TableHead className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider py-3">ITEM & DESCRIPTION</TableHead>
                                  <TableHead className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider py-3">CATEGORY</TableHead>
                                  <TableHead className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider py-3 text-center w-36">UNIT PRICE</TableHead>
                                  <TableHead className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider py-3 text-center w-28">AVAILABLE QTY</TableHead>
                                  <TableHead className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider py-3 text-right w-36">REQ. TOTAL</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {doc.items.map((it: ProcessedPPMPItem) => {
                                  const iconMeta = getCategoryIcon(it.itemCategory || it.category, it.itemName)
                                  const IconComponent = iconMeta.icon

                                  const isSelected = it.hasMonthlyAllocations
                                    ? (it.monthlyAllocations || []).some((alloc) => selectedNonCseRows.has(`${it.id}-${alloc.month}`))
                                    : selectedNonCseRows.has(it.id)

                                  const isExpandedItem = expandedNonCseItems.has(it.id)
                                  const maxAvail = it.availableQuantity ?? 0
                                  const editedQty = editedQuantityMap[it.id] !== undefined ? editedQuantityMap[it.id] : (isSelected ? Math.min(1, maxAvail) : 0)

                                  const totalItemAmount = it.hasMonthlyAllocations
                                    ? (it.monthlyAllocations || []).reduce((sum, alloc) => {
                                        const qty = editedQuantityMap[`${it.id}-${alloc.month}`] !== undefined ? editedQuantityMap[`${it.id}-${alloc.month}`] : (alloc.availableQuantity ?? 0)
                                        return sum + (selectedNonCseRows.has(`${it.id}-${alloc.month}`) ? qty * (it.estimatedUnitPrice || 0) : 0)
                                      }, 0)
                                    : (isSelected && editedQty > 0 ? editedQty * (it.estimatedUnitPrice || 0) : 0)

                                  return (
                                    <React.Fragment key={it.id}>
                                      <TableRow className={`hover:bg-muted/20 transition-colors border-b last:border-b-0 ${isSelected ? 'bg-primary/5' : ''}`}>
                                        <TableCell className="text-center align-top pt-4">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleToggleItem(it, !!checked)}
                                          />
                                        </TableCell>

                                        {/* ITEM & DESCRIPTION */}
                                        <TableCell className="align-top py-3.5 max-w-[480px]">
                                          <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${iconMeta.color}`}>
                                              <IconComponent className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                              <span className="font-bold text-sm text-foreground leading-snug">
                                                {it.itemName}
                                              </span>
                                              {it.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                  {it.description}
                                                </span>
                                              )}
                                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0">
                                                  {it.procurementModeName || 'Direct Acquisition'}
                                                </Badge>
                                                {it.uacsCode && (
                                                  <span className="text-[11px] font-mono text-muted-foreground/80">
                                                    • UACS: {it.uacsCode}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>

                                        {/* CATEGORY */}
                                        <TableCell className="align-top pt-4">
                                          <Badge variant="outline" className={`rounded-lg text-xs font-medium px-2.5 py-0.5 shadow-2xs ${getCategoryBadgeStyle(it.itemCategory || it.category)}`}>
                                            {it.itemCategory || it.category || 'General'}
                                          </Badge>
                                        </TableCell>

                                        {/* UNIT PRICE */}
                                        <TableCell className="text-center align-top pt-4">
                                          <div className="font-semibold text-xs text-foreground">
                                            ₱{it.estimatedUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </div>
                                          <div className="text-[11px] text-muted-foreground mt-0.5">
                                            / {it.unitOfMeasure}
                                          </div>
                                        </TableCell>

                                        {/* AVAILABLE QTY */}
                                        <TableCell className="text-center align-top pt-4 font-semibold text-xs text-foreground">
                                          {maxAvail}
                                        </TableCell>

                                        {/* REQ. TOTAL */}
                                        <TableCell className="text-right align-top pt-3.5">
                                          {it.hasMonthlyAllocations ? (
                                            <div className="flex flex-col items-end gap-1">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpandNonCseItem(it.id)}
                                                className="h-7 text-xs text-primary hover:text-primary gap-1 px-2"
                                              >
                                                {isExpandedItem ? 'Hide Months' : 'View Months'}
                                                {isExpandedItem ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                              </Button>
                                              <span className="text-xs font-semibold tabular-nums text-foreground">
                                                {totalItemAmount > 0 ? `₱${totalItemAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱ 0.00'}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-end gap-2">
                                              {isSelected ? (
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    value={String(editedQty)}
                                                    onChange={(e) => {
                                                      const v = parseInt(e.target.value || '0', 10)
                                                      let val = Number.isNaN(v) ? 0 : v
                                                      if (val > maxAvail) val = maxAvail
                                                      if (val < 0) val = 0
                                                      setEditedQuantityMap(prev => ({ ...prev, [it.id]: val }))
                                                    }}
                                                    className="w-16 h-8 text-center text-xs font-semibold tabular-nums rounded-md"
                                                    inputMode="numeric"
                                                    max={maxAvail}
                                                    min={1}
                                                  />
                                                  <span className="text-xs font-semibold text-foreground tabular-nums min-w-[70px] text-right">
                                                    ₱{totalItemAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-muted-foreground font-normal tabular-nums">
                                                  ₱ 0.00
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </TableCell>
                                      </TableRow>

                                      {/* Inline Months Grid (when item has monthly breakdown) */}
                                      {it.hasMonthlyAllocations && isExpandedItem && (
                                        <>
                                          <TableRow className="bg-muted/10 border-none">
                                            <TableCell></TableCell>
                                            <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider pt-3 pb-1.5">MONTH</TableCell>
                                            <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider pt-3 pb-1.5">AVAIL BALANCE</TableCell>
                                            <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider text-center pt-3 pb-1.5">REQ QTY</TableCell>
                                            <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider text-right pt-3 pb-1.5">TOTAL</TableCell>
                                          </TableRow>
                                          {(it.monthlyAllocations || []).map((alloc: EligiblePpmpItemMonthAllocation) => {
                                            const key = `${it.id}-${alloc.month}`
                                            const isMonthSelected = selectedNonCseRows.has(key)
                                            const maxMonthAvail = alloc.availableQuantity ?? 0
                                            const editedMonthQty = editedQuantityMap[key] !== undefined ? editedQuantityMap[key] : (isMonthSelected ? maxMonthAvail : 0)

                                            return (
                                              <TableRow key={alloc.month} className="bg-muted/10 border-none hover:bg-muted/20 transition-colors">
                                                <TableCell></TableCell>
                                                <TableCell className="font-semibold text-xs py-2">
                                                  {alloc.month}
                                                </TableCell>
                                                <TableCell className="py-2">
                                                  <Badge variant="outline" className="rounded-md font-normal shadow-2xs bg-white text-xs">
                                                    {maxMonthAvail} {it.unitOfMeasure}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="text-center py-2">
                                                  <Input
                                                    value={String(editedMonthQty)}
                                                    onChange={(e) => {
                                                      const v = parseInt(e.target.value || '0', 10)
                                                      let val = Number.isNaN(v) ? 0 : v
                                                      if (val > maxMonthAvail) val = maxMonthAvail
                                                      if (val < 0) val = 0
                                                      
                                                      setEditedQuantityMap(prev => ({ ...prev, [key]: val }))
                                                      
                                                      if (val > 0 && !isMonthSelected) {
                                                        const newSelected = new Set(selectedNonCseRows)
                                                        newSelected.add(key)
                                                        setSelectedNonCseRows(newSelected)
                                                      } else if (val === 0 && isMonthSelected) {
                                                        const newSelected = new Set(selectedNonCseRows)
                                                        newSelected.delete(key)
                                                        setSelectedNonCseRows(newSelected)
                                                      }
                                                    }}
                                                    className="w-24 mx-auto text-center tabular-nums h-8 text-xs bg-white rounded-md"
                                                    inputMode="numeric"
                                                    max={maxMonthAvail}
                                                    min={0}
                                                  />
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-semibold text-xs text-muted-foreground py-2">
                                                  {editedMonthQty > 0 ? `₱${(editedMonthQty * (it.estimatedUnitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱ 0.00'}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          })}
                                        </>
                                      )}
                                    </React.Fragment>
                                  )
                                })}
                              </TableBody>
                              <TableFooter className="bg-muted/10 border-t">
                                <TableRow>
                                  <TableCell colSpan={5} className="text-right text-xs font-bold text-muted-foreground py-3">
                                    Total Requested
                                  </TableCell>
                                  <TableCell className="text-right text-sm font-bold text-primary py-3 tabular-nums pr-4">
                                    ₱{docTotalRequested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            // APR selection UI for out-of-stock
            <div>
              <div className="space-y-3">
                {filteredAPRs.map((apr: SourceAPR) => {
                  const isSelected = selectedAPR.has(apr.id)
                  const isExpanded = expandedAPRs.has(apr.id)
                  const hasOutOfStockItems = apr.items.some(item => (item.outOfStockQuantity ?? 0) > 0)

                  if (!hasOutOfStockItems) return null

                  const totalAmount = apr.items.reduce((sum, item) => sum + ((item.outOfStockQuantity ?? 0) > 0 ? item.unitPrice * (item.outOfStockQuantity ?? 0) : 0), 0)

                  return (
                    <div key={apr.id} className="border rounded-xl overflow-hidden bg-white shadow-2xs">
                      <div
                        className="px-4 py-3.5 flex items-center gap-4 hover:bg-muted/30 cursor-pointer transition"
                        onClick={() => toggleExpandAPR(apr.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleAPR(apr.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">APR #{apr.aprNumber}</span>
                            <Badge variant="outline" className="text-[11px] font-normal capitalize">
                              {apr.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Office: {apr.officeName || apr.officeCode} • {apr.items.filter(i => (i.outOfStockQuantity ?? 0) > 0).length} out-of-stock items
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="bg-primary/90 text-white font-semibold text-xs">
                            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{isExpanded ? '▼' : '▶'}</div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-muted/10 overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-xs uppercase font-bold text-muted-foreground">ITEM</TableHead>
                                <TableHead className="text-xs uppercase font-bold text-muted-foreground">CATEGORY</TableHead>
                                <TableHead className="text-right text-xs uppercase font-bold text-muted-foreground">UNIT PRICE</TableHead>
                                <TableHead className="text-center text-xs uppercase font-bold text-muted-foreground">FULFILLED</TableHead>
                                <TableHead className="text-center text-xs uppercase font-bold text-muted-foreground">DEFICIT</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {apr.items.filter(i => (i.outOfStockQuantity ?? 0) > 0).map((it) => (
                                <TableRow key={it.id}>
                                  <TableCell className="font-medium text-xs py-3">{it.itemName}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground py-3">{it.category}</TableCell>
                                  <TableCell className="text-right font-semibold text-xs py-3">₱{it.unitPrice.toLocaleString()}</TableCell>
                                  <TableCell className="text-center text-xs py-3">{it.currentFulfilled ?? 0} {it.unitOfMeasure}</TableCell>
                                  <TableCell className="text-center text-xs font-bold text-primary py-3">{it.outOfStockQuantity} {it.unitOfMeasure}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex-shrink-0 border-t bg-white px-6 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <div className="text-xs font-medium text-muted-foreground">
              Selected: <span className="font-bold text-foreground">{totalSelectedItemsCount} {totalSelectedItemsCount === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Total: <span className="font-bold text-primary text-sm">₱{totalRequestedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddItems}
              disabled={totalSelectedItemsCount === 0}
              className="h-9 px-5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-xs"
            >
              Add {totalSelectedItemsCount > 0 ? `${totalSelectedItemsCount} ` : ''}Items
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
