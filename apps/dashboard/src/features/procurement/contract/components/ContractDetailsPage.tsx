import { useState, type ReactNode } from 'react'
import { useContractStore } from '../store/contractStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
  ChevronLeft,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  Send,
  CheckCircle2,
  Layers,
  Download,
  Hash,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Eye,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import {
  uploadedMilestoneFilesMap,
  uploadedNoaFilesMap,
} from '../../notice-of-award/data/mockNoticeOfAwardData'
import { printNoticeOfAwardRequest } from '../../notice-of-award/handlers'
import { getNoaMilestoneDate } from '../../notice-of-award/utils/noaContractExecutionSla'
import type {
  NoticeOfAward,
  NoticeOfAwardMilestone,
} from '../../notice-of-award/types'

interface ContractDetailsPageProps {
  contractId: string
  onBack?: () => void
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(value?: number | null) {
  if (typeof value !== 'number') return '—'

  return value.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  })
}

function formatNoaType(type?: string | null) {
  switch (type) {
    case 'goods-services':
      return 'Goods and Services'
    case 'infrastructure':
      return 'Infrastructure'
    case 'consulting':
      return 'Consulting'
    default:
      return type || '—'
  }
}

function formatAwardCriterion(value?: string | null) {
  switch (value) {
    case 'LCRB':
      return 'LCRB (Lowest Calculated Responsive Bid)'
    case 'MEARB':
      return 'MEARB (Most Economically Advantageous Responsive Bid)'
    default:
      return value || '—'
  }
}

function formatText(value?: string | null) {
  return value && value.trim() ? value : '—'
}

