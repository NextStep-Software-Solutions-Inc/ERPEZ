import type { BACLineItem } from '../../types'

interface BACItemHeaderProps {
  item: BACLineItem
  badgeColor?: 'orange' | 'purple' | 'blue' | 'green' | 'red'
}

/**
 * Reusable BAC Item Header Component
 * Displays consistent item information across all tabs
 * Shows: Badge ID + Item Name + Unit + Quantities and Cost
 */
export function BACItemHeader({ item, badgeColor = 'orange' }: BACItemHeaderProps) {
  const badgeStyles = {
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-600 text-white',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    red: 'bg-red-600 text-white',
  }

  const bgStyles = {
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`p-3 ${bgStyles[badgeColor]} border rounded`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={` inline-flex items-center justify-center h-6 ${badgeStyles[badgeColor]} text-xs font-semibold mt-0.5`}>
            {item.id}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{item.description}</p>
              <span className="text-xs text-gray-500">({item.unit})</span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Qty: <span className="font-semibold">{item.quantity}</span> • Unit Cost: <span className="font-semibold">₱{item.unitCost.toLocaleString('en-PH', { maximumFractionDigits: 2 })}</span> • Total: <span className="font-bold">₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
