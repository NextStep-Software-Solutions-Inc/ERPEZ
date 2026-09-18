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
  Plus,
  X,
} from 'lucide-react'
import { BidEvaluationMatrix } from '../tables/BidEvaluationMatrix'
import { ItemBidDetailsTable } from '../tables/ItemBidDetailsTable'
import { AddRFQsAndBidsDialog } from '../dialogs/AddRFQsAndBidsDialog'
import { ApproveAOBDialog } from '../dialogs/ApproveAOBDialog'
import { ReturnAOBDialog } from '../dialogs/ReturnAOBDialog'
import { SelectWinnerDialog } from '../dialogs/SelectWinnerDialog'
import { ExportAOBDialog } from '../dialogs/ExportAOBDialog'
import type { AOB, BidMatrix, AwardItemInputDto } from '../types/aobTypes'
import { AOBStatus } from '../types/aobTypes'
import { printAOB, exportAOBCSV } from '../utils/printAOB'
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
  if (!bidMatrix?.lineItems || bidMatrix.lineItems.length === 0) return false
  return bidMatrix.lineItems.every((item) => Boolean(item.selectedWinnerId || item.lineItems?.some((b) => b.isWinner)))
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
  const [showExportDialog, setShowExportDialog] = useState(false)
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

  const allItemsAwarded = useMemo(() => {
    if (areAllItemsAwarded(bidMatrix)) return true
    if (
      aob.awardedItems &&
      aob.awardedItems.length > 0 &&
      (!bidMatrix?.lineItems || bidMatrix.lineItems.length === 0)
    ) {
      return true
    }
    return false
  }, [bidMatrix, aob.awardedItems])

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
            awardReason: winnerBid?.winningReason || 'Lowest calculated responsive quotation',
          })
        }
      })

      try {
        if (awardedItems.length > 0) {
          await awardAOB({
            pathParams: { id: aob.id },
            payload: { awardedItems, winningSupplierId: awardedItems[0]?.winningSupplierId || '' },
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
    () =>
      bidMatrix?.lineItems?.filter(
        (item) => item.selectedWinnerId || item.lineItems?.some((b) => b.isWinner)
      ).length ?? (aob.awardedItems?.length || 0),
    [bidMatrix, aob.awardedItems]
  )
  const totalItems = useMemo(
    () => bidMatrix?.lineItems?.length ?? (aob.awardedItems?.length || 0),
    [bidMatrix, aob.awardedItems]
  )

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

              {/* Header Action Buttons & More Dropdown */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => printAOB(aob, bidMatrix)} 
                  disabled={isProcessing}
                  className="gap-1.5 h-8 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  title="Print Abstract of Bids"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print AOB</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport || (() => setShowExportDialog(true))}
                  disabled={isProcessing}
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </Button>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isProcessing} className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Document Options</DropdownMenuLabel>
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
                          View Award Summary & Recommendation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => setShowExportDialog(true)} 
                      disabled={isProcessing}
                      className="gap-2 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export Abstract of Quotation
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => printAOB(aob, bidMatrix)} 
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print / Save as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportAOBCSV(aob, bidMatrix)}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV Data
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
                    ) : rfqDisplay ? (
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
          {isForApproval && isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => (onReturn ? onReturn() : setShowReturnDialog(true))}
                disabled={isProcessing}
                className="gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Return
              </Button>
              <Button
                onClick={() => (onApprove ? onApprove() : setShowApproveDialog(true))}
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
          <TabsTrigger value="summary" disabled={!bidMatrix}>
            Award Summary & Recommendation
          </TabsTrigger>
          <TabsTrigger value="details">Details & Stats</TabsTrigger>
        </TabsList>

        {/* Bid Evaluation Matrix Tab */}
        <TabsContent value="matrix">
          {hasBidData && bidMatrix ? (
            <BidEvaluationMatrix
              bidMatrix={bidMatrix}
              actions={
                <div className="flex items-center gap-2">
                  {canModifyAOB && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddRFQDialog(true)}
                      disabled={isProcessing}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add RFQs & Bids
                    </Button>
                  )}
                  {aob.status !== AOBStatus.APPROVED ? (
                    <Button
                      size="sm"
                      variant={allItemsAwarded ? 'outline' : 'default'}
                      onClick={() => setShowSelectWinnerDialog(true)}
                      disabled={isProcessing}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      {allItemsAwarded ? 'Edit Winners' : 'Select Winners'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSelectWinnerDialog(true)}
                      disabled={isProcessing}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Review Award Decisions
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportDialog(true)}
                    disabled={isProcessing}
                    className="gap-1.5 h-8 text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                </div>
              }
            />
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
              onSelectWinners={() => setShowSelectWinnerDialog(true)}
              isApproved={aob.status === AOBStatus.APPROVED}
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
          readOnly={aob.status === AOBStatus.APPROVED}
        />
      )}

      {/* Approve AOB Dialog - only rendered when not handled by parent route */}
      {!onApprove && (
        <ApproveAOBDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
          aob={aob}
          winnerCount={winnerCount}
          totalItems={totalItems}
          onApprove={async () => {
            setShowApproveDialog(false)
          }}
        />
      )}

      {/* Return AOB Dialog - only rendered when not handled by parent route */}
      {!onReturn && (
        <ReturnAOBDialog
          open={showReturnDialog}
          onOpenChange={setShowReturnDialog}
          aob={aob}
          onReturn={async () => {
            setShowReturnDialog(false)
          }}
        />
      )}

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
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              Unlink RFQ
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-1 text-sm text-muted-foreground">
              <div>
                Are you sure you want to unlink <span className="font-semibold text-foreground">{rfqToUnlink?.rfqNumber}</span> from this AOB?
              </div>
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold">⚠️ Impact Notice:</span> Removing this RFQ will permanently clean up all of its line items, associated supplier quotation bids, and any awarded winners from the evaluation matrix.
              </div>
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

      {/* Export Abstract of Quotation Dialog */}
      <ExportAOBDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        aob={aob}
        bidMatrix={bidMatrix}
      />
    </div>
  )
}
