import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '@tanstack/react-form'
import type { APIResponse } from 'erpez-shared-lib'
import type { Objects } from '@/components/features/planning/wfp/wfp-expenditure/table/types'
import type { FieldArrayLike, FieldRenderProps, Item, LineItem, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import type { CreateWFPObjectiveTargetExpenditureValues } from './schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ItemRow } from '@/components/features/planning/wfp/wfp-expenditure/form/ItemRow'
import { formatCurrencyPHP } from '@/utils/formatters'
import { SelectProcurementItemDialog } from '@/components/features/planning/wfp/wfp-expenditure/dialog/SelectProcurementItemDialog'
import type { ProcurementItem } from '@/components/features/planning/wfp/wfp-expenditure/handlers/getProcurementItemsRequest'

interface LineItemBlockProps {
  expenditureIndex: number
  lineItemIndex: number
  lineItemsField: FieldArrayLike<LineItem>
  form: WFPExpenditureForm
  allChildrenData: APIResponse<Array<Objects>> | undefined
}

export function LineItemBlock({
  expenditureIndex,
  lineItemIndex,
  lineItemsField,
  form,
  allChildrenData
}: LineItemBlockProps) {
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  
  const currentType = useStore(form.store, (state) => (state as { values: CreateWFPObjectiveTargetExpenditureValues }).values.expenditures[expenditureIndex]?.expenditureType)
  const lineItems = useStore(form.store, (state) => (state as { values: CreateWFPObjectiveTargetExpenditureValues }).values.expenditures[expenditureIndex]?.lineItems) || []
  const items = useStore(form.store, (state) => (state as { values: CreateWFPObjectiveTargetExpenditureValues }).values.expenditures[expenditureIndex]?.lineItems[lineItemIndex]?.items) || []
  const lineItemTotal = items.reduce((sum: number, item: Item) => sum + (item.subTotal || 0), 0)

  const handleSelectProcurementItems = (procurementItems: ProcurementItem[]) => {
    const newItems = procurementItems.map((procurementItem) => ({
      name: procurementItem.name,
      unitEstimates: 0,
      quantity: 1,
      subTotal: 0
    }))
    form.setFieldValue(`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items`, [
      ...items,
      ...newItems
    ])
  }
  return (
    <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-5 relative space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
          Line Item {lineItemIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => lineItemsField.removeValue(lineItemIndex)}
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </Button>
      </div>

      {/* Level 2: Item of Expenditure (objectId) */}
      <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].objectId`}>
        {(f: FieldRenderProps<string>) => {
          // Get all selected objectIds in this expenditure block, excluding the current field's value
          const selectedObjectIds = lineItems
            .map((li: LineItem) => li.objectId)
            .filter((id) => id && (typeof f.state.value !== 'string' || id !== f.state.value))

          const childrenOptions =
            allChildrenData?.data?.filter(
              (child) =>
                child.parent?.id === currentType &&
                !selectedObjectIds.includes(child.id)
            ) || []
          return (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-gray-600 uppercase">
                Type of Expenditure <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(v) => {
                  f.handleChange(v)
                }}
                value={typeof f.state.value === 'string' ? f.state.value : undefined}
                disabled={!currentType}
              >
                <SelectTrigger className="w-full bg-white h-10">
                  <SelectValue placeholder={currentType ? "Select expenditure item..." : "Select Type First"} />
                </SelectTrigger>
                <SelectContent>
                  {childrenOptions.length > 0 ? (
                    childrenOptions.map((child) => (
                      <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 pl-2">No available options</span>
                  )}
                </SelectContent>
              </Select>
            </div>
          )
        }}
      </form.Field>

      {/* Level 3: Items Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-[11px] font-bold text-gray-600 uppercase">Items of Expenditure</Label>
          <Button
            type="button"
            className="bg-blue-600 text-white h-7 px-3 text-[10px] font-medium"
            onClick={() => setIsItemDialogOpen(true)}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Item
          </Button>
        </div>

        <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items`} mode="array">
            {(itemsField: FieldArrayLike<Item>) => (
            <div className="space-y-3">
              {itemsField.state.value.map((_it, k) => (
                <ItemRow
                  key={k}
                  expenditureIndex={expenditureIndex}
                  lineItemIndex={lineItemIndex}
                  itemIndex={k}
                  itemsField={itemsField}
                  form={form}
                />
              ))}
            </div>
          )}
        </form.Field>
      </div>

      {/* Line Item Total */}
      <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-md p-3">
        <Label className="text-sm font-bold text-blue-700">Line Item Total</Label>
        <span className="text-lg font-bold text-blue-800">{formatCurrencyPHP(lineItemTotal)}</span>
      </div>

      {/* Select Procurement Item Dialog */}
      <SelectProcurementItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSelectItems={handleSelectProcurementItems}
        excludeItemNames={items.map((item) => item.name)}
      />
    </div>
  )
}