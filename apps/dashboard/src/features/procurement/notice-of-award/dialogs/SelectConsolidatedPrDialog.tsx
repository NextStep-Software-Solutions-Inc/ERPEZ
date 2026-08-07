import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConsolidatedPr } from '../types'

type SelectConsolidatedPrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableConsolidatedPrs: ConsolidatedPr[]
  selectedConsolidatedPrId?: string | null
  onSelect: (consolidatedPr: ConsolidatedPr) => void
}

export function SelectConsolidatedPrDialog({
  open,
  onOpenChange,
  availableConsolidatedPrs,
  selectedConsolidatedPrId,
  onSelect,
}: SelectConsolidatedPrDialogProps) {
  const [search, setSearch] = useState('')

  const filteredPrs = useMemo(() => {
    return availableConsolidatedPrs.filter((consolidatedPr) => {
      if (
        !consolidatedPr.taggedForPublicBidding ||
        consolidatedPr.status !== 'approved'
      ) {
        return false
      }

      const haystack = [
        consolidatedPr.prNumber,
        consolidatedPr.projectName,
        consolidatedPr.projectDescription,
        consolidatedPr.endUser,
        consolidatedPr.supplierName,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(search.toLowerCase())
    })
  }, [availableConsolidatedPrs, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="7xl" className="max-h-[92vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Consolidated PR</DialogTitle>
          <DialogDescription>
            Search the approved public bidding Consolidated PRs and choose the
            source for the NOA draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-default-200 bg-default-50 p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PR number, project, supplier, or end user"
          />

          <ScrollArea className="max-h-[60vh] rounded-xl border border-default-200 bg-background">
            <div className="divide-y divide-default-200">
              {filteredPrs.length ? (
                filteredPrs.map((consolidatedPr) => (
                  <button
                    key={consolidatedPr.id}
                    type="button"
                    onClick={() => onSelect(consolidatedPr)}
                    className={`block w-full px-4 py-4 text-left transition hover:bg-default-50 ${selectedConsolidatedPrId === consolidatedPr.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-default-900">
                          {consolidatedPr.prNumber}
                        </div>
                        <div className="text-sm text-default-600">
                          {consolidatedPr.projectName}
                        </div>
                        <div className="mt-1 text-xs text-default-400">
                          {consolidatedPr.endUser} ·{' '}
                          {consolidatedPr.supplierName}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium text-default-900">
                        {consolidatedPr.approvedBudget.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-default-500">
                  No approved public bidding Consolidated PR matched your
                  search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            color="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
