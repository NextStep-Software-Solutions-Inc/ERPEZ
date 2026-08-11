/**
 * DeptConsolidationSheet
 *
 * A sheet overlay allowing a Department-level PPMP to select a Master Office
 * PPMP to consolidate into. Lists all isMaster==true PPMPs for the same
 * fiscal year. On confirm, calls createPPMPConsolidateRequest, which sets
 * consolidatedIntoId on the department PPMP.
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../lib'
import { getPPMPsRequest } from '../handlers/getPpmpsRequest'
import { createPPMPConsolidateRequest } from '../handlers/createPPMPConsolidateRequest'
import type { PPMP } from '../types'
import {
  Search,
  Building2,
  GitMerge,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

const usePPMPs = createQueryHookFromTemplate(getPPMPsRequest)
const useConsolidatePPMP = createMutationHookFromTemplate(
  createPPMPConsolidateRequest,
)

// ─── Eligibility check ────────────────────────────────────────────────────────

function getMasterEligibility(
  master: PPMP,
  deptPpmp: Pick<PPMP, 'id' | 'fiscalYearId' | 'libId'>,
): true | string {
  if (master.fiscalYearId !== deptPpmp.fiscalYearId)
    return 'Fiscal year mismatch'
  if (deptPpmp.libId && master.libId && deptPpmp.libId !== master.libId)
    return `LIB mismatch (master: ${master.libId}, dept: ${deptPpmp.libId})`
  return true
}

// ─── Master PPMP card ─────────────────────────────────────────────────────────

interface MasterCardProps {
  master: PPMP
  selected: boolean
  eligibility: true | string
  onSelect: () => void
}

function MasterCard({
  master,
  selected,
  eligibility,
  onSelect,
}: MasterCardProps) {
  const isEligible = eligibility === true

  return (
    <button
      type="button"
      disabled={!isEligible}
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-150',
        isEligible
          ? selected
            ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/30'
            : 'border-default-200 bg-white hover:border-primary/30 hover:shadow-sm'
          : 'border-default-100 bg-default-50/50 opacity-50 cursor-not-allowed',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'h-9 w-9 shrink-0 rounded-lg flex items-center justify-center',
              selected
                ? 'bg-primary/15 text-primary'
                : 'bg-default-100 text-default-500',
            )}
          >
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-default-900 truncate">
              {master.documentName || master.ppmpNumber || '—'}
            </div>
            <div className="text-xs text-default-500 mt-0.5 flex items-center gap-1.5">
              <Building2 className="h-3 w-3" />
              {master.officeName || '—'}
            </div>
          </div>
        </div>

        {selected && isEligible && (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="bg-default-50 rounded-lg p-2">
          <div className="text-[9px] uppercase font-bold tracking-wider text-default-400">
            Budget
          </div>
          <div className="text-xs font-bold text-default-800 mt-0.5">
            {formatCurrency(master.totalEstimatedBudget ?? 0)}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-2">
          <div className="text-[9px] uppercase font-bold tracking-wider text-default-400">
            Status
          </div>
          <div className="text-xs font-bold text-default-800 mt-0.5 truncate capitalize">
            {master.status ?? '—'}
          </div>
        </div>
        <div className="bg-default-50 rounded-lg p-2">
          <div className="text-[9px] uppercase font-bold tracking-wider text-default-400">
            FY
          </div>
          <div className="text-xs font-bold text-default-800 mt-0.5">
            {master.fiscalYearName ?? '—'}
          </div>
        </div>
      </div>

      {!isEligible && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-warning font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {eligibility}
        </div>
      )}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface DeptConsolidationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deptPpmp: Pick<
    PPMP,
    | 'id'
    | 'fiscalYearId'
    | 'fiscalYearName'
    | 'libId'
    | 'ppmpNumber'
    | 'officeName'
    | 'officeId'
  >
}

export function DeptConsolidationSheet({
  open,
  onOpenChange,
  deptPpmp,
}: DeptConsolidationSheetProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Fetch all master PPMPs for the same fiscal year
  const { data: ppmpResp, isLoading } = usePPMPs({
    pathParams: {},
    queryParams: {
      filters: `fiscalYearId==${deptPpmp.fiscalYearId},isMaster==true`,
      pageSize: 200,
    },
    enabled: open,
  })

  const allMasters = useMemo((): PPMP[] => {
    const raw = ppmpResp as { data?: PPMP[] } | PPMP[] | undefined
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.data ?? []
  }, [ppmpResp])

  const filtered = useMemo(() => {
    if (!search.trim()) return allMasters
    const q = search.toLowerCase()
    return allMasters.filter(
      (m) =>
        m.officeName?.toLowerCase().includes(q) ||
        m.ppmpNumber?.toLowerCase().includes(q) ||
        m.documentName?.toLowerCase().includes(q),
    )
  }, [allMasters, search])

  const selectedMaster = useMemo(
    () => allMasters.find((m) => m.id === selectedMasterId) ?? null,
    [allMasters, selectedMasterId],
  )

  const { mutateAsync: consolidate, isPending: isConsolidating } =
    useConsolidatePPMP()

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      // Only run reset logic when the sheet is being closed
      if (!nextOpen && !isConsolidating) {
        onOpenChange(false)
        setSelectedMasterId(null)
        setSearch('')
      } else {
        // Propagate open state for explicit opens
        onOpenChange(nextOpen)
      }
    },
    [isConsolidating, onOpenChange],
  )

  const handleConfirm = async () => {
    if (!selectedMaster) return
    try {
      await consolidate(
        {
          pathParams: {},
          payload: {
            childPPMPIds: [deptPpmp.id],
            parentOfficeId: selectedMaster.officeId,
            fiscalYearId: deptPpmp.fiscalYearId,
            consolidatedPPMPNumber:
              selectedMaster.ppmpNumber ?? `CONSOLIDATED-${Date.now()}`,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              `Successfully consolidated "${deptPpmp.ppmpNumber ?? deptPpmp.officeName}" into "${selectedMaster.documentName || selectedMaster.ppmpNumber}".`,
            )
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmps') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
            handleClose(false)
          },
        },
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to consolidate PPMP into master.',
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
          className="h-[88vh] p-0 flex flex-col rounded-t-2xl overflow-hidden border-t border-slate-200 shadow-2xl"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <GitMerge className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-800 leading-tight">
                    Consolidate into Master PPMP
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-0.5">
                    {deptPpmp.ppmpNumber ?? deptPpmp.officeName} — Select a
                    master PPMP to consolidate into
                  </SheetDescription>
                </div>
              </div>

              {selectedMaster && (
                <Badge
                  variant="outline"
                  className="gap-1.5 font-semibold border-primary/20 text-primary bg-primary/5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {selectedMaster.ppmpNumber ?? selectedMaster.documentName}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: Master PPMP selector */}
            <div className="w-115 shrink-0 border-r border-slate-200 flex flex-col bg-white min-h-0">
              {/* Search */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
                  <Input
                    placeholder="Search master PPMPs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm border-default-200 bg-default-50"
                  />
                </div>
              </div>

              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Master PPMPs — FY {deptPpmp.fiscalYearName}
                </p>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-4 pb-4 space-y-3 pt-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10 text-sm text-default-400">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading master PPMPs...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-default-400 gap-2">
                      <Layers className="h-8 w-8 text-default-300" />
                      <p>No master PPMPs found for this fiscal year.</p>
                    </div>
                  ) : (
                    filtered.map((master) => {
                      const eligibility = getMasterEligibility(master, deptPpmp)
                      return (
                        <MasterCard
                          key={master.id}
                          master={master}
                          selected={selectedMasterId === master.id}
                          eligibility={eligibility}
                          onSelect={() =>
                            setSelectedMasterId((prev) =>
                              prev === master.id ? null : master.id,
                            )
                          }
                        />
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Preview panel */}
            <div className="flex-1 min-w-0 flex flex-col bg-slate-50/50 p-6">
              {!selectedMaster ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-default-400">
                  <div className="h-16 w-16 rounded-2xl bg-default-100 flex items-center justify-center">
                    <GitMerge className="h-8 w-8 text-default-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-default-600">
                      Select a Master PPMP
                    </p>
                    <p className="text-xs text-default-400 mt-1 max-w-xs">
                      Choose a master PPMP from the left panel to preview what
                      will happen when you consolidate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-default-200 bg-white p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-default-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Consolidation Summary
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-default-400">
                            Department PPMP (Source)
                          </div>
                          <div className="text-sm font-semibold text-default-900 mt-0.5">
                            {deptPpmp.ppmpNumber ?? '—'}
                          </div>
                          <div className="text-xs text-default-500">
                            {deptPpmp.officeName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1 text-primary">
                          <div className="h-px w-8 bg-primary/30" />
                          <GitMerge className="h-4 w-4" />
                          <div className="h-px w-8 bg-primary/30" />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-default-400">
                            Master PPMP (Target)
                          </div>
                          <div className="text-sm font-semibold text-default-900 mt-0.5">
                            {selectedMaster.documentName ||
                              selectedMaster.ppmpNumber ||
                              '—'}
                          </div>
                          <div className="text-xs text-default-500">
                            {selectedMaster.officeName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2 text-amber-700">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold">
                          This action is irreversible.
                        </span>{' '}
                        Once consolidated, this department PPMP will be marked
                        as &ldquo;Consolidated&rdquo; and will be linked to the
                        selected master plan.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              This PPMP will be marked as{' '}
              <span className="font-semibold text-slate-600">Consolidated</span>{' '}
              and linked to the selected master plan.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isConsolidating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!selectedMasterId || isConsolidating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isConsolidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consolidating…
                  </>
                ) : (
                  <>
                    <GitMerge className="h-4 w-4" />
                    Consolidate into Master
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm dialog */}
      <ConfirmAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Consolidate into master PPMP?"
        description={`You are about to consolidate "${deptPpmp.ppmpNumber ?? deptPpmp.officeName}" into "${selectedMaster?.documentName || selectedMaster?.ppmpNumber}". This action is irreversible — this department PPMP will be marked as Consolidated. Proceed?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel={isConsolidating ? 'Consolidating…' : 'Yes, Consolidate'}
        cancelLabel="Cancel"
        loading={isConsolidating}
      />
    </>
  )
}

