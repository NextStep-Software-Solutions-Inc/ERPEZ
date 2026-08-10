/**
 * Market Scoping Dashboard Page
 * Location: src/pages/planning/market-scoping/
 * Design: APP Consolidation pattern with TemplateTable
 * 
 * Displays all market scoping forms for the current user
 * - Data table with list of forms
 * - Filter by status with atom-based state
 * - Actions: View, Edit (draft), Delete (draft), Download PDF (approved)
 * - Create new form button via dialog
 */

import { useEffect, useMemo, useState } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Layers, Wallet, Clock, List } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateTable } from '@/components/TemplateTable'
import {
  CreateMarketScopingDialog,
  DeleteMarketScopingDialog,
  selectedMarketScopingForDeleteAtom,
  deleteMarketScopingDialogOpenAtom,
  draftMarketScopingAtom,
  createMarketScopingDialogOpenAtom,
  currentFormStepAtom,
  useMarketScopings,
  marketScopingListFilterAtom,
  marketScopingViewTypeAtom,
  MarketScopingCardView,
  MarketScopingGuideDialog,
} from '@/features/planning/market-scoping'
import {
  createMarketScopingTableColumns,
  MarketScopingTableToolbar,
} from '@/features/planning/market-scoping/tables'
import type { MarketScopingForm } from '@/features/planning/market-scoping'
import type { MetaActions } from '@/types/global'
import { Button } from '@/components/ui/button'

