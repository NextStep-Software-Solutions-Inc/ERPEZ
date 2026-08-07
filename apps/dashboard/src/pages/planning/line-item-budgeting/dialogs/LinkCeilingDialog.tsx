import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Link2 } from 'lucide-react'
import { useLinkCeiling } from '@/features/planning/line-item-budgeting/line-item-budget/hooks/useLIBActions'
import { useAgencyMasterBudgets } from '@/features/planning/agency-master-budget/hooks/useAgencyMasterBudgets'
import type { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

interface LinkCeilingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lib: LIB | null
  onSuccess?: () => void
}

export function LinkCeilingDialog({ open, onOpenChange, lib, onSuccess }: LinkCeilingDialogProps) {
  const { toast } = useToast()
  const { mutateAsync: linkCeiling, isPending: isLinking } = useLinkCeiling()

  // Fetch Agency Master Budgets
  const { data: masterBudgetsResponse, isLoading: isBudgetsLoading } = useAgencyMasterBudgets({
    pathParams: {},
    queryParams: { pageSize: 200 },
  })

  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')

  // Filter budgets to match Fund Source and Fiscal Year of the proposed library
  const matchingBudgets = useMemo(() => {
    if (!lib || !masterBudgetsResponse?.data) return []
    const libFsCode = lib.fundSource?.code?.toLowerCase()
    const libFyYear = lib.fiscalYear?.year

    return masterBudgetsResponse.data.filter((mb) => {
      const mbFsCode = mb.fundSource?.code?.toLowerCase()
      const mbFyYear = mb.fiscalYear?.year
      return mbFsCode === libFsCode && mbFyYear === libFyYear
    })
  }, [lib, masterBudgetsResponse])

  const handleConfirm = async () => {
    if (!lib || !selectedBudgetId) return

    try {
      await linkCeiling({
        pathParams: { id: lib.id },
        payload: { agencyMasterBudgetId: selectedBudgetId },
      })

      toast({
        title: 'Ceiling Linked',
        description: 'Ceiling linked and budget status updated to Draft.',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Linking Failed',
        description: err instanceof Error ? err.message : 'An error occurred while linking.',
        variant: 'destructive',
      })
    }
  }

  if (!lib) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-650" /> Link Budget Ceiling
          </DialogTitle>
          <DialogDescription>
            Link this budget library to its authorized Agency Master Budget ceiling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">OFFICE</span>
              <span className="text-slate-700 font-semibold">{lib.office?.name || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">FISCAL YEAR</span>
              <span className="text-slate-700 font-semibold">{lib.fiscalYear?.year || 'N/A'}</span>
            </div>
            <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">FUND SOURCE</span>
              <span className="text-slate-700 font-semibold">
                {lib.fundSource?.name || 'N/A'}{' '}
                {lib.fundSource?.code ? `(${lib.fundSource.code})` : ''}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Select Agency Master Budget
            </label>
            {isBudgetsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading ceilings...
              </div>
            ) : matchingBudgets.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No matching Agency Master Budget ceilings configured for Fund Source{' '}
                <strong>{lib.fundSource?.code}</strong> and Fiscal Year{' '}
                <strong>{lib.fiscalYear?.year}</strong>. Please set it up in the Fund Source tab first.
              </p>
            ) : (
              <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                <SelectTrigger className="w-full text-xs h-10 font-semibold">
                  <SelectValue placeholder="Choose a master budget ceiling..." />
                </SelectTrigger>
                <SelectContent>
                  {matchingBudgets.map((mb) => (
                    <SelectItem key={mb.id} value={mb.id} className="text-xs">
                      {mb.fundSource?.name || mb.fundSource?.code} (Ceiling: ₱
                      {(mb.psAmount + mb.mooeAmount + mb.coAmount).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLinking}
            className="text-xs h-9 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedBudgetId || isLinking}
            className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking...
              </>
            ) : (
              'Link Ceiling'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
