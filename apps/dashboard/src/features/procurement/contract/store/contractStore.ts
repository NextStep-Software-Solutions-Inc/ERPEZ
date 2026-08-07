import { create } from 'zustand'
import {
  findNoticeOfAward,
  getNoticeOfAwardDatabase,
} from '../../notice-of-award/data/mockNoticeOfAwardData'
import type {
  NoticeOfAward,
  NoticeOfAwardLineItem,
  NoticeOfAwardStatus,
  NoticeOfAwardType,
} from '../../notice-of-award/types'

export type ContractCategory =
  | 'Consulting'
  | 'Infrastructure'
  | 'Goods and Services'

export type ContractItem = {
  id: string
  itemName: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  totalAmount: number
  // Additional contract-specific fields
  specifications?: string
  deliverySchedule?: string
  // New fields: category and fund for display/export
  category?: string
  fund?: string
}

export type NOA = {
  id: string
  noaNumber: string
  noaDate: string
  category: ContractCategory
  status: NoticeOfAwardStatus | 'pending'
  supplierName: string
  supplierId: string
  totalAmount: number
  items: ContractItem[]
  modeOfProcurement?: string
  description?: string
  wfpScope?: 'Project' | 'Activity'
  projectTitle?: string
  type?: NoticeOfAwardType
  linkedNoticeOfAward?: NoticeOfAward
}

export type Contract = {
  id: string
  contractDate: string
  contractNumber: string
  description: string
  noaId: string
  noaNumber: string
  supplierName: string
  supplierId: string
  totalAmount: number
  items: ContractItem[]
  /**
   * Status lifecycle:
   *   draft        → created, not yet submitted
   *   for-approval → submitted for approving authority review
   *   approved     → approved with signed PDF
   *   returned     → returned by approving authority with remarks; must be revised before re-submission
   *
   * Note: "returned" is a first-class status. It is NOT inferred from draft + remarks.
   */
  status: 'draft' | 'for-approval' | 'approved' | 'returned'
  createdAt: string
  // Optional approval metadata
  remarks?: string
  signedFileUrl?: string
  approvedAt?: string
  approvedBy?: string
  category: ContractCategory
  // Mode of procurement copied from linked NOA (if available)
  modeOfProcurement?: string
  // WFP scope information
  wfpScope?: 'Project' | 'Activity'
  projectTitle?: string
  linkedNoticeOfAward?: NoticeOfAward
}

interface ContractStore {
  contracts: Contract[]
  noas: NOA[]
  addContract: (contract: Contract) => void
  updateContract: (id: string, patch: Partial<Contract>) => void
  removeContract: (id: string) => void
  getApprovedNOAs: (category?: ContractCategory) => NOA[]
  getNOAById: (id: string) => NOA | undefined
}

function mapNoticeOfAwardTypeToContractCategory(
  type: NoticeOfAwardType,
): ContractCategory {
  switch (type) {
    case 'goods-services':
      return 'Goods and Services'
    case 'infrastructure':
      return 'Infrastructure'
    case 'consulting':
      return 'Consulting'
    default:
      return 'Consulting'
  }
}

function mapNoticeOfAwardLineItemToContractItem(
  item: NoticeOfAwardLineItem,
): ContractItem {
  return {
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    unitOfMeasure: item.unit,
    unitPrice: item.unitPrice,
    totalAmount: item.amount,
    specifications: item.description,
    category: item.category,
  }
}

function buildSupplierId(noticeOfAward: NoticeOfAward) {
  return (
    noticeOfAward.linkedBacResolution.sourceBidEvaluationSupplierId ??
    noticeOfAward.supplierName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  )
}

function mapNoticeOfAwardToContractNoa(noticeOfAward: NoticeOfAward): NOA {
  return {
    id: noticeOfAward.id,
    noaNumber: noticeOfAward.noaNumber,
    noaDate: noticeOfAward.date,
    category: mapNoticeOfAwardTypeToContractCategory(noticeOfAward.type),
    status: noticeOfAward.status,
    supplierName: noticeOfAward.supplierName,
    supplierId: buildSupplierId(noticeOfAward),
    totalAmount: noticeOfAward.totalAmount,
    items: noticeOfAward.lineItems.map(mapNoticeOfAwardLineItemToContractItem),
    modeOfProcurement: noticeOfAward.linkedConsolidatedPr.modeOfProcurement,
    description: noticeOfAward.description,
    wfpScope: 'Project',
    projectTitle: noticeOfAward.projectName,
    type: noticeOfAward.type,
    linkedNoticeOfAward: noticeOfAward,
  }
}

const MOCK_CONTRACT_STATUSES: Contract['status'][] = [
  'draft',
  'for-approval',
  'approved',
  'returned',
  'draft',
]

