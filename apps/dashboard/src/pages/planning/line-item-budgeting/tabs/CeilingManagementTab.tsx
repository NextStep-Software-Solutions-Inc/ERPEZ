/**
 * Task 2: Ceiling Management Tab
 * Ceiling Management & Allocation Dashboard for Budget Office
 *
 * Features:
 * - Dual-Target Ceiling Assignment (Organizational Unit or Project)
 * - Fund Source & Allotment Class Categorization
 * - Agency Roll-up Validation (live from API)
 * - Phased Ceiling Status & Enforcement
 * - Supplemental / Unfunded Proposal Buckets
 */

import { useState, useMemo } from 'react'
import { createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { AddCeilingDialog } from './dialogs/AddCeilingDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useOfficeCeilings,
  useCreateOfficeCeiling,
  useUpdateOfficeCeiling,
  useDeleteOfficeCeiling,
} from '@/lib/fiscal-year-and-policies/requests/hooks/useOfficeCeilings'
import { useAgencyMasterBudgets } from '@/features/planning/agency-master-budget/hooks/useAgencyMasterBudgets'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getOrgUnitsRequest } from '@/components/features/planning/organizational-structure/handlers/getOrgUnitsRequest'
import type {
  OfficeCeiling,
  AgencyMasterBudget,
} from '@/lib/fiscal-year-and-policies/types'
import type { CreateOfficeCeilingPayload } from '@/lib/fiscal-year-and-policies/requests/createOfficeCeilingRequest'
import type { UpdateOfficeCeilingPayload } from '@/lib/fiscal-year-and-policies/requests/updateOfficeCeilingRequest'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useOrgUnits = createQueryHookFromTemplate(getOrgUnitsRequest)

// ─── Status / TargetType enum mappings ───────────────────────────────────────
const STATUS_MAP: Record<number, 'Draft' | 'Indicative' | 'Final' | 'Locked'> =
  {
    0: 'Draft',
    1: 'Indicative',
    2: 'Final',
    3: 'Locked',
  }
const STATUS_TO_STR: Record<string, string> = {
  Draft: '0',
  Indicative: '1',
  Final: '2',
  Locked: '3',
}
const TARGET_TYPE_MAP: Record<number, 'Office' | 'Project'> = {
  0: 'Office',
  1: 'Project',
}
const TARGET_TYPE_TO_STR: Record<string, string> = {
  Office: '0',
  Project: '1',
}

// ─── Internal display type ────────────────────────────────────────────────────
interface CeilingRow {
  id: string
  fiscalYear: string
  fiscalYearId: string
  targetType: 'Office' | 'Project'
  officeName: string | null
  officeId: string
  agencyMasterBudgetId: string
  fundClusterCode: string
  fundClusterName: string
  ps: number
  mooe: number
  co: number
  total: number
  status: 'Draft' | 'Indicative' | 'Final' | 'Locked'
  isSupplemental: boolean
}

function mapCeilingToRow(
  c: OfficeCeiling,
  masterBudgets: AgencyMasterBudget[],
): CeilingRow {
  const mb = masterBudgets.find((m) => m.id === c.agencyMasterBudgetId)
  return {
    id: c.id,
    fiscalYear: String(c.fiscalYear?.year ?? ''),
    fiscalYearId: c.fiscalYearId,
    targetType: TARGET_TYPE_MAP[c.targetType] ?? 'Office',
    officeName: c.office?.name ?? null,
    officeId: c.officeId,
    agencyMasterBudgetId: c.agencyMasterBudgetId,
    fundClusterCode: mb?.fundSource?.code ?? '',
    fundClusterName: mb?.fundSource?.name ?? '',
    ps: c.psAmount,
    mooe: c.mooeAmount,
    co: c.coAmount,
    total: c.psAmount + c.mooeAmount + c.coAmount,
    status: STATUS_MAP[c.status] ?? 'Draft',
    isSupplemental: c.isSupplemental,
  }
}

