import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '@tanstack/react-form'
import type { APIResponse } from 'erpez-shared-lib'
import type { Objects } from '@/components/features/planning/wfp/wfp-expenditure/table/types'
import type { FieldArrayLike, FieldRenderProps, Item, LineItem, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import type { CreateWFPObjectiveTargetExpenditureValues } from './schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
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
          const allObjects = allChildrenData?.data ?? []

          // Step 1: Find the Expenses root node
          const expensesRoot = allObjects.find(
            o => o.code === 'CLS:Expenses' || o.name?.toLowerCase() === 'expenses'
          )

          // Step 2: Collect relevant Sub-Classes (filtered by selected currentType if set)
          const allExpenseSubClasses = allObjects.filter(
            o => (expensesRoot && (o.parent?.id === expensesRoot.id || o.parentId === expensesRoot.id)) ||
                 o.parent?.code === 'CLS:Expenses' ||
                 o.parent?.name?.toLowerCase() === 'expenses'
          )

          const relevantSubClasses = currentType 
            ? allExpenseSubClasses.filter(sc => sc.id === currentType)
            : allExpenseSubClasses

          const relevantSubClassIds = new Set(
            (relevantSubClasses.length > 0 ? relevantSubClasses : allExpenseSubClasses).map(sc => sc.id)
          )

          // Step 3: Collect group IDs directly under those sub-classes
          const expenseGroupMap = new Map<string, { id: string; name: string }>()
          allObjects
            .filter(o => o.parent?.id && relevantSubClassIds.has(o.parent.id))
            .forEach(g => expenseGroupMap.set(g.id, { id: g.id, name: g.name }))

          // Step 4: Get leaf items and group by Sub-Class → Group
          const subClassNameById = new Map<string, string>(
            allExpenseSubClasses.map(o => [o.id, o.name])
          )

          const groupParentSubClass = new Map<string, string>()
          allObjects
            .filter(o => o.parent?.id && relevantSubClassIds.has(o.parent.id))
            .forEach(g => {
              const scName = subClassNameById.get(g.parent!.id) ?? ''
              groupParentSubClass.set(g.id, scName)
            })

          const leafItems = allObjects.filter(
            o => o.parent?.id && expenseGroupMap.has(o.parent.id)
          )

          const grouped: Record<string, Record<string, Objects[]>> = {}
          for (const item of leafItems) {
            const groupId = item.parent!.id
            const groupName = expenseGroupMap.get(groupId)?.name ?? 'Other'
            const scName = groupParentSubClass.get(groupId) ?? 'Other'
            if (!grouped[scName]) grouped[scName] = {}
            if (!grouped[scName][groupName]) grouped[scName][groupName] = []
            grouped[scName][groupName].push(item)
          }

          const hasOptions = leafItems.length > 0

          return (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-gray-600 uppercase">
                Type of Expenditure <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(v) => {
                  f.handleChange(v);
                }}
                value={typeof f.state.value === 'string' ? f.state.value : undefined}
              >
                <SelectTrigger className="w-full bg-white h-10">
                  <SelectValue placeholder={hasOptions ? 'Select expenditure item...' : 'Loading options...'} />
                </SelectTrigger>
                <SelectContent>
                  {hasOptions ? (
                    Object.entries(grouped).map(([subClass, groups]) => (
                      <SelectGroup key={subClass}>
                        {/* Sub-Class header */}
                        <SelectLabel className="text-[10px] uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 -mx-1">
                          {subClass}
                        </SelectLabel>
                        {Object.entries(groups).map(([groupName, items]) => (
                          <SelectGroup key={groupName}>
                            {/* Group sub-header */}
                            <SelectLabel className="text-[11px] font-semibold text-gray-500 pl-3">
                              {groupName}
                            </SelectLabel>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id} className="pl-6 text-sm">
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectGroup>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 px-3 py-2 block">No expense items available</span>
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