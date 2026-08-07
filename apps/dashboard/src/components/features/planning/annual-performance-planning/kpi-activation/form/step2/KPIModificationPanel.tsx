/**
 * KPI Modification Panel
 * 
 * Collapsible inline modifier for each Active KPI
 * Shows original data (left) and modification form (right)
 * Planning officers can track and update KPI details
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, RotateCcw } from 'lucide-react'
import type { AggregationMethod } from '@/features/planning/annual-performance-planning/appTypes'

interface MasterKPI {
  id: string
  name: string
  description: string
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  targetDirection: 'Increase' | 'Decrease' | 'Maintain'
  unitOfMeasure: string
  baselineValue?: number
  defaultAggregation: AggregationMethod
}

interface KPIModificationPanelProps {
  kpi: MasterKPI
  isExpanded: boolean
  onToggleExpand: () => void
  modifications?: {
    description?: string
    functionType?: string
    targetDirection?: string
    unitOfMeasure?: string
    baselineValue?: string
    aggregationMethod?: AggregationMethod
    modificationNotes?: string
  }
  onSaveModifications: (modifications: Record<string, any>) => void
}

export function KPIModificationPanel({
  kpi,
  isExpanded,
  modifications = {},
  onSaveModifications,
}: KPIModificationPanelProps) {
  const [localModifications, setLocalModifications] = useState(modifications)
  const [modificationNotes, setModificationNotes] = useState(
    modifications.modificationNotes || ''
  )

  const hasChanges = Object.values(localModifications).some(
    (val, idx) => val !== Object.values(modifications)[idx]
  ) || modificationNotes !== (modifications.modificationNotes || '')

  const handleSave = () => {
    onSaveModifications({
      ...localModifications,
      modificationNotes,
    })
  }

  const handleReset = () => {
    setLocalModifications(modifications)
    setModificationNotes(modifications.modificationNotes || '')
  }

  const handleFieldChange = (field: string, value: string) => {
    setLocalModifications((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!isExpanded) {
    return null
  }

  return (
    <div className="border-l-4 border-purple-200 bg-purple-50 p-4 my-2 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-purple-100 text-purple-800">Modify</Badge>
        <p className="text-sm font-semibold text-gray-700">
          Update KPI details below - original data on left, your changes on right
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Panel - Original Data (Read-only) */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
            <Badge>Original</Badge>
            Reference Data
          </h4>

          {/* Description */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-700 leading-relaxed h-20 overflow-y-auto">
                {kpi.description}
              </p>
            </CardContent>
          </Card>

          {/* Function Type */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Function Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-50 text-blue-700 text-xs">
                {kpi.functionType}
              </Badge>
            </CardContent>
          </Card>

          {/* Target Direction */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Target Direction</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`text-xs ${
                  kpi.targetDirection === 'Increase'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {kpi.targetDirection}
              </Badge>
            </CardContent>
          </Card>

          {/* Unit of Measure */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Unit of Measure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-700 font-mono bg-blue-50 p-2 rounded">
                {kpi.unitOfMeasure}
              </p>
            </CardContent>
          </Card>

          {/* Baseline Value */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Baseline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-blue-900">{kpi.baselineValue}</p>
            </CardContent>
          </Card>

          {/* Default Aggregation */}
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Aggregation</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-indigo-50 text-indigo-700 text-xs">
                {kpi.defaultAggregation}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Modification Form */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Edit</Badge>
            Your Changes
          </h4>

          {/* Description */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Leave blank to keep original"
                value={localModifications.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="text-xs min-h-20"
              />
            </CardContent>
          </Card>

          {/* Function Type */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Function Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={localModifications.functionType || kpi.functionType}
                onValueChange={(value) => handleFieldChange('functionType', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CoreFunction">CoreFunction</SelectItem>
                  <SelectItem value="StrategicPriority">StrategicPriority</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Target Direction */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Target Direction</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={localModifications.targetDirection || kpi.targetDirection}
                onValueChange={(value) => handleFieldChange('targetDirection', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Increase">Increase</SelectItem>
                  <SelectItem value="Decrease">Decrease</SelectItem>
                  <SelectItem value="Maintain">Maintain</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Unit of Measure */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Unit of Measure</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="Leave blank to keep original"
                value={localModifications.unitOfMeasure || ''}
                onChange={(e) => handleFieldChange('unitOfMeasure', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </CardContent>
          </Card>

          {/* Baseline Value */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Baseline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="Leave blank to keep original"
                value={localModifications.baselineValue || ''}
                onChange={(e) => handleFieldChange('baselineValue', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              />
            </CardContent>
          </Card>

          {/* Aggregation */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Aggregation Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={localModifications.aggregationMethod || kpi.defaultAggregation}
                onValueChange={(value) => handleFieldChange('aggregationMethod', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUM">SUM</SelectItem>
                  <SelectItem value="AVERAGE">AVERAGE</SelectItem>
                  <SelectItem value="NON_CUMULATIVE">NON_CUMULATIVE</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Modification Notes */}
          <Card className="bg-white border-2 border-purple-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Modification Notes</CardTitle>
              <p className="text-xs text-gray-600 mt-1">Why were these changes made?</p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Document your changes..."
                value={modificationNotes}
                onChange={(e) => setModificationNotes(e.target.value)}
                className="text-xs min-h-16"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-blue-600 hover:bg-blue-700 text-xs"
        >
          <Save className="w-3 h-3 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
