import type { PublicProject, RequiredDocument, ModeOfProcurement, ProjectStatus } from '../types/portalTypes'

export const mapBackendProjectToFrontend = (p: any): PublicProject => {
  const requiredDocuments: RequiredDocument[] = []
  
  if (p.requiredSubmissions) {
    const bidNoticesMap = new Map<string, any>()
    if (p.bidNotices) {
      p.bidNotices.forEach((b: any) => {
        bidNoticesMap.set(b.checklistItemId, b)
      })
    }

    p.requiredSubmissions.forEach((s: any) => {
      const matchingNotice = bidNoticesMap.get(s.checklistItemId)
      const downloadUrl = s.downloadUrl || matchingNotice?.downloadUrl
      requiredDocuments.push({
        id: s.checklistItemId,
        name: s.documentName,
        description: s.description || '',
        downloadUrl: downloadUrl ? `${import.meta.env.VITE_ERPEZ_BACKEND_URL || ''}${downloadUrl}` : undefined,
        hasTemplate: !!downloadUrl,
        isTemplate: false,
        postedOn: matchingNotice?.postedOn,
        viewerDocId: matchingNotice?.viewerDocId,
        envelopeType: s.envelopeType ?? 1,
      })
    })
  }

  // Handle mop mapping
  let mop: ModeOfProcurement = 'public-bidding'
  const modeStr = (p.modeOfProcurement || '').toLowerCase()
  const contractNo = (p.contractNo || '').toLowerCase()

  const isPb =
    modeStr.includes('public bidding') ||
    modeStr.includes('competitive') ||
    (modeStr.includes('bidding') && !modeStr.includes('small value')) ||
    contractNo.includes('itb') ||
    contractNo.includes('pb')

  if (
    !isPb &&
    (modeStr.includes('small value') ||
      modeStr.includes('svp') ||
      modeStr.includes('53.9') ||
      modeStr.includes('shopping') ||
      modeStr.includes('52') ||
      contractNo.startsWith('svp') ||
      contractNo.includes('svp') ||
      contractNo.startsWith('rfq'))
  ) {
    mop = 'svp'
  }

  // Handle status mapping
  let status: ProjectStatus = 'open'
  const backendStatus = (p.status || '').toLowerCase()
  const deadlineStr = p.submissionDeadline || p.deadline || ''
  const isPastDeadline = deadlineStr && !isNaN(Date.parse(deadlineStr))
    ? new Date(deadlineStr).getTime() < Date.now()
    : false

  if (backendStatus === 'closed' || isPastDeadline) {
    status = 'closed'
  } else if (backendStatus === 'closingsoon' || backendStatus === 'closing soon' || backendStatus === 'closing-soon') {
    status = 'closing-soon'
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
    pricingStructure: p.pricingStructure || (mop === 'svp' && Array.isArray(p.items) && p.items.length > 0 ? 'Itemized' : 'LumpSum'),
    procurementCategory: p.procurementCategory || 'Goods',
    items: Array.isArray(p.items)
      ? p.items.map((i: any) => ({
          id: i.id,
          itemName: i.itemName,
          description: i.description,
          quantity: i.quantity,
          uom: i.uom,
          abcUnitPrice: Number(i.abcUnitPrice || 0),
          abcTotalPrice: Number(i.abcTotalPrice || 0),
        }))
      : [],
  }
}