export default function MarketScopingDashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setSelectedForDelete = useSetAtom(selectedMarketScopingForDeleteAtom)
  const setDeleteOpen = useSetAtom(deleteMarketScopingDialogOpenAtom)
  const setDraft = useSetAtom(draftMarketScopingAtom)
  const setCreateDialogOpen = useSetAtom(createMarketScopingDialogOpenAtom)
  const setCurrentStep = useSetAtom(currentFormStepAtom)
  const [filter] = useAtom(marketScopingListFilterAtom)
  const [draft] = useAtom(draftMarketScopingAtom)
  const selectedForDeleteId = useAtomValue(selectedMarketScopingForDeleteAtom)
  const viewType = useAtomValue(marketScopingViewTypeAtom)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Reset pagination to page 1 whenever search query or status filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [filter.searchTerm, filter.statusFilter])

  // Fetch market scoping forms from API
  const { data: apiResponse, isLoading, error } = useMarketScopings({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  // Transform API response to component data
  const forms = useMemo(() => {
    if (!apiResponse?.data) return []
    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data as unknown as MarketScopingForm[]
    }
    if (apiResponse.data && 'data' in apiResponse.data && Array.isArray(apiResponse.data.data)) {
      return apiResponse.data.data as MarketScopingForm[]
    }
    return []
  }, [apiResponse])

  // Apply search & status filters instantly across all records
  const filteredForms = useMemo(() => {
    let rows = forms
    if (filter.statusFilter !== 'all') {
      rows = rows.filter((f) => f.status === filter.statusFilter)
    }
    if (filter.searchTerm.trim()) {
      const q = filter.searchTerm.toLowerCase()
      rows = rows.filter(
        (f) =>
          f.projectName?.toLowerCase().includes(q) ||
          f.departmentUnit?.toLowerCase().includes(q) ||
          f.representativeName?.toLowerCase().includes(q) ||
          f.estimatedBudget?.toString().includes(q)
      )
    }
    return rows
  }, [forms, filter])

  // Compute pagination bounds based on filtered items
  const totalCount = filteredForms.length
  const pageCount = Math.ceil(totalCount / pagination.pageSize) || 1

  // Slice forms for current page view
  const paginatedForms = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return filteredForms.slice(start, start + pagination.pageSize)
  }, [filteredForms, pagination.pageIndex, pagination.pageSize])

  const actions: MetaActions = ['write', 'delete']

  const isEditing = draft !== null && draft.id && !draft.id.toString().startsWith('temp-')
  const selectedProjectForDelete = useMemo(() => {
    return forms.find((f) => f.id === selectedForDeleteId)
  }, [forms, selectedForDeleteId])

  const handleViewDetails = (id: string) => {
    navigate({ to: `/v2/market-scoping/${id}` })
  }

  const handleEdit = (id: string) => {
    const formToEdit = forms.find((f) => f.id === id)
    if (formToEdit) {
      setDraft(formToEdit)
      setCurrentStep(1)
      setCreateDialogOpen(true)
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedForDelete(id)
    setDeleteOpen(true)
  }

  // Calculate metrics for status cards
  const metrics = useMemo(() => {
    const totalBudget = forms.reduce((sum, f) => sum + (f.estimatedBudget || 0), 0)
    const approvedBudget = forms
      .filter((f) => f.status === 'Approved')
      .reduce((sum, f) => sum + (f.estimatedBudget || 0), 0)
    const pendingBudget = forms
      .filter((f) => f.status === 'PendingApproval')
      .reduce((sum, f) => sum + (f.estimatedBudget || 0), 0)

    const counts = {
      draft: forms.filter((f) => f.status === 'Draft').length,
      pending: forms.filter((f) => f.status === 'PendingApproval').length,
      approved: forms.filter((f) => f.status === 'Approved').length,
      rejected: forms.filter((f) => f.status === 'Rejected').length,
    }

    return {
      totalBudget,
      approvedBudget,
      pendingBudget,
      counts,
    }
  }, [forms])

  // Create columns using the factory function
  const columns = useMemo(
    () =>
      createMarketScopingTableColumns({
        onViewDetails: handleViewDetails,
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
      }),
    [navigate],
  )

  // Show initial loading state only when no data has loaded yet
  if (isLoading && !apiResponse) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading Market Scoping forms...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">Failed to load Market Scoping forms. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match APP Consolidation styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Market Scoping</CardTitle>
              <CardDescription className="text-base">
                Manage and track all market scoping forms for procurement planning
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Market Scoping
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Estimated Budget */}
        <Card className="bg-indigo-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Total Estimated Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-indigo-600 shadow-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700">
                  ₱{metrics.totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Total budget across all projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Budget */}
        <Card className="bg-emerald-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Approved Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  ₱{metrics.approvedBudget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Budget from approved forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approval Budget */}
        <Card className="bg-sky-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending Approval Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-sky-700">
                  ₱{metrics.pendingBudget.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Budget awaiting review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Scoping Summary */}
        <Card className="bg-gray-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              Scoping Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
                <span className="text-muted-foreground">Drafts:</span>
              </div>
              <span className="font-medium">{metrics.counts.draft}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 inline-block"></span>
                <span className="text-muted-foreground">Pending:</span>
              </div>
              <span className="font-medium">{metrics.counts.pending}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-muted-foreground">Approved:</span>
              </div>
              <span className="font-medium">{metrics.counts.approved}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                <span className="text-muted-foreground">Rejected:</span>
              </div>
              <span className="font-medium">{metrics.counts.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table / Card Grid Layout View Switcher */}
      {viewType === 'list' ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <TemplateTable
            columns={columns}
            data={paginatedForms}
            actions={actions}
            readonly={false}
            toolbar={(table) => <MarketScopingTableToolbar table={table} />}
            manualPagination={true}
            pageCount={pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={setPagination}
            totalCount={totalCount}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <MarketScopingTableToolbar />
          </div>
          
          {filteredForms.length === 0 ? (
            <div className="bg-white dark:bg-slate-950/20 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center shadow-xs">
              <p className="text-slate-500 text-sm font-semibold">No market scoping forms found matching the filters.</p>
            </div>
          ) : (
            <MarketScopingCardView
              data={paginatedForms}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}

          {/* Grid View Pagination Footer */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-250 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-slate-500">
              Total {totalCount} {totalCount === 1 ? 'record' : 'records'}
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Page {pagination.pageIndex + 1} of {pageCount || 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pagination.pageIndex === 0}
                className="h-8 text-xs font-bold px-3 border-slate-200"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={pagination.pageIndex >= (pageCount - 1)}
                className="h-8 text-xs font-bold px-3 border-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateMarketScopingDialog
        title={isEditing ? 'Edit Market Scoping Form' : 'Create Market Scoping Form'}
        description={isEditing ? 'Update the details in the 4-step wizard to edit the draft form.' : 'Complete the 4-step wizard to create a new market scoping form.'}
      />
      <DeleteMarketScopingDialog
        projectName={selectedProjectForDelete?.projectName}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/market-scopings'] })
        }}
      />
      <MarketScopingGuideDialog />
    </div>
  )
}
