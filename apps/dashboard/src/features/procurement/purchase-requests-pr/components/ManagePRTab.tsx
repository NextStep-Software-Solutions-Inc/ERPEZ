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
import {
  MoreVertical,
  Eye,
  CheckCircle,
  CornerDownLeft,
  FileText,
  Clock,
  Building2,
  Layers,
  Funnel,
  Loader2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { ApprovePRModal } from './ApprovePRModal'
import { ReturnPRModal } from './ReturnPRModal'
import { useToast } from '@/components/ui/use-toast'
import { PurchaseRequest, PRStatus, PRType } from '../types'
import { usePurchaseRequests, useUpdatePurchaseRequestStatus } from '../handlers/hooks'
import { fromApiStatus, fromApiPrType } from '../types/apiTypes'
import { openSignedDocument } from '../utils/openSignedDocument'
import { getOfficesRequest } from '@/features/planning/app-consolidation/handlers/getOfficesRequest'

const useOffices = createQueryHookFromTemplate(getOfficesRequest)

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

const TYPE_BADGE_COLOR: Record<PRType, any> = {
  'non-cse': 'indigo',
  'out-of-stock': 'cyan',
  consolidated: 'purple',
}

interface ManagePRTabProps {
  onViewDetails: (pr: PurchaseRequest) => void
}

export function ManagePRTab({ onViewDetails }: ManagePRTabProps) {
  const { setIsManagePRView, updatePurchaseRequest } = usePurchaseRequestStore()
  const { toast } = useToast()

  useEffect(() => {
    setIsManagePRView(true)
    return () => setIsManagePRView(false)
  }, [setIsManagePRView])

  // Use API hooks
  const { data: prResponse, isLoading } = usePurchaseRequests({ pathParams: {}, queryParams: { PageSize: 100 } })
  const { data: officesResponse } = useOffices({})
  const statusMutation = useUpdatePurchaseRequestStatus()

  const officesMap = useMemo(() => {
    const map = new Map<string, string>()
    const list: Office[] = Array.isArray(officesResponse)
      ? officesResponse
      : Array.isArray((officesResponse as any)?.data)
        ? (officesResponse as any).data
        : []

    for (const off of list) {
      if (off && off.id && off.name) {
        map.set(off.id, off.name)
      }
    }
    return map
  }, [officesResponse])

  // Map API response to frontend PurchaseRequest models (purely API-driven)
  const purchaseRequests: PurchaseRequest[] = useMemo(() => {
    return (prResponse?.data || []).map((apiPr) => {
      const resolvedOfficeName =
        (apiPr.officeName && apiPr.officeName.trim().length > 0)
          ? apiPr.officeName.trim()
          : (apiPr.officeId && officesMap.get(apiPr.officeId))
            ? officesMap.get(apiPr.officeId)!
            : 'General Administration'

      return {
        id: apiPr.id,
        type: fromApiPrType(apiPr.prType),
        status: fromApiStatus(apiPr.status),
        headerDetails: {
          prNumber: apiPr.prNumber,
          description: apiPr.description || '',
          date: apiPr.requestedDate ? String(apiPr.requestedDate) : '',
          purpose: '',
          officeId: apiPr.officeId || '',
          officeName: resolvedOfficeName,
        },
        items: [],
        totalAmount: apiPr.totalAmount,
        createdAt: apiPr.createdDate ? String(apiPr.createdDate) : '',
        updatedAt: apiPr.createdDate ? String(apiPr.createdDate) : '',
        dateSubmitted: apiPr.requestedDate ? String(apiPr.requestedDate) : (apiPr.createdDate ? String(apiPr.createdDate) : ''),
        createdBy: '',
      } as PurchaseRequest
    })
  }, [prResponse, officesMap])

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

  // Filter only submitted and approved PRs for review by selected types
  const submittedPRs = purchaseRequests.filter((pr) => {
    const ds = getDisplayStatus(pr)
    return (ds === 'submitted' || ds === 'approved' || ds === 'returned') && selectedTypes.includes(pr.type)
  })

  // Derived Procurement Intelligence Metrics for Central Procurement Staff
  const totalInboundCount = submittedPRs.length
  const totalInboundAmount = submittedPRs.reduce((sum, pr) => sum + pr.totalAmount, 0)

  const pendingPRs = submittedPRs.filter((pr) => getDisplayStatus(pr) === 'submitted')
  const pendingCount = pendingPRs.length
  const pendingAmount = pendingPRs.reduce((sum, pr) => sum + pr.totalAmount, 0)

  const approvedPRs = submittedPRs.filter((pr) => getDisplayStatus(pr) === 'approved')
  const approvedCount = approvedPRs.length
  const approvedAmount = approvedPRs.reduce((sum, pr) => sum + pr.totalAmount, 0)

  const returnedPRs = submittedPRs.filter((pr) => getDisplayStatus(pr) === 'returned')
  const returnedCount = returnedPRs.length

  const nonCseCount = submittedPRs.filter((pr) => pr.type === 'non-cse').length
  const outOfStockCount = submittedPRs.filter((pr) => pr.type === 'out-of-stock').length

  const uniqueOffices = Array.from(
    new Set(
      submittedPRs
        .map((pr) => pr.headerDetails.officeName)
        .filter((name): name is string => Boolean(name && name.trim().length > 0))
    )
  )
  const uniqueOfficesCount = uniqueOffices.length

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
                <Building2 className="h-7 w-7 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">Manage Purchase Requests</h2>
                  <span className="inline-flex items-center text-xs font-medium bg-violet-100 text-violet-800 px-2 py-1 rounded">Procurement Staff View</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Review, approve, and consolidate Purchase Requests across all requesting offices and colleges</p>
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

      {/* Procurement Intelligence Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Inbound PR Pipeline */}
        <Card className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-indigo-100/40 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Inbound PR Pipeline
                </p>
                <div className="text-2xl font-semibold text-indigo-900">
                  ₱{totalInboundAmount.toLocaleString()}
                </div>
                <p className="text-xs text-indigo-700/80 font-normal pt-1">
                  {totalInboundCount} PR{totalInboundCount !== 1 ? 's' : ''} across {uniqueOfficesCount || 1} Office{uniqueOfficesCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 shadow-xs text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Awaiting Procurement Review */}
        <Card className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-amber-100/40 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Awaiting Review
                  </p>
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="border-amber-300 bg-amber-100/60 text-amber-900 text-[10px] px-1.5 py-0 font-medium">
                      Action Required
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-semibold text-amber-950">
                  {pendingCount} PR{pendingCount !== 1 ? 's' : ''}
                </div>
                <p className="text-xs text-amber-800/80 font-normal pt-1">
                  ₱{pendingAmount.toLocaleString()} pending decision
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 shadow-xs text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Approved for Execution */}
        <Card className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Approved for Execution
                </p>
                <div className="text-2xl font-semibold text-emerald-950">
                  {approvedCount} PR{approvedCount !== 1 ? 's' : ''}
                </div>
                <p className="text-xs text-emerald-800/80 font-normal pt-1">
                  ₱{approvedAmount.toLocaleString()} ready for BAC / PO
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 shadow-xs text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Workflow Distribution */}
        <Card className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-purple-100/40 hover:shadow-md transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-800">
                  PR Distribution
                </p>
                <div className="text-lg font-semibold text-purple-950 pt-0.5">
                  {nonCseCount} Non-CSE <span className="text-xs text-purple-500 font-normal">•</span> {outOfStockCount} CSE
                </div>
                <p className="text-xs text-purple-800/80 font-normal pt-1">
                  {returnedCount} Returned for revision
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 shadow-xs text-purple-600">
                <Layers className="h-5 w-5" />
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading purchase requests...</span>
            </div>
          ) : submittedPRs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No PRs to review</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR Number</TableHead>
                    <TableHead>Requesting Office</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPRs.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-medium">
                        {pr.headerDetails.prNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {pr.headerDetails.officeName || officesMap.get(pr.headerDetails.officeId || '') || 'General Administration'}
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
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {(() => {
                          const raw = pr.dateSubmitted || pr.headerDetails.date || pr.createdAt
                          if (!raw) return '—'
                          try {
                            const d = new Date(raw)
                            return isNaN(d.getTime()) ? raw : format(d, 'MMM dd, yyyy')
                          } catch {
                            return raw
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Order: View Details, View Signed Document (if approved), Approve, Return */}
                            <DropdownMenuItem onClick={() => onViewDetails(pr)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {pr.signedPdfUrl && (
                              <DropdownMenuItem
                                onClick={() => openSignedDocument(pr.signedPdfUrl, 'Signed PR Document')}
                                className="flex items-center text-purple-700 dark:text-purple-400 cursor-pointer"
                              >
                                <FileText className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                View Signed Document
                              </DropdownMenuItem>
                            )}

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
        onApprove={async (signedPdfUrl) => {
          if (!selectedPR) return
          try {
            await statusMutation.mutateAsync({
              pathParams: { id: selectedPR.id },
              queryParams: { id: selectedPR.id },
              payload: { prId: selectedPR.id, newStatus: 'Approved' }
            })
            updatePurchaseRequest(selectedPR.id, {
              status: 'approved',
              signedPdfUrl,
              updatedAt: new Date().toISOString()
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
