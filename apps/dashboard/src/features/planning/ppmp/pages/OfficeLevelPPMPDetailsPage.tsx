import { useState, useMemo, useEffect, useCallback } from 'react'
import AddPPMPActivityDialog from '@/features/planning/ppmp/dialogs/AddPPMPActivityDialog'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  Wallet,
  Layers,
  CalendarDays,
  Search,
  X,
  Plus,
  Trash2,
  Building2,
  Coins,
  Clock,
  TrendingUp,
  ChevronLeft,
  Pencil,
  Send,
  Lock,
  GitMerge,
  FileText,
  Download,
  Package,
  Image as ImageIcon,
  Info,
  Eye,
  Circle,
} from 'lucide-react'
import { getProcurementItemRequest } from '@/components/features/planning/procurement-item/handlers/getProcurementItemRequest'
import { getUOMRequest } from '@/components/features/planning/procurement-library/unit-of-measurement/handlers/getUOMRequest'
import { getNONCSEItemRequest } from '@/features/planning/non-cse-item/handlers/getNONCSEItemRequest'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSetAtom } from 'jotai'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { selectedPpmpForEditAtom } from '../atoms'
import { deletePPMPActivityRequest } from '../handlers/deletePPMPActivityRequest'
import type {
  PPMPDetails,
  PPMPActivity,
  PPMPItem,
  PPMPItemAllocation,
  PPMPExpenditureItem,
} from '../types'
import { PageContainerDashtail } from '@/components/v2'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPPMPRequest } from '../handlers'
import { getPPMPActivitiesRequest } from '../handlers/getPPMPActivitiesRequest'
import { getPPMPExpenditureItemsRequest } from '../handlers/getPPMPExpenditureItemsRequest'
import { getPPMPItemsRequest } from '../handlers/getPPMPItemsRequest'
import { formatCurrency } from '../lib'
import { deletePPMPItemRequest } from '../handlers/deletePPMPItemRequest'
import { deletePPMPExpenditureItemRequest } from '../handlers/deletePPMPExpenditureItemRequest'
import {
  AddPPMPItemDialog,
  AddPPMPItemExpenditureDialog,
  AddPPMPItemsModal,
  EditPPMPItemAllocationsDialog,
  MasterPPMPViewerModal,
} from '../dialogs'
import { PPMPGuidelinesModal } from '../dialogs/PPMPGuidelinesModal'
import { ConsolidationWorkspaceSheet } from '../dialogs/ConsolidationWorkspaceSheet'
import { DeptConsolidationSheet } from '../dialogs/DeptConsolidationSheet'
import { updatePPMPStatusRequest } from '../handlers/updatePPMPStatusRequest'
import { generatePPMPDocumentRequest } from '../handlers/generatePPMPDocumentRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'
import { useKeycloak } from '@/providers/KeycloakProvider'
import {
  useItemValidationStatus,
  getRowCompletionClasses,
  getItemValidationStatus,
} from '../hooks/useItemValidationStatus'
import { RowCompletionIndicator } from '../components/RowCompletionIndicator'
import { FieldDescriptionTooltip } from '../components/FieldDescriptionTooltip'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoreVertical, AlertCircle } from 'lucide-react'

// ============================
// Type Definitions
// ============================

// Extended type for display
interface PPMPItemAlloc {
  id: string
  allocationMonth: string
  quantity: number
  amount: number
}

interface PPMPItemForDisplay {
  id: string
  name: string
  description?: string
  unit: string
  unitPrice: number
  projectType: string
  procurementStartDate: string
  procurementEndDate: string
  expectedDeliveryStart: string
  expectedDeliveryEnd: string
  PPMPItemAllocations?: PPMPItemAlloc[]
}

interface PPMPExpenditureItemForDisplay {
  id: string
  isProcurable: boolean
  totalCost: number
  ppmpItems?: PPMPItemForDisplay[]
}

interface PPMPActivityForDisplay extends PPMPActivity {
  ppmpExpenditureItems?: PPMPExpenditureItemForDisplay[]
  officeName?: string
}

const usePPMP = createQueryHookFromTemplate(getPPMPRequest)
const usePPMPActivities = createQueryHookFromTemplate(getPPMPActivitiesRequest)
const useDeletePPMPActivity = createMutationHookFromTemplate(
  deletePPMPActivityRequest,
)
const usePPMPExpenditureItems = createQueryHookFromTemplate(
  getPPMPExpenditureItemsRequest,
)
const usePPMPItems = createQueryHookFromTemplate(getPPMPItemsRequest)
const useProcurementItem = createQueryHookFromTemplate(getProcurementItemRequest)
const useUOM = createQueryHookFromTemplate(getUOMRequest)
const useNONCSEItem = createQueryHookFromTemplate(getNONCSEItemRequest)
const useUpdatePPMPStatus = createMutationHookFromTemplate(
  updatePPMPStatusRequest,
)
const useGeneratePPMPDocument = createMutationHookFromTemplate(
  generatePPMPDocumentRequest,
)
const useDownloadDocument = createMutationHookFromTemplate(
  downloadLIBDocumentRequest,
)
// ============================
// Utility Formatting
// ============================

const formatDate = (value: string | null | undefined, withTime = false) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

const PROJECT_TYPE_STYLES: Record<string, string> = {
  Goods: 'bg-sky-50 text-sky-700',
  Services: 'bg-amber-50 text-amber-700',
  Infrastructure: 'bg-orange-50 text-orange-700',
  ConsultingServices: 'bg-violet-50 text-violet-700',
}

const getProjectTypeStyle = (type: string) =>
  PROJECT_TYPE_STYLES[type] ?? 'bg-slate-100 text-slate-600'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1'

// ============================
// UI Components
// ============================

function MetadataGrid({
  ppmp,
  activityCount,
  itemCount,
}: {
  ppmp: PPMPDetails
  activityCount: number
  itemCount: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Budget Card */}
      <Card className="border-default-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider">
              Total Estimated Budget
            </span>
            <div className="text-2xl font-bold text-default-900 ">
              {formatCurrency(ppmp.totalEstimatedBudget ?? 0)}
            </div>
            <div className="text-xs text-default-500 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span>Budget for FY {ppmp.fiscalYearName}</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Wallet className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Procurement Library */}
      <Card className="border-default-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider">
              Procurement Library
            </span>
            <div
              className="text-sm font-bold text-default-900 truncate max-w-42.5"
              title={ppmp.libName || '—'}
            >
              {ppmp.libName || '—'}
            </div>
            <div className="text-xs text-default-500 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-info" />
              <span>
                {activityCount} Activities / {itemCount} Items
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-info/5 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Fund Source */}
      <Card className="border-default-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider">
              Fund Source
            </span>
            <div
              className="text-sm font-bold text-default-900 truncate max-w-42.5"
              title={ppmp.fundSourceName || '—'}
            >
              {ppmp.fundSourceName || 'General Fund'}
            </div>
            <div className="text-xs text-default-500">
              Source of Procurement Funding
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-warning/5 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
            <Coins className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card className="border-default-200 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider">
              Timeline Details
            </span>
            <div className="text-xs text-default-700 flex items-center gap-1.5">
              <span className="font-semibold text-default-400 uppercase text-[9px] w-12">
                Submitted:
              </span>
              <span className="font-medium">
                {formatDate(ppmp.submittedDate)}
              </span>
            </div>
            <div className="text-xs text-default-700 flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-default-400 uppercase text-[9px] w-12">
                Approved:
              </span>
              <span className="font-medium">
                {formatDate(ppmp.approvedDate)}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-success/5 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
            <CalendarDays className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================
// Activities Pane (Left)
// ============================

interface ActivityCardProps {
  activity: PPMPActivityForDisplay
  selected: boolean
  expanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onRequestDelete?: () => void
  totalPpmpBudget: number
  shouldThrob?: boolean
  dimmed?: boolean
}

