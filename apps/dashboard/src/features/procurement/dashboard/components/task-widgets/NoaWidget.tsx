import { Building2, Star } from 'lucide-react'
import type { ApproveNOAMetadata } from '../../types'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  metadata: ApproveNOAMetadata
}



export function NoaWidget({ metadata }: Props) {
  const { supplierName, bidAmount, performanceScore, previousContracts, onTimeDeliveryRate } = metadata
  const fullStars = Math.floor(performanceScore)
  const hasHalf = performanceScore - fullStars >= 0.5

  return (
    <div className="space-y-3 pt-1">
      {/* Supplier info */}
      <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-900 truncate">{supplierName}</p>
          <p className="text-xs text-blue-600 font-bold">{formatCurrencyAbbr(bidAmount)}</p>
        </div>
      </div>

      {/* Supplier performance */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-500">Performance</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < fullStars
                    ? 'text-amber-400 fill-amber-400'
                    : i === fullStars && hasHalf
                      ? 'text-amber-400 fill-amber-200'
                      : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
            <span className="text-[11px] font-bold text-gray-700 ml-1">{performanceScore}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-500">On-Time Delivery</p>
          <p className="text-sm font-bold text-emerald-700">{onTimeDeliveryRate}%</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400">{previousContracts} previous government contract{previousContracts !== 1 ? 's' : ''}</p>
    </div>
  )
}
