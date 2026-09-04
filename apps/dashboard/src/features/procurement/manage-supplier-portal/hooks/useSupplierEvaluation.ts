import { useState, useMemo, useEffect } from 'react'
import type { SupplierBid } from '../types'
import { useToast } from '@/components/ui/use-toast'
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib'
import { getSupplierApplicationsRequest } from '../handlers/getSupplierApplicationsRequest'
import { updateApplicationEvaluationRequest } from '../handlers/updateApplicationEvaluationRequest'
import { getRFQSupplierBidsRequest } from '../handlers/getRFQSupplierBidsRequest'
import { evaluateRFQSupplierBidRequest } from '../handlers/evaluateRFQSupplierBidRequest'
import { useQueryClient } from '@tanstack/react-query'

const useBACSupplierApplications = createQueryHookFromTemplate(getSupplierApplicationsRequest)
const useUpdateBACEvaluation = createMutationHookFromTemplate(updateApplicationEvaluationRequest)

const useRFQSupplierBids = createQueryHookFromTemplate(getRFQSupplierBidsRequest)
const useUpdateRFQEvaluation = createMutationHookFromTemplate(evaluateRFQSupplierBidRequest)

const isValidGuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export function useSupplierEvaluation(projectId: string, source: 'rfq' | 'bac' = 'rfq') {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isGuid = Boolean(projectId && isValidGuid(projectId))

  // Fetch RFQ Bids
  const { data: rfqBidsResponse, isLoading: isLoadingRfqBids } = useRFQSupplierBids({
    pathParams: { rfqId: projectId },
    queryParams: {},
    enabled: Boolean(isGuid && source === 'rfq'),
  })

  // Fetch BAC Applications
  const { data: bacApplicationsResponse, isLoading: isLoadingBacApps } = useBACSupplierApplications({
    pathParams: { projectId },
    queryParams: {},
    enabled: Boolean(isGuid && source === 'bac'),
  })

  const { mutateAsync: updateRFQEvaluationMutation, isPending: isSavingRfq } = useUpdateRFQEvaluation()
  const { mutateAsync: updateBACEvaluationMutation, isPending: isSavingBac } = useUpdateBACEvaluation()

  const isSaving = isSavingRfq || isSavingBac
  const isLoading = source === 'rfq' ? isLoadingRfqBids : isLoadingBacApps

  const bids: SupplierBid[] = useMemo(() => {
    if (source === 'rfq') {
      const rawBids = rfqBidsResponse?.data ?? []
      return rawBids.map((b: any) => ({
        id: b.id,
        projectId: b.rfqId || projectId,
        source: 'rfq' as const,
        supplierName: b.supplierName || 'Unnamed Supplier',
        supplierCategory: b.supplierCategory,
        contactPerson: b.contactPerson,
        contactNumber: b.contactNumber,
        email: b.email,
        tinNumber: b.tinNumber,
        registrationNumber: b.registrationNumber,
        businessAddress: b.businessAddress,
        philGepsStatus: b.philGepsStatus,
        totalBidAmount: b.totalBidAmount || 0,
        remarks: b.remarks,
        evaluatedBy: b.evaluatedBy,
        evaluatedAt: b.evaluatedAt,
        status: (b.status || 'Pending') as 'Pending' | 'Passed' | 'Failed',
        submittedAt: b.submittedAt || new Date().toISOString(),
        documents: (b.documents || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          url: d.url || '',
          type: (d.type as any) || 'PDF',
        })),
        items: (b.items || []).map((it: any) => ({
          id: it.id,
          rfqItemId: it.rfqItemId,
          itemName: it.itemName,
          quantity: it.quantity,
          abcUnitPrice: it.abcUnitPrice,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          brand: it.brand,
          model: it.model,
          color: it.color,
          brochureFileUrl: it.brochureFileUrl,
          isResponsive: it.isResponsive,
          disqualificationReason: it.disqualificationReason,
          qualityScore: it.qualityScore,
        })),
      }))
    }

    const rawApplications = bacApplicationsResponse?.data ?? []
    return rawApplications.map((a: any) => ({
      id: a.id,
      projectId: a.projectId || projectId,
      source: (a.source === 'InternalRFQ' ? 'rfq' : 'bac') as 'rfq' | 'bac',
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
        envelopeType: d.envelopeType ?? 1,
        checklistItemId: d.checklistItemId,
      })),
      items: (a.items || []).map((it: any) => ({
        id: it.id,
        rfqItemId: it.rfqItemId,
        itemName: it.itemName,
        quantity: it.quantity,
        abcUnitPrice: it.abcUnitPrice,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        brand: it.brand,
        model: it.model,
        color: it.color,
        brochureFileUrl: it.brochureFileUrl,
        isResponsive: it.isResponsive,
        disqualificationReason: it.disqualificationReason,
        qualityScore: it.qualityScore,
      })),
    }))
  }, [source, rfqBidsResponse, bacApplicationsResponse, projectId])

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
        description: 'Remarks are required when marking a submission as Failed.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (source === 'rfq') {
        await updateRFQEvaluationMutation({
          pathParams: {
            rfqId: projectId,
            bidId: selectedBidId,
          },
          payload: {
            evaluationStatus: evalStatus,
            remarks: evalRemarks.trim(),
          },
        })
      } else {
        await updateBACEvaluationMutation({
          pathParams: {
            projectId,
            applicationId: selectedBidId,
          },
          payload: {
            evaluationStatus: evalStatus as 'Pending' | 'Passed' | 'Failed',
            remarks: evalRemarks.trim(),
          },
        })
      }

      // Invalidate queries to reflect latest evaluation in DB
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.includes(projectId)
        },
      })

      toast({
        title: 'Evaluation Saved',
        description: `Supplier submission marked as ${evalStatus}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Evaluation Failed',
        description: err?.message || 'Could not save submission evaluation.',
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