function getMockContractStatus(index: number): Contract['status'] {
  return (
    MOCK_CONTRACT_STATUSES[index % MOCK_CONTRACT_STATUSES.length] ?? 'draft'
  )
}

function toContractDate(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.includes('T') ? value.slice(0, 10) : value.split(' ')[0]
}

function getMockNoticeOfAwardsForContracts() {
  const noticeOfAwards = getNoticeOfAwardDatabase()
  const noticeOfAwardsById = new Map(
    noticeOfAwards.map((noticeOfAward) => [noticeOfAward.id, noticeOfAward]),
  )

  const preferredNoticeOfAwardIds = [
    'noa-004',
    'noa-010',
    'noa-002',
    'noa-003',
    'noa-005',
  ]

  const selected = preferredNoticeOfAwardIds
    .map((id) => noticeOfAwardsById.get(id))
    .filter((noticeOfAward): noticeOfAward is NoticeOfAward =>
      Boolean(noticeOfAward),
    )

  for (const noticeOfAward of noticeOfAwards) {
    if (selected.length >= 5) break
    if (!selected.some((item) => item.id === noticeOfAward.id)) {
      selected.push(noticeOfAward)
    }
  }

  const seedSelection = selected.slice(0, 5)
  const result = [...seedSelection]

  while (seedSelection.length > 0 && result.length < 5) {
    const nextNoticeOfAward =
      seedSelection[result.length % seedSelection.length]
    if (nextNoticeOfAward) result.push(nextNoticeOfAward)
  }

  return result
}

function buildMockContractFromNoticeOfAward(
  noticeOfAward: NoticeOfAward,
  index: number,
): Contract {
  const mappedNoa = mapNoticeOfAwardToContractNoa(noticeOfAward)
  const status = getMockContractStatus(index)

  return {
    id: `contract-mock-${index + 1}`,
    contractDate: toContractDate(
      noticeOfAward.contractExecutionDate ??
        noticeOfAward.issuedAt ??
        noticeOfAward.approvedAt ??
        noticeOfAward.date,
    ),
    contractNumber: `CONTRACT-2026-MOCK-${String(index + 1).padStart(3, '0')}`,
    description: noticeOfAward.description,
    noaId: `mock-linked-${noticeOfAward.id}-${index + 1}`,
    noaNumber: mappedNoa.noaNumber,
    supplierName: mappedNoa.supplierName,
    supplierId: mappedNoa.supplierId,
    totalAmount: mappedNoa.totalAmount,
    items: mappedNoa.items.map((item) => ({ ...item })),
    category: mappedNoa.category,
    status,
    createdAt: noticeOfAward.createdAt,
    approvedAt:
      status === 'approved'
        ? (noticeOfAward.approvedAt ?? undefined)
        : undefined,
    approvedBy:
      status === 'approved'
        ? (noticeOfAward.approvedBy ?? undefined)
        : undefined,
    remarks: status === 'returned' ? 'Returned for mock review.' : undefined,
    modeOfProcurement: mappedNoa.modeOfProcurement,
    wfpScope: mappedNoa.wfpScope,
    projectTitle: mappedNoa.projectTitle,
    linkedNoticeOfAward: noticeOfAward,
  }
}

function buildMockContractsFromNoticeOfAwards() {
  return getMockNoticeOfAwardsForContracts().map(
    buildMockContractFromNoticeOfAward,
  )
}

