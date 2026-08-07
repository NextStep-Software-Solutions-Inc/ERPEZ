import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PPMPItem, PPMPItemAllocation, AllocationMonth } from '../types'
import { createPPMPItemAllocationRequest } from '../handlers/createPPMPItemAllocationRequest'
import { updatePPMPItemAllocationRequest } from '../handlers/updatePPMPItemAllocationRequest'
import { deletePPMPItemAllocationRequest } from '../handlers/deletePPMPItemAllocationRequest'
import SubmitButton from '@/components/SubmitButton'

const useCreateAllocation = createMutationHookFromTemplate(createPPMPItemAllocationRequest)
const useUpdateAllocation = createMutationHookFromTemplate(updatePPMPItemAllocationRequest)
const useDeleteAllocation = createMutationHookFromTemplate(deletePPMPItemAllocationRequest)

interface EditPPMPItemAllocationsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: PPMPItem | null
}

const MONTHS: AllocationMonth[] = [
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

export default function EditPPMPItemAllocationsDialog({
  isOpen,
  onOpenChange,
  item,
}: EditPPMPItemAllocationsDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: createAlloc } = useCreateAllocation()
  const { mutateAsync: updateAlloc } = useUpdateAllocation()
  const { mutateAsync: deleteAlloc } = useDeleteAllocation()

  const [quantities, setQuantities] = useState<Record<AllocationMonth, number>>({
    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
  })
  const [isSaving, setIsSaving] = useState(false)

  // Map original allocations
  const originalAllocations = item?.PPMPItemAllocations || []
  const originalMap = originalAllocations.reduce((acc, alloc) => {
    acc[alloc.allocationMonth] = alloc
    return acc
  }, {} as Record<string, PPMPItemAllocation>)

  useEffect(() => {
    if (item) {
      const initial: Record<AllocationMonth, number> = {
        January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
        July: 0, August: 0, September: 0, October: 0, November: 0, December: 0
      }
      originalAllocations.forEach((alloc) => {
        initial[alloc.allocationMonth] = alloc.quantity || 0
      })
      setQuantities(initial)
    }
  }, [item])

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0)
  const unitPrice = item?.unitPrice || 0
  const totalCost = totalQty * unitPrice

  const handleSave = async () => {
    if (!item) return

    setIsSaving(true)

    // Dry-run/prepare operations
    const ops: Array<{
      type: 'create' | 'update' | 'delete'
      month: AllocationMonth
      quantity?: number
      allocationId?: string
    }> = []

    MONTHS.forEach((month) => {
      const currentQty = quantities[month]
      const originalAlloc = originalMap[month]

      if (originalAlloc) {
        if (currentQty === 0) {
          ops.push({ type: 'delete', month, allocationId: originalAlloc.id })
        } else if (currentQty !== originalAlloc.quantity) {
          ops.push({ type: 'update', month, quantity: currentQty, allocationId: originalAlloc.id })
        }
      } else if (currentQty > 0) {
        ops.push({ type: 'create', month, quantity: currentQty })
      }
    })

    if (ops.length === 0) {
      toast.info('No changes detected.')
      setIsSaving(false)
      onOpenChange(false)
      return
    }

    try {
      await toast.promise(
        (async () => {
          for (const op of ops) {
            if (op.type === 'delete' && op.allocationId) {
              await deleteAlloc({ pathParams: { id: op.allocationId } })
            } else if (op.type === 'update' && op.allocationId && op.quantity !== undefined) {
              await updateAlloc({
                pathParams: { id: op.allocationId },
                queryParams: {},
                payload: { quantity: op.quantity },
              })
            } else if (op.type === 'create' && op.quantity !== undefined) {
              await createAlloc({
                pathParams: {},
                payload: {
                  ppmpItemId: item.id,
                  allocationMonth: op.month,
                  quantity: op.quantity,
                },
              })
            }
          }
        })(),
        {
          loading: 'Syncing monthly quantities...',
          success: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].startsWith('/ppmp-items') ||
                  query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
                  query.queryKey[0].startsWith('/ppmp')),
            })
            onOpenChange(false)
            return 'Allocations updated successfully.'
          },
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to update allocations.',
        }
      )
    } catch {
      // Handled by toast.promise
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !isSaving) onOpenChange(false)
      }}
      title="Configure Monthly Allocations"
      description={`Distribute the quantity for "${item?.name || 'item'}" across monthly periods.`}
      size="xl"
    >
      <div className="space-y-5 p-1">
        {/* Info panel */}
        <div className="bg-default-50 border border-default-100 rounded-xl p-4 flex justify-between items-center text-xs">
          <div className="space-y-1">
            <span className="text-default-450 uppercase font-bold text-[9px] tracking-wider block">Unit Price</span>
            <span className="font-semibold text-default-800">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(unitPrice)}
            </span>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-default-450 uppercase font-bold text-[9px] tracking-wider block">Total Quantity</span>
            <span className="font-bold text-default-900 text-sm">{totalQty}</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-default-450 uppercase font-bold text-[9px] tracking-wider block">Total Cost</span>
            <span className="font-bold text-primary text-sm">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalCost)}
            </span>
          </div>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MONTHS.map((month) => {
            const val = quantities[month] || ''
            return (
              <div key={month} className="space-y-1 bg-default-50/30 p-2.5 rounded-lg border border-default-100 hover:border-default-200 transition-colors">
                <span className="text-[10px] font-bold text-default-550 uppercase block tracking-wider text-center mb-1">
                  {month.substring(0, 3)}
                </span>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={val}
                  onChange={(e) => {
                    const qty = Math.max(0, Number.parseInt(e.target.value) || 0)
                    setQuantities((prev) => ({ ...prev, [month]: qty }))
                  }}
                  className="text-xs h-8 text-center border-default-250/70 focus-visible:ring-primary/20"
                  disabled={isSaving}
                />
              </div>
            )
          })}
        </div>

        {/* Footer controls */}
        <div className="flex justify-end gap-2 pt-2 border-t border-default-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9"
          >
            Cancel
          </Button>
          <SubmitButton
            onClick={handleSave}
            loading={isSaving}
            className="h-9 bg-primary hover:bg-primary/95 text-white"
          >
            Save Allocations
          </SubmitButton>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
