/**
 * Catalog Mock Data & Core Atoms
 * Jotai atoms for managing catalog items, requests, and RBAC state
 * Session-based state (resets on page reload)
 */

import { atom } from 'jotai'
import type {
  ApproveItemRequestInput,
  CatalogCurrentUser,
  CreateCatalogItemInput,
  CreateItemRequestInput,
  ItemRequest,
  NonCSEItem,
  ReturnItemRequestInput,
  UpdateCatalogItemInput,
  UserRole,
} from '../types/catalog.types'
import { buildItemRequest } from '../handlers/requestWorkflow'

function generateId(prefix: 'item' | 'req') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildCatalogItem(
  input: CreateCatalogItemInput,
  requestingOffice?: string | null,
  requestingUser?: string | null,
): NonCSEItem {
  return {
    id: generateId('item'),
    name: input.name,
    category: input.category,
    subcategory: input.subcategory ?? null,
    unitOfMeasure: input.unitOfMeasure,
    currentPrice: input.currentPrice,
    specification: input.specification,
    itemType: input.itemType,
    supplier: input.supplier ?? null,
    imageUrl: input.imageUrl ?? null,
    uacsCode: input.uacsCode ?? null,
    unspscCode: input.unspscCode,
    isCSE: input.isCSE,
    sourceRequestId: input.sourceRequestId ?? null,
    requestingOffice: requestingOffice ?? null,
    requestingUser: requestingUser ?? null,
    createdDate: new Date(),
    lastModified: new Date(),
  }
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

/**
 * Mock Active Catalog Items (20-50 items)
 * Master data managed by Admin/TWG
 */
const MOCK_CATALOG_ITEMS: NonCSEItem[] = [
  {
    id: 'item-001',
    name: 'Dell Latitude 5000 Laptop',
    category: 'IT Equipment',
    subcategory: 'Computers',
    unitOfMeasure: 'unit',
    currentPrice: 65000,
    specification:
      '15.6" Intel i5, 16GB RAM, 512GB SSD, Windows 11 Professional',
    itemType: 'Goods',
    supplier: 'Dell Philippines',
    imageUrl: null,
    uacsCode: '30111500-IT-EQP-001',
    unspscCode: '43211503',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-01-15'),
    lastModified: new Date('2025-03-01'),
  },
  {
    id: 'item-002',
    name: 'HP LaserJet Pro M404n Printer',
    category: 'IT Equipment',
    subcategory: 'Peripherals',
    unitOfMeasure: 'unit',
    currentPrice: 28000,
    specification: 'Monochrome laser printer, 40ppm, Network-enabled',
    itemType: 'Goods',
    supplier: 'HP Philippines',
    imageUrl: null,
    uacsCode: '30111500-IT-EQP-002',
    unspscCode: '43212105',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-01-20'),
    lastModified: new Date('2025-03-01'),
  },
  {
    id: 'item-003',
    name: 'Stackable Metal Storage Cabinet',
    category: 'Office Supplies',
    subcategory: 'Furniture',
    unitOfMeasure: 'unit',
    currentPrice: 12500,
    specification: 'Steel construction, 4-shelf, lockable, 180cm Height',
    itemType: 'Goods',
    supplier: 'Local Office Furniture Co.',
    imageUrl: null,
    uacsCode: '30111700-OFF-SUP-001',
    unspscCode: '56101500',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-02-01'),
    lastModified: new Date('2025-03-05'),
  },
  {
    id: 'item-004',
    name: 'Resin Office Chair - Ergonomic',
    category: 'Office Supplies',
    subcategory: 'Furniture',
    unitOfMeasure: 'unit',
    currentPrice: 8500,
    specification:
      'Mesh back, adjustable height, lumbar support, 5-year warranty',
    itemType: 'Goods',
    supplier: null,
    imageUrl: null,
    uacsCode: '30111700-OFF-SUP-002',
    unspscCode: '56101504',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-01-10'),
    lastModified: new Date('2025-03-01'),
  },
  {
    id: 'item-005',
    name: 'Xerox Bond Paper A4 500 sheets',
    category: 'Office Supplies',
    subcategory: 'Materials',
    unitOfMeasure: 'ream',
    currentPrice: 350,
    specification: 'Copy paper, 80gsm, white, 500 sheets per ream',
    itemType: 'Goods',
    supplier: 'Xerox Philippines',
    imageUrl: null,
    uacsCode: '30111700-OFF-SUP-003',
    unspscCode: '14111506',
    isCSE: true,
    sourceRequestId: null,
    createdDate: new Date('2025-02-15'),
    lastModified: new Date('2025-03-10'),
  },
  {
    id: 'item-006',
    name: 'Concrete Grade 30 per Cubic Meter',
    category: 'Building/Structure',
    subcategory: 'Materials',
    unitOfMeasure: 'cubic meter',
    currentPrice: 4500,
    specification: 'Ready-mix concrete, compressive strength 30 MPa',
    itemType: 'Infra',
    supplier: 'Manila Concrete Supply',
    imageUrl: null,
    uacsCode: '30211000-INFRA-001',
    unspscCode: '30111601',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-01-25'),
    lastModified: new Date('2025-03-08'),
  },
  {
    id: 'item-007',
    name: 'Steel Reinforcement Bars (Deformed) per Ton',
    category: 'Building/Structure',
    subcategory: 'Materials',
    unitOfMeasure: 'ton',
    currentPrice: 45000,
    specification: 'Grade 40, 16mm diameter, deformed steel bars',
    itemType: 'Infra',
    supplier: 'Philippine Steel Inc.',
    imageUrl: null,
    uacsCode: '30211000-INFRA-002',
    unspscCode: '30102601',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-02-10'),
    lastModified: new Date('2025-03-09'),
  },
  {
    id: 'item-008',
    name: 'Asphalt Concrete per Ton',
    category: 'Roadworks',
    subcategory: 'Materials',
    unitOfMeasure: 'ton',
    currentPrice: 3200,
    specification: 'AC-20, 100% virgin aggregate, 160/220 penetration grade',
    itemType: 'Infra',
    supplier: null,
    imageUrl: null,
    uacsCode: '30211100-INFRA-003',
    unspscCode: '30121502',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-02-20'),
    lastModified: new Date('2025-03-07'),
  },
  {
    id: 'item-009',
    name: 'Civil Engineering Consultation - Design Phase',
    category: 'Professional Services',
    subcategory: 'Services',
    unitOfMeasure: 'hour',
    currentPrice: 3500,
    specification: 'Senior engineer rates for detailed design phase consulting',
    itemType: 'Consulting',
    supplier: 'Apex Engineering Consultants',
    imageUrl: null,
    uacsCode: '30191600-CONS-001',
    unspscCode: '71212100',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-03-01'),
    lastModified: new Date('2025-03-11'),
  },
  {
    id: 'item-010',
    name: 'Microsoft Office 365 License (Annual)',
    category: 'IT Equipment',
    subcategory: 'Software',
    unitOfMeasure: 'license',
    currentPrice: 8500,
    specification:
      'Enterprise subscription, includes Teams, OneDrive, SharePoint',
    itemType: 'Goods',
    supplier: 'Microsoft Philippines',
    imageUrl: null,
    uacsCode: '30111500-IT-EQP-010',
    unspscCode: '43220000',
    isCSE: false,
    sourceRequestId: null,
    createdDate: new Date('2025-02-05'),
    lastModified: new Date('2025-03-06'),
  },
]

/**
 * Mock Item Requests (20-50 pending/approved/returned)
 * User submissions waiting for Admin approval
 */
const MOCK_ITEM_REQUESTS: ItemRequest[] = [
  {
    id: 'req-000',
    name: 'Draft Request for Meeting Kits',
    procurementCategory: 'Goods',
    itemCategory: 'Office Supplies',
    uacsCode: null,
    unitOfMeasure: 'set',
    estimatedUnitCost: 2500,
    specifications:
      'Draft placeholder for meeting kits including notepads, pens, and folders.',
    imageUrl: null,
    status: 'Draft',
    requestDate: new Date('2025-03-18'),
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Planning Division',
    requestingUser: 'John Doe',
    createdBy: 'john.doe@agency.gov',
    remarks: null,
    unspscCode: null,
    isCSE: null,
  },
  {
    id: 'req-001',
    name: 'Epson EF-22 Full HD Projector',
    procurementCategory: 'Goods',
    itemCategory: 'IT Equipment',
    uacsCode: '30111500-IT-EQP-010',
    unitOfMeasure: 'unit',
    estimatedUnitCost: 42000,
    specifications:
      'Bright full HD projector for conference rooms. 5000 lumens brightness, 300-inch max screen size',
    imageUrl: null,
    status: 'Submitted',
    requestDate: new Date('2025-03-15'),
    submittedAt: new Date('2025-03-15'),
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Communications Division',
    requestingUser: 'Maria Santos',
    createdBy: 'maria.santos@agency.gov',
  },
  {
    id: 'req-002',
    name: 'Logitech Conference Microphone System',
    procurementCategory: 'Goods',
    itemCategory: 'IT Equipment',
    uacsCode: '30111500-IT-EQP-011',
    unitOfMeasure: 'set',
    estimatedUnitCost: 15000,
    specifications:
      '360° ceiling-mounted microphone array with wireless transmitter. USB-C connectivity for Zoom/Teams integration',
    imageUrl: null,
    status: 'Submitted',
    requestDate: new Date('2025-03-14'),
    submittedAt: new Date('2025-03-14'),
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Human Resources',
    requestingUser: 'Juan Dela Cruz',
    createdBy: 'juan.delacruz@agency.gov',
  },
  {
    id: 'req-003',
    name: 'APC Smart UPS 3000VA',
    procurementCategory: 'Goods',
    itemCategory: 'IT Equipment',
    uacsCode: '30111500-IT-EQP-012',
    unitOfMeasure: 'unit',
    estimatedUnitCost: 85000,
    specifications:
      'Uninterruptible Power Supply with SmartConnect capability. 3000VA capacity, line-interactive topology, 24-hour battery backup simulation',
    imageUrl: null,
    status: 'Approved',
    requestDate: new Date('2025-03-10'),
    submittedAt: new Date('2025-03-10'),
    reviewedAt: new Date('2025-03-11'),
    reviewedBy: 'TWG Admin',
    requestingOffice: 'IT Operations',
    requestingUser: 'Robert Nguyen',
    createdBy: 'robert.nguyen@agency.gov',
    remarks: 'Approved with standardized naming and pricing baseline.',
    unspscCode: '43210000',
    isCSE: false,
  },
  {
    id: 'req-004',
    name: 'Staples - Premium Sticky Notes',
    procurementCategory: 'Goods',
    itemCategory: 'Office Supplies',
    uacsCode: '30111700-OFF-SUP-010',
    unitOfMeasure: 'pack',
    estimatedUnitCost: 450,
    specifications:
      '3x3 inch neon colored sticky notes. Acid-free, repositionable adhesive. 100 sheets per pad, 12 pads per pack',
    imageUrl: null,
    status: 'Returned',
    requestDate: new Date('2025-03-08'),
    submittedAt: new Date('2025-03-08'),
    reviewedAt: new Date('2025-03-09'),
    reviewedBy: 'TWG Admin',
    requestingOffice: 'Planning Division',
    requestingUser: 'Lisa Wong',
    createdBy: 'lisa.wong@agency.gov',
    remarks:
      'Request rejected - Similar item already exists in catalog (Item ID: item-005). Please use existing item instead.',
  },
  {
    id: 'req-005',
    name: 'Reinforced Concrete Pipe 600mm Diameter',
    procurementCategory: 'Infra',
    itemCategory: 'Building/Structure',
    uacsCode: '30211000-INFRA-010',
    unitOfMeasure: 'piece',
    estimatedUnitCost: 12000,
    specifications:
      'Non-Pressure Reinforced Concrete Pipe (NPRCP). Class D, 600mm internal diameter, 1000mm length. Anchor lugs included.',
    imageUrl: null,
    status: 'Submitted',
    requestDate: new Date('2025-03-16'),
    submittedAt: new Date('2025-03-16'),
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Water Resources Division',
    requestingUser: 'Carlos Reyes',
    createdBy: 'carlos.reyes@agency.gov',
  },
  {
    id: 'req-006',
    name: 'Bituminous Emulsion (SS-1h) per Liter',
    procurementCategory: 'Infra',
    itemCategory: 'Roadworks',
    uacsCode: '30211000-INFRA-011',
    unitOfMeasure: 'liter',
    estimatedUnitCost: 85,
    specifications:
      'Slow-set anionic bituminous emulsion. Used for road construction sealing and tacking. ISO 6931 compliant.',
    imageUrl: null,
    status: 'Approved',
    requestDate: new Date('2025-03-12'),
    submittedAt: new Date('2025-03-12'),
    reviewedAt: new Date('2025-03-13'),
    reviewedBy: 'TWG Admin',
    requestingOffice: 'Public Works',
    requestingUser: 'Antonio Fernandez',
    createdBy: 'antonio.fernandez@agency.gov',
    remarks: 'Approved for infrastructure planning catalog.',
    unspscCode: '30121502',
    isCSE: false,
  },
  {
    id: 'req-007',
    name: 'Certified Project Management Training (PMP Prep)',
    procurementCategory: 'Consulting',
    itemCategory: 'Training',
    uacsCode: '30211000-PROF-SVC-010',
    unitOfMeasure: 'training course',
    estimatedUnitCost: 35000,
    specifications:
      '5-day intensive PMP certification preparation course. Includes 35 contact hours, study materials, and 2 mock exams. Accredited trainer.',
    imageUrl: null,
    status: 'Submitted',
    requestDate: new Date('2025-03-17'),
    submittedAt: new Date('2025-03-17'),
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Project Management Office',
    requestingUser: 'Patricia Gomez',
    createdBy: 'patricia.gomez@agency.gov',
  },
  {
    id: 'req-008',
    name: 'Adobe Creative Cloud Suite Annual License',
    procurementCategory: 'Goods',
    itemCategory: 'IT Equipment',
    uacsCode: '30111500-IT-EQP-013',
    unitOfMeasure: 'license',
    estimatedUnitCost: 18000,
    specifications:
      'Full Creative Cloud suite including Photoshop, Illustrator, InDesign, Premiere Pro. 1-year subscription per user.',
    imageUrl: null,
    status: 'Submitted',
    requestDate: new Date('2025-03-13'),
    submittedAt: new Date('2025-03-13'),
    reviewedAt: null,
    reviewedBy: null,
    requestingOffice: 'Communications Division',
    requestingUser: 'Sofia Morales',
    createdBy: 'sofia.morales@agency.gov',
  },
]

// ─── JOTAI ATOMS ───────────────────────────────────────────────────────────

/**
 * RBAC Role Toggle (session-based, for dev/testing)
 * Determines which tabs/interface to show
 */
export const userRoleAtom = atom<UserRole>('user')

/**
 * Master Catalog Items (all items, Active + Inactive)
 */
export const catalogItemsAtom = atom<NonCSEItem[]>(
  MOCK_CATALOG_ITEMS.map((item) => ({
    ...item,
    createdDate: new Date(item.createdDate),
    lastModified: new Date(item.lastModified),
  })),
)

/**
 * Backward-compatible alias for catalogItemsAtom
 */
export const activeCatalogItemsAtom = catalogItemsAtom

/**
 * Item Requests Queue (for request workflow)
 * Contains all user submissions at any status
 */
export const itemRequestsAtom = atom<ItemRequest[]>(
  MOCK_ITEM_REQUESTS.map((req) => ({
    ...req,
    requestDate: new Date(req.requestDate),
  })),
)

/**
 * Current User Info (mock)
 */
export const currentUserAtom = atom<CatalogCurrentUser>({
  id: 'user-current',
  name: 'John Doe',
  email: 'john.doe@agency.gov',
  office: 'Planning Division',
})

/**
 * Derived Catalog Selectors
 */
export const catalogRequestSourceMapAtom = atom((get) => {
  const items = get(catalogItemsAtom)
  return new Map(
    items
      .filter((item) => item.sourceRequestId)
      .map((item) => [item.sourceRequestId as string, item]),
  )
})

/**
 * Derived Request Selectors
 */
export const submittedItemRequestsAtom = atom((get) =>
  get(itemRequestsAtom).filter((request) => request.status === 'Submitted'),
)

/**
 * Legacy alias retained during the Pending → Submitted rename.
 * Use `submittedItemRequestsAtom` in new code.
 */
export const pendingItemRequestsAtom = submittedItemRequestsAtom

export const reviewedItemRequestsAtom = atom((get) =>
  get(itemRequestsAtom).filter((request) => request.status !== 'Draft'),
)

export const requestCountsAtom = atom((get) => {
  const requests = get(itemRequestsAtom)
  const submittedCount = requests.filter(
    (request) => request.status === 'Submitted',
  ).length
  return {
    all: requests.length,
    draft: requests.filter((request) => request.status === 'Draft').length,
    submitted: submittedCount,
    pending: submittedCount,
    approved: requests.filter((request) => request.status === 'Approved')
      .length,
    returned: requests.filter((request) => request.status === 'Returned')
      .length,
  }
})

/**
 * Write Atoms - transactional state transitions for the Non-CSE workflow
 */
export const submitItemRequestAtom = atom(
  null,
  (get, set, input: CreateItemRequestInput) => {
    const currentUser = get(currentUserAtom)
    const newRequest = buildItemRequest(
      input,
      currentUser,
      input.status ?? 'Submitted',
    )
    set(itemRequestsAtom, (prev) => [newRequest, ...prev])
  },
)

export const createCatalogItemAtom = atom(
  null,
  (_get, set, input: CreateCatalogItemInput) => {
    const newItem = buildCatalogItem(input)
    set(catalogItemsAtom, (prev) => [newItem, ...prev])
  },
)

export const updateCatalogItemAtom = atom(
  null,
  (_get, set, { itemId, changes }: UpdateCatalogItemInput) => {
    set(catalogItemsAtom, (prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        return {
          ...item,
          ...changes,
          lastModified: new Date(),
        }
      }),
    )
  },
)

