/**
 * Fund Source Tab
 * Agency Master Budget Setup - The Source of Truth
 * 
 * Features:
 * - Agency total approved budget configuration
 * - Fiscal Year and Fund Source selection
 * - Grand total limits for each Allotment Class (PS, MOOE, CO)
 * - Master setup from official source documents (NEP/GAA, PRE, MOAs)
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, MoreVertical, Search, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DebouncedInput from '@/components/DebouncedInput'
import {
  useAgencyMasterBudgets,
  useCreateAgencyMasterBudget,
  useUpdateAgencyMasterBudget,
  useDeleteAgencyMasterBudget,
} from '@/features/planning/agency-master-budget/hooks/useAgencyMasterBudgets'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getFundSourcesRequest } from '@/components/features/planning/fund-receiving/handlers/getFundSourcesRequest'
import {
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import type { AgencyMasterBudget } from '@/lib/fiscal-year-and-policies/types'
import { useToast } from '@/components/ui/use-toast'
import type { CreateAgencyMasterBudgetPayload } from '@/features/planning/agency-master-budget/handlers/createAgencyMasterBudgetRequest'
import type { UpdateAgencyMasterBudgetPayload } from '@/features/planning/agency-master-budget/handlers/updateAgencyMasterBudgetRequest'
import { CreateMasterBudgetDialog, EditingMasterBudget } from '../dialogs/CreateMasterBudgetDialog'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)

// Maps sourceDocumentType integer to display label
const SOURCE_DOCUMENT_LABELS: Record<number, string> = {
  0: 'NEP/GAA',
  1: 'PRE',
  2: 'MOA',
  3: 'Other',
}

const getSourceDocumentClasses = (sourceType: number) => {
  switch (sourceType) {
    case 0:
      return 'bg-green-100 text-green-800 border-green-300'
    case 1:
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 2:
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'text-slate-700 border-slate-300'
  }
}

type SortOrder = 'asc' | 'desc' | null

export function FundClusterTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<EditingMasterBudget | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [fiscalYearFilter, setFiscalYearFilter] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceDocumentFilter, setSourceDocumentFilter] = useState<string | null>(null)
  const [fiscalYearSort, setFiscalYearSort] = useState<SortOrder>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10

  // Fetch agency master budgets from API
  const { data: masterBudgetsResponse, isLoading } = useAgencyMasterBudgets({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Fetch fiscal years for the dialog
  const { data: fiscalYearsResponse } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Fetch fund sources for the dialog
  const { data: fundSourcesResponse } = useFundSources({
    pathParams: {},
    queryParams: { pageSize: 2000 },
  })

  const masterBudgets: AgencyMasterBudget[] = masterBudgetsResponse?.data ?? []

  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYearsResponse?.data ?? [])
        .map((fy) => ({
          id: fy.id,
          year: fy.year,
          name: `Fiscal Year ${fy.year}`,
        }))
        .sort((a, b) => a.year - b.year),
    [fiscalYearsResponse]
  )

  // Map API fund sources to dialog format with runtime narrowing for safety
  const fundClusterOptions = useMemo(() => {
    type FundSourceItem = {
      id: string | number
      name?: string | null
      code?: string | null
    }

    const isFundSourceItem = (v: unknown): v is FundSourceItem =>
      typeof v === 'object' && v !== null && 'id' in v

    return (fundSourcesResponse?.data ?? [])
      .filter(isFundSourceItem)
      .map((fs: { id: any; name: any; code: any }) => ({
        id: String(fs.id),
        name: fs.name ?? '',
        code: fs.code ?? undefined,
      }))
  }, [fundSourcesResponse])

  // Unique fiscal years from fetched data for filter dropdown
  const uniqueFiscalYears = useMemo(
    () => Array.from(new Set(masterBudgets.map((b) => String(b.fiscalYear.year)))).sort((a, b) => Number(b) - Number(a)),
    [masterBudgets]
  )

  // Mutations
  const { mutate: createBudget, isPending: isCreating } = useCreateAgencyMasterBudget()
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateAgencyMasterBudget()
  const { mutate: deleteBudget } = useDeleteAgencyMasterBudget()

  const invalidateBudgets = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === 'string' &&
        (query.queryKey[0] as string).startsWith('/agency-master-budgets'),
    })
  }

  const handleCreate = (payload: CreateAgencyMasterBudgetPayload) => {
    createBudget(
      {
        payload,
        pathParams: {}
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Fund Source created successfully', color: 'success' })
          setIsCreateDialogOpen(false)
          invalidateBudgets()
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to create Fund Source. Please try again.', color: 'destructive' })
        },
      }
    )
  }

  const handleUpdate = (id: string, payload: UpdateAgencyMasterBudgetPayload) => {
    updateBudget(
      { pathParams: { id }, payload },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Fund Source updated successfully', color: 'success' })
          setIsCreateDialogOpen(false)
          setEditingBudget(null)
          invalidateBudgets()
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to update Fund Source. Please try again.', color: 'destructive' })
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    setIsDeleting(true)
    deleteBudget(
      { pathParams: { id } },
      {
        onSuccess: () => {
          setSelectedRows((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          toast({ title: 'Success', description: 'Fund Source deleted successfully', color: 'success' })
          invalidateBudgets()
          setDeleteConfirm(null)
          setIsDeleting(false)
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to delete Fund Source. Please try again.', color: 'destructive' })
          setIsDeleting(false)
        },
      }
    )
  }

  const handleEditMasterBudget = (budget: AgencyMasterBudget) => {
    setEditingBudget({
      id: budget.id,
      fiscalYearId: budget.fiscalYearId,
      fundSourceId: budget.fundSourceId,
      sourceDocumentType: budget.sourceDocumentType,
      psAmount: budget.psAmount,
      mooeAmount: budget.mooeAmount,
      coAmount: budget.coAmount,
    })
    setIsCreateDialogOpen(true)
  }

  // Filter and sort
  const filteredBudgets = useMemo(() => {
    let filtered = masterBudgets

    if (fiscalYearFilter) {
      filtered = filtered.filter((b) => String(b.fiscalYear.year) === fiscalYearFilter)
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((b) =>
        (b.fundSource.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.fundSource.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (sourceDocumentFilter !== null) {
      filtered = filtered.filter((b) => String(b.sourceDocumentType) === sourceDocumentFilter)
    }

    if (fiscalYearSort) {
      filtered = [...filtered].sort((a, b) =>
        fiscalYearSort === 'asc' ? a.fiscalYear.year - b.fiscalYear.year : b.fiscalYear.year - a.fiscalYear.year
      )
    }

    return filtered
  }, [masterBudgets, fiscalYearFilter, searchTerm, sourceDocumentFilter, fiscalYearSort])

  const handleToggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedRows(newSelected)
  }

  const handleToggleAllRows = () => {
    const currentPageIds = filteredBudgets
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((b) => b.id)
    const newSelected = new Set(selectedRows)
    const allSelected = currentPageIds.every((id) => newSelected.has(id))
    if (allSelected) currentPageIds.forEach((id) => newSelected.delete(id))
    else currentPageIds.forEach((id) => newSelected.add(id))
    setSelectedRows(newSelected)
  }

  const handleToggleFiscalYearSort = () => {
    if (fiscalYearSort === null) setFiscalYearSort('asc')
    else if (fiscalYearSort === 'asc') setFiscalYearSort('desc')
    else setFiscalYearSort(null)
  }

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Agency Master Budget Setup</CardTitle>
              <CardDescription className="mt-2 text-sm text-blue-900">
                The Source of Truth for Agency Budget Allocation. Configure the total approved budget from official source documents (NEP/GAA for regular funds, PRE for internally generated income, or MOAs for external grants).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fund Source Records</CardTitle>
            <CardDescription>Manage agency budget allocations by Fiscal Year and Fund Source</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters and Search Toolbar */}
          <div className="flex items-center w-full gap-4 flex-wrap">
            {/* Search Bar - Fund Source */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search by Fund Source"
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10"
              />
            </div>

            {/* Filter by Fiscal Year */}
            <Select
              value={fiscalYearFilter ?? 'all'}
              onValueChange={(value) => {
                setFiscalYearFilter(value === 'all' ? null : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueFiscalYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Source Document */}
            <Select
              value={sourceDocumentFilter ?? 'all'}
              onValueChange={(value) => {
                setSourceDocumentFilter(value === 'all' ? null : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Source Document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(SOURCE_DOCUMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Create Fund Source Button - Right aligned */}
            <Button
              onClick={() => {
                setEditingBudget(null)
                setIsCreateDialogOpen(true)
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700 ml-auto"
            >
              <Plus className="h-4 w-4" />
              Create Fund Source
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-base">Loading fund source records...</p>
            </div>
          ) : filteredBudgets.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={(() => {
                            const currentPageIds = filteredBudgets
                              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                              .map((b) => b.id)
                            return currentPageIds.length > 0 && currentPageIds.every((id) => selectedRows.has(id))
                          })()}
                          onCheckedChange={handleToggleAllRows}
                          aria-label="Select all on this page"
                        />
                      </TableHead>
                      <TableHead className="text-slate-700">
                        <div className="flex items-center gap-1">
                          Fiscal Year
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleFiscalYearSort}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            aria-label="Sort by fiscal year"
                          >
                            {fiscalYearSort === 'asc' && <ArrowUp className="h-4 w-4" />}
                            {fiscalYearSort === 'desc' && <ArrowDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="text-slate-700">Fund Source</TableHead>
                      <TableHead className="text-slate-700">Personnel Services</TableHead>
                      <TableHead className="text-slate-700">MOOE</TableHead>
                      <TableHead className="text-slate-700">Capital Outlay</TableHead>
                      <TableHead className="text-slate-700">Grand Total</TableHead>
                      <TableHead className="text-slate-700">Source Document</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((budget) => {
                        const grandTotal = budget.psAmount + budget.mooeAmount + budget.coAmount
                        const fundSourceLabel = budget.fundSource.code
                          ? `${budget.fundSource.code} - ${budget.fundSource.name}`
                          : (budget.fundSource.name ?? '—')

                        return (
                          <TableRow
                            key={budget.id}
                            className={`border-b border-slate-200 hover:bg-slate-50 ${selectedRows.has(budget.id) ? 'bg-blue-50' : ''}`}
                          >
                            <TableCell className="w-12">
                              <Checkbox
                                checked={selectedRows.has(budget.id)}
                                onCheckedChange={() => handleToggleRow(budget.id)}
                                aria-label={`Select ${fundSourceLabel}`}
                              />
                            </TableCell>
                            <TableCell className="text-slate-700">{budget.fiscalYear.year}</TableCell>
                            <TableCell className="text-slate-700">{fundSourceLabel}</TableCell>
                            <TableCell className="font-mono text-slate-700">
                              ₱{budget.psAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono text-slate-700">
                              ₱{budget.mooeAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono text-slate-700">
                              ₱{budget.coAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono font-bold text-slate-900">
                              ₱{grandTotal.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              <Badge
                                variant="outline"
                                className={`capitalize ${getSourceDocumentClasses(budget.sourceDocumentType)} whitespace-nowrap`}
                              >
                                {SOURCE_DOCUMENT_LABELS[budget.sourceDocumentType] ?? 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => handleEditMasterBudget(budget)}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteConfirm({ id: budget.id, label: fundSourceLabel })}
                                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                <div className="text-gray-600">
                  {selectedRows.size} of {filteredBudgets.length} row(s) selected.
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    Page {currentPage} of {Math.ceil(filteredBudgets.length / itemsPerPage) || 1}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(Math.ceil(filteredBudgets.length / itemsPerPage) || 1, currentPage + 1))}
                      disabled={currentPage === Math.ceil(filteredBudgets.length / itemsPerPage) || filteredBudgets.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-base mb-4">No fund source records created yet.</p>
              <Button
                onClick={() => {
                  setEditingBudget(null)
                  setIsCreateDialogOpen(true)
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create First Fund Source
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Fund Source Dialog */}
      <CreateMasterBudgetDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) setEditingBudget(null)
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        fundClusters={fundClusterOptions}
        fiscalYears={fiscalYearOptions}
        editingBudget={editingBudget}
        isEdit={!!editingBudget}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteConfirm(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-destructive/10 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-base">Delete Fund Source</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deleteConfirm?.label}</span>?
              <br />
              This action <span className="font-semibold text-destructive">cannot be undone</span> and may affect
              ceiling allocations linked to this fund source.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Deleting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

