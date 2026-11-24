import { useMemo } from 'react'
import { Edit, Calendar, Tag, Layers, FileText } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP, formatDisplayDate } from '@/utils/formatters'
import type { LineItemBudgetDetails } from '../types/types'
import { getQuarterFromItem, getYearAwareQuarterFromItem } from '../utils/groupExpenditureData'
import { getObjectsRequest } from '@/features/planning/object/handlers/getObjectsRequest'
import type { Object as PlanningObject } from '@/features/planning/object/types/types'

const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)

interface ResolvedExpenseClass {
  name: string
  code?: string
  type?: string
}

export function resolveExpenseClass(
  item: LineItemBudgetDetails,
  allObjects?: PlanningObject[],
): ResolvedExpenseClass {
  // 1. Direct active expenseClass on item
  if (item.expenseClass?.name) {
    return {
      name: item.expenseClass.name,
      code: item.expenseClass.code,
      type: item.expenseClass.type,
    }
  }

  // 2. Resolve via allObjects hierarchy traversal: traverse up to the highest ancestor below Expenses root
  if (allObjects && allObjects.length > 0) {
    const rootExpenses = allObjects.find(
      (o) =>
        o.code === 'CLS:Expenses' ||
        o.name?.toLowerCase() === 'expenses' ||
        o.code === '50000000' ||
        o.code === '5000000000',
    )

    let current = allObjects.find(
      (o) => o.id === item.objectId || o.id === item.object?.id,
    )
    let highestNonRoot = current

    while (current) {
      const pId = (current.parent as any)?.id || (current as any).parentId
      if (!pId || pId === rootExpenses?.id) {
        break
      }
      const parentObj = allObjects.find((o) => o.id === pId)
      if (!parentObj) break
      if (
        parentObj.code === 'CLS:Expenses' ||
        parentObj.name?.toLowerCase() === 'expenses' ||
        parentObj.code === '50000000' ||
        parentObj.code === '5000000000'
      ) {
        break
      }
      highestNonRoot = parentObj
      current = parentObj
    }

    if (highestNonRoot && highestNonRoot.name) {
      return {
        name: highestNonRoot.name,
        code: highestNonRoot.code,
      }
    }
  }

  // 3. Fallback: item.object.parentObject (if not root container)
  const parentObj = item.object?.parentObject
  const isRootNode =
    parentObj &&
    (parentObj.name?.toLowerCase() === 'expenses' ||
      parentObj.code === 'CLS:Expenses' ||
      parentObj.code === '50000000' ||
      parentObj.code?.startsWith('50000000'))

  if (parentObj && !isRootNode && parentObj.name) {
    return {
      name: parentObj.name,
      code: parentObj.code,
    }
  }

  // 4. Standard Philippine UACS code prefix matching on object.code
  const cleanCode = (item.object?.code || '').replace(/[\s-]/g, '')
  const lowerName = (item.object?.name || '').toLowerCase()

  if (
    cleanCode.startsWith('501') ||
    cleanCode.startsWith('51') ||
    lowerName.includes('personnel services')
  ) {
    return { name: 'Personnel Services', code: '50100000', type: 'PS' }
  }
  if (
    cleanCode.startsWith('502') ||
    cleanCode.startsWith('52') ||
    lowerName.includes('maintenance and other operating') ||
    lowerName.includes('mooe')
  ) {
    return {
      name: 'Maintenance and Other Operating Expenses',
      code: '50200000',
      type: 'MOOE',
    }
  }
  if (
    cleanCode.startsWith('503') ||
    cleanCode.startsWith('53') ||
    lowerName.includes('financial expenses')
  ) {
    return { name: 'Financial Expenses', code: '50300000', type: 'FE' }
  }
  if (
    cleanCode.startsWith('506') ||
    cleanCode.startsWith('56') ||
    cleanCode.startsWith('106') ||
    lowerName.includes('capital outlay') ||
    lowerName.includes('capital outlays')
  ) {
    return { name: 'Capital Outlays', code: '50600000', type: 'CO' }
  }

  return { name: '—' }
}

interface ViewLineItemBudgetDetailsDialogProps {
  item: LineItemBudgetDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (item: LineItemBudgetDetails) => void
  readOnly?: boolean
}

