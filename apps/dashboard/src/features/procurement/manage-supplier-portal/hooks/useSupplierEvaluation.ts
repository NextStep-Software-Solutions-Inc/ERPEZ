import { useState, useMemo, useEffect } from 'react'
import type { SupplierBid } from '../types'
import { useToast } from '@/components/ui/use-toast'
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib'
import { getSupplierApplicationsRequest } from '../handlers/getSupplierApplicationsRequest'
import { updateApplicationEvaluationRequest } from '../handlers/updateApplicationEvaluationRequest'
import { useQueryClient } from '@tanstack/react-query'

const useSupplierApplications = createQueryHookFromTemplate(getSupplierApplicationsRequest)
const useUpdateEvaluation = createMutationHookFromTemplate(updateApplicationEvaluationRequest)

const isValidGuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export function useSupplierEvaluation(projectId: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: applicationsResponse, isLoading } = useSupplierApplications({
    pathParams: { projectId },
    queryParams: {},
    enabled: Boolean(projectId && isValidGuid(projectId)),
  })

  const { mutateAsync: updateEvaluationMutation, isPending: isSaving } = useUpdateEvaluation()

  const rawApplications = applicationsResponse?.data ?? []

  const bids: SupplierBid[] = useMemo(() => {
    return rawApplications.map((a: any) => ({
      id: a.id,
      projectId: a.projectId || projectId,
      supplierName: a.supplierName || 'Unnamed Supplier',
      supplierCategory: a.supplierCategory,
      contactPerson: a.contactPerson,
      contactNumber: a.contactNumber,
      email: a.email,
      tinNumber: a.tinNumber,
      businessAddress: a.businessAddress,
      totalBidAmount: a.totalBidAmount || 0,
      remarks: a.remarks,
      evaluatedBy: a.evaluatedBy,
      evaluatedAt: a.evaluatedAt,
      status: (a.evaluationStatus || 'Pending') as 'Pending' | 'Passed' | 'Failed',
      submittedAt: a.submittedAt || new Date().toISOString(),
      documents: (a.documents || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        url: d.url || '',
        type: (d.type as any) || 'PDF',
      })),
    }))
  }, [rawApplications, projectId])

  const [selectedBidId, setSelectedBidId] = useState<string | null>(null)
  const [evalStatus, setEvalStatus] = useState<string>('')
  const [evalRemarks, setEvalRemarks] = useState<string>('')

  // Auto-select first applicant if none selected
  useEffect(() => {
    if (!selectedBidId && bids.length > 0) {
      setSelectedBidId(bids[0].id)
      setEvalStatus(bids[0].status)
      setEvalRemarks(bids[0].remarks || '')
    }
  }, [bids, selectedBidId])

  const selectedBid = bids.find((b) => b.id === selectedBidId)

  const handleSelectBid = (bidId: string, status: string) => {
    setSelectedBidId(bidId)
    setEvalStatus(status)
    const bid = bids.find((b) => b.id === bidId)
    setEvalRemarks(bid?.remarks || '')
  }

  const handleSaveEvaluation = async () => {
    if (!selectedBidId || !evalStatus) return

    // Validate: remarks required if Failed
    if (evalStatus === 'Failed' && !evalRemarks.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Remarks are required when marking an application as Failed.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateEvaluationMutation({
        pathParams: {
          projectId,
          applicationId: selectedBidId,
        },
        payload: {
          evaluationStatus: evalStatus as 'Pending' | 'Passed' | 'Failed',
          remarks: evalRemarks.trim(),
        },
      })

      // Invalidate applications query to reflect latest evaluation in DB
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.includes(projectId)
        },
      })

      toast({
        title: 'Evaluation Saved',
        description: `Supplier application marked as ${evalStatus}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Evaluation Failed',
        description: err?.message || 'Could not save application evaluation.',
        variant: 'destructive',
      })
    }
  }

  return {
    bids,
    selectedBid,
    selectedBidId,
    evalStatus,
    evalRemarks,
    setEvalStatus,
    setEvalRemarks,
    handleSelectBid,
    handleSaveEvaluation,
    isLoading,
    isSaving,
  }
}
