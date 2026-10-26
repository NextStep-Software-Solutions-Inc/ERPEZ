/**
 * Add Consolidated PR Modal
 * Modal for selecting approved consolidated PRs and their items to add to RFQ.
 * Governed by RA 12009 (New Government Procurement Act - NGPA):
 * - An RFQ is strictly tied to a single Mode of Procurement (MOP).
 * - All items in an RFQ must be sourced from the same Consolidated PR.
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
import {
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Lock,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { RFQItem } from '../store/rfqStore'
import { useRFQStore } from '../store/rfqStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ConsolidatedPRItem } from '../types'

const ORDERED_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
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

  const shortMonthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const shortIdx = shortMonthNames.indexOf(str)
  if (shortIdx !== -1) return shortIdx

  return -1
}

function getItemQtyForMonth(item: any, monthIdx: number): number {
  if (
    Array.isArray(item.monthlyAllocations) &&
    item.monthlyAllocations.length > 0
  ) {
    const alloc = item.monthlyAllocations.find(
      (a: any) => resolveMonthIndex(a.month) === monthIdx,
    )
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
  currentConsolidatedPRId?: string | null
  currentConsolidatedPRNumber?: string | null
  currentModeOfProcurementId?: string | null
  currentModeOfProcurementName?: string | null
}

export function AddConsolidatedPRModal({
  open,
  onOpenChange,
  onAdd,
  existingCPRItemIds = [],
  currentConsolidatedPRId,
  currentConsolidatedPRNumber,
  currentModeOfProcurementId,
  currentModeOfProcurementName,
}: AddConsolidatedPRModalProps) {
  const { fetchConsolidatedPrItemsForRFQ } = useRFQStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [flatItems, setFlatItems] = useState<ConsolidatedPRItem[]>([])

  type SelectedPRItem = ConsolidatedPRItem & {
    prId: string
    cprNumber?: string
    procurementModeId?: string
    procurementModeName?: string
  }

  const [expandedPRs, setExpandedPRs] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<
    Map<string, SelectedPRItem>
  >(new Map())
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')

  // Fetch flat items when dialog opens
  useEffect(() => {
    if (open) {
      fetchConsolidatedPrItemsForRFQ().then((items: ConsolidatedPRItem[]) => {
        setFlatItems(items || [])
      })
      if (currentModeOfProcurementName) {
        setModeFilter(currentModeOfProcurementName)
      } else {
        setModeFilter('all')
      }
    }
  }, [open, currentModeOfProcurementName, fetchConsolidatedPrItemsForRFQ])

const isNonRfqMode = (modeName?: string | null): boolean => {
  if (!modeName) return false
  const lower = modeName.toLowerCase()
  return (
    lower.includes('bidding') ||
    lower.includes('direct contracting') ||
    lower.includes('direct acquisition') ||
    lower.includes('repeat order')
  )
}

  // Group and map flat items into ConsolidatedPR objects (filtered to RFQ-eligible modes under RA 12009)
  const approvedPRs = useMemo(() => {
    const prMap = new Map<string, any>()
    flatItems
      .filter((item: ConsolidatedPRItem) => !isNonRfqMode(item.procurementModeName))
      .forEach((item: ConsolidatedPRItem) => {
        const prId = item.consolidatedPRId
        if (!prMap.has(prId)) {
          prMap.set(prId, {
          id: prId,
          prNumber: item.cprNumber || prId,
          purpose: `Consolidated PR`,
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
        cprId: prId,
        cprNumber: item.cprNumber || prId,
        itemName: item.ItemName || item.itemName,
        category: item.category || 'Uncategorized',
        fund: item.fund || 'General Fund',
        month: item.month || 'January',
        qty: item.remainingQuantity || 1,
        unit: item.unit || item.unitOfMeasure || 'pc',
        unitPrice: item.unitCost || 0,
        totalAmount: (item.remainingQuantity || 1) * (item.unitCost || 0),
        monthlyAllocations: item.monthlyAllocations,
        procurementModeId: item.procurementModeId || '',
        procurementModeName: item.procurementModeName || 'Unassigned Mode',
      })
    })
    return Array.from(prMap.values())
  }, [flatItems])

  // Derive available categories, funds, and modes
  const availableCategories = useMemo(() => {
    const s = new Set<string>()
    approvedPRs.forEach((pr) =>
      pr.selectedPRItems.forEach(
        (it: any) => it.category && s.add(it.category),
      ),
    )
    return Array.from(s).sort()
  }, [approvedPRs])

  const availableFunds = useMemo(() => {
    const s = new Set<string>()
    approvedPRs.forEach((pr) =>
      pr.selectedPRItems.forEach((it: any) => it.fund && s.add(it.fund)),
    )
    return Array.from(s).sort()
  }, [approvedPRs])

  const availableModes = useMemo(() => {
    const s = new Set<string>()
    approvedPRs.forEach((pr) =>
      pr.selectedPRItems.forEach((it: any) => {
        if (
          it.procurementModeName &&
          it.procurementModeName !== 'Unassigned Mode'
        ) {
          s.add(it.procurementModeName)
        }
      }),
    )
    return Array.from(s).sort()
  }, [approvedPRs])

  // Active lock states (RA 12009: 1 CPR & 1 MOP per RFQ)
  const isRfqLocked = Boolean(
    currentConsolidatedPRId || currentModeOfProcurementId,
  )
  const selectedValues = useMemo(
    () => Array.from(selectedItems.values()),
    [selectedItems],
  )
  const isSessionLocked = selectedValues.length > 0 && !isRfqLocked

  const effectiveCPRId =
    currentConsolidatedPRId ||
    selectedValues[0]?.cprId ||
    selectedValues[0]?.consolidatedPRId ||
    null
  const effectiveCPRNumber =
    currentConsolidatedPRNumber || selectedValues[0]?.cprNumber || null
  const effectiveModeId =
    currentModeOfProcurementId || selectedValues[0]?.procurementModeId || null
  const effectiveModeName =
    currentModeOfProcurementName ||
    selectedValues[0]?.procurementModeName ||
    null

  const checkItemEligibility = (item: any) => {
    const isAlreadyAdded = existingCPRItemIds.includes(item.id)
    if (isAlreadyAdded) {
      return { eligible: false, reason: 'Already in RFQ' }
    }

    if (effectiveCPRId && item.cprId !== effectiveCPRId) {
      return { eligible: false, reason: 'Different PR' }
    }

    if (
      effectiveModeId &&
      item.procurementModeId &&
      item.procurementModeId !== effectiveModeId
    ) {
      return {
        eligible: false,
        reason: `Different Mode (${item.procurementModeName})`,
      }
    }

    if (
      effectiveModeName &&
      item.procurementModeName &&
      item.procurementModeName !== effectiveModeName
    ) {
      return {
        eligible: false,
        reason: `Different Mode (${item.procurementModeName})`,
      }
    }

    return { eligible: true, reason: null }
  }

  // Filter consolidated PRs based on search and filters
  const filteredPRs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    return approvedPRs
      .map((pr) => {
        const prItems = pr.selectedPRItems || []

        const getMonthName = (m?: string | null) => {
          const idx = resolveMonthIndex(m)
          return idx !== -1 ? ORDERED_MONTHS[idx] : null
        }

        const matchingItems = prItems.filter((item: any) => {
          const itemMonthName = getMonthName(item.month)
          const hasMonthMatch =
            monthFilter === 'all' || itemMonthName === monthFilter

          const hasCategoryMatch =
            categoryFilter === 'all' ||
            (item.category || '').toLowerCase() ===
              String(categoryFilter).toLowerCase()

          const hasFundMatch =
            fundFilter === 'all' ||
            (item.fund || '').toLowerCase() === String(fundFilter).toLowerCase()

          const hasModeMatch =
            modeFilter === 'all' ||
            (item.procurementModeName || '').toLowerCase() ===
              String(modeFilter).toLowerCase()

          const itemMatch =
            !term ||
            item.itemName.toLowerCase().includes(term) ||
            (item.procurementModeName || '').toLowerCase().includes(term) ||
            pr.prNumber?.toLowerCase().includes(term) ||
            pr.purpose?.toLowerCase().includes(term)

          return (
            hasMonthMatch &&
            hasCategoryMatch &&
            hasFundMatch &&
            hasModeMatch &&
            itemMatch
          )
        })

        if (matchingItems.length === 0) return null

        return {
          ...pr,
          filteredItems: matchingItems,
        }
      })
      .filter(Boolean) as any[]
  }, [
    approvedPRs,
    searchTerm,
    monthFilter,
    categoryFilter,
    fundFilter,
    modeFilter,
  ])

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

  const toggleModeGroupSelection = (
    prId: string,
    items: any[],
    allSelected: boolean,
  ) => {
    const newSelected = new Map(selectedItems)
    items.forEach((item) => {
      const key = `${prId}-${item.id}`
      if (allSelected) {
        newSelected.delete(key)
      } else {
        newSelected.set(key, { ...item, prId })
      }
    })
    setSelectedItems(newSelected)
  }

  // Derive selected categories and funds from selectedItems map
  const selectedCategories = useMemo(() => {
    const vals = Array.from(selectedItems.values())
    return Array.from(
      new Set(vals.map((v: any) => v.category || 'Uncategorized')),
    )
  }, [selectedItems])

  const selectedFunds = useMemo(() => {
    const vals = Array.from(selectedItems.values())
    return Array.from(new Set(vals.map((v: any) => v.fund || 'General Fund')))
  }, [selectedItems])

  const handleAdd = () => {
    const rfqItems: RFQItem[] = Array.from(selectedItems.values()).map(
      (item, idx) => ({
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
        category: item.category,
        fund: item.fund,
        month: item.month,
        monthlyAllocations: item.month
          ? [{ month: String(item.month), quantity: item.qty ?? 0 }]
          : [],
      }),
    )

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
      description="Select approved consolidated PRs and items to add to this RFQ (Governed by RA 12009 NGPA)"
      size="4xl"
      className="w-full max-w-[1450px] max-h-[85vh]"
      footer={null}
      showCloseButton
    >
      <div className="max-h-[70vh] pr-2 flex flex-col">
        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          {/* Active selection lock banner (RA 12009 guidance) */}
          {(effectiveModeName || effectiveCPRId) && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/80 border-blue-200 text-blue-900 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">
                    Procurement Modality Lock (RA 12009):
                  </span>{' '}
                  All items added to this RFQ must originate from{' '}
                  {effectiveCPRNumber ? (
                    <span className="font-semibold underline decoration-blue-400">
                      {effectiveCPRNumber}
                    </span>
                  ) : (
                    'the same Consolidated PR'
                  )}{' '}
                  and be assigned to Mode:{' '}
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-300 font-semibold ml-1"
                  >
                    {effectiveModeName || 'Selected Mode'}
                  </Badge>
                  {isSessionLocked && (
                    <span className="text-xs text-blue-700 block mt-0.5">
                      (Locked by your active selection. Items with a different
                      mode or PR are disabled.)
                    </span>
                  )}
                  {isRfqLocked && (
                    <span className="text-xs text-blue-700 block mt-0.5">
                      (Pre-locked by existing items in this RFQ.)
                    </span>
                  )}
                </div>
              </div>
              {isSessionLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Map())}
                  className="text-xs border-blue-300 text-blue-800 hover:bg-blue-100 h-7 px-2"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search PR, purpose, mode, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mode of Procurement Filter */}
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-56 h-10">
                <SelectValue placeholder="All Modes of Procurement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes of Procurement</SelectItem>
                {availableModes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-36 h-10">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {ORDERED_MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fundFilter} onValueChange={setFundFilter}>
              <SelectTrigger className="w-44 h-10">
                <SelectValue placeholder="All Funds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                {availableFunds.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredPRs.length} consolidated PR(s) found
          </div>

          {/* PR List */}
          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-4">
              {filteredPRs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved consolidated PRs found matching the filter
                  criteria
                </div>
              ) : (
                filteredPRs.map((pr) => {
                  const isExpanded = expandedPRs.has(pr.id)
                  const filteredItems = pr.filteredItems || []
                  const hasBacRes = Boolean(pr.hasBACResolution)
                  const bacResStatus = pr.bacResolutionStatus
                  const bacResNum = pr.bacResolutionNumber
                  const isApproved =
                    hasBacRes && bacResStatus?.toLowerCase() === 'approved'
                  const isInProgress = hasBacRes && !isApproved

                  // Unique modes present in this CPR
                  const prModes = Array.from(
                    new Set(
                      pr.selectedPRItems
                        .map((it: any) => it.procurementModeName)
                        .filter(Boolean),
                    ),
                  )

                  // Group items inside this PR by Mode of Procurement
                  const modeMap = new Map<
                    string,
                    { modeId: string; modeName: string; items: any[] }
                  >()
                  filteredItems.forEach((item: any) => {
                    const key = item.procurementModeName || 'Unassigned Mode'
                    if (!modeMap.has(key)) {
                      modeMap.set(key, {
                        modeId: item.procurementModeId || '',
                        modeName: key,
                        items: [],
                      })
                    }
                    modeMap.get(key)!.items.push(item)
                  })
                  const modeGroups = Array.from(modeMap.values())

                  return (
                    <div
                      key={pr.id}
                      className="border rounded-lg bg-white shadow-sm overflow-hidden"
                    >
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
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-base">
                              {pr.prNumber || pr.id}
                            </span>
                            {isApproved ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium text-[11px] py-0.5 px-2"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" />
                                BAC Res: {bacResNum || 'Approved'} • Approved
                              </Badge>
                            ) : isInProgress ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-300 font-medium text-[11px] py-0.5 px-2"
                              >
                                <Clock className="h-3 w-3 mr-1 text-amber-600 inline" />
                                BAC Res: {bacResNum || 'In Progress'} •{' '}
                                {bacResStatus || 'Draft / In Progress'}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-slate-100 text-slate-600 border-slate-300 font-normal text-[11px] py-0.5 px-2"
                              >
                                <AlertCircle className="h-3 w-3 mr-1 text-slate-500 inline" />
                                No BAC Res Linked
                              </Badge>
                            )}

                            {/* Mode tags on PR level */}
                            <div className="flex items-center gap-1 ml-1 flex-wrap">
                              {prModes.map((m: any) => (
                                <Badge
                                  key={m}
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0 text-slate-700 font-normal bg-slate-200/70"
                                >
                                  {m}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {pr.purpose || 'Consolidated Purchase Request'}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <div>
                            {filteredItems.length} item(s) • ₱
                            {filteredItems
                              .reduce(
                                (sum: number, item: any) =>
                                  sum + item.totalAmount,
                                0,
                              )
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* PR Items (grouped by Mode of Procurement when expanded) */}
                      {isExpanded && (
                        <div className="divide-y border-t">
                          {modeGroups.map((group) => {
                            const eligibleItemsInGroup = group.items.filter(
                              (it: any) => checkItemEligibility(it).eligible,
                            )
                            const allEligibleSelected =
                              eligibleItemsInGroup.length > 0 &&
                              eligibleItemsInGroup.every((it: any) =>
                                selectedItems.has(`${pr.id}-${it.id}`),
                              )

                            const isGroupModeIncompatible =
                              (effectiveModeId &&
                                group.modeId &&
                                group.modeId !== effectiveModeId) ||
                              (effectiveModeName &&
                                group.modeName &&
                                group.modeName !== effectiveModeName) ||
                              (effectiveCPRId && pr.id !== effectiveCPRId)

                            return (
                              <div
                                key={group.modeName}
                                className="bg-slate-50/50"
                              >
                                {/* Mode of Procurement Group Header */}
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 border-b text-xs">
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-semibold text-slate-800 text-sm">
                                      Mode of Procurement: {group.modeName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[11px] font-normal bg-white"
                                    >
                                      {group.items.length} item(s)
                                    </Badge>
                                    {isGroupModeIncompatible && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-medium"
                                      >
                                        Different Mode / PR
                                      </Badge>
                                    )}
                                  </div>
                                  {!isGroupModeIncompatible &&
                                    eligibleItemsInGroup.length > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-primary font-medium hover:bg-primary/10"
                                        onClick={() =>
                                          toggleModeGroupSelection(
                                            pr.id,
                                            eligibleItemsInGroup,
                                            allEligibleSelected,
                                          )
                                        }
                                      >
                                        {allEligibleSelected
                                          ? 'Deselect All in Mode'
                                          : 'Select All in Mode'}
                                      </Button>
                                    )}
                                </div>

                                {/* Table of items for this Mode */}
                                <div className="p-3 overflow-x-auto bg-white">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>
                                          Mode of Procurement
                                        </TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Fund</TableHead>
                                        <TableHead className="text-center">
                                          Jan
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Feb
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Mar
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Apr
                                        </TableHead>
                                        <TableHead className="text-center">
                                          May
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Jun
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Jul
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Aug
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Sep
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Oct
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Nov
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Dec
                                        </TableHead>
                                        <TableHead className="text-center">
                                          Total Qty
                                        </TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead className="text-right">
                                          Total
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.items.map((item: any) => {
                                        const { eligible, reason } =
                                          checkItemEligibility(item)
                                        const isSelected = selectedItems.has(
                                          `${pr.id}-${item.id}`,
                                        )
                                        const isAlreadyAdded =
                                          existingCPRItemIds.includes(item.id)
                                        const monthNames = [
                                          'Jan',
                                          'Feb',
                                          'Mar',
                                          'Apr',
                                          'May',
                                          'Jun',
                                          'Jul',
                                          'Aug',
                                          'Sep',
                                          'Oct',
                                          'Nov',
                                          'Dec',
                                        ]

                                        return (
                                          <TableRow
                                            key={item.id}
                                            className={
                                              isSelected
                                                ? 'bg-primary/5'
                                                : !eligible
                                                  ? 'opacity-60 bg-muted/20'
                                                  : ''
                                            }
                                          >
                                            <TableCell>
                                              <Checkbox
                                                checked={isSelected}
                                                disabled={
                                                  !eligible && !isSelected
                                                }
                                                onCheckedChange={() =>
                                                  toggleItemSelection(
                                                    pr.id,
                                                    item,
                                                  )
                                                }
                                              />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                              <div className="flex items-center gap-2">
                                                <span>{item.itemName}</span>
                                                {isAlreadyAdded && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0 font-normal"
                                                  >
                                                    In RFQ
                                                  </Badge>
                                                )}
                                                {!eligible &&
                                                  !isAlreadyAdded &&
                                                  reason && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-[10px] px-1.5 py-0 text-amber-700 bg-amber-50 border-amber-200"
                                                    >
                                                      {reason}
                                                    </Badge>
                                                  )}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                variant="outline"
                                                className="text-[11px] font-medium bg-slate-50 text-slate-700"
                                              >
                                                {item.procurementModeName}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                              {item.category}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                              {item.fund}
                                            </TableCell>
                                            {monthNames.map((m, idx) => {
                                              const monthQty =
                                                getItemQtyForMonth(item, idx)
                                              return (
                                                <TableCell
                                                  key={m}
                                                  className="text-center"
                                                >
                                                  {monthQty > 0 ? (
                                                    <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                                                      <span className="text-sm font-semibold">
                                                        {monthQty}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground ml-1">
                                                        {item.unit}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                      0 {item.unit}
                                                    </div>
                                                  )}
                                                </TableCell>
                                              )
                                            })}
                                            <TableCell className="text-center">
                                              <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold text-xs">
                                                {item.qty} {item.unit}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              ₱{item.unitPrice.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              ₱
                                              {item.totalAmount.toLocaleString()}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t py-3 mt-2 z-40">
          <div className="max-w-full mx-0 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-slate-900">
                  {selectedItems.size}
                </span>{' '}
                item(s) selected
                {selectedItems.size > 0 && effectiveModeName && (
                  <span className="ml-2 font-medium text-primary">
                    • Mode: {effectiveModeName}
                  </span>
                )}
              </div>
              {selectedItems.size > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">Categories:</span>{' '}
                  {selectedCategories.join(', ')}{' '}
                  <span className="ml-2 font-medium">Funds:</span>{' '}
                  {selectedFunds.join(', ')}
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
