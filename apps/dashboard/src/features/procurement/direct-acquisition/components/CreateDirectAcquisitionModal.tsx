import { useState, useMemo, useEffect, useCallback } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  useConsolidatedPrs,
  useConsolidatedPr,
} from '@/features/procurement/consolidated-pr/handlers/hooks'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { useDirectAcquisitions, useCreateDirectAcquisition } from '../handlers'
import {
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  Building2,
  Layers,
  ShieldCheck,
  PackageOpen,
} from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const THRESHOLD = 200000
const formatCurrency = formatCurrencyPHP

function genDANumber(entries: any[]): string {
  const year = new Date().getFullYear()
  let maxSeq = 0
  for (const ent of entries) {
    const da = (ent?.daNumber ?? '').toString()
    const m = da.match(new RegExp(`^DA-${year}-(\\d+)$`, 'i'))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  const next = (maxSeq + 1).toString().padStart(4, '0')
  return `DA-${year}-${next}`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDirectAcquisitionModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()

  // ─── API Queries ───────────────────────────────────────────────────────────
  const { data: daList } = useDirectAcquisitions({
    enabled: open,
  })
  const { data: cprResponse, isLoading: isLoadingCprs } = useConsolidatedPrs({
    pathParams: {},
    queryParams: { PageSize: 100 },
    enabled: open,
  })
  const { data: resolutionsResponse } = useBacResolutions({
    pathParams: {},
    queryParams: { pageSize: 100 },
    enabled: open,
  })

  const createMutation = useCreateDirectAcquisition()

  // Auto-generate DA Number
  const autoDANumber = useMemo(() => genDANumber(daList ?? []), [daList])
  const [daNumber, setDaNumber] = useState('')
  const [selectedCprId, setSelectedCprId] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())

  // Query detail of selected CPR
  const { data: cprDetailResponse, isLoading: isLoadingDetail } = useConsolidatedPr({
    pathParams: { id: selectedCprId },
    queryParams: {},
    enabled: !!selectedCprId && open,
  })

  const cprDetail = cprDetailResponse?.data ?? null

  // Extract CPR list
  const cprList = useMemo(() => {
    const raw = cprResponse?.data
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return (raw as any).items || (raw as any).data || []
  }, [cprResponse])

  // Extract BAC Projects
  const bacProjects = useMemo(() => {
    const raw = resolutionsResponse
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return (raw as any).data || (raw as any).items || []
  }, [resolutionsResponse])

  // Track already-acquired items per CPR from existing DAs
  const acquiredItemsByCpr = useMemo(() => {
    const map = new Map<string, { allAcquired: boolean; acquiredItemIds: Set<string>; daNumberByItemId: Map<string, string> }>()

    for (const da of daList ?? []) {
      if (!da.consolidatedPrId) continue
      const cprId = da.consolidatedPrId.toLowerCase()
      if (!map.has(cprId)) {
        map.set(cprId, { allAcquired: false, acquiredItemIds: new Set(), daNumberByItemId: new Map() })
      }
      const entry = map.get(cprId)!

      const selectedIds = da.selectedItemIds || (
        da.remarks && da.remarks.startsWith('SELECTED_ITEMS:')
          ? da.remarks.substring('SELECTED_ITEMS:'.length).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
          : []
      )

      for (const id of selectedIds) {
        const idLower = id.toLowerCase()
        entry.acquiredItemIds.add(idLower)
        entry.daNumberByItemId.set(idLower, da.daNumber)
      }
    }
    return map
  }, [daList])

  // Eligible CPRs (Approved / finalized and not fully acquired)
  const eligibleCprs = useMemo(() => {
    return cprList.filter((c: any) => {
      const status = (c.status ?? '').toUpperCase()
      const isApprovedOrSubmitted = status === 'APPROVED' || status === 'SUBMITTED'
      if (!isApprovedOrSubmitted) return false

      const cprId = (c.id ?? '').toString().toLowerCase()
      const acquiredInfo = acquiredItemsByCpr.get(cprId)
      if (acquiredInfo?.allAcquired) return false

      return true
    })
  }, [cprList, acquiredItemsByCpr])

  // Flatten items from selected CPR detail
  const allCprItems = useMemo(() => {
    if (!cprDetail?.prs) return []
    return cprDetail.prs.flatMap((pr) =>
      pr.items.map((item, idx) => ({
        id: item.consolidatedPRItemId ?? item.prItemId ?? `${pr.purchaseRequestId}-${idx}`,
        prItemId: item.prItemId,
        consolidatedPRItemId: item.consolidatedPRItemId,
        name: item.name,
        description: item.description,
        category: item.category,
        fund: item.fund,
        unit: item.unit || 'unit',
        unitPrice: item.unitPrice,
        totalQuantity: item.totalQuantity,
        totalAmount: item.totalAmount || (item.totalQuantity * item.unitPrice),
        purchaseRequestId: pr.purchaseRequestId,
        prNumber: pr.prNumber,
        officeName: pr.officeName,
        procurementModeId: item.procurementModeId,
      }))
    )
  }, [cprDetail])

  // Check if a specific item was already acquired in an existing DA
  const isItemAcquired = useCallback((item: { id: string; prItemId?: string; consolidatedPRItemId?: string }) => {
    if (!selectedCprId) return null
    const info = acquiredItemsByCpr.get(selectedCprId.toLowerCase())
    if (!info) return null
    if (info.allAcquired) return 'Previous DA'
    const cid = item.consolidatedPRItemId?.toLowerCase()
    const pid = item.prItemId?.toLowerCase()
    const id = item.id?.toLowerCase()
    if (cid && info.acquiredItemIds.has(cid)) return info.daNumberByItemId.get(cid) || 'Previous DA'
    if (pid && info.acquiredItemIds.has(pid)) return info.daNumberByItemId.get(pid) || 'Previous DA'
    if (id && info.acquiredItemIds.has(id)) return info.daNumberByItemId.get(id) || 'Previous DA'
    return null
  }, [acquiredItemsByCpr, selectedCprId])

  // Only items that have NOT been acquired yet
  const availableCprItems = useMemo(() => {
    return allCprItems.filter((i) => !isItemAcquired(i))
  }, [allCprItems, isItemAcquired])

  // Pre-select unacquired items by default whenever a new CPR is loaded
  useEffect(() => {
    if (availableCprItems.length > 0) {
      setSelectedItemIds(new Set(availableCprItems.map((i) => i.id)))
    } else {
      setSelectedItemIds(new Set())
    }
  }, [availableCprItems])

  // Look up linked BAC Project / Resolution for selected CPR
  const linkedBacProject = useMemo(() => {
    if (!selectedCprId) return null
    return bacProjects.find(
      (p: any) => p.consolidatedPRId?.toLowerCase() === selectedCprId.toLowerCase()
    )
  }, [bacProjects, selectedCprId])

  const bacResolutionNumber =
    linkedBacProject?.resolutionNumber ||
    linkedBacProject?.title ||
    (linkedBacProject ? `BAC Project: ${linkedBacProject.id.slice(0, 8)}` : 'Not linked / Direct')

  const bacProjectId = linkedBacProject?.id

  // Unique implementing offices
  const officeNames = useMemo(() => {
    if (!cprDetail?.prs || cprDetail.prs.length === 0) return '—'
    const unique = Array.from(new Set(cprDetail.prs.map((p) => p.officeName).filter(Boolean)))
    return unique.join(', ') || '—'
  }, [cprDetail])

  // Dynamic Total ABC based on selected items
  const selectedTotalABC = useMemo(() => {
    return allCprItems
      .filter((item) => selectedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.totalAmount, 0)
  }, [allCprItems, selectedItemIds])

  const exceedsThreshold = selectedTotalABC > THRESHOLD
  const isAllSelected = availableCprItems.length > 0 && selectedItemIds.size === availableCprItems.length
  const isIndeterminate =
    selectedItemIds.size > 0 && selectedItemIds.size < availableCprItems.length

  const isEligible =
    !!selectedCprId &&
    selectedItemIds.size > 0 &&
    selectedTotalABC > 0 &&
    !exceedsThreshold

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItemIds(new Set(availableCprItems.map((i) => i.id)))
    } else {
      setSelectedItemIds(new Set())
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const reset = () => {
    setDaNumber('')
    setSelectedCprId('')
    setSelectedItemIds(new Set())
  }

  const handleCreate = async () => {
    const finalDaNumber = daNumber.trim() || autoDANumber
    if (!selectedCprId) {
      toast({
        title: 'Required',
        description: 'Please select a Procurement Source (Consolidated PR).',
      })
      return
    }
    if (selectedItemIds.size === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to procure under this Direct Acquisition.',
      })
      return
    }
    if (exceedsThreshold) {
      toast({
        title: 'ABC Exceeds Limit',
        description: 'Direct Acquisition is only allowed for Total ABC ≤ ₱200,000. Please adjust selected items.',
        variant: 'destructive',
      })
      return
    }

    const selectedGuids = allCprItems
      .filter((item) => selectedItemIds.has(item.id))
      .flatMap((item) => [item.consolidatedPRItemId, item.prItemId, item.id].filter(Boolean))
      .filter((id, idx, arr) => arr.indexOf(id) === idx) as string[]

    try {
      await createMutation.mutateAsync({
        pathParams: {},
        payload: {
          daNumber: finalDaNumber,
          consolidatedPRId: selectedCprId,
          bacProjectId: bacProjectId || undefined,
          selectedItemIds: selectedGuids,
          totalABC: selectedTotalABC,
        },
      })

      toast({
        title: '✅ Direct Acquisition Created',
        description: `Direct Acquisition ${finalDaNumber} has been created with Total ABC ${formatCurrency(selectedTotalABC)}.`,
      })
      reset()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error?.message || 'Failed to create Direct Acquisition.',
        variant: 'destructive',
      })
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title="Create Direct Acquisition"
      description="Direct Acquisition (RA 12009) applies to low-value purchases with Total ABC ≤ ₱200,000."
      size="xl"
      className="w-full max-h-[85vh]"
      footer={null}
      showCloseButton
    >
      <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-5 py-2">
        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DA Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              DA Number <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder={autoDANumber}
              value={daNumber}
              onChange={(e) => setDaNumber(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Auto-generated sequence. You may override if needed.
            </p>
          </div>

          {/* Procurement Source (Consolidated PR) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Procurement Source (Consolidated PR) <span className="text-destructive">*</span>
            </label>
            <Select
              value={selectedCprId}
              onValueChange={(val) => {
                setSelectedCprId(val)
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-purple-200/80 focus:ring-purple-500">
                <SelectValue placeholder={isLoadingCprs ? 'Loading eligible CPRs...' : 'Select Consolidated PR...'} />
              </SelectTrigger>
              <SelectContent>
                {eligibleCprs.length > 0 ? (
                  eligibleCprs.map((cpr: any) => {
                    const cprId = (cpr.id ?? '').toString().toLowerCase()
                    const acquiredInfo = acquiredItemsByCpr.get(cprId)
                    const hasPartialAcquisition = !!acquiredInfo && acquiredInfo.acquiredItemIds.size > 0

                    return (
                      <SelectItem
                        key={cpr.id}
                        value={cpr.id}
                        className="text-xs py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{cpr.cprNumber || cpr.id}</span>
                          <span className="text-muted-foreground truncate max-w-[280px]">
                            — {cpr.description || 'Consolidated PR'}
                          </span>
                          {hasPartialAcquisition && (
                            <Badge variant="outline" className="text-[10px] text-purple-700 bg-purple-50 border-purple-300 ml-1">
                              Remaining Items Available
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })
                ) : (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                    {isLoadingCprs ? 'Loading eligible Consolidated PRs...' : 'No approved Consolidated PRs available.'}
                  </div>
                )}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Select the approved Consolidated PR containing Direct Acquisition items.
            </p>
          </div>
        </div>

        {/* Loading detail indicator */}
        {isLoadingDetail && (
          <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span>Loading procurement source details & line items...</span>
          </div>
        )}

        {/* Derived Metadata Cards */}
        {selectedCprId && cprDetail && !isLoadingDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Source CPR */}
              <div className="rounded-xl border border-purple-100/80 bg-purple-50/40 dark:bg-purple-950/20 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900/60 dark:text-purple-300/70">
                    Source CPR
                  </p>
                  <p className="text-xs font-bold text-foreground truncate">
                    {cprDetail.cprNumber || cprDetail.id}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {cprDetail.prs?.length ?? 0} Source PR(s)
                  </p>
                </div>
              </div>

              {/* Card 2: Implementing Office */}
              <div className="rounded-xl border border-sky-100/80 bg-sky-50/40 dark:bg-sky-950/20 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-900/60 dark:text-sky-300/70">
                    Implementing Office
                  </p>
                  <p className="text-xs font-bold text-foreground truncate" title={officeNames}>
                    {officeNames}
                  </p>
                </div>
              </div>

              {/* Card 3: Mode of Procurement */}
              <div className="rounded-xl border border-emerald-100/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-300/70">
                    Mode of Procurement
                  </p>
                  <p className="text-xs font-bold text-foreground truncate">
                    Direct Acquisition
                  </p>
                </div>
              </div>

              {/* Card 4: BAC Resolution */}
              <div className="rounded-xl border border-amber-100/80 bg-amber-50/40 dark:bg-amber-950/20 p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60 dark:text-amber-300/70">
                    BAC Resolution
                  </p>
                  <p className="text-xs font-bold text-foreground truncate" title={bacResolutionNumber}>
                    {bacResolutionNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Selection Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <PackageOpen className="h-4 w-4 text-purple-600" />
                  Select Items for this Direct Acquisition ({selectedItemIds.size} of {allCprItems.length})
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Check items to include in this Direct Acquisition purchase
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-default-200 shadow-sm bg-card">
                <Table className="text-xs">
                  <TableHeader className="bg-purple-50/50 dark:bg-purple-950/30 border-b border-purple-100/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 text-center">
                        <Checkbox
                          checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                          onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                          aria-label="Select all items"
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                      </TableHead>
                      <TableHead className="w-8 text-center">#</TableHead>
                      <TableHead className="min-w-[220px]">Item Description & Specifications</TableHead>
                      <TableHead className="min-w-[140px]">Source PR & Office</TableHead>
                      <TableHead className="text-center w-16">Qty</TableHead>
                      <TableHead className="text-right w-24">Unit Price</TableHead>
                      <TableHead className="text-right w-28">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCprItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No items found in this Consolidated PR.
                        </TableCell>
                      </TableRow>
                    ) : (
                      allCprItems.map((item, idx) => {
                        const acquiredIn = isItemAcquired(item)
                        const isChecked = selectedItemIds.has(item.id)
                        const isDisabled = !!acquiredIn

                        return (
                          <TableRow
                            key={item.id}
                            className={cn(
                              'transition-colors',
                              isDisabled
                                ? 'bg-muted/40 opacity-60 cursor-not-allowed'
                                : isChecked
                                  ? 'bg-purple-50/20 hover:bg-purple-50/30 cursor-pointer'
                                  : 'hover:bg-muted/30 cursor-pointer'
                            )}
                            onClick={() => {
                              if (!isDisabled) toggleSelectItem(item.id)
                            }}
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isDisabled ? false : isChecked}
                                disabled={isDisabled}
                                onCheckedChange={() => {
                                  if (!isDisabled) toggleSelectItem(item.id)
                                }}
                                aria-label={`Select ${item.name}`}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                              />
                            </TableCell>
                            <TableCell className="text-center font-medium text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="line-clamp-1">{item.name}</p>
                                {acquiredIn && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] px-1.5 py-0">
                                    Acquired in {acquiredIn}
                                  </Badge>
                                )}
                              </div>
                              {item.description && item.description !== item.name && (
                                <p className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-[11px]">
                              <p className="font-medium text-foreground">{item.prNumber}</p>
                              <p className="line-clamp-1">{item.officeName}</p>
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {item.totalQuantity} <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground whitespace-nowrap">
                              {formatCurrency(item.totalAmount)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Total ABC and Threshold Validation Banner */}
            <div
              className={cn(
                'rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm',
                exceedsThreshold
                  ? 'bg-red-50/80 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
                  : 'bg-purple-50/60 border-purple-100/80 text-foreground dark:bg-purple-950/20 dark:border-purple-900/40'
              )}
            >
              <div className="flex items-center gap-2">
                {exceedsThreshold ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold">
                    {exceedsThreshold
                      ? 'Total ABC Exceeds ₱200,000 Limit'
                      : 'Statutory Direct Acquisition Threshold (≤ ₱200,000)'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {exceedsThreshold
                      ? 'Direct Acquisition under RA 12009 is only allowed for ABC ≤ ₱200,000. Uncheck some items or amend PR/APP.'
                      : availableCprItems.length === 0
                        ? 'All items from this Consolidated PR have already been acquired across previous Direct Acquisitions.'
                        : `Selected ${selectedItemIds.size} of ${availableCprItems.length} available item(s). Within statutory limit.`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  TOTAL ABC
                </p>
                <p
                  className={cn(
                    'text-lg font-extrabold',
                    exceedsThreshold ? 'text-red-600' : 'text-purple-700 dark:text-purple-400'
                  )}
                >
                  {formatCurrency(selectedTotalABC)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-default-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={!isEligible || createMutation.isPending}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {exceedsThreshold
              ? 'Blocked — ABC Exceeds ₱200,000'
              : selectedItemIds.size === 0
              ? 'Select Items to Proceed'
              : 'Create Direct Acquisition'}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

