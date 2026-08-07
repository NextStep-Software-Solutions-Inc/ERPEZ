/**
 * KPI Activation Form
 * 
 * Implements KPI activation with dual workflow support:
 * - Directive (Top-Down): "Mandated" KPIs  
 * - Participatory (Bottom-Up): "AvailableForShopping" KPIs
 * 
 * Simplified form following fund-receiving pattern for consistency.
 */

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Lock, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { kpiActivationFormDataAtom } from '../atoms'
import { getAvailableKPIsRequest } from '../handlers/getAvailableKPIsRequest'
import { getActivatedKPIsRequest } from '../handlers/getActivatedKPIsRequest'
import { activateKPIsRequest } from '../handlers/activateKPIsRequest'
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'

interface ActivationFormProps {
  fiscalYearId: string
  onSubmit: (activatedKPIs: ActivatedKPI[]) => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function ActivationForm({
  fiscalYearId,
  onSubmit,
  onCancel,
  isLoading = false,
}: ActivationFormProps) {
  const [formData, setFormData] = useAtom(kpiActivationFormDataAtom)
  const [selectedKPIs, setSelectedKPIs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  const { data: availableKPIs = [] } = useQuery({
    queryKey: ['available-kpis'],
    queryFn: async () => {
      const result = await getAvailableKPIsRequest.fetcher({
        finalUrl: getAvailableKPIsRequest.endpoint,
        signal: new AbortController().signal,
      })
      return result.data || []
    },
  })

  const { data: activatedKPIs = [] } = useQuery({
    queryKey: ['activated-kpis', fiscalYearId],
    queryFn: async () => {
      const result = await getActivatedKPIsRequest.fetcher({
        finalUrl: `${getActivatedKPIsRequest.endpoint}?fiscalYearId=${fiscalYearId}`,
        signal: new AbortController().signal,
      })
      return result.data || []
    },
  })

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: async (payload: any) =>
      activateKPIsRequest.fetcher({
        payload,
        finalUrl: `/annual-performance-planning/fiscal-years/${fiscalYearId}/activate-kpis`,
      }),
    onSuccess: (data: ActivatedKPI[]) => {
      onSubmit(data || [])
      setSelectedKPIs(new Set())
    },
  })

  // Filter KPIs
  const filteredKPIs = (availableKPIs as any[]).filter(
    (kpi: any) =>
      !selectedKPIs.has(kpi.id) &&
      !activatedKPIs.some((a: ActivatedKPI) => a.kpiId === kpi.id) &&
      (kpi.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kpi.code?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleActivate = async () => {
    if (selectedKPIs.size === 0) return
    setIsSubmitting(true)
    try {
      await activateMutation.mutateAsync({
        fiscalYearId,
        kpiIds: Array.from(selectedKPIs).map((id) => ({
          kpiId: id,
          activationType: (availableKPIs as any[]).find((k: any) => k.id === id)?.isAvailableForShopping
            ? 'AvailableForShopping'
            : 'Mandated',
        })),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  const submitting = isSubmitting || isLoading

  return (
    <form className="space-y-4">
      {/* Active KPIs Section */}
      {activatedKPIs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">Active KPIs ({activatedKPIs.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activatedKPIs.map((kpi: ActivatedKPI) => (
              <div key={kpi.id} className="flex items-center justify-between p-2 rounded bg-white border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{kpi.kpiName}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      kpi.activationType === 'Mandated'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {kpi.activationType === 'Mandated' ? <Lock className="w-3 h-3 mr-1" /> : <ShoppingCart className="w-3 h-3 mr-1" />}
                    {kpi.activationType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select KPIs Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <Label className="text-base font-semibold mb-3 block">Select KPIs to Activate</Label>

        {/* Search */}
        <div className="mb-4 relative">
          <Input
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              updateFormData('searchQuery', e.target.value)
            }}
            disabled={submitting}
            className="pl-3"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* KPI List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredKPIs.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              {availableKPIs.length === 0 ? 'No KPIs available' : 'No matching KPIs'}
            </p>
          ) : (
            filteredKPIs.map((kpi) => (
              <label
                key={kpi.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors',
                  selectedKPIs.has(kpi.id) ? 'bg-white border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
                )}
              >
                <Checkbox
                  checked={selectedKPIs.has(kpi.id)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(selectedKPIs)
                    if (checked) {
                      newSet.add(kpi.id)
                    } else {
                      newSet.delete(kpi.id)
                    }
                    setSelectedKPIs(newSet)
                    updateFormData('selectedKPIs', Array.from(newSet))
                  }}
                  disabled={submitting}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{kpi.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        kpi.isAvailableForShopping
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {kpi.isAvailableForShopping ? (
                        <>
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Optional
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Mandatory
                        </>
                      )}
                    </Badge>
                  </div>
                  {kpi.description && <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>}
                </div>
              </label>
            ))
          )}
        </div>
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
          onClick={handleActivate}
          disabled={selectedKPIs.size === 0 || submitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          {submitting ? 'Activating...' : `Activate ${selectedKPIs.size} KPI${selectedKPIs.size !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  )
}
