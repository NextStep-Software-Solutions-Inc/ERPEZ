import {
  ArrowLeft,
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { PriceCatalogueItem } from '../../types'

interface PriceDetailPageProps {
  item: PriceCatalogueItem | null
  onBack: () => void
}

export function PriceDetailPage({ item, onBack }: PriceDetailPageProps) {
  if (!item) return null

  const itemLabel = item.procurementItemName ?? item.itemName
  const fiscalYearLabel = item.fiscalYearYear
    ? `FY ${item.fiscalYearYear}`
    : `FY ${item.fiscalYear}`

  return (
    <div className="bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Price Catalogue
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {itemLabel}
                </h1>
                <p className="text-sm text-slate-600">
                  Price Catalogue Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Price Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Name */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Item Name
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {itemLabel}
                  </p>
                </div>

                {/* Procurement Item ID */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Procurement Item ID
                  </label>
                  <p className="text-sm font-mono text-slate-900 mt-2 break-all">
                    {item.procurementItemId}
                  </p>
                </div>

                {/* Unit Price */}
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Unit Price
                  </label>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ₱
                    {item.unitPrice.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Fiscal Year */}
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fiscal Year
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {fiscalYearLabel}
                  </p>
                </div>

                {/* Fiscal Year ID */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Fiscal Year ID
                  </label>
                  <p className="text-sm font-mono text-slate-900 mt-2 break-all">
                    {item.fiscalYearId}
                  </p>
                </div>

                {/* Last Updated */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Last Updated
                  </label>
                  <p className="text-base font-medium text-slate-900 mt-2">
                    {new Date(item.lastUpdated).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Price History Card */}
            {item.priceHistory && item.priceHistory.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Price History
                </h2>

                <div className="space-y-4">
                  {item.priceHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-slate-600">
                            Change #{index + 1}
                          </div>
                          <Badge
                            color={
                              history.percentageChange > 0
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {history.percentageChange > 0 ? '+' : ''}
                            {Math.round(history.percentageChange)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(history.changedAt).toLocaleDateString(
                            'en-PH',
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-600">
                            Previous Price
                          </label>
                          <p className="text-sm font-medium text-slate-900">
                            ₱
                            {history.previousPrice.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">
                            Current Price
                          </label>
                          <p className="text-sm font-medium text-green-600">
                            ₱
                            {history.currentPrice.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Metadata
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-medium text-slate-600">Item ID</label>
                  <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded block mt-1 break-all">
                    {item.itemId}
                  </code>
                </div>

                <div>
                  <label className="font-medium text-slate-600">Price ID</label>
                  <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded block mt-1 break-all">
                    {item.id}
                  </code>
                </div>

                <div>
                  <label className="font-medium text-slate-600">Created</label>
                  <p className="text-sm mt-1 text-slate-700">
                    {new Date(item.lastUpdated).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
