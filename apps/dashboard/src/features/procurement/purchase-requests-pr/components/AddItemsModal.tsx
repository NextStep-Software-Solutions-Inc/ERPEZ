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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { PRItem, ProcessedPPMPItem, ProcessedPPMPDoc, SourceAPRItem } from '../types'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { Badge } from '@/components/ui/badge'
import { usePurchaseRequestEligiblePpmps, usePurchaseRequestEligibleAprs } from '../handlers/hooks'
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
  /** UUID of the PR being edited — required to fetch eligible PPMPs for non-CSE PRs */
  prId?: string
  /** Current items in the PR to filter out from the eligible list */
  currentItems?: PRItem[]
}

export function AddItemsModal({
  open,
  onOpenChange,
  prType,
  onAddItems,
  prId,
  currentItems,
}: AddItemsModalProps) {
  // selectedNonCseRows stores selected individual items (composite id: `${ppmpItemId}-${month}`)
  const [selectedNonCseRows, setSelectedNonCseRows] = useState<Set<string>>(new Set())
  // expandedDocs stores which PPMP docs are expanded to show items
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())
  // For APR: selectedAPR stores selected APR ids (selecting an APR includes all its out-of-stock items)
  const [selectedAPR, setSelectedAPR] = useState<Set<string>>(new Set())
  // track edited 'Total Required' per APR item so Deficit can be recalculated
  const [editedNeededMap, setEditedNeededMap] = useState<Record<string, number>>({})
  // track per-item per-month edited quantities for APR items
  const [editedMonthlyMap, setEditedMonthlyMap] = useState<Record<string, Record<string, number>>>({})
  // track per-row edited quantities for Non-CSE items (id is composite ppmpItemId-month)
  const [editedQuantityMap, setEditedQuantityMap] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')

  const { activePR } = usePurchaseRequestStore()

  const { data: eligiblePpmpsResponse } = usePurchaseRequestEligiblePpmps({
    pathParams: { id: prId ?? activePR?.officeCode ?? '' },
    enabled: open && prType === 'non-cse' && (Boolean(prId) || Boolean(activePR?.officeCode)),
  })

  // Build the PPMP docs list from API response
  const ppmpDocs = useMemo<ProcessedPPMPDoc[]>(() => {
    if (prType !== 'non-cse') return []
    if (eligiblePpmpsResponse && eligiblePpmpsResponse.data) {
      return eligiblePpmpsResponse.data
        .map((doc) => {
          const processedItems: ProcessedPPMPItem[] = doc.items.map((item) => {
            const matchingPrItems = currentItems?.filter(prItem => prItem.itemId === item.ppmpItemId || prItem.id === item.ppmpItemId) || []
            
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

            return {
              id: item.ppmpItemId,
              itemId: item.ppmpItemId,
              itemName: item.itemName,
              category: item.category,
              isCse: false,
              unitOfMeasure: item.unit,
              estimatedUnitPrice: item.unitPrice,
              totalAmount: item.totalAvailableAmount,
              fund: item.fund,
              monthlyAllocations: adjustedMonthlyAllocations,
            }
          }).filter(item => item.monthlyAllocations.length > 0)

          return {
            id: doc.ppmpId,
            documentName: `${doc.ppmpNumber} — ${doc.officeName}`,
            officeCode: doc.officeId,
            items: processedItems,
          }
        })
        .filter((doc) => doc.items.length > 0)
    }
    return []
  }, [prType, eligiblePpmpsResponse, currentItems])

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
      const matchesDoc = !term || (doc.documentName || '').toLowerCase().includes(term) || (doc.officeCode || '').toLowerCase().includes(term)

      const filteredItems = nonCseItems.filter((item: ProcessedPPMPItem) => {
        const matchesSearch = matchesDoc || item.itemName.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
        const matchesMonth = monthFilter === 'all' || 
          (item.monthlyAllocations && item.monthlyAllocations.some((m: EligiblePpmpItemMonthAllocation) => m.month === monthFilter && m.availableQuantity > 0)) ||
          (item.monthlyQuantities
            ? Object.keys(item.monthlyQuantities).includes(monthFilter) && (item.monthlyQuantities[monthFilter] || 0) > 0
            : item.month === monthFilter)
        const matchesFund = fundFilter === 'all' || item.fund === fundFilter
        return matchesSearch && matchesCategory && matchesMonth && matchesFund
      })
      return { ...doc, items: filteredItems }
    }).filter((doc: ProcessedPPMPDoc) => doc.items.length > 0)
  }, [ppmpDocs, searchTerm, categoryFilter, monthFilter, fundFilter, prType])

  // Reset to first page when filters or source change
  useEffect(() => {
    // when filters change, ensure selection remains valid — handled elsewhere
  }, [searchTerm, categoryFilter, monthFilter, fundFilter, prType, sourceItems])

  // Get unique categories and filters
  const categories = useMemo(
    () => {
      if (prType === 'non-cse') {
        return Array.from(new Set(ppmpDocs.flatMap((doc: ProcessedPPMPDoc) => doc.items.filter((i: ProcessedPPMPItem) => !i.isCse).map((item: ProcessedPPMPItem) => item.category).filter(Boolean)))).sort()
      }
      return Array.from(new Set(sourceItems.flatMap((apr: SourceAPR) => apr.items.map((item: SourceAPRItem) => item.category).filter(Boolean).filter((cat: string) => cat !== 'CSE')))).sort()
    },
    [ppmpDocs, sourceItems, prType],
  )

  const months = ORDERED_MONTHS

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

   const handleAddItems = () => {
      const itemsToAdd: PRItem[] = []

      if (prType === 'non-cse') {
        for (const doc of ppmpDocs) {
          for (const it of doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)) {
            for (const alloc of (it.monthlyAllocations || [])) {
              const compositeKey = `${it.id}-${alloc.month}`
              if (selectedNonCseRows.has(compositeKey)) {
                const editedQty = editedQuantityMap[compositeKey] !== undefined ? editedQuantityMap[compositeKey] : (alloc.availableQuantity || 0)
                if (editedQty <= 0) continue

                itemsToAdd.push({
                  id: generateUUID(),
                  itemId: it.itemId,
                  itemName: it.itemName,
                  category: it.category,
                  quantity: editedQty,
                  unitOfMeasure: it.unitOfMeasure,
                  unitPrice: it.estimatedUnitPrice,
                  totalAmount: editedQty * (it.estimatedUnitPrice || 0),
                  month: alloc.month,
                  fund: it.fund,
                  source: 'ppmp',
                  ppmpDocId: doc.id,
                  ppmpDocName: doc.documentName,
                })
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
               const totalToAdd = Math.max(0, editedNeeded - totalGot)

               const monthlyFromEdits = editedMonthlyMap[it.id]
               let monthlyQuantities: Record<string, number> = {}

               if (monthlyFromEdits) {
                 monthlyQuantities = { ...monthlyFromEdits }
               } else {
                 const itemMonthlyQty = it.monthlyQuantities

                 if (itemMonthlyQty && Object.keys(itemMonthlyQty).length > 0) {
                   let remainingFulfilled = Math.max(0, totalGot)
                   const rem: Record<string, number> = {}

                   for (const m of ORDERED_MONTHS) {
                     const scheduled = itemMonthlyQty[m] || 0
                     if (scheduled <= 0) {
                       rem[m] = 0
                       continue
                     }

                     if (remainingFulfilled >= scheduled) {
                       rem[m] = 0
                       remainingFulfilled -= scheduled
                     } else if (remainingFulfilled > 0) {
                       rem[m] = scheduled - remainingFulfilled
                       remainingFulfilled = 0
                     } else {
                       rem[m] = scheduled
                     }
                   }

                   monthlyQuantities = Object.fromEntries(
                     Object.entries(rem).filter(([, v]) => v > 0)
                   ) as Record<string, number>
                 } else {
                   monthlyQuantities = it.month ? { [it.month]: totalToAdd } : {}
                 }
               }

               const computedQty = Object.values(monthlyQuantities).reduce((s, v) => s + (v || 0), 0)

               return {
                 id: generateUUID(),
                 itemId: it.id,
                 itemName: it.itemName,
                 category: it.category,
                 quantity: computedQty,
                 unitOfMeasure: it.unitOfMeasure,
                 unitPrice: it.unitPrice || 0,
                 totalAmount: computedQty * (it.unitPrice || 0),
                 source: 'apr',
                 month: it.month,
                 fund: it.fund,
                 originalNeeded: originalNeeded,
                 outOfStockQuantity: originalOut,
                 totalGot: totalGot,
                 editedNeeded: editedNeeded,
                 monthlyQuantities: monthlyQuantities,
               } as PRItem
             })

          const aprTotal = nested.reduce((s, ni) => s + (ni.totalAmount || 0), 0)

          itemsToAdd.push({
            id: generateUUID(),
            itemId: apr.id,
            itemName: apr.aprNumber,
            category: 'APR',
            quantity: nested.reduce((s, ni) => s + (ni.quantity || 0), 0),
            unitOfMeasure: '',
            unitPrice: 0,
            totalAmount: aprTotal,
            source: 'apr',
            aprGroup: {
              id: apr.id,
              aprNumber: apr.aprNumber,
              officeCode: apr.officeCode,
              officeName: apr.officeName,
              items: nested,
            },
          })
        }
      }

    onAddItems(itemsToAdd)
    setSelectedNonCseRows(new Set())
    setEditedQuantityMap({})
    setSearchTerm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="4xl"
        className="w-full max-w-4xl h-[80vh] max-h-[90vh] flex flex-col"
      >
        <DialogHeader>
           <DialogTitle>
             {prType === 'non-cse'
               ? 'Add Office PPMP Items'
               : 'Add APR Items'}
           </DialogTitle>
           <DialogDescription>
             {prType === 'non-cse'
               ? 'Select Non-CSE items from your approved PPMP'
               : 'Select out-of-stock items from approved APR'}
           </DialogDescription>
         </DialogHeader>

         {/* Scrollable content area */}
         <div className="overflow-y-auto px-6 py-4 pb-24 flex-1 min-h-0 space-y-4">

          {/* Top filter bar */}
          <div className="flex gap-3 items-end justify-between">
            <div className="flex gap-3 items-end flex-1">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={prType === 'non-cse' ? 'Search by item name, category, or PPMP...' : 'Search by APR number, office, or item...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              <div style={{ minWidth: 'fit-content' }}>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9">
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

              <div style={{ minWidth: 'fit-content' }}>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="h-9">
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

              <div style={{ minWidth: 'fit-content' }}>
                <Select value={fundFilter} onValueChange={setFundFilter}>
                  <SelectTrigger className="h-9">
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
            </div>
          </div>

           {/* For Non-CSE PRs show list of Office PPMPs (selectable) with expandable items view */}
           {prType === 'non-cse' ? (
             <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{filteredPPMPDocs.length} Office PPMP{filteredPPMPDocs.length !== 1 ? 's' : ''} found</p>
              </div>

              {/* PPMPs List */}
              <div className="space-y-3">
              {filteredPPMPDocs.map((doc: ProcessedPPMPDoc) => {
                const isExpanded = expandedDocs.has(doc.id)
                const nonCseItems = doc.items.filter((i: ProcessedPPMPItem) => !i.isCse)

                if (nonCseItems.length === 0) return null

                const ppmpTotal = nonCseItems.reduce((s: number, it: ProcessedPPMPItem) => s + (it.totalAmount || 0), 0)

                return (
                  <div key={doc.id} className="border rounded-lg overflow-hidden">
                    {/* PPMP Header - Expandable */}
                    <div
                      className="px-4 py-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition"
                      onClick={() => toggleExpandDoc(doc.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{doc.documentName}</div>
                        <div className="text-xs text-muted-foreground">Office: {doc.officeCode} • {nonCseItems.length} item(s)</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge color="default" className="text-sm font-semibold">₱{ppmpTotal.toLocaleString()}</Badge>
                        <div className="text-xs text-muted-foreground">{isExpanded ? '▼' : '▶'}</div>
                      </div>
                    </div>

                    {/* Expanded Items View - Selectable Rows */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="w-12 text-center">
                                <Checkbox
                                  checked={nonCseItems.length > 0 && nonCseItems.every((it: ProcessedPPMPItem) => 
                                    (it.monthlyAllocations || []).every((alloc: EligiblePpmpItemMonthAllocation) => selectedNonCseRows.has(`${it.id}-${alloc.month}`))
                                  )}
                                  onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedNonCseRows)
                                    nonCseItems.forEach((it: ProcessedPPMPItem) => {
                                      (it.monthlyAllocations || []).forEach((alloc: EligiblePpmpItemMonthAllocation) => {
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
                                    })
                                    setSelectedNonCseRows(newSelected)
                                  }}
                                />
                              </TableHead>
                              <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">ITEM</TableHead>
                              <TableHead className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">FUND</TableHead>
                              <TableHead className="text-center text-xs uppercase font-semibold text-muted-foreground tracking-wider w-36">UNIT PRICE</TableHead>
                              <TableHead className="text-right text-xs uppercase font-semibold text-muted-foreground tracking-wider w-32">REQ TOTAL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {doc.items.map((it: ProcessedPPMPItem) => {
                              const isSelected = (it.monthlyAllocations || []).some((alloc: EligiblePpmpItemMonthAllocation) => selectedNonCseRows.has(`${it.id}-${alloc.month}`))
                              const isExpanded = expandedNonCseItems.has(it.id)
                              const totalItemAmount = (it.monthlyAllocations || []).reduce((sum: number, alloc: EligiblePpmpItemMonthAllocation) => {
                                const qty = editedQuantityMap[`${it.id}-${alloc.month}`] !== undefined ? editedQuantityMap[`${it.id}-${alloc.month}`] : (alloc.availableQuantity ?? 0)
                                return sum + (selectedNonCseRows.has(`${it.id}-${alloc.month}`) ? qty * (it.estimatedUnitPrice || 0) : 0)
                              }, 0)

                              return (
                                <React.Fragment key={it.id}>
                                  <TableRow className={isSelected ? 'bg-primary/5' : ''}>
                                    <TableCell className="text-center align-top pt-4">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const newSelected = new Set(selectedNonCseRows)
                                          if (checked) {
                                            (it.monthlyAllocations || []).forEach((alloc: EligiblePpmpItemMonthAllocation) => {
                                              const key = `${it.id}-${alloc.month}`
                                              newSelected.add(key)
                                              setEditedQuantityMap(prev => ({ ...prev, [key]: alloc.availableQuantity ?? 0 }))
                                            })
                                          } else {
                                            (it.monthlyAllocations || []).forEach((alloc: EligiblePpmpItemMonthAllocation) => {
                                              const key = `${it.id}-${alloc.month}`
                                              newSelected.delete(key)
                                              setEditedQuantityMap(prev => {
                                                const copy = { ...prev }
                                                delete copy[key]
                                                return copy
                                              })
                                            })
                                          }
                                          setSelectedNonCseRows(newSelected)
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="py-3 cursor-pointer align-top" onClick={() => toggleExpandNonCseItem(it.id)}>
                                      <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm">{it.itemName}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[400px]">{it.category}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="align-top pt-3">
                                      <Badge variant="outline" className="rounded-full font-normal shadow-sm bg-white">
                                        {it.fund || '—'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium align-top pt-4">
                                      ₱{it.estimatedUnitPrice.toLocaleString()} <span className="text-muted-foreground font-normal">/ {it.unitOfMeasure}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-primary align-top pt-4">
                                      {totalItemAmount > 0 ? `₱${totalItemAmount.toLocaleString()}` : <span className="text-muted-foreground font-normal">₱0</span>}
                                    </TableCell>
                                  </TableRow>
                                  
                                  {/* Inline Months Grid */}
                                  {isExpanded && (
                                    <>
                                      <TableRow className="bg-muted/10 border-none">
                                        <TableCell></TableCell>
                                        <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider pt-4 pb-2">MONTH</TableCell>
                                        <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider pt-4 pb-2">AVAIL BALANCE</TableCell>
                                        <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider text-center pt-4 pb-2">REQ QTY</TableCell>
                                        <TableCell className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider text-right pt-4 pb-2">TOTAL</TableCell>
                                      </TableRow>
                                      {(it.monthlyAllocations || []).map((alloc: EligiblePpmpItemMonthAllocation) => {
                                        const key = `${it.id}-${alloc.month}`
                                        const isMonthSelected = selectedNonCseRows.has(key)
                                        const maxAvail = alloc.availableQuantity ?? 0
                                        const editedQty = editedQuantityMap[key] !== undefined ? editedQuantityMap[key] : maxAvail

                                        return (
                                          <TableRow key={alloc.month} className="bg-muted/10 border-none hover:bg-muted/20 transition-colors">
                                            <TableCell></TableCell>
                                            <TableCell className="font-semibold text-sm py-2">
                                              {alloc.month}
                                            </TableCell>
                                            <TableCell className="py-2">
                                              <Badge variant="outline" className="rounded-full font-normal shadow-sm bg-white border-muted-foreground/20">
                                                {maxAvail} {it.unitOfMeasure}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-center py-2">
                                              <Input
                                                value={String(editedQty)}
                                                onChange={(e) => {
                                                  const v = parseInt(e.target.value || '0', 10)
                                                  let val = Number.isNaN(v) ? 0 : v
                                                  if (val > maxAvail) val = maxAvail
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
                                                className={`w-32 mx-auto text-center tabular-nums h-9 bg-white shadow-sm ${editedQty > maxAvail ? 'border-red-500' : ''}`}
                                                inputMode="numeric"
                                                max={maxAvail}
                                                min={0}
                                              />
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums font-medium text-muted-foreground py-2">
                                              {editedQty > 0 ? `₱${(editedQty * (it.estimatedUnitPrice || 0)).toLocaleString()}` : '₱0'}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                      <TableRow className="border-b-muted">
                                        <TableCell colSpan={5} className="p-0 h-4"></TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
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
                    <div key={apr.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="px-4 py-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer transition"
                        onClick={() => toggleExpandAPR(apr.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleAPR(apr.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {(() => {
                          for (const it of apr.items) {
                            if (
                              !it.monthlyQuantities ||
                              Object.keys(it.monthlyQuantities).length === 0
                            ) {
                              if (it.month) {
                                it.monthlyQuantities = { [it.month]: it.quantity || 0 }
                              }
                            }
                          }
                          return null
                        })()}
                        <div className="flex-1">
                          <div className="font-medium">{apr.aprNumber} • {apr.officeName || apr.officeCode}</div>
                          <div className="text-xs text-muted-foreground">Office: {apr.officeCode} • {apr.items.filter(item => (item.outOfStockQuantity ?? 0) > 0).length} item(s)</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge color="default" className="text-sm font-semibold">₱{totalAmount.toLocaleString()}</Badge>
                          <div className="text-xs text-muted-foreground">{isExpanded ? '▼' : '▶'}</div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-muted/20 overflow-x-auto">
                          <Table className="table-fixed w-full">
                            <TableHeader>
                              <TableRow className="bg-muted/40">
                                <TableHead className="w-56">Item Name</TableHead>
                                <TableHead className="w-40">Category</TableHead>
                                <TableHead className="w-24">Fund</TableHead>
                                {ORDERED_MONTHS.map((m) => (
                                 <TableHead key={m} className="w-20 text-center">{m.slice(0,3)}</TableHead>
                                ))}
                                <TableHead className="w-36 text-left">Total Required</TableHead>
                                <TableHead className="w-32 text-left">Current Total</TableHead>
                                <TableHead className="w-32 text-left">Deficit</TableHead>
                                <TableHead className="w-32 text-left">Unit Price</TableHead>
                                <TableHead className="w-32 text-left">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {apr.items.filter((item: SourceAPRItem) => {
                                const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
                                const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
                                const matchesMonth = monthFilter === 'all' || item.month === monthFilter
                                const matchesFund = fundFilter === 'all' || (item.fund || '') === fundFilter
                                return (item.outOfStockQuantity ?? 0) > 0 && matchesSearch && matchesCategory && matchesMonth && matchesFund
                              }).map((item: SourceAPRItem) => {
                                const originalNeeded = item.quantity || 0
                                const originalOut = item.outOfStockQuantity || 0
                                const totalGot = Math.max(0, originalNeeded - originalOut)
                                const unitPrice = item.unitPrice || 0
                                const itemMonthlyQty = item.monthlyQuantities

                                const getMonthValue = (mm: string) => {
                                  if (editedMonthlyMap[item.id] && typeof editedMonthlyMap[item.id][mm] === 'number') {
                                    return editedMonthlyMap[item.id][mm]
                                  }
                                  if (itemMonthlyQty) return itemMonthlyQty[mm] || 0
                                  return 0
                                }

                                const displayTotalRequired = ORDERED_MONTHS.reduce((s, mm) => s + getMonthValue(mm), 0)
                                const totalToAdd = Math.max(0, displayTotalRequired - totalGot)
                                const totalAmount = totalToAdd * unitPrice

                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.fund || '—'}</TableCell>

                                    {ORDERED_MONTHS.map((m) => (
                                      <TableCell key={`${item.id}-${m}`} className="text-center">
                                          <div className="flex items-center justify-center">
                                          <Input
                                            value={String(getMonthValue(m))}
                                            onChange={(e) => {
                                              const v = parseInt(e.target.value || '0', 10)
                                              const newVal = Number.isNaN(v) ? 0 : v
                                              setEditedMonthlyMap((prev) => {
                                                const prevRow = prev[item.id] || {}
                                                const nextRow = { ...prevRow, [m]: newVal }
                                                const sum = ORDERED_MONTHS.reduce((s, mm) => s + (nextRow[mm] || 0), 0)
                                                setEditedNeededMap((prevNeeded) => ({ ...prevNeeded, [item.id]: sum }))
                                                return { ...prev, [item.id]: nextRow }
                                              })
                                            }}
                                            className="w-16 text-center tabular-nums"
                                            inputMode="numeric"
                                          />
                                        </div>
                                      </TableCell>
                                    ))}

                                    <TableCell className="text-left w-36">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                          <Input
                                            value={String(displayTotalRequired)}
                                            readOnly
                                            className="w-20 min-w-[80px] tabular-nums text-left pr-2 bg-muted/10"
                                          />
                                        </div>
                                        <div className="ml-3 flex-1">
                                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.unitOfMeasure || ''}</span>
                                        </div>
                                      </div>
                                    </TableCell>

                                    <TableCell className="text-left w-32">
                                      <Badge color="default" className="tabular-nums">{totalGot} {item.unitOfMeasure || ''}</Badge>
                                    </TableCell>

                                    <TableCell className="text-left w-32">
                                      <Badge color="secondary" className="tabular-nums">{Math.max(0, displayTotalRequired - totalGot)} {item.unitOfMeasure || ''}</Badge>
                                    </TableCell>

                                    <TableCell>₱{unitPrice.toLocaleString()}</TableCell>
                                    <TableCell>₱{totalAmount.toLocaleString()}</TableCell>
                                  </TableRow>
                                )
                              })}
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

          {/* Selection Summary */}
          {(selectedNonCseRows.size > 0 || selectedAPR.size > 0) && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">
                {prType === 'non-cse' ? selectedNonCseRows.size : selectedAPR.size} {prType === 'non-cse' ? 'PPMP Item' : 'APR'}{(prType === 'non-cse' ? selectedNonCseRows.size : selectedAPR.size) !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t bg-white px-6 py-3 flex justify-end gap-3 z-10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddItems}
            disabled={prType === 'non-cse' ? selectedNonCseRows.size === 0 : selectedAPR.size === 0}
          >
            {prType === 'non-cse' ? 'ADD Items' : 'ADD APR'} ({prType === 'non-cse' ? selectedNonCseRows.size : selectedAPR.size})
          </Button>
        </div>
       </DialogContent>
     </Dialog>
   )
 }
