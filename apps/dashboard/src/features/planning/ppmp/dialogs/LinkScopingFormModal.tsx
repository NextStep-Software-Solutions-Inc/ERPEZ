/**
 * LinkScopingFormModal
 * Allows users to link an Approved Market Scoping Form (MSF) to a PPMP line item
 * OR bulk-link a single MSF to multiple selected items simultaneously.
 * Implements RA 12009 Sec. 10 compliance — each item must have a valid MSF link
 * before the PPMP can be submitted.
 *
 * Documentation:
 * - See documentations/PPMP_MSF_LINKING.md (added) for details (MSF link fields, UI entry points, validation rules).
 *
 * Note: A corresponding documentation markdown file has been added at:
 *   documentations/PPMP_MSF_LINKING.md
 * Contributors: update the document if you change linking rules, atoms, or handlers.
 */

import { useState, useMemo, useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Link2, Search, CheckCircle2, X, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../lib/ppmpUtils'
import {
  linkScopingFormModalOpenAtom,
  targetLineItemIdForMsfAtom,
  selectedPpmpForEditAtom,
  bulkLinkMsfModalOpenAtom,
  selectedLineItemIdsAtom,
} from '../atoms'

// ─── Mock MSF Data (replace with real API call) ───────────────────────────────
export interface MarketScopingForm {
  id: string
  msfRef: string // e.g. "MSF-2024-0012-v1"
  projectName: string
  projectCostEstimate: number
  version: number
  status: 'approved' | 'draft' | 'for_review'
  procurementMethod: string
  preparedBy: string
  approvedDate: string | null
}

const MOCK_MSFS: MarketScopingForm[] = [
  {
    id: 'msf-001',
    msfRef: 'MSF-2026-0001-v1',
    projectName: 'Janitorial Services Procurement FY 2026',
    projectCostEstimate: 120000,
    version: 1,
    status: 'approved',
    procurementMethod: 'NP-53.9',
    preparedBy: 'John Dela Cruz',
    approvedDate: '2026-01-15',
  },
  {
    id: 'msf-002',
    // TODO: Replace MOCK_MSFS with a real data hook before merging.
    // Use a query hook (e.g. useApprovedMsfs) that supports server-side filtering, paging and permissions.
    // Leaving hard-coded mock data in production will cause incorrect behavior and security/consistency issues.
    msfRef: 'MSF-2026-0002-v1',
    projectName: 'Training & Capacity Building Services',
    projectCostEstimate: 95000,
    version: 1,
    status: 'approved',
    procurementMethod: 'NP-53.9',
    preparedBy: 'Maria Santos',
    approvedDate: '2026-01-20',
  },
  {
    id: 'msf-003',
    msfRef: 'MSF-2026-0003-v1',
    projectName: 'IT Equipment & Peripherals (PhilGEPS Data)',
    projectCostEstimate: 200000,
    version: 1,
    status: 'approved',
    procurementMethod: 'NP-53.5',
    preparedBy: 'Jose Reyes',
    approvedDate: '2026-02-01',
  },
  {
    id: 'msf-004',
    msfRef: 'MSF-2026-0004-v2',
    projectName: 'External Storage Devices — Updated Pricing',
    projectCostEstimate: 90000,
    version: 2,
    status: 'approved',
    procurementMethod: 'NP-53.5',
    preparedBy: 'Jose Reyes',
    approvedDate: '2026-03-10',
  },
  {
    id: 'msf-005',
    msfRef: 'MSF-2026-0005-v1',
    projectName: 'Office Supplies — CSE Catalog (PhilGEPS)',
    projectCostEstimate: 50000,
    version: 1,
    status: 'approved',
    procurementMethod: 'NP-53.5',
    preparedBy: 'Ana Lim',
    approvedDate: '2026-02-20',
  },
]

const STATUS_BADGE: Record<MarketScopingForm['status'], { label: string; class: string }> = {
  approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  draft: { label: 'Draft', class: 'bg-muted text-muted-foreground' },
  for_review: { label: 'For Review', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Single-item mode: opened via row "Link MSF" button */
export function LinkScopingFormModal() {
  const [open, setOpen] = useAtom(linkScopingFormModalOpenAtom)
  const targetItemId = useAtomValue(targetLineItemIdForMsfAtom)
  const [ppmp, setPpmp] = useAtom(selectedPpmpForEditAtom)
  const setTargetItemId = useSetAtom(targetLineItemIdForMsfAtom)

  const [search, setSearch] = useState('')
  const [selectedMsfId, setSelectedMsfId] = useState<string | null>(null)
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null)

  // Find the target line item
  const targetItem = useMemo(() => {
    if (!ppmp || !targetItemId) return null
    for (const activity of ppmp.activityBlocks) {
      for (const ioe of activity.ioEBlocks) {
        const found = ioe.items.find((i) => i.id === targetItemId)
        if (found) return found
      }
    }
    return null
  }, [ppmp, targetItemId])

  // Compute how much of each MSF is already consumed by other linked items (excluding the target item)
  const msfUsageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!ppmp) return map
    for (const activity of ppmp.activityBlocks) {
      for (const ioe of activity.ioEBlocks) {
        for (const item of ioe.items) {
          if (!item.marketScopingId || item.id === targetItemId) continue
          map.set(item.marketScopingId, (map.get(item.marketScopingId) ?? 0) + item.estimatedBudget)
        }
      }
    }
    return map
  }, [ppmp, targetItemId])

  const filteredMsfs = useMemo(() => {
    const q = search.toLowerCase().trim()
    return MOCK_MSFS.filter(
      (m) =>
        m.status === 'approved' &&
        (q === '' ||
          m.msfRef.toLowerCase().includes(q) ||
          m.projectName.toLowerCase().includes(q) ||
          m.procurementMethod.toLowerCase().includes(q)),
    )
  }, [search])

  const selectedMsf = useMemo(
    () => MOCK_MSFS.find((m) => m.id === selectedMsfId) ?? null,
    [selectedMsfId],
  )

  const isBudgetExceeded = useMemo(() => {
    if (!targetItem || !selectedMsf) return false
    const alreadyUsed = msfUsageMap.get(selectedMsf.id) ?? 0
    return (alreadyUsed + targetItem.estimatedBudget) > selectedMsf.projectCostEstimate
  }, [targetItem, selectedMsf, msfUsageMap])

  const budgetWarningMessage = useMemo(() => {
    if (!isBudgetExceeded || !targetItem || !selectedMsf) return null
    const alreadyUsed = msfUsageMap.get(selectedMsf.id) ?? 0
    const remaining = selectedMsf.projectCostEstimate - alreadyUsed
    return `Budget Exceeded: Adding this item (${formatCurrency(targetItem.estimatedBudget)}) would exceed the MSF cap. Remaining MSF balance is only ${formatCurrency(Math.max(0, remaining))}.`
  }, [isBudgetExceeded, targetItem, selectedMsf, msfUsageMap])

  useEffect(() => {
    setBudgetWarning(budgetWarningMessage)
  }, [budgetWarningMessage, setBudgetWarning])

  const handleSelect = (msf: MarketScopingForm) => {
    setSelectedMsfId(msf.id)
  }

  const handleLink = () => {
    if (!ppmp || !targetItemId || !selectedMsf) return
    if (isBudgetExceeded) return

    const updatedPpmp = {
      ...ppmp,
      activityBlocks: ppmp.activityBlocks.map((activity) => ({
        ...activity,
        ioEBlocks: activity.ioEBlocks.map((ioe) => ({
          ...ioe,
          items: ioe.items.map((item) =>
            item.id === targetItemId
              ? {
                  ...item,
                  marketScopingId: selectedMsf.id,
                  marketScopingRef: selectedMsf.msfRef,
                  marketScopingCostEstimate: selectedMsf.projectCostEstimate,
                }
              : item,
          ),
        })),
      })),
    }

    setPpmp(updatedPpmp)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedMsfId(null)
    setSearch('')
    setBudgetWarning(null)
    setTargetItemId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent size="xl" className="max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Link Market Scoping Form
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Select an Approved MSF to link to this line item (RA 12009, Sec. 10)
              </DialogDescription>
            </div>
          </div>

          {/* Target item summary */}
          {targetItem && (
            <div className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Linking to:</span>
                <span className="font-semibold text-foreground">{targetItem.itemName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PPMP Line Total:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(targetItem.estimatedBudget)}
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by MSF ID, project name, or procurement method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* MSF Table */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {filteredMsfs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No approved Market Scoping Forms found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-medium pl-2">MSF ID / Version</th>
                  <th className="pb-2 text-left font-medium">Project Name</th>
                  <th className="pb-2 text-right font-medium">Cost Estimate</th>
                  <th className="pb-2 text-right font-medium">Remaining Balance</th>
                  <th className="pb-2 text-center font-medium">Method</th>
                  <th className="pb-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMsfs.map((msf) => {
                  const isSelected = selectedMsfId === msf.id
                  const alreadyUsed = msfUsageMap.get(msf.id) ?? 0
                  const remaining = msf.projectCostEstimate - alreadyUsed
                  const wouldExceed = targetItem
                    ? (alreadyUsed + targetItem.estimatedBudget) > msf.projectCostEstimate
                    : false
                  return (
                    <tr
                      key={msf.id}
                      onClick={() => handleSelect(msf)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : wouldExceed
                            ? 'bg-destructive/5 hover:bg-destructive/10'
                            : 'hover:bg-muted/50',
                      )}
                    >
                      <td className="py-2.5 pl-2 pr-3">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-foreground">{msf.msfRef}</div>
                            <div className="text-xs text-muted-foreground">v{msf.version}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-foreground leading-tight">{msf.projectName}</div>
                        <div className="text-xs text-muted-foreground">By {msf.preparedBy}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(msf.projectCostEstimate)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className={cn('font-semibold', remaining <= 0 ? 'text-destructive' : remaining < (msf.projectCostEstimate * 0.2) ? 'text-amber-600' : 'text-emerald-600')}>
                          {formatCurrency(Math.max(0, remaining))}
                        </span>
                        {wouldExceed && (
                          <div className="text-[10px] text-destructive">Insufficient balance</div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <code className="text-[10px] bg-muted rounded px-1 py-0.5">
                          {msf.procurementMethod}
                        </code>
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                            STATUS_BADGE[msf.status].class,
                          )}
                        >
                          {STATUS_BADGE[msf.status].label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Budget warning */}
        {budgetWarning && (
          <div className="mx-6 mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs text-destructive flex gap-2">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{budgetWarning}</span>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedMsf || !!budgetWarning}
            onClick={handleLink}
          >
            <Link2 className="mr-1.5 h-4 w-4" />
            Link Selected MSF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bulk Link Modal ──────────────────────────────────────────────────────────

/**
 * BulkLinkScopingFormModal
 * Opened when the user clicks "Bulk Link MSF" after selecting multiple rows.
 * Applies a single MSF to all selected items, subject to aggregate budget validation.
 */
export function BulkLinkScopingFormModal() {
  const [open, setOpen] = useAtom(bulkLinkMsfModalOpenAtom)
  const [ppmp, setPpmp] = useAtom(selectedPpmpForEditAtom)
  const [selectedIds, setSelectedIds] = useAtom(selectedLineItemIdsAtom)

  const [search, setSearch] = useState('')
  const [selectedMsfId, setSelectedMsfId] = useState<string | null>(null)

  // Collect all selected line items from the PPMP state
  const selectedItems = useMemo(() => {
    if (!ppmp) return []
    const result = []
    for (const activity of ppmp.activityBlocks) {
      for (const ioe of activity.ioEBlocks) {
        for (const item of ioe.items) {
          if (selectedIds.has(item.id)) result.push(item)
        }
      }
    }
    return result
  }, [ppmp, selectedIds])

  const aggregateBudget = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.estimatedBudget, 0),
    [selectedItems],
  )

  // Compute how much each MSF is already consumed by NON-selected items
  const msfUsageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!ppmp) return map
    for (const activity of ppmp.activityBlocks) {
      for (const ioe of activity.ioEBlocks) {
        for (const item of ioe.items) {
          if (!item.marketScopingId || selectedIds.has(item.id)) continue
          map.set(item.marketScopingId, (map.get(item.marketScopingId) ?? 0) + item.estimatedBudget)
        }
      }
    }
    return map
  }, [ppmp, selectedIds])

  const filteredMsfs = useMemo(() => {
    const q = search.toLowerCase().trim()
    return MOCK_MSFS.filter(
      (m) =>
        m.status === 'approved' &&
        (q === '' ||
          m.msfRef.toLowerCase().includes(q) ||
          m.projectName.toLowerCase().includes(q) ||
          m.procurementMethod.toLowerCase().includes(q)),
    )
  }, [search])

  const selectedMsf = useMemo(
    () => MOCK_MSFS.find((m) => m.id === selectedMsfId) ?? null,
    [selectedMsfId],
  )

  const budgetValidation = useMemo(() => {
    if (!selectedMsf) return null
    const alreadyUsed = msfUsageMap.get(selectedMsf.id) ?? 0
    const remaining = selectedMsf.projectCostEstimate - alreadyUsed
    const wouldExceed = (alreadyUsed + aggregateBudget) > selectedMsf.projectCostEstimate
    if (!wouldExceed) return null
    return `Budget Exceeded: The combined total of ${selectedItems.length} selected items (${formatCurrency(aggregateBudget)}) exceeds the remaining MSF balance of ${formatCurrency(Math.max(0, remaining))}.`
  }, [selectedMsf, msfUsageMap, aggregateBudget, selectedItems.length])

  const handleLink = () => {
    if (!ppmp || !selectedMsf || !!budgetValidation) return

    const idsToUpdate = new Set(selectedIds)
    const updatedPpmp = {
      ...ppmp,
      activityBlocks: ppmp.activityBlocks.map((activity) => ({
        ...activity,
        ioEBlocks: activity.ioEBlocks.map((ioe) => ({
          ...ioe,
          items: ioe.items.map((item) =>
            idsToUpdate.has(item.id)
              ? {
                  ...item,
                  marketScopingId: selectedMsf.id,
                  marketScopingRef: selectedMsf.msfRef,
                  marketScopingCostEstimate: selectedMsf.projectCostEstimate,
                }
              : item,
          ),
        })),
      })),
    }

    setPpmp(updatedPpmp)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedMsfId(null)
    setSearch('')
    // Clear selection after bulk link
    setSelectedIds(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent size="xl" className="max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Bulk Link Market Scoping Form
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Link a single Approved MSF to all selected items (RA 12009, Sec. 10)
              </DialogDescription>
            </div>
          </div>

          {/* Selection summary */}
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selected items:</span>
              <span className="font-semibold text-foreground">{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Combined budget total:</span>
              <span className="font-semibold text-foreground">{formatCurrency(aggregateBudget)}</span>
            </div>
            {selectedItems.length > 0 && (
              <div className="pt-1 border-t border-primary/20">
                <p className="text-muted-foreground mb-1">Items to be linked:</p>
                <ul className="space-y-0.5 max-h-20 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span className="truncate max-w-[60%]">{item.itemName}</span>
                      <span className="text-foreground font-medium">{formatCurrency(item.estimatedBudget)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by MSF ID, project name, or procurement method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* MSF Table */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {filteredMsfs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No approved Market Scoping Forms found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-medium pl-2">MSF ID / Version</th>
                  <th className="pb-2 text-left font-medium">Project Name</th>
                  <th className="pb-2 text-right font-medium">Cost Estimate</th>
                  <th className="pb-2 text-right font-medium">Remaining Balance</th>
                  <th className="pb-2 text-center font-medium">Method</th>
                  <th className="pb-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMsfs.map((msf) => {
                  const isSelected = selectedMsfId === msf.id
                  const alreadyUsed = msfUsageMap.get(msf.id) ?? 0
                  const remaining = msf.projectCostEstimate - alreadyUsed
                  const wouldExceed = (alreadyUsed + aggregateBudget) > msf.projectCostEstimate
                  return (
                    <tr
                      key={msf.id}
                      tabIndex={0}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Select MSF ${msf.msfRef} - ${msf.projectName}`}
                      onClick={() => setSelectedMsfId(msf.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedMsfId(msf.id)
                        }
                      }}
                      className={cn(
                        'cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded',
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : wouldExceed
                          ? 'bg-destructive/5 hover:bg-destructive/10'
                          : 'hover:bg-muted/50',
                      )}
                    >
                      <td className="py-2.5 pl-2 pr-3">
                        <div className="flex items-center gap-2">
                          {/* Accessible radio control for keyboard users */}
                          <input
                            id={`msf-select-${msf.id}`}
                            type="radio"
                            name="bulk-msf"
                            checked={isSelected}
                            onChange={() => setSelectedMsfId(msf.id)}
                            className="h-4 w-4 accent-primary"
                            aria-label={`Select ${msf.msfRef}`}
                          />
                          <label htmlFor={`msf-select-${msf.id}`} className="cursor-pointer">
                            <div className="font-semibold text-foreground">{msf.msfRef}</div>
                            <div className="text-xs text-muted-foreground">v{msf.version}</div>
                          </label>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-foreground leading-tight">{msf.projectName}</div>
                        <div className="text-xs text-muted-foreground">By {msf.preparedBy}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(msf.projectCostEstimate)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className={cn('font-semibold', remaining <= 0 ? 'text-destructive' : remaining < (msf.projectCostEstimate * 0.2) ? 'text-amber-600' : 'text-emerald-600')}>
                          {formatCurrency(Math.max(0, remaining))}
                        </span>
                        {wouldExceed && (
                          <div className="text-[10px] text-destructive">
                            Needs {formatCurrency(aggregateBudget)}, only {formatCurrency(Math.max(0, remaining))} available
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <code className="text-[10px] bg-muted rounded px-1 py-0.5">
                          {msf.procurementMethod}
                        </code>
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                            STATUS_BADGE[msf.status].class,
                          )}
                        >
                          {STATUS_BADGE[msf.status].label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Aggregate budget warning */}
        {budgetValidation && (
          <div className="mx-6 mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs text-destructive flex gap-2">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{budgetValidation}</span>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedMsf || !!budgetValidation || selectedItems.length === 0}
            onClick={handleLink}
          >
            <Link2 className="mr-1.5 h-4 w-4" />
            Link to {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
