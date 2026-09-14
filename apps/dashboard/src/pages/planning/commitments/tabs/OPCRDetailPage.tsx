import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Download, Loader2 } from 'lucide-react'
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
          className="flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      {/* Page Title and Description */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {opcrData.name}
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              {opcrData.office?.name} • FY {opcrData.fiscalYear?.year}
            </p>
          </div>
          <p className="text-base text-gray-500">
            Status: {getStatusLabel(opcrData.commitmentStatus ?? 'Unknown')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-xs"
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
        <div className="space-y-6">
          {functionTypes.map((functionType) => {
            const kpiCount = getFunctionCategoryKPICount(functionType.id)
            const IconComponent = functionType.icon

            return (
              <Button
                key={functionType.id}
                className={`group relative h-30 overflow-hidden bg-white border border-gray-200 rounded-lg p-8 text-left transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full border-l-4 ${functionType.leftBorderColor}`}
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
                  <div className="flex items-center gap-6 flex-1 ">
                    <div
                      className={`p-4 rounded-lg shrink-0 ${functionType.iconBgColor}`}
                    >
                      <IconComponent
                        className={`h-8 w-8 ${functionType.iconColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {functionType.title}
                      </h3>
                      <p className="text-base text-gray-500 mt-2">
                        {functionType.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex items-center gap-6 shrink-0 ml-6">
                    <Badge
                      variant="outline"
                      className={`text-base font-semibold whitespace-nowrap px-4 py-2 ${functionType.badgeBgColor} ${functionType.badgeTextColor} ${functionType.badgeBorderColor}`}
                    >
                      {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                    </Badge>
                    <ArrowRight className="h-6 w-6 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
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