export const useContractStore = create<ContractStore>((set, get) => ({
  // Mock NOA data for development/demo
  noas: [
    {
      id: 'noa-1',
      noaNumber: 'NOA-2026-001-CI',
      noaDate: '2026-04-10',
      category: 'Consulting',
      status: 'approved',
      supplierName: 'Global Consulting Partners Inc.',
      supplierId: 'supplier-1',
      totalAmount: 2500000,
      modeOfProcurement: 'Public Bidding',
      description: 'IT Infrastructure Consulting Services',
      wfpScope: 'Activity',
      items: [
        {
          id: 'item-1',
          itemName: 'Infrastructure Assessment and Planning',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 1000000,
          totalAmount: 1000000,
          specifications:
            'Complete infrastructure audit and strategic planning',
          deliverySchedule: '60 days',
        },
        {
          id: 'item-2',
          itemName: 'Network Architecture Design',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 800000,
          totalAmount: 800000,
          specifications: 'Detailed network design and documentation',
          deliverySchedule: '45 days',
        },
        {
          id: 'item-3',
          itemName: 'Security Audit Services',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 700000,
          totalAmount: 700000,
          specifications: 'Comprehensive security assessment',
          deliverySchedule: '30 days',
        },
      ],
    },
    {
      id: 'noa-2',
      noaNumber: 'NOA-2026-002-IN',
      noaDate: '2026-04-12',
      category: 'Infrastructure',
      status: 'approved',
      supplierName: 'BuildRight Construction Corp.',
      supplierId: 'supplier-2',
      totalAmount: 15750000,
      modeOfProcurement: 'Public Bidding',
      description: 'Office Building Renovation Project',
      items: [
        {
          id: 'item-4',
          itemName: 'Structural Renovation',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 8000000,
          totalAmount: 8000000,
          specifications: 'Complete structural reinforcement and renovation',
          deliverySchedule: '180 days',
        },
        {
          id: 'item-5',
          itemName: 'Electrical System Upgrade',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 4500000,
          totalAmount: 4500000,
          specifications: 'Full electrical system replacement and upgrade',
          deliverySchedule: '120 days',
        },
        {
          id: 'item-6',
          itemName: 'HVAC Installation',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 3250000,
          totalAmount: 3250000,
          specifications: 'Central air conditioning and ventilation system',
          deliverySchedule: '90 days',
        },
      ],
    },
    {
      id: 'noa-3',
      noaNumber: 'NOA-2026-003-CI',
      noaDate: '2026-04-15',
      category: 'Infrastructure',
      status: 'approved',
      supplierName: 'Mega Infrastructure Solutions Ltd.',
      supplierId: 'supplier-3',
      totalAmount: 8500000,
      modeOfProcurement: 'Public Bidding',
      description: 'Road Construction and Improvement',
      wfpScope: 'Project',
      projectTitle: 'Road Construction and Street Lighting Project',
      items: [
        {
          id: 'item-7',
          itemName: 'Road Paving',
          quantity: 2500,
          unitOfMeasure: 'sqm',
          unitPrice: 2500,
          totalAmount: 6250000,
          specifications: 'Asphalt paving with proper drainage',
          deliverySchedule: '150 days',
        },
        {
          id: 'item-8',
          itemName: 'Street Lighting Installation',
          quantity: 45,
          unitOfMeasure: 'units',
          unitPrice: 50000,
          totalAmount: 2250000,
          specifications: 'LED street lights with solar panels',
          deliverySchedule: '60 days',
        },
      ],
    },
    {
      id: 'noa-4',
      noaNumber: 'NOA-2026-004-CO',
      noaDate: '2026-04-18',
      category: 'Consulting',
      status: 'approved',
      supplierName: 'Strategic Management Advisors',
      supplierId: 'supplier-4',
      totalAmount: 1800000,
      modeOfProcurement: 'Public Bidding',
      description: 'Business Process Improvement Consulting',
      items: [
        {
          id: 'item-9',
          itemName: 'Process Analysis and Documentation',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 900000,
          totalAmount: 900000,
          specifications: 'Complete business process mapping and analysis',
          deliverySchedule: '45 days',
        },
        {
          id: 'item-10',
          itemName: 'Implementation Support',
          quantity: 1,
          unitOfMeasure: 'lot',
          unitPrice: 900000,
          totalAmount: 900000,
          specifications: 'Change management and implementation guidance',
          deliverySchedule: '90 days',
        },
      ],
    },
  ],

  // Mock table rows only. These do not use Manage NOA approved IDs, so approved
  // NOAs remain available in the Create Contract picker until actually linked.
  contracts: buildMockContractsFromNoticeOfAwards(),

  addContract: (contract) =>
    set((state) => ({
      contracts: [...state.contracts, contract],
    })),

  updateContract: (id, patch) =>
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),

  removeContract: (id) =>
    set((state) => ({
      contracts: state.contracts.filter((c) => c.id !== id),
    })),

  getApprovedNOAs: (category) => {
    return getNoticeOfAwardDatabase()
      .filter((noa) => noa.status === 'approved')
      .map(mapNoticeOfAwardToContractNoa)
      .filter((noa) => {
        if (category && noa.category !== category) return false
        return true
      })
  },

  getNOAById: (id) => {
    const noticeOfAward = findNoticeOfAward(id)

    if (noticeOfAward?.status === 'approved') {
      return mapNoticeOfAwardToContractNoa(noticeOfAward)
    }

    const contractWithLinkedNoticeOfAward = get().contracts.find(
      (contract) => contract.noaId === id && contract.linkedNoticeOfAward,
    )

    if (contractWithLinkedNoticeOfAward?.linkedNoticeOfAward) {
      return {
        ...mapNoticeOfAwardToContractNoa(
          contractWithLinkedNoticeOfAward.linkedNoticeOfAward,
        ),
        id,
      }
    }

    const { noas } = get()
    return noas.find((noa) => noa.id === id)
  },
}))
