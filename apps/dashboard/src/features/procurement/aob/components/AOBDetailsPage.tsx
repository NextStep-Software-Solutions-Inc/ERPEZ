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
import {
  ChevronLeft,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Info,
  Trophy,
  Printer,
  Trash2,
  Send,
  Scale,
  Coins,
  Calendar,
  User,
  FileText,
  RotateCcw,
} from 'lucide-react'
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
import { getAOBDetailRequest } from '../handlers/getAOBDetailRequest'
import { getBidMatrixRequest } from '../handlers/getBidMatrixRequest'

const useSelectWinner = createMutationHookFromTemplate(selectWinnerRequest)

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
 * Get status badge styling with rich colors and icon
 * Respects user/creator view (Submitted) vs admin/manager view (For Approval)
 */
function getStatusBadge(status: string, isAdmin: boolean = false) {
  if (status === AOBStatus.FOR_APPROVAL || status === 'For Approval' || status === 'Submitted') {
    if (isAdmin) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          For Approval
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        Submitted
      </Badge>
    )
  }

  switch (status) {
    case AOBStatus.DRAFT:
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Draft
        </Badge>
      )
    case AOBStatus.APPROVED:
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </Badge>
      )
    case AOBStatus.RETURNED:
    case AOBStatus.REJECTED:
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          Returned for Revision
        </Badge>
      )
    case AOBStatus.CANCELLED:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 gap-1.5 px-2.5 py-1 text-xs font-semibold">
          Cancelled
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs font-semibold">
          {status === 'ForApproval' ? (isAdmin ? 'For Approval' : 'Submitted') : status}
        </Badge>
      )
  }
}

/**
 * Check if all items have winners selected
 */
