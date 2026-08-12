import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Eye } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import type { APPItemFromAPI } from '../handlers/getAPPDetailRequest'
import type { MetaActions } from '@/types/global'
import type { BACLineItem, AggregatedItem } from '../types'
import { createColumnHelper } from '@tanstack/react-table'
import { useSetAtom } from 'jotai'
import { addAPPItemDialogOpenAtom } from '../atoms'
import { NGPAColumnHeader, NGPAGuideButton } from './NGPAColumnTooltip'

interface ConsolidatedAPPItemsCardProps {
  APPItems?: APPItemFromAPI[]
  bacLineItems?: BACLineItem[]
  aggregationItems?: AggregatedItem[]
  isCurrentlyDraft: boolean
  canDelete: boolean
  itemSearchTerm: string
  setItemSearchTerm: (term: string) => void
  onViewDetails: (item: APPItemFromAPI) => void
}

export function ConsolidatedAPPItemsCard({
  APPItems,
  bacLineItems,
  aggregationItems,
  isCurrentlyDraft,
  canDelete,
  itemSearchTerm,
  setItemSearchTerm,
  onViewDetails,
}: ConsolidatedAPPItemsCardProps) {
  const setAddAPPItemDialog = useSetAtom(addAPPItemDialogOpenAtom)

  // Filter APP items locally
  const filteredAPPItems = useMemo<APPItemFromAPI[]>(() => {
    let baseItems: APPItemFromAPI[] = APPItems || []
    if (baseItems.length === 0 && bacLineItems) {
      baseItems = (bacLineItems as BACLineItem[]).map((item) => ({
        id: item.id,
        ppmpItemId: item.catalogItemId || item.id,
        ppmpItemName: item.description,
        procurementModeId: undefined,
        procurementModeName: item.modeOfProcurement || '',
        fundSourceId: undefined,
        fundSourceName: item.fundSource || '',
        officeId: undefined,
        officeName: item.office || '',
        papCode: item.code || '',
        remarks: item.remarks || '',
        isEarlyProcurementActivity: item.eligibleForEPA,
        isOutsourced: undefined,
        schedules: item.schedules,
        code: item.code || '',
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalAmount: item.totalAmount,
        modeOfProcurement: item.modeOfProcurement || '',
        fundSource: item.fundSource || '',
        itemCategory: undefined,
        office: item.office || '',
        allotmentClass: item.allotmentClass || 'CO',
      }))
    }
    if (baseItems.length === 0 && aggregationItems) {
      baseItems = (aggregationItems as AggregatedItem[]).flatMap((agg) =>
        agg.items.map((item) => ({
          id: item.id,
          ppmpItemId: item.id,
          ppmpItemName: item.description,
          procurementModeId: undefined,
          procurementModeName: item.modeOfProcurement || '',
          fundSourceId: undefined,
          fundSourceName: item.fundSource || '',
          officeId: undefined,
          officeName: item.office || '',
          papCode: item.code || '',
          remarks: undefined,
          isEarlyProcurementActivity: false,
          isOutsourced: undefined,
          schedules: [],
          code: item.code || '',
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalAmount: item.totalAmount,
          modeOfProcurement: item.modeOfProcurement || '',
          fundSource: item.fundSource || '',
          itemCategory: item.itemCategory,
          office: item.office || '',
          allotmentClass: item.allotmentClass || 'CO',
        }))
      )
    }

    return baseItems.filter((item) => {
      const name = (item.ppmpItemName || item.description || '').toLowerCase()
      const office = (item.officeName || item.office || '').toLowerCase()
      const mop = (item.procurementModeName || item.modeOfProcurement || '').toLowerCase()
      const fund = (item.fundSourceName || item.fundSource || '').toLowerCase()
      const remarks = (item.remarks || '').toLowerCase()
      const pap = (item.papCode || item.code || '').toLowerCase()

      return name.includes(itemSearchTerm.toLowerCase()) ||
             office.includes(itemSearchTerm.toLowerCase()) ||
             mop.includes(itemSearchTerm.toLowerCase()) ||
             fund.includes(itemSearchTerm.toLowerCase()) ||
             remarks.includes(itemSearchTerm.toLowerCase()) ||
             pap.includes(itemSearchTerm.toLowerCase())
    })
  }, [APPItems, bacLineItems, aggregationItems, itemSearchTerm])

  // APP Items Columns
  const appItemColumnHelper = createColumnHelper<APPItemFromAPI>()
  const appItemColumns = useMemo(() => [
    appItemColumnHelper.accessor('ppmpItemName', {
      header: () => <NGPAColumnHeader columnNumber={2} label="Item Code/Name" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{row.original.ppmpItemName || '—'}</span>
            {row.original.isNew && (
              <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                NEW
              </span>
            )}
            {row.original.isRevised && (
              <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                REVISED
              </span>
            )}
          </div>
          {row.original.papCode && (
            <span className="text-[10px] text-gray-400 font-mono">PAP Code: {row.original.papCode}</span>
          )}
        </div>
      ),
      size: 200,
    }),
    appItemColumnHelper.accessor('officeName', {
      header: () => <NGPAColumnHeader columnNumber={2} label="PMO / End-User" />,
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue() || '—'}</span>,
      size: 150,
    }),
    appItemColumnHelper.accessor('procurementModeName', {
      header: () => <NGPAColumnHeader columnNumber={4} label="Procurement Mode" />,
      cell: ({ getValue }) => <span className="text-sm font-medium text-gray-600">{getValue() || '—'}</span>,
      size: 180,
    }),
    appItemColumnHelper.accessor('fundSourceName', {
      header: () => <NGPAColumnHeader columnNumber={9} label="Fund Source" />,
      cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() || '—'}</span>,
      size: 150,
    }),
    appItemColumnHelper.accessor('totalAmount', {
      header: () => <NGPAColumnHeader columnNumber={10} label="ABC / Estimated Budget" />,
      cell: ({ row }) => {
        const val = row.original.effectiveABC ?? row.original.estimatedBudgetOverride ?? row.original.totalAmount ?? ((row.original.quantity || 1) * (row.original.unitCost || 0))
        const isOverridden = row.original.isABCOverridden || row.original.estimatedBudgetOverride != null
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-emerald-700">
              {val ? `₱${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
            </span>
            {isOverridden ? (
              <span className="text-[10px] text-amber-700 font-medium">APP Override</span>
            ) : (
              <span className="text-[10px] text-slate-400">Inherited from PPMP</span>
            )}
          </div>
        )
      },
      size: 160,
    }),
    appItemColumnHelper.display({
      id: 'procurementSchedule',
      header: () => <NGPAColumnHeader columnNumber={6} label="Procurement Schedule" />,
      cell: ({ row }) => {
        const formatDate = (dateStr?: string | null) => {
          if (!dateStr) return null
          try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return dateStr
            return d.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })
          } catch {
            return dateStr
          }
        }
        const start = formatDate(row.original.effectiveStartOfProcurement || row.original.startOfProcurementOverride)
        const end = formatDate(row.original.effectiveEndOfProcurement || row.original.endOfProcurementOverride)

        return (
          <div className="text-[11px] space-y-0.5">
            <div><span className="text-slate-500 font-medium">Start:</span> <span className="text-slate-900 font-medium">{start || 'Not set'}</span></div>
            <div><span className="text-slate-500 font-medium">End:</span> <span className="text-slate-900 font-medium">{end || 'Not set'}</span></div>
          </div>
        )
      },
      size: 140,
    }),
    appItemColumnHelper.accessor('isEarlyProcurementActivity', {
      header: () => <NGPAColumnHeader columnNumber={5} label="EPA" />,
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          getValue() ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-400'
        }`}>
          {getValue() ? 'EPA' : 'No'}
        </span>
      ),
      size: 80,
    }),
    appItemColumnHelper.accessor('isOutsourced', {
      header: () => <NGPAColumnHeader columnNumber={3} label="Outsourced" />,
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          getValue() ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-400'
        }`}>
          {getValue() ? 'Yes' : 'No'}
        </span>
      ),
      size: 95,
    }),
    appItemColumnHelper.accessor('remarks', {
      header: () => <NGPAColumnHeader columnNumber={12} label="Remarks" />,
      cell: ({ getValue }) => <span className="text-xs text-gray-500 italic max-w-[200px] truncate block">{getValue() || '—'}</span>,
    }),
    appItemColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(row.original)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 p-0 cursor-pointer"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
      size: 80,
    })
  ], [onViewDetails])

  const metaActions: MetaActions = canDelete ? ['write', 'delete', 'read'] : ['read']

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden border-t-4 border-t-emerald-500 transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">Consolidated APP Items</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Consolidated procurement schedule and item categorization</p>
        </div>
        <div className="flex items-center gap-2">
          <NGPAGuideButton />
          {isCurrentlyDraft && (
            <Button
              type="button"
              onClick={() => setAddAPPItemDialog(true)}
              variant="outline"
              size="sm"
              className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 font-semibold cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add APP Items
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TemplateTable
          columns={appItemColumns}
          data={filteredAPPItems}
          actions={metaActions}
          readonly={!canDelete}
          fixedPageSize={10}
          toolbar={() => (
            <div className="flex items-center gap-2 w-full max-w-sm pointer-events-auto">
              <Input
                placeholder="Search items by code, name, PMO, mode..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                className="h-9"
              />
              {itemSearchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setItemSearchTerm('')} className="h-9 px-2">
                  Clear
                </Button>
              )}
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}
