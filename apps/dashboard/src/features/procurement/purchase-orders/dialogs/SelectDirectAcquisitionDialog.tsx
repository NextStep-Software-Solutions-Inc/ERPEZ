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
import { useDAItemStore } from '@/features/procurement/supplier-portal/store/daItemStore'
import type { ApprovedDirectAcquisition } from '../types'

type SelectDirectAcquisitionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (daId: string) => void
  selectedDaId?: string | null
}

export function SelectDirectAcquisitionDialog({
  open,
  onOpenChange,
  onSelect,
  selectedDaId,
}: SelectDirectAcquisitionDialogProps) {
  const approvedDirectAcquisitions = usePurchaseOrderStore(
    (state) => state.approvedDirectAcquisitions,
  )
  const daItems = useDAItemStore((s) => s.items)
  const [search, setSearch] = useState('')

  // Merge approved items from daItemStore into the DA list
  const mergedDAs = useMemo((): ApprovedDirectAcquisition[] => {
    // Preserve existing mock IDs when daNumber matches to keep links & selection working.
    const mockIdByDaNumber = new Map(
      approvedDirectAcquisitions.map((da) => [da.daNumber, da.id] as const),
    )

    const fromDAStore: ApprovedDirectAcquisition[] = daItems
      .filter((item) => item.status === 'approved')
      .map((item) => {
      const id = mockIdByDaNumber.get(item.daNumber) ?? item.id
      return {
        id,
        daNumber: item.daNumber,
        description: item.itemName,
        category: item.purchaseSource,
        month: item.purchaseDate
        ? new Date(item.purchaseDate).toLocaleString('default', { month: 'long' })
        : '',
        supplierName: item.supplierOrStore,
        totalAmount: item.totalAmount,
        awardedItems: [
        {
          id: `${item.id}-item-1`,
          description: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.actualPurchaseAmount,
          amount: item.totalAmount,
        },
        ],
        status: 'approved' as const,
      }
      })

    // Merge, preferring daItemStore entries and deduplicating by daNumber
    const existingDaNumbers = new Set(fromDAStore.map((d) => d.daNumber))
    const filteredMock = approvedDirectAcquisitions.filter(
      (da) => !existingDaNumbers.has(da.daNumber),
    )
    return [...fromDAStore, ...filteredMock]
  }, [daItems, approvedDirectAcquisitions])

  const filteredDas = useMemo(() => {
    return mergedDAs.filter((da) =>
      [da.daNumber, da.description, da.supplierName]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  }, [mergedDAs, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="7xl" className="max-h-[92vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Approved Direct Acquisition</DialogTitle>
          <DialogDescription>
            Search the approved Direct Acquisitions and choose the contract
            source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-default-200 bg-default-50 p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by DA number, supplier, or description"
          />

          <ScrollArea className="max-h-[60vh] rounded-xl border border-default-200 bg-background">
            <div className="divide-y divide-default-200">
              {filteredDas.length ? (
                filteredDas.map((da) => (
                  <button
                    key={da.id}
                    type="button"
                    onClick={() => onSelect(da.id)}
                    className={`block w-full px-4 py-4 text-left transition hover:bg-default-50 ${selectedDaId === da.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-default-900">
                          {da.daNumber}
                        </div>
                        <div className="text-sm text-default-600">
                          {da.description}
                        </div>
                        <div className="mt-1 text-xs text-default-400">
                          {da.category} · {da.month} · {da.supplierName}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium text-default-900">
                        {da.totalAmount.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-default-500">
                  No approved Direct Acquisition matched your search.
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
