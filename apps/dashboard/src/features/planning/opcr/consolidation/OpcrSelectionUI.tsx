import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOPCRsRequest } from '../handlers/getOPCRsRequest'
import { formatCurrencyAbbr } from '@/utils/formatters'
import { ConsolidateOPCRDialog } from '../dialogs/ConsolidateOPCRDialog'
import OPCRDetailPage from '@/pages/planning/commitments/tabs/OPCRDetailPage'
import { ConsolidationBreadcrumb } from './ConsolidationBreadcrumb'
import type { OPCR } from '../types'
import OPCRPaginationFooter from '../components/OPCRPaginationFooter'

/**
 * OPCR Selection UI
 * Displays approved Office OPCR submissions for consolidation
 *
 * URL Navigation:
 * - No opcrId: Show OPCR list view
 * - With opcrId: Show OPCR detail view with back button
 */
const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)
export default function OpcrSelectionUI() {
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const navigate = useNavigate({ from: '/v2/commitments' })
  const opcrId = (searchParams.opcrId as string | undefined) ?? undefined
  const functionTypeId =
    (searchParams.functionTypeId as string | undefined) ?? undefined
  const functionCategory =
    (searchParams.functionCategory as string | undefined) ?? undefined
  const kpiAssignmentId =
    (searchParams.kpiAssignmentId as string | undefined) ?? undefined
  const kpiId = (searchParams.kpiId as string | undefined) ?? undefined

  const pageNumber = searchParams.pageNumber || 1
  const pageSize = searchParams.pageSize || 25

  const { data: opcrs, isLoading } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
      filters: `commitmentStatus==Approved`,
    },
  })

  const handlePageChange = (newPageNumber: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageNumber: newPageNumber,
      }),
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: newPageSize,
        pageNumber: 1,
      }),
    })
  }

  const [selectedOpcrs, setSelectedOpcrs] = useState<OPCR[]>([])
  const [isConsolidationDialogOpen, setIsConsolidationDialogOpen] =
    useState(false)

  // Navigation handlers
  const handleViewDetails = (opcr: OPCR) => {
    navigate({
      search: (prev) => ({ ...prev, opcrId: opcr.id }),
    })
  }

  const handleBackToSelection = () => {
    window.history.back()
  }

  const handleOPCRDetailClick = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        functionTypeId: undefined,
        kpiId: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  const handleFunctionTypeClick = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        kpiId: undefined,
        kpiAssignmentId: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  const handleFunctionCategoryClick = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        kpiAssignmentId: undefined,
        functionCategory: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  const handleKpiAssignmentClick = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        kpiAssignmentId: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  // Filter out already consolidated OPCRs
  const selectableOpcrs = (opcrs?.data || []).filter(
    (o) => !o.opcrConsolidationId,
  )

  const isAllSelected =
    selectableOpcrs.length > 0 &&
    selectableOpcrs.every((o) => selectedOpcrs.some((s) => s.id === o.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOpcrs([])
    } else {
      setSelectedOpcrs(selectableOpcrs)
    }
  }

  const handleToggleOpcr = (opcr: OPCR) => {
    // Prevent selecting already consolidated OPCRs
    if (opcr.opcrConsolidationId) {
      return
    }
    setSelectedOpcrs((prev) =>
      prev.some((s) => s.id === opcr.id)
        ? prev.filter((item) => item.id !== opcr.id)
        : [...prev, opcr],
    )
  }

  const handleOpenConsolidationDialog = () => {
    if (selectedOpcrs.length === 0) {
      return
    }
    setIsConsolidationDialogOpen(true)
  }

  const handleConsolidationComplete = () => {
    // Clear selection after successful consolidation
    setSelectedOpcrs([])
    setIsConsolidationDialogOpen(false)
  }
  // Detail view rendering level
  if (searchParams.consolidateSubTab === 'selection' && opcrId) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <ConsolidationBreadcrumb
          consolidateSubTab="selection"
          opcrId={opcrId}
          functionTypeId={functionTypeId}
          functionCategory={functionCategory}
          kpiAssignmentId={kpiAssignmentId}
          kpiId={kpiId}
          onClickRoot={handleBackToSelection}
          onClickOpcr={handleOPCRDetailClick}
          onClickFunctionType={handleFunctionTypeClick}
          onClickFunctionCategory={handleFunctionCategoryClick}
          onClickKpiAssignment={handleKpiAssignmentClick}
        />

        {/* OPCR Detail Page */}
        <OPCRDetailPage
          opcrId={opcrId}
          onBack={handleBackToSelection}
          // hideButton
        />
      </div>
    )
  }

  // Empty state
  if ((opcrs?.data?.length || 0) === 0) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <ConsolidationBreadcrumb
          consolidateSubTab="selection"
          functionTypeId={functionTypeId}
          functionCategory={functionCategory}
          kpiAssignmentId={kpiAssignmentId}
          kpiId={kpiId}
          onClickRoot={handleBackToSelection}
          onClickFunctionType={handleFunctionTypeClick}
          onClickFunctionCategory={handleFunctionCategoryClick}
          onClickKpiAssignment={handleKpiAssignmentClick}
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-900">OPCR Selection</h2>
          <p className="text-sm text-slate-600 mt-1">
            Select approved Office OPCRs for agency consolidation
          </p>
        </div>

        <Card className="p-16 border-dashed border-2">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Icon
                icon="mdi:inbox-multiple"
                className="text-6xl text-slate-300"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                No Approved OPCRs Available
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                No approved OPCRs are available yet. Offices will submit their
                OPCRs for your review and approval.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <ConsolidationBreadcrumb
        consolidateSubTab="selection"
        functionTypeId={functionTypeId}
        functionCategory={functionCategory}
        kpiAssignmentId={kpiAssignmentId}
        kpiId={kpiId}
        onClickRoot={handleBackToSelection}
        onClickFunctionType={handleFunctionTypeClick}
        onClickFunctionCategory={handleFunctionCategoryClick}
        onClickKpiAssignment={handleKpiAssignmentClick}
      />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">OPCR Selection</h2>
        <p className="text-sm text-slate-600 mt-1">
          Select approved Office OPCRs for agency consolidation
        </p>
      </div>

      {/* Selection Toolbar */}
      <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOpcrs([])}
            disabled={selectedOpcrs.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            size="sm"
            onClick={handleOpenConsolidationDialog}
            disabled={selectedOpcrs.length === 0}
          >
            Consolidate Selected OPCRs
          </Button>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-slate-900 cursor-pointer"
            >
              Select All
            </label>
            <span className="text-xs text-slate-600">
              ({selectedOpcrs.length}/{selectableOpcrs.length})
            </span>
          </div>
          <Badge variant="outline" className="bg-white">
            {selectedOpcrs.length} selected
          </Badge>
        </div>
      </div>

      {/* OPCR Cards */}
      <div className="space-y-4">
        {opcrs?.data?.map((opcr) => {
          const isSelected = selectedOpcrs.some((s) => s.id === opcr.id)

          return (
            <Card
              key={opcr.id}
              className={cn(
                'p-4 border-2 transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleOpcr(opcr)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={!!opcr.opcrConsolidationId}
                  />
                  <div className="flex-1 flex-row ">
                    <h3 className="font-semibold text-slate-900">
                      {opcr.name}{' '}
                      {opcr.opcrConsolidationId && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                        >
                          <Icon
                            icon="mdi:check-all"
                            className="mr-1 text-amber-600"
                          />
                          Consolidated
                        </Badge>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {opcr.officeName} • FY{' '}
                      {typeof opcr.fiscalYear === 'number'
                        ? opcr.fiscalYear
                        : opcr.fiscalYear?.year}
                    </p>
                  </div>
                </div>

                {/* Summary Badges */}
                <div className="flex flex-wrap gap-2 justify-end ml-4">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <Icon
                      icon="mdi:target-multiple"
                      className="mr-1 text-blue-600"
                    />
                    {opcr.kpiAssignmentCount} KPIs
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                  >
                    <Icon
                      icon="mdi:file-document-multiple"
                      className="mr-1 text-purple-600"
                    />
                    {opcr.activityCount} Activities
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    <Icon icon="mdi:cash" className="mr-1 text-green-600" />
                    {formatCurrencyAbbr(opcr.totalBudget)}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => handleViewDetails(opcr)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Selection Badge */}
                {isSelected && (
                  <Badge className="bg-emerald-600 text-white shrink-0 ml-2">
                    <Icon icon="mdi:check" className="mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <OPCRPaginationFooter
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={opcrs?.totalPageNumber ?? 1}
        totalRows={opcrs?.totalRows ?? 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Consolidation Dialog */}
      <ConsolidateOPCRDialog
        selectedOpcrs={selectedOpcrs}
        isOpen={isConsolidationDialogOpen}
        onOpenChange={setIsConsolidationDialogOpen}
        onConsolidationComplete={handleConsolidationComplete}
      />
    </div>
  )
}
