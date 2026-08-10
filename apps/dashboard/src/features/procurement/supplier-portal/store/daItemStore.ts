import { create } from 'zustand'
import type { DirectContractingItem } from '../types/daItemTypes'

// ─── Dev-only fixture data ─────────────────────────────────────────────────────
// IMPORTANT: These items are only loaded when running in development mode
// (import.meta.env.DEV === true). In production the store starts empty and must
// be populated by API calls once the DA Item backend endpoint is integrated.
//
// TODO: Replace the initial `items` value with a real API fetch and delete
// DEV_SAMPLE_ITEMS once the data layer is in place.
const DEV_SAMPLE_ITEMS: DirectContractingItem[] = [
  {
    id: 'dai-001',
    daNumber: 'DA-2026-0001',
    prNumber: 'CPR-2026-M03',
    itemName: 'Bond Paper (A4, 80gsm) — 10 reams',
    supplierOrStore: 'National Bookstore — SM Branch',
    purchaseSource: 'Direct Store',
    quantity: 10,
    unit: 'ream',
    actualPurchaseAmount: 285,
    totalAmount: 2850,
    purchaseDate: '2026-05-08',
    status: 'pending_receipt',
  },
  {
    id: 'dai-002',
    daNumber: 'DA-2026-0002',
    prNumber: 'CPR-2026-M03',
    itemName: 'Ballpen (Black, 0.5mm) — 24 pcs',
    supplierOrStore: 'Mercury Drug — Main',
    purchaseSource: 'Local Market',
    quantity: 24,
    unit: 'pcs',
    actualPurchaseAmount: 18,
    totalAmount: 432,
    receiptFileName: 'receipt_DA-2026-0002.jpg',
    receiptAttachment:
      'https://placehold.co/800x600/e2f0ff/1e40af?text=Receipt+DA-2026-0002',
    purchaseDate: '2026-05-09',
    status: 'for_review',
    // Quotation submitted by supplier
    quotationStatus: 'submitted',
    quotationSubmittedAt: '2026-05-10T09:15:00.000Z',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Ballpen (Black, 0.5mm) — 24 pcs',
        qty: 24,
        unit: 'pcs',
        bidUnitPrice: 18,
        bidTotalAmount: 432,
        bidBrand: 'Pilot',
        bidModel: 'BPS-GP Extra Fine',
        bidColor: 'Black',
      },
    ],
    // DA Requirements submitted
    daRequirementsStatus: 'submitted',
    daRequirementsSubmittedAt: '2026-05-10T09:30:00.000Z',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0002.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/f5f3ff/4c1d95?text=Proof+of+Exclusivity',
    soleDistCertFileName: 'sole_distributorship_DA-2026-0002.pdf',
    soleDistCertUrl:
      'https://placehold.co/800x1100/fdf4ff/7e22ce?text=Sole+Distributorship+Certificate',
    proposalUnitPrice: 18,
    proposalNotes:
      'Pilot BPS-GP series; available immediately from Mercury Drug. Sole authorized distributor in this region.',
  },
  {
    id: 'dai-003',
    daNumber: 'DA-2026-0003',
    prNumber: 'CPR-2026-M04',
    itemName: 'Stapler (Heavy Duty)',
    supplierOrStore: 'Lazada — TechGadgetPH',
    purchaseSource: 'Online',
    quantity: 2,
    unit: 'unit',
    actualPurchaseAmount: 450,
    totalAmount: 900,
    receiptFileName: 'receipt_DA-2026-0003.pdf',
    receiptAttachment:
      'https://placehold.co/800x600/ecfdf5/065f46?text=Receipt+DA-2026-0003',
    purchaseDate: '2026-05-06',
    status: 'approved',
    approvedBy: 'Maria Santos',
    approvedAt: '2026-05-10',
    approvalDocumentFileName: 'approval_DA-2026-0003.pdf',
    approvalDocumentUrl:
      'https://placehold.co/800x1100/ffffff/111827?text=Signed+Approval+DA-2026-0003.pdf',
    remarks: 'Approved. All documents verified.',
    // Quotation submitted and approved
    quotationStatus: 'submitted',
    quotationSubmittedAt: '2026-05-07T14:00:00.000Z',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Stapler (Heavy Duty)',
        qty: 2,
        unit: 'unit',
        bidUnitPrice: 450,
        bidTotalAmount: 900,
        bidBrand: 'Max',
        bidModel: 'HD-50DF',
        bidColor: 'Black / Silver',
        bidBrochureFileName: 'max_hd50df_brochure.pdf',
        bidBrochureUrl:
          'https://placehold.co/800x1100/fff7ed/9a3412?text=Product+Brochure',
      },
    ],
    // DA Requirements submitted
    daRequirementsStatus: 'submitted',
    daRequirementsSubmittedAt: '2026-05-07T14:20:00.000Z',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0003.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/f0fdf4/14532d?text=Proof+of+Exclusivity',
    soleDistCertFileName: 'sole_distributorship_DA-2026-0003.pdf',
    soleDistCertUrl:
      'https://placehold.co/800x1100/f0fdf4/14532d?text=Sole+Distributorship+Certificate',
    proposalUnitPrice: 450,
    proposalNotes:
      'Max HD-50DF — TechGadgetPH is the sole authorized online distributor for Max staplers in Mindanao.',
  },
  {
    id: 'dai-004',
    daNumber: 'DA-2026-0004',
    prNumber: 'CPR-2026-M04',
    itemName: 'Toner Cartridge — HP 85A',
    supplierOrStore: 'HP Accredited Dealer',
    purchaseSource: 'Accredited Supplier',
    quantity: 1,
    unit: 'unit',
    actualPurchaseAmount: 3800,
    totalAmount: 3800,
    purchaseDate: '2026-05-02',
    status: 'rejected',
    remarks: 'Receipt not legible. Please resubmit a clear copy.',
    // Quotation was saved as draft before rejection
    quotationStatus: 'draft',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Toner Cartridge — HP 85A',
        qty: 1,
        unit: 'unit',
        bidUnitPrice: 3800,
        bidTotalAmount: 3800,
        bidBrand: 'HP',
        bidModel: 'CF285A',
        bidColor: 'Black',
      },
    ],
    // DA Requirements were saved as draft before rejection
    daRequirementsStatus: 'draft',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0004.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/fef2f2/991b1b?text=Proof+of+Exclusivity+(Draft)',
    proposalUnitPrice: 3800,
    proposalNotes:
      'HP official accredited dealer — only authorized supplier for HP consumables in the region.',
  },
  // Additional submitted mock items for Manage Supplier Direct Acquisition view
  {
    id: 'dai-005',
    daNumber: 'DA-2026-0005',
    prNumber: 'PR-2026-M05',
    itemName: 'Wireless Mouse (Ergonomic)',
    supplierOrStore: 'GadgetHub PH',
    purchaseSource: 'Online',
    quantity: 5,
    unit: 'pcs',
    actualPurchaseAmount: 450,
    totalAmount: 2250,
    receiptFileName: 'receipt_DA-2026-0005.jpg',
    receiptAttachment:
      'https://placehold.co/800x600/fff7ed/9a3412?text=Receipt+DA-2026-0005',
    purchaseDate: '2026-05-11',
    status: 'for_review',
    // Quotation submitted by supplier
    quotationStatus: 'submitted',
    quotationSubmittedAt: '2026-05-11T10:20:00.000Z',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Wireless Mouse (Ergonomic)',
        qty: 5,
        unit: 'pcs',
        bidUnitPrice: 450,
        bidTotalAmount: 2250,
        bidBrand: 'Logi',
      },
    ],
    daRequirementsStatus: 'submitted',
    daRequirementsSubmittedAt: '2026-05-11T11:00:00.000Z',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0005.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/eef2ff/1f3a93?text=Exclusivity+Proof',
    proposalUnitPrice: 450,
    proposalNotes: 'Local distributor with 1-year warranty and fast shipping.',
  },
  {
    id: 'dai-006',
    daNumber: 'DA-2026-0006',
    prNumber: 'PR-2026-M06',
    itemName: 'Office Chair (Standard)',
    supplierOrStore: 'OfficeComfort Co.',
    purchaseSource: 'Accredited Supplier',
    quantity: 3,
    unit: 'unit',
    actualPurchaseAmount: 7200,
    totalAmount: 21600,
    receiptFileName: 'receipt_DA-2026-0006.pdf',
    receiptAttachment:
      'https://placehold.co/800x600/ecfdf5/065f46?text=Receipt+DA-2026-0006',
    purchaseDate: '2026-05-03',
    status: 'approved',
    approvedBy: 'Luis Garcia',
    approvedAt: '2026-05-12',
    quotationStatus: 'submitted',
    quotationSubmittedAt: '2026-05-04T09:00:00.000Z',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Office Chair (Standard)',
        qty: 3,
        unit: 'unit',
        bidUnitPrice: 7200,
        bidTotalAmount: 21600,
        bidBrand: 'ComfortLine',
      },
    ],
    daRequirementsStatus: 'submitted',
    daRequirementsSubmittedAt: '2026-05-05T08:30:00.000Z',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0006.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/f7fee7/166534?text=Exclusivity+Proof',
    proposalUnitPrice: 7200,
    proposalNotes:
      'Government-accredited supplier for ergonomic office furniture.',
  },
  {
    id: 'dai-007',
    daNumber: 'DA-2026-0007',
    prNumber: 'PR-2026-M07',
    itemName: 'Printer Paper (A3, 100gsm) — 5 reams',
    supplierOrStore: 'PaperWorld Inc.',
    purchaseSource: 'Local Market',
    quantity: 5,
    unit: 'ream',
    actualPurchaseAmount: 520,
    totalAmount: 2600,
    receiptFileName: 'receipt_DA-2026-0007.jpg',
    receiptAttachment:
      'https://placehold.co/800x600/fef3ff/7e22ce?text=Receipt+DA-2026-0007',
    purchaseDate: '2026-05-08',
    status: 'rejected',
    remarks:
      'Unit price exceeded threshold. Please provide justification or a lower quote.',
    quotationStatus: 'submitted',
    quotationSubmittedAt: '2026-05-09T12:10:00.000Z',
    quotationItems: [
      {
        prItemId: 'single',
        itemName: 'Printer Paper (A3, 100gsm) — 5 reams',
        qty: 5,
        unit: 'ream',
        bidUnitPrice: 520,
        bidTotalAmount: 2600,
      },
    ],
    daRequirementsStatus: 'submitted',
    daRequirementsSubmittedAt: '2026-05-09T13:00:00.000Z',
    exclusivityProofFileName: 'exclusivity_proof_DA-2026-0007.pdf',
    exclusivityProofUrl:
      'https://placehold.co/800x1100/fff1f2/991b1b?text=Exclusivity+Proof',
    proposalUnitPrice: 520,
    proposalNotes:
      'Local supplier; price is negotiable but currently above threshold.',
  },
]

interface DAItemStore {
  items: DirectContractingItem[]
  updateItem: (id: string, patch: Partial<DirectContractingItem>) => void
}

export const useDAItemStore = create<DAItemStore>((set) => ({
  // Dev mode: pre-load fixture items so the UI is demonstrable without a backend.
  // Production: starts empty — items will be fetched from the DA Item API endpoint.
  items: import.meta.env.DEV ? DEV_SAMPLE_ITEMS : [],
  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    })),
}))