export function ViewLineItemBudgetDetailsDialog({
  item,
  open,
  onOpenChange,
  onEdit,
  readOnly = false,
}: ViewLineItemBudgetDetailsDialogProps) {
  const { data: objectsResponse } = useGetObjects({
    pathParams: {},
    queryParams: { pageSize: 2000 },
    enabled: open,
  })

  const allObjects = useMemo(
    () =>
      objectsResponse?.data
        ? (objectsResponse.data as any).items || objectsResponse.data
        : [],
    [objectsResponse],
  )

  const resolvedClass = useMemo(
    () => (item ? resolveExpenseClass(item, allObjects) : null),
    [item, allObjects],
  )

  if (!item) return null

  const periodInfo = getYearAwareQuarterFromItem(item)
  const quarterLabel = periodInfo
    ? periodInfo.key
    : getQuarterFromItem(item)?.toUpperCase() || item.timelineType || 'Quarterly'

  const objectName = item.object?.name || 'Expenditure Item'
  const objectCode = item.object?.code

  const parentObjFromAll = useMemo(() => {
    if (item.object?.parentObject?.name) return item.object.parentObject
    if (!allObjects || allObjects.length === 0) return null
    const current = allObjects.find(
      (o) => o.id === item.objectId || o.id === item.object?.id,
    )
    const pId = (current?.parent as any)?.id || (current as any)?.parentId
    if (pId) {
      const p = allObjects.find((o) => o.id === pId)
      if (
        p &&
        p.name &&
        p.code !== 'CLS:Expenses' &&
        p.name.toLowerCase() !== 'expenses'
      ) {
        return { name: p.name, code: p.code }
      }
    }
    return null
  }, [item, allObjects])

  const parentName = parentObjFromAll?.name
  const parentCode = parentObjFromAll?.code

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Expenditure Line Item Details"
      description="Detailed breakdown and metadata for this line item allocation."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {!readOnly && onEdit && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false)
                onEdit(item)
              }}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4" />
              Edit Item
            </Button>
          )}
        </div>
      }
    >
      <div className="p-4 space-y-5">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                Item of Expenditure
              </span>
              {objectCode && (
                <Badge variant="outline" className="font-mono text-xs bg-white text-blue-700 border-blue-200">
                  {objectCode}
                </Badge>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {objectName}
            </h3>
            {parentName && (
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>Parent: {parentName} {parentCode ? `(${parentCode})` : ''}</span>
              </p>
            )}
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-blue-100/60 shadow-xs">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
              Allocated Budget
            </span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatCurrencyPHP(item.budget)}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Timeline & Schedule Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <Calendar className="h-4 w-4 text-blue-600" />
              Schedule &amp; Period
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 text-xs">Period / Quarter:</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold text-xs">
                  {quarterLabel}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 text-xs">Timeline Type:</span>
                <span className="font-medium capitalize text-gray-800 text-xs">
                  {item.timelineType || 'Quarterly'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 text-xs">Dates:</span>
                <span className="font-medium text-gray-800 text-xs">
                  {item.startDate ? formatDisplayDate(item.startDate) : '—'}
                  {item.endDate ? ` – ${formatDisplayDate(item.endDate)}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Classification & Accounting Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <Tag className="h-4 w-4 text-emerald-600" />
              Classification
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500 text-xs">Expense Class:</span>
                <span className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
                  <span>{resolvedClass?.name || '—'}</span>
                  {resolvedClass?.code && (
                    <span className="text-[11px] font-mono text-gray-500 font-normal">
                      ({resolvedClass.code})
                    </span>
                  )}
                </span>
              </div>

              {item.unitQuantity && (
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-500 text-xs">Quantity:</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {item.unitQuantity}
                  </span>
                </div>
              )}

              {item.unitCost && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 text-xs">Unit Cost:</span>
                  <span className="font-semibold text-gray-800 text-xs">
                    {formatCurrencyPHP(item.unitCost)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <FileText className="h-4 w-4 text-gray-500" />
            Description / Specifications
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded p-3 border border-gray-100">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Parent Context (Activity & LIB) */}
        {(item.lineItemBudgetActivity?.name || item.lineItemBudget?.libNumber) && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
            {item.lineItemBudget?.libNumber && (
              <div>
                <span className="text-gray-500">LIB: </span>
                <span className="font-semibold text-gray-800">
                  {item.lineItemBudget.libNumber}
                </span>
                {item.lineItemBudget.name && ` (${item.lineItemBudget.name})`}
              </div>
            )}
            {item.lineItemBudgetActivity?.name && (
              <div>
                <span className="text-gray-500">Activity: </span>
                <span className="font-semibold text-gray-800">
                  {item.lineItemBudgetActivity.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}
