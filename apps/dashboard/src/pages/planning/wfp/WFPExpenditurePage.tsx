import { useState, useMemo } from 'react'
import {
  Banknote,
  Plus,
  Package,
  Briefcase,
  Users,
  Landmark,
  Layers,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Wallet,
} from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useSetAtom } from 'jotai'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyPHP, toSentenceCase, toTitleCase } from '@/utils/formatters'
import { getWFPObjectiveTargetRequest } from '@/components/features/planning/wfp/wfp-objective-target/handlers/getWFPObjectiveTargetRequest'
import { getWFPObjectiveTargetExpendituresRequest } from '@/components/features/planning/wfp/wfp-expenditure/handlers/getWFPObjectiveTargetExpendituresRequest'
import { createDialogAtom } from '@/components/features/planning/wfp/wfp-expenditure/atoms'
import CreateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/CreateWFPObjectiveTargetExpenditureDialog'
import { Actions } from '@/components/features/planning/wfp/wfp-expenditure/table/Actions'
import UpdateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/UpdateWFPObjectiveTargetExpenditureDialog'
import DeleteWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/DeleteWFPObjectiveTargetExpenditureDialog'

const useWFPObjectiveTarget = createQueryHookFromTemplate(getWFPObjectiveTargetRequest)
const useWFPObjectiveTargetExpenditures = createQueryHookFromTemplate(
  getWFPObjectiveTargetExpendituresRequest,
)

