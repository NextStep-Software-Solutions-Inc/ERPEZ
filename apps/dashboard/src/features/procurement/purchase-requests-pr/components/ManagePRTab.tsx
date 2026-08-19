/**
 * Manage PR Tab
 * Dashboard for approving authority to review and manage submitted PRs
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { MoreVertical, Eye, CheckCircle, CornerDownLeft, FileText, Wallet, AlertCircle, Funnel } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { ApprovePRModal } from './ApprovePRModal'
import { ReturnPRModal } from './ReturnPRModal'
import { useToast } from '@/components/ui/use-toast'
import { PurchaseRequest, PRStatus, PRType } from '../types'
import { usePurchaseRequests, useUpdatePurchaseRequestStatus } from '../handlers/hooks'
import { fromApiStatus, fromApiPrType } from '../types/apiTypes'

const STATUS_BADGE_CONFIG: Record<
  PRStatus,
  { label: string; color?: any; variant?: any }
> = {
  draft: { label: 'Draft', color: 'secondary' },
  // Pending should be blue and use the outlined pill style like the reference
  submitted: { label: 'Pending Review', color: 'info', variant: 'outline' },
  // Approved: green outlined; Returned: red outlined
  approved: { label: 'Approved', color: 'success', variant: 'outline' },
  returned: { label: 'Returned', color: 'destructive', variant: 'outline' },
  'for-bac-utilization': { label: 'For BAC Utilization', color: 'default' },
}

// Color mapping for PR types (Non-CSE vs Out-of-Stock)
const TYPE_BADGE_COLOR: Record<string, any> = {
  'non-cse': 'default',
  'out-of-stock': 'warning',
}

interface ManagePRTabProps {
  onViewDetails: (pr: PurchaseRequest) => void
}

export function ManagePRTab({ onViewDetails }: ManagePRTabProps) {
  const { setIsManagePRView } = usePurchaseRequestStore()
  const { toast } = useToast()

  // Use API hooks
  const { data: prResponse } = usePurchaseRequests({ pathParams: {}, queryParams: { PageSize: 100 } })
  const statusMutation = useUpdatePurchaseRequestStatus()

  const storePrs = usePurchaseRequestStore((state) => state.purchaseRequests)

  // Map API response to frontend PurchaseRequest models and merge with store PRs
  const purchaseRequests: PurchaseRequest[] = useMemo(() => {
    const apiMapped = (prResponse?.data || []).map((apiPr) => ({
      id: apiPr.id,
      type: fromApiPrType(apiPr.prType),
      status: fromApiStatus(apiPr.status),
      headerDetails: {
        prNumber: apiPr.prNumber,
        description: apiPr.description,
        date: apiPr.requestedDate,
        purpose: '',
        officeId: apiPr.officeId,
        officeName: apiPr.officeName,
      },
      items: [],
      totalAmount: apiPr.totalAmount,
      createdAt: apiPr.createdDate,
      updatedAt: apiPr.createdDate,
      createdBy: '',
    } as PurchaseRequest))

    const apiIds = new Set(apiMapped.map((p) => p.id))
    const uniqueStorePrs = storePrs.filter((p) => !apiIds.has(p.id))
    return [...uniqueStorePrs, ...apiMapped]
  }, [prResponse, storePrs])

  // Local UI state for modals and selected PR
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null)

  // Filter state for PR type (multi-select, restore original behavior)
  const [selectedTypes, setSelectedTypes] = useState<PRType[]>(['non-cse', 'out-of-stock'])

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 5 // match purchase request tab

  // Helper: displayStatus prefers 'returned' when remarks exist to ensure consistency
  const getDisplayStatus = (p: PurchaseRequest) => {
    try {
      if (p && p.remarks && p.remarks.toString().trim().length > 0) {
        return 'returned' as PRStatus
      }
    } catch (e) {
      // ignore
    }
    return p.status
  }

  // Mark that the UI is currently showing the Manage PR tab so store actions are enabled
  useEffect(() => {
    setIsManagePRView(true)
    return () => setIsManagePRView(false)
  }, [setIsManagePRView])

  // Filter only submitted and approved PRs for review by selected types
  const submittedPRs = purchaseRequests.filter((pr) => {
    const ds = getDisplayStatus(pr)
    return (ds === 'submitted' || ds === 'approved' || ds === 'returned') && selectedTypes.includes(pr.type)
  })

  const totalPages = Math.max(1, Math.ceil(submittedPRs.length / pageSize))

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [submittedPRs.length, totalPages, page])

  // PRs for current page
  const pagedPRs = submittedPRs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-white p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-white shadow">
                <FileText className="h-7 w-7 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">Manage Purchase Requests</h2>
                  <span className="inline-flex items-center text-xs font-medium bg-violet-100 text-violet-800 px-2 py-1 rounded">Manage PR</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Review and manage submitted Purchase Requests from all office staff and procurement team</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Funnel className="h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Filter by Type</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 ${selectedTypes.includes('non-cse') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => {
                        setSelectedTypes((prev) => prev.includes('non-cse') ? prev.filter(t => t !== 'non-cse') : [...prev, 'non-cse'])
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          readOnly
                          checked={selectedTypes.includes('non-cse')}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium">Non-CSE</div>
                          <div className="text-xs text-slate-500">Office-created PRs (PPMP)</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 ${selectedTypes.includes('out-of-stock') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => {
                        setSelectedTypes((prev) => prev.includes('out-of-stock') ? prev.filter(t => t !== 'out-of-stock') : [...prev, 'out-of-stock'])
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          readOnly
                          checked={selectedTypes.includes('out-of-stock')}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium">Out of Stock</div>
                          <div className="text-xs text-slate-500">APR driven PRs (CSE)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      {/* Polished summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/** Pending */}
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Pending Review
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-sky-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-sky-700">{submittedPRs.filter((pr) => getDisplayStatus(pr) === 'submitted').length}</div>
                    <div className="text-xs text-muted-foreground mt-1">PRs awaiting review</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/** Approved */}
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Approved
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-violet-50 flex items-center justify-center shadow-sm">
                    <CheckCircle className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-violet-700">{submittedPRs.filter((pr) => getDisplayStatus(pr) === 'approved').length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Approved PRs</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/** Returned */}
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Returned
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-rose-50 flex items-center justify-center shadow-sm">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-rose-700">{submittedPRs.filter((pr) => getDisplayStatus(pr) === 'returned').length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Returned PRs</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/** Total Amount */}
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  Total Amount
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-violet-50 flex items-center justify-center shadow-sm">
                    <Wallet className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-violet-700">₱{submittedPRs.reduce((sum, pr) => sum + pr.totalAmount, 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total amount in submitted PRs</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {submittedPRs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No PRs to review</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPRs.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-medium">
                        {pr.headerDetails.prNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge color={TYPE_BADGE_COLOR[pr.type] || 'default'} variant="outline" className="capitalize">
                          {pr.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pr.headerDetails.description}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₱{pr.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={STATUS_BADGE_CONFIG[getDisplayStatus(pr)].color}
                          variant={STATUS_BADGE_CONFIG[getDisplayStatus(pr)].variant}
                        >
                          {STATUS_BADGE_CONFIG[getDisplayStatus(pr)].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Order: View Details, Approve, Return */}
                            <DropdownMenuItem onClick={() => onViewDetails(pr)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {pr.status === 'submitted' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPR(pr)
                                    setApproveOpen(true)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Approve
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPR(pr)
                                    setReturnOpen(true)
                                  }}
                                >
                                  <CornerDownLeft className="h-4 w-4 mr-2 text-destructive" />
                                  Return
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

        {/* Pagination */}
        {submittedPRs.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, submittedPRs.length)} of {submittedPRs.length} PR(s)
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
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Approve PR Modal - upload signed PDF */}
      <ApprovePRModal
        open={approveOpen}
        onOpenChange={(open) => {
          setApproveOpen(open)
          if (!open) setSelectedPR(null)
        }}
        onApprove={async (_signedPdfUrl) => {
          if (!selectedPR) return
          try {
            await statusMutation.mutateAsync({
              pathParams: { id: selectedPR.id },
              queryParams: { id: selectedPR.id },
              payload: { prId: selectedPR.id, newStatus: 'Approved' }
            })
            toast({ title: 'Purchase Request approved', description: `${selectedPR.headerDetails.prNumber} approved successfully.` })
          } catch (error) {
            toast({ title: 'Approval failed', description: 'Failed to approve PR', variant: 'destructive' })
          }
        }}
      />

      {/* Return PR Modal - mandatory remarks */}
      <ReturnPRModal
        open={returnOpen}
        onOpenChange={(open) => {
          setReturnOpen(open)
          if (!open) setSelectedPR(null)
        }}
        onReturn={async (remarks) => {
          if (!selectedPR) return
          try {
            await statusMutation.mutateAsync({
              pathParams: { id: selectedPR.id },
              queryParams: { id: selectedPR.id },
              payload: { prId: selectedPR.id, newStatus: 'Returned', remarks }
            })
            toast({ title: 'Purchase Request returned', description: `${selectedPR.headerDetails.prNumber} was returned.` })
          } catch (error) {
            toast({ title: 'Return failed', description: 'Failed to return PR', variant: 'destructive' })
          }
        }}
      />
    </div>
  )
}