function ActivityCard({
  activity,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
  onRequestDelete,
  totalPpmpBudget,
  shouldThrob = false,
  dimmed = false,
}: ActivityCardProps) {
  const totalItems = activity.totalItems

  const budgetPct =
    totalPpmpBudget > 0
      ? (activity.totalAllocationAmount / totalPpmpBudget) * 100
      : 0
  return (
    <li
      className={cn(
        'rounded-xl border bg-white shadow-sm transition-all duration-200 overflow-hidden relative flex shrink-0 h-30',
        selected
          ? 'ring-1 shadow-md bg-primary/5 scale-[1.015] z-10 animate-pulse-selected border-primary'
          : 'border-default-200 hover:border-default-300 hover:shadow-md',
        expanded ? 'w-120' : 'w-80',
        shouldThrob && !selected && 'animate-pulse-unselected',
        dimmed &&
        'opacity-60 saturate-50 hover:opacity-100 hover:saturate-100 transition-all duration-300',
      )}
    >
      {/* Left side (regular card content) */}
      <div className="w-80 shrink-0 flex items-start gap-3 p-4">
        {selected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
        )}

        <button
          type="button"
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className="text-sm font-semibold text-default-900 group-hover:text-primary transition-colors leading-tight truncate">
            {activity.activityName || 'Unnamed'}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-1 text-xs text-default-500">
            <span className="text-sm font-bold text-default-800">
              {activity.totalAllocationAmount
                ? formatCurrency(activity.totalAllocationAmount)
                : '—'}
            </span>
          </div>

          {/* Progress bar of total budget */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-default-400 font-medium">
              <span>PPMP Budget Share</span>
              <span className="font-semibold text-default-600">
                {budgetPct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1 bg-default-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className={`shrink-0 p-1.5 rounded-lg hover:bg-default-100 transition-colors text-default-500 ${FOCUS_RING}`}
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Right side (expanded details - sideward) */}
      {expanded && (
        <div className="w-40 border-l border-default-150 bg-default-50/30 flex flex-col justify-between p-3 shrink-0">
          <div className="space-y-2 text-[10px] text-default-600 font-medium">
            <div>
              <div className="text-default-400 mb-0.5 uppercase tracking-wider text-[8px] font-bold">
                Procurement Items
              </div>
              <div className="font-bold text-default-800 flex items-center gap-1">
                <Layers className="h-3 w-3 text-primary/70" />
                {totalItems} items
              </div>
            </div>
            <div>
              <div className="text-default-400 mb-0.5 uppercase tracking-wider text-[8px] font-bold">
                Total Allocation
              </div>
              <div className="font-bold text-default-800">
                {formatCurrency(activity.totalAllocationAmount || 0)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-default-200/60 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRequestDelete?.()
              }}
              className="h-7 text-[10px] px-2 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg font-semibold flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

interface ActivitiesPaneProps {
  activities: PPMPActivityForDisplay[]
  selectedId: string | null
  onSelect: (id: string) => void
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onAdd?: () => void
  onRequestDelete?: (id: string) => void
  totalPpmpBudget: number
  masterPpmpId?: string
  isLoading?: boolean
}

function ActivitiesPane({
  activities,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  onAdd,
  onRequestDelete,
  totalPpmpBudget,
  masterPpmpId,
  isLoading,
}: ActivitiesPaneProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activities
    return activities.filter((a) => a.activityName?.toLowerCase().includes(q))
  }, [activities, query])

  return (
    <div className="flex flex-col border border-default-200 bg-white rounded-xl overflow-hidden p-4 gap-4 shrink-0 shadow-sm transition-all duration-300">
      {/* Header with Search and Add inline */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
          <Input
            placeholder="Search activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-default-250 bg-white focus-visible:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-default-100 rounded"
            >
              <X className="h-3.5 w-3.5 text-default-400 hover:text-default-600" />
            </button>
          )}
        </div>

        {onAdd && (
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={onAdd}
              className="h-9 px-4 flex items-center gap-2 font-semibold bg-primary hover:bg-primary/95 text-white"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Add Activity</span>
            </Button>
          </div>
        )}
      </div>

      {/* Horizontal Scroller for ActivityCards */}
      <div className="overflow-x-auto pb-1.5 scrollbar-thin">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-3 text-sm text-default-450 italic">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-default-300 border-t-primary" />
            <span>Loading activities...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-default-400 italic">
            No activities found
          </div>
        ) : (
          <div className="flex gap-6 items-start py-1 min-w-max">
            {Object.entries(
              filtered.reduce<Record<string, typeof filtered>>((acc, act) => {
                const office = act.officeName || 'Master PPMP'
                if (!acc[office]) acc[office] = []
                acc[office].push(act)
                return acc
              }, {}),
            ).map(([officeName, officeActs]) => (
              <div
                key={officeName}
                className="flex flex-col gap-2.5 border-r border-default-100 last:border-0 pr-6 last:pr-0"
              >
                {/* Visual Group Header */}
                <div className="flex items-center gap-2 px-1 py-0.5 select-none">
                  <Building2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span
                    className="text-xs font-bold text-slate-700 tracking-wider truncate max-w-50"
                    title={officeName}
                  >
                    {officeName}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                    {officeActs.length}
                  </span>
                </div>

                {/* Sublist of activity cards */}
                <ul className="flex gap-4">
                  {officeActs.map((act) => {
                    const isSelected = selectedId === act.id
                    const anySelected = selectedId !== null
                    return (
                      <ActivityCard
                        key={act.id}
                        activity={act}
                        selected={isSelected}
                        expanded={expandedIds.has(act.id)}
                        onSelect={() => onSelect(act.id)}
                        onToggleExpand={() => onToggleExpand(act.id)}
                        onRequestDelete={
                          onRequestDelete && act.ppmpId === masterPpmpId
                            ? () => onRequestDelete(act.id)
                            : undefined
                        }
                        totalPpmpBudget={totalPpmpBudget}
                        shouldThrob={!anySelected || isSelected}
                        dimmed={anySelected && !isSelected}
                      />
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================
// Items Pane (Right)
// ============================

interface ItemDetailProps {
  item: PPMPItem

  onEditAllocations?: (item: PPMPItem) => void
}

const isUUID = (val: string | null | undefined): boolean => {
  if (!val) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
}

interface ReferencedItemModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'cse' | 'non-cse'
  itemDetails: any
}

function ReferencedItemModal({
  isOpen,
  onClose,
  type,
  itemDetails,
}: ReferencedItemModalProps) {
  if (!itemDetails) return null

  const isCse = type === 'cse'
  const name = itemDetails.name || 'Unnamed Item'
  const specifications = isCse
    ? itemDetails.specifications
    : itemDetails.description
  const imageSrc = isCse ? itemDetails.imageURL : null

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isCse ? 'CSE Catalog Item Details' : 'Non-CSE Catalog Item Details'}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
        {/* Left Side: Metadata Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-xl border border-default-200 bg-default-50/50 p-4 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-default-450 border-b border-default-200/60 pb-2">
              Item Information
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-default-400 uppercase font-semibold block">Product Name</span>
                <span className="text-sm font-semibold text-default-850">{name}</span>
              </div>

              <div>
                <span className="text-[10px] text-default-400 uppercase font-semibold block">Product Code</span>
                <span className="text-xs font-mono font-bold text-default-700 bg-default-100 px-1.5 py-0.5 rounded w-fit block mt-0.5">
                  {itemDetails.productCode || '—'}
                </span>
              </div>

              {isCse ? (
                <>
                  <div>
                    <span className="text-[10px] text-default-400 uppercase font-semibold block">Object Code</span>
                    <span className="text-xs font-medium text-default-750">{itemDetails.objectCodeName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-default-400 uppercase font-semibold block">UNSPSC Classification</span>
                    <span className="text-xs font-medium text-default-750">{itemDetails.unspscCodeName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-default-400 uppercase font-semibold block">UOM</span>
                    <span className="text-xs font-semibold text-default-800">{itemDetails.uomName || '—'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-default-400 uppercase font-semibold block">Procurement Category</span>
                    <span className="text-xs font-medium text-default-750">{itemDetails.procurementCategoryName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-default-400 uppercase font-semibold block">UOM</span>
                    <span className="text-xs font-semibold text-default-800">{itemDetails.uomName || '—'}</span>
                  </div>
                </>
              )}

              <div>
                <span className="text-[10px] text-default-400 uppercase font-semibold block">Reference Price</span>
                <span className="text-sm font-extrabold text-primary">
                  {formatCurrency(isCse ? (itemDetails.unitPrice || 0) : (itemDetails.currentPrice || 0))}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-default-400 uppercase font-semibold block">Status</span>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border-none mt-1",
                  itemDetails.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", itemDetails.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                  {itemDetails.isActive ? 'Active Catalog' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Specifications / Image */}
        <div className="md:col-span-7 space-y-4">
          {isCse && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-default-400 uppercase font-bold tracking-wider">Product Media</span>
              {imageSrc ? (
                <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden border border-default-200 bg-slate-50 flex items-center justify-center shadow-sm">
                  <img
                    src={imageSrc}
                    alt={name}
                    className="object-contain w-full h-full p-4 transition-all hover:scale-102"
                  />
                </div>
              ) : (
                <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden border border-dashed border-default-250 bg-slate-50 flex flex-col items-center justify-center p-6 text-default-400 gap-2">
                  <ImageIcon className="h-10 w-10 text-default-300 animate-pulse" />
                  <span className="text-xs">No product image available</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-[10px] text-default-400 uppercase font-bold tracking-wider">Specifications & Requirements</span>
            <div className="rounded-xl border border-default-200 p-4 bg-white shadow-sm leading-relaxed text-xs text-default-700 whitespace-pre-line min-h-24">
              {specifications || 'No detailed specifications provided.'}
            </div>
          </div>

          {itemDetails.remarks && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-default-400 uppercase font-bold tracking-wider">Catalog Remarks</span>
              <div className="rounded-xl border border-amber-500/10 p-3 bg-amber-500/2 text-xs italic text-amber-800 leading-relaxed">
                {itemDetails.remarks}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}

function ItemDetail({ item, onEditAllocations }: ItemDetailProps) {
  const months = [
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

  // Map allocations for this specific item
  const allocMap = useMemo(() => {
    const map: Record<string, { qty: number; amt: number }> = {}
    months.forEach((m) => {
      map[m] = { qty: 0, amt: 0 }
    })
    item.PPMPItemAllocations?.forEach((alloc) => {
      const month = alloc.allocationMonth
      if (map[month]) {
        map[month].qty += alloc.quantity || 0
        map[month].amt += alloc.amount || 0
      }
    })
    return map
  }, [item])

  const hasAllocations =
    item.PPMPItemAllocations && item.PPMPItemAllocations.length > 0

  // Format date helper
  const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // 1. Fetch UOM if unit is a UUID
  const isUnitUuid = isUUID(item.unit)
  const { data: uomResp } = useUOM({
    pathParams: { id: item.unit || '' },
    queryParams: {},
    enabled: isUnitUuid && !!item.unit,
  })
  const displayUnit = isUnitUuid ? (uomResp?.data?.name || 'Loading...') : (item.unit || '—')

  // 2. Fetch CSE Item if cseItemId exists
  const { data: cseItemResp, isLoading: isLoadingCse } = useProcurementItem({
    pathParams: { id: item.cseItemId || '' },
    queryParams: {},
    enabled: !!item.cseItemId,
  })
  const cseItem = cseItemResp?.data

  // 3. Fetch Non-CSE Item if nonCSEItemId exists
  const { data: nonCseItemResp, isLoading: isLoadingNonCse } = useNONCSEItem({
    pathParams: { id: item.nonCSEItemId || '' },
    queryParams: {},
    enabled: !!item.nonCSEItemId,
  })
  const nonCseItem = nonCseItemResp?.data

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-5 p-5 bg-default-50/60 rounded-2xl border border-default-200 shadow-inner">
      {/* 3-Column Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1: Overview & Specs */}
        <div className="space-y-4 bg-white p-4.5 rounded-xl border border-default-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-default-100">
              <Layers className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-default-800">
                Overview & Specifications
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">Unit</span>
                <span className="font-semibold text-default-700 mt-0.5 block">{displayUnit}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">Unit Price</span>
                <span className="font-semibold text-default-800 mt-0.5 block">{formatCurrency(item.unitPrice)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">Project Type</span>
                <span className="font-semibold text-default-700 mt-0.5 block">{item.projectType || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">PAP Code</span>
                <span className="font-mono text-default-700 mt-0.5 block">{item.papCode || '—'}</span>
              </div>
            </div>

            <div className="border-t border-default-100 pt-3">
              <span className="text-[10px] uppercase font-bold text-default-400 block mb-1">
                Specifications
              </span>
              <p className="text-xs text-default-600 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-wrap">
                {item.description || 'No specifications provided.'}
              </p>
            </div>
          </div>

          {item.remarks && (
            <div className="bg-default-50 p-2.5 rounded-lg border border-default-150/60 mt-2 text-xs italic text-default-600">
              <span className="font-bold not-italic text-default-750 block text-[9px] uppercase tracking-wider mb-0.5">Remarks</span>
              "{item.remarks}"
            </div>
          )}
        </div>

        {/* Column 2: Timeline & Milestones */}
        <div className="space-y-4 bg-white p-4.5 rounded-xl border border-default-200/80 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 pb-2 border-b border-default-100">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-default-800">
              Timeline & Milestones
            </h4>
          </div>

          <div className="relative pl-6 border-l border-default-200 space-y-5 flex-1 py-1">
            {/* Procurement Milestone */}
            <div className="relative">
              <Circle className="h-4 w-4 text-indigo-600 absolute -left-[32px] top-0.5 bg-indigo-50 rounded-full" />
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">
                  Procurement Schedule
                </span>
                <p className="text-xs text-default-805 font-semibold mt-0.5">
                  {formatDateDisplay(item.procurementStartDate)} – {formatDateDisplay(item.procurementEndDate)}
                </p>
              </div>
            </div>

            {/* Delivery Milestone */}
            <div className="relative">
              <Circle className="h-4 w-4 text-emerald-600 absolute -left-[32px] top-0.5 bg-emerald-50 rounded-full" />
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">
                  Expected Delivery Window
                </span>
                <p className="text-xs text-default-805 font-semibold mt-0.5">
                  {formatDateDisplay(item.expectedDeliveryStart)} – {formatDateDisplay(item.expectedDeliveryEnd)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-default-100 flex items-center justify-between text-xs">
            <span className="text-default-505 font-medium">Pre-Procurement Conference:</span>
            <Badge
              variant={item.preProcurementConference ? 'soft' : 'outline'}
              className={cn(
                'text-[10px] font-bold py-0.5 px-2.5 rounded-full',
                item.preProcurementConference
                  ? 'bg-rose-500/10 text-rose-700 border-none'
                  : 'text-slate-500'
              )}
            >
              {item.preProcurementConference ? 'Required' : 'Not Required'}
            </Badge>
          </div>
        </div>

        {/* Column 3: Linked Catalog & Procurement Mode */}
        <div className="space-y-4 bg-white p-4.5 rounded-xl border border-default-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-1.5 pb-2 border-b border-default-100">
              <Package className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-default-800">
                Catalog & Mode of Procurement
              </h4>
            </div>

            {/* Procurement Mode */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-default-400 block">
                  Mode of Procurement
                </span>
                <span className="text-xs font-bold text-default-850 mt-0.5 block">
                  {item.procurementModeName || '—'}
                </span>
              </div>
              <Badge
                variant={item.mopOverride ? 'soft' : 'outline'}
                className={cn(
                  'text-[9px] font-bold px-2 py-0.5 rounded-full',
                  item.mopOverride ? 'bg-amber-500/10 text-amber-700 border-none' : 'text-default-400'
                )}
              >
                {item.mopOverride ? 'MOP Overridden' : 'Standard MOP'}
              </Badge>
            </div>

            {/* MOP Override Justification */}
            {item.mopOverride && item.mopJustification && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 text-xs text-amber-800 leading-normal">
                <span className="font-extrabold text-[9px] uppercase tracking-wider text-amber-750 block mb-0.5">
                  Justification
                </span>
                "{item.mopJustification}"
              </div>
            )}
          </div>

          {/* Linked Catalog Reference */}
          <div className="border-t border-default-100 pt-3.5 mt-2">
            <span className="text-[10px] uppercase font-bold text-default-400 block mb-2">
              Linked Catalog Reference
            </span>

            {item.cseItemId ? (
              <div className="border border-primary/15 bg-primary/2 rounded-xl p-3 space-y-2 transition-all hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 bg-primary/10 rounded-md">
                    CSE Catalog
                  </span>
                  <span className="text-[9px] font-mono text-default-450 font-semibold">
                    Code: {cseItem?.productCode || '—'}
                  </span>
                </div>
                <h5 className="text-[11px] font-bold text-default-850 line-clamp-1">
                  {isLoadingCse ? 'Loading catalog item...' : (cseItem?.name || item.name)}
                </h5>
                {!isLoadingCse && cseItem && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    className="h-5 text-[10px] font-semibold text-primary hover:text-primary-active p-0 flex items-center gap-1 shrink-0"
                  >
                    <Eye className="h-3 w-3" />
                    View specifications & image
                  </Button>
                )}
                <ReferencedItemModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  type="cse"
                  itemDetails={cseItem}
                />
              </div>
            ) : item.nonCSEItemId ? (
              <div className="border border-amber-500/15 bg-amber-500/2 rounded-xl p-3 space-y-2 transition-all hover:border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-700 px-1.5 py-0.5 bg-amber-500/10 rounded-md">
                    Non-CSE Catalog
                  </span>
                  <span className="text-[9px] font-mono text-default-450 font-semibold">
                    Code: {nonCseItem?.productCode || '—'}
                  </span>
                </div>
                <h5 className="text-[11px] font-bold text-default-850 line-clamp-1">
                  {isLoadingNonCse ? 'Loading catalog item...' : (nonCseItem?.name || item.name)}
                </h5>
                {!isLoadingNonCse && nonCseItem && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    className="h-5 text-[10px] font-semibold text-amber-700 hover:text-amber-800 p-0 flex items-center gap-1 shrink-0"
                  >
                    <Eye className="h-3 w-3" />
                    View specifications
                  </Button>
                )}
                <ReferencedItemModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  type="non-cse"
                  itemDetails={nonCseItem}
                />
              </div>
            ) : (
              <div className="border border-dashed border-default-250 bg-default-50 rounded-xl p-3 text-center text-xs text-default-400 italic">
                No catalog reference linked.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Allocation Schedule */}
      <div className="border-t border-default-100 pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">
              Item Monthly Distribution Schedule
            </span>
            <FieldDescriptionTooltip
              fieldKey="monthlyAllocations"
              className="h-3.5 w-3.5"
            />
          </div>
          {hasAllocations && onEditAllocations && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEditAllocations(item)}
              className="h-8 w-8 text-default-550 hover:text-primary rounded-lg"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!hasAllocations ? (
          <div className="flex flex-col items-center justify-center text-xs text-default-400 italic bg-default-50 p-4 rounded-xl border border-dashed border-default-200 gap-2">
            <span>No monthly allocations defined for this item.</span>
            {onEditAllocations && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditAllocations(item)}
                className="h-8 text-xs font-semibold flex items-center gap-1.5 border-primary/20 hover:bg-primary/5 text-primary rounded-lg mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Monthly Allocations
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {months.map((m) => {
              const { qty, amt } = allocMap[m]
              const hasVal = qty > 0 || amt > 0
              return (
                <div
                  key={m}
                  className={cn(
                    'rounded-lg border p-2.5 text-center flex flex-col justify-between min-h-[76px] transition-all',
                    hasVal
                      ? 'bg-primary/2 border-primary/20 shadow-sm'
                      : 'bg-default-100/20 border-default-100 text-default-400',
                  )}
                >
                  <div
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      hasVal ? 'text-primary' : 'text-default-400',
                    )}
                  >
                    {m.substring(0, 3)}
                  </div>
                  {hasVal ? (
                    <div className="mt-1 flex flex-col items-center justify-center gap-0.5">
                      <div className="text-xs font-bold text-default-800">
                        {formatCurrency(amt)}
                      </div>
                      <div className="text-[10px] font-medium text-default-400">
                        Qty: {qty}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-default-300 mt-1.5 font-medium">
                      —
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface ItemRowProps {
  item: PPMPItem
  expanded: boolean
  onToggle: () => void
  onEdit?: (item: PPMPItem) => void
  onDelete?: (item: PPMPItem) => void
  onEditAllocations?: (item: PPMPItem) => void
}

function ItemRow({
  item,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onEditAllocations,
}: ItemRowProps) {
  const displayName = item.name || 'Unnamed item'
  const validationStatus = useItemValidationStatus(item)
  const rowClasses = getRowCompletionClasses(validationStatus)

  const subtleBgClass = validationStatus.isComplete
    ? 'bg-emerald-500/5 hover:bg-emerald-500/8 dark:bg-emerald-500/3'
    : validationStatus.isDetailsComplete
      ? 'bg-amber-500/5 hover:bg-amber-500/8 dark:bg-amber-500/3'
      : 'bg-rose-500/5 hover:bg-rose-500/8 dark:bg-rose-500/3'

  return (
    <>
      <tr
        className={cn('transition-colors cursor-pointer select-none', rowClasses, subtleBgClass)}
        onClick={onToggle}
      >
        <td className="px-5 py-3 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className={cn(
              'p-2 rounded-lg hover:bg-default-100 transition-colors text-default-500 hover:text-default-900',
              FOCUS_RING,
            )}
          >
            {expanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </td>
        <td className="px-5 py-3 text-sm font-medium text-default-900 min-w-50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div
              className="truncate max-w-50 font-semibold text-default-800"
              title={displayName}
            >
              {displayName}
            </div>
            {item.cseItemId ? (
              <Badge
                variant="soft"
                className="text-[8px] tracking-wide px-1.5 py-0 bg-primary/10 text-primary border-none uppercase font-bold shrink-0 flex items-center gap-0.5"
              >
                <Package className="h-2.5 w-2.5" />
                CSE
              </Badge>
            ) : (
              <Badge
                className="text-[8px] tracking-wide px-1.5 py-0 bg-amber-500/10 text-amber-700 border-none uppercase font-bold shrink-0 flex items-center gap-0.5"
                variant="soft"
              >
                <Layers className="h-2.5 w-2.5" />
                Non-CSE
              </Badge>
            )}
            {item.originDepartmentName && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200 uppercase font-bold shrink-0"
              >
                {item.originDepartmentName}
              </Badge>
            )}
          </div>
          {item.description && (
            <div
              className="text-[10px] text-default-400 truncate max-w-62.5"
              title={item.description}
            >
              {item.description}
            </div>
          )}
        </td>
        <td className="px-5 py-3 text-center">
          <Badge
            className={cn(
              'text-[10px] py-0.5 px-2 rounded-full font-semibold border-none',
              getProjectTypeStyle(item.projectType || 'Goods'),
            )}
          >
            {item.projectType || 'Goods'}
          </Badge>
        </td>
        <td className="px-5 py-3 text-right text-sm text-default-700">
          {formatCurrency(item.unitPrice)}
        </td>
        <td className="px-5 py-3 text-right text-sm font-bold text-default-900">
          {formatCurrency(
            (item.PPMPItemAllocations || []).reduce(
              (sum: number, a: PPMPItemAllocation) => sum + a.amount,
              0,
            ),
          )}
        </td>
        <td className="px-5 py-3 text-right">
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <RowCompletionIndicator
              status={validationStatus}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-default-550 hover:text-default-900 hover:bg-default-100 rounded-lg"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-sans">
                {validationStatus.hasAllocations ? (
                  onEditAllocations && (
                    <DropdownMenuItem
                      onClick={() => onEditAllocations(item)}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4 text-primary" />
                      <span>Edit Monthly Allocations</span>
                    </DropdownMenuItem>
                  )
                ) : (
                  onEditAllocations && (
                    <DropdownMenuItem
                      onClick={() => onEditAllocations(item)}
                      className="cursor-pointer font-bold text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50/50"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Configure Monthly Allocations</span>
                    </DropdownMenuItem>
                  )
                )}
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(item)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4 text-default-550" />
                    <span>Edit Item Details</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Item</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-default-50/20">
          <td colSpan={6} className="px-5 py-4 border-b border-default-200">
            <ItemDetail item={item} onEditAllocations={onEditAllocations} />
          </td>
        </tr>
      )}
    </>
  )
}

interface ExpenditureItemGroupProps {
  group: PPMPExpenditureItem
  expandedItemIds: Set<string>
  onToggleItem: (id: string) => void
  onAddItem?: (groupId: string) => void
  onEditItem?: (item: PPMPItem) => void
  onDeleteItem?: (item: PPMPItem) => void
  onEditGroup?: (group: PPMPExpenditureItem) => void
  onDeleteGroup?: (group: PPMPExpenditureItem) => void
  onEditAllocations?: (item: PPMPItem) => void
}

function ExpenditureItemGroup({
  group,
  expandedItemIds,
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEditGroup,
  onDeleteGroup,
  onEditAllocations,
}: ExpenditureItemGroupProps) {
  // Call usePPMPItems query hook
  const { data: itemsResp, isLoading: isItemsLoading } = usePPMPItems({
    pathParams: {},
    queryParams: { filters: `ppmpExpenditureItemId==${group.id}` },
    enabled: !!group.id,
  })

  const items = itemsResp?.data ?? []

  const totalAmount = items.reduce(
    (sum: number, item: PPMPItem) =>
      sum +
      ((item.PPMPItemAllocations || []).reduce(
        (itemSum: number, a: PPMPItemAllocation) => itemSum + a.amount,
        0,
      ) || 0),
    0,
  )

  return (
    <div className="overflow-hidden rounded-xl border border-default-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-default-200 bg-default-50/30 px-5 py-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h4 className="text-sm font-semibold text-default-900">
            {group.isProcurable ? 'Procurable Items' : 'Non-Procurable Items'}
          </h4>
          <Badge
            variant="soft"
            className={cn(
              'text-[10px] font-semibold border-none rounded-full px-2.5 py-0.5',
              group.isProcurable
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning',
            )}
          >
            {group.isProcurable ? 'Procurable' : 'Non-Procurable'}
          </Badge>
          {isItemsLoading && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-default-300 border-t-primary" />
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right flex flex-row gap-2 items-center justify-center">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-default-400">
              Total Cost
            </div>
            <div className="text-sm font-bold text-default-900">
              {formatCurrency(group.totalCost || 0)}
            </div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-default-400 border-l border-default-250/60 pl-3">
              Total Item Cost
            </div>
            <div className="text-sm font-bold text-default-900">
              {formatCurrency(totalAmount || 0)}
            </div>
          </div>
          {onAddItem && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddItem(group.id)}
              className="h-8 text-xs font-semibold flex items-center gap-1.5 border-primary/20 hover:bg-primary/5 text-primary rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          )}
          <div className="flex items-center gap-1 border-l border-default-250/60 pl-3">
            {onEditGroup && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEditGroup(group)}
                className="h-8 w-8 text-default-550 hover:text-primary rounded-lg"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDeleteGroup && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDeleteGroup(group)}
                className="h-8 w-8 text-default-550 hover:text-destructive rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-default-200 bg-default-50/10 text-xs font-semibold text-default-500 uppercase tracking-wider">
              <th className="w-12 px-5 py-3 text-center" />
              <th className="px-5 py-3">Item Name</th>
              <th className="px-5 py-3 text-center">Type</th>
              <th className="px-5 py-3 text-right">Unit Price</th>
              <th className="px-5 py-3 text-right">Total Allocation</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-100">
            {isItemsLoading && items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-6 text-center text-xs text-default-400 italic"
                >
                  Loading items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-6 text-center text-xs text-default-400 italic"
                >
                  No items in this expenditure item.
                </td>
              </tr>
            ) : (
              items.map((item: PPMPItem) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  expanded={expandedItemIds.has(item.id)}
                  onToggle={() => onToggleItem(item.id)}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onEditAllocations={onEditAllocations}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MonthlyScheduleMatrix({
  activity,
}: {
  activity: PPMPActivityForDisplay
}) {
  const months = [
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

  const monthlyData = useMemo(() => {
    const agg: Record<
      string,
      { quantity: number; amount: number; itemCount: number }
    > = {}
    months.forEach((m) => {
      agg[m] = { quantity: 0, amount: 0, itemCount: 0 }
    })

    activity.ppmpExpenditureItems?.forEach((group) => {
      group.ppmpItems?.forEach((item) => {
        let hasAllocInMonth = false
        item.PPMPItemAllocations?.forEach((alloc) => {
          const month = alloc.allocationMonth
          if (agg[month]) {
            agg[month].quantity += alloc.quantity || 0
            agg[month].amount += alloc.amount || 0
            hasAllocInMonth = true
          }
        })
        if (hasAllocInMonth) {
          item.PPMPItemAllocations?.forEach((alloc) => {
            const m = alloc.allocationMonth
            if (agg[m] && (alloc.quantity > 0 || alloc.amount > 0)) {
              agg[m].itemCount += 1
            }
          })
        }
      })
    })

    return months.map((m) => ({
      month: m,
      quantity: agg[m].quantity,
      amount: agg[m].amount,
      itemCount: agg[m].itemCount,
    }))
  }, [activity])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-default-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-default-900">
            Monthly Procurement Schedule Matrix
          </h4>
        </div>
        <p className="text-xs text-default-400 mb-4">
          Visual schedule showing quantity and budget allocation distributions
          for this activity across the fiscal year.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {monthlyData.map(({ month, amount, itemCount }) => {
            const isActive = amount > 0
            return (
              <div
                key={month}
                className={cn(
                  'rounded-xl border p-3.5 transition-all duration-205 flex flex-col justify-between min-h-22.5',
                  isActive
                    ? 'bg-primary/2 border-primary/20 shadow-sm'
                    : 'bg-default-50/50 border-default-200 text-default-450',
                )}
              >
                <div>
                  <div
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider',
                      isActive
                        ? 'text-primary font-semibold'
                        : 'text-default-400',
                    )}
                  >
                    {month}
                  </div>
                  {isActive && (
                    <div className="mt-2 text-xs font-semibold text-default-700">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} scheduled
                    </div>
                  )}
                </div>
                {isActive ? (
                  <div className="mt-3">
                    <div className="text-[10px] text-default-400 font-medium">
                      Scheduled Amount
                    </div>
                    <div className="text-sm font-bold text-default-900 leading-tight">
                      {formatCurrency(amount)}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-[10px] italic text-default-400 font-medium">
                    No procurement
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface RightPaneProps {
  activity: PPMPActivityForDisplay | null

  onAddItem?: (groupId: string) => void
  onEditItem?: (item: PPMPItem) => void
  onDeleteItem?: (item: PPMPItem) => void
  onAddGroup?: () => void
  onEditGroup?: (group: PPMPExpenditureItem) => void
  onDeleteGroup?: (group: PPMPExpenditureItem) => void
  onEditAllocations?: (item: PPMPItem) => void
}

function RightPane({
  activity,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onEditAllocations,
}: RightPaneProps) {
  const [rightPaneTab, setRightPaneTab] = useState<'items' | 'schedule'>(
    'items',
  )
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Call usePPMPExpenditureItems dynamically when activity is selected
  const { data: expenditureItemsResp, isLoading: isExpenditureLoading } =
    usePPMPExpenditureItems({
      pathParams: {},
      queryParams: activity
        ? { filters: `ppmpActivityId==${activity.id}` }
        : {},
      enabled: !!activity,
    })

  const expenditureItems = expenditureItemsResp?.data ?? []

  if (!activity) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-center text-sm text-default-400 bg-white border border-default-200 rounded-xl shadow-sm">
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-default-100 flex items-center justify-center text-default-400">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-default-900 text-base">
            No Activity Selected
          </h3>
          <p className="text-default-500 max-w-xs text-xs">
            Select an activity from the top pane list to view its items, monthly
            scheduling, and timeline logs.
          </p>
        </div>
      </div>
    )
  }

  const hasItems = expenditureItems.length > 0
  const serverFetchedCost = expenditureItems.reduce(
    (sum, g) => sum + g.totalCost,
    0,
  )

  return (
    <div className="h-full flex flex-col bg-white border border-default-200 rounded-xl shadow-sm overflow-hidden">
      {/* Tab Header with selected Activity Name and Action Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 px-5 py-4 border-b border-default-200 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur">
        <div>
          <h3 className="text-sm font-bold text-default-900 tracking-tight">
            {activity.activityName}
          </h3>
          <p className="text-xs text-default-500 mt-0.5">
            Allocated Budget:{' '}
            <span className="font-bold text-default-800">
              {formatCurrency(activity.totalAllocationAmount || 0)}
            </span>
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-default-100/80 p-0.5 rounded-lg border border-default-200 self-start md:self-center">
          <button
            type="button"
            onClick={() => setRightPaneTab('items')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
              rightPaneTab === 'items'
                ? 'bg-white text-default-950 shadow-sm'
                : 'text-default-500 hover:text-default-700',
            )}
          >
            Expenditure Items
          </button>
          <button
            type="button"
            onClick={() => setRightPaneTab('schedule')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
              rightPaneTab === 'schedule'
                ? 'bg-white text-default-950 shadow-sm'
                : 'text-default-500 hover:text-default-700',
            )}
          >
            Monthly Schedule
          </button>
        </div>
      </div>

      {/* Visual Hero Metadata Strip */}
      <div className="px-5 py-4 bg-default-50/60 border-b border-default-200 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div>
          <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider block">
            Allocated Budget
          </span>
          <span className="text-sm font-bold text-default-900 mt-0.5 block">
            {formatCurrency(activity.totalAllocationAmount || 0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider block">
            Items Cost (Fetched)
          </span>
          <span className="text-sm font-bold text-default-950 mt-0.5 block">
            {formatCurrency(serverFetchedCost)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider block">
            Expenditure Items
          </span>
          <span className="text-sm font-bold text-default-900 mt-0.5 block">
            {expenditureItems.length} items
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-default-400 tracking-wider uppercase block">
            Item Capacity
          </span>
          <span className="text-sm font-bold text-default-900 mt-0.5 block">
            {activity.totalItems || 0} registered
          </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-default-50/10">
        {rightPaneTab === 'items' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-default-200 shadow-sm flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-default-700 uppercase tracking-wider">
                  Expenditure Items
                </h4>
                <p className="text-[10px] text-default-400">
                  Manage procurable/non-procurable sections for this activity
                </p>
              </div>
              {onAddGroup && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onAddGroup}
                  className="h-8 text-xs font-semibold bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 rounded-lg shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Expenditure Item
                </Button>
              )}
            </div>

            {isExpenditureLoading && expenditureItems.length === 0 ? (
              <div className="flex h-40 items-center justify-center p-10 text-center text-sm text-default-400 bg-default-50 border border-dashed border-default-200 rounded-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-default-300 border-t-primary mr-2" />
                Loading expenditure items...
              </div>
            ) : !hasItems ? (
              <div className="flex h-40 items-center justify-center p-10 text-center text-sm text-default-400 bg-default-50 border border-dashed border-default-200 rounded-xl">
                No expenditure items recorded for this activity yet. Click
                &ldquo;Add Expenditure Item&rdquo; above to create one.
              </div>
            ) : (
              expenditureItems.map((group) => (
                <ExpenditureItemGroup
                  key={group.id}
                  group={group}
                  expandedItemIds={expandedItemIds}
                  onToggleItem={toggleItem}
                  onAddItem={onAddItem}
                  onEditItem={onEditItem}
                  onDeleteItem={onDeleteItem}
                  onEditGroup={onEditGroup}
                  onDeleteGroup={onDeleteGroup}
                  onEditAllocations={onEditAllocations}
                />
              ))
            )}
          </div>
        )}

        {rightPaneTab === 'schedule' && (
          <MonthlyScheduleMatrix activity={activity} />
        )}
      </div>
    </div>
  )
}

// ============================
// Main Page Component
// ============================

const useDeletePPMPItem = createMutationHookFromTemplate(deletePPMPItemRequest)
const useDeletePPMPExpenditureItem = createMutationHookFromTemplate(
  deletePPMPExpenditureItemRequest,
)

const THROB_STYLE = `
@keyframes border-pulse-unselected {
  0%, 100% {
    border-color: rgba(226, 232, 240, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  }
  50% {
    border-color: rgba(99, 102, 241, 0.45);
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.12);
  }
}
@keyframes border-pulse-selected {
  0%, 100% {
    border-color: rgba(99, 102, 241, 0.95);
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
  }
  50% {
    border-color: rgba(99, 102, 241, 0.55);
    box-shadow: 0 0 6px rgba(99, 102, 241, 0.12);
  }
}
.animate-pulse-unselected {
  animation: border-pulse-unselected 2.5s infinite ease-in-out;
}
.animate-pulse-selected {
  animation: border-pulse-selected 2.5s infinite ease-in-out;
}
`

function DetailsSkeleton({ isDeptMode }: { isDeptMode: boolean }) {
  return (
    <PageContainerDashtail
      title="Loading PPMP Details..."
      badge={
        <div className="flex items-center gap-2 animate-pulse">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider border-slate-200 bg-slate-50 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            {isDeptMode ? 'Department PPMP' : 'Master PPMP'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider border-slate-200 bg-slate-50 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            Loading...
          </span>
        </div>
      }
      metadata={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-slate-400 dark:text-slate-500 animate-pulse">
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:inline" />
          <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      }
      headerVariant="branded"
      headerSize="large"
      backTo={true}
    >
      <div className="space-y-6">
        {/* Skeleton Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="border-default-200 bg-white shadow-sm overflow-hidden border-slate-200"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-2 w-full animate-pulse">
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3.5 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton content layout */}
        <div className="space-y-6">
          <div className="h-32 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-center gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-80 rounded-lg border border-slate-100 p-4 shrink-0 flex flex-col justify-between animate-pulse"
              >
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-40 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          <div className="h-96 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-slate-100 rounded" />
              <div className="h-4 w-96 bg-slate-100 rounded" />
            </div>
            <div className="flex justify-center items-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            </div>
          </div>
        </div>
      </div>
    </PageContainerDashtail>
  )
}

export function OfficeLevelPPMPDetailsPage({ ppmpId }: { ppmpId: string }) {
  const { data: ppmpResp, isLoading } = usePPMP({
    pathParams: { id: ppmpId },
    queryParams: {},
    enabled: !!ppmpId,
  })

  const ppmp: PPMPDetails | null = ppmpResp?.data ?? null
  const isDeptMode = ppmp ? !ppmp.isMaster : false

  // State management
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  )
  const [expandedActivityIds, setExpandedActivityIds] = useState<Set<string>>(
    new Set(),
  )

  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [consolidateWorkspaceOpen, setConsolidateWorkspaceOpen] =
    useState(false)
  const [deptConsolidateOpen, setDeptConsolidateOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [consolidatedViewerOpen, setConsolidatedViewerOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false)
  // Expose current PPMP to other components so they can read metadata defaults
  const setPpmpForEdit = useSetAtom(selectedPpmpForEditAtom)

  const { userName, firstName, lastName } = useKeycloak()
  const actorDisplayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : userName || 'System User'

  const { mutateAsync: updatePPMPStatus, isPending: isUpdatingStatus } =
    useUpdatePPMPStatus()
  const { mutateAsync: generatePPMPDocument } = useGeneratePPMPDocument()
  const { mutateAsync: downloadDocument } = useDownloadDocument()

  // Delete activity mutation + confirmation (hooks must run unconditionally)
  const queryClient = useQueryClient()
  const { mutateAsync: deleteActivityMutateAsync, isPending: isDeleting } =
    useDeletePPMPActivity()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteActivityId, setPendingDeleteActivityId] = useState<
    string | null
  >(null)

  // PPMPItem CRUD state management
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [itemsPickerOpen, setItemsPickerOpen] = useState(false)
  const [itemDialogGroupId, setItemDialogGroupId] = useState('')
  const [itemDialogEditItem, setItemDialogEditItem] = useState<PPMPItem | null>(
    null,
  )
  const [allocsDialogOpen, setAllocsDialogOpen] = useState(false)
  const [allocsDialogItem, setAllocsDialogItem] = useState<PPMPItem | null>(
    null,
  )

  const { mutateAsync: deleteItemMutateAsync, isPending: isItemDeleting } =
    useDeletePPMPItem()
  const [deleteItemConfirmOpen, setDeleteItemConfirmOpen] = useState(false)
  const [pendingDeleteItem, setPendingDeleteItem] = useState<PPMPItem | null>(
    null,
  )

  // PPMPExpenditureItem CRUD state management
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [groupDialogEditGroup, setGroupDialogEditGroup] =
    useState<PPMPExpenditureItem | null>(null)

  const { mutateAsync: deleteGroupMutateAsync, isPending: isGroupDeleting } =
    useDeletePPMPExpenditureItem()
  const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false)
  const [pendingDeleteGroup, setPendingDeleteGroup] =
    useState<PPMPExpenditureItem | null>(null)

  // Reset tab to overview on ppmpId change
  useEffect(() => {
    setActiveTab('overview')
  }, [ppmpId])

  // Get selected child PPMP if tab is a child ID
  const activeChildPpmp = useMemo(() => {
    if (activeTab === 'overview') return null
    return ppmp?.ChildPPMPs?.find((c) => c.id === activeTab) ?? null
  }, [ppmp, activeTab])

  // Call usePPMPActivities query hook dynamically based on active tab
  const activePpmpId = activeChildPpmp?.id || ppmpId
  const activitiesFilter = useMemo(() => {
    if (!ppmpId) return ''
    if (activeTab === 'overview') {
      // Merged view: fetch master's activities and all children's activities
      const ids = [ppmpId, ...(ppmp?.ChildPPMPs?.map((c) => c.id) || [])]
      // Compact filter: ppmpId==id1|id2|id3 (avoid repeating `ppmpId==` per id)
      return `ppmpId==${ids.join('|')}`
    }
    return `ppmpId==${activePpmpId}`
  }, [ppmpId, activeTab, ppmp?.ChildPPMPs, activePpmpId])

  const { data: activitiesResp, isLoading: isLoadingActivities } =
    usePPMPActivities({
      pathParams: {},
      queryParams: {
        filters: activitiesFilter,
        pageSize: 1000,
      },
      enabled: !!activitiesFilter && !!ppmp,
    })

  const rawActivities = activitiesResp?.data ?? []

  // Prepare activities for display (merged vs individual child)
  const activities: PPMPActivityForDisplay[] = useMemo(() => {
    if (!ppmp) return []
    return rawActivities.map((act) => {
      let officeName = ppmp.officeName || 'Master Office'
      if (act.ppmpId !== ppmpId) {
        const child = ppmp.ChildPPMPs?.find((c) => c.id === act.ppmpId)
        if (child) {
          officeName = child.officeName || 'Child Office'
        }
      }
      return {
        ...act,
        officeName,
      } as PPMPActivityForDisplay
    })
  }, [rawActivities, ppmp, ppmpId])

  // Get selected activity
  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId) ?? null,
    [activities, selectedActivityId],
  )

  // Current PPMP budget context for progress bars
  const totalPpmpBudget = useMemo(() => {
    if (!ppmp) return 0
    if (activeTab === 'overview') {
      return ppmp.totalEstimatedBudget ?? 0
    }
    return activeChildPpmp?.totalEstimatedBudget ?? 0
  }, [ppmp, activeTab, activeChildPpmp])

  // Total item count across master/child (must run unconditionally to keep hooks order)
  const itemCount = useMemo(() => {
    if (!ppmp) return 0
    if (activeTab === 'overview') {
      const masterCount = ppmp.PPMPItems?.length || 0
      const childCount =
        ppmp.ChildPPMPs?.reduce(
          (sum, child) => sum + (child.PPMPItems?.length || 0),
          0,
        ) || 0
      return masterCount + childCount
    }
    return activeChildPpmp?.PPMPItems?.length || ppmp.PPMPItems?.length || 0
  }, [ppmp, activeTab, activeChildPpmp])

  // Gather all items currently displayed in the workspace
  const allCurrentItems = useMemo(() => {
    if (!ppmp) return []
    if (activeTab === 'overview') {
      const masterItems = ppmp.PPMPItems || []
      const childItems = ppmp.ChildPPMPs?.flatMap((c) => c.PPMPItems || []) || []
      return [...masterItems, ...childItems]
    }
    return activeChildPpmp?.PPMPItems || ppmp.PPMPItems || []
  }, [ppmp, activeTab, activeChildPpmp])

  // Find which items are incomplete (not green)
  const incompleteItems = useMemo(() => {
    return allCurrentItems.filter((item) => {
      const status = getItemValidationStatus(item)
      return !status.isComplete
    })
  }, [allCurrentItems])

  // Toggle activity expansion
  const toggleExpandActivity = useCallback((id: string) => {
    setExpandedActivityIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    setPpmpForEdit(ppmp)
    return () => setPpmpForEdit(null)
  }, [ppmp, setPpmpForEdit])

  if (isLoading || !ppmpId) {
    return <DetailsSkeleton isDeptMode={isDeptMode} />
  }

  if (!ppmp) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">PPMP not found</p>
          <p className="mt-1 text-sm text-slate-600">
            The requested PPMP could not be loaded.
          </p>
        </div>
      </div>
    )
  }

  const activityCount = activities.length

  const handleSubmitPPMP = async () => {
    try {
      await updatePPMPStatus(
        {
          pathParams: {},
          payload: {
            id: ppmpId,
            action: 'submitted',
            actorName: actorDisplayName,
            role: 'User',
            notes: 'PPMP submitted for approval',
          },
        },
        {
          onSuccess: () => {
            toast.success('PPMP submitted successfully.')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmps') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
          },
        },
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit PPMP.')
    } finally {
      setSubmitConfirmOpen(false)
    }
  }

  const handleApprovePPMP = async () => {
    try {
      await updatePPMPStatus(
        {
          pathParams: {},
          payload: {
            id: ppmpId,
            action: 'approved',
            actorName: actorDisplayName,
            role: 'Approver',
            notes: 'PPMP approved via details page',
          },
        },
        {
          onSuccess: () => {
            toast.success('PPMP approved successfully.')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmps') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
          },
        },
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to approve PPMP.',
      )
    } finally {
      setApproveConfirmOpen(false)
    }
  }

  const handleExportPPMP = async (format: 'Pdf' | 'Excel') => {
    if (!ppmpId) return
    try {
      setIsExporting(true)

      const genResponse = await generatePPMPDocument({
        pathParams: { ppmpId },
        queryParams: { format },
      })

      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation API')
      }

      const downloadResponse = await downloadDocument({
        pathParams: { documentId },
      })
      const blob = downloadResponse.blob

      const fileExtension = format === 'Excel' ? 'xlsx' : 'pdf'
      const filename = ppmp?.ppmpNumber
        ? `${ppmp.ppmpNumber}.${fileExtension}`
        : `PPMP_${ppmpId}.${fileExtension}`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast.success(`${format} document downloaded successfully.`)
    } catch (err: any) {
      toast.error(err?.message ?? `Failed to generate ${format} document`)
    } finally {
      setIsExporting(false)
    }
  }

  // Consolidation is now handled by ConsolidationWorkspaceSheet

  const requestDeleteActivity = (id: string) => {
    setPendingDeleteActivityId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteActivity = async () => {
    if (!pendingDeleteActivityId) return
    try {
      await deleteActivityMutateAsync(
        { pathParams: { id: pendingDeleteActivityId } },
        {
          onSuccess: async () => {
            toast.success('Activity deleted')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmp-activities') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
          },
        },
      )

      if (selectedActivityId === pendingDeleteActivityId) {
        setSelectedActivityId(null)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete activity'
      toast.error(message)
    } finally {
      setDeleteDialogOpen(false)
      setPendingDeleteActivityId(null)
    }
  }

  const handleAddItem = (groupId: string) => {
    setItemDialogGroupId(groupId)
    setItemDialogEditItem(null)
    setItemsPickerOpen(true)
  }

  const handleEditItem = (item: PPMPItem) => {
    setItemDialogGroupId(item.ppmpExpenditureItemId)
    setItemDialogEditItem(item)
    setItemDialogOpen(true)
  }

  const handleEditAllocations = (item: PPMPItem) => {
    setAllocsDialogItem(item)
    setAllocsDialogOpen(true)
  }

  const handleDeleteItem = (item: PPMPItem) => {
    setPendingDeleteItem(item)
    setDeleteItemConfirmOpen(true)
  }

  const confirmDeleteItem = async () => {
    if (!pendingDeleteItem) return
    try {
      await deleteItemMutateAsync(
        { pathParams: { id: pendingDeleteItem.id } },
        {
          onSuccess: async () => {
            toast.success('Item deleted successfully')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmp-items') ||
                  query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
          },
        },
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete item'
      toast.error(message)
    } finally {
      setDeleteItemConfirmOpen(false)
      setPendingDeleteItem(null)
    }
  }

  const handleAddGroup = () => {
    setGroupDialogEditGroup(null)
    setGroupDialogOpen(true)
  }

  const handleEditGroup = (group: PPMPExpenditureItem) => {
    setGroupDialogEditGroup(group)
    setGroupDialogOpen(true)
  }

  const handleDeleteGroup = (group: PPMPExpenditureItem) => {
    setPendingDeleteGroup(group)
    setDeleteGroupConfirmOpen(true)
  }

  const confirmDeleteGroup = async () => {
    if (!pendingDeleteGroup) return
    try {
      await deleteGroupMutateAsync(
        { pathParams: { id: pendingDeleteGroup.id } },
        {
          onSuccess: async () => {
            toast.success('Expenditure Group deleted successfully')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
          },
        },
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to delete expenditure group'
      toast.error(message)
    } finally {
      setDeleteGroupConfirmOpen(false)
      setPendingDeleteGroup(null)
    }
  }

  return (
    <PageContainerDashtail
      title={ppmp.ppmpNumber || 'PPMP Details'}
      badge={
        <div className="flex items-center gap-2">
          {/* Mode badge */}
          {isDeptMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider border-amber-200 bg-amber-50 text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Department PPMP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider border-primary/20 bg-primary/5 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Master PPMP
            </span>
          )}
          {/* Status badge */}
          {ppmp.status && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider transition-all duration-300',
                ppmp.status.toLowerCase() === 'approved'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/5'
                  : ppmp.status.toLowerCase() === 'submitted' ||
                    ppmp.status.toLowerCase() === 'pending_review' ||
                    ppmp.status.toLowerCase() === 'pending review'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 ring-4 ring-blue-500/5'
                    : ppmp.status.toLowerCase() === 'rejected'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 ring-4 ring-rose-500/5'
                      : 'border-slate-200 bg-slate-50 text-slate-700 ring-4 ring-slate-500/5',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {ppmp.status}
            </span>
          )}
        </div>
      }
      metadata={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary/80" />
            <span>{ppmp.officeName}</span>
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:inline" />
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary/80" />
            <span>Fiscal Year {ppmp.fiscalYearName}</span>
          </span>
        </div>
      }
      headerVariant="branded"
      headerSize="large"
      backTo={true}

      actions={
        <div className="flex items-center gap-2">
          {/* Generate Document - Export Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting}
                className="flex items-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                <span>Generate Document</span>
                <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExportPPMP('Pdf')}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                <span>Download PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View PPMP Guidelines Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGuidelinesModalOpen(true)}
            className="flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" />
            <span>PPMP Guidelines</span>
          </Button>

          {/* Visual Separator */}
          <div className="h-5 w-px bg-slate-200" />

          {ppmp.consolidatedIntoId && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Consolidated — Read Only
            </span>
          )}

          {!ppmp.consolidatedIntoId &&
            (ppmp.status?.toLowerCase() === 'draft' ||
              ppmp.status?.toLowerCase() === 'rejected') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={incompleteItems.length > 0}
                        onClick={() => setSubmitConfirmOpen(true)}
                        className={cn(
                          "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 font-semibold px-4 h-9 rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98]",
                          incompleteItems.length > 0 && "opacity-50 cursor-not-allowed bg-indigo-600/60 hover:bg-indigo-600/60 shadow-none"
                        )}
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit PPMP</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {incompleteItems.length > 0 && (
                    <TooltipContent side="top" className="max-w-xs bg-slate-900 border-slate-800 text-white p-3 shadow-xl z-50">
                      <div className="space-y-1.5 text-xs">
                        <p className="font-bold text-red-400">Cannot Submit PPMP</p>
                        <p className="text-slate-300">The following items are incomplete or missing allocations:</p>
                        <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto text-slate-200">
                          {incompleteItems.slice(0, 5).map((item) => (
                            <li key={item.id}>{item.name || 'Unnamed Item'}</li>
                          ))}
                          {incompleteItems.length > 5 && (
                            <li className="italic text-slate-400">and {incompleteItems.length - 5} more...</li>
                          )}
                        </ul>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}

          {!ppmp.consolidatedIntoId &&
            (ppmp.status?.toLowerCase() === 'submitted' ||
              ppmp.status?.toLowerCase() === 'pending_review' ||
              ppmp.status?.toLowerCase() === 'pending review') && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setApproveConfirmOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 font-semibold px-4 h-9 rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98]"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Approve PPMP</span>
              </Button>
            )}

          {/* Master mode: Consolidate button (import dept PPMPs into this master) */}
          {!isDeptMode &&
            ppmp.isMaster &&
            [
              'draft',
              'submitted',
              'approved',
              'pending_review',
              'pending review',
            ].includes((ppmp.status ?? '').toLowerCase()) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConsolidateWorkspaceOpen(true)}
                className="flex items-center gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Layers className="h-4 w-4" />
                <span>Consolidate PPMP</span>
              </Button>
            )}

          {/* Department mode: Consolidate into Master button */}
          {isDeptMode &&
            !ppmp.consolidatedIntoId &&
            (ppmp.status ?? '').toLowerCase() === 'approved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeptConsolidateOpen(true)}
                className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Layers className="h-4 w-4" />
                <span>Consolidate into Master</span>
              </Button>
            )}
        </div>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: THROB_STYLE }} />

      <div className="space-y-6">
        {incompleteItems.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 p-4 shadow-sm flex items-start gap-3 border-l-4 border-l-amber-500 text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold">PPMP Submission Blocked</h4>
              <p className="text-xs font-semibold text-amber-850/90 dark:text-amber-300">
                There are {incompleteItems.length} item(s) requiring configuration or monthly allocations.
                Configure all items (marked with red or amber left borders) before submitting this PPMP.
              </p>
            </div>
          </div>
        )}

        {isDeptMode && ppmp.consolidatedIntoId && (
          <div className="rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50/90 to-indigo-100/40 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md border-l-4 border-l-indigo-600 font-medium text-indigo-900">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                <GitMerge className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                  This Department PPMP has been consolidated
                </h4>
                <p className="text-xs text-indigo-900/70 leading-normal max-w-2xl font-semibold">
                  It has been merged into a Master Procurement Plan. All details
                  are now locked in read-only mode. You can view the
                  consolidated Master PPMP to trace allocations and approval
                  progress.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConsolidatedViewerOpen(true)}
              className="flex items-center gap-1.5 border-indigo-300 text-indigo-705 bg-white hover:bg-indigo-50 hover:border-indigo-400 font-bold shrink-0 self-start sm:self-center shadow-sm h-9 rounded-lg"
            >
              <FileText className="h-4 w-4" />
              <span>View Master PPMP</span>
            </Button>
          </div>
        )}

        {/* Metadata Grid */}
        <MetadataGrid
          ppmp={activeChildPpmp || ppmp}
          activityCount={activityCount}
          itemCount={itemCount}
        />

        {/* Consolidated Child PPMP Tabs (Only for Master PPMP with children) */}
        {!isDeptMode &&
          ppmp.isMaster &&
          ppmp.ChildPPMPs &&
          ppmp.ChildPPMPs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-0.5">
                <Layers className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                  Department PPMPs ({ppmp.ChildPPMPs.length})
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {/* Overview consolidated card */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('overview')
                    setSelectedActivityId(null)
                  }}
                  className={cn(
                    'group shrink-0 w-52 rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    activeTab === 'overview'
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20'
                      : 'border-default-200 bg-white hover:border-primary/30 hover:shadow-sm hover:bg-default-50/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        activeTab === 'overview'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-default-100 text-default-500 group-hover:bg-primary/10 group-hover:text-primary',
                      )}
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                        activeTab === 'overview'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-default-100 text-default-500',
                      )}
                    >
                      All
                    </span>
                  </div>
                  <div className="mt-2.5 space-y-0.5">
                    <div
                      className={cn(
                        'text-xs font-bold leading-tight',
                        activeTab === 'overview'
                          ? 'text-primary'
                          : 'text-default-800 group-hover:text-default-900',
                      )}
                    >
                      Overview (Consolidated)
                    </div>
                    <div className="text-[10px] text-default-400 font-medium">
                      {ppmp.ChildPPMPs.length} departments merged
                    </div>
                  </div>
                  {activeTab === 'overview' && (
                    <div className="mt-2 h-0.5 w-full rounded-full bg-primary/30" />
                  )}
                </button>

                {/* Individual child PPMP cards */}
                {ppmp.ChildPPMPs.map((child) => {
                  const isActive = activeTab === child.id
                  const statusLower = (child.status ?? '').toLowerCase()
                  const statusStyle =
                    statusLower === 'approved'
                      ? {
                        badge:
                          'bg-emerald-50 text-emerald-700 border-emerald-200',
                        dot: 'bg-emerald-500',
                      }
                      : statusLower === 'submitted' ||
                        statusLower === 'pending_review' ||
                        statusLower === 'pending review'
                        ? {
                          badge: 'bg-blue-50 text-blue-700 border-blue-200',
                          dot: 'bg-blue-500',
                        }
                        : statusLower === 'rejected'
                          ? {
                            badge: 'bg-rose-50 text-rose-700 border-rose-200',
                            dot: 'bg-rose-500',
                          }
                          : {
                            badge:
                              'bg-slate-50 text-slate-600 border-slate-200',
                            dot: 'bg-slate-400',
                          }
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(child.id)
                        setSelectedActivityId(null)
                      }}
                      className={cn(
                        'group shrink-0 w-52 rounded-xl border text-left transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                        isActive
                          ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20 bg-white'
                          : 'border-default-200 bg-white hover:border-primary/30 hover:shadow-sm',
                      )}
                    >
                      {/* Colored top accent bar */}
                      <div
                        className={cn(
                          'h-1 w-full transition-all duration-200',
                          isActive
                            ? 'bg-primary'
                            : 'bg-default-100 group-hover:bg-primary/40',
                        )}
                      />
                      <div className="p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-default-100 text-default-500 group-hover:bg-primary/10 group-hover:text-primary',
                            )}
                          >
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border',
                              statusStyle.badge,
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                statusStyle.dot,
                              )}
                            />
                            {child.status}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div
                            className={cn(
                              'text-xs font-bold leading-tight line-clamp-2',
                              isActive
                                ? 'text-primary'
                                : 'text-default-800 group-hover:text-default-900',
                            )}
                          >
                            {child.officeName || 'Child PPMP'}
                          </div>
                          {child.ppmpNumber && (
                            <div className="text-[10px] text-default-400 font-semibold font-mono tracking-tight">
                              {child.ppmpNumber}
                            </div>
                          )}
                        </div>

                        {child.totalEstimatedBudget != null && (
                          <div
                            className={cn(
                              'text-[11px] font-bold',
                              isActive ? 'text-primary/80' : 'text-default-600',
                            )}
                          >
                            {formatCurrency(child.totalEstimatedBudget)}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Single-column workspace layout */}
        <div className="space-y-6">
          {/* Top horizontal scroller activities pane */}
          <ActivitiesPane
            activities={activities}
            selectedId={selectedActivityId}
            onSelect={setSelectedActivityId}
            expandedIds={expandedActivityIds}
            onToggleExpand={toggleExpandActivity}
            onAdd={
              activeTab === 'overview' &&
                !ppmp.consolidatedIntoId &&
                (ppmp.status?.toLowerCase() === 'draft' ||
                  ppmp.status?.toLowerCase() === 'rejected')
                ? () => setAddDialogOpen(true)
                : undefined
            }
            onRequestDelete={
              !ppmp.consolidatedIntoId ? requestDeleteActivity : undefined
            }
            totalPpmpBudget={totalPpmpBudget}
            masterPpmpId={ppmp.id}
            isLoading={isLoadingActivities}
          />

          {/* Bottom detail pane (expanded full width) */}
          <div className="min-w-0">
            <RightPane
              activity={selectedActivity}
              onAddItem={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleAddItem
                  : undefined
              }
              onEditItem={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleEditItem
                  : undefined
              }
              onDeleteItem={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleDeleteItem
                  : undefined
              }
              onAddGroup={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleAddGroup
                  : undefined
              }
              onEditGroup={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleEditGroup
                  : undefined
              }
              onDeleteGroup={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleDeleteGroup
                  : undefined
              }
              onEditAllocations={
                selectedActivity?.ppmpId === ppmp.id && !ppmp.consolidatedIntoId
                  ? handleEditAllocations
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      <AddPPMPActivityDialog
        isOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        ppmpId={ppmp.id}
        libId={ppmp.libId}
        onCreated={() => {
          /* no-op: queries invalidated inside dialog */
        }}
      />
      <ConfirmAlertDialog
        open={deleteDialogOpen}
        onOpenChange={(s) => {
          if (!s) setDeleteDialogOpen(false)
        }}
        title="Delete activity?"
        description={`${activities.find((a) => a.id === pendingDeleteActivityId)
          ?.activityName || 'This activity'
          } and all nested items will be permanently deleted.`}
        onConfirm={confirmDeleteActivity}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        loading={isDeleting}
      />

      <AddPPMPItemDialog
        isOpen={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        ppmpExpenditureItemId={itemDialogGroupId}
        itemToEdit={itemDialogEditItem}
      />

      <AddPPMPItemsModal
        isOpen={itemsPickerOpen}
        onOpenChange={setItemsPickerOpen}
        ppmpExpenditureItemId={itemDialogGroupId}
      />

      <EditPPMPItemAllocationsDialog
        isOpen={allocsDialogOpen}
        onOpenChange={setAllocsDialogOpen}
        item={allocsDialogItem}
      />

      <ConfirmAlertDialog
        open={deleteItemConfirmOpen}
        onOpenChange={(s) => {
          if (!s) setDeleteItemConfirmOpen(false)
        }}
        title="Delete item?"
        description={`Are you sure you want to permanently delete "${pendingDeleteItem?.name || 'this item'
          }"?`}
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemConfirmOpen(false)}
        confirmLabel={isItemDeleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        loading={isItemDeleting}
      />

      <AddPPMPItemExpenditureDialog
        isOpen={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        ppmpActivityId={selectedActivityId || ''}
        groupToEdit={groupDialogEditGroup}
      />

      <ConfirmAlertDialog
        open={deleteGroupConfirmOpen}
        onOpenChange={(s) => {
          if (!s) setDeleteGroupConfirmOpen(false)
        }}
        title="Delete expenditure item?"
        description="Are you sure you want to permanently delete this expenditure item and all its sub-items?"
        onConfirm={confirmDeleteGroup}
        onCancel={() => setDeleteGroupConfirmOpen(false)}
        confirmLabel={isGroupDeleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        loading={isGroupDeleting}
      />
      <ConfirmAlertDialog
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        title="Submit PPMP?"
        description="Are you sure you want to submit this PPMP for review? This will transition its status to Submitted."
        onConfirm={handleSubmitPPMP}
        onCancel={() => setSubmitConfirmOpen(false)}
        confirmLabel={isUpdatingStatus ? 'Submitting…' : 'Submit'}
        cancelLabel="Cancel"
        loading={isUpdatingStatus}
      />

      <ConfirmAlertDialog
        open={approveConfirmOpen}
        onOpenChange={setApproveConfirmOpen}
        title="Approve PPMP?"
        description="Are you sure you want to approve this PPMP? This action will record an approval history event."
        onConfirm={handleApprovePPMP}
        onCancel={() => setApproveConfirmOpen(false)}
        confirmLabel={isUpdatingStatus ? 'Approving…' : 'Approve'}
        cancelLabel="Cancel"
        loading={isUpdatingStatus}
      />

      <PPMPGuidelinesModal
        open={guidelinesModalOpen}
        onOpenChange={setGuidelinesModalOpen}
      />

      <ConsolidationWorkspaceSheet
        open={consolidateWorkspaceOpen}
        onOpenChange={setConsolidateWorkspaceOpen}
        masterPpmp={{
          id: ppmp.id,
          officeId: ppmp.officeId,
          fiscalYearId: ppmp.fiscalYearId,
          libId: ppmp.libId,
          documentName: ppmp.documentName,
          ppmpNumber: ppmp.ppmpNumber,
          officeName: ppmp.officeName,
        }}
      />

      {isDeptMode && (
        <DeptConsolidationSheet
          open={deptConsolidateOpen}
          onOpenChange={setDeptConsolidateOpen}
          deptPpmp={{
            id: ppmp.id,
            officeId: ppmp.officeId,
            fiscalYearId: ppmp.fiscalYearId,
            fiscalYearName: ppmp.fiscalYearName,
            libId: ppmp.libId,
            ppmpNumber: ppmp.ppmpNumber,
            officeName: ppmp.officeName,
          }}
        />
      )}
      {isDeptMode && ppmp.consolidatedIntoId && (
        <MasterPPMPViewerModal
          open={consolidatedViewerOpen}
          onOpenChange={setConsolidatedViewerOpen}
          masterPpmpId={ppmp.consolidatedIntoId}
        />
      )}
    </PageContainerDashtail>
  )
}

export default OfficeLevelPPMPDetailsPage
