import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Package, Hash, Wallet } from 'lucide-react'
import type { AppMaster } from '../types'

interface AppStatsGridProps {
  app: AppMaster
  itemCount: number
  totalQuantity: number
}

export function AppStatsGrid({ app, itemCount, totalQuantity }: AppStatsGridProps) {
  const totalBudgetAmount = app.aggregationResults?.totalAmount ?? app.bac?.totalBudget ?? 0
  const formattedBudget = totalBudgetAmount >= 1000000
    ? `₱${(totalBudgetAmount / 1000000).toFixed(2)}M`
    : `₱${totalBudgetAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Fiscal Year - Blue */}
      <Card className="border border-blue-200/80 shadow-xs rounded-xl overflow-hidden bg-gradient-to-br from-blue-50/80 to-blue-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
              Fiscal Year
            </span>
            <p className="text-2xl font-bold text-blue-950">FY {app.fiscalYear}</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Calendar className="w-5.5 h-5.5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Items - Purple */}
      <Card className="border border-purple-200/80 shadow-xs rounded-xl overflow-hidden bg-gradient-to-br from-purple-50/80 to-purple-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider block">
              Total Items
            </span>
            <p className="text-2xl font-bold text-purple-950">{itemCount}</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Package className="w-5.5 h-5.5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Quantity - Amber */}
      <Card className="border border-amber-200/80 shadow-xs rounded-xl overflow-hidden bg-gradient-to-br from-amber-50/80 to-amber-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              Total Quantity
            </span>
            <p className="text-2xl font-bold text-amber-950">{totalQuantity.toLocaleString()}</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Hash className="w-5.5 h-5.5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Budget - Green */}
      <Card className="border border-emerald-200/80 shadow-xs rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50/80 to-emerald-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Budget
            </span>
            <p className="text-2xl font-bold text-emerald-950">{formattedBudget}</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Wallet className="w-5.5 h-5.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
