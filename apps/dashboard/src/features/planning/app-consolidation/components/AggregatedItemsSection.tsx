/**
 * AggregatedItemsSection
 * Displays APP analytics and breakdown metrics fetched from GET /apps/{id}/analytics.
 *
 * Features:
 * - Summary KPI cards: Total Budget, Items Count, PPMPs Count, Offices Count
 * - Financial Breakdown: PS, MOOE, CO
 * - Categorized Breakdown Panels: By Office, By Category, By Procurement Type, By Fund Source
 * - Safe numeric handling for valid zero values and optional fields
 */

import { BarChart3, Building, Tag, ShoppingCart, Banknote, TrendingUp, Layers, FileSpreadsheet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAPPAnalyticsRequest } from '../handlers/getAPPAnalyticsRequest'
import type {
  APPAnalyticsResponse,
  OfficeBreakdownItem,
  CategoryBreakdownItem,
  ProcurementTypeBreakdownItem,
  FundSourceBreakdownItem,
} from '../handlers/getAPPAnalyticsRequest'
import type { AppMaster } from '../types'

const useAPPAnalytics = createQueryHookFromTemplate(getAPPAnalyticsRequest)

interface AggregatedItemsSectionProps {
  appId: string
  app: AppMaster
  isDraft?: boolean
  onEdit?: () => void
}

const safeFormatPHP = (amount?: number | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00'
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const safeFormatPct = (part?: number | null, total?: number | null) => {
  if (typeof part !== 'number' || typeof total !== 'number' || total <= 0 || isNaN(part) || isNaN(total)) {
    return '0.0%'
  }
  return `${((part / total) * 100).toFixed(1)}%`
}

interface GenericBreakdownRow {
  name: string
  itemsCount: number
  totalAmount: number
}

function BreakdownPanel({
  title,
  icon: Icon,
  rows,
  totalBudget,
  colorClass,
}: {
  title: string
  icon: React.ElementType
  rows: GenericBreakdownRow[]
  totalBudget: number
  colorClass: string
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className={`rounded-xl border-l-4 p-4 ${colorClass} bg-white/80 shadow-sm`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-gray-600" />
          <p className="text-sm font-bold text-gray-800">{title}</p>
        </div>
        <p className="text-xs text-gray-500 italic">No breakdown data available</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border-l-4 p-4 ${colorClass} bg-white/80 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-600" />
        <p className="text-sm font-bold text-gray-800">{title}</p>
      </div>
      <div className="space-y-2.5">
        {rows.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Badge variant="outline" className="text-xs shrink-0">{idx + 1}</Badge>
              <span className="text-xs font-medium text-gray-700 truncate" title={item.name}>
                {item.name || 'Unspecified'}
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-gray-900">{safeFormatPHP(item.totalAmount)}</p>
              <p className="text-[10px] text-gray-500">
                {item.itemsCount ?? 0} item{(item.itemsCount ?? 0) !== 1 ? 's' : ''} • {safeFormatPct(item.totalAmount, totalBudget)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AggregatedItemsSection({ appId }: AggregatedItemsSectionProps) {
  const { data: analyticsResponse, isLoading, error } = useAPPAnalytics({
    pathParams: { id: appId },
    queryParams: { id: appId },
  })

  const analytics: APPAnalyticsResponse | undefined = analyticsResponse?.data

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border p-6">
        <BarChart3 className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 font-semibold text-sm">
          {error ? 'Failed to load APP analytics data' : 'No analytics data available for this APP'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Analytics are automatically calculated from consolidated PPMP items.
        </p>
      </div>
    )
  }

  const { financialBreakdown } = analytics
  const totalBudget = analytics.totalEstimatedBudget ?? 0
  const psAmount = financialBreakdown?.ps ?? 0
  const mooeAmount = financialBreakdown?.mooe ?? 0
  const coAmount = financialBreakdown?.co ?? 0
  const totalFinancial = psAmount + mooeAmount + coAmount || totalBudget

  // Map breakdown items safely
  const officeRows: GenericBreakdownRow[] = (analytics.breakdownByOffice || []).map((o: OfficeBreakdownItem) => ({
    name: o.officeName,
    itemsCount: o.itemsCount,
    totalAmount: o.totalAmount,
  }))

  const categoryRows: GenericBreakdownRow[] = (analytics.breakdownByCategory || []).map((c: CategoryBreakdownItem) => ({
    name: c.categoryName,
    itemsCount: c.itemsCount,
    totalAmount: c.totalAmount,
  }))

  const procurementRows: GenericBreakdownRow[] = (analytics.breakdownByProcurementType || []).map((p: ProcurementTypeBreakdownItem) => ({
    name: p.procurementModeName,
    itemsCount: p.itemsCount,
    totalAmount: p.totalAmount,
  }))

  const fundRows: GenericBreakdownRow[] = (analytics.breakdownByFundSource || []).map((f: FundSourceBreakdownItem) => ({
    name: f.fundSourceName,
    itemsCount: f.itemsCount,
    totalAmount: f.totalAmount,
  }))

  return (
    <div className="space-y-6" id="aggregations-section">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-purple-50/70 border-purple-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-600 text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Total Estimated Budget</p>
              <p className="text-lg font-black text-purple-950 mt-0.5">{safeFormatPHP(totalBudget)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/70 border-blue-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Total Items</p>
              <p className="text-lg font-black text-blue-950 mt-0.5">{analytics.totalItemsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/70 border-emerald-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">Consolidated PPMPs</p>
              <p className="text-lg font-black text-emerald-950 mt-0.5">{analytics.totalPpmpsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/70 border-amber-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-600 text-white shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Implementing Offices</p>
              <p className="text-lg font-black text-amber-950 mt-0.5">{analytics.totalOfficesCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown (PS / MOOE / CO) */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-purple-900">Financial Breakdown (PS / MOOE / CO)</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Personal Services (PS)', value: psAmount, color: 'text-blue-700', bg: 'bg-blue-50/50 border-blue-100' },
            { label: 'MOOE', value: mooeAmount, color: 'text-emerald-700', bg: 'bg-emerald-50/50 border-emerald-100' },
            { label: 'Capital Outlay (CO)', value: coAmount, color: 'text-amber-700', bg: 'bg-amber-50/50 border-amber-100' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-lg p-3 text-center border shadow-xs ${bg}`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
              <p className={`text-base font-black ${color}`}>{safeFormatPHP(value)}</p>
              <p className="text-[10px] font-medium text-gray-400 mt-1">
                {safeFormatPct(value, totalFinancial)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-purple-200 flex justify-between items-center">
          <span className="text-xs font-bold text-purple-900">Total Financial Allotment</span>
          <span className="text-sm font-black text-purple-700">{safeFormatPHP(totalFinancial)}</span>
        </div>
      </div>

      {/* Four Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownPanel
          title="By Implementing Office"
          icon={Building}
          rows={officeRows}
          totalBudget={totalBudget}
          colorClass="border-l-blue-500"
        />
        <BreakdownPanel
          title="By Category"
          icon={Tag}
          rows={categoryRows}
          totalBudget={totalBudget}
          colorClass="border-l-emerald-500"
        />
        <BreakdownPanel
          title="By Procurement Type"
          icon={ShoppingCart}
          rows={procurementRows}
          totalBudget={totalBudget}
          colorClass="border-l-amber-500"
        />
        <BreakdownPanel
          title="By Fund Source"
          icon={Banknote}
          rows={fundRows}
          totalBudget={totalBudget}
          colorClass="border-l-rose-500"
        />
      </div>
    </div>
  )
}
