/**
 * Enhanced Aggregation Method Selector
 * 
 * Improved visual feedback and selection UI for aggregation methods
 * SUM, AVERAGE, NON_CUMULATIVE with detailed descriptions and icons
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AggregationMethod } from '@/features/planning/annual-performance-planning/appTypes'

export interface KPIAggregationConfig {
  kpiId: string
  kpiName: string
  defaultAggregation: AggregationMethod
  currentAggregation: AggregationMethod
  description: string
}

interface AggregationMethodSelectorProps {
  kpiConfigs: KPIAggregationConfig[]
  onAggregationChange: (kpiId: string, method: AggregationMethod) => void
}

const AGGREGATION_DETAILS: Record<AggregationMethod, {
  label: string
  description: string
  formula: string
  example: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple'
}> = {
  SUM: {
    label: 'SUM',
    description: 'Quarterly values add up to annual target',
    formula: 'Annual = Q1 + Q2 + Q3 + Q4',
    example: 'Number of startups, cases processed, applications received',
    icon: <Plus className="w-5 h-5" />,
    color: 'blue',
  },
  AVERAGE: {
    label: 'AVERAGE',
    description: 'Annual is the average of quarterly values',
    formula: 'Annual = (Q1 + Q2 + Q3 + Q4) ÷ 4',
    example: 'Customer satisfaction, employee engagement, quality scores',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'green',
  },
  NON_CUMULATIVE: {
    label: 'NON-CUMULATIVE',
    description: 'Annual target is independent of quarters',
    formula: 'Annual = Target Value',
    example: 'Certifications, licenses, milestones achieved',
    icon: <Target className="w-5 h-5" />,
    color: 'purple',
  },
}

const getColorClasses = (method: AggregationMethod, isSelected: boolean) => {
  const colors = {
    blue: isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-blue-200 hover:border-blue-300',
    green: isSelected ? 'bg-green-50 border-green-400' : 'bg-white border-green-200 hover:border-green-300',
    purple: isSelected ? 'bg-purple-50 border-purple-400' : 'bg-white border-purple-200 hover:border-purple-300',
  }
  return colors[AGGREGATION_DETAILS[method].color]
}

export function AggregationMethodSelector({
  kpiConfigs,
  onAggregationChange,
}: AggregationMethodSelectorProps) {
  const isModified = (config: KPIAggregationConfig) => 
    config.currentAggregation !== config.defaultAggregation

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Step 2: Aggregation Methods</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Select how annual targets relate to quarterly values for each KPI
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kpiConfigs.map((config) => {
            const isModifiedKPI = isModified(config)
            const currentDetails = AGGREGATION_DETAILS[config.currentAggregation]
            const defaultDetails = AGGREGATION_DETAILS[config.defaultAggregation]

            return (
              <div
                key={config.kpiId}
                className={cn(
                  'border-2 rounded-lg p-4 space-y-4 transition-all',
                  getColorClasses(config.currentAggregation, true)
                )}
              >
                {/* Header with KPI Name and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{config.kpiName}</h4>
                    <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isModifiedKPI && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Modified
                      </Badge>
                    )}
                    {!isModifiedKPI && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Aggregation Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Select Aggregation Method
                  </label>
                  <Select
                    value={config.currentAggregation}
                    onValueChange={(value) =>
                      onAggregationChange(config.kpiId, value as AggregationMethod)
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['SUM', 'AVERAGE', 'NON_CUMULATIVE'] as AggregationMethod[]).map(
                        (method) => {
                          const details = AGGREGATION_DETAILS[method]
                          return (
                            <SelectItem key={method} value={method}>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  'p-1 rounded',
                                  method === 'SUM' && 'bg-blue-100 text-blue-700',
                                  method === 'AVERAGE' && 'bg-green-100 text-green-700',
                                  method === 'NON_CUMULATIVE' && 'bg-purple-100 text-purple-700'
                                )}>
                                  {details.icon}
                                </div>
                                <span className="font-medium">{details.label}</span>
                              </div>
                            </SelectItem>
                          )
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Method Details */}
                <div className={cn(
                  'rounded-lg border p-3 space-y-2',
                  currentDetails.color === 'blue' && 'bg-blue-50 border-blue-200',
                  currentDetails.color === 'green' && 'bg-green-50 border-green-200',
                  currentDetails.color === 'purple' && 'bg-purple-50 border-purple-200'
                )}>
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      'p-2 rounded flex-shrink-0 mt-0.5',
                      currentDetails.color === 'blue' && 'bg-blue-100 text-blue-700',
                      currentDetails.color === 'green' && 'bg-green-100 text-green-700',
                      currentDetails.color === 'purple' && 'bg-purple-100 text-purple-700'
                    )}>
                      {currentDetails.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {currentDetails.label}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {currentDetails.description}
                      </p>
                      <p className="text-xs font-mono text-gray-600 mt-2 font-semibold">
                        {currentDetails.formula}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Examples:</strong> {currentDetails.example}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Default Method Info (if different) */}
                {isModifiedKPI && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-700">
                      <strong>Original:</strong> {defaultDetails.label} ({defaultDetails.formula})
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {kpiConfigs.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-600">
                No KPIs selected yet. Transfer KPIs from the Master Library to configure aggregation methods.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