export function CeilingManagementTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // ── Data fetching ─────────────────────────────────────────────────────────
  // NOTE: pageSize caps are intentional for now. If data.length === pageSize, results are silently
  // truncated — add pagination or raise the cap before deploying to large datasets.
  const { data: ceilingsResponse, isLoading: isCeilingsLoading } =
    useOfficeCeilings({
      pathParams: {},
      queryParams: { pageSize: 200 }, // warn: silently truncates if ceiling count exceeds 200
    })

  const { data: masterBudgetsResponse } = useAgencyMasterBudgets({
    pathParams: {},
    queryParams: { pageSize: 100 }, // warn: silently truncates if master budget count exceeds 100
  })

  const { data: fiscalYearsResponse } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100 }, // warn: silently truncates if fiscal year count exceeds 100
  })

  const { data: orgUnitsResponse } = useOrgUnits({
    pathParams: {},
    queryParams: { pageSize: 200 }, // warn: silently truncates if org unit count exceeds 200
  })

  // ── Derived display data ──────────────────────────────────────────────────
  const masterBudgets: AgencyMasterBudget[] = masterBudgetsResponse?.data ?? []
  const officeCeilings: OfficeCeiling[] = ceilingsResponse?.data ?? []

  const rows: CeilingRow[] = useMemo(
    () => officeCeilings.map((c) => mapCeilingToRow(c, masterBudgets)),
    [officeCeilings, masterBudgets],
  )

  // Fund-source summary cards (aggregate across all fiscal years)
  const fundSourceSummary = useMemo(() => {
    const map: Record<
      string,
      {
        code: string
        name: string
        available: number
        distributed: number
        availablePs: number
        availableMooe: number
        availableCo: number
        distributedPs: number
        distributedMooe: number
        distributedCo: number
      }
    > = {}

    masterBudgets.forEach((mb) => {
      const code = mb.fundSource?.code ?? ''
      const name = mb.fundSource?.name ?? code
      if (!map[code])
        map[code] = {
          code,
          name,
          available: 0,
          distributed: 0,
          availablePs: 0,
          availableMooe: 0,
          availableCo: 0,
          distributedPs: 0,
          distributedMooe: 0,
          distributedCo: 0,
        }
      map[code].available += mb.psAmount + mb.mooeAmount + mb.coAmount
      map[code].availablePs += mb.psAmount
      map[code].availableMooe += mb.mooeAmount
      map[code].availableCo += mb.coAmount
    })

    officeCeilings.forEach((c) => {
      if (c.isSupplemental) return
      const mb = masterBudgets.find((m) => m.id === c.agencyMasterBudgetId)
      const code = mb?.fundSource?.code ?? ''
      if (map[code]) {
        map[code].distributed += c.psAmount + c.mooeAmount + c.coAmount
        map[code].distributedPs += c.psAmount
        map[code].distributedMooe += c.mooeAmount
        map[code].distributedCo += c.coAmount
      }
    })

    return Object.values(map)
  }, [masterBudgets, officeCeilings])

  // Dialog option lists
  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYearsResponse?.data ?? []).map((fy) => ({
        id: fy.id,
        year: String(fy.year),
        name: `Fiscal Year ${fy.year}`,
      })),
    [fiscalYearsResponse],
  )

  const officeOptions = useMemo(
    () =>
      (orgUnitsResponse?.data ?? []).map((o) => ({
        id: o.id,
        name: o.name ?? '',
      })),
    [orgUnitsResponse],
  )

  // Unique fund sources derived from agency master budgets
  const fundClusterOptions = useMemo(() => {
    const seen = new Map<string, { code: string; name: string }>()
    masterBudgets.forEach((mb) => {
      const code = mb.fundSource?.code ?? ''
      if (code && !seen.has(code)) {
        seen.set(code, { code, name: mb.fundSource?.name ?? code })
      }
    })
    return Array.from(seen.values())
  }, [masterBudgets])

  // ── Local UI state ────────────────────────────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<CeilingRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    label: string
  } | null>(null)
  const [fiscalYearFilter, setFiscalYearFilter] = useState<string | null>(null)
  const itemsPerPage = 10

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: createCeiling, isPending: isCreating } =
    useCreateOfficeCeiling()
  const { mutate: updateCeiling, isPending: isUpdating } =
    useUpdateOfficeCeiling()
  const { mutate: deleteCeiling, isPending: isDeleting } =
    useDeleteOfficeCeiling()

  const invalidateCeilings = () => {
    queryClient.invalidateQueries({
      predicate: (q) =>
        typeof q.queryKey[0] === 'string' &&
        (q.queryKey[0] as string).startsWith('/office-ceilings'),
    })
  }

  // ── Filtered & paginated rows ─────────────────────────────────────────────
  const filteredRows = useMemo(
    () =>
      fiscalYearFilter
        ? rows.filter((r) => r.fiscalYear === fiscalYearFilter)
        : rows,
    [rows, fiscalYearFilter],
  )

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddAllocation = (formData: any) => {
    // Resolve the agencyMasterBudgetId from selected fiscal year + fund source code
    const agencyMasterBudget = masterBudgets.find(
      (mb) =>
        mb.fundSource?.code === formData.fundCluster &&
        String(mb.fiscalYear?.year) === formData.fiscalYear,
    )

    if (!agencyMasterBudget && !editingRow) {
      toast({
        title: 'Configuration Error',
        description:
          'No agency master budget found for the selected fiscal year and fund source. Please create one in the Fund Source tab first.',
        color: 'destructive',
      })
      return
    }

    if (editingRow) {
      const payload: UpdateOfficeCeilingPayload = {
        fiscalYearId: formData.fiscalYearId || editingRow.fiscalYearId,
        officeId: formData.officeId || editingRow.officeId,
        agencyMasterBudgetId:
          agencyMasterBudget?.id ?? editingRow.agencyMasterBudgetId,
        targetType: TARGET_TYPE_TO_STR[formData.targetType] ?? '0',
        psAmount: formData.ps ?? 0,
        mooeAmount: formData.mooe ?? 0,
        coAmount: formData.co ?? 0,
        status: STATUS_TO_STR[formData.status] ?? '0',
        isSupplemental: formData.isSupplemental ?? false,
      }
      updateCeiling(
        { pathParams: { id: editingRow.id }, payload },
        {
          onSuccess: () => {
            toast({
              title: 'Ceiling Updated',
              description: `Ceiling for "${formData.targetName}" updated successfully.`,
              color: 'success',
            })
            invalidateCeilings()
            setShowAddDialog(false)
            setEditingRow(null)
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to update ceiling. Please try again.',
              color: 'destructive',
            })
          },
        },
      )
    } else {
      const payload: CreateOfficeCeilingPayload = {
        fiscalYearId: formData.fiscalYearId,
        officeId: formData.officeId,
        agencyMasterBudgetId: agencyMasterBudget!.id,
        targetType: TARGET_TYPE_TO_STR[formData.targetType] ?? '0',
        psAmount: formData.ps ?? 0,
        mooeAmount: formData.mooe ?? 0,
        coAmount: formData.co ?? 0,
        status: STATUS_TO_STR[formData.status] ?? '0',
        isSupplemental: formData.isSupplemental ?? false,
      }
      createCeiling(
        { pathParams: {}, payload },
        {
          onSuccess: () => {
            toast({
              title: 'Ceiling Created',
              description: `Ceiling for "${formData.targetName}" created successfully.`,
              color: 'success',
            })
            invalidateCeilings()
            setShowAddDialog(false)
          },
          onError: () => {
            toast({
              title: 'Error',
              description: 'Failed to create ceiling. Please try again.',
              color: 'destructive',
            })
          },
        },
      )
    }
  }

  const handleEditRow = (row: CeilingRow) => {
    setEditingRow(row)
    setShowAddDialog(true)
  }

  const handleDeleteRow = (row: CeilingRow) => {
    setDeleteConfirm({
      id: row.id,
      label: `${row.officeName} — ${row.fundClusterName} (${row.fiscalYear})`,
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return
    deleteCeiling(
      { pathParams: { id: deleteConfirm.id } },
      {
        onSuccess: () => {
          toast({
            title: 'Deleted',
            description: 'Ceiling deleted successfully.',
            color: 'success',
          })
          invalidateCeilings()
          setDeleteConfirm(null)
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete ceiling. Please try again.',
            color: 'destructive',
          })
        },
      },
    )
  }

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedRows)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedRows(next)
  }

  const handleToggleAllRows = () => {
    const ids = paginatedRows.map((r) => r.id)
    const next = new Set(selectedRows)
    const allSelected = ids.every((id) => next.has(id))
    allSelected
      ? ids.forEach((id) => next.delete(id))
      : ids.forEach((id) => next.add(id))
    setSelectedRows(next)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-200 text-gray-800'
      case 'Indicative':
        return 'bg-blue-200 text-blue-800'
      case 'Final':
        return 'bg-green-200 text-green-800'
      case 'Locked':
        return 'bg-purple-200 text-purple-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  // Shape passed to the dialog when editing
  const editingItemForDialog = editingRow
    ? {
        targetType: editingRow.targetType,
        fiscalYear: editingRow.fiscalYear,
        fiscalYearId: editingRow.fiscalYearId,
        fundCluster: editingRow.fundClusterCode,
        status: editingRow.status,
        isSupplemental: editingRow.isSupplemental,
        ps: editingRow.ps,
        mooe: editingRow.mooe,
        co: editingRow.co,
        targetName: editingRow.officeName ?? '',
        officeId: editingRow.officeId,
      }
    : undefined

  return (
    <div className="space-y-6">
      {/* Agency Master Budget by Fund Source */}
      <Card className="border border-primary/15 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-primary/8 border-b border-primary/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-sm leading-tight">
                Agency Master Budget by Fund Source
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Total approved budget from DBM / GAA / External Grants
              </p>
            </div>
          </div>
          {fundSourceSummary.length > 0 && (
            <div className="bg-primary/10 rounded-lg px-3 py-1.5 text-right">
              <p className="text-muted-foreground text-xs">Total Sources</p>
              <p className="text-primary font-bold text-lg leading-tight">
                {fundSourceSummary.length}
              </p>
            </div>
          )}
        </div>

        {/* Cards */}
        <CardContent className="p-5">
          {fundSourceSummary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <AlertTriangle className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                No agency master budgets found.
              </p>
              <p className="text-xs text-muted-foreground">
                Create one in the Fund Source tab to get started.
              </p>
            </div>
          ) : (
            <div
              className={fundSourceSummary.length > 4 ? 'overflow-x-auto' : ''}
            >
              <div
                className={
                  fundSourceSummary.length > 4
                    ? 'flex gap-4 min-w-max pb-1'
                    : `grid gap-4 pb-1 ${
                        fundSourceSummary.length === 1
                          ? 'grid-cols-1'
                          : fundSourceSummary.length === 2
                            ? 'grid-cols-2'
                            : fundSourceSummary.length === 3
                              ? 'grid-cols-3'
                              : 'grid-cols-4'
                      }`
                }
              >
                {fundSourceSummary.map((fc) => {
                  const percentage = Math.min(
                    fc.available > 0
                      ? (fc.distributed / fc.available) * 100
                      : 0,
                    100,
                  )
                  const remaining = fc.available - fc.distributed
                  const isOver = fc.distributed > fc.available
                  const isWarning = !isOver && percentage >= 80

                  return (
                    <div
                      key={fc.code}
                      className={`${fundSourceSummary.length > 4 ? 'flex-shrink-0 w-72' : 'w-full'} rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                    >
                      {/* Card top accent */}
                      <div
                        className={`h-1 w-full ${isOver ? 'bg-destructive' : isWarning ? 'bg-amber-400' : 'bg-primary'}`}
                      />

                      <div className="p-4">
                        {/* Title row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded-lg p-1.5 ${isOver ? 'bg-destructive/10' : 'bg-primary/10'}`}
                            >
                              {isOver ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">
                                {fc.code}
                              </p>
                              <p className="text-xs text-muted-foreground leading-tight truncate max-w-[130px]">
                                {fc.name}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOver ? 'bg-destructive/10 text-destructive' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}
                          >
                            {isOver
                              ? 'Over Budget'
                              : isWarning
                                ? 'Near Limit'
                                : 'On Track'}
                          </span>
                        </div>

                        {/* Total Available / Distributed */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-muted/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Total Available
                            </p>
                            <p className="text-sm font-bold text-foreground">
                              ₱{fc.available.toLocaleString()}
                            </p>
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2 ${isOver ? 'bg-destructive/10' : 'bg-primary/10'}`}
                          >
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Distributed
                            </p>
                            <p
                              className={`text-sm font-bold ${isOver ? 'text-destructive' : 'text-primary'}`}
                            >
                              ₱{fc.distributed.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* PS / MOOE / CO breakdown */}
                        <div className="border border-border rounded-lg overflow-hidden mb-3">
                          <div className="grid grid-cols-3 divide-x divide-border">
                            {[
                              {
                                label: 'PS',
                                available: fc.availablePs,
                                distributed: fc.distributedPs,
                              },
                              {
                                label: 'MOOE',
                                available: fc.availableMooe,
                                distributed: fc.distributedMooe,
                              },
                              {
                                label: 'CO',
                                available: fc.availableCo,
                                distributed: fc.distributedCo,
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="px-2 py-2 text-center"
                              >
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  {item.label}
                                </p>
                                <p className="text-xs font-bold text-foreground">
                                  ₱{item.available.toLocaleString()}
                                </p>
                                <p
                                  className={`text-[10px] mt-0.5 ${item.distributed > item.available ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
                                >
                                  ₱{item.distributed.toLocaleString()} used
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              Utilization
                            </span>
                            <span
                              className={`text-xs font-bold ${isOver ? 'text-destructive' : isWarning ? 'text-amber-600' : 'text-primary'}`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${isOver ? 'bg-destructive' : isWarning ? 'bg-amber-400' : 'bg-primary'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {isOver
                              ? `₱${Math.abs(remaining).toLocaleString()} over budget`
                              : `₱${remaining.toLocaleString()} remaining`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ceiling Allocations Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ceiling Allocations</CardTitle>
            <CardDescription>
              Manage budget ceilings by Office/Project and Fund Source
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={fiscalYearFilter || ''}
              onValueChange={(v) => {
                setCurrentPage(1)
                setFiscalYearFilter(v === 'all' ? null : v)
              }}
            >
              <SelectTrigger className="w-52 h-9">
                <SelectValue placeholder="Filter by Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {fiscalYearOptions.map((fy) => (
                  <SelectItem key={fy.id} value={fy.year}>
                    {fy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Ceiling
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCeilingsLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading ceiling allocations…</span>
            </div>
          ) : filteredRows.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            paginatedRows.length > 0 &&
                            paginatedRows.every((r) => selectedRows.has(r.id))
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleToggleAllRows()
                            } else {
                              const next = new Set(selectedRows)
                              paginatedRows.forEach((r) => next.delete(r.id))
                              setSelectedRows(next)
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        Fiscal Year
                      </TableHead>
                      <TableHead className="min-w-[200px]">Office</TableHead>
                      <TableHead className="min-w-[220px]">
                        Fund Source
                      </TableHead>
                      <TableHead className="min-w-[120px]">PS</TableHead>
                      <TableHead className="min-w-[120px]">MOOE</TableHead>
                      <TableHead className="min-w-[120px]">CO</TableHead>
                      <TableHead className="min-w-[140px]">Total</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="text-right w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        <TableCell className="w-10">
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={() => handleToggleRow(row.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium min-w-[100px]">
                          <p className="text-sm font-semibold text-gray-900">
                            {row.fiscalYear}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium min-w-[200px]">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {row.officeName ?? '—'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.targetType}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm min-w-[220px]">
                          <div>
                            <p className="font-medium text-gray-900">
                              {row.fundClusterCode}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.fundClusterName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm min-w-[120px]">
                          ₱{row.ps.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm min-w-[120px]">
                          ₱{row.mooe.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm min-w-[120px]">
                          ₱{row.co.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold min-w-[140px] text-base">
                          ₱{row.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Badge
                            className={`${getStatusColor(row.status)} font-semibold px-2 py-1 text-xs`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right w-12">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditRow(row)}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRow(row)}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                <div className="text-gray-600">
                  {selectedRows.size} of {filteredRows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No ceiling allocations found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Ceiling Dialog */}
      <AddCeilingDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingRow(null)
        }}
        onAdd={handleAddAllocation}
        offices={officeOptions}
        // Provide the same org-unit options as project options so "Project" can be selected.
        // Replace this with a real project list when a proper projects endpoint is available.
        projects={officeOptions}
        fiscalYears={fiscalYearOptions}
        agencyMasterBudgets={masterBudgets}
        existingCeilings={officeCeilings}
        editingCeilingId={editingRow?.id}
        isEdit={!!editingRow}
        editingItem={editingItemForDialog}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteConfirm(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-destructive/10 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-base">
                Delete Ceiling Allocation
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Are you sure you want to delete the ceiling for{' '}
              <span className="font-semibold text-foreground">
                {deleteConfirm?.label}
              </span>
              ?
              <br />
              This action{' '}
              <span className="font-semibold text-destructive">
                cannot be undone
              </span>{' '}
              and may affect department ceiling allocations linked to this
              record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Deleting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
