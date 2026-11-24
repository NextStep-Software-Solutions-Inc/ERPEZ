import { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { APIResponse } from 'erpez-shared-lib'
import type { Objects } from '@/components/features/planning/wfp/wfp-expenditure/table/types'
import type { Expenditure, FieldArrayLike, FieldRenderProps, LineItem, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExpenseItemBlock } from '@/components/features/planning/wfp/wfp-expenditure/form/ExpenseItemBlock'
import { formatCurrencyPHP } from '@/utils/formatters'

interface ExpenditureBlockProps {
  expenditureIndex: number
  expendituresField: FieldArrayLike<Expenditure>
  form: WFPExpenditureForm
  objectsData: APIResponse<Array<Objects>> | undefined
  allChildrenData: APIResponse<Array<Objects>> | undefined
}

export function ExpenditureBlock({
  expenditureIndex,
  expendituresField,
  form,
  allChildrenData,
  objectsData,
}: ExpenditureBlockProps) {
  const currentCategory = form.state.values.expenditures[expenditureIndex]?.expenditureType || ''
  const lineItems = form.state.values.expenditures[expenditureIndex]?.lineItems || []

  // Calculate total for this Expenditure Category card
  const categoryTotal = useMemo(() => {
    return lineItems.reduce((acc, line) => {
      const itemSubTotal = line.items?.[0]?.subTotal || 0
      return acc + itemSubTotal
    }, 0)
  }, [lineItems])

  const handleDeleteCategory = () => {
    if (lineItems.length > 0 && lineItems.some((item) => item.objectId || item.items?.[0]?.name)) {
      if (
        window.confirm(
          `Delete this expenditure category and its ${lineItems.length} item(s)?`,
        )
      ) {
        expendituresField.removeValue(expenditureIndex)
      }
    } else {
      expendituresField.removeValue(expenditureIndex)
    }
  }

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
      {/* Category Card Header Indicator Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            Expenditure {expenditureIndex + 1}
          </span>
          {expendituresField.state.value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 gap-1"
              onClick={handleDeleteCategory}
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Category</span>
            </Button>
          )}
        </div>

        {/* Expenditure Category Field */}
        <form.Field name={`expenditures[${expenditureIndex}].expenditureType`}>
          {(field: FieldRenderProps<string>) => {
            const selectedOtherExps = form.state.values.expenditures
              .map((exp: Expenditure, idx: number) => (idx !== expenditureIndex ? exp.expenditureType : null))
              .filter(Boolean)

            return (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Expenditure Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    const hasItems = lineItems.some((l) => l.objectId || l.items?.[0]?.name)
                    if (hasItems && field.state.value && field.state.value !== value) {
                      if (
                        !window.confirm(
                          'Change category? This will reset expense items that are not available under the new category.',
                        )
                      ) {
                        return
                      }
                    }

                    field.handleChange(value)
                    // Reset object selection for child items when category changes
                    form.state.values.expenditures[expenditureIndex].lineItems.forEach((_: LineItem, idx: number) => {
                      form.setFieldValue(`expenditures[${expenditureIndex}].lineItems[${idx}].objectId`, '')
                    })
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger className="w-full bg-white text-xs h-10 border-slate-200">
                    <SelectValue placeholder="Select Expenditure Category (e.g. MOOE, Personnel Services...)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const allObjects = allChildrenData?.data || objectsData?.data || []

                      const expensesRoot = allObjects.find(
                        (o: Objects) => o.code === 'CLS:Expenses' || o.name?.toLowerCase() === 'expenses',
                      )

                      const subClasses = allObjects.filter((obj: Objects) => {
                        const isChildOfExpenses = expensesRoot
                          ? obj.parent?.id === expensesRoot.id || obj.parentId === expensesRoot.id
                          : obj.parent?.code === 'CLS:Expenses' || obj.parent?.name?.toLowerCase() === 'expenses'

                        return isChildOfExpenses && !selectedOtherExps.includes(obj.id)
                      })

                      const options =
                        subClasses.length > 0
                          ? subClasses
                          : allObjects.filter(
                              (obj: Objects) =>
                                !selectedOtherExps.includes(obj.id) && obj.code?.startsWith('SC:'),
                            )

                      if (options.length === 0) {
                        return <span className="text-xs text-slate-500 px-3 py-2 block">No available categories</span>
                      }

                      return options.map((obj: Objects) => (
                        <SelectItem key={obj.id} value={obj.id} className="text-xs">
                          {obj.name}
                        </SelectItem>
                      ))
                    })()}
                  </SelectContent>
                </Select>
              </div>
            )
          }}
        </form.Field>

        {/* Expense Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Expense Items <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-medium gap-1.5 shadow-2xs"
              onClick={() =>
                form.setFieldValue(`expenditures[${expenditureIndex}].lineItems`, [
                  ...form.state.values.expenditures[expenditureIndex].lineItems,
                  {
                    objectId: '',
                    items: [{ name: '', unitEstimates: 0, quantity: 1, subTotal: 0 }],
                  },
                ])
              }
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </Button>
          </div>

          <form.Field name={`expenditures[${expenditureIndex}].lineItems`} mode="array">
            {(lineItemsField: FieldArrayLike<LineItem>) => (
              <div className="space-y-4">
                {lineItemsField.state.value.map((_, j) => (
                  <ExpenseItemBlock
                    key={j}
                    expenditureIndex={expenditureIndex}
                    lineItemIndex={j}
                    lineItemsField={lineItemsField}
                    form={form}
                    allChildrenData={allChildrenData}
                    categoryObjectId={currentCategory}
                  />
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Category Expenditure Total */}
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-3.5">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Expenditure Total
          </Label>
          <span className="text-base font-extrabold text-blue-700">
            {formatCurrencyPHP(categoryTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}