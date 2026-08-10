import { X } from 'lucide-react'
import type { FieldArrayLike, FieldRenderProps, Item, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP } from '@/utils/formatters'

interface ItemRowProps {
  expenditureIndex: number
  lineItemIndex: number
  itemIndex: number
  itemsField: FieldArrayLike<Item>
  form: WFPExpenditureForm
}

export function ItemRow({ expenditureIndex, lineItemIndex, itemIndex, itemsField, form }: ItemRowProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm relative">
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 flex items-end gap-2 justify-between">
          <div className="flex-1">
            <Label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Items <span className="text-red-500">*</span>
            </Label>
            <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].name`}>
              {(f: FieldRenderProps<string>) => (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs py-2 px-3">
                  {f.state.value || 'Unnamed Item'}
                </Badge>
              )}
            </form.Field>
          </div>
          {(itemsField.state.value).length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => itemsField.removeValue(itemIndex)}
              title="Remove item"
            >
              <X className="w-3 h-3 text-gray-400" />
            </Button>
          )}
        </div>
        <div className="col-span-4">
          <Label className="text-[10px] text-gray-400 uppercase mb-1 block">Unit Cost</Label>
          <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].unitEstimates`}>
            {(f: FieldRenderProps<number | null>) => (
              <Input
                type="number"
                className="bg-white h-9"
                value={f.state.value ?? ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  f.handleChange(val);
                  const qty = form.state.values.expenditures[expenditureIndex].lineItems[lineItemIndex].items[itemIndex].quantity ?? 0;
                  form.setFieldValue(`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].subTotal`, val * qty);
                }}
              />
            )}
          </form.Field>
        </div>
        <div className="col-span-4">
          <Label className="text-[10px] text-gray-400 uppercase mb-1 block">Quantity</Label>
          <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].quantity`}>
            {(f: FieldRenderProps<number | null>) => (
              <Input
                type="number"
                className="bg-white h-9"
                value={f.state.value ?? ''}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value === '' ? 1 : Number(e.target.value);
                  f.handleChange(val);
                  const cost = form.state.values.expenditures[expenditureIndex].lineItems[lineItemIndex].items[itemIndex].unitEstimates ?? 0;
                  form.setFieldValue(`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].subTotal`, val * cost);
                }}
              />
            )}
          </form.Field>
        </div>
        <div className="col-span-4">
          <Label className="text-[10px] text-gray-400 uppercase mb-1 block">Sub-Total</Label>
          <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[${itemIndex}].subTotal`}>
            {(f: FieldRenderProps<number | null>) => (
              <Input
                type="text"
                className="bg-gray-50 h-9 font-bold text-gray-700"
                value={formatCurrencyPHP(f.state.value)}
                readOnly
              />
            )}
          </form.Field>
        </div>
      </div>
    </div>
  )
}