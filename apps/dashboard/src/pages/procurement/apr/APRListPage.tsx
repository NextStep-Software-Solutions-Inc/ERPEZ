/**
 * APR List Page Component
 * Main page for viewing and managing APRs
 */

import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  createAPRDialogOpenAtom,
  aprListFilterAtom,
} from '@/features/procurement/apr/atoms'
import { getAPRsRequest } from '@/features/procurement/apr/handlers'
import { getAPRsTableColumns } from '@/features/procurement/apr/tables/APRsTableColumns'
import { APRsTableToolbar } from '@/features/procurement/apr/tables/APRsTableToolbar'
import { CreateAPRDialog, AddAgencyAPPDialog } from '@/features/procurement/apr/dialogs'
import { mockAPRList } from '@/features/procurement/apr/mocks'
import type { APRMaster } from '@/features/procurement/apr/types'
import { TemplateTable } from '@/components/TemplateTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ClipboardList } from 'lucide-react'

const useAPRs = createQueryHookFromTemplate(getAPRsRequest)

export function APRListPage() {
  const navigate = useNavigate()
  const [, setCreateDialogOpen] = useAtom(createAPRDialogOpenAtom)
  const [filter, setFilter] = useAtom(aprListFilterAtom)

  // Fetch APRs - fallback to mock data if API not available
  const { data, isLoading, error } = useAPRs({
    pathParams: {},
    queryParams: {},
  })

  // Parse nested response structure: APIResponse<APRListResponse>
  // --- Structure ---
  // Outer: APIResponse wrapper { data, succeeded, errors }
  // Inner: APRListResponse { data: APRMaster[], total, page, pageSize }
  // Access: data.data = APRListResponse, then data.data.data = APRMaster[]
  const responseData = data?.data
  // TODO: Replace with API data once backend is ready
  // const aprList = (responseData?.data as APRMaster[] | undefined) ?? mockAPRList
  const aprList = mockAPRList

  const searchTerm = filter.searchTerm
  const statusFilter = filter.status
  const fiscalYearFilter = filter.fiscalYear

  /**
   * Apply filters to APR list
   * Filters by: search term (aprNumber, description, agencyControlNumber)
   *            status (if not 'all')
   *            fiscal year
   */
  const filteredAprList = useMemo(() => {
    return aprList.filter((apr) => {
      // Search term filter (case-insensitive)
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase()
        const matchesSearch =
          apr.aprNumber.toLowerCase().includes(lowerSearch) ||
          apr.description.toLowerCase().includes(lowerSearch) ||
          apr.agencyControlNumber.toLowerCase().includes(lowerSearch)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && apr.status !== statusFilter) {
        return false
      }

      // Fiscal year filter
      if (apr.fiscalYear !== fiscalYearFilter) {
        return false
      }

      return true
    })
  }, [aprList, searchTerm, statusFilter, fiscalYearFilter])

  const handleCreateClick = () => {
    setCreateDialogOpen(true)
  }

  const handleViewAPR = (apr: APRMaster) => {
    navigate({
      to: '/v2/agency-purchase-requests-apr/$aprId',
      params: { aprId: apr.id },
    })
  }

  const handleDeleteAPR = (apr: APRMaster) => {
    console.log('Delete APR:', apr.id)
  }

  const columns = getAPRsTableColumns({
    onView: handleViewAPR,
    onDelete: handleDeleteAPR,
  })

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Agency Purchase Requests (APR)</CardTitle>
              <CardDescription className="text-base">
                Manage all APRs and track procurement requests to PS-DBM
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> APR
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
        {/* Toolbar */}
        {<APRsTableToolbar
          searchTerm={searchTerm}
          onSearchChange={(term: string) =>
            setFilter((prev) => ({ ...prev, searchTerm: term }))
          }
          status={statusFilter}
          onStatusChange={(status: string) =>
            setFilter((prev) => ({ ...prev, status }))
          }
          fiscalYear={fiscalYearFilter}
          onFiscalYearChange={(year: number) =>
            setFilter((prev) => ({ ...prev, fiscalYear: year }))
          }
          onCreateClick={handleCreateClick}
        /> as any}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Failed to load APRs</p>
                <p className="text-sm">An error occurred while fetching APRs</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                Loading APRs...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!isLoading && filteredAprList && filteredAprList.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <TemplateTable columns={columns as any} data={filteredAprList} actions={['read', 'write', 'delete', 'submit']} />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && (!filteredAprList || filteredAprList.length === 0) && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {searchTerm.trim() || statusFilter !== 'all'
                    ? 'No APRs match your filters'
                    : 'No APRs found'}
                </p>
                <button
                  onClick={handleCreateClick}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  {searchTerm.trim() || statusFilter !== 'all'
                    ? 'Clear filters or create new APR'
                    : 'Create your first APR'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateAPRDialog />
      <AddAgencyAPPDialog />
    </div>
  )
}

export default APRListPage
