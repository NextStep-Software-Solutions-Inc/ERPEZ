import type { PublicProject, RequiredDocument, ModeOfProcurement, ProjectStatus } from '../types/portalTypes'

export const mapBackendProjectToFrontend = (p: any): PublicProject => {
  const requiredDocuments: RequiredDocument[] = []
  
  if (p.requiredSubmissions) {
    p.requiredSubmissions.forEach((s: any) => {
      requiredDocuments.push({
        id: s.checklistItemId,
        name: s.documentName,
        description: s.description || '',
        isTemplate: false,
      })
    })
  }
  
  if (p.bidNotices) {
    p.bidNotices.forEach((b: any) => {
      requiredDocuments.push({
        id: b.checklistItemId,
        name: b.documentName,
        description: b.description || '',
        downloadUrl: b.downloadUrl ? `${import.meta.env.VITE_ERPEZ_BACKEND_URL}${b.downloadUrl}` : undefined,
        isTemplate: true,
        postedOn: b.postedOn,
      })
    })
  }

  // Handle mop mapping
  let mop: ModeOfProcurement = 'public-bidding'
  if (p.modeOfProcurement === 'Small Value Procurement' || p.modeOfProcurement === 'svp') {
    mop = 'svp'
  }

  // Handle status mapping
  let status: ProjectStatus = 'open'
  const backendStatus = (p.status || '').toLowerCase()
  if (backendStatus === 'closingsoon' || backendStatus === 'closing soon' || backendStatus === 'closing-soon') {
    status = 'closing-soon'
  } else if (backendStatus === 'closed') {
    status = 'closed'
  }

  return {
    id: p.id,
    referenceNo: p.contractNo || '',
    title: p.title || '',
    mop,
    status,
    postedOn: p.datePosted || p.postedOn || '',
    deadline: p.submissionDeadline || p.deadline || '',
    approvedBudget: Number(p.abc || p.approvedBudget || 0),
    nonRefundableFee: p.nonRefundableBidderFee ? Number(p.nonRefundableBidderFee) : undefined,
    deliveryPeriod: p.deliveryPeriodDays ? `${p.deliveryPeriodDays} Day/s` : (p.deliveryPeriod || ''),
    preBidConference: p.preBidConferenceDate || p.preBidConference || undefined,
    bidOpening: p.bidOpeningDate || p.bidOpening || undefined,
    scope: p.scopeOfWork || p.scope || '',
    requiredDocuments,
  }
}
