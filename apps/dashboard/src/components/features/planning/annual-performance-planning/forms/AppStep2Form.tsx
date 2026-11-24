/**
 * Form 2: KPI Activation & Configuration
 * 
 * Implements KPI activation with comprehensive configuration:
 * - Active KPI Table: Manages selected KPIs with add/edit/delete operations
 * - Shows KPIs filtered by selected fiscal year from toolbar
 * - KPI Selection Dialog: Browse master library with search, filter, and multi-select
 * - Deep Copy Logic: Creates snapshots of KPIs for fiscal year
 * - Aggregation Configuration: SUM, AVERAGE, NON_CUMULATIVE
 * - Hybrid Workflow: Supports both Mandated and Shopping KPIs
 * 
 * Data Sources:
 * - Main Table: Fetches active KPIs from GET /fy-active-kpis with fiscal year filter applied
 *   - When user selects fiscal year in toolbar: filters by fiscalYearId==<id>
 *   - When no fiscal year selected: shows empty/no data state
 * - Fetches Fiscal Year data from API endpoint: GET /fiscal-years
 * - Transforms API responses to internal types
 * - Includes error handling and loading states
 * - KPISelectionDialog: Independent - does NOT inherit parent's fiscal year filter
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { X, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { KPISelectionDialog, DeleteConfirmationDialog, KPIDetailsDialog } from '../kpi-activation/dialog'
import EditKpiDialog from '../kpi-activation/dialogs/EditKpiDialog'
import { TemplateTable } from '@/components/TemplateTable'
import { ActiveKPIsToolbar } from '../kpi-activation/table/ActiveKPIsToolbar'
import { useActivateKpisColumns } from '../kpi-activation/table/ActiveKPIsColumn'
import { activateKPIsRequest } from '../kpi-activation/handlers/activateKPIsRequest'
import { updateKPILockStatus } from '../kpi-activation/handlers/updateKPILockStatusRequest'
import type { MasterKPI } from '../shared/utils/mockMasterKPIs'
import { useKPIs, useFiscalYears, formatFiscalYearForDisplay, transformKPIToInternal } from '@/features/planning/annual-performance-planning/hooks/useAPPQueries'
import { cn } from '@/lib/utils'
import type { ActiveKPI } from '../shared/types/step2Types'
import type {
  ActivatedKPI,
  AggregationMethod,
  AppFiscalYear,
} from '@/features/planning/annual-performance-planning/appTypes'

// Create mutation hooks using factory pattern
const useActivateKpis = createMutationHookFromTemplate(activateKPIsRequest)

interface AppStep2FormProps {
  onSubmit: (activatedKPIs: ActivatedKPI[], fiscalYearId: string) => void
  onCancel?: () => void
  isLoading?: boolean
  onFiscalYearChange?: (fy: AppFiscalYear | undefined) => void
  onKPIsCountChange?: (count: number) => void
  initialActiveKPIs?: ActivatedKPI[]
  selectedFiscalYearId?: string
}

export default function AppStep2Form({
  onSubmit,
  onCancel,
  isLoading = false,
  onFiscalYearChange,
  onKPIsCountChange,
  initialActiveKPIs = [],
  selectedFiscalYearId: propSelectedFiscalYearId,
}: AppStep2FormProps) {
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>(propSelectedFiscalYearId || '')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    const targetId = propSelectedFiscalYearId || ''
    if (targetId !== selectedFiscalYearId) {
      setSelectedFiscalYearId(targetId)
    }
  }, [propSelectedFiscalYearId, selectedFiscalYearId])
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  
  // Fetch KPIs with fiscal year filter when selected
  const { data: kpisResponse, isLoading: isLoadingKPIs, error: kpiError, refetch: refetchKPIs } = useKPIs(
    { 
      pathParams: {}, 
      queryParams: {
        ...(selectedFiscalYearId ? { Filters: `fiscalYearId==${selectedFiscalYearId}` } : {}),
        PageNumber: pageNumber,
        PageSize: selectedFiscalYearId ? pageSize : 1000,
      }
    }
  )

  // Fetch ALL KPIs for the selected fiscal year (up to 1000) for local state and next steps
  const { data: allKPIsResponse } = useKPIs(
    { 
      pathParams: {}, 
      queryParams: (selectedFiscalYearId 
        ? { Filters: `fiscalYearId==${selectedFiscalYearId}`, PageNumber: 1, PageSize: 1000 }
        : undefined)
    }
  )

  const { data: fyResponse, isLoading: isLoadingFY, error: fyError } = useFiscalYears({pathParams: {}, queryParams: { pageNumber: 1, pageSize: 100 }})

  // Use mutation hook created from factory pattern
  const { isPending: isActivatingKpis } = useActivateKpis()

  // Transform API responses
  // Memoize masterKPIs to prevent infinite loop when used in useEffect dependencies
  // Only recalculate when the API data actually changes
  const masterKPIs: MasterKPI[] = useMemo(() => {
    const list = kpisResponse?.data?.map(apiKPI => ({
      ...transformKPIToInternal(apiKPI),
      // Preserve full API response fields (e.g. FiscalYear)
      ...apiKPI,
      ratingScale: [],
      baselineValue: 0,
      createdBy: apiKPI.createdBy || 'System',
      createdDate: apiKPI.createdAt || new Date().toISOString(),
      lastModifiedBy: apiKPI.createdBy || 'System',
      lastModifiedDate: (apiKPI as Record<string, unknown>).updatedAt as string || apiKPI.createdAt || new Date().toISOString(),
      version: 1,
      fiscalYear: new Date().getFullYear(),
      isLocked: apiKPI.isLocked ?? false,
    })) || []
    return list.sort((a, b) => {
      const dateA = new Date(a.lastModifiedDate || a.createdDate || 0).getTime()
      const dateB = new Date(b.lastModifiedDate || b.createdDate || 0).getTime()
      return dateB - dateA
    })
  }, [kpisResponse?.data])

  // Map all active KPIs for this fiscal year
  const allActiveKPIs: MasterKPI[] = useMemo(() => {
    const list = allKPIsResponse?.data?.map(apiKPI => ({
      ...transformKPIToInternal(apiKPI),
      // Preserve full API response fields (e.g. FiscalYear)
      ...apiKPI,
      ratingScale: [],
      baselineValue: 0,
      createdBy: apiKPI.createdBy || 'System',
      createdDate: apiKPI.createdAt || new Date().toISOString(),
      lastModifiedBy: apiKPI.createdBy || 'System',
      lastModifiedDate: (apiKPI as Record<string, unknown>).updatedAt as string || apiKPI.createdAt || new Date().toISOString(),
      version: 1,
      fiscalYear: new Date().getFullYear(),
      isLocked: apiKPI.isLocked ?? false,
    })) || []
    return list.sort((a, b) => {
      const dateA = new Date(a.lastModifiedDate || a.createdDate || 0).getTime()
      const dateB = new Date(b.lastModifiedDate || b.createdDate || 0).getTime()
      return dateB - dateA
    })
  }, [allKPIsResponse?.data])

  const fiscalYears = useMemo(() => 
    fyResponse?.data?.map(fy => formatFiscalYearForDisplay(fy)) || [],
    [fyResponse?.data]
  )

  const [activeKPIs, setActiveKPIs] = useState<ActiveKPI[]>([])
  const [aggregationMethods, setAggregationMethods] = useState<Map<string, AggregationMethod>>(new Map())
  const [modificationNotes, setModificationNotes] = useState<Map<string, string>>(new Map())
  const [fiscalYearLockStates, setFiscalYearLockStates] = useState<Map<string, boolean>>(new Map())
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false)
  const [isUpdatingLockStatus, setIsUpdatingLockStatus] = useState(false)

  // Handle fiscal year selection - filters KPI table and updates activation context
  // When user selects a fiscal year, the API call above will automatically refetch with the filter
  const handleFiscalYearChange = useCallback((fiscalYearId: string) => {
    console.log('Fiscal year changed to:', fiscalYearId)
    setSelectedFiscalYearId(fiscalYearId)
    setPageNumber(1) // Reset pageNumber to 1 when fiscal year changes
    const matchedFy = fyResponse?.data?.find(fy => fy.id === fiscalYearId)
    if (onFiscalYearChange) {
      if (matchedFy) {
        onFiscalYearChange({
          id: matchedFy.id,
          year: matchedFy.year,
          description: matchedFy.description,
          status: matchedFy.status,
          isLocked: (matchedFy as { isLocked?: boolean }).isLocked || false,
        })
      } else {
        onFiscalYearChange(undefined)
      }
    }
  }, [fyResponse?.data, onFiscalYearChange])

  // Memoize clear fiscal year handler
  const handleClearFiscalYear = useCallback(() => {
    setSelectedFiscalYearId('')
    setPageNumber(1) // Reset pageNumber to 1 when fiscal year is cleared
    if (onFiscalYearChange) {
      onFiscalYearChange(undefined)
    }
  }, [onFiscalYearChange])

  // Sync fiscal year to parent when response data loads
  useEffect(() => {
    if (selectedFiscalYearId && fyResponse?.data) {
      const matchedFy = fyResponse.data.find(fy => fy.id === selectedFiscalYearId)
      if (onFiscalYearChange && matchedFy) {
        onFiscalYearChange({
          id: matchedFy.id,
          year: matchedFy.year,
          description: matchedFy.description,
          status: matchedFy.status,
          isLocked: (matchedFy as { isLocked?: boolean }).isLocked || false,
        })
      }
    }
  }, [selectedFiscalYearId, fyResponse?.data, onFiscalYearChange])


  // Sync active KPIs count back to parent
  useEffect(() => {
    if (onKPIsCountChange) {
      onKPIsCountChange(activeKPIs.length)
    }
  }, [activeKPIs.length, onKPIsCountChange])

  // Memoize add KPI handler
  const handleAddKPI = useCallback(() => {
    setIsSelectionDialogOpen(true)
  }, [])

  // Memoize global filter change handler
  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value)
  }, [])

  // Filter displayed KPIs locally by search filter for instant reactivity (Code, Name, Description)
  const displayedKPIs = useMemo(() => {
    const list = selectedFiscalYearId && allActiveKPIs.length > 0 ? allActiveKPIs : masterKPIs
    if (!globalFilter || !globalFilter.trim()) return list
    const query = globalFilter.trim().toLowerCase()
    return list.filter((kpi: MasterKPI) => {
      const kpiObj = kpi as MasterKPI & Record<string, unknown>
      const code = String(kpiObj.code || kpiObj.kpiCode || '').toLowerCase()
      const name = String(kpiObj.name || kpiObj.kpiName || '').toLowerCase()
      const desc = String(kpiObj.description || '').toLowerCase()
      return (
        code.includes(query) ||
        name.includes(query) ||
        desc.includes(query)
      )
    })
  }, [masterKPIs, allActiveKPIs, selectedFiscalYearId, globalFilter])

  // Auto-populate active KPIs when fiscal year is selected
  // All KPIs for the selected fiscal year are automatically considered "selected"
  // When fiscal year is cleared, clear the active KPIs list
  useEffect(() => {
    if (selectedFiscalYearId && allActiveKPIs.length > 0) {
      // Convert all active KPIs to ActiveKPI[], merging initialActiveKPIs if available
      const autoSelectedKPIs: ActiveKPI[] = allActiveKPIs.map(kpi => {
        const existing = initialActiveKPIs?.find(ik => ik.id === kpi.id || ik.kpiId === kpi.id)
        return {
          id: kpi.id,
          name: kpi.name,
          code: kpi.code,
          fiscalYearId: selectedFiscalYearId,
          kpiId: kpi.id,
          kpiName: kpi.name,
          kpiCode: kpi.code,
          description: kpi.description,
          functionType: (kpi.functionType || 'CoreFunction') as 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport',
          activationType: 'Mandated' as const,
          isLocked: existing?.isLocked ?? kpi.isLocked ?? false,
          isModified: false,
          aggregationMethod: existing?.aggregationMethod || kpi.defaultAggregation,
          defaultAggregation: kpi.defaultAggregation,
          allowOfficeOverride: true,
          agencyTargetAnnual: existing?.agencyTargetAnnual ?? kpi.agencyTargetAnnual ?? null,
          agencyTargetQ1: existing?.agencyTargetQ1 ?? kpi.agencyTargetQ1 ?? null,
          agencyTargetQ2: existing?.agencyTargetQ2 ?? kpi.agencyTargetQ2 ?? null,
          agencyTargetQ3: existing?.agencyTargetQ3 ?? kpi.agencyTargetQ3 ?? null,
          agencyTargetQ4: existing?.agencyTargetQ4 ?? kpi.agencyTargetQ4 ?? null,
          unitOfMeasure: existing?.unitOfMeasure || kpi.unitOfMeasure,
          measurementUnit: existing?.measurementUnit || kpi.measurementUnit,
          status: existing?.status || kpi.status,
          masterKPI: kpi,
        }
      })
      setActiveKPIs(autoSelectedKPIs)
    } else if (!selectedFiscalYearId) {
      // Clear active KPIs when no fiscal year is selected
      setActiveKPIs([])
    }
  }, [selectedFiscalYearId, allActiveKPIs, initialActiveKPIs])

  // Initialize lock state from backend when KPIs or fiscal years are loaded
  useEffect(() => {
    if (fyResponse?.data) {
      const lockMap = new Map(fiscalYearLockStates)
      let changed = false
      fyResponse.data.forEach((fy: AppFiscalYear) => {
        const isLocked = fy.isLocked === true || (fy.status || '').toLowerCase() === 'locked'
        if (lockMap.get(fy.id) !== isLocked) {
          lockMap.set(fy.id, isLocked)
          changed = true
        }
      })
      if (selectedFiscalYearId && allActiveKPIs.length > 0) {
        const backendKpiLock = allActiveKPIs.some(kpi => kpi.isLocked === true)
        if (backendKpiLock && !lockMap.get(selectedFiscalYearId)) {
          lockMap.set(selectedFiscalYearId, true)
          changed = true
        }
      }
      if (changed) {
        setFiscalYearLockStates(lockMap)
      }
    }
  }, [fyResponse?.data, selectedFiscalYearId, allActiveKPIs])
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    kpiId: string
    kpiName: string
  }>({ isOpen: false, kpiId: '', kpiName: '' })

  const [lockConfirmation, setLockConfirmation] = useState<{
    isOpen: boolean
  }>({ isOpen: false })

  const [editKPI, setEditKPI] = useState<{
    isOpen: boolean
    kpi: MasterKPI | null
  }>({ isOpen: false, kpi: null })

  const [detailsKPI, setDetailsKPI] = useState<{
    isOpen: boolean
    kpi: MasterKPI | Record<string, unknown> | null
  }>({ isOpen: false, kpi: null })

  const handleAddKPIsFromDialog = (selectedMasterKPIs: MasterKPI[]) => {
    if (!selectedMasterKPIs || selectedMasterKPIs.length === 0) {
      toast.error('Please select at least one KPI to add')
      return
    }

    const newActiveKPIs: ActiveKPI[] = selectedMasterKPIs.map((masterKPI) => ({
      id: masterKPI.id,
      name: masterKPI.name,
      code: masterKPI.code,
      description: masterKPI.description,
      functionType: masterKPI.functionType,
      defaultAggregation: masterKPI.defaultAggregation,
      aggregationMethod: masterKPI.defaultAggregation,
      isModified: false,
      masterKPI: masterKPI,
    }))

    setActiveKPIs(prevKPIs => [...prevKPIs, ...newActiveKPIs])
    
    toast.success(`Added ${newActiveKPIs.length} KPI(s) to active list. Total: ${activeKPIs.length + newActiveKPIs.length}`)
  }

  const handleConfirmDelete = () => {
    const kpiToDelete = activeKPIs.find(k => k.id === deleteConfirmation.kpiId)
    setActiveKPIs(activeKPIs.filter((k) => k.id !== deleteConfirmation.kpiId))

    // Clean up aggregation methods and notes
    const newMethods = new Map(aggregationMethods)
    const newNotes = new Map(modificationNotes)
    newMethods.delete(deleteConfirmation.kpiId)
    newNotes.delete(deleteConfirmation.kpiId)
    setAggregationMethods(newMethods)
    setModificationNotes(newNotes)

    toast.success(`${kpiToDelete?.name || 'KPI'} has been removed from active KPIs`)

    setDeleteConfirmation({ isOpen: false, kpiId: '', kpiName: '' })
  }

  const handleEditClick = (kpi: MasterKPI) => {
    setEditKPI({ isOpen: true, kpi })
  }

  const matchedFy = fyResponse?.data?.find(fy => fy.id === selectedFiscalYearId)
  const isFiscalYearLocked = selectedFiscalYearId 
    ? (fiscalYearLockStates.get(selectedFiscalYearId) ?? matchedFy?.isLocked ?? ((matchedFy?.status || '').toLowerCase() === 'locked') ?? false)
    : false

  const handleSave = async () => {
    if (!selectedFiscalYearId) {
      toast.error('Please select a Fiscal Year first before locking KPIs.')
      return
    }

    // Show confirmation dialog to lock fiscal year
    setLockConfirmation({ isOpen: true })
  }

  const handleConfirmLock = async () => {
    if (!selectedFiscalYearId) return
    
    setLockConfirmation({ isOpen: false })
    setIsUpdatingLockStatus(true)
    
    try {
      // Get current lock state
      const isCurrentlyLocked = fiscalYearLockStates.get(selectedFiscalYearId) || false
      const selectedFY = fiscalYears.find(fy => fy.id === selectedFiscalYearId)
      const newLockState = !isCurrentlyLocked
      
      // Call API directly with correct payload structure
      await updateKPILockStatus({
        fiscalYearId: selectedFiscalYearId,
        isLocked: newLockState,
      })
      
      // Update local lock state
      const newLockStates = new Map(fiscalYearLockStates)
      newLockStates.set(selectedFiscalYearId, newLockState)
      setFiscalYearLockStates(newLockStates)
      
      toast.success(`KPIs for ${selectedFY?.name || 'Fiscal Year'} ${newLockState ? 'locked' : 'unlocked'} successfully`)
      
      // Refetch KPIs data to reflect updated lock state
      refetchKPIs()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update lock state'
      toast.error(errorMessage)
    } finally {
      setIsUpdatingLockStatus(false)
    }
  }

  const handleToggleLockForKPIs = async () => {
    handleSave()
  }

  const submitting = isLoading || isActivatingKpis || isUpdatingLockStatus

  // Generate columns with callbacks for actions
  // Using proper type union instead of 'any' assertions
  const masterKPIColumns = useActivateKpisColumns({
    onViewDetails: (kpi) => {
      const kpiObj = kpi as MasterKPI & Record<string, unknown>
      const mappedKPI = {
        id: kpiObj.id,
        code: kpiObj.code || '',
        name: kpiObj.name || '',
        description: kpiObj.description || '',
        functionType: (kpiObj.functionType || 'CoreFunction') as 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport',
        aggregationMethod: (('defaultAggregation' in kpiObj ? kpiObj.defaultAggregation : 'SUM') || 'SUM') as AggregationMethod,
        isActive: ('status' in kpiObj ? kpiObj.status === 'Active' : true),
        activatedDate: new Date().toISOString(),
      }
      setDetailsKPI({ isOpen: true, kpi: mappedKPI })
    },
    onRemoveClick: (kpiId, kpiName) => {
      const kpi = (activeKPIs as (ActiveKPI | MasterKPI)[]).find(k => k.id === kpiId) || (allActiveKPIs as (ActiveKPI | MasterKPI)[]).find(k => k.id === kpiId)
      const statusLower = (kpi?.status || '').toLowerCase()
      if (isFiscalYearLocked || statusLower === 'assigned' || statusLower === 'established') {
        toast.error('This KPI is already assigned and approved in OPCR. It cannot be removed.')
        return
      }
      setDeleteConfirmation({
        isOpen: true,
        kpiId,
        kpiName,
      })
    },
    onEditClick: (kpi) => {
      const statusLower = ((kpi as MasterKPI & { status?: string })?.status || '').toLowerCase()
      if (isFiscalYearLocked || statusLower === 'assigned' || statusLower === 'established') {
        toast.error('This KPI is already assigned and approved in OPCR. It cannot be edited.')
        return
      }
      handleEditClick(kpi as MasterKPI)
    },
    isLocked: isFiscalYearLocked,
  })

  // Error state from KPI loading
  if (kpiError) {
    const errorMessage = kpiError instanceof Error ? kpiError.message : 'Failed to load KPIs'
    return (
      <form className="space-y-6">
        <div className="p-6 rounded-lg bg-red-50 border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading KPIs</h3>
          <p className="text-red-700 text-sm mb-4">{errorMessage}</p>
          <Button 
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-red-600 border-red-300 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </form>
    )
  }

  // Error state from fiscal year loading
  if (fyError) {
    const errorMessage = fyError instanceof Error ? fyError.message : 'Failed to load fiscal years'
    return (
      <form className="space-y-6">
        <div className="p-6 rounded-lg bg-red-50 border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading Fiscal Years</h3>
          <p className="text-red-700 text-sm mb-4">{errorMessage}</p>
          <Button 
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-red-600 border-red-300 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form className="space-y-6">
      {/* Reference KPIs Table (All Available) */}
      <Card>
        <CardHeader>
          <CardTitle>All KPIs List</CardTitle>
          <CardDescription>
            {selectedFiscalYearId 
              ? `Configure and activate KPIs for ${fiscalYears.find(fy => fy.id === selectedFiscalYearId)?.name || 'Fiscal Year'}`
              : 'Configure and activate KPIs from the master library'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <TemplateTable<MasterKPI>
              key={`kpis-fiscal-year-${selectedFiscalYearId}`}
              columns={masterKPIColumns as ColumnDef<MasterKPI>[]}
              data={displayedKPIs}
              actions={['read']}
              globalFilter={globalFilter}
              onGlobalFilterChange={handleGlobalFilterChange}
              toolbar={() => (
                <ActiveKPIsToolbar
                  globalFilter={globalFilter}
                  onGlobalFilterChange={handleGlobalFilterChange}
                  onAddKPI={handleAddKPI}
                  fiscalYears={fiscalYears}
                  selectedFiscalYearId={selectedFiscalYearId}
                  onFiscalYearChange={handleFiscalYearChange}
                  onClearFiscalYear={handleClearFiscalYear}
                  isLoadingKPIs={isLoadingKPIs}
                  isLoadingFiscalYears={isLoadingFY}
                />
              )}
              manualPagination={true}
              pageCount={kpisResponse?.totalPages || 1}
              pageIndex={pageNumber - 1}
              pageSize={pageSize}
              totalCount={kpisResponse?.totalCount || 0}
              onPaginationChange={(paginationState) => {
                setPageNumber(paginationState.pageIndex + 1)
                setPageSize(paginationState.pageSize)
              }}
              minRows={5}
              maxRows={50}
            />
          </div>
        </CardContent>
      </Card>

      {/* KPI Selection Dialog */}
      <KPISelectionDialog
        isOpen={isSelectionDialogOpen}
        onClose={() => setIsSelectionDialogOpen(false)}
        onAddToActive={handleAddKPIsFromDialog}
        existingKPIIds={activeKPIs.map(kpi => kpi.id)}
        fiscalYearId={selectedFiscalYearId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        kpiName={deleteConfirmation.kpiName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, kpiId: '', kpiName: '' })}
      />

      {/* Lock KPIs Confirmation Dialog */}
      <Dialog open={lockConfirmation.isOpen} onOpenChange={(open) => setLockConfirmation({ isOpen: open })}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{isFiscalYearLocked ? 'Unlock' : 'Lock'} KPIs for Fiscal Year?</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base">
            {isFiscalYearLocked 
              ? 'This will unlock all KPIs for the selected fiscal year. You will be able to modify, add, or remove KPIs again.'
              : 'This will lock all KPIs for the selected fiscal year. Locked KPIs cannot be edited or removed until unlocked. You can still proceed to the next step at any time.'}
          </DialogDescription>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLockConfirmation({ isOpen: false })}
              disabled={isUpdatingLockStatus}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmLock}
              disabled={isUpdatingLockStatus}
              className={isFiscalYearLocked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {isUpdatingLockStatus ? (isFiscalYearLocked ? 'Unlocking...' : 'Locking...') : (isFiscalYearLocked ? 'Unlock KPIs' : 'Lock KPIs')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit KPI Dialog */}
      <EditKpiDialog
        isOpen={editKPI.isOpen}
        onClose={() => setEditKPI({ isOpen: false, kpi: null })}
        kpi={editKPI.kpi}
        onSaveComplete={() => void refetchKPIs()}
      />

      {/* View KPI Details Dialog */}
      {detailsKPI.isOpen && (
        <KPIDetailsDialog
          isOpen={detailsKPI.isOpen}
          onClose={() => setDetailsKPI({ isOpen: false, kpi: null })}
          kpi={detailsKPI.kpi}
          readOnly={true}
        />
      )}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {!selectedFiscalYearId && displayedKPIs.length > 0 && (
            <span className="text-blue-600">ℹ️ Showing all available KPIs (select fiscal year to filter)</span>
          )}
          {!selectedFiscalYearId && displayedKPIs.length === 0 && (
            <span className="text-blue-600">ℹ️ No KPIs available</span>
          )}
          {selectedFiscalYearId && displayedKPIs.length === 0 && (
            <span className="text-orange-600">⚠️ No KPIs available for this fiscal year</span>
          )}
          {selectedFiscalYearId && displayedKPIs.length > 0 && isFiscalYearLocked && (
            <span className="text-amber-600">🔒 All KPIs are locked for this fiscal year</span>
          )}
          {selectedFiscalYearId && displayedKPIs.length > 0 && !isFiscalYearLocked && (
            <span className="text-blue-600">🔓 KPIs are unlocked - you can modify them or proceed to next step</span>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}

          {/* Debug Info - Remove this in production */}
          <div className="text-xs text-gray-500 mr-4 flex flex-col items-end">
            <div>Displayed KPIs: {displayedKPIs.length}</div>
            <div>Selected KPIs: {activeKPIs.length}</div>
            <div>Fiscal Year: {selectedFiscalYearId || 'Not selected'}</div>
            <div>Is Locked: {isFiscalYearLocked ? 'Yes' : 'No'}</div>
          </div>

          <Button
            type="button"
            onClick={handleToggleLockForKPIs}
            disabled={submitting || (!selectedFiscalYearId && (!fyResponse?.data || fyResponse.data.length === 0))}
            className={isFiscalYearLocked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}
            title={isFiscalYearLocked ? 'Click to unlock KPIs' : 'Click to lock KPIs'}
          >
            <Lock className="w-4 h-4 mr-1" />
            {submitting ? (isFiscalYearLocked ? 'Unlocking...' : 'Locking...') : (isFiscalYearLocked ? 'Unlock KPIs' : 'Lock KPIs')}
          </Button>

          <Button
            type="button"
            onClick={() => {
              if (!selectedFiscalYearId) {
                toast.error('Please select a Fiscal Year first before proceeding to set targets.')
                return
              }

              // Build source list: prefer activeKPIs, fallback to allActiveKPIs or masterKPIs
              const sourceItems = activeKPIs.length > 0 
                ? activeKPIs 
                : allActiveKPIs.length > 0 
                  ? allActiveKPIs.map(kpi => ({ masterKPI: kpi, id: kpi.id, name: kpi.name, code: kpi.code, description: kpi.description, functionType: kpi.functionType, defaultAggregation: kpi.defaultAggregation })) 
                  : masterKPIs.map(kpi => ({ masterKPI: kpi, id: kpi.id, name: kpi.name, code: kpi.code, description: kpi.description, functionType: kpi.functionType, defaultAggregation: kpi.defaultAggregation }))

              // Pass activated KPIs with all backend data to target setting (including agency targets)
              const activatedKPIs: ActivatedKPI[] = sourceItems.map((itemObj) => {
                const item = itemObj as Record<string, unknown> & { masterKPI?: MasterKPI }
                const kpi = item.masterKPI || (item as unknown as MasterKPI)
                return {
                  ...kpi,
                  id: item.id || kpi.id,
                  fiscalYearId: selectedFiscalYearId,
                  kpiId: item.id || kpi.id,
                  kpiName: item.name || kpi.name,
                  kpiCode: item.code || kpi.code,
                  description: item.description || kpi.description,
                  functionType: (item.functionType || kpi.functionType || 'CoreFunction') as 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport',
                  activationType: 'Mandated' as const,
                  isLocked: isFiscalYearLocked || Boolean(item.isLocked || kpi.isLocked),
                  aggregationMethod: aggregationMethods.get(item.id || kpi.id) || item.defaultAggregation || kpi.defaultAggregation,
                  modificationNotes: modificationNotes.get(item.id || kpi.id),
                  allowOfficeOverride: true,
                  status: kpi.status,
                  unitOfMeasure: item.unitOfMeasure || kpi.unitOfMeasure || item.measurementUnit || kpi.measurementUnit || 'Number',
                  measurementUnit: item.measurementUnit || kpi.measurementUnit || item.unitOfMeasure || kpi.unitOfMeasure || 'Number',
                  agencyTargetAnnual: kpi.agencyTargetAnnual ?? null,
                  agencyTargetQ1: kpi.agencyTargetQ1 ?? null,
                  agencyTargetQ2: kpi.agencyTargetQ2 ?? null,
                  agencyTargetQ3: kpi.agencyTargetQ3 ?? null,
                  agencyTargetQ4: kpi.agencyTargetQ4 ?? null,
                }
              })
              onSubmit(activatedKPIs, selectedFiscalYearId)
            }}
            disabled={submitting || !selectedFiscalYearId}
            className={cn(
              'bg-green-600 hover:bg-green-700 font-bold',
              !selectedFiscalYearId && 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400',
            )}
            title={!selectedFiscalYearId ? 'Please select a Fiscal Year first before proceeding to set targets' : 'Proceed to target setting & office distribution'}
          >
            Proceed
          </Button>
        </div>
      </div>
    </form>
  )
}