function areAllItemsAwarded(bidMatrix: BidMatrix | undefined | null): boolean {
  if (!bidMatrix?.lineItems) return false
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

  const queryClient = useQueryClient()
  const { mutateAsync: awardAOB } = useSelectWinner()

  useEffect(() => {
    setBidMatrix(initialBidMatrix)
  }, [initialBidMatrix])

  const allItemsAwarded = useMemo(() => areAllItemsAwarded(bidMatrix), [bidMatrix])

  const isForApproval =
    aob.status === AOBStatus.FOR_APPROVAL ||
    aob.status === 'For Approval' ||
    aob.status === 'Submitted'

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
          void queryClient.invalidateQueries({
            queryKey: [getAOBDetailRequest.endpoint, aob.id],
          })
          void queryClient.invalidateQueries({
            queryKey: [getBidMatrixRequest.endpoint, aob.id],
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

  const totalABC = useMemo(() => {
    if (!bidMatrix?.lineItems?.length) return 0
    return bidMatrix.lineItems.reduce((sum, item) => {
      const unitABC = item.abcUnitPrice || item.approvedBudgetForContract || 0
      return sum + (item.totalABC || unitABC * (item.quantity || 1))
    }, 0)
  }, [bidMatrix])

  const rfqDisplay = useMemo(() => {
    if (aob.rfqNumber && aob.rfqNumber !== '-') return aob.rfqNumber
    if (aob.rfqs && aob.rfqs.length > 0) {
      const valid = aob.rfqs.map((r) => r.rfqNumber).filter(Boolean)
      if (valid.length > 0) return valid.join(', ')
    }
    if (bidMatrix?.linkedRFQs && bidMatrix.linkedRFQs.length > 0) {
      const valid = bidMatrix.linkedRFQs.map((r) => r.rfqNumber).filter(Boolean)
      if (valid.length > 0) return valid.join(', ')
    }
    return null
  }, [aob.rfqNumber, aob.rfqs, bidMatrix?.linkedRFQs])

  const procurementMode = useMemo(() => {
    const num = (aob.aobNumber || '').toUpperCase()
    if (num.includes('SVP')) return { code: 'SVP', label: 'Small Value Procurement', sec: 'Sec. 53.9' }
    if (num.includes('PB')) return { code: 'PB', label: 'Competitive Bidding', sec: 'Sec. 10' }
    if (num.includes('SHOP')) return { code: 'Shopping', label: 'Shopping', sec: 'Sec. 52.1' }
    if (num.includes('DA')) return { code: 'DA', label: 'Direct Acquisition', sec: 'ABC ≤ ₱200k' }
    if (num.includes('DC')) return { code: 'DC', label: 'Direct Contracting', sec: 'Sec. 50' }
    return { code: 'Alternative', label: 'Alternative Mode', sec: 'RA 12009' }
  }, [aob.aobNumber])

  const createdDateFormatted = useMemo(() => {
    const d = aob.createdAt || aob.aobDate || aob.date
    if (!d) return '-'
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }, [aob.createdAt, aob.aobDate, aob.date])

  const openingDateFormatted = useMemo(() => {
    const d = aob.openingDate
    if (!d) return 'Same day'
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }, [aob.openingDate])

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

        <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
          {/* Header Tier */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    {aob.aobNumber}
                  </h1>
                  {getStatusBadge(aob.status, isAdmin)}
                  <Badge variant="outline" className="bg-blue-50/70 text-blue-750 border-blue-200 text-xs font-medium">
                    {procurementMode.label}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-250 text-[11px]">
                    RA 12009 (NGPA)
                  </Badge>
                </div>
                <CardDescription className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {aob.description || 'Abstract of Bids & Quotations Evaluation'}
                </CardDescription>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => printAOB(aob, bidMatrix)} 
                  disabled={isProcessing}
                  className="gap-1.5 h-9 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  title="Print Abstract of Bids"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print AOB</span>
                </Button>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled={isProcessing}>
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Document Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isForApproval && isAdmin && (
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
                          View Award Recommendation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={onExport} disabled={isProcessing}>
                      <Download className="w-4 h-4 mr-2 text-slate-500" />
                      Export Summary PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport} disabled={isProcessing}>
                      <Download className="w-4 h-4 mr-2 text-slate-500" />
                      Export Excel (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Metadata Section - 5 Micro-Card Tiles */}
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. RFQ Reference */}
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    RFQ Reference
                  </div>
                  <div className="mt-1">
                    {rfqDisplay ? (
                      <span className="text-xs font-semibold text-slate-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80 inline-block truncate max-w-full" title={rfqDisplay}>
                        {rfqDisplay}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        Consolidated Canvass
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">
                  {procurementMode.sec}
                </div>
              </div>

              {/* 2. Award Criterion */}
              <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-1">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    Award Criterion
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-bold text-sm text-purple-950">
                      {aob.awardCriterion || 'LCRB'}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-purple-100/60 text-purple-800 border-purple-200 font-medium">
                      {aob.awardCriterion === 'MEARB' ? 'QPR Score' : 'Lowest Price'}
                    </Badge>
                  </div>
                </div>
                <div className="text-[11px] text-purple-800/80 mt-2">
                  {aob.awardCriterion === 'MEARB'
                    ? 'Quality-Price Ratio'
                    : 'Lowest Calculated & Responsive'}
                </div>
              </div>

              {/* 3. Budget Ceiling (ABC) */}
              <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Budget Ceiling (ABC)
                  </div>
                  <div className="mt-1 font-bold text-sm text-emerald-950">
                    {totalABC > 0 ? formatPHP(totalABC) : '-'}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-700 mt-2">
                  {totalItems > 0 ? `${totalItems} line item${totalItems !== 1 ? 's' : ''} budgeted` : 'Approved allocation'}
                </div>
              </div>

              {/* 4. Date Created & Opened */}
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Canvass Date
                  </div>
                  <div className="mt-1 font-semibold text-xs text-slate-900">
                    {createdDateFormatted}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Opening: {openingDateFormatted}
                </div>
              </div>

              {/* 5. Created / Evaluated By */}
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Prepared By
                  </div>
                  <div className="mt-1 font-semibold text-xs text-slate-900 truncate" title={aob.createdBy || 'System'}>
                    {aob.createdBy || 'System'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 truncate">
                  {aob.status === AOBStatus.APPROVED && aob.approvedBy
                    ? `Approved: ${aob.approvedBy}`
                    : 'BAC Secretariat'}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Contextual Status Banner for ForApproval / Submitted */}
          {isForApproval && (
            <div
              className={`border-t px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                isAdmin
                  ? 'border-amber-200/80 bg-amber-50/70 text-amber-900'
                  : 'border-blue-200/80 bg-blue-50/70 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Awaiting Approving Authority Sign-Off:</strong> All quotation canvasses have been completed. Review the evaluation matrix and line-item awards before issuing the Notice of Award.
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Quotation Canvass Submitted:</strong> This Abstract of Bids has been submitted for evaluation and approval by the Bids and Awards Committee.
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('summary')}
                  className={`h-8 text-xs bg-white ${
                    isAdmin
                      ? 'hover:bg-amber-50 border-amber-300 text-amber-900'
                      : 'hover:bg-blue-50 border-blue-300 text-blue-900'
                  }`}
                >
                  Review Awards
                </Button>
                {isAdmin && onApprove && (
                  <Button
                    size="sm"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={isProcessing || !allItemsAwarded}
                    className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve AOB
                  </Button>
                )}
                {isAdmin && onReturn && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReturnDialog(true)}
                    disabled={isProcessing}
                    className="h-8 text-xs font-semibold border-rose-300 text-rose-700 hover:bg-rose-50 gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons - Role-Based */}
        <div className="flex gap-2 justify-end pt-4">
          {aob.status === AOBStatus.DRAFT && !isAdmin && (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
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
          {isForApproval && isAdmin && (
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
      {isForApproval && !allItemsAwarded && bidMatrix && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Please select winners for all line items before approving the AOB.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert if no bid data */}
      {!bidMatrix && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            No bid matrix data available yet. Link RFQs and import supplier bids to begin evaluation.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix" disabled={!bidMatrix}>
            Bid Matrix
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!bidMatrix}>
            Award Recommendation
          </TabsTrigger>
          <TabsTrigger value="details">Details & Stats</TabsTrigger>
        </TabsList>

        {/* Bid Evaluation Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          {bidMatrix ? (
            <>
              {/* Toolbar with export/print */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {bidStatistics.responsiveBids} responsive bids • {bidStatistics.totalSuppliers} suppliers
                      {winnerCount > 0 && (
                        <span className="ml-3 text-yellow-600 font-medium">
                          • {winnerCount}/{totalItems} items awarded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {aob.status !== AOBStatus.APPROVED ? (
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
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowSelectWinnerDialog(true)}
                          disabled={isProcessing}
                          className="gap-2"
                        >
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Review Award Decisions
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
                <p className="text-gray-600">No bid matrix available</p>
                <Button variant="outline" size="sm" onClick={() => setShowAddRFQDialog(true)} className="mt-4" disabled={isProcessing}>
                  Add RFQs & Bids
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Award Summary Tab */}
        <TabsContent value="summary">
          {bidMatrix && bidMatrix.lineItems && bidMatrix.lineItems.length > 0 && flatBids.length > 0 ? (
            <ItemBidDetailsTable
              lineItems={bidMatrix.lineItems}
              bids={flatBids}
              variant="detailed"
              onSelectWinners={() => setShowSelectWinnerDialog(true)}
              isApproved={aob.status === AOBStatus.APPROVED}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No award summary data available</p>
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
                  <p className="font-medium mt-1">{new Date(aob.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Created By</label>
                  <p className="font-medium mt-1">{aob.createdBy || 'System'}</p>
                </div>
              </div>
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
      />

      {/* Select Winners Dialog */}
      {bidMatrix && (
        <SelectWinnerDialog
          open={showSelectWinnerDialog}
          onOpenChange={setShowSelectWinnerDialog}
          bidMatrix={bidMatrix}
          onConfirm={handleConfirmWinners}
          readOnly={aob.status === AOBStatus.APPROVED}
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
    </div>
  )
}
