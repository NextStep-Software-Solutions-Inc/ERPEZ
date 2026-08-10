import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { BACWorkspace, ProcurementStrategy } from '../../types'
import { PROCUREMENT_STRATEGY_LABELS } from '../../types'
import { BACItemHeader } from './BACItemHeader'

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

interface ProcurementStrategyTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function ProcurementStrategyTab({ workspace, onUpdate, readOnly }: ProcurementStrategyTabProps) {
  const handleStrategyToggle = (lineItemId: string, strategy: ProcurementStrategy) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) => {
      if (item.id === lineItemId) {
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
        return { ...item, procurementStrategies: updatedStrategies }
      }
      return item
    })
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800 ml-2">
          <strong>Procurement Strategy Guide:</strong>
          <p className="mt-2 text-xs mb-2">
            Indicate if the Procuring Entity shall use one or more of any of the following strategies:
          </p>
          <ul className="list-disc ml-5 space-y-1 text-xs">
            <li><strong>LCA/LCCA:</strong> Life Cycle Assessment and Life Cycle Cost Analysis</li>
            <li><strong>Subcontracting:</strong> Work will be subcontracted to third parties</li>
            <li><strong>Multi-Year Contracting:</strong> Service or supply agreement spanning multiple years</li>
            <li><strong>Design-and-Build:</strong> Combined design and construction contract for infrastructure projects</li>
            <li><strong>Procurement Agent:</strong> Engagement of a Procurement Agent</li>
            <li><strong>Framework Agreement:</strong> Use of Framework Agreement Section</li>
            <li><strong>Pooled Procurement:</strong> Pooled Procurement Section 17</li>
            <li><strong>Renewal of Services:</strong> Renewal of Regular and Recurring Services</li>
            <li><strong>Warehousing & Inventory:</strong> Warehousing and Inventory Activities</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {workspace.lineItems.map((item) => {
          const selectedCount = (item.procurementStrategies || []).length
          return (
            <Card key={item.id}>
              <CardHeader>
                <BACItemHeader item={item} badgeColor="indigo" />
                {selectedCount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-900">
                      <span className="font-semibold">{selectedCount}</span> strateg{selectedCount === 1 ? 'y' : 'ies'} selected
                    </p>
                  </div>
                )}
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
                        onClick={() => !readOnly && handleStrategyToggle(item.id, strategy)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => !readOnly && handleStrategyToggle(item.id, strategy)}
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
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
