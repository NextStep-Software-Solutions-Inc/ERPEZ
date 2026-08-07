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
import { usePurchaseOrderStore } from '../data/purchaseOrderStore'

type SelectNoaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (noaId: string) => void
  selectedNoaId?: string | null
}

export function SelectNoaDialog({
  open,
  onOpenChange,
  onSelect,
  selectedNoaId,
}: SelectNoaDialogProps) {
  const approvedNoas = usePurchaseOrderStore((state) => state.approvedNoas)
  const [search, setSearch] = useState('')

  const filteredNoas = useMemo(() => {
    return approvedNoas.filter((noa) =>
      [noa.noaNumber, noa.description, noa.supplierName]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  }, [approvedNoas, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="7xl" className="max-h-[92vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Approved NOA</DialogTitle>
          <DialogDescription>
            Search the approved Goods and Services NOAs and choose the contract
            source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-default-200 bg-default-50 p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by NOA number, supplier, or description"
          />

          <ScrollArea className="max-h-[60vh] rounded-xl border border-default-200 bg-background">
            <div className="divide-y divide-default-200">
              {filteredNoas.length ? (
                filteredNoas.map((noa) => (
                  <button
                    key={noa.id}
                    type="button"
                    onClick={() => onSelect(noa.id)}
                    className={`block w-full px-4 py-4 text-left transition hover:bg-default-50 ${selectedNoaId === noa.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-default-900">
                          {noa.noaNumber}
                        </div>
                        <div className="text-sm text-default-600">
                          {noa.description}
                        </div>
                        <div className="mt-1 text-xs text-default-400">
                          {noa.category} · {noa.month} · {noa.supplierName}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium text-default-900">
                        {noa.totalAmount.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-default-500">
                  No approved NOA matched your search.
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
