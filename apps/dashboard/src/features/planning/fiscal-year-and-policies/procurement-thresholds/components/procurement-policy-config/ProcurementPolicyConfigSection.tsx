import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'

import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'
import { getProcurementModeThresholdsRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModeThresholdsRequest'

import {
  ProcurementPolicyConfigForm,
  DeleteConfirmationDialog,
  ProcurementPolicyConfigTable,
  SidebarFilters,
} from './components'
import type { ProcurementPolicyConfigFormValues } from './components/ProcurementPolicyConfigForm'

import {
  useProcurementPolicyConfigs,
  useCreateProcurementPolicyConfig,
  useUpdateProcurementPolicyConfig,
  useDeleteProcurementPolicyConfig,
} from './hooks'

import { useFilterState } from './hooks/useFilterState'
import { useTableEditState } from './hooks/useTableEditState'

import type {
  ProcurementPolicyConfig,
  FiscalYear,
} from '@/lib/fiscal-year-and-policies/types'

const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)
const useProcurementModeThresholds = createQueryHookFromTemplate(
  getProcurementModeThresholdsRequest,
)
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

const QUERY_KEY_PREFIX = '/procurement-policy-configs'

export function ProcurementPolicyConfigSection() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] =
    useState<ProcurementPolicyConfig | null>(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [paginationState, setPaginationState] = useState({
    pageSize: 10,
    currentPage: 1,
  })

  const filterState = useFilterState()
  const editState = useTableEditState()
  const { data: fiscalYearsData } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100, pageNumber: 1 },
  })
  const { data: modesData } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })
  const { data: thresholdsData } = useProcurementModeThresholds({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Build API filter string from sidebar state
  const apiFilters = useMemo(() => {
    const parts: string[] = []
    if (filterState.filters.fiscalYearId)
      parts.push(`fiscalYearId:${filterState.filters.fiscalYearId}`)
    if (filterState.filters.modeIds.length === 1)
      parts.push(`procurementModeId:${filterState.filters.modeIds[0]}`)
    return parts.join(',') || undefined
  }, [filterState.filters])

  const { data: configsData, isLoading: isLoadingConfigs } =
    useProcurementPolicyConfigs({
      pathParams: {},
      queryParams: {
        pageSize: paginationState.pageSize,
        pageNumber: paginationState.currentPage,
        filters: apiFilters,
      },
    })

  const fiscalYears: FiscalYear[] = useMemo(
    () => fiscalYearsData?.data || [],
    [fiscalYearsData],
  )
  const modes = useMemo(() => modesData?.data || [], [modesData])
  const thresholds = useMemo(() => thresholdsData?.data || [], [thresholdsData])

  // Apply client-side filters (API may not support all filter combinations)
  const configs = useMemo(() => {
    const raw = configsData?.data || []
    return raw.filter((c: ProcurementPolicyConfig) => {
      // Fiscal year filter
      if (
        filterState.filters.fiscalYearId &&
        c.fiscalYearId !== filterState.filters.fiscalYearId
      )
        return false
      if (
        filterState.filters.modeIds.length > 0 &&
        !filterState.filters.modeIds.includes(c.procurementModeId)
      )
        return false
      // Amount range filters
      if (
        filterState.filters.amountMin !== undefined &&
        c.minAmount < filterState.filters.amountMin
      )
        return false
      if (
        filterState.filters.amountMax !== undefined &&
        c.minAmount > filterState.filters.amountMax
      )
        return false
      return true
    })
  }, [configsData, filterState.filters])

  const totalPages = configsData?.totalPageNumber || 1

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useCreateProcurementPolicyConfig()
  const updateMutation = useUpdateProcurementPolicyConfig()
  const deleteMutation = useDeleteProcurementPolicyConfig()

  const invalidateConfigs = () =>
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith(QUERY_KEY_PREFIX)
      },
    })

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFormSubmit = (formData: ProcurementPolicyConfigFormValues) => {
    createMutation.mutate(
      {
        pathParams: {},
        payload: {
          fiscalYearId: formData.fiscalYearId,
          procurementModeId: formData.procurementModeId,
          procurementModeThresholdId: formData.procurementModeThresholdId,
          minAmount: formData.minAmount,
          ...(formData.maxAmount !== undefined
            ? { maxAmount: formData.maxAmount }
            : {}),
        },
      },
      {
        onSuccess: () => {
          invalidateConfigs()
          toast.success('Procurement Policy Config created successfully')
          setFormOpen(false)
        },
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to create Procurement Policy Config',
          )
        },
      },
    )
  }

  const handleInlineEditStart = (config: ProcurementPolicyConfig) => {
    editState.startEdit(config.id, {
      procurementModeThresholdId: config.procurementModeThresholdId,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
    })
  }

  const handleInlineEditSave = (configId: string) => {
    const { procurementModeThresholdId, minAmount, maxAmount } =
      editState.editValues
    updateMutation.mutate(
      {
        pathParams: { id: configId },
        payload: {
          procurementModeThresholdId,
          minAmount,
          maxAmount,
        },
      },
      {
        onSuccess: () => {
          invalidateConfigs()
          toast.success('Procurement Policy Config updated successfully')
          editState.cancelEdit()
        },
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to update Procurement Policy Config',
          )
        },
      },
    )
  }

  const handleDelete = (config: ProcurementPolicyConfig) => {
    setConfigToDelete(config)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!configToDelete) return
    deleteMutation.mutate(
      { pathParams: { id: configToDelete.id } },
      {
        onSuccess: () => {
          invalidateConfigs()
          toast.success('Procurement Policy Config deleted successfully')
          setDeleteDialogOpen(false)
          setConfigToDelete(null)
        },
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to delete Procurement Policy Config',
          )
        },
      },
    )
  }

  const handleBulkDelete = (ids: string[]) => {
    setBulkDeleteIds(ids)
    setBulkDeleteOpen(true)
  }

  const handleConfirmBulkDelete = () => {
    let completed = 0
    let failed = 0
    bulkDeleteIds.forEach((id) => {
      deleteMutation.mutate(
        { pathParams: { id } },
        {
          onSuccess: () => {
            completed++
            if (completed + failed === bulkDeleteIds.length) {
              invalidateConfigs()
              toast.success(
                `${completed} config${completed > 1 ? 's' : ''} deleted successfully`,
              )
              setBulkDeleteOpen(false)
              setBulkDeleteIds([])
            }
          },
          onError: () => {
            failed++
            if (completed + failed === bulkDeleteIds.length) {
              invalidateConfigs()
              if (failed > 0)
                toast.error(`${failed} deletion${failed > 1 ? 's' : ''} failed`)
              if (completed > 0)
                toast.success(
                  `${completed} config${completed > 1 ? 's' : ''} deleted`,
                )
              setBulkDeleteOpen(false)
              setBulkDeleteIds([])
            }
          },
        },
      )
    })
  }

  const getModeById = (modeId: string) => modes.find((m) => m.id === modeId)

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Procurement Policy Configuration
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Manage procurement policy configurations across fiscal years
            </CardDescription>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Config
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start min-w-0 w-full">
          {/* ── Sidebar Filters ──────────────────────────────────── */}
          <SidebarFilters
            filters={filterState.filters}
            hasActiveFilters={filterState.hasActiveFilters}
            modes={modes}
            fiscalYears={fiscalYears}
            onToggleMode={filterState.toggleModeFilter}
            onSetFiscalYear={(id: string) => {
              filterState.setFiscalYearFilter(id)
              setPaginationState((p) => ({ ...p, currentPage: 1 }))
            }}
            onSetAmountMin={filterState.setAmountMinFilter}
            onSetAmountMax={filterState.setAmountMaxFilter}
            onClearFilters={filterState.clearFilters}
          />

          {/* ── Table ────────────────────────────────────────────── */}
          <div className="min-w-0 w-full">
            <ProcurementPolicyConfigTable
              configs={configs}
              modes={modes}
              thresholds={thresholds}
              fiscalYears={fiscalYears}
              isLoading={isLoadingConfigs}
              isSaving={updateMutation.isPending}
              currentPage={paginationState.currentPage}
              pageSize={paginationState.pageSize}
              totalPages={totalPages}
              editingId={editState.editingId}
              editValues={editState.editValues}
              onPageChange={(page) =>
                setPaginationState((p) => ({ ...p, currentPage: page }))
              }
              onPageSizeChange={(size) =>
                setPaginationState({ pageSize: size, currentPage: 1 })
              }
              onEdit={handleInlineEditStart}
              onDelete={handleDelete}
              onSave={handleInlineEditSave}
              onCancelEdit={editState.cancelEdit}
              onUpdateEditValue={editState.updateEditValue}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        </div>
      </CardContent>

      {/* ── Create Form Modal ─────────────────────────────────────── */}
      <ProcurementPolicyConfigForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending}
      />

      {/* ── Single Delete Confirmation ────────────────────────────── */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        config={configToDelete}
        modeName={
          configToDelete
            ? getModeById(configToDelete.procurementModeId)?.name
            : undefined
        }
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Bulk Delete Confirmation ──────────────────────────────── */}
      <DeleteConfirmationDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open)
          if (!open) setBulkDeleteIds([])
        }}
        config={null}
        modeName={`${bulkDeleteIds.length} selected configuration${bulkDeleteIds.length > 1 ? 's' : ''}`}
        onConfirm={handleConfirmBulkDelete}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  )
}
