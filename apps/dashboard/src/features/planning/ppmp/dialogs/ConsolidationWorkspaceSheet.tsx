/**
 * ConsolidationWorkspaceSheet
 *
 * Full-screen bottom Sheet overlay for consolidating department PPMPs into a
 * Master Office PPMP.
 *
 * Left panel  — filterable checkbox list of eligible dept PPMPs
 * Right panel — live diff preview of what will be merged, grouped by origin office
 */

import { useState, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../lib'
import { getPPMPsRequest } from '../handlers/getPpmpsRequest'
import { createPPMPConsolidateRequest } from '../handlers/createPPMPConsolidateRequest'
import { getPPMPActivitiesRequest } from '../handlers/getPPMPActivitiesRequest'
import { getPPMPExpenditureItemsRequest } from '../handlers/getPPMPExpenditureItemsRequest'
import { getPPMPItemsRequest } from '../handlers/getPPMPItemsRequest'
import { getPPMPItemAllocationsRequest } from '../handlers/getPPMPItemAllocationsRequest'
import type {
  PPMP,
  PPMPActivity,
  PPMPExpenditureItem,
  PPMPItem,
  PPMPItemAllocation,
} from '../types'
import {
  Search,
  Building2,
  ChevronDown,
  ChevronRight,
  Layers,
  CheckSquare,
  X,
  GitMerge,
  AlertCircle,
  Loader2,
} from 'lucide-react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

const usePPMPs = createQueryHookFromTemplate(getPPMPsRequest)
const useConsolidatePPMPs = createMutationHookFromTemplate(createPPMPConsolidateRequest)
const usePPMPActivities = createQueryHookFromTemplate(getPPMPActivitiesRequest)
const usePPMPExpenditureItems = createQueryHookFromTemplate(getPPMPExpenditureItemsRequest)
const usePPMPItems = createQueryHookFromTemplate(getPPMPItemsRequest)
const usePPMPItemAllocations = createQueryHookFromTemplate(getPPMPItemAllocationsRequest)

// ─── Office color palette (deterministic by office name) ─────────────────────

const OFFICE_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
]

function getOfficeColor(officeName: string) {
  let hash = 0
  for (let i = 0; i < officeName.length; i++) {
    hash = officeName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return OFFICE_COLORS[Math.abs(hash) % OFFICE_COLORS.length]
}

// ─── Eligibility filter ───────────────────────────────────────────────────────

function getConsolidationEligibility(
  ppmp: PPMP,
  master: Pick<PPMP, 'id' | 'fiscalYearId' | 'libId'>,
): true | string {
  if (ppmp.id === master.id) return 'Same ID as master'
  if (ppmp.isMaster || ppmp.isMasterOffice) return 'Is a master PPMP'
  if (ppmp.consolidatedIntoId) return 'Already consolidated'
  if (ppmp.fiscalYearId !== master.fiscalYearId) return 'Fiscal year mismatch'
  const status = ppmp.status?.toLowerCase()
  if (
    status !== 'submitted' &&
    status !== 'approved' &&
    status !== 'pending_review' &&
    status !== 'draft'
  ) {
    return `Ineligible status: ${ppmp.status || 'None'}`
  }
  if (master.libId && ppmp.libId && ppmp.libId !== master.libId) {
    return `Line Item Budget mismatch (Master LIB ID: ${master.libId || 'none'}, PPMP LIB ID: ${ppmp.libId || 'none'})`
  }
  return true
}

function isEligibleForConsolidation(
  ppmp: PPMP,
  master: Pick<PPMP, 'id' | 'fiscalYearId' | 'libId'>,
): boolean {
  return getConsolidationEligibility(ppmp, master) === true
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() ?? 'draft'
  const map: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    pending_review: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  const cls = map[s] ?? map.draft
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status ?? 'Draft'}
    </span>
  )
}

// ─── Left Panel: Eligible PPMP List ──────────────────────────────────────────

interface EligibleListProps {
  eligible: PPMP[]
  ineligible: { ppmp: PPMP; reason: string }[]
  isLoading: boolean
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  search: string
  onSearchChange: (v: string) => void
}

