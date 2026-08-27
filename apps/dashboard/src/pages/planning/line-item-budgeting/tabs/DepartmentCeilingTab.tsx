/**
 * Task 1: Department Ceiling Sub-Allocation Tab
 *
 * Before Departments can draft their Line-Item Budgets (LIBs) they need to know
 * their spending limits.  The Office Head receives a master budget from the
 * Agency and must sub-allocate it among constituent Departments.
 *
 * Features:
 * - Ceiling Overview: list of all existing Department Ceiling sets
 * - Create Workspace: sticky Master-Budget tracker + department selection grid
 * - Real-time validation: total cannot exceed Office Master Ceiling (per component)
 * - Expandable rows: drill down into per-department breakdown
 */

import React, { useState, useMemo, useCallback } from 'react'
import { createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertCircle,
  AlertTriangle,
  Plus,
  Save,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Building2,
  Trash2,
  Wallet,
} from 'lucide-react'
import {
  useSubOfficeCeilings,
  useCreateSubOfficeCeiling,
  useDeleteSubOfficeCeiling,
} from '@/lib/fiscal-year-and-policies/requests/hooks/useSubOfficeCeilings'
import { useOfficeCeilings } from '@/lib/fiscal-year-and-policies/requests/hooks/useOfficeCeilings'
import { useAgencyMasterBudgets } from '@/features/planning/agency-master-budget/hooks/useAgencyMasterBudgets'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getOrgUnitsRequest } from '@/components/features/planning/organizational-structure/handlers/getOrgUnitsRequest'
import type { SubOfficeCeiling, OfficeCeiling, AgencyMasterBudget } from '@/lib/fiscal-year-and-policies/types'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useOrgUnits = createQueryHookFromTemplate(getOrgUnitsRequest)

