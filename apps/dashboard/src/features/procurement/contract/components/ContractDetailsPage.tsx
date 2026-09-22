import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
  Check,
  ArrowLeft,
  Building2,
  FileText,
  Send,
  CheckCircle2,
  Download,
  Printer,
  MoreHorizontal,
  Clock,
  RotateCcw,
  ShieldCheck,
  Eye,
  Edit,
  ExternalLink,
  Link2,
  List,
  RefreshCw,
  PlayCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { uploadedNoaFilesMap } from '../../notice-of-award/data/mockNoticeOfAwardData'
import { printNoticeOfAwardRequest } from '../../notice-of-award/handlers'
import {
  useGetContractById,
  useSubmitContract,
  useGenerateContractDocument,
  useApproveContract,
  useReturnContract,
} from '../handlers/hooks'
import { printContractRequest } from '../handlers/printContractRequest'
import { getContractPdfRequest } from '../handlers/getContractPdfRequest'
import { CreateContractModal } from './CreateContractModal'
import { useGetNoticeToProceedByContractId, CreateNTPDialog } from '../../ntp'
import type { ContractDetail, ContractLineItem } from '../types'

interface ContractDetailsPageProps {
  contractId: string
  onBack?: () => void
  isManageContracts?: boolean
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number') return '—'
  return value.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  })
}

