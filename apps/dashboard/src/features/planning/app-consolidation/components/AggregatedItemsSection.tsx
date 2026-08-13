/**
 * AggregatedItemsSection
 * Displays read-only APP summary metrics and breakdown analytics fetched from GET /apps/{id}/analytics.
 *
 * Features:
 * - Read-only Summary view
 * - Soft-tinted KPI Cards: Total Estimated Budget, Total Items, Consolidated PPMPs, Implementing Offices
 * - Financial Breakdown: Personal Services (PS), MOOE, Capital Outlay (CO), Total Allotment
 * - Categorized Breakdown Panels: By Office (Blue), By Category (Green), By Procurement Type (Amber), By Fund Source (Purple)
 * - Safe numeric handling and accessible typography for older users
 */

import { BarChart3, Building, Tag, ShoppingCart, Banknote, TrendingUp, Layers, FileSpreadsheet } from 'lucide-react'
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
  accentBorderClass,
  iconBgClass,
  iconColorClass,
}: {
  title: string
  icon: React.ElementType
  rows: GenericBreakdownRow[]
  totalBudget: number
  accentBorderClass: string
  iconBgClass: string
  iconColorClass: string
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200 border-l-4 ${accentBorderClass} bg-white p-5 shadow-xs`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-md ${iconBgClass}`}>
            <Icon className={`w-4 h-4 ${iconColorClass}`} />
          </div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        </div>
        <p className="text-xs text-slate-500 italic">No breakdown data available</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${accentBorderClass} bg-white p-5 shadow-xs space-y-3`}>
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-150">
        <div className={`p-1.5 rounded-md ${iconBgClass}`}>
          <Icon className={`w-4 h-4 ${iconColorClass}`} />
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>

      <div className="space-y-3 divide-y divide-slate-100">
        {rows.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 pt-2.5 first:pt-0">
            {/* Primary Name */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-xs md:text-sm font-semibold text-slate-900 truncate block" title={item.name}>
                {item.name || 'Unspecified'}
              </span>
              <p className="text-xs text-slate-600 font-medium">
                {item.itemsCount ?? 0} item{(item.itemsCount ?? 0) !== 1 ? 's' : ''} • {safeFormatPct(item.totalAmount, totalBudget)}
              </p>
            </div>

            {/* Prominent Amount */}
            <div className="text-right shrink-0">
              <p className="text-xs md:text-sm font-bold text-slate-900">{safeFormatPHP(item.totalAmount)}</p>
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
      <div className="text-center py-10 bg-white rounded-xl border border-slate-200 p-6">
        <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-700 font-semibold text-sm">
          {error ? 'Failed to load APP summary analytics' : 'No summary analytics data available for this APP'}
        </p>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Summary metrics are automatically consolidated from source PPMPs.
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
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Budget - Strongest emphasis */}
        <Card className="bg-purple-50/70 border-purple-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider block">
                Total Estimated Budget
              </span>
              <p className="text-xl md:text-2xl font-bold text-purple-950">{safeFormatPHP(totalBudget)}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <BarChart3 className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card className="bg-blue-50/70 border-blue-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
                Total Items
              </span>
              <p className="text-xl font-bold text-blue-950">{analytics.totalItemsCount ?? 0}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Layers className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        {/* Consolidated PPMPs */}
        <Card className="bg-emerald-50/70 border-emerald-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Consolidated PPMPs
              </span>
              <p className="text-xl font-bold text-emerald-950">{analytics.totalPpmpsCount ?? 0}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <FileSpreadsheet className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>

        {/* Implementing Offices */}
        <Card className="bg-amber-50/70 border-amber-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                Implementing Offices
              </span>
              <p className="text-xl font-bold text-amber-950">{analytics.totalOfficesCount ?? 0}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Building className="w-5.5 h-5.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown (PS / MOOE / CO) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-150">
          <TrendingUp className="w-5 h-5 text-purple-700" />
          <h3 className="text-base font-semibold text-slate-900">Financial Breakdown (PS / MOOE / CO)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Personal Services (PS)', value: psAmount, color: 'text-blue-900', bg: 'bg-blue-50/60 border-blue-200', tagColor: 'text-blue-800' },
            { label: 'MOOE', value: mooeAmount, color: 'text-emerald-900', bg: 'bg-emerald-50/60 border-emerald-200', tagColor: 'text-emerald-800' },
            { label: 'Capital Outlay (CO)', value: coAmount, color: 'text-amber-950', bg: 'bg-amber-50/60 border-amber-200', tagColor: 'text-amber-800' },
          ].map(({ label, value, color, bg, tagColor }) => (
            <div key={label} className={`rounded-xl p-4 border shadow-2xs space-y-1 ${bg}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider block ${tagColor}`}>{label}</span>
              <p className={`text-lg font-bold ${color}`}>{safeFormatPHP(value)}</p>
              <p className="text-xs font-semibold text-slate-600">
                {safeFormatPct(value, totalFinancial)} of total financial allotment
              </p>
            </div>
          ))}
        </div>

        {/* Emphasized Total Financial Allotment */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs md:text-sm font-semibold text-slate-900">Total Financial Allotment</span>
          <span className="text-base md:text-lg font-bold text-purple-900">{safeFormatPHP(totalFinancial)}</span>
        </div>
      </div>

      {/* Four Categorized Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Implementing Office - Blue */}
        <BreakdownPanel
          title="By Implementing Office"
          icon={Building}
          rows={officeRows}
          totalBudget={totalBudget}
          accentBorderClass="border-l-blue-500"
          iconBgClass="bg-blue-100"
          iconColorClass="text-blue-700"
        />

        {/* By Category - Green/Teal */}
        <BreakdownPanel
          title="By Category"
          icon={Tag}
          rows={categoryRows}
          totalBudget={totalBudget}
          accentBorderClass="border-l-emerald-500"
          iconBgClass="bg-emerald-100"
          iconColorClass="text-emerald-700"
        />

        {/* By Procurement Type - Amber */}
        <BreakdownPanel
          title="By Procurement Type"
          icon={ShoppingCart}
          rows={procurementRows}
          totalBudget={totalBudget}
          accentBorderClass="border-l-amber-500"
          iconBgClass="bg-amber-100"
          iconColorClass="text-amber-700"
        />

        {/* By Fund Source - Purple */}
        <BreakdownPanel
          title="By Fund Source"
          icon={Banknote}
          rows={fundRows}
          totalBudget={totalBudget}
          accentBorderClass="border-l-purple-500"
          iconBgClass="bg-purple-100"
          iconColorClass="text-purple-700"
        />
      </div>
    </div>
  )
}
