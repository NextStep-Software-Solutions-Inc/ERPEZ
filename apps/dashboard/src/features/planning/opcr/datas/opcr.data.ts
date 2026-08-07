import type { OPCR } from '../types/type.opcr'
import { createPaginatedResponse } from '@/utils/createPaginatedResponse'

const createOPCR = (): OPCR => {
  return {
    id: '',
    name: '',
    activityCount: 0,
    createdDate: new Date().toISOString(),
    fiscalYear: {
      id: '',
      functionAllocations: [],
      isLocked: false,
      year: new Date().getFullYear(),
      description: '',
    },
    status: 'Draft',
    totalBudget: 0,
    evaluationCount: 0,
    kpiAssignmentCount: 0,
    deliveryUnit: {
      id: '',
      kpiAssignments: [],
      kpiCount: 0,
      kpiTargetAssignments: [],
      parentId: '',
      subDUCount: 0,
      totalAmountRemaining: 0,
      subDeliveryUnits: [],
      office: {
        id: '',
        name: '',
        // removed fields (address, contactNumber, email) that are not part of DeliveryUnitOffice
        createdBy: '',
        createdAt: new Date().toISOString(),
        description: '',
        isDeliveryUnit: false,
        officeHead: '',
        responsibilityCenterCode: '',
        clusterId: '',
      },
      createdBy: '',
      createdAt: new Date().toISOString(),
    },
  } as unknown as OPCR
}

const mockOPCRs = Array.from({ length: 20 }, (_, i) => ({
  ...createOPCR(),
  id: `opcr-${i + 1}`,
  name: `OPCR ${i + 1}`,
  officeName: `Office ${(i % 5) + 1}`,
  fiscalYear: {
    id: `fy-${2020 + (i % 5)}`,
    year: 2020 + (i % 5),
    isLocked: false,
    description: `Fiscal Year ${2020 + (i % 5)}`,
    functionAllocations: [],
  },
  deliveryUnitId: `du-${(i % 3) + 1}`,
  totalBudget: Math.floor(Math.random() * 1000000),
  evaluationCount: Math.floor(Math.random() * 10),
  kpiAssignmentCount: Math.floor(Math.random() * 20),
  activityCount: Math.floor(Math.random() * 15),
}))

const paginatedMockOPCRs = createPaginatedResponse(mockOPCRs)

export { mockOPCRs, paginatedMockOPCRs }
