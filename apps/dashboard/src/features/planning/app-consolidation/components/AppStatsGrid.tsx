import { Card, CardContent } from '@/components/ui/card'
import type { AppMaster } from '../types'

interface AppStatsGridProps {
  app: AppMaster
  itemCount: number
  totalQuantity: number
}

export function AppStatsGrid({ app, itemCount, totalQuantity }: AppStatsGridProps) {
  const totalBudgetAmount = app.aggregationResults?.totalAmount ?? app.bac?.totalBudget ?? 0
  const formattedBudget = totalBudgetAmount >= 1000000
    ? `₱${(totalBudgetAmount / 1000000).toFixed(1)}M`
    : `₱${totalBudgetAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/40">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Fiscal Year</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">FY {app.fiscalYear}</p>
            </div>
            <div className="w-10 h-10 bg-blue-200/40 rounded-lg flex items-center justify-center text-lg">📅</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/40">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Items</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">{itemCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-200/40 rounded-lg flex items-center justify-center text-lg">📦</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/40">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Total Quantity</p>
              <p className="text-2xl font-bold text-orange-900 mt-2">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-orange-200/40 rounded-lg flex items-center justify-center text-lg">📊</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100/40">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Budget</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{formattedBudget}</p>
            </div>
            <div className="w-10 h-10 bg-green-200/40 rounded-lg flex items-center justify-center text-lg">💰</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