// ─── Status enum mappings ─────────────────────────────────────────────────────
const STATUS_MAP: Record<number, 'Draft' | 'Indicative' | 'Final' | 'Locked'> = {
  0: 'Draft',
  1: 'Indicative',
  2: 'Final',
  3: 'Locked',
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DeptAllocationInput {
  ps: number
  mooe: number
  co: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DepartmentCeilingTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // ── API data fetching ──────────────────────────────────────────────────────
  const { data: subOfficeCeilingsResponse, isLoading: isSubCeilingsLoading } = useSubOfficeCeilings({
    pathParams: {},
    queryParams: { pageSize: 200 },
  })

  const { data: officeCeilingsResponse } = useOfficeCeilings({
    pathParams: {},
    queryParams: { pageSize: 200 },
  })

  const { data: masterBudgetsResponse } = useAgencyMasterBudgets({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const { data: fiscalYearsResponse } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const { data: orgUnitsResponse } = useOrgUnits({
    pathParams: {},
    queryParams: { pageSize: 200 },
  })

  const subOfficeCeilings: SubOfficeCeiling[] = subOfficeCeilingsResponse?.data ?? []
  const officeCeilings: OfficeCeiling[] = officeCeilingsResponse?.data ?? []
  const masterBudgets: AgencyMasterBudget[] = masterBudgetsResponse?.data ?? []

  const fiscalYearOptions = useMemo(
    () => (fiscalYearsResponse?.data ?? []).map(fy => ({ id: fy.id, year: String(fy.year), name: `Fiscal Year ${fy.year}` })),
    [fiscalYearsResponse],
  )

  const orgUnits = useMemo(
    () => (orgUnitsResponse?.data ?? []).map((u: { id: string; name?: string; code?: string; parentId?: string | null }) => ({ id: u.id, name: u.name ?? u.id, code: u.code ?? '', parentId: (u.parentId ?? null) as string | null })),
    [orgUnitsResponse],
  )

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutateAsync: createSubOfficeCeiling, isPending: isCreating } = useCreateSubOfficeCeiling()
  const { mutateAsync: deleteSubOfficeCeiling, isPending: isDeleting } = useDeleteSubOfficeCeiling()

  // ── List view ───────────────────────────────────────────────────────────────
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null)

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)

  // ── Form state (inside dialog) ──────────────────────────────────────────────
  const [officeCeilingId, setOfficeCeilingId] = useState('')
  const [fiscalYearId, setFiscalYearId] = useState('')
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set())
  const [allocInputs, setAllocInputs] = useState<Record<string, DeptAllocationInput>>({})

  // ── Derived values from selected office ceiling ───────────────────────────
  const selectedOfficeCeiling = officeCeilings.find(c => c.id === officeCeilingId) ?? null
  const master = selectedOfficeCeiling
    ? { ps: selectedOfficeCeiling.psAmount, mooe: selectedOfficeCeiling.mooeAmount, co: selectedOfficeCeiling.coAmount }
    : { ps: 0, mooe: 0, co: 0 }
  const masterTotal = master.ps + master.mooe + master.co
  const fundSourceId = selectedOfficeCeiling?.agencyMasterBudget?.fundSourceId ?? ''

  // Only show sub-offices that are direct children of the selected Office Ceiling's office
  // and have NOT already been allocated for this office ceiling
  const alreadyAllocatedSubOfficeIds = useMemo(() => {
    if (!selectedOfficeCeiling) return new Set<string>()
    return new Set(
      subOfficeCeilings
        .filter(sc => sc.officeCeilingId === selectedOfficeCeiling.id)
        .map(sc => sc.subOfficeId)
    )
  }, [subOfficeCeilings, selectedOfficeCeiling])

  const eligibleDepts = useMemo(() => {
    if (!selectedOfficeCeiling) return []
    return orgUnits.filter(
      u => u.parentId === selectedOfficeCeiling.officeId && !alreadyAllocatedSubOfficeIds.has(u.id)
    )
  }, [orgUnits, selectedOfficeCeiling, alreadyAllocatedSubOfficeIds])

  const allocated = useMemo(() => {
    let ps = 0, mooe = 0, co = 0
    selectedDepts.forEach((id) => {
      const a = allocInputs[id] ?? { ps: 0, mooe: 0, co: 0 }
      ps += a.ps || 0
      mooe += a.mooe || 0
      co += a.co || 0
    })
    return { ps, mooe, co, total: ps + mooe + co }
  }, [selectedDepts, allocInputs])

  const remaining = {
    ps: master.ps - allocated.ps,
    mooe: master.mooe - allocated.mooe,
    co: master.co - allocated.co,
    total: masterTotal - allocated.total,
  }

  const isOverAllocated = remaining.ps < 0 || remaining.mooe < 0 || remaining.co < 0
  const allocatedPct = masterTotal > 0 ? Math.min((allocated.total / masterTotal) * 100, 100) : 0

  // ── Event handlers ──────────────────────────────────────────────────────────
  const toggleDept = useCallback((id: string) => {
    setSelectedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const updateAlloc = useCallback(
    (deptId: string, field: keyof DeptAllocationInput, raw: string) => {
      const val = parseFloat(raw) || 0
      setAllocInputs((prev) => ({
        ...prev,
        [deptId]: { ...(prev[deptId] ?? { ps: 0, mooe: 0, co: 0 }), [field]: val },
      }))
    },
    [],
  )

  const handleToggleAll = () => {
    setSelectedDepts((prev) =>
      prev.size === eligibleDepts.length
        ? new Set()
        : new Set(eligibleDepts.map((d) => d.id)),
    )
  }

  const resetForm = useCallback(() => {
    setSelectedDepts(new Set())
    setAllocInputs({})
    setOfficeCeilingId('')
    setFiscalYearId('')
  }, [])

  const handleClose = useCallback(() => {
    setDialogOpen(false)
    resetForm()
  }, [resetForm])

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open)
      if (!open) resetForm()
    },
    [resetForm],
  )

  const handleSave = async () => {
    if (isOverAllocated || selectedDepts.size === 0 || !officeCeilingId || !fundSourceId) return

    // derive the fiscal year from the selected office ceiling when present to guarantee consistency
    const derivedFiscalYearId = selectedOfficeCeiling?.fiscalYearId ?? fiscalYearId

    if (!derivedFiscalYearId) {
      toast({
        title: 'Missing Fiscal Year',
        description: 'Please select an Office Ceiling (or fiscal year) before saving.',
        color: 'destructive',
      })
      return
    }

    // If an office ceiling is selected but the UI/fiscalYear state somehow differs, block save and inform the user
    if (selectedOfficeCeiling && fiscalYearId && fiscalYearId !== selectedOfficeCeiling.fiscalYearId) {
      toast({
      title: 'Invalid Fiscal Year',
      description: 'The selected Fiscal Year does not match the Office Ceiling fiscal year; the fiscal year must be derived from the selected Office Ceiling.',
      color: 'destructive',
      })
      return
    }

    try {
      const creates = Array.from(selectedDepts).map((subOfficeId) => {
        const a = allocInputs[subOfficeId] ?? { ps: 0, mooe: 0, co: 0 }
        return createSubOfficeCeiling({
          pathParams: {},
          payload: {
            officeCeilingId,
            subOfficeId,
            fundSourceId,
            fiscalYearId: derivedFiscalYearId,
            psAmount: a.ps || 0,
            mooeAmount: a.mooe || 0,
            coAmount: a.co || 0,
            status: '0',
          },
        })
      })

      await Promise.all(creates)

      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0] as string).startsWith('/sub-office-ceilings'),
      })

      const fyLabel = fiscalYearOptions.find(f => f.id === derivedFiscalYearId)?.name ?? derivedFiscalYearId
      toast({
        title: 'Department Ceilings Created',
        description: `Sub-allocation for ${fyLabel} has been saved for ${selectedDepts.size} department(s).`,
        color: 'success',
      })

      handleClose()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save department ceilings. Please try again.',
        color: 'destructive',
      })
    }
  }

  const handleDelete = (id: string, label: string) => {
    setDeleteConfirm({ id, label })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setDeletingId(deleteConfirm.id)
    try {
      await deleteSubOfficeCeiling({ pathParams: { id: deleteConfirm.id } })
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0] as string).startsWith('/sub-office-ceilings'),
      })
      toast({ title: 'Deleted', description: 'Sub-office ceiling removed.', color: 'success' })
      setDeleteConfirm(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete. Please try again.', color: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  // Group sub-office ceilings by officeCeilingId for the list view
  const groupedCeilings = useMemo(() => {
    const map: Record<string, SubOfficeCeiling[]> = {}
    subOfficeCeilings.forEach(c => {
      if (!map[c.officeCeilingId]) map[c.officeCeilingId] = []
      map[c.officeCeilingId].push(c)
    })
    return map
  }, [subOfficeCeilings])

  // ─────────────────────────────────────────────────────────────────────────────
  // List view
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Office Ceilings Summary Cards */}
      <div className="border border-primary/15 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-primary/8 border-b border-primary/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-sm leading-tight">Office Ceilings — Master Budget Overview</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Approved office ceiling budgets available for department sub-allocation</p>
            </div>
          </div>
          {officeCeilings.length > 0 && (
            <div className="bg-primary/10 rounded-lg px-3 py-1.5 text-right">
              <p className="text-muted-foreground text-xs">Total Ceilings</p>
              <p className="text-primary font-bold text-lg leading-tight">{officeCeilings.length}</p>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {officeCeilings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <AlertTriangle className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">No office ceilings found.</p>
              <p className="text-xs text-muted-foreground">Create one in the Ceiling Management tab to get started.</p>
            </div>
            ) : (
            <div className={officeCeilings.length > 4 ? 'overflow-x-auto' : ''}>
              <div
              className={
                officeCeilings.length > 4
                ? 'flex gap-4 min-w-max pb-1'
                : `grid gap-4 pb-1 ${
                  officeCeilings.length === 1
                    ? 'grid-cols-1'
                    : officeCeilings.length === 2
                    ? 'grid-cols-2'
                    : officeCeilings.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-4'
                  }`
              }
              >
              {/*
                Precompute allocations per officeCeilingId in a single pass
                by reusing groupedCeilings (already derived above).
              */}
              {officeCeilings.map((oc) => {
                const allocs = groupedCeilings[oc.id] ?? []
                const sums = allocs.reduce(
                (acc, sc) => {
                  acc.ps += sc.psAmount
                  acc.mooe += sc.mooeAmount
                  acc.co += sc.coAmount
                  return acc
                },
                { ps: 0, mooe: 0, co: 0 },
                )
                const total = oc.psAmount + oc.mooeAmount + oc.coAmount
                const allocatedPs = sums.ps
                const allocatedMooe = sums.mooe
                const allocatedCo = sums.co
                const allocatedTotal = allocatedPs + allocatedMooe + allocatedCo
                const percentage = total > 0 ? Math.min((allocatedTotal / total) * 100, 100) : 0
                const remaining = total - allocatedTotal
                const isOver = allocatedTotal > total
                const isWarning = !isOver && percentage >= 80

                return (
                <div
                  key={oc.id}
                  className={`${officeCeilings.length > 4 ? 'flex-shrink-0 w-72' : 'w-full'} rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${isOver ? 'bg-destructive' : isWarning ? 'bg-amber-400' : 'bg-primary'}`} />

                  <div className="p-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-1.5 ${isOver ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      {isOver
                      ? <AlertTriangle className="h-4 w-4 text-destructive" />
                      : <CheckCircle className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{oc.office?.name ?? 'Office'}</p>
                      <p className="text-xs text-muted-foreground leading-tight">FY {oc.fiscalYear?.year}</p>
                    </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOver ? 'bg-destructive/10 text-destructive' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                    {isOver ? 'Over Budget' : isWarning ? 'Near Limit' : 'On Track'}
                    </span>
                  </div>

                  {/* Total Available / Sub-Allocated */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Total Available</p>
                    <p className="text-sm font-bold text-foreground">{fmt(total)}</p>
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${isOver ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <p className="text-xs text-muted-foreground mb-0.5">Sub-Allocated</p>
                    <p className={`text-sm font-bold ${isOver ? 'text-destructive' : 'text-primary'}`}>
                      {fmt(allocatedTotal)}
                    </p>
                    </div>
                  </div>

                  {/* PS / MOOE / CO breakdown */}
                  <div className="border border-border rounded-lg overflow-hidden mb-3">
                    <div className="grid grid-cols-3 divide-x divide-border">
                    {[
                      { label: 'PS', available: oc.psAmount, distributed: allocatedPs },
                      { label: 'MOOE', available: oc.mooeAmount, distributed: allocatedMooe },
                      { label: 'CO', available: oc.coAmount, distributed: allocatedCo },
                    ].map(item => (
                      <div key={item.label} className="px-2 py-2 text-center">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                      <p className="text-xs font-bold text-foreground">{fmt(item.available)}</p>
                      <p className={`text-[10px] mt-0.5 ${item.distributed > item.available ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {fmt(item.distributed)} used
                      </p>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Utilization</span>
                    <span className={`text-xs font-bold ${isOver ? 'text-destructive' : isWarning ? 'text-amber-600' : 'text-primary'}`}>
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
                      ? `${fmt(Math.abs(remaining))} over budget`
                      : `${fmt(remaining)} remaining`}
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
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Department Ceiling Sub-Allocation</h3>
          <p className="text-sm text-muted-foreground">
            Distribute the Office Master Budget ceiling among constituent departments so they have
            strict financial guidelines when drafting their LIBs.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Department Ceiling
        </Button>
      </div>

      {/* Sub-Office Ceilings Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-muted/40 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-1.5">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">Department Ceiling Records</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All sub-office (department) ceiling allocations. Click a row to expand details.</p>
            </div>
          </div>
          {Object.keys(groupedCeilings).length > 0 && (
            <div className="bg-primary/10 rounded-lg px-3 py-1.5 text-right">
              <p className="text-muted-foreground text-xs">Groups</p>
              <p className="text-primary font-bold text-lg leading-tight">{Object.keys(groupedCeilings).length}</p>
            </div>
          )}
        </div>

        <CardContent className="p-0">
          {isSubCeilingsLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading department ceilings…</span>
            </div>
          ) : Object.keys(groupedCeilings).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No department ceilings created yet.</p>
              <p className="text-xs">Create a ceiling allocation to get started.</p>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="mt-1">
                <Plus className="h-4 w-4 mr-1" />
                Create First Allocation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                  <TableHead className="w-10 pl-4" />
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[160px]">Office Ceiling</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[110px]">Fiscal Year</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[140px]">Fund Source</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[100px]">Sub-Offices</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-[110px]">PS</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-[110px]">MOOE</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-[110px]">CO</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right w-[120px]">Total</TableHead>
                  <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[90px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedCeilings).map(([ocId, ceilings]) => {
                  const first = ceilings[0]
                  const totalPS = ceilings.reduce((s, c) => s + c.psAmount, 0)
                  const totalMOOE = ceilings.reduce((s, c) => s + c.mooeAmount, 0)
                  const totalCO = ceilings.reduce((s, c) => s + c.coAmount, 0)
                  const total = totalPS + totalMOOE + totalCO
                  const statusLabel = STATUS_MAP[first.status] ?? 'Draft'
                  const rowKey = ocId
                  const isExpanded = expandedRow === rowKey
                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow
                        className={`cursor-pointer transition-colors border-b border-border/60 ${isExpanded ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-muted/30'}`}
                        onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                      >
                        <TableCell className="pl-4 w-10">
                          <div className={`rounded-md p-0.5 transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                            {isExpanded
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <p className="font-semibold text-sm text-foreground">{first.officeCeiling?.officeName ?? ocId.slice(0, 8)}</p>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-sm text-foreground">FY {first.fiscalYear?.year}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <p className="text-sm font-medium text-foreground">{first.fundSource?.code ?? '—'}</p>
                          {first.fundSource?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[130px]">{first.fundSource.name}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {ceilings.length} dept{ceilings.length !== 1 ? 's' : ''}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm text-foreground">{fmt(totalPS)}</TableCell>
                        <TableCell className="py-3 text-right text-sm text-foreground">{fmt(totalMOOE)}</TableCell>
                        <TableCell className="py-3 text-right text-sm text-foreground">{fmt(totalCO)}</TableCell>
                        <TableCell className="py-3 text-right text-sm font-bold text-foreground">{fmt(total)}</TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              statusLabel === 'Final' || statusLabel === 'Locked'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : statusLabel === 'Indicative'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <>
                          {/* Breakdown sub-header row */}
                          <TableRow className="bg-muted/20 hover:bg-muted/20 border-b-0">
                            <TableCell colSpan={10} className="py-2 px-4 border-t border-dashed border-border/60">
                              <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-border/50" />
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Department Breakdown</p>
                                <div className="h-px flex-1 bg-border/50" />
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Breakdown column header row — matches outer columns exactly */}
                          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                            <TableCell className="py-2 pl-4 w-10" />
                            <TableCell className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sub-Office / Dept</TableCell>
                            <TableCell className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide" />
                            <TableCell className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide" />
                            <TableCell className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide" />
                            <TableCell className="py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">PS</TableCell>
                            <TableCell className="py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">MOOE</TableCell>
                            <TableCell className="py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">CO</TableCell>
                            <TableCell className="py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</TableCell>
                            <TableCell className="py-2" />
                          </TableRow>

                          {/* One row per department — all cells share the outer table's columns */}
                          {ceilings.map((c) => (
                            <TableRow key={c.id} className="bg-muted/10 hover:bg-muted/25 transition-colors border-b border-border/30">
                              <TableCell className="pl-4 w-10">
                                <div className="w-0.5 h-5 bg-primary/30 rounded-full mx-auto" />
                              </TableCell>
                              <TableCell className="py-2.5">
                                <p className="text-sm font-medium text-foreground">{c.subOffice?.name ?? c.subOfficeId}</p>
                                {c.subOffice?.code && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{c.subOffice.code}</p>
                                )}
                              </TableCell>
                              <TableCell />
                              <TableCell />
                              <TableCell />
                              <TableCell className="py-2.5 text-right text-sm">{fmt(c.psAmount)}</TableCell>
                              <TableCell className="py-2.5 text-right text-sm">{fmt(c.mooeAmount)}</TableCell>
                              <TableCell className="py-2.5 text-right text-sm">{fmt(c.coAmount)}</TableCell>
                              <TableCell className="py-2.5 text-right text-sm font-semibold text-primary">
                                {fmt(c.psAmount + c.mooeAmount + c.coAmount)}
                              </TableCell>
                              <TableCell className="py-2.5 text-right pr-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  disabled={!!deletingId || isDeleting}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(c.id, c.subOffice?.name ?? c.subOfficeId)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Breakdown bottom spacer */}
                          <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border">
                            <TableCell colSpan={10} className="py-1" />
                          </TableRow>
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Create Department Ceiling Dialog ─────────────────────────────────── */}
      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        title="Create Department Ceiling"
        description="Distribute the Office Ceiling budget among constituent sub-offices. Allocations must not exceed the master ceiling per component (PS, MOOE, CO)."
        size="full"
        className="max-w-[900px] max-h-[90vh]"
        showCloseButton
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isOverAllocated || selectedDepts.size === 0 || !officeCeilingId || !fiscalYearId || isCreating}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isCreating ? 'Saving...' : 'Save & Notify'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* ── Master Budget Tracker ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 p-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="rounded-full bg-blue-50 p-3 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Office Master Budget
                  </p>
                  <p className="text-lg font-bold text-gray-900">{fmt(masterTotal)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    PS {fmt(master.ps)} · MOOE {fmt(master.mooe)} · CO {fmt(master.co)}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Allocated</p>
                      <p className="text-lg font-bold text-blue-700">{fmt(allocated.total)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        PS {fmt(allocated.ps)} · MOOE {fmt(allocated.mooe)} · CO {fmt(allocated.co)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-semibold">Remaining</p>
                      <p className={`text-lg font-bold ${isOverAllocated ? 'text-red-600' : 'text-green-700'}`}>
                        {fmt(remaining.total)}
                      </p>
                      <p className={`text-[11px] ${isOverAllocated ? 'text-red-500' : 'text-muted-foreground'}`}>
                        PS {fmt(remaining.ps)} · MOOE {fmt(remaining.mooe)} · CO {fmt(remaining.co)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-28 flex-shrink-0 flex flex-col items-center">
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${isOverAllocated ? 'bg-red-100' : 'bg-green-50'}`}>
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <p className={`font-bold ${isOverAllocated ? 'text-red-600' : 'text-green-700'}`}>{Math.round(allocatedPct)}%</p>
                    </div>
                    <svg viewBox="0 0 36 36" className="w-20 h-20">
                      <path d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32" fill="none" stroke="#E6E6E6" strokeWidth="4" />
                      <path
                        d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32"
                        fill="none"
                        stroke={isOverAllocated ? '#E11D48' : '#0EA5A4'}
                        strokeWidth="4"
                        strokeDasharray={`${allocatedPct} ${100 - allocatedPct}`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isOverAllocated && (
              <div className="px-5 pb-4 border-t border-red-100 bg-red-50">
                <div className="flex items-center gap-2 pt-3">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">
                    Total allocation exceeds the Office Master Budget. Reduce department amounts
                    before saving.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Validation Constraints — Office Ceiling Budget (moved above Step 1) ────────────────────────────────────────── */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Validation Constraints — Office Ceiling Budget
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['ps', 'mooe', 'co'] as const).map((component) => {
                const label = component.toUpperCase()
                const masterAmt = master[component]
                const allocAmt = allocated[component]
                const pct = masterAmt > 0 ? Math.min((allocAmt / masterAmt) * 100, 100) : 0
                const over = allocAmt > masterAmt
                return (
                  <div
                    key={component}
                    className={`rounded-lg p-3 border ${
                      over ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{label}</span>
                      <span
                        className={`font-bold ${
                          over ? 'text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {fmt(allocAmt)} / {fmt(masterAmt)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          over ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p
                      className={`text-[11px] mt-1 ${
                        over ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {over ? 'Over allocated' : `${pct.toFixed(1)}% used`}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-5">
              <div className="space-y-1.5 min-w-[300px]">
                <label className="text-sm font-medium text-gray-700">
                  Office Ceiling <span className="text-red-500">*</span>
                </label>
                <Select
                  value={officeCeilingId}
                  onValueChange={(val) => {
                    setOfficeCeilingId(val)
                    // Auto-set the fiscal year directly from the selected office ceiling's fiscalYearId
                    const oc = officeCeilings.find(c => c.id === val)
                    setFiscalYearId(oc?.fiscalYearId ?? '')
                    // Clear previous selections since the ceiling changed
                    setSelectedDepts(new Set())
                    setAllocInputs({})
                  }}
                >
                  <SelectTrigger className="h-10 w-80 border-gray-200 text-left [&>span]:text-left [&>span]:block [&>span]:truncate">
                    <SelectValue placeholder="Select office ceiling…" />
                  </SelectTrigger>
                  <SelectContent>
                    {officeCeilings.map((oc) => (
                      <SelectItem key={oc.id} value={oc.id}>
                        {oc.office?.name ?? oc.id.slice(0, 8)} — FY {oc.fiscalYear?.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700">
                  Fiscal Year <span className="text-red-500">*</span>
                </label>
                {selectedOfficeCeiling ? (
                  <div className="h-10 w-52 flex items-center px-3 rounded-md border border-gray-200 bg-muted/40 text-sm text-foreground font-medium">
                    Fiscal Year {selectedOfficeCeiling.fiscalYear?.year}
                  </div>
                ) : (
                  <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                    <SelectTrigger className="h-10 w-52 border-gray-200">
                      <SelectValue placeholder="Select fiscal year…" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalYearOptions.map((fy) => (
                        <SelectItem key={fy.id} value={fy.id}>
                          {fy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {selectedOfficeCeiling && (
              <p className="text-xs text-muted-foreground">
                Fund Source: <span className="font-medium">{
                  (() => {
                    const mb = masterBudgets.find(b => b.id === selectedOfficeCeiling.agencyMasterBudgetId)
                    const fs = mb?.fundSource
                    return fs ? `${fs.name}${fs.code ? ` (${fs.code})` : ''}` : '—'
                  })()
                }</span>
                &nbsp;·&nbsp; Master Budget: {fmt(masterTotal)}
                &nbsp;(PS {fmt(master.ps)} · MOOE {fmt(master.mooe)} · CO {fmt(master.co)})
              </p>
            )}

            

          </div>

          {/* ── Step 2: Department Allocation Grid ───────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  Step 2 — Department Allocation Grid
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check sub-offices / departments to include, then enter PS, MOOE, and CO amounts. The row total
                  auto-calculates.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAll}
                className="text-xs shrink-0 ml-4"
              >
                {selectedDepts.size === eligibleDepts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={
                            eligibleDepts.length > 0 && selectedDepts.size === eligibleDepts.length
                              ? true
                              : selectedDepts.size > 0
                              ? 'indeterminate'
                              : false
                          }
                          onCheckedChange={handleToggleAll}
                          aria-label="Select all departments"
                        />
                      </TableHead>
                      <TableHead className="min-w-[180px]">Sub-Office / Department</TableHead>
                      <TableHead className="min-w-[140px]">
                        <div>
                          <span className="font-semibold">PS</span>
                          <p className="text-[11px] font-normal text-muted-foreground">
                            Personal Services
                          </p>
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[140px]">
                        <div>
                          <span className="font-semibold">MOOE</span>
                          <p className="text-[11px] font-normal text-muted-foreground">
                            Maintenance &amp; Other
                          </p>
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[140px]">
                        <div>
                          <span className="font-semibold">CO</span>
                          <p className="text-[11px] font-normal text-muted-foreground">
                            Capital Outlay
                          </p>
                        </div>
                      </TableHead>
                      <TableHead className="text-right min-w-[140px] pr-4">Row Total</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                    {eligibleDepts.length === 0 ? (
                      <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        {!selectedOfficeCeiling
                        ? 'Select an Office Ceiling above to see eligible sub-offices.'
                        : 'No direct child sub-offices found for the selected Office Ceiling.'}
                      </TableCell>
                      </TableRow>
                    ) : eligibleDepts.map((dept) => {
                      const isSelected = selectedDepts.has(dept.id)
                      const alloc = allocInputs[dept.id] ?? { ps: 0, mooe: 0, co: 0 }
                      const rowTotal = (alloc.ps || 0) + (alloc.mooe || 0) + (alloc.co || 0)
                      return (
                      <TableRow
                        key={dept.id}
                        className={`transition-colors ${
                        isSelected ? 'bg-blue-50/40' : 'opacity-50'
                        }`}
                      >
                        <TableCell className="pl-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDept(dept.id)}
                          aria-label={`Include ${dept.name}`}
                        />
                        </TableCell>
                        <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">{dept.code}</p>
                        </div>
                        </TableCell>
                        <TableCell>
                        <Input
                          type="number"
                          min={0}
                          disabled={!isSelected}
                          className="h-8 w-full text-sm border-gray-200"
                          placeholder="0"
                          value={alloc.ps || ''}
                          onChange={(e) => updateAlloc(dept.id, 'ps', e.target.value)}
                        />
                        </TableCell>
                        <TableCell>
                        <Input
                          type="number"
                          min={0}
                          disabled={!isSelected}
                          className="h-8 w-full text-sm border-gray-200"
                          placeholder="0"
                          value={alloc.mooe || ''}
                          onChange={(e) => updateAlloc(dept.id, 'mooe', e.target.value)}
                        />
                        </TableCell>
                        <TableCell>
                        <Input
                          type="number"
                          min={0}
                          disabled={!isSelected}
                          className="h-8 w-full text-sm border-gray-200"
                          placeholder="0"
                          value={alloc.co || ''}
                          onChange={(e) => updateAlloc(dept.id, 'co', e.target.value)}
                        />
                        </TableCell>
                        <TableCell
                        className={`text-right font-bold text-sm pr-4 ${
                          isSelected && rowTotal > 0 ? 'text-blue-700' : 'text-gray-400'
                        }`}
                        >
                        {fmt(rowTotal)}
                        </TableCell>
                      </TableRow>
                      )
                    })}
                    </TableBody></Table>
              </div>

              {/* Grid footer — running totals */}
              <div className="border-t border-gray-200 bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {selectedDepts.size} of {eligibleDepts.length} sub-office(s) selected
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm font-semibold">
                  <span className="text-muted-foreground">
                    PS:{' '}
                    <span className={allocated.ps > master.ps ? 'text-red-600' : 'text-gray-900'}>
                      {fmt(allocated.ps)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    MOOE:{' '}
                    <span className={allocated.mooe > master.mooe ? 'text-red-600' : 'text-gray-900'}>
                      {fmt(allocated.mooe)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    CO:{' '}
                    <span className={allocated.co > master.co ? 'text-red-600' : 'text-gray-900'}>
                      {fmt(allocated.co)}
                    </span>
                  </span>
                  <span className={`text-base ${isOverAllocated ? 'text-red-600' : 'text-blue-700'}`}>
                    Total: {fmt(allocated.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </ResponsiveDialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open && !deletingId) setDeleteConfirm(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-destructive/10 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-base">Delete Department Ceiling</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Are you sure you want to delete the ceiling for{' '}
              <span className="font-semibold text-foreground">{deleteConfirm?.label}</span>?
              <br />
              This action <span className="font-semibold text-destructive">cannot be undone</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
