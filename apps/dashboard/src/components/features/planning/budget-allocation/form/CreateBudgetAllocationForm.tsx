import { useEffect, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFundSourcesRequest } from '../../fund-source/handlers/getFundSourcesRequest'
import { getDeliveryUnitsRequest } from '../../delivery-unit/handlers/getDeliveryUnitsRequest'
import { AllocationFundSourceList } from '../components/AllocationFundSourceList'
import { BudgetAllocationHeader } from '../components/BudgetAllocationHeader'
import type { AllocationPayload } from '../table/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'

const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)
const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest)
export const createBudgetAllocationSchema = z.object({
  deliveryUnitId: z.string().min(1, 'Required'),
  purpose: z.string().min(2, 'Required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  duFundAllocations: z
    .array(
      z.object({
        receivedFundId: z.string().min(1, 'Required'),
        amount: z.number().min(1, 'Amount must be greater than 0'),
      })
    )
    .min(1, 'At least one fund allocation is required'),
})

export type FormValues = z.infer<typeof createBudgetAllocationSchema>
export default function CreateBudgetAllocationForm({
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  initialValues,
  fixedDeliveryUnitId,
}: {
  onSubmit: (payload: AllocationPayload) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  initialValues?: Partial<FormValues>
  fixedDeliveryUnitId?: string
}) {
  const { data: fsData } = useFundSources({
    pathParams: {},
    queryParams: { PageNumber: 1, PageSize: 1000 },
  })
  const { data: duData } = useDeliveryUnits({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 1000, filters: 'parentId==null' },
  })
  const [allocations, setAllocations] = useState<
    Array<{ fundSourceId: string; allocations: Record<string, number> }>
  >([])
  const form = useForm({
    defaultValues: {
      deliveryUnitId:
        fixedDeliveryUnitId || initialValues?.deliveryUnitId || '',
      purpose: initialValues?.purpose || '',
      amount: initialValues?.amount || 0,
      duFundAllocations: initialValues?.duFundAllocations || [],
    },
    validators: {
      onSubmit: createBudgetAllocationSchema,
    },
    onSubmit: async (v) => {
      const duFundAllocations = allocations.flatMap((a) =>
        Object.entries(a.allocations)
          .filter(([_, amount]) => amount > 0)
          .map(([receivedFundId, amount]) => ({
            receivedFundId,
            amount,
          })),
      )
      const totalAmount = duFundAllocations.reduce(
        (sum, item) => sum + item.amount,
        0,
      )
      const payload: AllocationPayload = {
        deliveryUnitId: v.value.deliveryUnitId,
        purpose: v.value.purpose,
        amount: totalAmount,
        duFundAllocations,
      }
      await onSubmit(payload)
    },
  })

  const amount = useStore(form.store, (state) => state.values.amount)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  // Calculate remaining available amount (after form is declared)
  const totalAllocated = allocations.reduce((sum, allocation) => {
    return sum + Object.values(allocation.allocations).reduce((cardSum, allocAmt) => cardSum + allocAmt, 0)
  }, 0)
  const remainingAmount = Math.max(0, amount - totalAllocated)
  useEffect(() => {
    const duFundAllocations = allocations.flatMap((a) =>
      Object.entries(a.allocations)
        .filter(([_, allocAmt]) => allocAmt > 0)
        .map(([receivedFundId, allocAmt]) => ({
          receivedFundId,
          amount: allocAmt,
        }))
    )
    form.setFieldValue('duFundAllocations', duFundAllocations)
  }, [allocations])
  const handleUpdateReceivingAmount = (
    aIdx: number,
    receivedFundId: string,
    val: number,
  ) => {
    setAllocations((prev) =>
      prev.map((a, idx) =>
        idx === aIdx
          ? { ...a, allocations: { ...a.allocations, [receivedFundId]: val } }
          : a,
      ),
    )
  }
  const handleFundSourceChange = (aIdx: number, fundSourceId: string) => {
    setAllocations((prev) =>
      prev.map((a, idx) =>
        idx === aIdx ? { ...a, fundSourceId, allocations: {} } : a,
      ),
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col space-y-4"
    >
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        <BudgetAllocationHeader
          form={form}
          duData={duData}
          isLoading={isLoading}
          fixedDeliveryUnitId={fixedDeliveryUnitId}
        />

        <AllocationFundSourceList
          allocations={allocations}
          totalAllocated={totalAllocated}
          targetAmount={amount}
          isLoading={isLoading}
          fsData={fsData}
          remainingAmount={remainingAmount}
          onAddFundSource={() =>
            setAllocations([
              ...allocations,
              { fundSourceId: '', allocations: {} },
            ])
          }
          onUpdateReceivingAmount={handleUpdateReceivingAmount}
          onFundSourceChange={handleFundSourceChange}
          onRemoveAllocation={(i) => {
            const updated = allocations.filter((_, aidx) => aidx !== i)
            setAllocations(updated)
          }}
          onRemoveFundReceiving={(aIdx, rId) => {
            setAllocations((prev) =>
              prev.map((a, idx) =>
                idx === aIdx
                  ? {
                    ...a,
                    allocations: Object.fromEntries(
                      Object.entries(a.allocations).filter(
                        ([rid]) => rid !== rId,
                      ),
                    ),
                  }
                  : a,
              ),
            )
          }}
        />
      </div>

      <div className="flex justify-end space-x-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || isSubmitting || totalAllocated !== amount}
          className="bg-green-700 hover:bg-green-800"
        >
          {(isLoading || isSubmitting) && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          {mode === 'create' ? 'Allocate Funds' : 'Update'}
        </Button>
      </div>
    </form>
  )
}
