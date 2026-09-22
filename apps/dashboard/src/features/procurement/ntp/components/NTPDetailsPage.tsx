/**
 * Notice to Proceed (NTP) Details Page
 * RA 12009 (NGPA) & GPPB Standard Form Aligned
 */

import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  MoreHorizontal,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  ShieldCheck,
  Globe,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { NTPDetailsTable } from '../tables/NTPDetailsTable'
import {
  EditNTPDialog,
  IssueNoticeToProceedDialog,
  RecordNoticeToProceedReceiptDialog,
  CancelNoticeToProceedDialog,
} from '../dialogs'
import {
  useGetNoticeToProceedById,
  useUpdateNoticeToProceed,
  useIssueNoticeToProceed,
  useRecordNoticeToProceedReceipt,
  useCancelNoticeToProceed,
  useDeleteNoticeToProceed,
  useGenerateNoticeToProceedDocument,
} from '../handlers/hooks'
import { getNoticeToProceedPdfRequest } from '../handlers/getNoticeToProceedPdfRequest'
import type { NoticeToProceedDetail, NoticeToProceedStatus, UpdateNoticeToProceedRequest } from '../types/ntpTypes'

export interface NTPDetailsPageProps {
  ntpId?: string
  ntp?: NoticeToProceedDetail
  isAdmin?: boolean
}

function formatDate(val?: string | null): string {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return val
    return format(d, 'MMMM d, yyyy')
  } catch {
    return val
  }
}

function formatCurrency(amount?: number | null): string {
  if (typeof amount !== 'number') return '—'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const statusBadgeConfig: Record<
  NoticeToProceedStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Draft: {
    label: 'Draft',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    icon: <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />,
  },
  Issued: {
    label: 'Issued',
    className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    icon: <Send className="w-3.5 h-3.5 mr-1 text-blue-600" />,
  },
  Received: {
    label: 'Received (Conforme)',
    className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    icon: <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />,
  },
}

