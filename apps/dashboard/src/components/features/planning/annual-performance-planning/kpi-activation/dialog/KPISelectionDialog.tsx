/**
 * KPI Selection Dialog
 * Step 2: KPI Activation - Allows selection of KPIs from master library to add to active KPIs
 * 
 * Displays ALL available KPIs by default
 * User can optionally filter by fiscal year using the dialog's toolbar (independent from parent)
 * Fiscal year from parent component is ONLY used in activation payload, NOT for filtering
 * 
 * Features:
 * - Shows ALL KPIs unless user selects fiscal year in THIS dialog's toolbar
 * - Search and additional filters (Function Type, Behaviour, Unit of Measure)
 * - Parent's fiscal year is for activation context only
 */

import { useState, useMemo, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Table as TableType } from '@tanstack/react-table'
import { Plus, Award, Target, Zap, CheckCircle2, AlertCircle, BookOpen, Globe, Building2, Lock } from 'lucide-react'
import { createQueryHookFromTemplate, createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TemplateTable } from '@/components/TemplateTable'
import { Skeleton } from '@/components/ui/skeleton'
import { useDynamicColumns } from '@/components/features/planning/annual-performance-planning/kpi-activation/table/KPISelectionColumn'
import { KPISelectionToolbar } from '@/components/features/planning/annual-performance-planning/kpi-activation/table/KPISelectionToolbar'
import { getKpiRequest } from '@/components/features/planning/kpi/handlers/getKpiRequest'
import { activateBulkKpisRequest } from '@/components/features/planning/annual-performance-planning/kpi-activation/handlers/activateBulkKpisRequest'
import { getFYActiveKPIsRequest, type FYActiveKPI } from '@/components/features/planning/annual-performance-planning/kpi-activation/handlers/getFYActiveKPIsRequest'
import { useFiscalYears, formatFiscalYearForDisplay } from '@/features/planning/annual-performance-planning/hooks/useAPPQueries'
import type { MasterKPI } from '@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs'
import { toast } from 'sonner'

const useGetKpiDetails = createQueryHookFromTemplate(getKpiRequest)
const useActivateBulkKpis = createMutationHookFromTemplate(activateBulkKpisRequest)
const useGetFYActiveKPIs = createQueryHookFromTemplate(getFYActiveKPIsRequest)

interface KPISelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddToActive: (selectedKPIs: MasterKPI[]) => void
  existingKPIIds: Set<string> | string[]
  fiscalYearId?: string
}

