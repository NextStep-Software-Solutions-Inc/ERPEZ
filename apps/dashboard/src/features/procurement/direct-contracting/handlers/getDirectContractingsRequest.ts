import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { DirectContracting, BackendDirectContractingItem } from '../store/directContractingStore'
import api from '@/services/api'

const endpoint = '/direct-contracting'

export const getDirectContractingsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  DirectContracting[]
> = {
  endpoint,
  key: ({ url }) => ['direct-contractings', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: BackendDirectContractingItem[] }>(finalUrl, { signal })
    const list = response.data?.data || []
    const statusMap: Record<string, DirectContracting['status']> = {
      'approved': 'approved',
      'draft': 'draft',
      'submitted': 'submitted',
      'for-review': 'for-review',
      'for_review': 'for-review',
      'submitted-to-supplier': 'submitted-to-supplier',
      'submitted_to_supplier': 'submitted-to-supplier',
      'pending_for_approval': 'for-review',
      'pending-for-approval': 'for-review',
      'returned': 'rejected',
      'rejected': 'rejected',
    }
    return list.map((item) => ({
      id: item.id,
      dcNumber: item.dcNumber,
      dcName: item.name,
      bacResolutionId: item.bacProjectId,
      bacResolutionNumber: item.resolutionNumber || '',
      prNumber: item.resolutionNumber || '',
      office: item.exclusiveSupplierName || '',
      category: item.resolutionType || 'General',
      modeOfProcurement: 'Direct Contracting' as const,
      totalABC: item.totalABC || 0,
      status: statusMap[(item.status || '').toLowerCase()] || 'draft',
      supplierId: item.exclusiveSupplierId,
      supplierName: item.exclusiveSupplierName,
      createdAt: item.createdAt || new Date().toISOString(),
      deadline: item.submissionDeadline || '',
      remarks: item.reviewRemarks || '',
    }))
  },
}
