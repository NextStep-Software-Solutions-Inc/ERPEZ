import { useForm, useStore } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAtom } from 'jotai'
import { updateFormDataAtom } from '../atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrencyPHP } from '@/utils/formatters'

export const updateWFPObjectiveExpenditureSchema = z.object({
  itemDescription: z.string().min(1, 'Item description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitEstimates: z.number().min(0, 'Unit estimate must be non-negative'),
});

export type UpdateWFPObjectiveTargetExpenditureValues = z.infer<typeof updateWFPObjectiveExpenditureSchema>

interface UpdateFormProps {
  onSubmit: (data: UpdateWFPObjectiveTargetExpenditureValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues: Partial<UpdateWFPObjectiveTargetExpenditureValues>
}

export default function UpdateWFPObjectiveTargetExpenditureForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  initialValues
}: UpdateFormProps) {
  const [, setFormData] = useAtom(updateFormDataAtom)

  const form = useForm({
    defaultValues: {
      itemDescription: initialValues?.itemDescription || '',
      quantity: initialValues?.quantity || 1,
      unitEstimates: initialValues?.unitEstimates || 0,
    } as UpdateWFPObjectiveTargetExpenditureValues,
    validators: {
      onChange: updateWFPObjectiveExpenditureSchema,
    },
    onSubmit: (values) => {
      onSubmit(values.value)
      setFormData(null)
    },
  })

  // Calculation for Sub-Total/Total based on the UI design
  const unitEstimates = useStore(form.store, (state) => state.values.unitEstimates)
  const quantity = useStore(form.store, (state) => state.values.quantity)
  const total = unitEstimates * quantity

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      className="space-y-6"
    >
      {/* Main Content Area: Grey Card with Red Accent */}
      <div className="relative bg-[#F9FAFB] border border-gray-200 rounded-lg p-6 pt-8">
        {/* Red Vertical Accent Line */}
        <div className="absolute left-0 top-6 bottom-6 w-[4px] bg-[#E11D48] rounded-r-md" />

        <div className="space-y-6">
          {/* Item Description (Full Width) */}
          <form.Field name="itemDescription">
            {(f) => (
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-gray-700">
                  Item <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter item description"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  className="bg-white border-gray-300 h-10 shadow-sm"
                />
              </div>
            )}
          </form.Field>

          {/* Grid for numerical values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="unitEstimates">
              {(f) => (
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-gray-700">
                    Unit Estimate <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-500 font-medium">₱</div>
                    <Input
                      type="number"
                      value={f.state.value}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        f.handleChange(newValue);
                      }}
                      className="bg-white border-gray-300 h-10 pl-7 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="quantity">
              {(f) => (
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={f.state.value}
                    onChange={(e) => {
                      const newValue = Number(e.target.value) || 1;
                      f.handleChange(newValue);
                    }}
                    className="bg-white border-gray-300 h-10 shadow-sm"
                    min="1"
                  />
                </div>
              )}
            </form.Field>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Sub-Total <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  readOnly
                  value={formatCurrencyPHP(total)}
                  className="bg-white border-gray-300 h-10 pl-7 shadow-sm font-medium text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Total Bar (Pink background) */}
      <div className="flex items-center justify-between bg-[#FFF1F2] border border-[#FECDD3] rounded-md p-4 px-6">
        <span className="text-[#E11D48] font-bold text-sm">Total:</span>
        <span className="text-[#E11D48] font-bold text-lg">{formatCurrencyPHP(total)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-[#10B981] hover:bg-[#059669] text-white px-8 h-10 font-semibold" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Item
        </Button>
      </div>
    </form>
  )
}