export function KPISelectionDialog({
  isOpen,
  onClose,
  onAddToActive,
  existingKPIIds,
  fiscalYearId,
}: KPISelectionDialogProps) {
  const queryClient = useQueryClient()
  
  // State for fiscal year selection in the dialog
  const [selectedDialogFiscalYearId, setSelectedDialogFiscalYearId] = useState<string>(fiscalYearId || '')
  
  // Sync selectedDialogFiscalYearId with prop when dialog opens
  useEffect(() => {
    if (isOpen && fiscalYearId) {
      setSelectedDialogFiscalYearId(fiscalYearId)
    }
  }, [isOpen, fiscalYearId])

  // Fetch available fiscal years
  const { data: fyResponse, isLoading: isLoadingFY } = useFiscalYears({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })
  const fiscalYears = fyResponse?.data?.map(fy => formatFiscalYearForDisplay(fy)) || []
  
  // Fetch FY Active KPIs when the dialog is open with fiscal year filter
  const fyActiveKPIsQueryResult = useGetFYActiveKPIs({
    pathParams: {},
    queryParams: (selectedDialogFiscalYearId
      ? { Filters: `fiscalYearId==${selectedDialogFiscalYearId}`, PageNumber: 1, PageSize: 1000 }
      : { PageNumber: 1, PageSize: 1000 }),
    enabled: isOpen,
  })
  
  // Use the response
  const fyActiveKPIsResponse = fyActiveKPIsQueryResult.data

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFunctionType, setSelectedFunctionType] = useState<string | 'all'>('all')
  const [selectedBehaviour, setSelectedBehaviour] = useState<string | 'all'>('all')
  const [selectedUnit, setSelectedUnit] = useState<string | 'all'>('all')
  const [tableInstance, setTableInstance] = useState<TableType<MasterKPI> | null>(null)
  const [selectedKPIIds, setSelectedKPIIds] = useState<Set<string>>(new Set())
  const [detailsKPI, setDetailsKPI] = useState<MasterKPI | null>(null)
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set())
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [pendingKPIs, setPendingKPIs] = useState<MasterKPI[] | Record<string, unknown>[] >([])

  // Transform API response to MasterKPI format
  const allMasterKPIs: MasterKPI[] = useMemo(() => {
    if (!fyActiveKPIsResponse?.data) return []
    const mapped = fyActiveKPIsResponse.data.map((kpi: FYActiveKPI) => {
      const matchedFy = fyResponse?.data?.find(fy => fy.id === kpi.fiscalYearId)
      const matchedFyCode = (matchedFy as { code?: string })?.code
      const yearDisplay = matchedFy
        ? (matchedFy.name || matchedFy.year || matchedFyCode)
        : (new Date().getFullYear())
      return {
        id: kpi.masterKPIId,
        name: kpi.name,
        code: kpi.code,
        description: kpi.description || '',
        functionType: (kpi.functionCategory || 'CoreFunction') as 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport',
        defaultAggregation: (kpi.distributionBehavior || 'Sum') as MasterKPI['defaultAggregation'],
        unitOfMeasure: kpi.measurementUnit,
        monitoringFrequency: kpi.monitoringFrequency,
        isOptInAvailable: kpi.isOptInAvailable,
        isGAD: kpi.isGAD,
        status: kpi.status,
        isLocked: kpi.isLocked,
        isAvailableForShopping: !kpi.isLocked,
        targetDirection: 'Increase',
        ownerOffice: '',
        ratingScale: [],
        baselineValue: 0,
        createdBy: kpi.createdBy || 'System',
        createdDate: kpi.createdAt || new Date().toISOString(),
        lastModifiedBy: kpi.createdBy || 'System',
        lastModifiedDate: kpi.createdAt || new Date().toISOString(),
        version: 1,
        fiscalYearId: kpi.fiscalYearId,
        fiscalYear: yearDisplay,
      }
    })
    return mapped.sort((a, b) => {
      const dateA = new Date(a.lastModifiedDate || a.createdDate || 0).getTime()
      const dateB = new Date(b.lastModifiedDate || b.createdDate || 0).getTime()
      return dateB - dateA
    })
  }, [fyActiveKPIsResponse, fyResponse?.data])


  // Fetch detailed KPI information when details dialog opens
  const { data: kpiDetailsResponse, isLoading: isLoadingDetails } = useGetKpiDetails({
    pathParams: { id: detailsKPI?.id || '' },
    queryParams: {},
  })

  // Activate KPIs mutation
  const activateMutation = useActivateBulkKpis()

  const kpiDetails = useMemo(() => {
    if (!kpiDetailsResponse) return null
    return (kpiDetailsResponse as { data?: Record<string, unknown> })?.data || kpiDetailsResponse
  }, [kpiDetailsResponse])

  const handleViewDetails = (kpi: MasterKPI) => {
    setDetailsKPI(kpi)
  }

  const handleCloseDetails = () => {
    setDetailsKPI(null)
  }

  const handleAddToActiveFromDetails = async () => {
    if (!detailsKPI) return

    if (!fiscalYearId) {
      toast.error('Please select a fiscal year in the form before adding KPIs')
      return
    }

    try {
      await activateMutation.mutateAsync({
        pathParams: {},
        payload: {
          fiscalYearId,
          kpIs: [{ masterKPIId: detailsKPI.id }],
        },
      })

      toast.success(`KPI "${detailsKPI.name}" activated successfully`)

      // Immediately remove from available list for better UX
      setRecentlyAddedIds(prev => new Set([...prev, detailsKPI.id]))
      
      // Call parent callback for additional handling
      onAddToActive([detailsKPI])
      
      // Invalidate and refetch active KPIs
      queryClient.invalidateQueries({ queryKey: ['active-kpis'] })
      
      setDetailsKPI(null)
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage)
    }
  }

  // Filter KPIs based on search, function type, behaviour, and unit
  // Note: Fiscal year filter is applied at API fetch level via Filters parameter
  const filteredKPIs = useMemo(() => {
    // Convert existingKPIIds to a Set of strings for consistent comparison
    const existingIds = new Set(
      (Array.isArray(existingKPIIds) ? existingKPIIds : Array.from(existingKPIIds))
        .map(id => String(id))
    )
    
    return allMasterKPIs.filter(kpi => {
      const kpiId = String(kpi.id)
      const kpiObj = kpi as MasterKPI & Record<string, unknown>
      
      const matchesSearch =
        kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.description?.toLowerCase().includes(searchTerm.toLowerCase())

      // Don't show KPIs that are already active or recently added to avoid conflicts
      const notAlreadyActive = !existingIds.has(kpiId) && !recentlyAddedIds.has(kpiId)

      // Filter by fiscal year
      const matchesFiscalYear = !selectedDialogFiscalYearId || String(kpiObj.fiscalYearId || '') === String(selectedDialogFiscalYearId)

      // Filter by function type
      const matchesFunctionType = selectedFunctionType === 'all' || kpi.functionType === selectedFunctionType

      // Filter by behaviour (defaultAggregation)
      const matchesBehaviour = selectedBehaviour === 'all' || kpi.defaultAggregation === selectedBehaviour

      // Filter by unit of measure
      const matchesUnit = selectedUnit === 'all' || kpi.unitOfMeasure === selectedUnit

      return matchesSearch && notAlreadyActive && matchesFiscalYear && matchesFunctionType && matchesBehaviour && matchesUnit
    })
  }, [allMasterKPIs, searchTerm, existingKPIIds, selectedFunctionType, selectedBehaviour, selectedUnit, selectedDialogFiscalYearId, recentlyAddedIds])

  // Get dynamic columns without custom selection callback
  const columns = useMemo(
    () => useDynamicColumns({ onViewDetails: handleViewDetails }) as ColumnDef<MasterKPI>[],
    [handleViewDetails]
  )

  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    // Extract selected row IDs and update state
    const selectedIds = new Set(
      Object.entries(rowSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => {
          // Get the actual KPI from filteredKPIs
          const index = parseInt(rowId, 10)
          return filteredKPIs[index]?.id || ''
        })
        .filter(Boolean)
    )
    
    setSelectedKPIIds(selectedIds)
  }

  // Get the actual count from selected KPI IDs
  const getSelectedCount = () => {
    return selectedKPIIds.size
  }

  // Extract error message from API response
  const extractErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') {
      return error
    }

    const err = error as { response?: { data?: { message?: string } }; message?: string }
    
    if (err?.response?.data?.message) {
      return err.response.data.message
    }
    
    if (err?.message) {
      return err.message
    }
    
    return 'Failed to activate KPIs'
  }

  const handleShowConfirmation = () => {
    if (!tableInstance) return

    if (!fiscalYearId) {
      toast.error('Please select a fiscal year in the form before adding KPIs')
      return
    }

    if (selectedKPIIds.size === 0) {
      toast.error('Please select at least one KPI to activate')
      return
    }

    // Get selected KPIs
    const selectedRows = tableInstance.getFilteredSelectedRowModel().rows
    const selectedMasterKPIs = selectedRows.map(row => row.original)

    if (selectedMasterKPIs.length === 0) {
      toast.error('Please select at least one KPI to activate')
      return
    }

    // Store pending KPIs and show confirmation dialog
    setPendingKPIs(selectedMasterKPIs)
    setConfirmationOpen(true)
  }

  const handleConfirmActivation = async () => {
    if (pendingKPIs.length === 0) return

    try {
      // Call mutation to activate KPIs
      await activateMutation.mutateAsync({
        pathParams: {},
        payload: {
          fiscalYearId: fiscalYearId || '',
          kpIs: pendingKPIs.map(kpi => ({ masterKPIId: kpi.id })),
        },
      })

      toast.success(`${pendingKPIs.length} KPI(s) activated successfully`)

      // Immediately remove from available list for better UX
      setRecentlyAddedIds(prev => new Set([...prev, ...pendingKPIs.map(kpi => kpi.id)]))
      
      // Call parent callback for additional handling and table refresh
      onAddToActive(pendingKPIs)
      
      // Refetch queries to ensure table updates immediately
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['active-kpis'] }),
        queryClient.refetchQueries({ queryKey: ['fy-active-kpis'] }),
      ])
      
      // Reset table selection to allow selecting more KPIs
      tableInstance?.resetRowSelection()
      // Reset selected KPIs
      setSelectedKPIIds(new Set())
      
      // Close confirmation dialog
      setConfirmationOpen(false)
      setPendingKPIs([])

      // Close the main dialog after parent processes the update
      handleClose()
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage)
    }
  }

  const handleConfirmCancel = () => {
    setConfirmationOpen(false)
    setPendingKPIs([])
  }

  const handleClose = () => {
    if (tableInstance) {
      tableInstance.resetRowSelection()
    }
    setSearchTerm('')
    setSelectedKPIIds(new Set())
    setConfirmationOpen(false)
    setPendingKPIs([])
    onClose()
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
    // DO NOT reset tableInstance when opening - it needs to persist for selection tracking
  }

  const handleResetFilters = () => {
    setSelectedDialogFiscalYearId('')
    setSearchTerm('')
    setSelectedFunctionType('all')
    setSelectedBehaviour('all')
    setSelectedUnit('all')
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent size="5xl" className="h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Activate KPIs</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Select one or more KPIs to activate.
            </p>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4 pr-4">
              {/* TemplateTable with integrated toolbar and columns */}
              <TemplateTable<MasterKPI>
                key={`kpi-table`}
                title={`Available KPIs (${filteredKPIs.length})`}
                columns={columns}
                data={filteredKPIs}
                actions={['read']}
                onTableReady={setTableInstance}
                onRowSelectionChange={handleRowSelectionChange}
                toolbar={() => (
                  <KPISelectionToolbar
                    masterKPIs={allMasterKPIs}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedFunctionType={selectedFunctionType}
                    onFunctionTypeChange={setSelectedFunctionType}
                    selectedBehaviour={selectedBehaviour}
                    onBehaviourChange={setSelectedBehaviour}
                    selectedUnit={selectedUnit}
                    onUnitChange={setSelectedUnit}
                    fiscalYears={fiscalYears}
                    selectedFiscalYearId={selectedDialogFiscalYearId}
                    onFiscalYearChange={setSelectedDialogFiscalYearId}
                    isLoadingFiscalYears={isLoadingFY}
                    onResetFilters={handleResetFilters}
                  />
                )}
                fixedPageSize={10}
                minRows={5}
                maxRows={10}
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Done
            </Button>
            <Button
              type="button"
              onClick={handleShowConfirmation}
              disabled={getSelectedCount() === 0 || activateMutation.isPending}
              title={getSelectedCount() === 0 ? 'Please select at least one KPI' : ''}
            >
              {activateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activating...
                </>
              ) : (
                <>Add Selected KPIs ({getSelectedCount()})</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm KPI Activation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate the following {pendingKPIs.length} KPI(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[200px] overflow-y-auto my-4 border rounded-md p-3 bg-gray-50 space-y-2">
            {pendingKPIs.map((kpi, idx) => {
              const kpiObj = kpi as MasterKPI & Record<string, unknown>
              return (
                <div key={(kpiObj.id as string) || idx} className="text-sm border-b pb-2 last:border-b-0 last:pb-0">
                  <span className="font-semibold text-gray-900">{kpiObj.code as string}</span> - {kpiObj.name as string}
                </div>
              )
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConfirmCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmActivation} disabled={activateMutation.isPending}>
              {activateMutation.isPending ? 'Activating...' : 'Confirm & Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailsKPI && (
        <>
          {/* Blur Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000]" />

          <Dialog open={!!detailsKPI} onOpenChange={handleCloseDetails}>
            <DialogContent className="z-[10001] max-w-5xl max-h-[95vh] overflow-y-auto p-0" size="xl">
              {isLoadingDetails ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : kpiDetails ? (
                <>
                  {/* Header Section */}
                  <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-200 z-10">
                    <DialogHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{kpiDetails.code?.charAt(0) || 'K'}</span>
                          </div>
                          <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                              {kpiDetails.code}
                            </DialogTitle>
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              Key Performance Indicator • Comprehensive Details
                            </p>
                          </div>
                        </div>
                        <Badge className={`${
                          kpiDetails.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        } px-3 py-1`}>
                          {kpiDetails.status || 'Active'}
                        </Badge>
                      </div>
                      <p className="text-gray-800 font-medium text-lg leading-relaxed">
                        {kpiDetails.name}
                      </p>
                    </DialogHeader>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-8">
                    {/* Description */}
                    {kpiDetails.description && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {kpiDetails.description}
                        </p>
                      </div>
                    )}

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Unit of Measure
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {kpiDetails.measurementUnit || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Distribution Behavior
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {kpiDetails.distributionBehavior || 'N/A'}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Monitoring Frequency
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {kpiDetails.monitoringFrequency || 'N/A'}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Function Category
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {kpiDetails.functionCategory || 'N/A'}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Opt-In Available
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {kpiDetails.isOptInAvailable ? 'Yes' : 'No'}
                            </div>
                          </div>
                          {kpiDetails.isOptInAvailable && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Gender & Development
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {kpiDetails.isGAD ? 'Yes' : 'No'}
                            </div>
                          </div>
                          {kpiDetails.isGAD && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Agency Targets */}
                    {(kpiDetails.agencyTargetAnnual || kpiDetails.agencyTargetQ1 || kpiDetails.agencyTargetQ2 || kpiDetails.agencyTargetQ3 || kpiDetails.agencyTargetQ4) && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          Agency Targets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Annual</p>
                            <p className="text-2xl font-bold text-amber-900">
                              {kpiDetails.agencyTargetAnnual ? kpiDetails.agencyTargetAnnual.toFixed(2) : '—'}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Q1</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {kpiDetails.agencyTargetQ1 ? kpiDetails.agencyTargetQ1.toFixed(2) : '—'}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Q2</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {kpiDetails.agencyTargetQ2 ? kpiDetails.agencyTargetQ2.toFixed(2) : '—'}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Q3</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {kpiDetails.agencyTargetQ3 ? kpiDetails.agencyTargetQ3.toFixed(2) : '—'}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Q4</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {kpiDetails.agencyTargetQ4 ? kpiDetails.agencyTargetQ4.toFixed(2) : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MFOPAP - Multi-Year Program */}
                    {kpiDetails.MFOPAP && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          Multi-Year Obligational Program & Project
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Program Name</span>
                              <span className="text-sm text-gray-900 font-medium max-w-xs text-right">
                                {kpiDetails.MFOPAP.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Code</span>
                              <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                {kpiDetails.MFOPAP.code}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium text-gray-600">Type</span>
                              <Badge className="bg-purple-100 text-purple-800">
                                {kpiDetails.MFOPAP.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Status</span>
                              <Badge className={kpiDetails.MFOPAP.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {kpiDetails.MFOPAP.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Target Assignments */}
                    {kpiDetails.assignments && kpiDetails.assignments.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          Target Assignments by Office
                        </h3>
                        <div className="space-y-3">
                          {(() => {
                            const totalAnnual = kpiDetails.assignments.reduce((sum: number, a: any) => sum + (a.assignedTargetAnnual || 0), 0)
                            return (
                              <>
                                {/* Summary */}
                                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <div>
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Assigned Target</p>
                                    <p className="text-xl font-bold text-blue-900 mt-1">{totalAnnual.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Offices Assigned</p>
                                    <p className="text-xl font-bold text-blue-900 mt-1">{kpiDetails.assignments.length}</p>
                                  </div>
                                </div>

                                {/* Assignments List */}
                                {kpiDetails.assignments.map((assignment: any) => {
                                  const percentage = totalAnnual > 0 ? ((assignment.assignedTargetAnnual || 0) / totalAnnual * 100) : 0
                                  return (
                                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <p className="font-semibold text-gray-900">{assignment.officeName}</p>
                                          <p className="text-xs text-gray-500 mt-1">Office ID: {assignment.officeId.slice(0, 8)}...</p>
                                        </div>
                                        {assignment.isLocked && (
                                          <Badge variant="outline" className="gap-1">
                                            <Lock className="h-3 w-3" />
                                            Locked
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">Annual Target</span>
                                          <span className="text-lg font-bold text-gray-900">{assignment.assignedTargetAnnual?.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                          />
                                        </div>
                                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                                        {(assignment.assignedTargetQ1 || assignment.assignedTargetQ2 || assignment.assignedTargetQ3 || assignment.assignedTargetQ4) && (
                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Quarterly Breakdown</p>
                                            <div className="flex gap-2">
                                              {[
                                                { q: 'Q1', val: assignment.assignedTargetQ1 },
                                                { q: 'Q2', val: assignment.assignedTargetQ2 },
                                                { q: 'Q3', val: assignment.assignedTargetQ3 },
                                                { q: 'Q4', val: assignment.assignedTargetQ4 },
                                              ].map((q) => (
                                                <div key={q.q} className="flex-1 text-center">
                                                  <p className="text-xs text-gray-500">{q.q}</p>
                                                  <p className="text-sm font-semibold text-gray-900">{q.val ? q.val.toFixed(1) : '—'}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* KPI Measurements */}
                    {kpiDetails.KPIMeasurements && kpiDetails.KPIMeasurements.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Measurement Dimensions
                        </h3>
                        <div className="space-y-4">
                          {kpiDetails.KPIMeasurements.map((measurement: any, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-900">{measurement.dimension}</h4>
                              </div>
                              {measurement.moVs && measurement.moVs.length > 0 && (
                                <div className="ml-4">
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                    Means of Verification
                                  </p>
                                  <ul className="space-y-1">
                                    {measurement.moVs.map((mov: string, movIdx: number) => (
                                      <li key={movIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-yellow-600 mt-1">•</span>
                                        <span>{mov}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attributes */}
                    {kpiDetails.Attributes && kpiDetails.Attributes.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-600" />
                          Classification & Attributes
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {kpiDetails.Attributes.map((attr: any) => (
                            <div key={attr.id} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                              <div className="text-sm font-semibold text-indigo-900">{attr.name}</div>
                              <div className="text-xs text-indigo-700 mt-1">{attr.code}</div>
                              {attr.description && (
                                <p className="text-xs text-indigo-600 mt-2">{attr.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sustainable Development Goals */}
                    {kpiDetails.SDGs && kpiDetails.SDGs.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          Sustainable Development Goals (SDGs)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kpiDetails.SDGs.map((sdg: any) => (
                            <div key={sdg.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 mb-2">{sdg.name}</h4>
                              <p className="text-sm text-green-700">{sdg.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDetails}
                      className="px-6 py-2"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddToActiveFromDetails}
                      disabled={!fiscalYearId || activateMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activateMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Active KPI
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load KPI details</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
