import { useNavigate, useSearch } from '@tanstack/react-router'
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

  const { data: opcrsResponse, isLoading } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber,
      pageSize,
      filters: backendFilters,
    },
  })

  const rawOpcrs = opcrsResponse?.data ?? []
  const totalPageNumber = opcrsResponse?.totalPageNumber ?? 1

  // Server-side filtering via backend filters; no additional frontend filtering needed
  const opcrs = rawOpcrs

  // Derive viewing state from URL search parameters
  const viewingOPCRId = search.opcrId

  const handleViewOPCR = (opcr: OPCR) => {
    navigate({
      search: (prev) => ({
        ...prev,
        opcrId: opcr.id,
        fiscalYearId: opcr.fiscalYear.id,
      }),
    })
  }

  const handleBack = () => {
    window.history.back()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {viewingOPCRId ? (
        <OPCRDetailPage opcrId={viewingOPCRId} onBack={handleBack} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">OPCR Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage Office Performance Commitment and Review records
              </p>
            </div>
            <CreateOPCRDialog
              existingFiscalYears={opcrs.map((o) => o.fiscalYear.year)}
            />
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
      )}
    </>
  )
}
