import { Plus, X } from 'lucide-react'
import type { APIResponse } from 'erpez-shared-lib'
import type { Objects } from '@/components/features/planning/wfp/wfp-expenditure/table/types'
import type { Expenditure, FieldArrayLike, FieldRenderProps, LineItem, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineItemBlock } from '@/components/features/planning/wfp/wfp-expenditure/form/LineItemBlock'

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
  objectsData,
  allChildrenData
}: ExpenditureBlockProps) {
  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />

      <div className="p-5 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Expenditure {expenditureIndex + 1}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => expendituresField.removeValue(expenditureIndex)}
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        {/* Level 1: Type of Expenditure */}
        <form.Field name={`expenditures[${expenditureIndex}].expenditureType`}>
          {(field: FieldRenderProps<string>) => {
            const selectedOtherExps = form.state.values.expenditures
              .map((exp: Expenditure, idx: number) => (idx !== expenditureIndex ? exp.expenditureType : null))
              .filter(Boolean)

            return (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  Expenditure <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value)
                    form.state.values.expenditures[expenditureIndex].lineItems.forEach((_: LineItem, idx: number) => {
                      form.setFieldValue(`expenditures[${expenditureIndex}].lineItems[${idx}].objectId`, '');
                    });
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select Type of Expenditure" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectsData?.data
                      .filter((obj: Objects) => !selectedOtherExps.includes(obj.id))
                      .map((obj: Objects) => (
                        <SelectItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </SelectItem>
                      ))}
                    {objectsData?.data.filter((obj: Objects) => !selectedOtherExps.includes(obj.id)).length === 0 && (
                      <span className="text-xs text-gray-500 pl-2">No available options</span>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )
          }}
        </form.Field>

        {/* Level 2: Line Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold">
              Line Items <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              className="bg-blue-600 text-white h-8 px-4 text-xs font-medium"
              onClick={() => form.setFieldValue(`expenditures[${expenditureIndex}].lineItems`, [
                ...form.state.values.expenditures[expenditureIndex].lineItems,
                { objectId: '', items: [] }
              ])}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line Item
            </Button>
          </div>

          <form.Field name={`expenditures[${expenditureIndex}].lineItems`} mode="array">
            {(lineItemsField: FieldArrayLike<LineItem>) => (
              <div className="space-y-6">
                {lineItemsField.state.value.map((_, j) => (
                  <LineItemBlock
                    key={j}
                    expenditureIndex={expenditureIndex}
                    lineItemIndex={j}
                    lineItemsField={lineItemsField}
                    form={form}
                    allChildrenData={allChildrenData}
                  />
                ))}
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </div>
  )
}