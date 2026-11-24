import { useEffect, useMemo } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Loader2, Plus, Banknote } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { CreateWFPObjectiveTargetExpenditureValues } from '@/components/features/planning/wfp/wfp-expenditure/form/schema'
import { Button } from '@/components/ui/button'
import { getObjectsRequest } from '@/components/features/planning/wfp/wfp-expenditure/handlers/getObjectsRequest'
import { formatCurrencyPHP } from '@/utils/formatters'
import { ExpenditureBlock } from '@/components/features/planning/wfp/wfp-expenditure/form/ExpenditureBlock'

const useObjects = createQueryHookFromTemplate(getObjectsRequest)

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
  // Fetch all UACS objects with a large page size so the entire hierarchy is available
  const { data: objectsData } = useObjects({
    pathParams: {},
    queryParams: { pageSize: 2000 },
  })
  const allChildrenData = objectsData

  const form = useForm({
    defaultValues: initialValues || {
      wfpObjectiveTargetId: wfpObjectiveTargetId,
      expenditures: [
        {
          expenditureType: '',
          lineItems: [
            {
              objectId: '',
              items: [{ name: '', unitEstimates: 0, quantity: 1, subTotal: 0 }],
            },
          ],
        },
      ],
    } as CreateWFPObjectiveTargetExpenditureValues,
    onSubmit: (values) => {
      const filteredValues = {
        ...values.value,
        expenditures: values.value.expenditures
          .map((exp: CreateWFPObjectiveTargetExpenditureValues['expenditures'][0]) => ({
            ...exp,
            lineItems: exp.lineItems
              .filter((line) => line.objectId !== '')
              .filter((line) => line.items && line.items.length > 0 && line.items[0].name.trim() !== ''),
          }))
          .filter(
            (exp: CreateWFPObjectiveTargetExpenditureValues['expenditures'][0]) =>
              exp.lineItems.length > 0,
          ),
      }
      onSubmit(filteredValues)
    },
  })

  useEffect(() => {
    if (onChange) {
      onChange(form.state.values)
    }
  }, [form.state.values, onChange])

  const calculateGrandTotal = (
    expenditures: CreateWFPObjectiveTargetExpenditureValues['expenditures'],
  ) => {
    return (
      expenditures?.reduce(
        (acc, exp) =>
          acc +
          (exp.lineItems?.reduce(
            (lAcc: number, line) =>
              lAcc +
              (line.items?.reduce(
                (iAcc: number, item) => iAcc + (Number(item.subTotal) || 0),
                0,
              ) || 0),
            0,
          ) || 0),
        0,
      ) || 0
    )
  }

  const expenditures = useStore(form.store, (state) => state.values.expenditures)

  const grandTotal = useMemo(() => {
    return calculateGrandTotal(expenditures)
  }, [expenditures])

  const handleAddExpenditureBlock = () => {
    form.setFieldValue('expenditures', [
      ...form.state.values.expenditures,
      {
        expenditureType: '',
        lineItems: [
          {
            objectId: '',
            items: [{ name: '', unitEstimates: 0, quantity: 1, subTotal: 0 }],
          },
        ],
      },
    ])
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6 pt-2"
    >
      {/* Top Level: Section Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">CREATE EXPENDITURES</h2>
          <p className="text-xs text-slate-500">
            Define expenditure categories and add standardized expense items with descriptions.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex gap-1.5 text-xs shadow-xs rounded-lg px-3 py-1.5"
          onClick={handleAddExpenditureBlock}
        >
          <Plus className="w-4 h-4" />
          <span>Add Expenditure</span>
        </Button>
      </div>

      {/* Level 1: Expenditure Category Blocks */}
      <form.Field name="expenditures" mode="array">
        {(expendituresField) => (
          <div className="space-y-6">
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

            {/* Add Another Expenditure Category Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 font-semibold h-11 text-xs gap-2 transition-all"
                onClick={handleAddExpenditureBlock}
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Expenditure</span>
              </Button>
            </div>
          </div>
        )}
      </form.Field>

      {/* Grand Total Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg border border-slate-800">
        <div className="flex items-center gap-2.5 text-xs font-extrabold tracking-wider uppercase text-slate-300">
          <Banknote className="h-5 w-5 text-blue-400" />
          <span>TOTAL EXPENDITURES</span>
        </div>
        <span className="text-xl font-black tabular-nums text-emerald-400">
          {formatCurrencyPHP(grandTotal)}
        </span>
      </div>

      {/* Footer Dialog Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 text-xs h-9"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 font-bold text-xs h-9 shadow-md transition-all"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Expenditures
        </Button>
      </div>
    </form>
  )
}