import type { AppItemLink } from '../types'

export const MOCK_APP_ITEMS: AppItemLink[] = [
  {
    id: 'app-item-001',
    appNumber: 'APP-2026-001',
    itemNumber: 'Item 01',
    description: 'Procurement of High-Performance Laptops and Workstations for ICT Laboratory',
    officeName: 'ICT Office',
    modeOfProcurement: 'Public Bidding',
    sourceOfFund: 'GAA (General Appropriations Act)',
    abc: 2500000,
    status: 'eligible',
  },
  {
    id: 'app-item-002',
    appNumber: 'APP-2026-001',
    itemNumber: 'Item 02',
    description: 'Supply, Delivery, and Installation of Campus Fiber Optic Network Expansion',
    officeName: 'Network & Telecommunications Office',
    modeOfProcurement: 'Public Bidding',
    sourceOfFund: 'STF (Special Trust Fund)',
    abc: 4800000,
    status: 'eligible',
  },
  {
    id: 'app-item-003',
    appNumber: 'APP-2026-002',
    itemNumber: 'Item 01',
    description: 'Provision of Architectural Consultancy Services for New Library Annex',
    officeName: 'Capital Works & Physical Plant',
    modeOfProcurement: 'Competitive Bidding / Quality-Cost Based Evaluation',
    sourceOfFund: 'GAA (General Appropriations Act)',
    abc: 3200000,
    status: 'eligible',
  },
  {
    id: 'app-item-004',
    appNumber: 'APP-2026-002',
    itemNumber: 'Item 05',
    description: 'Procurement of Heavy Duty Multipurpose Printing and Scanning Equipment',
    officeName: 'Administrative Services Office',
    modeOfProcurement: 'Direct Contracting',
    sourceOfFund: 'Internally Generated Income (IGI)',
    abc: 950000,
    status: 'eligible',
  },
  {
    id: 'app-item-005',
    appNumber: 'APP-2026-003',
    itemNumber: 'Item 03',
    description: 'Supply and Delivery of Specialized Scientific Testing Apparatus for Chemical Engineering',
    officeName: 'College of Engineering and Architecture',
    modeOfProcurement: 'Public Bidding',
    sourceOfFund: 'DOST Grant-in-Aid Fund',
    abc: 1850000,
    status: 'eligible',
  },
  {
    id: 'app-item-006',
    appNumber: 'APP-2026-003',
    itemNumber: 'Item 08',
    description: 'Disaster Risk Reduction and Emergency Medical Response Vehicle Package',
    officeName: 'Health Services & Safety Office',
    modeOfProcurement: 'Negotiated Procurement - Two Failed Biddings',
    sourceOfFund: 'National Disaster Risk Reduction Fund',
    abc: 5500000,
    status: 'eligible',
  },
]

let mockAppItemDatabase: AppItemLink[] | null = null

export const getMockAppItemDatabase = (): AppItemLink[] => {
  if (!mockAppItemDatabase) {
    mockAppItemDatabase = [...MOCK_APP_ITEMS]
  }
  return mockAppItemDatabase
}

export const getEligibleAppItems = (): AppItemLink[] => {
  return getMockAppItemDatabase().filter((item) => item.status === 'eligible')
}

export const markAppItemAsLinked = (id: string) => {
  const db = getMockAppItemDatabase()
  const item = db.find((i) => i.id === id)
  if (item) {
    item.status = 'linked'
  }
}
