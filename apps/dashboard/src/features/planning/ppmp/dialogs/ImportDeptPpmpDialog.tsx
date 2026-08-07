/**
 * ImportDeptPpmpDialog
 * Lets an Office Head batch-select submitted department PPMPs to consolidate
 * into the current Master Office PPMP.
 */

import { useMemo, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { CheckSquare, Layers3, ArrowRightLeft } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '../lib/ppmpUtils'
import { mockPpmpDatabase } from '../data/mockPpmpData'
import { PPMPState, type PPMP } from '../types'
import {
  importDeptPpmpDialogOpenAtom,
  selectedMasterPpmpForImportAtom,
} from '../atoms'
import { importDeptPpmpsRequest } from '../handlers/importDeptPpmpsRequest'

interface ImportDeptPpmpDialogProps {
  onSuccess?: (updatedMaster: PPMP) => void
}

export function ImportDeptPpmpDialog({ onSuccess }: ImportDeptPpmpDialogProps) {
  const [open, setOpen] = useAtom(importDeptPpmpDialogOpenAtom)
  const masterPpmp = useAtomValue(selectedMasterPpmpForImportAtom)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const eligibleDepartments = useMemo(() => {
    if (!masterPpmp) return []
    return mockPpmpDatabase.filter(
      (ppmp) =>
        !ppmp.isMasterOffice &&
        ppmp.fiscalYear === masterPpmp.fiscalYear &&
        ppmp.state === PPMPState.PENDING_REVIEW &&
        ppmp.consolidatedToMasterId === null,
    )
  }, [masterPpmp])

  const selectedCount = selectedIds.length

  const reset = () => {
    setSelectedIds([])
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const toggleDepartment = (deptId: string) => {
    setSelectedIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId],
    )
  }

  const handleImport = async () => {
    if (!masterPpmp) {
      toast.error('No master PPMP selected.')
      return
    }
    if (selectedIds.length === 0) {
      toast.warning('Select at least one department PPMP to import.')
      return
    }

    setIsImporting(true)
    try {
      const updatedMaster = await importDeptPpmpsRequest.fetcher({
        data: {
          masterPpmpId: masterPpmp.id,
          departmentPpmpIds: selectedIds,
        },
      })
      toast.success(`Imported ${selectedIds.length} department PPMP(s).`)
      onSuccess?.(updatedMaster)
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
      title="Import Department PPMPs"
      description="Select submitted department PPMPs from the same fiscal year and consolidate them into the master workspace."
      size="3xl"
      showCloseButton
      footer={
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span>
              <strong className="text-foreground">{selectedCount}</strong>{' '}
              {selectedCount === 1 ? 'department' : 'departments'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={isImporting || selectedCount === 0}
              className="gap-1.5"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              {isImporting ? 'Importing…' : 'Confirm Import'}
            </Button>
          </div>
        </div>
      }
    >
      {!masterPpmp ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Open a master PPMP first, then return here to import department plans.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {masterPpmp.documentName}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  FY {masterPpmp.fiscalYear} · {masterPpmp.libName}
                </p>
              </div>
              <Badge variant="soft" className="text-[10px]">
                {eligibleDepartments.length} eligible department PPMPs
              </Badge>
            </div>
          </div>

          {eligibleDepartments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No submitted department PPMPs are available for this fiscal year.
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {eligibleDepartments.map((dept) => {
                const isSelected = selectedIds.includes(dept.id)
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDepartment(dept.id)}
                    className={[
                      'w-full rounded-lg border p-4 text-left transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:bg-muted/20',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {dept.documentName}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {dept.ppmpNumber} · {dept.libName}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Total budget: {formatCurrency(dept.totalBudget)}
                        </div>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDepartment(dept.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </ResponsiveDialog>
  )
}
