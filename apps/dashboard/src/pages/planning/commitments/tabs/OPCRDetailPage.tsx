import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useOPCRById,
  useGenerateOPCRDocument,
  useDownloadOPCRDocument,
  useUpdateCommitmentStatus,
  OPCRReadinessCard,
  OPCRWorkflowDialog,
  type CommitmentStatus,
} from '@/features/planning/opcr'
import type { OPCRWorkflowAction } from '@/features/planning/opcr/components/OPCRWorkflowDialog'
import {
  countKPIsByCategory,
  normalizeCategory,
} from '@/features/planning/opcr/utils/countKPIsByCategory'
import { getCategoryVisuals } from '../utils/functions'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getStatusLabel } from '@/utils/formatters'
import OPCRItemKPIAccordion from '@/features/planning/opcr/components/OPCRItemKPIAccordion'
import { OPCRItem } from '@/features/planning/opcr/types/type.opcr'
import { toast } from 'sonner'

interface OPCRDetailPageProps {
  opcrId: string
  onBack: () => void
  hideButton?: boolean
  isApprovalWorkflow?: boolean
}

export default function OPCRDetailPage({
  opcrId,
  onBack,
  hideButton,
  isApprovalWorkflow,
}: OPCRDetailPageProps) {
  const queryClient = useQueryClient()
  const [expandedAccordionItems, setExpandedAccordionItems] = useState<
    string[]
  >([])
  const [createActivityDialogOpen, setCreateActivityDialogOpen] =
    useState(false)
  const [selectedKPIForActivity, setSelectedKPIForActivity] =
    useState<OPCRItem | null>(null)
  const [workflowDialog, setWorkflowDialog] = useState<{
    open: boolean
    action: OPCRWorkflowAction
  }>({
    open: false,
    action: 'submit',
  })

  const navigation = useNavigate({ from: '/v2/commitments' })
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const { functionCategory } = searchParams
  const isWorkflowTab =
    (searchParams as { tab?: string }).tab === 'approvalWorkflow' ||
    Boolean(isApprovalWorkflow)
  const {
    data: opcrResponse,
    isLoading,
    isError,
    error,
    refetch: refetchOPCR,
  } = useOPCRById({
    pathParams: { id: opcrId },
    queryParams: {},
  })
  const { mutateAsync: generateOPCRDocument, isPending: isGenerating } =
    useGenerateOPCRDocument()
  const { mutateAsync: downloadOPCRDocument, isPending: isDownloading } =
    useDownloadOPCRDocument()
  const { mutateAsync: updateCommitmentStatus, isPending: isUpdatingStatus } =
    useUpdateCommitmentStatus()

  const isGeneratingPdf = isGenerating || isDownloading
  const opcrData = opcrResponse?.data

  const handleGeneratePdf = async () => {
    try {
      const apiRes = await generateOPCRDocument({
        pathParams: { opcrId },
        queryParams: { format: 'Pdf' },
      })
      const documentId = typeof apiRes === 'string' ? apiRes : apiRes?.data

      if (!documentId) {
        throw new Error('No document ID returned from backend generator.')
      }

      const downloadRes = await downloadOPCRDocument({
        pathParams: { documentId },
      })

      const blob = downloadRes?.blob
      if (!blob) {
        throw new Error('Failed to retrieve document binary from backend.')
      }

      const sanitizedName = opcrData?.name?.trim().replace(/\s+/g, '_')
      const filename = sanitizedName
        ? `OPCR_${sanitizedName}.pdf`
        : `OPCR_${opcrId || 'document'}.pdf`
      const url = URL.createObjectURL(blob)

      try {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
      } finally {
        URL.revokeObjectURL(url)
      }

      toast.success('OPCR PDF generated and downloaded successfully.')
    } catch (error) {
      console.error('Error generating PDF via API:', error)
      toast.error(
        'Failed to generate or download the OPCR PDF from backend API.',
      )
    }
  }

  const handleConfirmWorkflow = async () => {
    try {
      const statusMap: Record<OPCRWorkflowAction, CommitmentStatus> = {
        submit: 'Submitted',
        approve: 'Approved',
        return: 'Returned',
      }
      const newStatus = statusMap[workflowDialog.action]
      await updateCommitmentStatus({
        pathParams: { id: opcrId },
        queryParams: {},
        payload: { commitmentStatus: newStatus },
      })

      const successMessages: Record<OPCRWorkflowAction, string> = {
        submit: 'OPCR submitted successfully for approval.',
        approve: 'OPCR approved successfully.',
        return: 'OPCR returned for revision.',
      }
      toast.success(successMessages[workflowDialog.action])
      setWorkflowDialog((prev) => ({ ...prev, open: false }))
      refetchOPCR()
      queryClient.invalidateQueries({ queryKey: ['/opcrs'] })
    } catch (error) {
      console.error('Failed to update OPCR commitment status:', error)
      toast.error(`Failed to ${workflowDialog.action} OPCR.`)
    }
  }

  // Filter KPIs by selected category
  const filteredKPIs =
    functionCategory && opcrData?.opcrItems
      ? opcrData.opcrItems.filter((item) => {
          const itemCat =
            item.functionCategory ||
            item.kpiAssignment?.fyActiveKPI?.functionCategory
          return (
            normalizeCategory(itemCat) === normalizeCategory(functionCategory)
          )
        })
      : []

  // Helper to calculate quarterly targets from quarterly values
  const getQuarterlyTargets = (opcrItem: OPCRItem): Record<string, number> => {
    return {
      Q1: opcrItem.q1Target || 0,
      Q2: opcrItem.q2Target || 0,
      Q3: opcrItem.q3Target || 0,
      Q4: opcrItem.q4Target || 0,
      'Annual Target':
        (opcrItem.q1Target || 0) +
        (opcrItem.q2Target || 0) +
        (opcrItem.q3Target || 0) +
        (opcrItem.q4Target || 0),
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-indigo-400" />
        <p className="text-sm text-muted-foreground">Loading OPCR details...</p>
      </div>
    )
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status
    const isNotFound = status === 404
    const errorMessage = isNotFound
      ? 'This OPCR record could not be found in the current workspace or may have been removed.'
      : error instanceof Error
        ? error.message
        : 'Unable to load OPCR details from the server.'

    const handleReturnToList = () => {
      navigation({
        search: (prev) => ({
          ...prev,
          opcrId: undefined,
          functionCategory: undefined,
          kpiAssignmentId: undefined,
          opcrActivityId: undefined,
        }),
      })
    }

    return (
      <div className="space-y-4">
        {!hideButton && (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleReturnToList}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        )}
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/25 text-center">
          <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-200/80 dark:border-rose-500/30 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-semibold text-foreground">
              {isNotFound
                ? 'OPCR record not found'
                : 'Failed to load OPCR details'}
            </h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="default"
              size="sm"
              onClick={handleReturnToList}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to OPCR List
            </Button>
            {!isNotFound && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchOPCR()}
                className="gap-2 border-border text-foreground hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!opcrData) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No OPCR data available
      </div>
    )
  }

  const functionTypes = Object.values(FunctionCategory).map((category) => ({
    id: category,
    ...getCategoryVisuals(category),
  }))

  const getFunctionCategoryKPICount = (category: string): number => {
    return countKPIsByCategory(opcrData.opcrItems, category)
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {!hideButton && (
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      {/* Page Title and Description */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2.5">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {opcrData.name}
            </h2>
            <p className="text-lg text-muted-foreground mt-1.5">
              {opcrData.office?.name} • FY {opcrData.fiscalYear?.year}
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Status:{' '}
            <span className="text-foreground font-semibold">
              {getStatusLabel(opcrData.commitmentStatus ?? 'Unknown')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium shadow-xs"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate OPCR
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Workflow & Submission Readiness Persistent Card */}
      <OPCRReadinessCard
        opcr={opcrData}
        isLoading={isLoading}
        onOpenSubmit={() => setWorkflowDialog({ open: true, action: 'submit' })}
        onOpenApprove={
          isWorkflowTab
            ? () => setWorkflowDialog({ open: true, action: 'approve' })
            : undefined
        }
        onOpenReturn={
          isWorkflowTab
            ? () => setWorkflowDialog({ open: true, action: 'return' })
            : undefined
        }
        isSubmitting={isUpdatingStatus}
      />

      {/* Function Type Cards List */}
      {!functionCategory && (
        <div className="space-y-4">
          {functionTypes.map((functionType) => {
            const kpiCount = getFunctionCategoryKPICount(functionType.id)
            const IconComponent = functionType.icon

            return (
              <Button
                key={functionType.id}
                variant="ghost"
                className={`group relative h-auto overflow-hidden bg-card dark:bg-slate-900/65 border border-border rounded-xl p-6 text-left transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:bg-muted/40 dark:hover:bg-slate-800/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full border-l-4 ${functionType.leftBorderColor}`}
                onClick={() => {
                  navigation({
                    search: (prev) => ({
                      ...prev,
                      functionCategory: functionType.id,
                    }),
                  })
                }}
              >
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  {/* Left Content */}
                  <div className="flex items-center gap-5 flex-1">
                    <div
                      className={`p-4 rounded-xl shrink-0 ${functionType.iconBgColor}`}
                    >
                      <IconComponent
                        className={`h-7 w-7 ${functionType.iconColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {functionType.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {functionType.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex items-center gap-5 shrink-0 ml-6">
                    <Badge
                      variant="outline"
                      className={`text-sm font-semibold whitespace-nowrap px-3.5 py-1.5 ${functionType.badgeBgColor} ${functionType.badgeTextColor} ${functionType.badgeBorderColor}`}
                    >
                      {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      )}
      {functionCategory && (
        <>
          {/* KPIs Accordion Section */}
          <div className="space-y-4">
            {filteredKPIs && filteredKPIs.length > 0 ? (
              <OPCRItemKPIAccordion
                filteredKPIs={filteredKPIs}
                expandedAccordionItems={expandedAccordionItems}
                setExpandedAccordionItems={setExpandedAccordionItems}
                createActivityDialogOpen={createActivityDialogOpen}
                setCreateActivityDialogOpen={setCreateActivityDialogOpen}
                selectedKPIForActivity={selectedKPIForActivity}
                setSelectedKPIForActivity={setSelectedKPIForActivity}
                getQuarterlyTargets={getQuarterlyTargets}
                officeId={opcrData?.office?.id || (opcrData as any)?.officeId}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No KPIs assigned to this OPCR
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* OPCR Workflow Confirmation Dialog */}
      <OPCRWorkflowDialog
        open={workflowDialog.open}
        action={workflowDialog.action}
        opcrName={opcrData.name || 'OPCR'}
        onConfirm={handleConfirmWorkflow}
        onCancel={() => setWorkflowDialog((prev) => ({ ...prev, open: false }))}
        isLoading={isUpdatingStatus}
      />
    </div>
  )
}