// Helper to assign category color scheme matching mockup in Screenshot 1
const getCategoryTheme = (categoryName: string, index: number) => {
  const nameLower = categoryName.toLowerCase()
  if (nameLower.includes('maintenance') || nameLower.includes('mooe')) {
    return {
      bar: 'bg-red-600',
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      totalText: 'text-red-600',
      subtotalText: 'text-red-600',
      Icon: Briefcase,
    }
  }
  if (nameLower.includes('personnel') || nameLower.includes('services')) {
    return {
      bar: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      totalText: 'text-blue-600',
      subtotalText: 'text-blue-600',
      Icon: Users,
    }
  }
  if (nameLower.includes('financial') || nameLower.includes('direct') || nameLower.includes('cost')) {
    return {
      bar: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      totalText: 'text-emerald-600',
      subtotalText: 'text-emerald-600',
      Icon: Landmark,
    }
  }

  // Fallback cyclic color scheme
  const themes = [
    { bar: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-600 border border-blue-100', totalText: 'text-blue-600', subtotalText: 'text-blue-600', Icon: Layers },
    { bar: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', totalText: 'text-emerald-600', subtotalText: 'text-emerald-600', Icon: Landmark },
    { bar: 'bg-amber-600', iconBg: 'bg-amber-50 text-amber-600 border border-amber-100', totalText: 'text-amber-600', subtotalText: 'text-amber-600', Icon: Layers },
  ]
  return themes[index % themes.length]
}

export default function WFPExpenditurePage({
  wfpObjectiveActivityId,
}: {
  wfpObjectiveActivityId: string
}) {
  const { data: targetData, isLoading: isLoadingTarget } = useWFPObjectiveTarget({
    pathParams: { id: wfpObjectiveActivityId },
    queryParams: {},
  })

  const { data: expendituresResponse, isLoading: isLoadingExpenditures } =
    useWFPObjectiveTargetExpenditures({
      pathParams: {},
      queryParams: {
        filters: `wfpObjectiveActivityId==${wfpObjectiveActivityId}`,
      },
    })

  const setCreateDialog = useSetAtom(createDialogAtom)

  // Track collapsed state per category
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  const expenditures = expendituresResponse?.data || []
  type ExpenditureItem = (typeof expenditures)[number]

  // Group expenditures by Expenditure Category (Sub-Class parent name or object name)
  const groupedCategories = useMemo(() => {
    const map: Record<
      string,
      {
        categoryName: string
        items: ExpenditureItem[]
        categoryTotal: number
      }
    > = {}

    expenditures.forEach((item) => {
      const categoryName =
        item.object?.parent?.name || item.object?.name || 'General Expenditures'

      if (!map[categoryName]) {
        map[categoryName] = {
          categoryName,
          items: [],
          categoryTotal: 0,
        }
      }
      const itemSubtotal = (item.unitCost || 0) * (item.quantity || 0)
      map[categoryName].items.push(item)
      map[categoryName].categoryTotal += itemSubtotal
    })

    return Object.values(map)
  }, [expenditures])

  const grandTotal = useMemo(() => {
    return expenditures.reduce((total: number, item: ExpenditureItem) => {
      return total + (item.unitCost * item.quantity || 0)
    }, 0)
  }, [expenditures])

  const toggleCategoryCollapse = (categoryName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }))
  }

  if (isLoadingTarget || !targetData?.data || isLoadingExpenditures) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Expenditure Details...</div>
  }

  return (
    <PageContainer
      title={toTitleCase(targetData.data.activityName) || 'Activity Expenditures'}
      description="List of Expenditures for this Activity"
      backTo={{
        to: '/v2/wfp-objective/$wfpObjectiveId',
        params: {
          wfpObjectiveId:
            targetData.data.wfpObjectiveId || targetData.data.wfpObjective?.id,
        },
      }}
      backLabel="Back to Activity Registry"
    >
      <div className="space-y-6 mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expenditures</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                {groupedCategories.length} {groupedCategories.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
              </span>
              <span className="text-red-500 font-bold">•</span>
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                {expenditures.length} {expenditures.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex gap-2 text-xs shadow-sm rounded-lg px-4 py-2 transition-all"
            onClick={() => setCreateDialog({ isOpen: true, showUnsavedWarning: false })}
          >
            <Plus className="h-4 w-4" />
            <span>Create Expenditure</span>
          </Button>
        </div>

        {/* Grouped Category Cards */}
        <div className="space-y-4">
          {groupedCategories.map((category, index) => {
            const theme = getCategoryTheme(category.categoryName, index)
            const isCollapsed = !!collapsedCategories[category.categoryName]
            const CategoryIcon = theme.Icon

            return (
              <Card
                key={category.categoryName}
                className="shadow-2xs border-slate-200/90 bg-white rounded-xl overflow-hidden relative transition-all"
              >
                {/* Left side accent bar matching category theme */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bar}`} />

                {/* Card Header */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{category.categoryName}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-extrabold tabular-nums ${theme.totalText}`}>
                      {formatCurrencyPHP(category.categoryTotal)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-700"
                      onClick={() => toggleCategoryCollapse(category.categoryName)}
                      title={isCollapsed ? 'Expand category' : 'Collapse category'}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Table Section */}
                {!isCollapsed && (
                  <div className="border-t border-slate-100">
                    {/* Header Columns */}
                    <div className="bg-slate-50/60 px-6 py-2.5 grid grid-cols-12 gap-4 items-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-6">Item / Description</div>
                      <div className="col-span-2 text-right">Unit Cost</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right pr-6">Sub-Total</div>
                    </div>

                    {/* Items Rows */}
                    <div className="divide-y divide-slate-100">
                      {category.items.map((item: ExpenditureItem, idx: number) => {
                        const itemName = item.object?.name || 'Standard Expense Item'
                        const subtotal = (item.unitCost || 0) * (item.quantity || 0)

                        return (
                          <div
                            key={idx}
                            className="px-6 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/40 transition-colors"
                          >
                            <div className="col-span-6 space-y-0.5">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                {itemName}
                              </h4>
                              {item.itemDescription && (
                                <p className="text-xs text-slate-500 leading-snug">
                                  {toSentenceCase(item.itemDescription)}
                                </p>
                              )}
                            </div>
                            <div className="col-span-2 text-right text-xs font-semibold text-slate-700 tabular-nums">
                              {formatCurrencyPHP(item.unitCost)}
                            </div>
                            <div className="col-span-2 text-center text-xs font-medium text-slate-700 tabular-nums">
                              {item.quantity}
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                              <span className={`text-xs font-bold tabular-nums ${theme.subtotalText}`}>
                                {formatCurrencyPHP(subtotal)}
                              </span>
                              <Actions data={item as any} actions={['read', 'write', 'delete']} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {/* Add Another Expenditure Dashed Button */}
          <button
            type="button"
            className="w-full border border-dashed border-blue-300 bg-blue-50/20 hover:bg-blue-50 text-blue-600 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => setCreateDialog({ isOpen: true, showUnsavedWarning: false })}
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Expenditure</span>
          </button>

          {/* Empty State */}
          {expenditures.length === 0 && (
            <div className="text-center py-12 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 font-medium">
                No expenditures found for this activity.
              </p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5"
                onClick={() => setCreateDialog({ isOpen: true, showUnsavedWarning: false })}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Expenditure</span>
              </Button>
            </div>
          )}

          {/* Red Bottom Total Bar matching Screenshot 1 */}
          {expenditures.length > 0 && (
            <div>
              <div className="bg-[#c8232c] rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5 font-extrabold text-sm tracking-wider uppercase">
                  <Wallet className="h-5 w-5 text-white" />
                  <span>TOTAL EXPENDITURES</span>
                </div>
                <span className="text-2xl font-black tabular-nums text-white">
                  {formatCurrencyPHP(grandTotal)}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                All amounts are in Philippine Peso (PHP)
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateWFPObjectiveTargetExpenditureDialog wfpObjectiveId={wfpObjectiveActivityId} />
      <DeleteWFPObjectiveTargetExpenditureDialog />
      <UpdateWFPObjectiveTargetExpenditureDialog />
    </PageContainer>
  )
}