import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import type { APIResponse } from 'erpez-shared-lib'
import type { Objects } from '@/components/features/planning/wfp/wfp-expenditure/table/types'
import type { FieldArrayLike, FieldRenderProps, LineItem, WFPExpenditureForm } from '@/components/features/planning/wfp/wfp-expenditure/form/formTypes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrencyPHP } from '@/utils/formatters'

interface ExpenseItemBlockProps {
  expenditureIndex: number
  lineItemIndex: number
  overallIndex?: number
  lineItemsField: FieldArrayLike<LineItem>
  form: WFPExpenditureForm
  allChildrenData: APIResponse<Array<Objects>> | undefined
  categoryObjectId: string
}

export function ExpenseItemBlock({
  expenditureIndex,
  lineItemIndex,
  lineItemsField,
  form,
  allChildrenData,
  categoryObjectId,
}: ExpenseItemBlockProps) {
  // Track last auto-inherited item name to detect if user manually customized description
  const [autoInheritedName, setAutoInheritedName] = useState<string | null>(null)
  const [isCustomItem, setIsCustomItem] = useState<boolean>(false)
  const [customItemName, setCustomItemName] = useState<string>('')

  const allObjects = allChildrenData?.data ?? []

  // Available items under the selected category
  const categoryItems = useMemo(() => {
    if (!categoryObjectId) return []
    return allObjects.filter((o) => {
      const isChildOfCategory =
        o.parent?.id === categoryObjectId || o.parentId === categoryObjectId
      return isChildOfCategory
    })
  }, [allObjects, categoryObjectId])

  // Fallback: if category has no direct children, show all expense leaf items
  const availableItems = useMemo(() => {
    if (categoryItems.length > 0) return categoryItems
    return allObjects.filter((o) => o.code && !o.code.startsWith('CLS:'))
  }, [categoryItems, allObjects])

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 space-y-4 relative transition-all hover:border-slate-300 shadow-2xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          Expense Item {lineItemIndex + 1}
        </span>
        {lineItemsField.state.value.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 gap-1"
            onClick={() => lineItemsField.removeValue(lineItemIndex)}
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Item Selection (Standardized object) */}
        <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].objectId`}>
          {(f: FieldRenderProps<string>) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Item <span className="text-red-500">*</span>
              </Label>
              <Select
                value={isCustomItem ? '__custom__' : (f.state.value || '')}
                onValueChange={(val) => {
                  if (val === '__custom__') {
                    setIsCustomItem(true)
                    if (!f.state.value) {
                      f.handleChange(categoryObjectId || '')
                    }
                    return
                  }

                  setIsCustomItem(false)
                  f.handleChange(val)

                  const selectedObj = availableItems.find((item) => item.id === val)
                  if (selectedObj) {
                    const currentDesc = form.getFieldValue(
                      `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].name`,
                    ) as string | undefined

                    const isEmpty = !currentDesc || currentDesc.trim() === ''
                    const matchesPreviousAuto = autoInheritedName && currentDesc === autoInheritedName
                    const matchesAnyObjName = availableItems.some((i) => i.name === currentDesc)

                    if (isEmpty || matchesPreviousAuto || matchesAnyObjName) {
                      form.setFieldValue(
                        `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].name`,
                        selectedObj.name,
                      )
                      setAutoInheritedName(selectedObj.name)
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white text-xs h-9">
                  <SelectValue
                    placeholder={
                      !categoryObjectId
                        ? 'Select Expenditure Category first'
                        : availableItems.length > 0
                        ? 'Search or select item...'
                        : 'No items available under this category'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-xs">
                      {item.name} {item.code ? `(${item.code})` : ''}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__" className="text-xs font-medium text-blue-600">
                    Create New Item / Custom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Custom Item Name field if Create New Item selected */}
        {isCustomItem && (
          <div className="space-y-1.5 bg-blue-50/50 p-2.5 rounded border border-blue-100">
            <Label className="text-xs font-semibold text-blue-800">
              New Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              className="bg-white text-xs h-9 border-blue-200"
              placeholder="Enter new item name"
              value={customItemName}
              onChange={(e) => {
                const newName = e.target.value
                setCustomItemName(newName)
                const currentDesc = form.getFieldValue(
                  `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].name`,
                ) as string | undefined

                if (!currentDesc || currentDesc === autoInheritedName || currentDesc.trim() === '') {
                  form.setFieldValue(
                    `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].name`,
                    newName,
                  )
                  setAutoInheritedName(newName)
                }
              }}
            />
          </div>
        )}

        {/* Description Field (Transaction-specific, fully editable) */}
        <form.Field name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].name`}>
          {(f: FieldRenderProps<string>) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                {autoInheritedName && f.state.value === autoInheritedName && (
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Auto-inherited (Editable)
                  </span>
                )}
              </div>
              <Input
                type="text"
                className="bg-white text-xs h-9"
                placeholder="Enter detailed expense description (e.g. Travel to Cebu for coordination meeting)"
                value={f.state.value || ''}
                onChange={(e) => f.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        {/* Grid for Unit Cost, Quantity, and Subtotal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Unit Cost */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-slate-600 uppercase">
              Unit Cost <span className="text-red-500">*</span>
            </Label>
            <form.Field
              name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].unitEstimates`}
            >
              {(f: FieldRenderProps<number | null>) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-white text-xs h-9 font-medium"
                  placeholder="0.00"
                  value={f.state.value ?? ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const cost = e.target.value === '' ? 0 : Number(e.target.value)
                    f.handleChange(cost)
                    const qty =
                      (form.getFieldValue(
                        `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].quantity`,
                      ) as number | null) ?? 0
                    form.setFieldValue(
                      `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].subTotal`,
                      cost * qty,
                    )
                  }}
                />
              )}
            </form.Field>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-slate-600 uppercase">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <form.Field
              name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].quantity`}
            >
              {(f: FieldRenderProps<number | null>) => (
                <Input
                  type="number"
                  min="1"
                  className="bg-white text-xs h-9 font-medium text-center"
                  placeholder="1"
                  value={f.state.value ?? ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const qty = e.target.value === '' ? 1 : Number(e.target.value)
                    f.handleChange(qty)
                    const cost =
                      (form.getFieldValue(
                        `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].unitEstimates`,
                      ) as number | null) ?? 0
                    form.setFieldValue(
                      `expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].subTotal`,
                      cost * qty,
                    )
                  }}
                />
              )}
            </form.Field>
          </div>

          {/* Subtotal */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-slate-600 uppercase">Subtotal</Label>
            <form.Field
              name={`expenditures[${expenditureIndex}].lineItems[${lineItemIndex}].items[0].subTotal`}
            >
              {(f: FieldRenderProps<number | null>) => (
                <Input
                  type="text"
                  className="bg-slate-100 text-xs h-9 font-bold text-slate-800 cursor-not-allowed text-right"
                  value={formatCurrencyPHP(f.state.value || 0)}
                  readOnly
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>
    </div>
  )
}
