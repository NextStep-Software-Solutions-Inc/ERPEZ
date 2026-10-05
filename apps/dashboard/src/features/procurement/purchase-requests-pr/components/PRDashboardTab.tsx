/**
 * PR Dashboard Tab
 * Displays summary widgets and PR list for Non-CSE items
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Plus, Eye, Trash2, Wallet, FileText, Layers, TrendingUp, List } from 'lucide-react'
import { MoreVertical, Edit2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { useToast } from '@/components/ui/use-toast'
import { PurchaseRequest, PRStatus } from '../types'
import { useState, useEffect, useMemo } from 'react'
import { EditPRModal } from './EditPRModal'
import { usePurchaseRequests, usePurchaseRequestStats, useDeletePurchaseRequest } from '../handlers/hooks'
import { fromApiStatus, fromApiPrType, toApiPrType } from '../types/apiTypes'
import { useDashboardRole } from '@/hooks/useDashboardRole'

const STATUS_BADGE_CONFIG: Record<PRStatus, { label: string; color?: any; variant?: any }> = {
  draft: { label: 'Draft', color: 'secondary' },
  // Pending (Submitted) should be blue and outlined to match reference
  submitted: { label: 'Submitted', color: 'info', variant: 'outline' },
  // Approved and Returned: green outlined badges (same style as pending)
  approved: { label: 'Approved', color: 'success', variant: 'outline' },
  returned: { label: 'Returned', color: 'destructive', variant: 'outline' },
  'for-bac-utilization': { label: 'For BAC Utilization', color: 'default' },
}

interface PRDashboardTabProps {
  prType: 'non-cse' | 'out-of-stock'
  onCreateClick: () => void
  onViewDetails: (pr: PurchaseRequest) => void
}

export function PRDashboardTab({
  prType,
  onCreateClick,
  onViewDetails,
}: PRDashboardTabProps) {
  const { toast } = useToast()
  const { setIsManagePRView } = usePurchaseRequestStore()
  const deletePRMutation = useDeletePurchaseRequest()

  useEffect(() => {
    setIsManagePRView(false)
  }, [setIsManagePRView])

  const apiPrType = toApiPrType(prType)

  const { data: prListResponse } = usePurchaseRequests({
    pathParams: {},
    queryParams: {
      Filters: `prType==${apiPrType}`,
      PageSize: 100,
    },
  })

  const isGuid = (val?: string | null): boolean =>
    !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

  const { departmentId, canAccessGlobalData } = useDashboardRole()
  const validOfficeId = !canAccessGlobalData && isGuid(departmentId) ? departmentId : undefined

  const { data: statsResponse } = usePurchaseRequestStats({
    pathParams: {},
    queryParams: {
      prType: apiPrType,
      ...(validOfficeId ? { officeId: validOfficeId } : {}),
    },
  })

  // Map API list items to the minimal PurchaseRequest shape the table expects
  const displayPRs: PurchaseRequest[] = useMemo(() => {
    if (!prListResponse?.data) return []
    return prListResponse.data.map((item) => ({
      id: item.id,
      type: fromApiPrType(item.prType) as PurchaseRequest['type'],
      status: fromApiStatus(item.status),
      headerDetails: {
        prNumber: item.prNumber,
        description: item.description,
        date: item.requestedDate,
        purpose: '',
        officeId: item.officeId,
        officeName: item.officeName,  
      },
      items: [],
      totalAmount: item.totalAmount,
      createdAt: item.createdDate,
      updatedAt: item.createdDate,
      createdBy: '',
      remarks: (item.status === 'Approved' || item.status === 'Submitted' || item.status === 'ForBACUtilization') ? undefined : item.returnRemarks,
      returnRemarks: (item.status === 'Approved' || item.status === 'Submitted' || item.status === 'ForBACUtilization') ? undefined : item.returnRemarks,
      returnedDate: (item.status === 'Approved' || item.status === 'Submitted' || item.status === 'ForBACUtilization') ? undefined : item.returnedDate,
      returnedBy: (item.status === 'Approved' || item.status === 'Submitted' || item.status === 'ForBACUtilization') ? undefined : item.returnedBy,
    } as PurchaseRequest))
  }, [prListResponse])

  const apiStats = statsResponse?.data

  // Row selection state (select individual rows + select-all checkbox)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editingPR, setEditingPR] = useState<PurchaseRequest | null>(null)

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 5 // match item master look and feel

  const totalPages = Math.max(1, Math.ceil(displayPRs.length / pageSize))

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [displayPRs.length, totalPages, page])

  // PRs for current page
  const pagedPRs = displayPRs.slice((page - 1) * pageSize, page * pageSize)

  // Update selection when visible PRs change (keep only ids that still exist on any page)
  useEffect(() => {
    const visibleIdsSet = new Set(displayPRs.map((p) => p.id))

    setSelectedIds((prev) => {
      // filter out ids that are no longer visible
      const next = prev.filter((id) => visibleIdsSet.has(id))

      // Avoid updating state if nothing changed (prevents re-render loops)
      if (next.length === prev.length && next.every((id) => prev.includes(id))) {
        return prev
      }

      return next
    })
  }, [displayPRs])

  const allVisibleSelected = pagedPRs.length > 0 && pagedPRs.every((p) => selectedIds.includes(p.id))
  const someVisibleSelected = selectedIds.length > 0 && !allVisibleSelected

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...pagedPRs.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !pagedPRs.map((p) => p.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  const handleDelete = (id: string) => {
    // Open confirmation dialog and store pending id
    setPendingDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    try {
      setDeleteLoading(true)
      await deletePRMutation.mutateAsync({
        pathParams: { id: pendingDeleteId },
        queryParams: {id: pendingDeleteId}
      })
      setPendingDeleteId(null)
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Unable to delete the PR.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Wire up approve/return handlers so they are not declared but unused;
  // these are simple placeholders — replace with store actions as needed.
  const handleApprovePR = (id: string) => {
    if (!window.confirm('Approve this PR?')) return
    // TODO: call store action to update PR status to 'approved'
    // e.g. approvePurchaseRequest?.(id)
    console.log('Approved PR', id)
  }

  const handleReturnPR = (id: string) => {
    if (!window.confirm('Return this PR?')) return
    // TODO: call store action to update PR status to 'returned'
    // e.g. returnPurchaseRequest?.(id)
    console.log('Returned PR', id)
  }

  // Helper: displayStatus respects approved, submitted, for-bac-utilization ground truth
  const getDisplayStatus = (p: PurchaseRequest) => {
    if (!p) return 'draft'
    if (p.status === 'approved' || p.status === 'submitted' || p.status === 'for-bac-utilization') {
      return p.status
    }
    if (p.status === 'returned') {
      return 'returned'
    }
    try {
      if (
        ((p as any).remarks && (p as any).remarks.toString().trim().length > 0) ||
        ((p as any).returnRemarks && (p as any).returnRemarks.toString().trim().length > 0)
      ) {
        return 'returned' as PRStatus
      }
    } catch {
      // ignore
    }
    return p.status
  }

  return (
    <div className="space-y-6">
      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total PPMP Amount */}
        <Card className="bg-indigo-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Total PPMP Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-indigo-600 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-indigo-700">
                  ₱{(apiStats?.totalPPMPAmount || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Approved budget allocation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Submitted PRs */}
        <Card className="bg-sky-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Total Submitted PRs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-sky-700">
                  ₱{(apiStats?.totalSubmittedPRAmount || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Amount in submitted requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="bg-emerald-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-emerald-600">
                  ₱{(apiStats?.availableBalance || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Remaining budget available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PR Count Summary */}
        <Card className="bg-gray-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              PR Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
                <span className="text-muted-foreground">Drafts:</span>
              </div>
              <span className="font-medium">{apiStats?.draftCount || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 inline-block"></span>
                <span className="text-muted-foreground">Submitted:</span>
              </div>
              <span className="font-medium">{apiStats?.submittedCount || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-muted-foreground">Approved:</span>
              </div>
              <span className="font-medium">{apiStats?.approvedCount || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PR List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>
                {prType === 'non-cse'
                  ? 'Non-CSE items from approved PPMP'
                  : 'Out-of-stock CSE items from approved APR'}
              </CardDescription>
            </div>
            <Button onClick={onCreateClick} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create PR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayPRs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No purchase requests yet</p>
              <Button onClick={onCreateClick} variant="outline" size="sm">
                Create Your First PR
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allVisibleSelected || (someVisibleSelected && 'indeterminate')}
                        onCheckedChange={(v) => toggleSelectAll(!!v)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>PR Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPRs.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedIds.includes(pr.id)}
                          onCheckedChange={(v) => toggleRowSelect(pr.id, !!v)}
                          aria-label={`Select row ${pr.headerDetails.prNumber}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {pr.headerDetails.prNumber}
                        </div>
                        {prType === 'out-of-stock' && (
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                            >
                              {(() => {
                                const aprMatch = pr.headerDetails?.description?.match(/Sourced from APR:\s*([^\[\n\r]+)/i)
                                return aprMatch ? `APR: ${aprMatch[1].trim()}` : 'Sourced from APR'
                              })()}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm truncate cursor-help max-w-[20rem] inline-block">
                                {pr.headerDetails.description || '—'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              {pr.headerDetails.description || '—'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="font-medium">₱{pr.totalAmount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              color={STATUS_BADGE_CONFIG[getDisplayStatus(pr)].color}
                              variant={STATUS_BADGE_CONFIG[getDisplayStatus(pr)].variant}
                            >
                              {STATUS_BADGE_CONFIG[getDisplayStatus(pr)].label}
                            </Badge>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails(pr)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {/* Approve/Return actions can be triggered by Approving Authority; wired here to avoid unused locals. */}
                            {pr.status === 'submitted' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprovePR(pr.id)}>
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReturnPR(pr.id)}>
                                  Return
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Allow delete only for draft PRs (no edit/delete for submitted or approved) */}
                            {pr.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(pr.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* Action column - quick view button (right aligned) */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails(pr)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {/* Edit/Delete allowed only for drafts */}
                            {pr.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPR(pr)
                                    setEditOpen(true)
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleDelete(pr.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination and selection summary (outside table, below) */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} of {displayPRs.length} row(s) selected.
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Previous
              </Button>

              <Button
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Delete confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Purchase Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this purchase request? This action cannot be undone.
                {pendingDeleteId && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    PR#: {displayPRs.find(p => p.id === pendingDeleteId)?.headerDetails.prNumber || '—'}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction color="destructive" onClick={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit PR Modal */}
        <EditPRModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) setEditingPR(null)
          }}
          pr={editingPR}
          onSuccess={() => {
            // close handled by onOpenChange; optionally focus or navigate to details
          }}
        />
      </Card>
    </div>
  )
}
