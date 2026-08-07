import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { BACLineItem, ProcurementStrategy } from '../../types'
import { PROCUREMENT_STRATEGY_LABELS } from '../../types'

const PROCUREMENT_STRATEGIES: ProcurementStrategy[] = [
  'LCA_LCCA',
  'SUBCONTRACTING',
  'MULTI_YEAR',
  'DESIGN_BUILD',
  'PROCUREMENT_AGENT',
  'FRAMEWORK_AGREEMENT',
  'POOLED_PROCUREMENT',
  'RENEWAL_SERVICES',
  'WAREHOUSING_INVENTORY',
  'NA',
]

interface ProcurementStrategyTabItemProps {
  item: BACLineItem
  onUpdate?: (item: Partial<BACLineItem>) => void
  readOnly?: boolean
}

export function ProcurementStrategyTabItem({
  item,
  onUpdate,
  readOnly,
}: ProcurementStrategyTabItemProps) {
  const handleStrategyToggle = (strategy: ProcurementStrategy) => {
    if (readOnly) return

    const currentStrategies = item.procurementStrategies || []
    let updatedStrategies: ProcurementStrategy[] = []

    if (strategy === 'NA') {
      const isSelected = currentStrategies.includes('NA')
      updatedStrategies = isSelected ? [] : ['NA']
    } else {
      const isSelected = currentStrategies.includes(strategy)
      const withoutNA = currentStrategies.filter((s) => s !== 'NA')
      updatedStrategies = isSelected
        ? withoutNA.filter((s) => s !== strategy)
        : [...withoutNA, strategy]
    }

    onUpdate?.({ ...item, procurementStrategies: updatedStrategies })
  }

  const selectedCount = (item.procurementStrategies || []).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Procurement Strategy or Tools</CardTitle>
          <p className="text-xs text-gray-600 mt-2">
            Select one or more procurement strategies or tools the Procuring Entity will use for this item.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PROCUREMENT_STRATEGIES.map((strategy) => {
              const isSelected = (item.procurementStrategies || []).includes(strategy)
              return (
                <div
                  key={strategy}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={() => !readOnly && handleStrategyToggle(strategy)}
                >
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => !readOnly && handleStrategyToggle(strategy)}
                    disabled={readOnly}
                    className="mt-1"
                  />
                  <div className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900 cursor-pointer block">
                      {PROCUREMENT_STRATEGY_LABELS[strategy]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedCount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <span className="font-semibold">{selectedCount}</span> strateg{selectedCount === 1 ? 'y' : 'ies'} selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800 ml-2">
          <strong>Procurement Strategy Guide:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-xs">
            <li><strong>LCA/LCCA:</strong> Comprehensive lifecycle assessment and cost analysis</li>
            <li><strong>Subcontracting:</strong> Procurement will include subcontractor arrangements</li>
            <li><strong>Multi-Year Contracting:</strong> Service or supply agreement spanning multiple years</li>
            <li><strong>Design-and-Build:</strong> Combined design and construction contract for infrastructure</li>
            <li><strong>Procurement Agent:</strong> Third-party procurement specialist engagement</li>
            <li><strong>Framework Agreement:</strong> Umbrella agreement for multiple deliveries/services</li>
            <li><strong>Pooled Procurement:</strong> Consolidated procurement with other entities</li>
            <li><strong>Renewal of Services:</strong> Renewal of existing regular and recurring services</li>
            <li><strong>Warehousing & Inventory:</strong> Includes storage and inventory management activities</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
