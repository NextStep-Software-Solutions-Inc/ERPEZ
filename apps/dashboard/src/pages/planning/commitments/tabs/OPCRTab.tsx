import { useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateOPCRDialog from './CreateOPCRDialog'
import OPCRDetailPage from './OPCRDetailPage'
import OPCRListView from '@/features/planning/opcr/components/OPCRListView'
import OPCRToolbar from '@/features/planning/opcr/components/OPCRToolbar'
import { useOPCRs } from '@/features/planning/opcr/hooks/useOPCR'
import type { OPCR } from '@/features/planning/opcr/types/type.opcr'
import { useMemo } from 'react'

export default function OPCRTab() {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({ from: '/v2/commitments/' })

  // Extract params from URL
  const pageNumber = search.pageNumber || 1
  const pageSize = search.pageSize || 25
  const searchQuery = search.searchQuery || ''
  const fiscalYearId = search.fiscalYearId || ''
  const commitmentStatus = search.commitmentStatus || ''
  const reviewStatus = search.reviewStatus || ''

  // Build backend filters string
  const backendFilters = useMemo(() => {
    const arr: string[] = []
    if (fiscalYearId) arr.push(`fiscalYearId==${fiscalYearId}`)
    if (commitmentStatus) arr.push(`commitmentStatus==${commitmentStatus}`)
    if (reviewStatus) arr.push(`reviewStatus==${reviewStatus}`)
    if (searchQuery) arr.push(`name@=*${searchQuery}*`)
    return arr.length > 0 ? arr.join(',') : undefined
  }, [fiscalYearId, commitmentStatus, reviewStatus, searchQuery])

  // Derive viewing state from URL search parameters
  const viewingOPCRId = search.opcrId

  const {
    data: opcrsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
      filters: backendFilters,
    },
    enabled: !viewingOPCRId,
  })

  const rawOpcrs = opcrsResponse?.data ?? []
  const totalPageNumber = opcrsResponse?.totalPageNumber ?? 1

  // Server-side filtering via backend filters; no additional frontend filtering needed
  const opcrs = rawOpcrs

  const handleViewOPCR = (opcr: OPCR) => {
    const fyId =
      typeof opcr.fiscalYear === 'object' && opcr.fiscalYear
        ? opcr.fiscalYear.id
        : undefined
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: opcr.id,
        fiscalYearId: fyId || prev.fiscalYearId,
      }),
    })
  }

  const handleBack = () => {
    if (search.functionCategory) {
      navigate({
        search: (prev) => ({
          ...prev,
          functionCategory: undefined,
          kpiAssignmentId: undefined,
          opcrActivityId: undefined,
        }),
      })
      return
    }
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: undefined,
        functionCategory: undefined,
        kpiAssignmentId: undefined,
        opcrActivityId: undefined,
      }),
    })
  }

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

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        searchQuery: value || undefined,
        pageNumber: 1, // Reset page on filter change
      }),
    })
  }

  const handleFiscalYearChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        fiscalYearId: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleCommitmentStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        commitmentStatus: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleReviewStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        reviewStatus: value || undefined,
        pageNumber: 1,
      }),
    })
  }

  if (viewingOPCRId) {
    return <OPCRDetailPage opcrId={viewingOPCRId} onBack={handleBack} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-indigo-400" />
        <p className="text-sm text-muted-foreground">Loading OPCR records...</p>
      </div>
    )
  }

  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unable to load OPCR records from the server.'
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/25 text-center">
        <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-200/80 dark:border-rose-500/30 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-semibold text-foreground">
            Failed to load OPCR records
          </h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-1 gap-2 border-border text-foreground hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            OPCR Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Office Performance Commitment and Review records
          </p>
        </div>
        <CreateOPCRDialog />
      </div>

      <OPCRToolbar
        searchQuery={searchQuery}
        fiscalYearId={fiscalYearId}
        commitmentStatus={commitmentStatus}
        reviewStatus={reviewStatus}
        onSearchChange={handleSearchChange}
        onFiscalYearChange={handleFiscalYearChange}
        onCommitmentStatusChange={handleCommitmentStatusChange}
        onReviewStatusChange={handleReviewStatusChange}
      />

      {/* OPCR List View with Pagination */}
      <OPCRListView
        opcrs={opcrs}
        onView={handleViewOPCR}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={totalPageNumber}
        totalRows={opcrsResponse?.totalRows ?? 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
