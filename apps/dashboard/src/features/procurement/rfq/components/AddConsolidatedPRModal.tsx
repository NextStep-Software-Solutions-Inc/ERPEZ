/**
 * Add Consolidated PR Modal
 * Modal for selecting approved consolidated PRs and their items to add to RFQ
 */

import { useState, useMemo, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
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
import { Search, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { RFQItem } from '../store/rfqStore'
import { useRFQStore } from '../store/rfqStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ConsolidatedPRItem } from '../types'

const ORDERED_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function resolveMonthIndex(monthVal: any): number {
  if (monthVal === undefined || monthVal === null || monthVal === '') return -1

  if (typeof monthVal === 'number') {
    if (monthVal >= 0 && monthVal <= 11) return monthVal
    if (monthVal >= 1 && monthVal <= 12) return monthVal - 1
  }

  const str = String(monthVal).trim().toLowerCase()

  const num = parseInt(str, 10)
  if (!isNaN(num) && String(num) === str) {
    if (num >= 0 && num <= 11) return num
    if (num >= 1 && num <= 12) return num - 1
  }

  const parts = str.split('-')
  if (parts.length === 2) {
    const mn = parseInt(parts[1], 10)
    if (!isNaN(mn) && mn >= 1 && mn <= 12) return mn - 1
  }

  const fullIdx = ORDERED_MONTHS.findIndex((mm) => mm.toLowerCase() === str)
  if (fullIdx !== -1) return fullIdx

  const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const shortIdx = shortMonthNames.indexOf(str)
  if (shortIdx !== -1) return shortIdx

  return -1
}

function getItemQtyForMonth(item: any, monthIdx: number): number {
  if (Array.isArray(item.monthlyAllocations) && item.monthlyAllocations.length > 0) {
    const alloc = item.monthlyAllocations.find((a: any) => resolveMonthIndex(a.month) === monthIdx)
    if (alloc) return alloc.quantity ?? alloc.qty ?? 0
  }
  const itemMonthIdx = resolveMonthIndex(item.month)
  if (itemMonthIdx === monthIdx) {
    return item.qty ?? item.remainingQuantity ?? 0
  }
  return 0
}

interface AddConsolidatedPRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (items: RFQItem[]) => void
  existingCPRItemIds?: string[]
}

export function AddConsolidatedPRModal({
  open,
  onOpenChange,
  onAdd,
  existingCPRItemIds = [],
}: AddConsolidatedPRModalProps) {
  const { fetchConsolidatedPrItemsForRFQ } = useRFQStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [flatItems, setFlatItems] = useState<ConsolidatedPRItem[]>([])

  type SelectedPRItem = ConsolidatedPRItem & { prId: string }

  const [expandedPRs, setExpandedPRs] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedPRItem>>(new Map())
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')

  // Fetch flat items when dialog opens
  useEffect(() => {
    if (open) {
      fetchConsolidatedPrItemsForRFQ().then((items: ConsolidatedPRItem[]) => {
        setFlatItems(items || [])
      })
    }
  }, [open, fetchConsolidatedPrItemsForRFQ])

  // Group and map flat items into ConsolidatedPR objects
  const approvedPRs = useMemo(() => {
    const prMap = new Map<string, any>()
    flatItems.forEach((item: ConsolidatedPRItem) => {
      const prId = item.consolidatedPRId
      if (!prMap.has(prId)) {
        prMap.set(prId, {
          id: prId,
          prNumber: item.cprNumber || prId,
          description: `Consolidated PR for ${item.procurementModeName || 'RFQ'}`,
          purpose: `Consolidated PR for ${item.procurementModeName || 'RFQ'}`,
          status: 'APPROVED/FOR BAC UTILIZATION',
          hasBACResolution: item.hasBACResolution,
          bacResolutionStatus: item.bacResolutionStatus,
          bacResolutionNumber: item.bacResolutionNumber,
          bacResolutionId: item.bacResolutionId,
          selectedPRItems: [],
        })
      }
      prMap.get(prId).selectedPRItems.push({
        id: item.cprItemId,
        itemName: item.ItemName || item.itemName,
        category: item.category || 'Uncategorized',
        fund: item.fund || 'General Fund',
        month: item.month || 'January',
        qty: item.remainingQuantity || 1,
        unit: item.unit || item.unitOfMeasure || 'pc',
        unitPrice: item.unitCost || 0,
        totalAmount: (item.remainingQuantity || 1) * (item.unitCost || 0),
        monthlyAllocations: item.monthlyAllocations,
      })
    })
    return Array.from(prMap.values())
  }, [flatItems])

  // derive available categories and funds from approved PR items
  const availableCategories = useMemo(() => {
    const s = new Set<string>()
    approvedPRs.forEach((pr) => pr.selectedPRItems.forEach((it: any) => it.category && s.add(it.category)))
    return Array.from(s).sort()
  }, [approvedPRs])

  const availableFunds = useMemo(() => {
    const s = new Set<string>()
    approvedPRs.forEach((pr) => pr.selectedPRItems.forEach((it: any) => it.fund && s.add(it.fund)))
    return Array.from(s).sort()
  }, [approvedPRs])

  // Filter consolidated PRs based on search and month filter
  const filteredPRs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    return approvedPRs.filter((pr) => {
      const prItems = pr.selectedPRItems || []

      const getMonthName = (m?: string | null) => {
        const idx = resolveMonthIndex(m)
        return idx !== -1 ? ORDERED_MONTHS[idx] : null
      }

      // Check if at least one item passes month filter (normalize YYYY-MM -> full month name)
      const hasMonthMatch =
        monthFilter === 'all' ||
        prItems.some((item: any) => {
          const itemMonthName = getMonthName(item.month)
          return itemMonthName === monthFilter
        })

      // Check category filter
      const hasCategoryMatch =
        categoryFilter === 'all' ||
        prItems.some((item: any) => (item.category || '').toLowerCase() === String(categoryFilter).toLowerCase())

      // Check fund filter
      const hasFundMatch =
        fundFilter === 'all' ||
        prItems.some((item: any) => (item.fund || '').toLowerCase() === String(fundFilter).toLowerCase())

      if (!hasMonthMatch) return false
      if (!hasCategoryMatch) return false
      if (!hasFundMatch) return false

      if (!term) return true

      const prMatch =
        pr.prNumber?.toLowerCase().includes(term) ||
        pr.description?.toLowerCase().includes(term) ||
        pr.purpose?.toLowerCase().includes(term)

      const itemMatch = prItems.some((item: any) =>
        item.itemName.toLowerCase().includes(term)
      )

      return prMatch || itemMatch
    })
  }, [approvedPRs, searchTerm, monthFilter, categoryFilter, fundFilter])

  const togglePRExpansion = (prId: string) => {
    const newExpanded = new Set(expandedPRs)
    if (newExpanded.has(prId)) {
      newExpanded.delete(prId)
    } else {
      newExpanded.add(prId)
    }
    setExpandedPRs(newExpanded)
  }

  const toggleItemSelection = (prId: string, item: any) => {
    const key = `${prId}-${item.id}`
    const newSelected = new Map(selectedItems)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.set(key, { ...item, prId })
    }
    setSelectedItems(newSelected)
  }

  // derive selected categories and funds from selectedItems map
  const selectedCategories = useMemo(() => {
    const vals = Array.from(selectedItems.values())
    return Array.from(new Set(vals.map((v: any) => v.category || 'Uncategorized')))
  }, [selectedItems])

  const selectedFunds = useMemo(() => {
    const vals = Array.from(selectedItems.values())
    return Array.from(new Set(vals.map((v: any) => v.fund || 'General Fund')))
  }, [selectedItems])

  const handleAdd = () => {
    const rfqItems: RFQItem[] = Array.from(selectedItems.values()).map((item, idx) => ({
      id: `rfqitem-${item.prId}-${item.id}-${Date.now()}-${idx}`,
      prId: item.prId,
      itemId: item.id,
      itemName: item.itemName || item.ItemName || '',
      quantity: item.qty ?? 0,
      unitOfMeasure: item.unit ?? item.unitOfMeasure ?? '',
      unitPrice: item.unitPrice || item.unitCost || 0,
      totalAmount: item.totalAmount || 0,
      isRequiredBrochure: false,
      requiresGreenSpecification: false,
      // preserve category, fund, and month from consolidated PR item so RFQ shows them
      category: item.category,
      fund: item.fund,
      month: item.month,
      monthlyAllocations: item.month ? [{ month: String(item.month), quantity: item.qty ?? 0 }] : [],
    }))

    onAdd(rfqItems)
    setSelectedItems(new Map())
    setSearchTerm('')
    setExpandedPRs(new Set())
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedItems(new Map())
    setSearchTerm('')
    setExpandedPRs(new Set())
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Consolidated PR"
      description="Select approved consolidated PRs and items to add to this RFQ"
      size="4xl"
      className="w-full max-w-[1400px] max-h-[85vh]"
      footer={null}
      showCloseButton
    >
      {/* make the dialog content scrollable when tall */}
      <div className="max-h-[70vh] pr-4 flex flex-col">
        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 pr-4 space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by PR number, purpose, or item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {ORDERED_MONTHS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fundFilter} onValueChange={setFundFilter}>
              <SelectTrigger className="w-48 h-10">
                <SelectValue placeholder="All Funds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                {availableFunds.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredPRs.length} consolidated PR(s) found
          </div>

          {/* PR List */}
          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-3">
              {filteredPRs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved consolidated PRs found
                </div>
              ) : (
                filteredPRs.map((pr) => {
                    const isExpanded = expandedPRs.has(pr.id)
                    const prItems = pr.selectedPRItems || []
                    const hasBacRes = Boolean(pr.hasBACResolution)
                    const bacResStatus = pr.bacResolutionStatus
                    const bacResNum = pr.bacResolutionNumber
                    const isApproved = hasBacRes && (bacResStatus?.toLowerCase() === 'approved')
                    const isInProgress = hasBacRes && !isApproved

                  return (
                    <div key={pr.id} className="border rounded-lg bg-white shadow-sm">
                      {/* PR Header */}
                      <div className="flex items-center gap-3 p-4 bg-muted/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePRExpansion(pr.id)}
                          className="p-0 h-auto"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold">{pr.prNumber || pr.id}</span>
                            {isApproved ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium text-[11px] py-0.5 px-2">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" />
                                BAC Res: {bacResNum || 'Approved'} • Approved
                              </Badge>
                            ) : isInProgress ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-medium text-[11px] py-0.5 px-2">
                                <Clock className="h-3 w-3 mr-1 text-amber-600 inline" />
                                BAC Res: {bacResNum || 'In Progress'} • {bacResStatus || 'Draft / In Progress'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 font-normal text-[11px] py-0.5 px-2">
                                <AlertCircle className="h-3 w-3 mr-1 text-slate-500 inline" />
                                No BAC Res Linked
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {pr.description || pr.purpose || 'No description'}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <div>{prItems.length} item(s) • ₱{prItems.reduce((sum: number, item: any) => sum + item.totalAmount, 0).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* PR Items (expanded) */}
                      {isExpanded && (
                        <div className="p-4 border-t overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Fund</TableHead>
                                <TableHead className="text-center">Jan</TableHead>
                                <TableHead className="text-center">Feb</TableHead>
                                <TableHead className="text-center">Mar</TableHead>
                                <TableHead className="text-center">Apr</TableHead>
                                <TableHead className="text-center">May</TableHead>
                                <TableHead className="text-center">Jun</TableHead>
                                <TableHead className="text-center">Jul</TableHead>
                                <TableHead className="text-center">Aug</TableHead>
                                <TableHead className="text-center">Sep</TableHead>
                                <TableHead className="text-center">Oct</TableHead>
                                <TableHead className="text-center">Nov</TableHead>
                                <TableHead className="text-center">Dec</TableHead>
                                <TableHead className="text-center">Total Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prItems.map((item: any) => {
                                  const isSelected = selectedItems.has(`${pr.id}-${item.id}`)
                                  const isAlreadyAdded = existingCPRItemIds.includes(item.id)

                                  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

                                  return (
                                    <TableRow key={item.id} className={isSelected ? 'bg-muted/50' : ''}>
                                      <TableCell>
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => toggleItemSelection(pr.id, item)}
                                        />
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          <span>{item.itemName}</span>
                                          {isAlreadyAdded && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                              In RFQ
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                                      <TableCell className="text-sm">{item.fund}</TableCell>
                                    {monthNames.map((m, idx) => {
                                      const monthQty = getItemQtyForMonth(item, idx)
                                      return (
                                        <TableCell key={m} className="text-center">
                                          {monthQty > 0 ? (
                                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                                              <span className="text-sm font-semibold">{monthQty}</span>
                                              <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                                            </div>
                                          ) : (
                                            <div className="text-sm text-muted-foreground">0 {item.unit}</div>
                                          )}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center">
                                      <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{item.qty} {item.unit}</div>
                                    </TableCell>
                                    <TableCell>₱{item.unitPrice.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">₱{item.totalAmount.toLocaleString()}</TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sticky footer: stays visible even when scrolling the list */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t py-3 mt-2 z-40">
          <div className="max-w-full mx-0 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedItems.size} item(s) selected
              {selectedItems.size > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">Categories:</span> {selectedCategories.join(', ')}{' '}
                  <span className="ml-2 font-medium">Funds:</span> {selectedFunds.join(', ')}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={selectedItems.size === 0}>
                Add {selectedItems.size > 0 ? `(${selectedItems.size})` : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
