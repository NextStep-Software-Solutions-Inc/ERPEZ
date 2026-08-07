/**
 * Target Distribution Form (Matrix)
 * 
 * Assign KPI targets to Delivery Units in a matrix interface.
 * Simplified form following fund-receiving pattern for consistency.
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { targetDistributionFormDataAtom } from '../atoms'
import { getKPITargetsRequest } from '../handlers/getKPITargetsRequest'
import { batchUpdateTargetsRequest } from '../handlers/batchUpdateTargetsRequest'
import type { ActivatedKPI, KPITarget } from '@/features/planning/annual-performance-planning/appTypes'

interface DistributionFormProps {
  fiscalYearId: string
  activatedKPIs: ActivatedKPI[]
  deliveryUnits: Array<{ id: string; name: string }>
  onSubmit: (targets: KPITarget[]) => void
  onCancel?: () => void
  isLoading?: boolean
}

interface TargetCell {
  activatedKPIId: string
  deliveryUnitId: string
  targetValue: number
}

export default function DistributionForm({
  fiscalYearId,
  activatedKPIs,
  deliveryUnits,
  onSubmit,
  onCancel,
  isLoading = false,
}: DistributionFormProps) {
  const [formData, setFormData] = useAtom(targetDistributionFormDataAtom)
  const [dirtyTargets, setDirtyTargets] = useState<Map<string, TargetCell>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch existing targets
  const { data: existingTargets = [] } = useQuery({
    queryKey: ['kpi-targets', fiscalYearId],
    queryFn: async () => {
      const result = await getKPITargetsRequest.fetcher({
        finalUrl: `${getKPITargetsRequest.endpoint}?fiscalYearId=${fiscalYearId}`,
        signal: new AbortController().signal,
      })
      return result.data || []
    },
  })

  // Initialize targets from fetched data
  useEffect(() => {
    if (existingTargets && existingTargets.length > 0) {
      const targetMap = new Map<string, TargetCell>()
      existingTargets.forEach((t: KPITarget) => {
        const cellId = `${t.activatedKPIId}-${t.deliveryUnitId}`
        targetMap.set(cellId, {
          activatedKPIId: t.activatedKPIId,
          deliveryUnitId: t.deliveryUnitId,
          targetValue: t.targetValue,
        })
      })
      setDirtyTargets(targetMap)
    }
  }, [existingTargets])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) =>
      batchUpdateTargetsRequest.fetcher({
        payload,
        finalUrl: `/annual-performance-planning/fiscal-years/${fiscalYearId}/targets/batch-update`,
      }),
    onSuccess: (data: KPITarget[]) => {
      setDirtyTargets(new Map())
      setFormData({ searchQuery: '', selectedTargets: [] })
      onSubmit(data || [])
    },
  })

  // Handle cell change
  const handleCellChange = useCallback(
    (kpiId: string, duId: string, value: string) => {
      const cellId = `${kpiId}-${duId}`
      const numValue = value === '' ? 0 : Number(value)

      if (isNaN(numValue) || numValue < 0) return

      const newCell: TargetCell = {
        activatedKPIId: kpiId,
        deliveryUnitId: duId,
        targetValue: numValue,
      }

      const newTargets = new Map(dirtyTargets)
      newTargets.set(cellId, newCell)
      setDirtyTargets(newTargets)

      setFormData({
        ...formData,
        selectedTargets: Array.from(newTargets.keys()),
      })
    },
    [dirtyTargets, formData, setFormData]
  )

  // Handle save
  const handleSaveAll = useCallback(async () => {
    if (dirtyTargets.size === 0) return

    const payload = {
      targets: Array.from(dirtyTargets.values()).map((t) => ({
        cellId: `${t.activatedKPIId}-${t.deliveryUnitId}`,
        value: t.targetValue,
        deliveryUnitId: t.deliveryUnitId,
        kpiId: t.activatedKPIId,
      })),
    }

    setIsSubmitting(true)
    try {
      await saveMutation.mutateAsync(payload as any)
    } finally {
      setIsSubmitting(false)
    }
  }, [dirtyTargets, saveMutation])

  const hasDirtyTargets = dirtyTargets.size > 0
  const submitting = isSubmitting || isLoading || saveMutation.isPending

  return (
    <form className="space-y-4">
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900">Target Distribution Matrix</h4>
        <p className="text-sm text-blue-700 mt-1">
          Enter target values for each KPI across delivery units. {hasDirtyTargets && <span className="text-amber-700 font-medium">You have unsaved changes.</span>}
        </p>
      </div>

      {/* Matrix Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold min-w-[200px]">KPI</TableHead>
              {deliveryUnits.map((du) => (
                <TableHead key={du.id} className="font-semibold text-center min-w-[120px]">
                  {du.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activatedKPIs.map((kpi) => (
              <TableRow key={kpi.id} className="border-b">
                <TableCell className="font-medium">
                  <div>
                    <p className="text-sm font-medium">{kpi.kpiName}</p>
                    {kpi.mandatoryTargetValue && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Mandatory: {kpi.mandatoryTargetValue}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                {deliveryUnits.map((du) => {
                  const cellId = `${kpi.id}-${du.id}`
                  const cellValue = dirtyTargets.get(cellId)?.targetValue || ''

                  return (
                    <TableCell key={`${kpi.id}-${du.id}`} className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={cellValue}
                        onChange={(e) => handleCellChange(kpi.id, du.id, e.target.value)}
                        disabled={submitting}
                        placeholder="-"
                        className={cn(
                          'text-sm text-center',
                          cellValue !== '' ? 'border-purple-300 bg-purple-50' : ''
                        )}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSaveAll}
          disabled={!hasDirtyTargets || submitting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-1" />
          {submitting ? 'Saving...' : 'Save Targets'}
        </Button>
      </div>
    </form>
  )
}
