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

type SelectAobDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (aobId: string) => void
  selectedAobId?: string | null
}

export function SelectAobDialog({
  open,
  onOpenChange,
  onSelect,
  selectedAobId,
}: SelectAobDialogProps) {
  const approvedAobs = usePurchaseOrderStore((state) => state.approvedAobs)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')

  const filteredAobs = useMemo(() => {
    return approvedAobs.filter((aob) => {
      const matchesSearch = [
        aob.aobNumber,
        aob.description,
        aob.winningSupplier,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesCategory =
        category === 'all' ? true : aob.category === category
      const matchesMonth = month === 'all' ? true : aob.month === month

      return matchesSearch && matchesCategory && matchesMonth
    })
  }, [approvedAobs, category, month, search])

  const categories = [
    'all',
    ...new Set(approvedAobs.map((aob) => aob.category)),
  ]
  const months = ['all', ...new Set(approvedAobs.map((aob) => aob.month))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="7xl" className="max-h-[92vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Approved AOB</DialogTitle>
          <DialogDescription>
            Filter by category or month, then pick the awarded AOB to link.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-xl border border-default-200 bg-default-50 p-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500">
                Search
              </label>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="AOB number, supplier"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500">
                Category
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={category === option ? 'default' : 'outline'}
                    color={category === option ? 'primary' : 'secondary'}
                    onClick={() => setCategory(option)}
                  >
                    {option === 'all' ? 'All' : option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-default-500">
                Month
              </div>
              <div className="flex flex-wrap gap-2">
                {months.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={month === option ? 'default' : 'outline'}
                    color={month === option ? 'primary' : 'secondary'}
                    onClick={() => setMonth(option)}
                  >
                    {option === 'all' ? 'All' : option}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <ScrollArea className="max-h-[60vh] rounded-xl border border-default-200">
            <div className="divide-y divide-default-200">
              {filteredAobs.length ? (
                filteredAobs.map((aob) => (
                  <button
                    key={aob.id}
                    type="button"
                    onClick={() => onSelect(aob.id)}
                    className={`block w-full px-4 py-4 text-left transition hover:bg-default-50 ${selectedAobId === aob.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-default-900">
                          {aob.aobNumber}
                        </div>
                        <div className="text-sm text-default-600">
                          {aob.description}
                        </div>
                        <div className="mt-1 text-xs text-default-400">
                          {aob.category} · {aob.month} · {aob.winningSupplier}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium text-default-900">
                        {aob.totalAmount.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-sm text-default-500">
                  No approved AOB matched your filters.
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