export const deleteCatalogItemAtom = atom(
  null,
  (_get, set, itemId: string) => {
    set(catalogItemsAtom, (prev) => prev.filter((item) => item.id !== itemId))
  },
)

export const approveItemRequestAtom = atom(
  null,
  (get, set, { requestId, catalogItem, remarks }: ApproveItemRequestInput) => {
    const existingRequest = get(itemRequestsAtom).find(
      (request) => request.id === requestId,
    )

    if (!existingRequest) {
      throw new Error('Item request not found.')
    }

    if (existingRequest.status !== 'Submitted') {
      throw new Error('Only submitted requests can be approved.')
    }

    const requestAlreadyCataloged = get(catalogItemsAtom).some(
      (item) => item.sourceRequestId === requestId,
    )

    if (requestAlreadyCataloged) {
      throw new Error(
        'This request has already been converted to a catalog item.',
      )
    }

    const approvedCatalogItem = buildCatalogItem(
      {
        ...catalogItem,
        sourceRequestId: requestId,
        uacsCode: catalogItem.uacsCode ?? existingRequest.uacsCode ?? null,
        unspscCode: catalogItem.unspscCode || existingRequest.unspscCode || '',
        isCSE: catalogItem.isCSE ?? existingRequest.isCSE ?? false,
      },
      existingRequest.requestingOffice,
      existingRequest.requestingUser,
    )

    set(itemRequestsAtom, (prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'Approved',
              remarks: remarks ?? request.remarks ?? null,
              unspscCode: approvedCatalogItem.unspscCode ?? null,
              isCSE: approvedCatalogItem.isCSE,
              reviewedAt: new Date(),
              reviewedBy: 'TWG Admin',
            }
          : request,
      ),
    )

    set(catalogItemsAtom, (prev) => [approvedCatalogItem, ...prev])
  },
)

export const returnItemRequestAtom = atom(
  null,
  (_get, set, { requestId, remarks }: ReturnItemRequestInput) => {
    if (!remarks.trim()) {
      throw new Error('Remarks are required when returning a request.')
    }

    set(itemRequestsAtom, (prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'Returned',
              remarks: remarks.trim(),
              reviewedAt: new Date(),
              reviewedBy: 'TWG Admin',
            }
          : request,
      ),
    )
  },
)

/**
 * Filter state for requests table
 * Used by Admin to filter request status
 */
export const requestStatusFilterAtom = atom<ItemRequest['status'] | 'all'>(
  'all',
)