export function NTPDetailsPage({ ntpId, ntp: propNtp, isAdmin = false }: NTPDetailsPageProps) {
  const navigate = useNavigate()

  // Queries & Mutations
  const { data: fetchedNtp, isLoading } = useGetNoticeToProceedById(ntpId)
  const ntp = propNtp || fetchedNtp

  const updateMutation = useUpdateNoticeToProceed()
  const issueMutation = useIssueNoticeToProceed()
  const recordMutation = useRecordNoticeToProceedReceipt()
  const cancelMutation = useCancelNoticeToProceed()
  const deleteMutation = useDeleteNoticeToProceed()
  const generateDocMutation = useGenerateNoticeToProceedDocument()

  // Dialog states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [isRecordOpen, setIsRecordOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [previewModal, setPreviewModal] = useState<{
    open: boolean
    blobUrl: string | null
    title: string
  }>({
    open: false,
    blobUrl: null,
    title: '',
  })

  const backUrl = isAdmin ? '/v2/manage-ntp' : '/v2/notice-to-proceed-ntp'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-2">
        <Clock className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading Notice to Proceed details...</span>
      </div>
    )
  }

  if (!ntp) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: backUrl })} className="gap-1.5 text-xs">
          <ArrowLeft className="w-4 h-4" />
          Back to {isAdmin ? 'Manage NTPs' : 'Notice to Proceed'}
        </Button>
        <Card className="p-8 text-center border-dashed">
          <p className="text-sm text-slate-500">Notice to Proceed document not found or could not be loaded.</p>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: backUrl })} className="mt-4 text-xs">
            Return to NTP List
          </Button>
        </Card>
      </div>
    )
  }

  const statusBadge = statusBadgeConfig[ntp.status] || {
    label: ntp.status,
    className: 'bg-slate-100 text-slate-700',
    icon: null,
  }

  const isDraft = ntp.status === 'Draft'
  const isIssued = ntp.status === 'Issued'
  const isReceived = ntp.status === 'Received'
  const isCancelled = ntp.status === 'Cancelled'

  // Actions
  const handleConfirmIssue = async (payload: { issuedDate?: string; remarks?: string }) => {
    try {
      await issueMutation.mutateAsync({ id: ntp.id, payload })
      toast.success('Notice to Proceed officially issued.')
      setIsIssueOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to issue Notice to Proceed.')
    }
  }

  const handleConfirmRecord = async (payload: {
    receivedAt: string
    receivedByName: string
    receivedDate?: string
    conformeName?: string
    conformeDesignation?: string
    conformeDate?: string
    remarks?: string
  }) => {
    try {
      await recordMutation.mutateAsync({ id: ntp.id, payload })
      toast.success('Contractor conforme & receipt recorded.')
      setIsRecordOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to record contractor receipt.')
    }
  }

  const handleConfirmCancel = async (reason: string) => {
    try {
      await cancelMutation.mutateAsync({ id: ntp.id, payload: { reason } })
      toast.success('Notice to Proceed cancelled.')
      setIsCancelOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to cancel Notice to Proceed.')
    }
  }

  const handleConfirmEdit = async (payload: UpdateNoticeToProceedRequest) => {
    try {
      await updateMutation.mutateAsync({ id: ntp.id, payload })
      toast.success('Notice to Proceed draft updated.')
      setIsEditOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to update Notice to Proceed.')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(ntp.id)
      toast.success(`Draft Notice to Proceed ${ntp.ntpNumber} deleted.`)
      navigate({ to: backUrl })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to delete Notice to Proceed.')
    }
  }

  const handlePreviewPdf = async () => {
    try {
      toast.info('Generating document preview...')
      const result = await getNoticeToProceedPdfRequest.fetcher({
        ntpId: ntp.id,
        ntpNumber: ntp.ntpNumber,
      })
      const url = URL.createObjectURL(result.blob)
      setPreviewModal({
        open: true,
        blobUrl: url,
        title: `${ntp.ntpNumber} — Notice to Proceed`,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to render Notice to Proceed PDF.')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      toast.info('Downloading official PDF...')
      const result = await getNoticeToProceedPdfRequest.fetcher({
        ntpId: ntp.id,
        ntpNumber: ntp.ntpNumber,
      })
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to download official PDF.')
    }
  }

  const handleGenerateDocumentArchive = async () => {
    try {
      toast.info('Generating official document archive...')
      await generateDocMutation.mutateAsync(ntp.id)
      toast.success('Notice to Proceed PDF archive generated and saved.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to generate document archive.')
    }
  }

  return (
    <div className="w-full space-y-6 pb-16">
      {/* ── 1. Top Card Header ────────────────────────────────────────────── */}
      <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: backUrl })}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 px-0 h-auto gap-1.5 font-medium text-xs -ml-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {isAdmin ? 'Manage NTPs' : 'Notice to Proceed'}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {ntp.ntpNumber}
              </h1>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${statusBadge.className}`}>
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
              {ntp.contractId && (
                <Link
                  to="/v2/manage-contracts"
                  search={{ contractId: ntp.contractId }}
                  className="inline-flex"
                >
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                    <FileText className="w-3 h-3 mr-1" />
                    Contract: {ntp.contractNumber || 'View Contract'}
                  </Badge>
                </Link>
              )}
              <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200">
                RA 12009 (NGPA)
              </Badge>
              {ntp.isPhilGepsPosted && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300">
                  <Globe className="w-3 h-3 mr-1" /> PhilGEPS Posted
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              {ntp.description ||
                `Notice to Proceed officially issued under Republic Act No. 12009 (New Government Procurement Act) authorizing ${ntp.supplierName || 'the winning contractor'} to commence work pursuant to terms and conditions of Contract ${ntp.contractNumber || ''}.`}
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <>
                {isDraft && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setIsIssueOpen(true)}
                      className="gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Issue NTP</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                      className="gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteOpen(true)}
                      className="gap-1.5 h-9 px-3 text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </Button>
                  </>
                )}

                {isIssued && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setIsRecordOpen(true)}
                      className="gap-1.5 h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Record Conforme</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelOpen(true)}
                      className="gap-1.5 h-9 px-3 text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel NTP</span>
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {isDraft && (
                  <>
                    <Badge variant="outline" className="text-xs py-1 px-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700">
                      Pending HoPE Issuance
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                      className="gap-1.5 h-9 px-3 text-xs font-medium text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteOpen(true)}
                      className="gap-1.5 h-9 px-3 text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </Button>
                  </>
                )}
                {isIssued && (
                  <Badge variant="outline" className="text-xs py-1 px-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                    Awaiting Contractor Conforme
                  </Badge>
                )}
              </>
            )}

            {/* Dropdown Menu for Documents */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" title="Document Actions">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs">
                <DropdownMenuLabel>Document Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePreviewPdf} className="gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  Preview Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf} className="gap-2">
                  <Download className="w-4 h-4 text-slate-500" />
                  Download Official PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerateDocumentArchive}
                  disabled={generateDocMutation.isPending}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  Generate Document Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* ── 2. Statutory SLA Banner ────────────────────────────────────────── */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs flex items-start gap-2.5 text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 flex-1">
          <p className="font-semibold">
            RA 12009 Section 66 Compliance Notice
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
            The Procuring Entity shall issue the Notice to Proceed within three (3) calendar days from the date of approval of the contract by the Head of the Procuring Entity. The contract effectivity date shall not be later than seven (7) calendar days from issuance.
          </p>
        </div>
      </div>

      {/* ── 3. Overview Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-muted-foreground mb-1">Winning Contractor</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {ntp.supplierNameSnapshot || ntp.supplierName || '—'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {ntp.supplierAddressSnapshot || ntp.supplierAddress || 'No address provided'}
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-muted-foreground mb-1">Contracted Amount</p>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(ntp.awardedAmountSnapshot ?? ntp.contractAmount)}
          </p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            Contract: {ntp.contractNumberSnapshot || ntp.contractNumber || '—'}
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-muted-foreground mb-1">NTP Dates</p>
          <div className="space-y-0.5 text-xs">
            <div>
              <span className="text-muted-foreground">Issuance: </span>
              <span className="font-semibold">{formatDate(ntp.ntpDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Effectivity: </span>
              <span className="font-medium">{formatDate(ntp.effectivityDate)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-muted-foreground mb-1">Period & Site</p>
          <div className="space-y-0.5 text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {ntp.implementationPeriodText || (ntp.implementationPeriodDays ? `${ntp.implementationPeriodDays} Calendar Days` : 'As per Contract')}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {ntp.placeOfDelivery || 'Designated Delivery Site'}
            </p>
          </div>
        </Card>
      </div>

      {/* ── 4. Conforme / Receipt Section (If Received) ───────────────────── */}
      {isReceived && (
        <Card className="p-5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
              Contractor Conforme / Official Receipt
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Authorized Representative:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {ntp.conformeName || (ntp.receivedByName?.includes('(') ? ntp.receivedByName.split('(')[0]?.trim() : ntp.receivedByName) || '—'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Designation / Capacity:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {ntp.conformeDesignation || (ntp.receivedByName?.includes('(') ? ntp.receivedByName.split('(')[1]?.replace(')', '').trim() : undefined) || 'Authorized Representative'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Date Received / Conforme:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(ntp.conformeDate || ntp.receivedDate || ntp.receivedAt)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ── 5. Cancellation Banner (If Cancelled) ─────────────────────────── */}
      {isCancelled && (
        <Card className="p-5 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
              Notice to Proceed Cancelled
            </h3>
          </div>
          <div className="space-y-1 text-xs">
            <p><strong>Reason:</strong> {ntp.cancellationReason || 'No reason provided'}</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Cancelled on {formatDate(ntp.cancelledDate)} by {ntp.cancelledBy || 'Authorized Official'}
            </p>
          </div>
        </Card>
      )}

      {/* ── 6. Frozen Snapshots Card (When Issued or Received) ─────────────── */}
      {(isIssued || isReceived) && (
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Statutory Snapshot Audit (Frozen at Official Issuance)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-[11px] text-muted-foreground block">Snapshot Contract Number:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{ntp.contractNumberSnapshot || '—'}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Snapshot Awarded Amount:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(ntp.awardedAmountSnapshot)}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Snapshot Supplier:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{ntp.supplierNameSnapshot || '—'}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Contract Approved Date:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatDate(ntp.contractApprovedDateSnapshot)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── 7. Scope & Line Items ─────────────────────────────────────────── */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Contract Line Items & Deliverables
        </h2>
        <NTPDetailsTable lineItems={ntp.lineItems || []} />
      </Card>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      <EditNTPDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        ntp={ntp}
        onConfirm={handleConfirmEdit}
        isSubmitting={updateMutation.isPending}
      />

      <IssueNoticeToProceedDialog
        open={isIssueOpen}
        onOpenChange={setIsIssueOpen}
        ntp={ntp}
        onConfirm={handleConfirmIssue}
        isSubmitting={issueMutation.isPending}
      />

      <RecordNoticeToProceedReceiptDialog
        open={isRecordOpen}
        onOpenChange={setIsRecordOpen}
        ntp={ntp}
        onConfirm={handleConfirmRecord}
        isSubmitting={recordMutation.isPending}
      />

      <CancelNoticeToProceedDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        ntp={ntp}
        onConfirm={handleConfirmCancel}
        isSubmitting={cancelMutation.isPending}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft Notice to Proceed?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete draft Notice to Proceed {ntp.ntpNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete NTP'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Pop-up Preview Dialog */}
      <Dialog
        open={previewModal.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            if (previewModal.blobUrl) {
              URL.revokeObjectURL(previewModal.blobUrl)
            }
            setPreviewModal({ open: false, blobUrl: null, title: '' })
          }
        }}
      >
        <DialogContent size="4xl" className="h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900">
          <DialogHeader className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{previewModal.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-950 p-2">
            {previewModal.blobUrl && (
              <iframe
                src={previewModal.blobUrl}
                className="w-full h-full rounded border-0"
                title={previewModal.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