function getStatusBadge(status: string) {
  const norm = status.toLowerCase().replace(/[^a-z]/g, '')

  if (norm === 'forapproval' || norm === 'submitted') {
    return (
      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        For Approval
      </Badge>
    )
  }

  if (norm === 'approved' || norm === 'executed') {
    return (
      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        {norm === 'executed' ? 'Executed' : 'Approved'}
      </Badge>
    )
  }

  if (norm === 'returned' || norm === 'rejected') {
    return (
      <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
        Returned for Revision
      </Badge>
    )
  }

  if (norm === 'cancelled') {
    return (
      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        Cancelled
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      Draft
    </Badge>
  )
}

function DefinitionRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-2 ${className || ''}`}>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 sm:w-44">{label}</span>
      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-right flex-1 break-words">
        {children}
      </div>
    </div>
  )
}

export function ContractDetailsPage({
  contractId,
  onBack,
  isManageContracts,
}: ContractDetailsPageProps) {
  const { data: contractApiResponse, isLoading, refetch } = useGetContractById(contractId)
  const contract: ContractDetail | null = contractApiResponse ?? null
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('overview')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false)

  // Document Pop-up Preview state
  const [previewModal, setPreviewModal] = useState<{
    open: boolean
    title: string
    blobUrl: string | null
    blob: Blob | null
  }>({
    open: false,
    title: '',
    blobUrl: null,
    blob: null,
  })

  const submitMutation = useSubmitContract()
  const generateDocMutation = useGenerateContractDocument()
  const approveMutation = useApproveContract()
  const returnMutation = useReturnContract()

  // NTP query for this contract
  const { data: ntp, refetch: refetchNtp } = useGetNoticeToProceedByContractId(contract?.id)
  const [isCreateNtpOpen, setIsCreateNtpOpen] = useState(false)

  const [approvalDialogState, setApprovalDialogState] = useState<{
    open: boolean
    action: 'approve' | 'return'
    remarks: string
  }>({
    open: false,
    action: 'approve',
    remarks: '',
  })

  const isApprovalLoading = approveMutation.isPending || returnMutation.isPending

  // Only show Approve & Return actions in Manage Contracts context
  const canApproveOrReturn =
    isManageContracts !== undefined
      ? isManageContracts
      : typeof window !== 'undefined' && window.location.pathname.includes('manage-contracts')

  // Scroll spy to highlight active anchor as user scrolls
  useEffect(() => {
    const sectionIds = ['overview', 'awarded-items', 'documents', 'milestones']
    const handleScroll = () => {
      // Global header ~64px + nav ~44px + buffer
      const triggerOffset = 150
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= triggerOffset) {
            setActiveSection(sectionIds[i])
            return
          }
        }
      }
      setActiveSection('overview')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleConfirmApprovalAction = async () => {
    if (!contract) return
    try {
      if (approvalDialogState.action === 'approve') {
        await approveMutation.mutateAsync({
          id: contract.id,
          payload: { remarks: approvalDialogState.remarks.trim() || undefined },
        })
        toast({
          title: 'Contract Approved',
          description: `${contract.contractNumber} has been approved successfully.`,
        })
      } else {
        if (approvalDialogState.remarks.trim().length < 10) {
          toast({
            variant: 'destructive',
            title: 'Remarks Required',
            description: 'Return remarks must be at least 10 characters.',
          })
          return
        }
        await returnMutation.mutateAsync({
          id: contract.id,
          payload: { remarks: approvalDialogState.remarks.trim() },
        })
        toast({
          title: 'Contract Returned',
          description: `${contract.contractNumber} has been returned for revision.`,
        })
      }
      setApprovalDialogState({ open: false, action: 'approve', remarks: '' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: approvalDialogState.action === 'approve' ? 'Approval Failed' : 'Return Failed',
        description: err instanceof Error ? err.message : 'Action could not be completed.',
      })
    }
  }

  const items: ContractLineItem[] = contract?.items ?? []
  const totalAmount = useMemo(() => {
    if (contract?.totalAmount) return contract.totalAmount
    return items.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }, [contract?.totalAmount, items])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 space-y-2">
        <Clock className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading contract details...</span>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="w-full space-y-6 pb-10">
        {onBack && (
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-0 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contracts
            </Button>
          </div>
        )}
        <Card className="p-8 text-center border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Contract not found or could not be loaded.</p>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
              Return to Manage Contracts
            </Button>
          )}
        </Card>
      </div>
    )
  }

  const normalStatus = contract.status.toLowerCase().replace(/[^a-z]/g, '')
  const isForApproval = normalStatus === 'forapproval' || normalStatus === 'submitted'
  const isDraft = normalStatus === 'draft'
  const isReturned = normalStatus === 'returned' || normalStatus === 'rejected'
  const isApprovedOrExecuted = normalStatus === 'approved' || normalStatus === 'executed'

  const modeOfProcurement = contract.modeOfProcurement ?? 'Public Bidding - Goods'

  const openPreviewModal = (blob: Blob, title: string) => {
    const url = URL.createObjectURL(blob)
    setPreviewModal({
      open: true,
      title,
      blobUrl: url,
      blob,
    })
  }

  const closePreviewModal = () => {
    if (previewModal.blobUrl) {
      URL.revokeObjectURL(previewModal.blobUrl)
    }
    setPreviewModal({
      open: false,
      title: '',
      blobUrl: null,
      blob: null,
    })
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePreviewContract = async () => {
    try {
      toast({
        title: 'Loading Preview',
        description: 'Generating document preview...',
      })
      const result = await printContractRequest.fetcher(contract)
      openPreviewModal(result.blob, `${contract.contractNumber}_Contract_Agreement`)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Preview Failed',
        description: err instanceof Error ? err.message : 'Could not generate document preview.',
      })
    }
  }

  const handlePrintContract = async () => {
    try {
      toast({
        title: 'Preparing Document',
        description: 'Opening document preview...',
      })
      const result = await printContractRequest.fetcher(contract)
      openPreviewModal(result.blob, `${contract.contractNumber}_Contract_Agreement`)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Printing Failed',
        description: err instanceof Error ? err.message : 'Could not generate printable document.',
      })
    }
  }

  const handleDownloadPdf = async () => {
    try {
      toast({
        title: 'Downloading Contract',
        description: 'Fetching authoritative PDF document...',
      })
      const result = await getContractPdfRequest.fetcher({ contractId, contractNumber: contract.contractNumber })
      const fileName = `${contract.contractNumber}_Contract_Agreement.pdf`
      downloadBlob(result.blob, fileName)
      toast({
        title: 'Download Ready',
        description: `Saved ${fileName}`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: err instanceof Error ? err.message : 'Could not download contract PDF.',
      })
    }
  }

  const handleGenerateOfficialDocument = async () => {
    setIsGeneratingDoc(true)
    try {
      toast({
        title: 'Generating Document',
        description: 'Server is compiling contract clauses, line items, and signatories...',
      })
      await generateDocMutation.mutateAsync(contract.id)
      toast({
        title: 'Document Generated',
        description: `Official document for ${contract.contractNumber} archived.`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: err instanceof Error ? err.message : 'Failed to generate official contract.',
      })
    } finally {
      setIsGeneratingDoc(false)
    }
  }

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(contractId)
      toast({
        title: 'Contract Submitted',
        description: `${contract.contractNumber} has been submitted for approval.`,
      })
      setShowSubmitDialog(false)
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err instanceof Error ? err.message : 'Failed to submit contract.',
        variant: 'destructive',
      })
    }
  }

  const handlePreviewNoaPdf = async (noaId: string, errorDescription: string) => {
    try {
      toast({
        title: 'Loading Preview',
        description: 'Fetching Notice of Award...',
      })
      const result = await printNoticeOfAwardRequest.fetcher({
        noaId,
      })
      openPreviewModal(result.blob, uploadedNoaFile.replace('.pdf', ''))
    } catch (error) {
      toast({
        title: 'Unable to open document',
        description: error instanceof Error ? error.message : errorDescription,
      })
    }
  }

  const uploadedNoaFile =
    (contract.noticeOfAwardId && uploadedNoaFilesMap.get(contract.noticeOfAwardId)?.name) ||
    `${contract.noaNumber || 'NOA-2026-003'}_Official_Notice_of_Award.pdf`

  return (
    <div className="w-full space-y-6 pb-16">
      {/* ── 1. Boxed Contract Header ───────────────────────────────────────── */}
      <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 space-y-4">
        {onBack && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-0 h-auto gap-1.5 font-medium text-xs -ml-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Contracts
            </Button>
          </div>
        )}

        {/* Compact Header with Authoritative Action Cluster */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {contract.contractNumber}
              </h1>
              {getStatusBadge(contract.status)}
              <Badge variant="outline" className="bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs font-medium px-2.5 py-0.5">
                {modeOfProcurement}
              </Badge>
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs font-normal px-2 py-0.5">
                RA 12009 (NGPA)
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed text-justify">
              {contract.description || 'This document constitutes a standard procurement contract establishing the legally binding terms and conditions between the Purchaser and the Supplier for the acquisition, delivery, installation, and maintenance of office equipment.'}
            </p>
          </div>

          {/* Right-side Action Cluster (Approve/Return visible ONLY in Manage Contracts) */}
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {isForApproval && canApproveOrReturn && (
              <>
                <Button
                  size="sm"
                  onClick={() =>
                    setApprovalDialogState({ open: true, action: 'approve', remarks: '' })
                  }
                  className="gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Contract</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApprovalDialogState({ open: true, action: 'return', remarks: '' })
                  }
                  className="gap-1.5 h-9 px-3.5 text-xs font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Return Contract</span>
                </Button>
              </>
            )}

            {(isDraft || isReturned) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="gap-1.5 h-9 px-3.5 text-xs font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Edit Contract</span>
                </Button>

                {!canApproveOrReturn && (
                  <Button
                    size="sm"
                    onClick={() => setShowSubmitDialog(true)}
                    className="gap-1.5 h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Approval</span>
                  </Button>
                )}
              </>
            )}

            {isApprovedOrExecuted && (
              <>
                {ntp ? (
                  <Link
                    to="/v2/notice-to-proceed-ntp/$ntpId"
                    params={{ ntpId: ntp.id }}
                    className="inline-flex"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-9 px-3.5 text-xs font-semibold border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 shadow-2xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>NTP: {ntp.ntpNumber} ({ntp.status})</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateNtpOpen(true)}
                    className="gap-1.5 h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Issue Notice to Proceed</span>
                  </Button>
                )}
              </>
            )}

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900" title="More Actions">
                  <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <DropdownMenuLabel className="text-xs text-slate-700 dark:text-slate-300">Contract Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                {(isDraft || isReturned) && (
                  <DropdownMenuItem onClick={() => setShowEditModal(true)} className="gap-2 text-xs focus:bg-slate-100 dark:focus:bg-slate-800">
                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Edit Contract Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handlePreviewContract} className="gap-2 text-xs focus:bg-slate-100 dark:focus:bg-slate-800">
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Preview Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrintContract} className="gap-2 text-xs focus:bg-slate-100 dark:focus:bg-slate-800">
                  <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Print / Save as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf} className="gap-2 text-xs focus:bg-slate-100 dark:focus:bg-slate-800">
                  <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Download Official PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleGenerateOfficialDocument}
                  disabled={isGeneratingDoc}
                  className="gap-2 text-xs focus:bg-slate-100 dark:focus:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Generate Document Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* ── 2. Approval Banner (Informational Only — No Duplicate Buttons) ────── */}
      {isForApproval && (
        <div className="border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 rounded-lg px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded">
              UNDER REVIEW
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Submitted {formatDate(contract.submittedAt || contract.createdAt)} — Awaiting review by the Head of the Procuring Entity (HoPE).
            </span>
          </div>
        </div>
      )}

      {isReturned && (
        <div className="border border-rose-200 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/30 rounded-lg px-4 py-3 text-xs text-rose-900 dark:text-rose-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-bold uppercase tracking-wider text-[11px] bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 px-2 py-0.5 rounded shrink-0">
                RETURNED FOR REVISION
              </span>
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Remarks:</strong> {contract.returnRemarks || 'Please review the requested changes and re-submit.'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="self-start sm:self-auto h-7 px-2.5 text-xs font-medium border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 bg-white dark:bg-slate-900 shrink-0"
            >
              <Edit className="w-3 h-3 mr-1.5" />
              Edit Details
            </Button>
          </div>
        </div>
      )}

      {/* ── 3. Compact Horizontal "Contract at a Glance" Strip ──────────────── */}
      <div className="border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="p-4 sm:px-5 sm:py-3.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Awarded Supplier</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 truncate" title={contract.supplierName}>
              {contract.supplierName}
            </p>
          </div>
          <div className="p-4 sm:px-5 sm:py-3.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contract Amount</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 truncate" title={formatCurrency(totalAmount)}>
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="p-4 sm:px-5 sm:py-3.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contract Date</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 truncate" title={formatDate(contract.contractDate)}>
              {formatDate(contract.contractDate)}
            </p>
          </div>
          <div className="p-4 sm:px-5 sm:py-3.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Linked NOA</p>
            {contract.noticeOfAwardId ? (
              <Link
                to="/v2/notice-of-award-noa/$noaId"
                params={{ noaId: contract.noticeOfAwardId }}
                className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 truncate flex items-center gap-1"
                title={contract.noaNumber || 'NOA'}
              >
                <span className="truncate">{contract.noaNumber || 'NOA-2026-003'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </Link>
            ) : (
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">—</p>
            )}
          </div>
          <div className="p-4 sm:px-5 sm:py-3.5 min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BAC Resolution</p>
            <Link
              to="/v2/bac-resolutions"
              className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 truncate flex items-center gap-1"
              title={contract.bacResolutionNumber || 'BAC-RES-2026-MEARB-001'}
            >
              <span className="truncate">{contract.bacResolutionNumber || 'BAC-RES-2026-MEARB-001'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. Left-Aligned Sticky In-Page Section Navigation ────────────────── */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 -mx-1 px-1 py-1.5 transition-all">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar" aria-label="Document Sections">
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0',
              activeSection === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('awarded-items')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0',
              activeSection === 'awarded-items'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            <List className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Awarded Items ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('documents')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0',
              activeSection === 'documents'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Documents &amp; PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('milestones')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0',
              activeSection === 'milestones'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Milestones &amp; Audit</span>
          </button>
        </nav>
      </div>

      {/* ── 5. Continuous Document Content ───────────────────────────────────── */}
      <div className="space-y-8">
        {/* Section 1: Overview (#overview) */}
        <div id="overview" className="scroll-mt-32 space-y-4">
          {/* Row 1: Contract Information ↔ Awarded Supplier (Strict Equal Height) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Card 1: Contract Information */}
            <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg flex flex-col h-full overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Contract Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                <DefinitionRow label="Contract Number">
                  <span className="text-slate-900 dark:text-slate-100">{contract.contractNumber}</span>
                </DefinitionRow>
                <DefinitionRow label="Status">
                  {getStatusBadge(contract.status)}
                </DefinitionRow>
                <DefinitionRow label="Contract Date">
                  {formatDate(contract.contractDate)}
                </DefinitionRow>
                <DefinitionRow label="Procurement Mode">
                  {modeOfProcurement}
                </DefinitionRow>
                <DefinitionRow label="Contract Scope">
                  <span className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed">
                    {contract.projectTitle || contract.description || '—'}
                  </span>
                </DefinitionRow>
                <DefinitionRow label="Legal Basis">
                  New Government Procurement Act (NGPA)
                </DefinitionRow>
              </CardContent>
            </Card>

            {/* Card 2: Awarded Supplier */}
            <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg flex flex-col h-full overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Awarded Supplier
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                <DefinitionRow label="Company Name">
                  {contract.supplierName}
                </DefinitionRow>
                <DefinitionRow label="Authorized Representative">
                  {contract.supplierContactPerson || '—'}
                </DefinitionRow>
                <DefinitionRow label="Contact Number">
                  {contract.supplierContactNumber || '—'}
                </DefinitionRow>
                <DefinitionRow label="Official Office Address">
                  <span className="font-normal text-slate-700 dark:text-slate-300 leading-relaxed">
                    {contract.supplierAddress || '—'}
                  </span>
                </DefinitionRow>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Procurement Lineage ↔ Approval & Signatories (Strict Equal Height) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Card 3: Procurement Lineage */}
            <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg flex flex-col h-full overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Procurement Lineage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                <DefinitionRow label="Project">
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">{contract.projectTitle || '—'}</span>
                </DefinitionRow>
                <DefinitionRow label="NOA">
                  {contract.noticeOfAwardId ? (
                    <Link
                      to="/v2/notice-of-award-noa/$noaId"
                      params={{ noaId: contract.noticeOfAwardId }}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>{contract.noaNumber || 'NOA-2026-003'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">—</span>
                  )}
                </DefinitionRow>
                <DefinitionRow label="BAC Resolution">
                  <Link
                    to="/v2/bac-resolutions"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>{contract.bacResolutionNumber || 'BAC-RES-2026-MEARB-001'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </DefinitionRow>
                <DefinitionRow label="Award / Evaluation Reference">
                  MEARB Resolution - {formatDate(contract.noaDate || contract.contractDate)}
                </DefinitionRow>
              </CardContent>
            </Card>

            {/* Card 4: Approval & Signatories */}
            <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg flex flex-col h-full overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Approval &amp; Signatories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                <DefinitionRow label="Approval Status">
                  {getStatusBadge(contract.status)}
                </DefinitionRow>
                <DefinitionRow label="Required Approver">
                  Head of the Procuring Entity (HoPE)
                </DefinitionRow>
                <DefinitionRow label="Approving Official">
                  {contract.approvedByName || '—'}
                </DefinitionRow>
                <DefinitionRow label="Signatory">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {contract.supplierContactPerson || '—'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Authorized Representative
                    </p>
                  </div>
                </DefinitionRow>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: Awarded Line Items (#awarded-items) */}
        <div id="awarded-items" className="scroll-mt-32 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Awarded Line Items ({items.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Official schedule of awarded requirements (Annex &quot;A&quot;)</span>
          </div>

          <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-800/60">
                    <TableRow className="border-b border-slate-200 dark:border-slate-800">
                      <TableHead className="w-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">#</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[240px]">Description</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</TableHead>
                      <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Unit</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-700 dark:text-slate-300">Unit Price</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-700 dark:text-slate-300">Awarded Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                          No line items found for this contract.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                          <TableCell className="text-center font-medium text-xs text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                            <div className="font-semibold text-xs">{item.itemName}</div>
                            {item.specifications && item.specifications !== item.itemName && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {item.specifications}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                            {item.category || 'Goods & Services'}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                            {item.unitOfMeasure}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Total Summary Footer */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Total items: <strong>{items.length}</strong> • Inherited authoritatively from Notice of Award
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Contract Amount:</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Documents & PDF (#documents) */}
        <div id="documents" className="scroll-mt-32 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Documents &amp; Contract PDF
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Official contract document and procurement attachments</span>
          </div>

          <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
            <CardContent className="p-4 sm:p-5 space-y-3">
              {/* Document 1: Contract Agreement (Main File) */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {contract.contractNumber}_Contract_Agreement.pdf
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Official Bilateral Contract Agreement (SF-GOOD-66) with Annex &quot;A&quot; Line Items.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] py-0">
                        Standard Form
                      </Badge>
                      <span>Format: PDF (A4)</span>
                      <span>•</span>
                      <span>Date: {formatDate(contract.contractDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePreviewContract}
                    className="h-8 px-3 text-xs gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                    title="Pop-up Document Preview"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Preview Document</span>
                  </Button>
                  <Button
                    onClick={handleGenerateOfficialDocument}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingDoc}
                    className="h-8 px-3 text-xs gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{isGeneratingDoc ? 'Archiving...' : 'Archive / Re-generate'}</span>
                  </Button>
                  <Button
                    onClick={handleDownloadPdf}
                    size="sm"
                    className="h-8 px-3.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>

              {/* Document 2: Linked Notice of Award (NOA) */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {uploadedNoaFile}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Authoritative Notice of Award issued to winning bidder.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] py-0">
                        Notice of Award
                      </Badge>
                      <span>NOA Date: {formatDate(contract.noaDate || contract.contractDate)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreviewNoaPdf(contract.noticeOfAwardId, 'Could not open NOA PDF.')}
                  className="h-8 px-3 text-xs gap-1.5 shrink-0 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Preview NOA</span>
                </Button>
              </div>

              {/* Document 3: BAC Resolution */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4.5 w-4.5 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {contract.bacResolutionNumber || 'BAC-RES-2026-MEARB-001'}.pdf
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bids and Awards Committee resolution recommending award of contract.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] py-0">
                        BAC Resolution
                      </Badge>
                      <span>Resolution No: {contract.bacResolutionNumber || 'BAC-RES-2026-MEARB-001'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreviewContract}
                  className="h-8 px-3 text-xs gap-1.5 shrink-0 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Preview Resolution</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Milestones & Audit (#milestones) */}
        <div id="milestones" className="scroll-mt-32 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Milestones &amp; Audit
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Chronological lifecycle and authorization trail</span>
          </div>

          <Card className="border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {/* Milestone 1: Draft Created */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Draft Contract Created</h4>
                      <Badge variant="outline" className="text-[10px] py-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">Initiation</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Contract {contract.contractNumber} was initialized from Notice of Award {contract.noaNumber}.
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{formatDate(contract.createdAt)}</span>
                      <span>•</span>
                      <span>By {contract.createdByName || 'Procurement Officer'}</span>
                    </div>
                  </div>
                </div>

                {/* Milestone 2: Submitted for Approval */}
                {(contract.submittedAt || !isDraft) && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Submitted for Review &amp; Approval</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">Pending HoPE</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Formal review workflow triggered for bilateral agreement terms and line items.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.submittedAt || contract.createdAt)}</span>
                        <span>•</span>
                        <span>Approver: Head of the Procuring Entity (HoPE)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 3: Approved */}
                {contract.approvedAt && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Contract Approved</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Authorized</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Formally authorized by {contract.approvedByName || 'Head of the Procuring Entity'}.
                        {contract.approvalRemarks && ` Remarks: "${contract.approvalRemarks}"`}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.approvedAt)}</span>
                        <span>•</span>
                        <span>By {contract.approvedByName || 'HoPE'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 4: Returned */}
                {contract.returnedAt && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Returned for Revision</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800">Returned</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Remarks: &quot;{contract.returnRemarks}&quot;
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.returnedAt)}</span>
                        <span>•</span>
                        <span>By {contract.returnedByName || 'Approving Authority'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 5: Conforme Receipt */}
                {contract.conformeReceivedAt && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-teal-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">NOA Conforme Received</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800">Milestone</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Supplier formally acknowledged and signed the Notice of Award conforme.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.conformeReceivedAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 6: Performance Security Posted */}
                {contract.performanceSecurityPostedAt && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Performance Security Posted</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">Compliance</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Performance bond / security validated and posted within statutory window.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.performanceSecurityPostedAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 7: Contract Executed */}
                {(contract.contractExecutedMilestoneAt || contract.executedAt) && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Contract Bilaterally Executed</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Executed</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bilateral agreement fully signed and executed. Ready for Notice to Proceed (NTP).
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatDate(contract.contractExecutedMilestoneAt || contract.executedAt)}</span>
                        {contract.executedByName && (
                          <>
                            <span>•</span>
                            <span>By {contract.executedByName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone 8: Notice to Proceed */}
                {ntp ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Notice to Proceed (NTP)</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                          {ntp.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Official NTP {ntp.ntpNumber} issued under RA 12009 Sec. 66.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>Issued: {formatDate(ntp.ntpDate)}</span>
                        {ntp.conformeDate && <span>• Conforme: {formatDate(ntp.conformeDate)}</span>}
                        <Link
                          to="/v2/notice-to-proceed-ntp/$ntpId"
                          params={{ ntpId: ntp.id }}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-1"
                        >
                          View NTP Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : isApprovedOrExecuted ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-2xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Notice to Proceed (Pending)</h4>
                        <Badge variant="outline" className="text-[10px] py-0 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                          Pending Issuance
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mandated within 3 calendar days from contract approval under RA 12009 Sec. 66.
                      </p>
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsCreateNtpOpen(true)}
                          className="h-7 px-2.5 text-xs text-indigo-700 border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100"
                        >
                          <PlayCircle className="w-3.5 h-3.5 mr-1" />
                          Issue Notice to Proceed
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Document Pop-up Preview Dialog ─────────────────────────────────── */}
      <Dialog
        open={previewModal.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closePreviewModal()
          }
        }}
      >
        <DialogContent size="4xl" className="h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {previewModal.title}
            </DialogTitle>
            {previewModal.blob && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  downloadBlob(
                    previewModal.blob!,
                    `${previewModal.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
                  )
                }
                className="mr-6 h-7 px-2.5 text-xs gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-950 p-2 overflow-hidden">
            {previewModal.blobUrl ? (
              <iframe
                src={previewModal.blobUrl}
                className="w-full h-full rounded border border-slate-200 dark:border-slate-800 bg-white"
                title={previewModal.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Loading document preview...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LIB Approval / Return Dialog ───────────────────────────────────── */}
      <AlertDialog
        open={approvalDialogState.open}
        onOpenChange={(isOpen) =>
          !isOpen && setApprovalDialogState((prev) => ({ ...prev, open: false }))
        }
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className={approvalDialogState.action === 'approve' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
              {approvalDialogState.action === 'approve' ? 'Approve Contract?' : 'Return Contract?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {approvalDialogState.action === 'approve'
                ? `Are you sure you want to approve "${contract.contractNumber}"? This action will update the contract status to Approved.`
                : `Are you sure you want to return "${contract.contractNumber}"? This action will set the status to Returned so the team can revise and resubmit.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {approvalDialogState.action === 'return' ? (
            <div className="space-y-2 py-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Return Remarks / Reason <span className="text-rose-500">*</span>
              </label>
              <Textarea
                placeholder="Explain the reason for returning this contract (at least 10 characters)..."
                value={approvalDialogState.remarks}
                onChange={(e) =>
                  setApprovalDialogState((prev) => ({ ...prev, remarks: e.target.value }))
                }
                rows={3}
                className="resize-none text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Minimum 10 characters required. The initiator will receive these notes.
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Approval Remarks <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Add optional notes or authorization remarks..."
                value={approvalDialogState.remarks}
                onChange={(e) =>
                  setApprovalDialogState((prev) => ({ ...prev, remarks: e.target.value }))
                }
                rows={2}
                className="resize-none text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isApprovalLoading} className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmApprovalAction()
              }}
              disabled={
                isApprovalLoading ||
                (approvalDialogState.action === 'return' &&
                  approvalDialogState.remarks.trim().length < 10)
              }
              className={
                approvalDialogState.action === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium'
                  : 'bg-amber-600 hover:bg-amber-700 text-white font-medium'
              }
            >
              {isApprovalLoading
                ? 'Processing...'
                : approvalDialogState.action === 'approve'
                  ? 'Approve Contract'
                  : 'Return Contract'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Submit Contract for Approval</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to submit contract {contract.contractNumber} for formal internal review? Once submitted, line items and terms cannot be edited while pending review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Confirm Submission'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Contract Modal */}
      {contract && (
        <CreateContractModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          initialContract={contract}
          onSuccess={() => {
            void refetch()
          }}
        />
      )}

      {/* Create Notice to Proceed Dialog */}
      {contract && (
        <CreateNTPDialog
          open={isCreateNtpOpen}
          onOpenChange={setIsCreateNtpOpen}
          contractId={contract.id}
          onSuccess={() => {
            void refetchNtp()
          }}
        />
      )}
    </div>
  )
}
