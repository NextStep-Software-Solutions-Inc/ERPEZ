import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { Eye, MoreHorizontal, Trash2, Download, Loader2 } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getConsolidatedOPCRsRequest } from '../handlers/getOPCRConsolidationsRequest'
import {
  useGenerateConsolidatedOPCRDocument,
  useDownloadOPCRDocument,
} from '../hooks/useOPCR'
import { toast } from 'sonner'
import OPCRDetailPage from '@/pages/planning/commitments/tabs/OPCRDetailPage'
import { ConsolidationBreadcrumb } from './ConsolidationBreadcrumb'
import ConsolidationDetailsUI from './ConsolidationDetailsUI'
import { format } from 'date-fns'
import OPCRPaginationFooter from '../components/OPCRPaginationFooter'

/**
 * Consolidated OPCRs List UI
 * Three-level drill-down rendering:
 * - Level 0 (default): List of consolidation records
 * - Level 1 (opcrConsolidationId set): OPCRs within consolidation
 * - Level 2 (opcrId set): Individual OPCR detail view
 *
 * URL Navigation:
 * - ?tab=consolidate&consolidateSubTab=consolidated
 * - ?...&opcrConsolidationId=cons123 (Level 1)
 * - ?...&opcrConsolidationId=cons123&opcrId=abc123 (Level 2)
 */
const useConsolidatedOPCRs = createQueryHookFromTemplate(
  getConsolidatedOPCRsRequest,
)