function NoaDetailItem({
  label,
  value,
  icon,
  valueClassName,
  className,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  valueClassName?: string
  className?: string
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-default-200 bg-default-50/40 p-3 ${className || ''}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-default-200 bg-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </p>
        <div
          className={`mt-1 break-words text-sm font-semibold text-default-900 ${valueClassName || ''}`}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

function NoaDocumentLink({
  fileName,
  onView,
}: {
  fileName?: string | null
  onView: () => void
}) {
  if (!fileName) return <>—</>

  return (
    <button
      type="button"
      onClick={onView}
      className="flex max-w-full items-center gap-2 rounded-md border border-default-200 bg-background px-2.5 py-1.5 text-left text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-xs font-bold underline">
        {fileName}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-default-500">
        <Eye className="h-3.5 w-3.5" />
        View
      </span>
    </button>
  )
}

/**
 * ContractDetailsPage
 *
 * Displays a read-only view of a Contract and its linked NOA-derived details.
 * Contract creation is limited to linking an approved NOA; bid entry belongs to
 * the earlier procurement stages and is not edited here.
 */
export function ContractDetailsPage({
  contractId,
  onBack,
}: ContractDetailsPageProps) {
  const { contracts, updateContract, getNOAById } = useContractStore()
  const contract = contracts.find((c) => c.id === contractId)
  const { toast } = useToast()
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Status badge config (match RFQ styling)
  const STATUS_BADGE_CONFIG: Record<
    string,
    { label?: string; color?: any; variant?: any }
  > = {
    draft: { label: 'Draft', color: 'secondary' },
    'for-approval': {
      label: 'For Approval',
      color: 'info',
      variant: 'outline',
    },
    approved: { label: 'Approved', color: 'success', variant: 'outline' },
    returned: { label: 'Returned', color: 'destructive', variant: 'outline' },
  }

  if (!contract) return <div>Contract not found</div>

  const linkedNoticeOfAward =
    contract.linkedNoticeOfAward ??
    getNOAById(contract.noaId)?.linkedNoticeOfAward
  const modeOfProcurement =
    contract.modeOfProcurement ??
    linkedNoticeOfAward?.linkedConsolidatedPr.modeOfProcurement
  const totalAmount = contract.items.reduce(
    (sum, item) => sum + item.totalAmount,
    0,
  )

  const handleSubmit = () => {
    updateContract(contractId, { status: 'for-approval' })
    toast({
      title: 'Contract Submitted',
      description: `${contract.contractNumber} has been submitted for approval.`,
    })
    setShowSubmitDialog(false)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const openBlobInNewTab = (blob: Blob) => {
    const fileUrl = URL.createObjectURL(blob)
    window.open(fileUrl, '_blank')
  }

  const handleViewNoaPdf = async (
    noticeOfAward: NoticeOfAward,
    errorDescription: string,
  ) => {
    try {
      const result = await printNoticeOfAwardRequest.fetcher({
        noaId: noticeOfAward.id,
      })
      openBlobInNewTab(result.blob)
    } catch (error) {
      toast({
        title: 'Unable to open document',
        description: error instanceof Error ? error.message : errorDescription,
      })
    }
  }

  const handleViewSignedNoaDocument = async (noticeOfAward: NoticeOfAward) => {
    const storedFile = uploadedNoaFilesMap.get(noticeOfAward.id)

    if (storedFile) {
      openBlobInNewTab(storedFile)
      return
    }

    await handleViewNoaPdf(
      noticeOfAward,
      'Failed to open the signed NOA document.',
    )
  }

  const handleViewMilestoneDocument = async (
    noticeOfAward: NoticeOfAward,
    milestone: NoticeOfAwardMilestone,
    fileName: string,
  ) => {
    const storedFile = uploadedMilestoneFilesMap.get(
      `${noticeOfAward.id}-${milestone}`,
    )

    if (storedFile) {
      openBlobInNewTab(storedFile)
      return
    }

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Notice of Award Milestone Document', 20, 20)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.text(`Document Name: ${fileName}`, 20, 35)
      doc.text(`Notice of Award No: ${noticeOfAward.noaNumber}`, 20, 45)
      doc.text(`Project Name: ${noticeOfAward.projectName}`, 20, 55)
      doc.text(`Winning Supplier: ${noticeOfAward.supplierName}`, 20, 65)
      doc.text(
        `Milestone: ${milestone.replace(/_/g, ' ').toUpperCase()}`,
        20,
        75,
      )
      doc.text(
        `Date Logged: ${getNoaMilestoneDate(noticeOfAward, milestone) ?? 'N/A'}`,
        20,
        85,
      )
      openBlobInNewTab(doc.output('blob'))
    } catch (error) {
      toast({
        title: 'Unable to open document',
        description: 'Failed to open the NOA milestone document.',
      })
    }
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back button */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Header card */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold m-0">
                  {contract.contractNumber}
                </h1>
                <Badge
                  color={STATUS_BADGE_CONFIG[contract.status]?.color}
                  variant={STATUS_BADGE_CONFIG[contract.status]?.variant}
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase"
                >
                  {STATUS_BADGE_CONFIG[contract.status]?.label}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {contract.category}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                {contract.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              {contract.status === 'draft' && (
                <AlertDialog
                  open={showSubmitDialog}
                  onOpenChange={setShowSubmitDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button className="gap-2">
                      <Send className="h-4 w-4" />
                      Submit for Approval
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Submit Contract for Approval
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit this contract for
                        approval? Once submitted, you won't be able to edit it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>Details from linked NOA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Date */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Contract Date
                </p>
                <p className="text-base font-semibold">
                  {formatDate(contract.contractDate)}
                </p>
              </div>
            </div>

            {/* Linked NOA */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Linked NOA
                </p>
                <p className="text-base font-semibold">{contract.noaNumber}</p>
              </div>
            </div>

            {/* Mode of Procurement */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Layers className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Mode of Procurement
                </p>
                <p className="text-base font-semibold">
                  {modeOfProcurement || '—'}
                </p>
                <Badge variant="outline" className="mt-1">
                  Read-only
                </Badge>
              </div>
            </div>

            {/* Supplier (Read-only) */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Supplier (from NOA)
                </p>
                <p className="text-base font-semibold">
                  {contract.supplierName}
                </p>
                <Badge variant="outline" className="mt-1">
                  Read-only
                </Badge>
              </div>
            </div>

            {/* WFP Scope */}
            {contract.wfpScope && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    WFP Scope
                  </p>
                  <p className="text-base font-semibold">
                    {contract.wfpScope === 'Project'
                      ? 'Project Level'
                      : 'Activity Level'}
                  </p>
                  {contract.wfpScope === 'Project' && contract.projectTitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Project: {contract.projectTitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Total Amount (Read-only) */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount (from NOA)
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  ₱ {contract.totalAmount.toLocaleString()}
                </p>
                <Badge variant="outline" className="mt-1">
                  Read-only
                </Badge>
              </div>
            </div>
          </div>

          {/* Remarks if returned */}
          {contract.status === 'returned' && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                Remarks from Approver:
              </p>
              <p className="text-sm">{contract.remarks}</p>
            </div>
          )}

          {/* Approval info if approved */}
          {contract.status === 'approved' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-600">
                  Contract Approved
                </p>
              </div>
              {contract.approvedBy && (
                <p className="text-sm text-muted-foreground">
                  Approved by: {contract.approvedBy}
                </p>
              )}
              {contract.approvedAt && (
                <p className="text-sm text-muted-foreground">
                  Approved on:{' '}
                  {new Date(contract.approvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {linkedNoticeOfAward && (
        <Card>
          <CardHeader>
            <CardTitle>Linked NOA Details</CardTitle>
            <CardDescription>
              Approved Manage NOA record linked to this contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <NoaDetailItem
                label="NOA Number"
                value={linkedNoticeOfAward.noaNumber}
                icon={<FileText className="h-4 w-4 text-blue-600" />}
              />
              <NoaDetailItem
                label="NOA Date"
                value={formatDate(linkedNoticeOfAward.date)}
                icon={<Calendar className="h-4 w-4 text-purple-600" />}
              />
              <NoaDetailItem
                label="Date Bid"
                value={formatDate(linkedNoticeOfAward.dateBid)}
                icon={<Clock3 className="h-4 w-4 text-purple-600" />}
              />
              <NoaDetailItem
                label="Type"
                value={formatNoaType(linkedNoticeOfAward.type)}
                icon={<Layers className="h-4 w-4 text-indigo-600" />}
              />
              <NoaDetailItem
                label="Status"
                value={
                  <Badge variant="outline" className="capitalize">
                    {linkedNoticeOfAward.status.replace(/-/g, ' ')}
                  </Badge>
                }
                icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
              />
              <NoaDetailItem
                label="Awarded Amount"
                value={formatCurrency(linkedNoticeOfAward.totalAmount)}
                icon={<DollarSign className="h-4 w-4 text-amber-600" />}
                valueClassName="text-amber-700"
              />
              <NoaDetailItem
                label="Description"
                value={formatText(linkedNoticeOfAward.description)}
                icon={<FileText className="h-4 w-4 text-default-600" />}
                className="md:col-span-2 xl:col-span-3"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-default-900">
                Award and Procurement References
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <NoaDetailItem
                  label="Winning Supplier"
                  value={linkedNoticeOfAward.supplierName}
                  icon={<Building2 className="h-4 w-4 text-emerald-600" />}
                />
                <NoaDetailItem
                  label="Award Criterion"
                  value={formatAwardCriterion(
                    linkedNoticeOfAward.linkedBacResolution.awardCriterion,
                  )}
                  icon={<FileCheck2 className="h-4 w-4 text-emerald-600" />}
                />
                <NoaDetailItem
                  label="Mode of Procurement"
                  value={
                    linkedNoticeOfAward.linkedConsolidatedPr.modeOfProcurement
                  }
                  icon={<Layers className="h-4 w-4 text-indigo-600" />}
                />
                <NoaDetailItem
                  label="BAC Resolution"
                  value={
                    linkedNoticeOfAward.linkedBacResolution.bacResolutionNumber
                  }
                  icon={<FileCheck2 className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="BAC Resolution Date"
                  value={formatDate(
                    linkedNoticeOfAward.linkedBacResolution.resolutionDate,
                  )}
                  icon={<Calendar className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="Source AOB"
                  value={formatText(
                    linkedNoticeOfAward.linkedBacResolution.sourceAobNumber,
                  )}
                  icon={<Hash className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="Post Qualification Date"
                  value={formatDate(
                    linkedNoticeOfAward.linkedBacResolution
                      .postQualificationDate,
                  )}
                  icon={<Calendar className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="Resolution Approved By"
                  value={formatText(
                    linkedNoticeOfAward.linkedBacResolution.approvedBy,
                  )}
                  icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="Resolution Approved At"
                  value={formatDate(
                    linkedNoticeOfAward.linkedBacResolution.approvedAt,
                  )}
                  icon={<Calendar className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="BAC Description"
                  value={formatText(
                    linkedNoticeOfAward.linkedBacResolution.description,
                  )}
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                  className="md:col-span-2 xl:col-span-3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-default-900">
                Consolidated PR and Project
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <NoaDetailItem
                  label="Consolidated PR"
                  value={linkedNoticeOfAward.linkedConsolidatedPr.prNumber}
                  icon={<FileText className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="End User"
                  value={linkedNoticeOfAward.linkedConsolidatedPr.endUser}
                  icon={<Building2 className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="Approved Budget"
                  value={formatCurrency(
                    linkedNoticeOfAward.linkedConsolidatedPr.approvedBudget,
                  )}
                  icon={<DollarSign className="h-4 w-4 text-amber-600" />}
                  valueClassName="text-amber-700"
                />
                <NoaDetailItem
                  label="Project"
                  value={linkedNoticeOfAward.projectName}
                  icon={<Building2 className="h-4 w-4 text-indigo-600" />}
                  className="md:col-span-2 xl:col-span-3"
                />
                <NoaDetailItem
                  label="Project Description"
                  value={formatText(linkedNoticeOfAward.projectDescription)}
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                  className="md:col-span-2 xl:col-span-3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-default-900">
                Issuance, SLA, and Documents
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <NoaDetailItem
                  label="NOA Approved By"
                  value={formatText(linkedNoticeOfAward.approvedBy)}
                  icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="NOA Approved At"
                  value={formatDate(linkedNoticeOfAward.approvedAt)}
                  icon={<Calendar className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="Issued At"
                  value={formatDate(linkedNoticeOfAward.issuedAt)}
                  icon={<Calendar className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="Contract Execution Deadline"
                  value={formatDate(
                    linkedNoticeOfAward.contractExecutionDeadline,
                  )}
                  icon={<Clock3 className="h-4 w-4 text-amber-600" />}
                />
                <NoaDetailItem
                  label="Conforme Received Date"
                  value={formatDate(linkedNoticeOfAward.conformeReceivedDate)}
                  icon={<FileCheck2 className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="Performance Security Posted"
                  value={formatDate(
                    linkedNoticeOfAward.performanceSecurityPostedDate,
                  )}
                  icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="NOA Contract Execution Date"
                  value={formatDate(linkedNoticeOfAward.contractExecutionDate)}
                  icon={<FileCheck2 className="h-4 w-4 text-green-600" />}
                />
                <NoaDetailItem
                  label="PhilGEPS Posted"
                  value={formatDate(linkedNoticeOfAward.philgepsPostedAt)}
                  icon={<FileCheck2 className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="PhilGEPS Reference"
                  value={formatText(
                    linkedNoticeOfAward.philgepsReferenceNumber,
                  )}
                  icon={<Hash className="h-4 w-4 text-blue-600" />}
                />
                <NoaDetailItem
                  label="Signed NOA File"
                  value={
                    <NoaDocumentLink
                      fileName={linkedNoticeOfAward.signedDocumentFileName}
                      onView={() =>
                        void handleViewSignedNoaDocument(linkedNoticeOfAward)
                      }
                    />
                  }
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="Conforme File"
                  value={
                    <NoaDocumentLink
                      fileName={linkedNoticeOfAward.conformeFileName}
                      onView={() =>
                        linkedNoticeOfAward.conformeFileName
                          ? void handleViewMilestoneDocument(
                              linkedNoticeOfAward,
                              'conforme_received_date',
                              linkedNoticeOfAward.conformeFileName,
                            )
                          : undefined
                      }
                    />
                  }
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="Performance Security File"
                  value={
                    <NoaDocumentLink
                      fileName={linkedNoticeOfAward.performanceSecurityFileName}
                      onView={() =>
                        linkedNoticeOfAward.performanceSecurityFileName
                          ? void handleViewMilestoneDocument(
                              linkedNoticeOfAward,
                              'performance_security_posted_date',
                              linkedNoticeOfAward.performanceSecurityFileName,
                            )
                          : undefined
                      }
                    />
                  }
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="Contract File"
                  value={
                    <NoaDocumentLink
                      fileName={linkedNoticeOfAward.contractFileName}
                      onView={() =>
                        linkedNoticeOfAward.contractFileName
                          ? void handleViewMilestoneDocument(
                              linkedNoticeOfAward,
                              'contract_execution_date',
                              linkedNoticeOfAward.contractFileName,
                            )
                          : undefined
                      }
                    />
                  }
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="Print File"
                  value={
                    <NoaDocumentLink
                      fileName={
                        linkedNoticeOfAward.printFileName ??
                        `${linkedNoticeOfAward.noaNumber}.pdf`
                      }
                      onView={() =>
                        void handleViewNoaPdf(
                          linkedNoticeOfAward,
                          'Failed to open the printable NOA document.',
                        )
                      }
                    />
                  }
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="NOA Created"
                  value={formatText(linkedNoticeOfAward.createdAt)}
                  icon={<Calendar className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="NOA Updated"
                  value={formatText(linkedNoticeOfAward.updatedAt)}
                  icon={<Calendar className="h-4 w-4 text-default-600" />}
                />
                <NoaDetailItem
                  label="Execution Justification"
                  value={formatText(
                    linkedNoticeOfAward.contractExecutionJustification,
                  )}
                  icon={<FileText className="h-4 w-4 text-default-600" />}
                  className="md:col-span-2 xl:col-span-3"
                />
                <NoaDetailItem
                  label="Cascade Triggered At"
                  value={formatDate(linkedNoticeOfAward.cascadeTriggeredAt)}
                  icon={<Clock3 className="h-4 w-4 text-rose-600" />}
                />
                <NoaDetailItem
                  label="Cascade Triggered By"
                  value={formatText(linkedNoticeOfAward.cascadeTriggeredBy)}
                  icon={<ShieldCheck className="h-4 w-4 text-rose-600" />}
                />
                <NoaDetailItem
                  label="Cascade Note"
                  value={formatText(linkedNoticeOfAward.cascadeNote)}
                  icon={<FileText className="h-4 w-4 text-rose-600" />}
                />
              </div>
            </div>

            {linkedNoticeOfAward.activityLog.length ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-default-900">
                  NOA Workflow Activity
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {linkedNoticeOfAward.activityLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-default-200 bg-default-50/40 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-default-900">
                        <span>{entry.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatText(entry.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.actor}
                        {entry.note ? ` - ${entry.note}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Contract Items (Read-only Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Items</CardTitle>
          <CardDescription>
            Items inherited from NOA - strictly read-only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Item Name</TableHead>
                  <TableHead className="font-semibold">
                    Specifications
                  </TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Fund</TableHead>
                  <TableHead className="font-semibold">Quantity</TableHead>
                  <TableHead className="font-semibold">
                    Unit of Measure
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Unit Price
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Total Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  contract.items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.specifications || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.category || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.fund || '—'}
                      </TableCell>
                      <TableCell>{item.quantity.toLocaleString()}</TableCell>
                      <TableCell>{item.unitOfMeasure}</TableCell>
                      <TableCell className="text-right">
                        ₱ {item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₱ {item.totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Total Summary */}
          <div className="mt-4 flex justify-end">
            <div className="bg-muted/50 rounded-lg p-4 min-w-[300px]">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Grand Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ₱ {totalAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {contract.items.length} item(s) • Read-only from NOA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExportComingSoonDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        entityLabel="Contract details"
      />
    </div>
  )
}
