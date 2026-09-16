/**
 * AOB Details Page Component
 * Main page for viewing and managing a specific AOB
 * Displays bid matrix, award evaluations, and actions
 * 
 * Features:
 * - Tabbed interface: Bid Matrix, Award Summary, Details & Stats
 * - Real-time bid evaluation with supplier comparison
 * - Winner selection and award decision tracking
 * - Executive summary with key metrics
 * - Status-based action buttons:
 *   * User view: Submit & Delete (for Draft)
 *   * Manager view: Approve & Return (for For Approval)
 * - Export to PDF and Excel formats
 * - API-ready with mock data support
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronLeft, MoreVertical, AlertCircle, CheckCircle, Clock, Download, Info, Trophy, Printer, Trash2, Send, Plus, X } from 'lucide-react'
import { BidEvaluationMatrix } from '../tables/BidEvaluationMatrix'
import { ItemBidDetailsTable } from '../tables/ItemBidDetailsTable'
import { AddRFQsAndBidsDialog } from '../dialogs/AddRFQsAndBidsDialog'
import { ApproveAOBDialog } from '../dialogs/ApproveAOBDialog'
import { ReturnAOBDialog } from '../dialogs/ReturnAOBDialog'
import { SelectWinnerDialog } from '../dialogs/SelectWinnerDialog'
import type { AOB, BidMatrix, AwardItemInputDto } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'
import { printAOB } from '../utils/printAOB'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { selectWinnerRequest } from '../handlers/selectWinnerRequest'
import { unlinkRFQRequest } from '../handlers/unlinkRFQRequest'

const useSelectWinner = createMutationHookFromTemplate(selectWinnerRequest)
const useUnlinkRFQ = createMutationHookFromTemplate(unlinkRFQRequest)

interface AOBDetailsPageProps {
  aob: AOB
  bidMatrix?: BidMatrix | null
  onBack?: () => void
  onDelete?: () => void
  onSubmitForApproval?: () => void
  onApprove?: () => void
  onReturn?: () => void
  onExport?: () => void
  isProcessing?: boolean
  /**
   * isAdmin determines role-based access:
   * - false (user/creator): Can submit, delete (Draft status)
   * - true (manager/approver): Can approve, return (For Approval status)
   */
  isAdmin?: boolean
}

/**
 * Get status badge styling
 */