function EligiblePPMPList({
  eligible,
  ineligible,
  isLoading,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  search,
  onSearchChange,
}: EligibleListProps) {
  const allSelected = eligible.length > 0 && eligible.every((p) => selectedIds.has(p.id))

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by office, PPMP number…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Select all / clear */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {eligible.length} eligible PPMP{eligible.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={allSelected ? onClearAll : onSelectAll}
              className="text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline font-medium"
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading eligible PPMPs…</span>
          </div>
        ) : eligible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 px-6 text-center">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            <div>
              <p className="text-sm font-medium text-slate-500">No eligible department PPMPs</p>
              <p className="text-xs mt-1">
                PPMPs must be in the same fiscal year, not yet consolidated, and in Submitted or
                Approved status.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {eligible.map((ppmp) => {
              const isSelected = selectedIds.has(ppmp.id)
              const color = getOfficeColor(ppmp.officeName ?? ppmp.officeId)
              return (
                <li
                  key={ppmp.id}
                  onClick={() => onToggle(ppmp.id)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors group',
                    isSelected ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-slate-50',
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(ppmp.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          color.bg,
                          color.text,
                          color.border,
                        )}
                      >
                        <Building2 className="h-2.5 w-2.5" />
                        {ppmp.officeName ?? ppmp.officeId}
                      </span>
                      <StatusBadge status={ppmp.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                      {ppmp.documentName || ppmp.ppmpNumber || 'Unnamed PPMP'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {ppmp.ppmpNumber && <span>{ppmp.ppmpNumber}</span>}
                      {ppmp.libName && (
                        <>
                          <span className="h-3 w-px bg-slate-200" />
                          <span>{ppmp.libName}</span>
                        </>
                      )}
                      {(ppmp.totalEstimatedBudget ?? 0) > 0 && (
                        <>
                          <span className="h-3 w-px bg-slate-200" />
                          <span className="font-semibold text-slate-600">
                            {formatCurrency(ppmp.totalEstimatedBudget!)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {ineligible.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Ineligible department PPMPs ({ineligible.length})
            </h5>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden">
              {ineligible.map(({ ppmp, reason }) => {
                const color = getOfficeColor(ppmp.officeName ?? ppmp.officeId)
                return (
                  <li
                    key={ppmp.id}
                    className="flex items-start gap-3 px-4 py-3 bg-slate-50/20 text-slate-500"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            color.bg,
                            color.text,
                            color.border,
                          )}
                        >
                          {ppmp.officeName || ppmp.officeId || 'Department'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {ppmp.ppmpNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {ppmp.documentName || 'No document name'}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 w-fit mt-1">
                        Reason: {reason}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ─── Right Panel: Diff Preview ────────────────────────────────────────────────

interface DiffPreviewProps {
  selectedPPMPs: PPMP[]
}

function PPMPItemAllocationsList({ itemId, unitPrice }: { itemId: string; unitPrice: number }) {
  const { data, isLoading } = usePPMPItemAllocations({
    pathParams: {},
    queryParams: { filters: `ppmpItemId${itemId}`, pageSize: 1000 },
  })

  if (isLoading) {
    return (
      <div className="pl-6 py-2 flex items-center gap-2 text-slate-400 text-[10px]">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        <span>Loading allocations...</span>
      </div>
    )
  }

  const allocations = data?.data ?? []
  const monthMap: Record<string, PPMPItemAllocation> = {}
  allocations.forEach((alloc) => {
    monthMap[alloc.allocationMonth] = alloc
  })

  const row1Months = ['January', 'February', 'March', 'April', 'May', 'June']
  const row2Months = ['July', 'August', 'September', 'October', 'November', 'December']

  const renderMonthCell = (month: string) => {
    const alloc = monthMap[month]
    const qty = alloc?.quantity ?? 0
    const amt = alloc?.amount ?? qty * unitPrice

    return (
      <div key={month} className="border border-slate-100 rounded-md p-1 text-center bg-white shadow-sm flex flex-col justify-between h-full min-h-[48px]">
        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">
          {month.substring(0, 3)}
        </span>
        <div className="mt-0.5">
          <span className="text-[11px] font-bold text-slate-700 block leading-none">{qty}</span>
          <span className="text-[8px] font-medium text-slate-500 block truncate tabular-nums leading-none mt-0.5">
            {formatCurrency(amt)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="pl-4 py-2 mt-1 space-y-2 max-w-full overflow-x-auto bg-slate-50/50 rounded-lg p-2 border border-slate-100/50">
      <div className="text-[9px] font-bold text-slate-500 mb-1 flex items-center justify-between">
        <span>Monthly Distribution Breakdown</span>
        <span>Allocations: {allocations.length} / 12</span>
      </div>

      <div className="grid grid-cols-6 gap-1 min-w-[340px]">
        {row1Months.map(renderMonthCell)}
      </div>

      <div className="grid grid-cols-6 gap-1 min-w-[340px]">
        {row2Months.map(renderMonthCell)}
      </div>
    </div>
  )
}

function PPMPItemNode({ item }: { item: PPMPItem }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="pl-4 border-l border-slate-200 mt-1">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1.5 text-left hover:bg-slate-50 rounded px-2 bg-slate-50/30"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 leading-tight">
            {item.name || item.cseItemName || item.nonCSEItemName || 'Unnamed Item'}
          </p>
          <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
            {item.unit && <span>Unit: {item.unit}</span>}
            <span>Price: {formatCurrency(item.unitPrice)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.PPMPItemAllocationTotalAmount !== undefined && item.PPMPItemAllocationTotalAmount > 0 && (
            <span className="text-[11px] font-bold text-slate-700 tabular-nums">
              {formatCurrency(item.PPMPItemAllocationTotalAmount)}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-slate-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && <PPMPItemAllocationsList itemId={item.id} unitPrice={item.unitPrice} />}
    </div>
  )
}

function PPMPItemsList({ expenditureItemId }: { expenditureItemId: string }) {
  const { data, isLoading } = usePPMPItems({
    pathParams: {},
    queryParams: { filters: `ppmpExpenditureItemId==${expenditureItemId}`, pageSize: 1000 },
  })

  if (isLoading) {
    return (
      <div className="pl-6 py-2 flex items-center gap-2 text-slate-400 text-[10px]">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        <span>Loading items...</span>
      </div>
    )
  }

  const items = data?.data ?? []

  if (items.length === 0) {
    return (
      <p className="pl-6 py-2 text-[10px] text-slate-400 italic">
        No items found.
      </p>
    )
  }

  return (
    <div className="space-y-1 mt-1">
      {items.map((item) => (
        <PPMPItemNode key={item.id} item={item} />
      ))}
    </div>
  )
}

function PPMPExpenditureItemNode({ expenditureItem }: { expenditureItem: PPMPExpenditureItem }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="pl-4 border-l border-slate-200 mt-1">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1 text-left hover:bg-slate-50 rounded px-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            expenditureItem.isProcurable ? "bg-emerald-400" : "bg-amber-400"
          )} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-600 truncate">
              Expenditure Item ({expenditureItem.isProcurable ? 'Procurable' : 'Non-Procurable'})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {expenditureItem.totalCost > 0 && (
            <span className="text-[10px] font-medium text-slate-500 tabular-nums">
              {formatCurrency(expenditureItem.totalCost)}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && <PPMPItemsList expenditureItemId={expenditureItem.id} />}
    </div>
  )
}

function PPMPExpenditureItemsList({ activityId }: { activityId: string }) {
  const { data, isLoading } = usePPMPExpenditureItems({
    pathParams: {},
    queryParams: { filters: `ppmpActivityId==${activityId}`, pageSize: 1000 },
  })

  if (isLoading) {
    return (
      <div className="pl-6 py-2 flex items-center gap-2 text-slate-400 text-[10px]">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        <span>Loading expenditure items...</span>
      </div>
    )
  }

  const items = data?.data ?? []

  if (items.length === 0) {
    return (
      <p className="pl-6 py-2 text-[10px] text-slate-400 italic">
        No expenditure items found.
      </p>
    )
  }

  return (
    <div className="space-y-1 mt-1">
      {items.map((item) => (
        <PPMPExpenditureItemNode key={item.id} expenditureItem={item} />
      ))}
    </div>
  )
}

function PPMPActivityNode({ activity }: { activity: PPMPActivity }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="pl-4 border-l border-slate-200 mt-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1.5 text-left hover:bg-slate-50 rounded px-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">
              {activity.activityName ?? 'Unnamed Activity'}
            </p>
            <p className="text-[10px] text-slate-400">
              Activity Code: {activity.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(activity.totalAllocationAmount ?? 0) > 0 && (
            <span className="text-xs font-semibold text-slate-600 tabular-nums">
              {formatCurrency(activity.totalAllocationAmount ?? 0)}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && <PPMPExpenditureItemsList activityId={activity.id} />}
    </div>
  )
}

function PPMPActivitiesList({ ppmpId }: { ppmpId: string }) {
  const { data, isLoading } = usePPMPActivities({
    pathParams: {},
    queryParams: { filters: `ppmpId==${ppmpId}`, pageSize: 1000 },
  })

  if (isLoading) {
    return (
      <div className="px-4 py-4 flex items-center gap-2 text-slate-400 text-xs bg-white">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading PPMP activities…</span>
      </div>
    )
  }

  const activities = data?.data ?? []

  if (activities.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-slate-400 italic bg-white border-t border-slate-50">
        No activities in this PPMP
      </div>
    )
  }

  return (
    <div className="bg-white divide-y divide-slate-100 p-2 space-y-2">
      {activities.map((activity) => (
        <PPMPActivityNode key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

function DiffPreview({ selectedPPMPs }: DiffPreviewProps) {
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set())

  const toggleOffice = useCallback((officeId: string) => {
    setExpandedOffices((prev) => {
      const next = new Set(prev)
      if (next.has(officeId)) next.delete(officeId)
      else next.add(officeId)
      return next
    })
  }, [])

  if (selectedPPMPs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 px-8 text-center">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center">
          <GitMerge className="h-10 w-10 text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">No PPMPs selected</p>
          <p className="text-xs text-slate-400 mt-1.5">
            Select department PPMPs from the left panel to preview what will be merged into this
            master PPMP.
          </p>
        </div>
      </div>
    )
  }

  const totalBudget = selectedPPMPs.reduce((sum, p) => sum + (p.totalEstimatedBudget ?? 0), 0)
  const totalActivities = selectedPPMPs.reduce((sum, p) => sum + (p.PPMPActivities?.length ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Summary strip */}
      <div className="p-4 bg-primary/5 border-b border-primary/10">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          Import Preview
        </p>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{selectedPPMPs.length}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Dept PPMPs</p>
          </div>
          <div className="h-8 w-px bg-primary/10" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{totalActivities}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Activities</p>
          </div>
          <div className="h-8 w-px bg-primary/10" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totalBudget)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Budget</p>
          </div>
        </div>
      </div>

      {/* Activity tree per origin office */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {selectedPPMPs.map((ppmp) => {
            const officeKey = ppmp.officeId
            const color = getOfficeColor(ppmp.officeName ?? officeKey)
            const isExpanded = expandedOffices.has(officeKey)

            return (
              <div
                key={ppmp.id}
                className={cn('rounded-xl border overflow-hidden shadow-sm', color.border)}
              >
                {/* Office header */}
                <button
                  type="button"
                  onClick={() => toggleOffice(officeKey)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:brightness-95',
                    color.bg,
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn('h-2 w-2 rounded-full shrink-0', color.dot)} />
                    <div className="min-w-0">
                      <p className={cn('text-xs font-bold uppercase tracking-wide truncate', color.text)}>
                        From: {ppmp.officeName ?? ppmp.officeId}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {ppmp.documentName || ppmp.ppmpNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(ppmp.totalEstimatedBudget ?? 0) > 0 && (
                      <span className="text-xs font-semibold text-slate-600 hidden sm:block">
                        {formatCurrency(ppmp.totalEstimatedBudget!)}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className={cn('h-4 w-4', color.text)} />
                    ) : (
                      <ChevronRight className={cn('h-4 w-4', color.text)} />
                    )}
                  </div>
                </button>

                {/* Activities list (expanded) */}
                {isExpanded && <PPMPActivitiesList ppmpId={ppmp.id} />}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface ConsolidationWorkspaceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterPpmp: Pick<
    PPMP,
    'id' | 'officeId' | 'fiscalYearId' | 'libId' | 'documentName' | 'ppmpNumber' | 'officeName'
  >
}

export function ConsolidationWorkspaceSheet({
  open,
  onOpenChange,
  masterPpmp,
}: ConsolidationWorkspaceSheetProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Fetch all PPMPs for the same fiscal year when overlay is open
  const { data: ppmpResp, isLoading } = usePPMPs({
    pathParams: {},
    queryParams: {
      filters: `fiscalYearId==${masterPpmp.fiscalYearId},isMaster==false`,
      pageSize: 200,
    },
    enabled: open,
  })

  // Normalise paginated vs array response and apply eligibility filter + search
  const eligible = useMemo(() => {
    const raw: PPMP[] = Array.isArray(ppmpResp)
      ? ppmpResp
      : ((ppmpResp as { data?: PPMP[]; items?: PPMP[] })?.data ??
        (ppmpResp as { data?: PPMP[]; items?: PPMP[] })?.items ??
        [])

    return raw
      .filter((p) => isEligibleForConsolidation(p, masterPpmp))
      .filter((p) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          p.officeName?.toLowerCase().includes(q) ||
          p.ppmpNumber?.toLowerCase().includes(q) ||
          p.documentName?.toLowerCase().includes(q) ||
          p.libName?.toLowerCase().includes(q)
        )
      })
  }, [ppmpResp, masterPpmp, search])

  const ineligible = useMemo(() => {
    const raw: PPMP[] = Array.isArray(ppmpResp)
      ? ppmpResp
      : ((ppmpResp as { data?: PPMP[]; items?: PPMP[] })?.data ??
        (ppmpResp as { data?: PPMP[]; items?: PPMP[] })?.items ??
        [])

    return raw
      .map((p) => {
        const reason = getConsolidationEligibility(p, masterPpmp)
        return { ppmp: p, reason }
      })
      .filter((item) => item.reason !== true)
      .filter((item) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        const p = item.ppmp
        return (
          p.officeName?.toLowerCase().includes(q) ||
          p.ppmpNumber?.toLowerCase().includes(q) ||
          p.documentName?.toLowerCase().includes(q) ||
          p.libName?.toLowerCase().includes(q)
        )
      }) as { ppmp: PPMP; reason: string }[]
  }, [ppmpResp, masterPpmp, search])

  const selectedPPMPs = useMemo(
    () => eligible.filter((p) => selectedIds.has(p.id)),
    [eligible, selectedIds],
  )

  const { mutateAsync: consolidate, isPending: isConsolidating } = useConsolidatePPMPs()

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(eligible.map((p) => p.id)))
  }, [eligible])

  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleClose = () => {
    if (!isConsolidating) {
      onOpenChange(false)
      setSelectedIds(new Set())
      setSearch('')
    }
  }

  const handleConfirmImport = async () => {
    try {
      await consolidate(
        {
          pathParams: {},
          payload: {
            childPPMPIds: Array.from(selectedIds),
            parentOfficeId: masterPpmp.officeId,
            fiscalYearId: masterPpmp.fiscalYearId,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              `Successfully consolidated ${selectedIds.size} department PPMP${selectedIds.size !== 1 ? 's' : ''} into the master plan.`,
            )
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmps') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
            handleClose()
          },
        },
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to consolidate department PPMPs.',
      )
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent
          side="bottom"
          className="h-[96vh] p-0 flex flex-col rounded-t-2xl overflow-hidden border-t border-slate-200 shadow-2xl"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GitMerge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-800 leading-tight">
                    Consolidation Workspace
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-0.5">
                    {masterPpmp.documentName || masterPpmp.ppmpNumber} — Select department PPMPs to
                    merge into this master plan
                  </SheetDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <Badge variant="outline" className="gap-1.5 font-semibold">
                    <CheckSquare className="h-3.5 w-3.5" />
                    {selectedIds.size} selected
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Body — two-panel split */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: Eligible PPMP list */}
            <div className="w-[420px] shrink-0 border-r border-slate-200 flex flex-col bg-white min-h-0">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Eligible Department PPMPs
                </p>
              </div>
              <EligiblePPMPList
                eligible={eligible}
                ineligible={ineligible}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                search={search}
                onSearchChange={setSearch}
              />
            </div>

            <Separator orientation="vertical" />

            {/* Right: Diff preview */}
            <div className="flex-1 min-w-0 flex flex-col bg-slate-50/50 min-h-0">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Preview — What Will Be Added
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <DiffPreview selectedPPMPs={selectedPPMPs} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Imported PPMPs will be marked as{' '}
              <span className="font-semibold text-slate-600">Consolidated</span> and become
              read-only.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isConsolidating}>
                Cancel
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={selectedIds.size === 0 || isConsolidating}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isConsolidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consolidating…
                  </>
                ) : (
                  <>
                    <GitMerge className="h-4 w-4" />
                    Confirm Import ({selectedIds.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Final confirmation dialog */}
      <ConfirmAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Consolidate department PPMPs?"
        description={`You are about to import ${selectedIds.size} department PPMP${selectedIds.size !== 1 ? 's' : ''} into this master plan. This action is irreversible — the selected PPMPs will be marked as Consolidated and can no longer be edited. Proceed?`}
        onConfirm={handleConfirmImport}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel={isConsolidating ? 'Consolidating…' : 'Yes, Consolidate'}
        cancelLabel="Cancel"
        loading={isConsolidating}
      />
    </>
  )
}
