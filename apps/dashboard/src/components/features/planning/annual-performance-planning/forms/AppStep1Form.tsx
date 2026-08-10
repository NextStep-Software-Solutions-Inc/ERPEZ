/**
 * Form 1: Fiscal Year Planning - Enhanced with Creation & Locking
 * 
 * Planning Officer can:
 * - Create new fiscal years
 * - Select a fiscal year for planning
 * - Lock/unlock fiscal years to prevent further edits
 * - View fiscal year status and details
 */

import { useState, useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, X, Plus, Lock, LockOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import { getFiscalYearsRequest } from '../../fiscal-year/handlers/getFiscalYearsRequest'
import { step1FormDataAtom, createDialogAtom } from '../atoms'
import CreateFiscalYearDialog from '../fiscal-year/dialog/CreateFiscalYearDialog'

interface AppStep1FormProps {
  onSubmit: (payload: AppFiscalYear) => void
  onCancel?: () => void
  isLoading?: boolean
  existingFY?: AppFiscalYear
  allFiscalYears?: AppFiscalYear[]
}

/**
 * Form: Fiscal Year Management & Selection
 * Create, lock, and select fiscal years for planning
 */
export default function AppStep1Form({
  onSubmit,
  onCancel,
  isLoading = false,
  existingFY,
  allFiscalYears = [],
}: AppStep1FormProps) {
  const [formData, setFormData] = useAtom(step1FormDataAtom)
  const openCreateDialog = useSetAtom(createDialogAtom)
  const [localFiscalYears, setLocalFiscalYears] = useState<AppFiscalYear[]>(allFiscalYears)

  // Fetch all fiscal years
  const { data: fetchedFYResponse, refetch } = useQuery({
    queryKey: ['all-fiscal-years'],
    queryFn: async () => {
      const result = await getFiscalYearsRequest.fetcher({
        finalUrl: getFiscalYearsRequest.endpoint,
        signal: new AbortController().signal,
      })
      return result
    },
  })

  const fetchedFY = fetchedFYResponse?.data || []

  // force a fresh network request on initial render so cached mock data is overwritten
  useEffect(() => {
    if (!fetchedFYResponse) {
      // if query hasn't run yet, nothing to do
      return
    }
    refetch()
  }, [])

  // transform backend fiscal year objects into the shape expected by the APP wizard
  const mapToAppFY = (fy: any): AppFiscalYear => {
    const isLocked = fy.status === 'closed'
    return {
      id: fy.id,
      year: fy.year,
      description: fy.description || undefined,
      status: isLocked ? 'Locked' : 'Draft',
      isLocked,
      startDate: fy.startDate,
      endDate: fy.endDate,
      createdAt: fy.createdAt,
      updatedAt: fy.updatedAt,
    }
  }

  const fetchedAppFYs: AppFiscalYear[] = fetchedFY.map(mapToAppFY)
  const fiscalYears =
    allFiscalYears.length > 0
      ? allFiscalYears
      : fetchedAppFYs.length > 0
      ? fetchedAppFYs
      : localFiscalYears
  const selectedFY = existingFY || (formData.selectedFY as AppFiscalYear | undefined)

  const handleSelectFY = (fy: AppFiscalYear) => {
    setFormData({ ...formData, selectedFY: fy })
    onSubmit(fy)
  }

  const handleCreateFiscalYear = () => {
    // Open the create dialog using Jotai atom
    openCreateDialog({ isOpen: true })
  }

  const handleCreateFiscalYearCallback = (newFY: AppFiscalYear) => {
    // Add new fiscal year to local state
    setLocalFiscalYears([...localFiscalYears, newFY])
    toast.success(`Fiscal Year ${newFY.year} created successfully`)
    // Refetch to get latest from API
    refetch()
  }

  const handleToggleLock = (e: React.MouseEvent, fy: AppFiscalYear) => {
    e.stopPropagation()
    
    // Update lock status
    const updatedFY: AppFiscalYear = {
      ...fy,
      isLocked: !fy.isLocked,
      status: !fy.isLocked ? 'Locked' : 'Draft',
      updatedAt: new Date().toISOString(),
    }

    // Update local state
    setLocalFiscalYears(
      localFiscalYears.map((f) => (f.id === fy.id ? updatedFY : f))
    )

    // Update selected FY if it's the one being locked
    if (selectedFY?.id === fy.id) {
      setFormData({ ...formData, selectedFY: updatedFY })
    }

    toast.success(
      updatedFY.isLocked 
        ? `FY ${updatedFY.year} locked successfully` 
        : `FY ${updatedFY.year} unlocked successfully`
    )
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900">Step 1: Fiscal Year Management</h4>
        <p className="text-sm text-blue-700 mt-1">
          Create, lock, and select a fiscal year to define the temporal scope for your performance planning
        </p>
      </div>

      {/* Create Fiscal Year Button */}
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Available Fiscal Years</Label>
        <Button
          type="button"
          size="sm"
          onClick={handleCreateFiscalYear}
          disabled={isLoading}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Fiscal Year
        </Button>
      </div>

      {/* Fiscal Years Selection Cards */}
      <div className="space-y-3">
        {fiscalYears.length === 0 ? (
          <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center">
            <p className="text-sm text-gray-600 mb-3">No fiscal years available. Create one to get started.</p>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateFiscalYear}
              disabled={isLoading}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Fiscal Year
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 max-h-80 overflow-y-auto">
            {fiscalYears.map((fy: AppFiscalYear) => (
              <Card
                key={fy.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedFY?.id === fy.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => handleSelectFY(fy)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-semibold text-gray-900">
                          FY {fy.year}
                        </span>
                        
                        {/* Status Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            fy.status === 'Draft'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          )}
                        >
                          {fy.status}
                        </Badge>
                      </div>

                      {fy.description && (
                        <p className="text-sm text-gray-600 mb-2">{fy.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        {fy.startDate && (
                          <p>Start: {new Date(fy.startDate).toLocaleDateString()}</p>
                        )}
                        {fy.endDate && (
                          <p>End: {new Date(fy.endDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle Lock Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleLock(e, fy)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                        title={fy.isLocked ? 'Unlock Fiscal Year' : 'Lock Fiscal Year'}
                      >
                        {fy.isLocked ? (
                          <Lock className="w-4 h-4 text-amber-600" />
                        ) : (
                          <LockOpen className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>

                      {/* Selection Indicator */}
                      {selectedFY?.id === fy.id && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lock Status Info */}
      {selectedFY && selectedFY.isLocked && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">
            <strong>FY {selectedFY.year} is locked.</strong> You can proceed to the next step.
          </p>
        </div>
      )}

      {selectedFY && !selectedFY.isLocked && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Lock this fiscal year when ready to proceed to KPI activation.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button
          type="button"
          onClick={() => selectedFY && handleSelectFY(selectedFY)}
          disabled={!selectedFY || isLoading}
        >
          Next: Activate KPIs
        </Button>
      </div>

      {/* Create Fiscal Year Dialog */}
      <CreateFiscalYearDialog
        onCreated={handleCreateFiscalYearCallback}
      />
    </div>
  )
}
