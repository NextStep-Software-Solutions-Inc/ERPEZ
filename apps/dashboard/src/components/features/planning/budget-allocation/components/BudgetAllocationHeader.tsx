import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BudgetAllocationHeaderProps {
  isLoading: boolean
  fixedDeliveryUnitId?: string
  form: any
  duData?: { data: Array<{ id: string; officeName: string; totalAmountRemaining: number }> }
}

export function BudgetAllocationHeader({
  isLoading,
  fixedDeliveryUnitId,
  form,
  duData,
}: BudgetAllocationHeaderProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="deliveryUnitId"
          children={(f:any) => (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Delivery Unit *
              </label>
              <Select
                value={f.state.value}
                onValueChange={(v) => {
                  if (!fixedDeliveryUnitId) {
                    f.handleChange(v)
                    const sel = duData?.data?.find((u: { id: string; officeName: string; totalAmountRemaining: number }) => u.id === v)
                    form.setFieldValue(
                      'amount',
                      Number(sel?.totalAmountRemaining ?? 0),
                    )
                  }
                }}
                disabled={isLoading || !!fixedDeliveryUnitId}
              >
                <SelectTrigger className="h-9 truncate w-full">
                  <SelectValue placeholder="Select Delivery Unit" />
                </SelectTrigger>
                <SelectContent>
                  {(duData?.data || []).map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.officeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
        <form.Field
          name="amount"
          children={(f: any) => (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Total Amount *
              </label>
              <Input
                type="number"
                className="h-9"
                value={f.state.value}
                onChange={(e) => f.handleChange(parseFloat(e.target.value))}
                disabled={isLoading}
              />
            </div>
          )}
        />
      </div>

      <form.Field
        name="purpose"
        children={(f: any) => (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">
              Purpose of Allocation *
            </label>
            <Textarea
              className="min-h-[60px] max-h-[120px] py-2 resize-none"
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}
      />
    </>
  )
}