export default function ConsolidatedOPCRsListUI() {
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const navigate = useNavigate({ from: '/v2/commitments' })
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const { mutateAsync: generateConsolidatedDoc } =
    useGenerateConsolidatedOPCRDocument()
  const { mutateAsync: downloadDoc } = useDownloadOPCRDocument()

  const handleGenerateConsolidatedPdf = async (
    consolidationId: string,
    consolidationName?: string,
    fiscalYear?: number,
  ) => {
    setGeneratingId(consolidationId)
    try {
      const apiRes = await generateConsolidatedDoc({
        pathParams: { consolidationId },
        queryParams: { format: 'Pdf' },
      })
      const documentId = typeof apiRes === 'string' ? apiRes : apiRes?.data

      if (!documentId) {
        throw new Error('No document ID returned from backend generator.')
      }

      const downloadRes = await downloadDoc({
        pathParams: { documentId },
      })

      const blob = downloadRes?.blob
      if (!blob) {
        throw new Error('Failed to retrieve document binary from backend.')
      }

      const sanitizedName = (
        consolidationName || `Consolidated_OPCR_FY_${fiscalYear || ''}`
      )
        .trim()
        .replace(/\s+/g, '_')
      const filename = `${sanitizedName}.pdf`
      const url = URL.createObjectURL(blob)

      try {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
      } finally {
        URL.revokeObjectURL(url)
      }

      toast.success('Consolidated OPCR PDF generated and downloaded successfully.')
    } catch (error) {
      console.error('Error generating consolidated OPCR PDF:', error)
      toast.error('Failed to generate or download Consolidated OPCR PDF.')
    } finally {
      setGeneratingId(null)
    }
  }

  // Read URL params for multi-level navigation
  const opcrConsolidationId =
    (searchParams.opcrConsolidationId as string | undefined) ?? undefined
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

  const { data: consolidations } = useConsolidatedOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
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

  // Navigation handlers
  const handleViewConsolidationDetails = (consolidationId: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        opcrConsolidationId: consolidationId,
        opcrId: undefined,
        functionTypeId: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  const handleBackToConsolidations = () => {
    navigate({
      search: (prev) => {
        const {
          opcrConsolidationId,
          opcrId,
          functionTypeId,
          selectedActivity,
          selectedKpi,
          ...rest
        } = prev
        return rest
      },
    })
  }

  const handleConsolidationDetailClick = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: undefined,
        functionTypeId: undefined,
        selectedActivity: undefined,
        selectedKpi: undefined,
      }),
    })
  }

  const handleBackFromOPCRDetail = () => {
    navigate({
      search: (prev) => {
        const {
          opcrId,
          functionTypeId,
          selectedActivity,
          selectedKpi,
          ...rest
        } = prev
        return rest
      },
    })
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

  const handleDelete = (consolidationId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this consolidation? This action cannot be undone.',
      )
    ) {
      return
    }
    // TODO: wire to DELETE /opcr-consolidations/:id endpoint when available
    console.warn(
      '[ConsolidatedOPCRsListUI] Delete consolidation not yet connected to API:',
      consolidationId,
    )
    import('sonner').then(({ toast }) => {
      toast.error(
        'Delete consolidation is not yet supported. Please contact an administrator.',
      )
    })
  }

  const handleOPCRClick = (opcrIdParam: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: opcrIdParam,
      }),
    })
  }

  // Level 2: OPCR Detail View (when opcrId set)
  if (opcrId && opcrConsolidationId) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <ConsolidationBreadcrumb
          consolidateSubTab="consolidated"
          opcrId={opcrId}
          opcrConsolidationId={opcrConsolidationId}
          functionTypeId={functionTypeId}
          functionCategory={functionCategory}
          kpiAssignmentId={kpiAssignmentId}
          kpiId={kpiId}
          onClickRoot={handleBackToConsolidations}
          onClickConsolidation={handleConsolidationDetailClick}
          onClickOpcr={handleOPCRDetailClick}
          onClickFunctionType={handleFunctionTypeClick}
          onClickFunctionCategory={handleFunctionCategoryClick}
          onClickKpiAssignment={handleKpiAssignmentClick}
        />

        {/* OPCR Detail Page */}
        <OPCRDetailPage opcrId={opcrId} onBack={handleBackFromOPCRDetail} />
      </div>
    )
  }

  // Level 1: Consolidation Details (when opcrConsolidationId set)
  if (opcrConsolidationId) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <ConsolidationBreadcrumb
          consolidateSubTab="consolidated"
          opcrConsolidationId={opcrConsolidationId}
          functionTypeId={functionTypeId}
          functionCategory={functionCategory}
          kpiAssignmentId={kpiAssignmentId}
          kpiId={kpiId}
          onClickRoot={handleBackToConsolidations}
          onClickConsolidation={handleConsolidationDetailClick}
          onClickFunctionType={handleFunctionTypeClick}
          onClickFunctionCategory={handleFunctionCategoryClick}
          onClickKpiAssignment={handleKpiAssignmentClick}
        />

        {/* Consolidation Details Component */}
        <ConsolidationDetailsUI
          opcrConsolidationId={opcrConsolidationId}
          onBack={handleBackToConsolidations}
          onOPCRClick={handleOPCRClick}
        />
      </div>
    )
  }

  // Empty state
  if ((consolidations?.data?.length || 0) === 0) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <ConsolidationBreadcrumb
          consolidateSubTab="consolidated"
          functionTypeId={functionTypeId}
          functionCategory={functionCategory}
          kpiAssignmentId={kpiAssignmentId}
          kpiId={kpiId}
          onClickRoot={handleBackToConsolidations}
          onClickFunctionType={handleFunctionTypeClick}
          onClickFunctionCategory={handleFunctionCategoryClick}
          onClickKpiAssignment={handleKpiAssignmentClick}
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Consolidated OPCRs
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            View and manage all OPCR consolidation records
          </p>
        </div>

        <Card className="p-16 border-dashed border-2">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Icon
                icon="mdi:folder-open"
                className="text-6xl text-slate-300"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                No Consolidated OPCRs Yet
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Start consolidating OPCRs to see consolidation records here.
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
        consolidateSubTab="consolidated"
        functionTypeId={functionTypeId}
        functionCategory={functionCategory}
        kpiAssignmentId={kpiAssignmentId}
        kpiId={kpiId}
        onClickRoot={handleBackToConsolidations}
        onClickFunctionType={handleFunctionTypeClick}
        onClickFunctionCategory={handleFunctionCategoryClick}
        onClickKpiAssignment={handleKpiAssignmentClick}
      />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Consolidated OPCRs
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          View and manage all OPCR consolidation records
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Total Consolidations</p>
            <p className="text-2xl font-bold text-slate-900">
              {consolidations?.data?.length || 0}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Total OPCRs Consolidated</p>
            <p className="text-2xl font-bold text-slate-900">
              {consolidations?.data?.reduce(
                (sum, c) => sum + (c.opcrCount || 0),
                0,
              ) || 0}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Latest Consolidation</p>
            <p className="text-lg font-semibold text-slate-900">
              {consolidations?.data?.[0]?.createdDate
                ? format(new Date(consolidations.data[0].createdDate), 'MMM d')
                : 'N/A'}
            </p>
          </div>
        </Card>
      </div>

      {/* Consolidations List */}
      <div className="space-y-4">
        {consolidations?.data?.map((consolidation) => (
          <Card
            key={consolidation.id}
            className={cn(
              'p-4 border-2 transition-all cursor-pointer hover:border-primary-400 hover:shadow-md',
              'border-slate-200 bg-white',
            )}
            onClick={() => handleViewConsolidationDetails(consolidation.id)}
            role="button"
            tabIndex={0}
            aria-label={`View details for consolidation ${consolidation.name || consolidation.id}`}
            onKeyDown={(e) => {
              if (e.currentTarget !== e.target) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleViewConsolidationDetails(consolidation.id)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Icon
                    icon="mdi:folder-star"
                    className="text-2xl text-amber-500"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {consolidation.name ||
                        `Consolidation ${consolidation.id}`}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      FY {consolidation.fiscalyear} •{' '}
                      {format(
                        new Date(consolidation.createdDate),
                        'MMM d, yyyy',
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="flex flex-wrap gap-2 justify-end ml-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Icon
                    icon="mdi:file-document-multiple"
                    className="mr-1 text-blue-600"
                  />
                  {consolidation.opcrCount || 0} OPCRs
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewConsolidationDetails(consolidation.id)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      disabled={generatingId === consolidation.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateConsolidatedPdf(
                          consolidation.id,
                          consolidation.name,
                          consolidation.fiscalyear ?? consolidation.fiscalYear,
                        )
                      }}
                    >
                      {generatingId === consolidation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Generate PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(consolidation.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <OPCRPaginationFooter
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={consolidations?.totalPageNumber ?? 1}
        totalRows={consolidations?.totalRows ?? 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