function getStatusBadgeVariant(status: string): 'outline' | 'soft' {
  switch (status) {
    case AOBStatus.DRAFT:
      return 'soft'
    case AOBStatus.FOR_APPROVAL:
      return 'outline'
    case AOBStatus.APPROVED:
      return 'soft'
    case AOBStatus.REJECTED:
      return 'soft'
    case AOBStatus.CANCELLED:
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: string) {
  switch (status) {
    case AOBStatus.DRAFT:
      return <Clock className="w-4 h-4" />
    case AOBStatus.FOR_APPROVAL:
      return <AlertCircle className="w-4 h-4" />
    case AOBStatus.APPROVED:
      return <CheckCircle className="w-4 h-4" />
    case AOBStatus.REJECTED:
      return <AlertCircle className="w-4 h-4" />
    default:
      return null
  }
}

/**
 * Check if all items have winners selected
 */
function areAllItemsAwarded(bidMatrix: BidMatrix | undefined | null): boolean {
  if (!bidMatrix?.lineItems || bidMatrix.lineItems.length === 0) return false
  return bidMatrix.lineItems.every((item) => item.selectedWinnerId)
}

/**
 * Format currency with Philippine Peso
 */
function formatPHP(amount: number | null | undefined): string {
  if (!amount) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function AOBDetailsPage({
  aob,
  bidMatrix: initialBidMatrix,
  onBack,
  onDelete,
  onSubmitForApproval,
  onApprove,
  onReturn,
  onExport,
  isProcessing = false,
  isAdmin = false,
}: AOBDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('matrix')
  const [bidMatrix, setBidMatrix] = useState<BidMatrix | null | undefined>(initialBidMatrix)
  const [showAddRFQDialog, setShowAddRFQDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showSelectWinnerDialog, setShowSelectWinnerDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rfqToUnlink, setRfqToUnlink] = useState<{ id: string; rfqNumber: string } | null>(null)

  const queryClient = useQueryClient()
  const { mutateAsync: awardAOB } = useSelectWinner()
  const { mutateAsync: unlinkRFQ, isPending: isUnlinkingRFQ } = useUnlinkRFQ()

  useEffect(() => {
    setBidMatrix(initialBidMatrix)
  }, [initialBidMatrix])

  const hasBidData = Boolean(bidMatrix && bidMatrix.lineItems && bidMatrix.lineItems.length > 0)
  const canModifyAOB = (aob.status === AOBStatus.DRAFT || aob.status === AOBStatus.RETURNED) && !isAdmin

  const linkedRFQs = useMemo(() => {
    if (aob.rfqs && aob.rfqs.length > 0) return aob.rfqs
    if (bidMatrix?.linkedRFQs && bidMatrix.linkedRFQs.length > 0) return bidMatrix.linkedRFQs
    return []
  }, [aob.rfqs, bidMatrix?.linkedRFQs])

  const allItemsAwarded = useMemo(() => areAllItemsAwarded(bidMatrix), [bidMatrix])

  const handleConfirmUnlinkRFQ = useCallback(async () => {
    if (!rfqToUnlink || !aob.id) return

    try {
      await unlinkRFQ({
        pathParams: { id: aob.id, rfqId: rfqToUnlink.id },
      })

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => typeof k === 'string' && !!aob.id && k.includes(aob.id)
          ),
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aob.id}`],
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aob.id}/matrix`],
      })

      toast.success(`Successfully unlinked ${rfqToUnlink.rfqNumber}`)
      setRfqToUnlink(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to unlink RFQ'
      toast.error(msg)
    }
  }, [rfqToUnlink, aob.id, unlinkRFQ, queryClient])

  const handleConfirmWinners = useCallback(
    async (selections: Record<string, string>) => {
      if (!bidMatrix?.lineItems || !aob.id) return

      const awardedItems: AwardItemInputDto[] = []
      bidMatrix.lineItems.forEach((item) => {
        const supplierId = selections[item.id]
        if (supplierId) {
          const winnerBid = item.lineItems?.find((b) => b.supplierId === supplierId)
          awardedItems.push({
            rfqItemId: item.rfqItemId || item.id,
            winningSupplierId: supplierId,
            awardedUnitPrice: winnerBid?.unitBid || winnerBid?.unitPrice || 0,
            awardedQuantity: item.quantity || 1,
            score: winnerBid?.score || 100,
            awardReason: winnerBid?.awardReason || 'Lowest calculated responsive quotation',
          })
        }
      })

      try {
        if (awardedItems.length > 0) {
          await awardAOB({
            pathParams: { id: aob.id },
            payload: { awardedItems },
          })
          await queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey.some(
                (k) => typeof k === 'string' && !!aob.id && k.includes(aob.id)
              ),
          })
          void queryClient.invalidateQueries({
            queryKey: [`/aobs/${aob.id}`],
          })
          void queryClient.invalidateQueries({
            queryKey: [`/aobs/${aob.id}/matrix`],
          })
          toast.success('Winning bids saved successfully')
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save winning bids'
        toast.error(msg)
      }

      setBidMatrix((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          lineItems: prev.lineItems.map((item) => {
            const supplierId = selections[item.id]
            if (!supplierId) return item
            const winnerBid = item.lineItems?.find((b) => b.supplierId === supplierId) ?? null
            return {
              ...item,
              selectedWinnerId: supplierId,
              selectedWinnerBid: winnerBid,
              lineItems: item.lineItems?.map((b) => ({ ...b, isWinner: b.supplierId === supplierId })),
            }
          }),
        }
      })
    },
    [bidMatrix, aob.id, awardAOB, queryClient]
  )

  const winnerCount = useMemo(
    () => bidMatrix?.lineItems?.filter((item) => item.selectedWinnerId).length ?? 0,
    [bidMatrix]
  )
  const totalItems = useMemo(() => bidMatrix?.lineItems?.length ?? 0, [bidMatrix])

  // Calculate bid statistics
  const bidStatistics = useMemo(() => {
    if (!bidMatrix) {
      return {
        totalLineItems: 0,
        totalSuppliers: 0,
        uniqueSuppliers: 0,
        totalBidAmount: 0,
        awardedAmount: 0,
        responsiveBids: 0,
      }
    }

    const totalLineItems = bidMatrix.lineItems?.length || 0
    const totalSuppliers = bidMatrix.suppliers?.length || 0
    const uniqueSuppliers = new Set(bidMatrix.suppliers?.map((s) => s.supplierId) || []).size

    let totalBidAmount = 0
    let awardedAmount = 0
    let responsiveBids = 0

    bidMatrix.lineItems?.forEach((item) => {
      item.lineItems?.forEach((bid) => {
        if (bid.totalBid) {
          totalBidAmount += bid.totalBid
          if (bid.isWinner) {
            awardedAmount += bid.totalBid
          }
          if (bid.unitBid) {
            responsiveBids++
          }
        }
      })
    })

    return {
      totalLineItems,
      totalSuppliers,
      uniqueSuppliers,
      totalBidAmount,
      awardedAmount,
      responsiveBids,
    }
  }, [bidMatrix])

  // Flatten bids for Award Summary table
  const flatBids = useMemo(() => {
    if (!bidMatrix?.lineItems) return []
    return bidMatrix.lineItems.flatMap((item) => item.lineItems || [])
  }, [bidMatrix])

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
            disabled={isProcessing}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{aob.aobNumber}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(aob.status)} className="flex items-center gap-1">
                    {getStatusIcon(aob.status)}
                    <span>{aob.status}</span>
                  </Badge>
                </div>
                <CardDescription className="text-base">{aob.description}</CardDescription>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {canModifyAOB && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setShowAddRFQDialog(true)}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Link RFQs & Bids
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {aob.status === AOBStatus.FOR_APPROVAL && isAdmin && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveTab('matrix')
                          setShowSelectWinnerDialog(true)
                        }}
                        disabled={isProcessing || !bidMatrix}
                      >
                        Continue Evaluation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {aob.status === AOBStatus.APPROVED && (
                    <>
                      <DropdownMenuItem onClick={() => setActiveTab('summary')} disabled={isProcessing}>
                        View Award Summary
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => printAOB(aob, bidMatrix)} 
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print AOB
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExport} disabled={isProcessing}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport} disabled={isProcessing}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">Linked RFQs</div>
                <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                  {linkedRFQs.length > 0 ? (
                    linkedRFQs.map((rfq) => (
                      <span
                        key={rfq.id}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {rfq.rfqNumber}
                        {canModifyAOB && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRfqToUnlink({ id: rfq.id, rfqNumber: rfq.rfqNumber })
                            }}
                            className="text-blue-500 hover:text-red-600 rounded p-0.5 hover:bg-blue-100 transition-colors"
                            title={`Unlink ${rfq.rfqNumber}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="font-semibold text-sm mt-1 block">{aob.rfqNumber || '-'}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">Award Criterion</div>
                <div className="font-semibold mt-1">{aob.awardCriterion || 'LCRB'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">Created</div>
                <div className="font-semibold text-sm mt-1">
                  {aob.createdAt ? new Date(aob.createdAt).toLocaleDateString() : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase">Created By</div>
                <div className="font-semibold text-sm mt-1">{aob.createdBy || 'System'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Role-Based */}
        <div className="flex gap-2 justify-end pt-4">
          {canModifyAOB && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowAddRFQDialog(true)}
                disabled={isProcessing}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add RFQs & Bids
              </Button>
              {aob.status === AOBStatus.DRAFT && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <Button
                onClick={() => onSubmitForApproval?.()}
                disabled={isProcessing}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </Button>
            </>
          )}
          {aob.status === AOBStatus.FOR_APPROVAL && isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowReturnDialog(true)}
                disabled={isProcessing}
                className="gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Return
              </Button>
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={isProcessing || !allItemsAwarded}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert if evaluation incomplete */}
      {aob.status === AOBStatus.FOR_APPROVAL && !allItemsAwarded && bidMatrix && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Please select winners for all line items before approving the AOB.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert if no bid data */}
      {!hasBidData && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 flex items-center justify-between">
            <span>No bid matrix data available yet. Link RFQs and import supplier bids to begin evaluation.</span>
            {canModifyAOB && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddRFQDialog(true)}
                disabled={isProcessing}
                className="ml-4 gap-2 shrink-0 bg-white hover:bg-blue-50 text-blue-900 border-blue-300"
              >
                <Plus className="w-4 h-4" />
                Add RFQs & Bids
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">
            Bid Matrix
          </TabsTrigger>
          <TabsTrigger value="summary">
            Award Summary
          </TabsTrigger>
          <TabsTrigger value="details">Details & Stats</TabsTrigger>
        </TabsList>

        {/* Bid Evaluation Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          {hasBidData && bidMatrix ? (
            <>
              {/* Toolbar with export/print */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {bidStatistics.responsiveBids} responsive bids • {bidStatistics.totalSuppliers} suppliers
                      {winnerCount > 0 && (
                        <span className="ml-3 text-yellow-600 font-medium">
                          • {winnerCount}/{totalItems} winners selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canModifyAOB && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddRFQDialog(true)}
                          disabled={isProcessing}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add RFQs & Bids
                        </Button>
                      )}
                      {aob.status !== AOBStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant={allItemsAwarded ? 'outline' : 'default'}
                          onClick={() => setShowSelectWinnerDialog(true)}
                          disabled={isProcessing}
                          className="gap-2"
                        >
                          <Trophy className="w-4 h-4" />
                          {allItemsAwarded ? 'Edit Winners' : 'Select Winners'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={onExport} disabled={isProcessing}>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bid Matrix */}
              <BidEvaluationMatrix bidMatrix={bidMatrix} />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">No bid matrix available</p>
                <p className="text-sm text-gray-500 mt-1">Link RFQs to generate the comparison matrix and evaluate bids.</p>
                {canModifyAOB && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddRFQDialog(true)}
                    className="mt-4 gap-2"
                    disabled={isProcessing}
                  >
                    <Plus className="w-4 h-4" />
                    Add RFQs & Bids
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Award Summary Tab */}
        <TabsContent value="summary">
          {bidMatrix && bidMatrix.lineItems && bidMatrix.lineItems.length > 0 ? (
            <ItemBidDetailsTable
              lineItems={bidMatrix.lineItems}
              bids={flatBids}
              aob={aob}
              variant="detailed"
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">No award summary data available</p>
                <p className="text-sm text-gray-500 mt-1">Link RFQs to generate the line items and award evaluation summary.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details & Stats Tab */}
        <TabsContent value="details" className="space-y-4">

          {/* Bid Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bid Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Line Items</div>
                  <div className="text-3xl font-bold text-blue-600">{bidStatistics.totalLineItems}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Suppliers</div>
                  <div className="text-3xl font-bold text-purple-600">{bidStatistics.totalSuppliers}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Responsive Bids</div>
                  <div className="text-3xl font-bold text-green-600">{bidStatistics.responsiveBids}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Bid Amount</div>
                  <div className="text-lg font-bold text-orange-600">{formatPHP(bidStatistics.totalBidAmount)}</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Awarded Amount</div>
                  <div className="text-lg font-bold text-emerald-600">{formatPHP(bidStatistics.awardedAmount)}</div>
                </div>
                {bidStatistics.totalBidAmount > 0 && (
                  <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Award Rate</div>
                    <div className="text-lg font-bold text-rose-600">
                      {((bidStatistics.awardedAmount / bidStatistics.totalBidAmount) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AOB Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">AOB Number</label>
                  <p className="font-medium mt-1">{aob.aobNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                  <p className="font-medium mt-1">{aob.status}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">RFQ Number</label>
                  <p className="font-medium mt-1">{aob.rfqNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Award Criterion</label>
                  <p className="font-medium mt-1">{aob.awardCriterion || 'LCRB'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Created Date</label>
                  <p className="font-medium mt-1">{aob.createdAt ? new Date(aob.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Created By</label>
                  <p className="font-medium mt-1">{aob.createdBy || 'System'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked RFQs Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base">Linked RFQs</CardTitle>
                <CardDescription>RFQs currently evaluated under this Abstract of Bids</CardDescription>
              </div>
              {canModifyAOB && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRFQDialog(true)}
                  disabled={isProcessing}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add RFQ
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {linkedRFQs.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {linkedRFQs.map((rfq) => (
                    <div key={rfq.id} className="flex items-center justify-between p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{rfq.rfqNumber}</span>
                          {rfq.status && (
                            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 font-medium">
                              {rfq.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {rfq.tracingNumber && <span>Tracking: {rfq.tracingNumber}</span>}
                          {rfq.totalAmount !== undefined && <span>Total: {formatPHP(rfq.totalAmount)}</span>}
                          {rfq.date && <span>Date: {new Date(rfq.date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {canModifyAOB && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRfqToUnlink({ id: rfq.id, rfqNumber: rfq.rfqNumber })}
                          disabled={isProcessing || isUnlinkingRFQ}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Unlink
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No RFQs currently linked to this AOB.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add RFQs & Bids Dialog */}
      <AddRFQsAndBidsDialog
        open={showAddRFQDialog}
        onOpenChange={setShowAddRFQDialog}
        aobId={aob.id}
        onBidMatrixGenerated={setBidMatrix}
        currentlyLinkedRfqIds={linkedRFQs.map((r) => r.id)}
      />

      {/* Select Winners Dialog */}
      {bidMatrix && hasBidData && (
        <SelectWinnerDialog
          open={showSelectWinnerDialog}
          onOpenChange={setShowSelectWinnerDialog}
          bidMatrix={bidMatrix}
          onConfirm={handleConfirmWinners}
        />
      )}

      {/* Approve AOB Dialog */}
      <ApproveAOBDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        aob={aob}
        winnerCount={winnerCount}
        totalItems={totalItems}
        onApprove={async () => {
          onApprove?.()
          setShowApproveDialog(false)
        }}
      />

      {/* Return AOB Dialog */}
      <ReturnAOBDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        aob={aob}
        onReturn={async () => {
          onReturn?.()
          setShowReturnDialog(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AOB</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Abstract of Bids (AOB)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.()
                setShowDeleteConfirm(false)
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink RFQ Confirmation Dialog */}
      <AlertDialog open={Boolean(rfqToUnlink)} onOpenChange={(open) => !open && setRfqToUnlink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink RFQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <span className="font-semibold text-gray-900">{rfqToUnlink?.rfqNumber}</span> from this AOB?
              This will remove all its items, associated supplier bids, and any awarded winners from the evaluation matrix.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnlinkingRFQ}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnlinkRFQ}
              disabled={isUnlinkingRFQ}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isUnlinkingRFQ ? 'Unlinking...' : 'Unlink RFQ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
