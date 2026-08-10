/**
 * Market Scoping Details Page
 * Location: src/pages/planning/market-scoping/
 * 
 * Displays detailed view of a market scoping form with modular components
 * Complies with 200-line max for composite components
 */

import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { ArrowLeft, Download, Send, Check, RotateCcw, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getStatusByValue,
  useMarketScopingDetails,
  useGeneratePdf,
  ActivitiesSection,
  ParametersSection,
  ProjectOverviewSection,
  ApprovalRoutingSection,
  ApprovalDialog,
  CreateMarketScopingDialog,
  draftMarketScopingAtom,
  createMarketScopingDialogOpenAtom,
  currentFormStepAtom,
} from '@/features/planning/market-scoping'
import type { MarketScopingForm } from '@/features/planning/market-scoping'

interface MarketScopingDetailsPageProps {
  id?: string
}

export default function MarketScopingDetailsPage({ id: propId }: MarketScopingDetailsPageProps = {}) {
  const routerParams = useParams({ strict: false }) as { id?: string }
  const id = propId || routerParams?.id || ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: queryData, isLoading, refetch } = useMarketScopingDetails({
    pathParams: { id },
    queryParams: {},
  })
  const { mutateAsync: generatePdf, isPending: isGeneratingPdf } = useGeneratePdf()

  const form = queryData?.data as MarketScopingForm | undefined
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'return' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActionPending, setIsActionPending] = useState(false)

  const setDraft = useSetAtom(draftMarketScopingAtom)
  const setCreateDialogOpen = useSetAtom(createMarketScopingDialogOpenAtom)
  const setCurrentStep = useSetAtom(currentFormStepAtom)

  const handleEditForm = () => {
    if (form) {
      setDraft(form)
      setCurrentStep(1)
      setCreateDialogOpen(true)
    }
  }

  const handleBack = () => {
    navigate({ to: '/v2/market-scoping' })
  }

  const handleGeneratePdf = async () => {
    try {
      const apiRes = await generatePdf({ pathParams: { id } })
      const documentId = typeof apiRes === 'string' ? apiRes : apiRes?.data
      
      if (!documentId) {
        throw new Error('No document ID returned from backend generator.')
      }

      const response = await api.get(`/api/planning/documents/${documentId}/download`, {
        responseType: 'blob',
      })

      const filename = `MarketScoping_${form?.projectName?.replace(/\s+/g, '_') || id}.pdf`
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success('Market Scoping PDF generated and downloaded successfully.')
    } catch (error) {
      console.error('Error generating PDF via API:', error)
      toast.error('Failed to generate or download the Market Scoping PDF from backend API.')
    }
  }

  const handleSubmitForm = async () => {
    setIsSubmitting(true)
    try {
      await api.post(`/market-scopings/${id}/submit`)
      toast.success('Market Scoping form submitted for approval.')
      await refetch()
      queryClient.invalidateQueries({ queryKey: ['market-scoping'] })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit Market Scoping form.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (signedFile?: File | null) => {
    setIsActionPending(true)
    try {
      let fileId: string | undefined = undefined
      if (signedFile) {
        const formData = new FormData()
        formData.append('file', signedFile)
        const uploadRes = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        fileId = uploadRes.data?.data
      }

      const res = await api.post<{ succeeded: boolean; message?: string }>(
        `/market-scopings/${id}/approve`,
        { signedDocumentFileId: fileId }
      )
      if (!res.data?.succeeded) {
        toast.error(res.data?.message || 'Approval failed.')
        return  // stop here — don't refetch, don't close dialog
      }
      toast.success('Market Scoping form approved successfully.')
      setShowApprovalDialog(false)
      setApprovalAction(null)
      await refetch()
      queryClient.invalidateQueries({ queryKey: ['market-scoping'] })
    } catch (error) {
      console.error('Error approving form:', error)
      toast.error('Failed to approve Market Scoping form.')
    } finally {
      setIsActionPending(false)
    }
  }

  const handleReturn = async () => {
    setIsActionPending(true)
    try {
      await api.post(`/market-scopings/${id}/return`, {
        remarks: rejectionReason,
      })
      toast.success('Market Scoping form returned for revision.')
      setShowApprovalDialog(false)
      setApprovalAction(null)
      setRejectionReason('')
      await refetch()
      queryClient.invalidateQueries({ queryKey: ['market-scoping'] })
    } catch (error) {
      console.error('Error returning form:', error)
      toast.error('Failed to return Market Scoping form.')
    } finally {
      setIsActionPending(false)
    }
  }

  const handleReject = async () => {
    setIsActionPending(true)
    try {
      await api.put(`/market-scopings/${id}/status`, {
        status: 'Rejected',
        changeReason: rejectionReason,
      })
      toast.success('Market Scoping form rejected.')
      setShowApprovalDialog(false)
      setApprovalAction(null)
      setRejectionReason('')
      await refetch()
      queryClient.invalidateQueries({ queryKey: ['market-scoping'] })
    } catch (error) {
      console.error('Error rejecting form:', error)
      toast.error('Failed to reject Market Scoping form.')
    } finally {
      setIsActionPending(false)
    }
  }

  const normalizedStatus = (form?.status || '').toLowerCase()
  const isDraftOrReturned = normalizedStatus === 'draft' || normalizedStatus === 'returned'
  const isSubmittedOrPending = normalizedStatus === 'submitted' || normalizedStatus === 'pendingapproval'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading form details...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Form not found</p>
        <Button onClick={handleBack}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Button variant="outline" size="icon" onClick={handleBack} className="rounded-full flex-shrink-0 mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 break-words">{form.projectName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Market Scoping Form Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
          <Badge variant="outline" className={`px-3 py-1.5 text-sm font-semibold border ${getStatusByValue(form.status)?.color || 'bg-gray-100'}`}>
            {getStatusByValue(form.status)?.label || form.status}
          </Badge>

          {/* Action Bar based on lifecycle status */}
          {isDraftOrReturned && (
            <>
              <Button
                variant="outline"
                onClick={handleEditForm}
                className="gap-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Form
              </Button>
              <Button
                onClick={handleSubmitForm}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-xs"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </>
          )}

          {isSubmittedOrPending && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setApprovalAction('return')
                  setShowApprovalDialog(true)
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2 font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Return for Revision
              </Button>
              <Button
                onClick={() => {
                  setApprovalAction('approve')
                  setShowApprovalDialog(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-xs"
              >
                <Check className="w-4 h-4" />
                Approve Market Scoping
              </Button>
            </>
          )}

          {/* Generate PDF always available regardless of status */}
          <Button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-xs"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
          <ProjectOverviewSection form={form} />

          <Tabs defaultValue="activities" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="activities" className="font-medium">Activities Conducted</TabsTrigger>
              <TabsTrigger value="parameters" className="font-medium">Parameter Evaluation</TabsTrigger>
            </TabsList>
            <TabsContent value="activities" className="space-y-4">
              <ActivitiesSection form={form} />
            </TabsContent>
            <TabsContent value="parameters" className="space-y-4">
              <ParametersSection form={form} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <ApprovalRoutingSection
            form={form}
            onApprovalAction={(action) => {
              setApprovalAction(action)
              setShowApprovalDialog(true)
            }}
            isLoading={isActionPending}
          />
        </div>
      </div>

      {/* Approval / Return Dialog */}
      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        action={approvalAction}
        projectName={form.projectName}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onApprove={handleApprove}
        onReject={handleReject}
        onReturn={handleReturn}
        isLoading={isActionPending}
      />

      {/* Create / Edit Dialog */}
      <CreateMarketScopingDialog
        title="Edit Market Scoping Form"
        description="Update the details in the 4-step wizard to edit the draft form."
      />
    </div>
  )
}
