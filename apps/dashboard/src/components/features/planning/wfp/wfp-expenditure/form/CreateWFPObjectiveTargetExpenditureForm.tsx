import { useEffect, useMemo } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2, Plus } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { CreateWFPObjectiveTargetExpenditureValues } from '@/components/features/planning/wfp/wfp-expenditure/form/schema'
import { Button } from '@/components/ui/button'
import { getObjectsRequest } from '@/components/features/planning/wfp/wfp-expenditure/handlers/getObjectsRequest'
import { formatCurrencyPHP } from '@/utils/formatters'
import { ExpenditureBlock } from '@/components/features/planning/wfp/wfp-expenditure/form/ExpenditureBlock'

const useObjects = createQueryHookFromTemplate(getObjectsRequest);

interface CreateWFPObjectiveTargetExpenditureFormProps {
  onSubmit: (values: CreateWFPObjectiveTargetExpenditureValues) => void
  onCancel: () => void
  isLoading?: boolean
  wfpObjectiveTargetId: string
  initialValues?: CreateWFPObjectiveTargetExpenditureValues
  onChange?: (values: CreateWFPObjectiveTargetExpenditureValues) => void
}

export default function CreateWFPObjectiveTargetExpenditureForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  wfpObjectiveTargetId,
  initialValues,
  onChange,
}: CreateWFPObjectiveTargetExpenditureFormProps) {
  
  // Use for the Type of Expenditure dropdown
  const { data: objectsData } = useObjects({ 
    pathParams: {}, 
    queryParams: { filters: 'parentId==null'}
  })

  // Get all children objects for expenditure item dropdown
  const { data: allChildrenData } = useObjects({
    pathParams: {},
    queryParams: { filters: 'parentId!=null'}
  })

  const form = useForm({
    defaultValues: initialValues || {
      wfpObjectiveTargetId: wfpObjectiveTargetId,
      expenditures: [{
        expenditureType: '',
        lineItems: []
      }]
    } as CreateWFPObjectiveTargetExpenditureValues,
    onSubmit: (values) => {
      const filteredValues = {
        ...values.value,
        expenditures: values.value.expenditures
          .map((exp: CreateWFPObjectiveTargetExpenditureValues['expenditures'][0]) => ({
            ...exp,
            lineItems: exp.lineItems
              .filter((line) => line.objectId !== '')
              .filter((line) => line.items && line.items.length > 0),
          }))
          .filter((exp: CreateWFPObjectiveTargetExpenditureValues['expenditures'][0]) => exp.lineItems.length > 0),
      }
      onSubmit(filteredValues)
    },
  })

  useEffect(() => {
    if (onChange) {
      onChange(form.state.values)
    }
  }, [form.state.values, onChange])

  const calculateGrandTotal = (expenditures: CreateWFPObjectiveTargetExpenditureValues['expenditures']) => {
    return expenditures?.reduce((acc, exp) => 
      acc + (exp.lineItems?.reduce((lAcc: number, line) => 
        lAcc + (line.items?.reduce((iAcc: number, item) => iAcc + (Number(item.subTotal) || 0), 0) || 0)
      , 0) || 0)
    , 0) || 0
  }

  const expenditures = useStore(form.store, (state) => state.values.expenditures)

  const grandTotal = useMemo(() => {
    return calculateGrandTotal(expenditures)
  }, [expenditures])

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      className="space-y-6 pt-2"
    >
      {/* Top Level: Expenditure Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-900">Expenditure</h2>
        <Button
          type="button"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={() => form.setFieldValue('expenditures', [
            ...form.state.values.expenditures,
            {
              expenditureType: '',
              lineItems: [{
                objectId: '',
                items: [{ name: '', unitEstimates: 0, quantity: 1, subTotal: 0 }]
              }]
            }
          ])}
        >
          <Plus className="w-4 h-4" /> Add Expenditure
        </Button>
      </div>

      {/* Level 1: Expenditure Blocks */}
      <form.Field name="expenditures" mode="array">
        {(expendituresField) => (
          <div className="space-y-8">
            {expendituresField.state.value.map((_, i) => (
              <ExpenditureBlock
                key={i}
                expenditureIndex={i}
                expendituresField={expendituresField}
                form={form}
                objectsData={objectsData}
                allChildrenData={allChildrenData}
              />
            ))}
          </div>
        )}
      </form.Field>

      {/* Footer Total Bar */}
      <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100 shadow-sm">
        <span className="text-red-600 font-black text-sm uppercase tracking-tighter">Total:</span>
        <span className="text-red-600 font-black text-xl tracking-tight">
          {formatCurrencyPHP(grandTotal)}
        </span>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="px-6">Cancel</Button>
        <Button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-8 font-bold" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Expenditure
        </Button>
      </div>
    </form>
  )
}