/**
 * Purchase Request Store
 * Manages state for PR workflows across all tasks
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  PurchaseRequest,
  PRHeaderDetails,
  PRItem,
  PRDashboardMetrics,
  APR,
  PPMPItem,
} from '../types'

// In development, avoid purging persisted store on every load.
// Use a one-time migration marker or an explicit env flag to trigger a purge.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    const MIGRATION_MARKER_KEY = 'purchase-request-store-migration-v1'
    const explicitPurge =
      // Set NEXT_PUBLIC_PURGE_PURCHASE_REQUEST_STORE=true to force purge in dev
      (typeof process !== 'undefined' &&
        (process.env as any).NEXT_PUBLIC_PURGE_PURCHASE_REQUEST_STORE ===
          'true') ||
      false

    const alreadyMigrated = !!localStorage.getItem(MIGRATION_MARKER_KEY)

    if (explicitPurge) {
      // Developer requested explicit purge — remove both keys and mark migration.
      localStorage.removeItem('purchase-request-store')
      localStorage.removeItem('purchase-request-store-dev')
      localStorage.setItem(MIGRATION_MARKER_KEY, Date.now().toString())
    } else if (!alreadyMigrated) {
      // One-time migration: remove legacy key if present, but keep dev seed persistence thereafter.
      // This prevents wiping developer state on every reload while allowing a safe migration path.
      if (localStorage.getItem('purchase-request-store')) {
        localStorage.removeItem('purchase-request-store')
      }
      localStorage.setItem(MIGRATION_MARKER_KEY, Date.now().toString())
    }
  } catch (e) {
    // ignore
  }
}

interface PurchaseRequestStore {
  // Active PR
  activePR: PurchaseRequest | null
  setActivePR: (pr: PurchaseRequest | null) => void

  // Draft PR being created
  draftPR: Partial<PurchaseRequest> | null
  setDraftPR: (pr: Partial<PurchaseRequest> | null) => void

  // Current header details being edited
  currentHeaderDetails: Partial<PRHeaderDetails> | null
  setCurrentHeaderDetails: (details: Partial<PRHeaderDetails>) => void

  // Items being edited
  currentItems: PRItem[]
  addItem: (item: PRItem) => void
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, item: Partial<PRItem>) => void

  // Dashboard metrics
  metrics: PRDashboardMetrics | null
  setMetrics: (metrics: PRDashboardMetrics) => void

  // APRs (for out-of-stock flow)
  aprs: APR[]
  setAprs: (aprs: APR[]) => void
  // Return APRs that are approved and contain out-of-stock items with CNAS
  getEligibleAprs: () => APR[]
  // Attach APR out-of-stock items into an existing PR (copies quantities; unitPrice set to 0 for user to input)
  addAprItemsToPR: (prId: string, aprId: string) => void

  // PPMP items for 'Add Office PPMP' flow
  ppmpItems: PPMPItem[]
  setPpmpItems: (items: PPMPItem[]) => void
  // Filter PPMP items by optional category, month, fund
  getFilteredPpmpItems: (filters: {
    category?: string
    month?: string
    fund?: string
  }) => PPMPItem[]
  // Add selected PPMP item ids to a PR
  addPpmpItemsToPR: (prId: string, ppmpItemIds: string[]) => void

  // All PRs list
  purchaseRequests: PurchaseRequest[]
  setPurchaseRequests: (prs: PurchaseRequest[]) => void
  addPurchaseRequest: (pr: PurchaseRequest) => void
  updatePurchaseRequest: (id: string, pr: Partial<PurchaseRequest>) => void
  deletePurchaseRequest: (id: string) => void

  // Approve / Return actions (for Manage PR dashboard)
  // Approving requires uploading a signed PDF (signedPdfUrl)
  approvePurchaseRequest: (id: string, signedPdfUrl: string) => void
  // Returning requires mandatory remarks/reason
  returnPurchaseRequest: (id: string, remarks: string) => void

  // Helper to get submitted PRs for Manage PR dashboard
  getSubmittedPRs: () => PurchaseRequest[]

  // Reset state
  resetDraft: () => void

  // Flag to indicate the UI is currently in the Manage PR tab/view
  isManagePRView: boolean
  setIsManagePRView: (v: boolean) => void
}

const PERSIST_NAME =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'purchase-request-store-dev'
    : 'purchase-request-store'

export const usePurchaseRequestStore = create<PurchaseRequestStore>()(
  persist(
    (set, get) => ({
      activePR: null,
      setActivePR: (pr) => set({ activePR: pr }),

      draftPR: null,
      setDraftPR: (pr) => set({ draftPR: pr }),

      currentHeaderDetails: null,
      setCurrentHeaderDetails: (details) =>
        set((state) => ({
          currentHeaderDetails: {
            ...state.currentHeaderDetails,
            ...details,
          },
        })),

      currentItems: [],
      addItem: (item) =>
        set((state) => ({
          currentItems: [...state.currentItems, item],
        })),
      removeItem: (itemId) =>
        set((state) => ({
          currentItems: state.currentItems.filter((i) => i.id !== itemId),
        })),
      updateItem: (itemId, item) =>
        set((state) => ({
          currentItems: state.currentItems.map((i) =>
            i.id === itemId ? { ...i, ...item } : i,
          ),
        })),

      metrics: null,
      setMetrics: (metrics) => set({ metrics }),

      // --- APR mock data and helpers ---
      aprs: [
        {
          id: 'apr-2026-01',
          aprNumber: 'APR-2026-01',
          status: 'approved',
          officeCode: 'OFF-01',
          officeName: 'Health Office',
          totalAmount: 50000,
          items: [
            {
              id: 'apr-item-001-1',
              itemName: 'Surgical Gloves (Box)',
              category: 'Office Supplies',
              quantity: 200,
              outOfStockQuantity: 50,
              unitOfMeasure: 'box',
              unitPrice: 250,
              totalAmount: 50000,
              cnasReferenceNumber: 'CNAS-2026-0001',
              month: 'April',
              fund: 'General Fund',
              monthlyQuantities: { January: 20, February: 20, March: 20, April: 20, May: 20, June: 20, July: 20, August: 20, September: 20, October: 20 },
            },
            {
              id: 'apr-item-001-2',
              itemName: 'Antiseptic Solution (Bottle)',
              category: 'Office Supplies',
              quantity: 80,
              outOfStockQuantity: 20,
              unitOfMeasure: 'bottle',
              unitPrice: 150,
              totalAmount: 12000,
              cnasReferenceNumber: 'CNAS-2026-0001-2',
              month: 'April',
              fund: 'General Fund',
              monthlyQuantities: { February: 20, April: 20, June: 20, August: 20 },
            },
            {
              id: 'apr-item-001-3',
              itemName: 'Disposable Gown (pcs)',
              category: 'Office Supplies',
              quantity: 100,
              outOfStockQuantity: 10,
              unitOfMeasure: 'pcs',
              unitPrice: 300,
              totalAmount: 30000,
              cnasReferenceNumber: 'CNAS-2026-0001-3',
              month: 'April',
              fund: 'General Fund',
              monthlyQuantities: { January: 25, April: 25, July: 25, October: 25 },
            },
          ],
        },
        {
          id: 'apr-2026-02',
          aprNumber: 'APR-2026-02',
          status: 'approved',
          officeCode: 'OFF-02',
          officeName: 'Medical Supplies',
          totalAmount: 75000,
          items: [
            {
              id: 'apr-item-002-1',
              itemName: 'Surgical Face Mask (Box)',
              category: 'Office Supplies',
              quantity: 500,
              outOfStockQuantity: 100,
              unitOfMeasure: 'box',
              unitPrice: 150,
              totalAmount: 75000,
              cnasReferenceNumber: 'CNAS-2026-0002',
              month: 'March',
              fund: 'General Fund',
              monthlyQuantities: { January: 50, February: 50, March: 50, April: 50, May: 50, June: 50, July: 50, August: 50, September: 50, October: 50 },
            },
            {
              id: 'apr-item-002-2',
              itemName: 'Face Shield (pcs)',
              category: 'Office Supplies',
              quantity: 200,
              outOfStockQuantity: 25,
              unitOfMeasure: 'pcs',
              unitPrice: 120,
              totalAmount: 24000,
              cnasReferenceNumber: 'CNAS-2026-0002-2',
              month: 'March',
              fund: 'General Fund',
              monthlyQuantities: { March: 50, June: 50, September: 50, December: 50 },
            },
          ],
        },
        {
          id: 'apr-2026-03',
          aprNumber: 'APR-2026-03',
          status: 'approved',
          officeCode: 'OFF-03',
          officeName: 'Pharmacy',
          totalAmount: 50000,
          items: [
            {
              id: 'apr-item-003-1',
              itemName: 'Lubricating Eye Drops (10ml)',
              category: 'Office Supplies',
              quantity: 100,
              outOfStockQuantity: 20,
              unitOfMeasure: 'bottle',
              unitPrice: 500,
              totalAmount: 50000,
              cnasReferenceNumber: 'CNAS-2026-0003',
              month: 'May',
              fund: 'General Fund',
              monthlyQuantities: { January: 10, March: 10, May: 20, July: 20, September: 20, November: 20 },
            },
            {
              id: 'apr-item-003-2',
              itemName: 'Cough Syrup (Bottle)',
              category: 'Office Supplies',
              quantity: 60,
              outOfStockQuantity: 5,
              unitOfMeasure: 'bottle',
              unitPrice: 200,
              totalAmount: 12000,
              cnasReferenceNumber: 'CNAS-2026-0003-2',
              month: 'May',
              fund: 'General Fund',
              monthlyQuantities: { February: 15, May: 15, August: 15, November: 15 },
            },
            {
              id: 'apr-item-003-3',
              itemName: 'Thermometer (pcs)',
              category: 'Office Equipment',
              quantity: 10,
              outOfStockQuantity: 2,
              unitOfMeasure: 'pcs',
              unitPrice: 800,
              totalAmount: 8000,
              cnasReferenceNumber: 'CNAS-2026-0003-3',
              month: 'May',
              fund: 'General Fund',
              monthlyQuantities: { March: 5, September: 5 },
            },
          ],
        },
        {
          id: 'apr-2026-04',
          aprNumber: 'APR-2026-04',
          status: 'approved',
          officeCode: 'OFF-04',
          officeName: 'Admin Office',
          totalAmount: 36000,
          items: [
            {
              id: 'apr-item-004-1',
              itemName: 'Whiteboard Marker Set (Box)',
              category: 'Office Supplies',
              quantity: 120,
              outOfStockQuantity: 30,
              unitOfMeasure: 'box',
              unitPrice: 300,
              totalAmount: 36000,
              cnasReferenceNumber: 'CNAS-2026-0004',
              month: 'January',
              fund: 'Operations Fund',
              monthlyQuantities: { January: 30, April: 30, July: 30, October: 30 },
            },
            {
              id: 'apr-item-004-2',
              itemName: 'Printer Paper (Ream)',
              category: 'Office Supplies',
              quantity: 50,
              outOfStockQuantity: 10,
              unitOfMeasure: 'ream',
              unitPrice: 200,
              totalAmount: 10000,
              cnasReferenceNumber: 'CNAS-2026-0004-2',
              month: 'January',
              fund: 'Operations Fund',
              monthlyQuantities: { January: 15, March: 10, June: 15, September: 10 },
            },
          ],
        },
        {
          id: 'apr-2026-05',
          aprNumber: 'APR-2026-05',
          status: 'approved',
          officeCode: 'OFF-05',
          officeName: 'IT Office',
          totalAmount: 60000,
          items: [
            {
              id: 'apr-item-005-1',
              itemName: 'Conference Microphone (pcs)',
              category: 'AV Equipment',
              quantity: 6,
              outOfStockQuantity: 2,
              unitOfMeasure: 'pcs',
              unitPrice: 10000,
              totalAmount: 60000,
              cnasReferenceNumber: 'CNAS-2026-0005',
              month: 'July',
              fund: 'General Fund',
              monthlyQuantities: { April: 3, October: 3 },
            },
            {
              id: 'apr-item-005-2',
              itemName: 'HDMI Cable (pcs)',
              category: 'IT Peripherals',
              quantity: 30,
              outOfStockQuantity: 8,
              unitOfMeasure: 'pcs',
              unitPrice: 500,
              totalAmount: 15000,
              cnasReferenceNumber: 'CNAS-2026-0005-2',
              month: 'July',
              fund: 'General Fund',
              monthlyQuantities: { January: 10, May: 10, September: 10 },
            },
          ],
        },
        {
          id: 'apr-2026-06',
          aprNumber: 'APR-2026-06',
          status: 'approved',
          officeCode: 'OFF-06',
          officeName: 'Facilities',
          totalAmount: 42000,
          items: [
            {
              id: 'apr-item-006-1',
              itemName: 'Office Table (pcs)',
              category: 'Furniture & Fixtures',
              quantity: 6,
              outOfStockQuantity: 1,
              unitOfMeasure: 'pcs',
              unitPrice: 7000,
              totalAmount: 42000,
              cnasReferenceNumber: 'CNAS-2026-0006',
              month: 'May',
              fund: 'Capital Outlays Fund',
              monthlyQuantities: { February: 2, May: 2, August: 2 },
            },
            {
              id: 'apr-item-006-2',
              itemName: 'Chair Cushion (pcs)',
              category: 'Furniture & Fixtures',
              quantity: 20,
              outOfStockQuantity: 4,
              unitOfMeasure: 'pcs',
              unitPrice: 1200,
              totalAmount: 24000,
              cnasReferenceNumber: 'CNAS-2026-0006-2',
              month: 'May',
              fund: 'Capital Outlays Fund',
              monthlyQuantities: { March: 10, September: 10 },
            },
          ],
        },
        {
          id: 'apr-2026-07',
          aprNumber: 'APR-2026-07',
          status: 'approved',
          officeCode: 'OFF-07',
          officeName: 'Procurement Unit',
          totalAmount: 180000,
          items: [
            {
              id: 'apr-item-007-1',
              itemName: 'Office Chair (Ergo)',
              category: 'Furniture & Fixtures',
              quantity: 10,
              outOfStockQuantity: 3,
              unitOfMeasure: 'pc',
              unitPrice: 18000,
              totalAmount: 180000,
              cnasReferenceNumber: 'CNAS-2026-0007',
              month: 'April',
              fund: 'General Fund',
              monthlyQuantities: { April: 5, October: 5 },
            },
            {
              id: 'apr-item-007-2',
              itemName: 'Desk Lamp (pcs)',
              category: 'Office Equipment',
              quantity: 20,
              outOfStockQuantity: 5,
              unitOfMeasure: 'pcs',
              unitPrice: 800,
              totalAmount: 16000,
              cnasReferenceNumber: 'CNAS-2026-0007-2',
              month: 'April',
              fund: 'General Fund',
              monthlyQuantities: { February: 5, May: 5, August: 5, November: 5 },
            },
          ],
        },
        {
          id: 'apr-2026-08',
          aprNumber: 'APR-2026-08',
          status: 'approved',
          officeCode: 'OFF-08',
          officeName: 'IT Helpdesk',
          totalAmount: 10000,
          items: [
            {
              id: 'apr-item-008-1',
              itemName: 'USB Flash Drive 32GB (pcs)',
              category: 'IT Peripherals',
              quantity: 25,
              outOfStockQuantity: 5,
              unitOfMeasure: 'pc',
              unitPrice: 400,
              totalAmount: 10000,
              cnasReferenceNumber: 'CNAS-2026-0008',
              month: 'June',
              fund: 'General Fund',
              monthlyQuantities: { March: 10, June: 8, September: 7 },
            },
            {
              id: 'apr-item-008-2',
              itemName: 'Wireless Mouse (pcs)',
              category: 'IT Peripherals',
              quantity: 15,
              outOfStockQuantity: 3,
              unitOfMeasure: 'pcs',
              unitPrice: 600,
              totalAmount: 9000,
              cnasReferenceNumber: 'CNAS-2026-0008-2',
              month: 'June',
              fund: 'General Fund',
              monthlyQuantities: { June: 8, December: 7 },
            },
          ],
        },
        {
          id: 'apr-2026-09',
          aprNumber: 'APR-2026-09',
          status: 'approved',
          officeCode: 'OFF-09',
          officeName: 'Finance Office',
          totalAmount: 30000,
          items: [
            {
              id: 'apr-item-009-1',
              itemName: 'Printer (pcs)',
              category: 'Office Equipment',
              quantity: 2,
              outOfStockQuantity: 1,
              unitOfMeasure: 'pcs',
              unitPrice: 15000,
              totalAmount: 30000,
              cnasReferenceNumber: 'CNAS-2026-0009',
              month: 'August',
              fund: 'Operations Fund',
              monthlyQuantities: { April: 1, October: 1 },
            },
            {
              id: 'apr-item-009-2',
              itemName: 'Toner Cartridge (pcs)',
              category: 'Office Supplies',
              quantity: 10,
              outOfStockQuantity: 2,
              unitOfMeasure: 'pcs',
              unitPrice: 2500,
              totalAmount: 25000,
              cnasReferenceNumber: 'CNAS-2026-0009-2',
              month: 'August',
              fund: 'Operations Fund',
              monthlyQuantities: { February: 3, May: 4, August: 3 },
            },
          ],
        },
        {
          id: 'apr-2026-10',
          aprNumber: 'APR-2026-10',
          status: 'approved',
          officeCode: 'OFF-10',
          officeName: 'General Services',
          totalAmount: 40000,
          items: [
            {
              id: 'apr-item-010-1',
              itemName: 'LED TV 55\" (unit)',
              category: 'AV Equipment',
              quantity: 1,
              outOfStockQuantity: 1,
              unitOfMeasure: 'unit',
              unitPrice: 40000,
              totalAmount: 40000,
              cnasReferenceNumber: 'CNAS-2026-0010',
              month: 'October',
              fund: 'General Fund',
              monthlyQuantities: { October: 1 },
            },
            {
              id: 'apr-item-010-2',
              itemName: 'Projection Screen (pcs)',
              category: 'AV Equipment',
              quantity: 2,
              outOfStockQuantity: 1,
              unitOfMeasure: 'pcs',
              unitPrice: 8000,
              totalAmount: 16000,
              cnasReferenceNumber: 'CNAS-2026-0010-2',
              month: 'October',
              fund: 'General Fund',
              monthlyQuantities: { April: 1, October: 1 },
            },
          ],
        },
      ],
      setAprs: (aprs) => set({ aprs }),
      getEligibleAprs: () => {
        // Approved APRs that have at least one item with outOfStockQuantity > 0 and a CNAS ref
        return (get().aprs || []).filter(
          (apr) =>
            apr.status === 'approved' &&
            apr.items &&
            apr.items.some(
              (it) => it.outOfStockQuantity > 0 && !!it.cnasReferenceNumber,
            ),
        )
      },
      addAprItemsToPR: (prId, aprId) =>
        set((state) => {
          const apr = state.aprs.find((a) => a.id === aprId)
          if (!apr) return state
          const orphanedItems = apr.items
            .filter(
              (it) => it.outOfStockQuantity > 0 && !!it.cnasReferenceNumber,
            )
            .map<PRItem>((it) => ({
              id: `pritem-${apr.id}-${it.id}`,
              itemId: it.id,
              itemName: it.itemName,
              category: it.category,
              quantity: it.outOfStockQuantity,
              unitOfMeasure: it.unitOfMeasure,
              // keep unitPrice 0 for the user to fill, but preserve the APR unit price
              estimatedUnitPrice: it.unitPrice ?? 0,
              unitPrice: 0, // to be filled by user
              totalAmount: 0,
              source: 'apr',
            }))

          const updatedPRs = state.purchaseRequests.map((p) => {
            if (p.id !== prId) return p
            const newItems = [...p.items, ...orphanedItems]
            const newTotal = newItems.reduce(
              (s, i) => s + (i.totalAmount || 0),
              0,
            )
            return { ...p, items: newItems, totalAmount: newTotal }
          })

          return { ...state, purchaseRequests: updatedPRs }
        }),

      // --- PPMP mock data and helpers ---
      ppmpItems: [
        {
          id: 'ppmp-001',
          itemName: 'Office Chair (Ergo)',
          category: 'Furniture',
          isCse: false,
          quantity: 10,
          unitOfMeasure: 'pc',
          // Increased unit price to raise total PPMP amount so available balance is not negative
          estimatedUnitPrice: 18000,
          totalAmount: 180000,
          month: 'April',
          fund: 'GF',
        },
        {
          id: 'ppmp-002',
          itemName: 'Ballpoint Pen (Box)',
          category: 'Stationery',
          isCse: false,
          quantity: 20,
          unitOfMeasure: 'box',
          estimatedUnitPrice: 4500,
          totalAmount: 90000,
          month: 'April',
          fund: 'GF',
        },
        {
          id: 'ppmp-003',
          itemName: 'Projector Lamp',
          category: 'AV Equipment',
          isCse: false,
          quantity: 5,
          unitOfMeasure: 'pc',
          estimatedUnitPrice: 30000,
          totalAmount: 150000,
          month: 'May',
          fund: 'SF',
        },
        {
          id: 'ppmp-004',
          itemName: 'Stapler',
          category: 'Stationery',
          isCse: false,
          quantity: 15,
          unitOfMeasure: 'pc',
          estimatedUnitPrice: 1333,
          totalAmount: 19995,
          month: 'April',
          fund: 'GF',
        },
        {
          id: 'ppmp-005',
          itemName: 'USB Flash Drive 32GB',
          category: 'IT Peripherals',
          isCse: false,
          quantity: 25,
          unitOfMeasure: 'pc',
          estimatedUnitPrice: 400,
          totalAmount: 10000,
          month: 'June',
          fund: 'GF',
        },
      ],
      setPpmpItems: (items) => set({ ppmpItems: items }),
      getFilteredPpmpItems: (filters) => {
        const list = get().ppmpItems || []
        return list.filter((it) => {
          if (filters.category && it.category !== filters.category) return false
          if (filters.month && it.month !== filters.month) return false
          if (filters.fund && it.fund !== filters.fund) return false
          return true
        })
      },
      addPpmpItemsToPR: (prId, ppmpItemIds) =>
        set((state) => {
          const selected = (state.ppmpItems || []).filter((i) =>
            ppmpItemIds.includes(i.id),
          )
          const converted: PRItem[] = selected.map((it) => ({
            id: `pritem-ppmp-${it.id}`,
            itemId: it.id,
            itemName: it.itemName,
            category: it.category,
            quantity: it.quantity,
            unitOfMeasure: it.unitOfMeasure,
            estimatedUnitPrice: it.estimatedUnitPrice,
            unitPrice: it.estimatedUnitPrice,
            totalAmount: it.quantity * it.estimatedUnitPrice,
            source: 'ppmp',
          }))

          const updatedPRs = state.purchaseRequests.map((p) => {
            if (p.id !== prId) return p
            const newItems = [...p.items, ...converted]
            const newTotal = newItems.reduce(
              (s, i) => s + (i.totalAmount || 0),
              0,
            )
            return { ...p, items: newItems, totalAmount: newTotal }
          })

          return { ...state, purchaseRequests: updatedPRs }
        }),

      purchaseRequests: [
        // Pre-seeded BAC-Approved PRs (Path A Edge Cases for Public Bidding, Direct Contracting, and SVP)
        {
          id: 'pr-bac-demo-01',
          type: 'non-cse',
          status: 'approved',
          approvalOrigin: 'APPROVED_VIA_BAC',
          bacResolutionNumber: 'BAC-RES-2026-APP01',
          modeOfProcurement: 'Public Bidding',
          officeCode: 'OFF-01',
          officeName: 'ICT Center',
          headerDetails: {
            date: '2026-05-11',
            prNumber: 'PR-2026-BAC-APP01',
            description: 'Procurement of High-Performance Servers and Networking Infrastructure',
            purpose: 'Procurement of High-Performance Servers and Networking Infrastructure',
            officeName: 'ICT Center',
            bacResolutionNumber: 'BAC-RES-2026-APP01',
            modeOfProcurement: 'Public Bidding',
            sourceType: 'APP_ITEM',
          },
          items: [
            {
              id: 'item-bac-01-1',
              itemId: 'it-server-01',
              itemName: 'High-Performance Rack Server 2U',
              category: 'IT Infrastructure',
              quantity: 2,
              unitOfMeasure: 'unit',
              unitPrice: 1250000,
              totalAmount: 2500000,
              source: 'bac',
            },
          ],
          totalAmount: 2500000,
          createdBy: 'BAC Procurement Unit',
          createdAt: '2026-05-11T09:00:00.000Z',
          updatedAt: '2026-05-11T09:00:00.000Z',
        },
        {
          id: 'pr-bac-demo-02',
          type: 'non-cse',
          status: 'approved',
          approvalOrigin: 'APPROVED_VIA_BAC',
          bacResolutionNumber: 'BAC-RES-2026-APP02',
          modeOfProcurement: 'Direct Contracting',
          officeCode: 'OFF-02',
          officeName: 'Software Engineering Unit',
          headerDetails: {
            date: '2026-05-13',
            prNumber: 'PR-2026-BAC-APP02',
            description: 'Direct Contracting for Proprietary Campus Software License Expansion',
            purpose: 'Direct Contracting for Proprietary Campus Software License Expansion',
            officeName: 'Software Engineering Unit',
            bacResolutionNumber: 'BAC-RES-2026-APP02',
            modeOfProcurement: 'Direct Contracting',
            sourceType: 'APP_ITEM',
          },
          items: [
            {
              id: 'item-bac-02-1',
              itemId: 'soft-lic-01',
              itemName: 'Proprietary Campus Enterprise Software License',
              category: 'Software',
              quantity: 1,
              unitOfMeasure: 'lot',
              unitPrice: 1800000,
              totalAmount: 1800000,
              source: 'bac',
            },
          ],
          totalAmount: 1800000,
          createdBy: 'BAC Procurement Unit',
          createdAt: '2026-05-13T10:00:00.000Z',
          updatedAt: '2026-05-13T10:00:00.000Z',
        },
        {
          id: 'pr-bac-demo-03',
          type: 'non-cse',
          status: 'approved',
          approvalOrigin: 'APPROVED_VIA_BAC',
          bacResolutionNumber: 'BAC-RES-2026-APP03',
          modeOfProcurement: 'Small Value Procurement',
          officeCode: 'OFF-03',
          officeName: 'Physical Plant Division',
          headerDetails: {
            date: '2026-05-15',
            prNumber: 'PR-2026-BAC-APP03',
            description: 'Small Value Procurement for Emergency Office Air Conditioning Units',
            purpose: 'Small Value Procurement for Emergency Office Air Conditioning Units',
            officeName: 'Physical Plant Division',
            bacResolutionNumber: 'BAC-RES-2026-APP03',
            modeOfProcurement: 'Small Value Procurement',
            sourceType: 'APP_ITEM',
          },
          items: [
            {
              id: 'item-bac-03-1',
              itemId: 'ac-unit-01',
              itemName: 'Inverter Split Type Air Conditioner 2.5HP',
              category: 'Facilities',
              quantity: 5,
              unitOfMeasure: 'unit',
              unitPrice: 70000,
              totalAmount: 350000,
              source: 'bac',
            },
          ],
          totalAmount: 350000,
          createdBy: 'BAC Procurement Unit',
          createdAt: '2026-05-15T11:00:00.000Z',
          updatedAt: '2026-05-15T11:00:00.000Z',
        },
        // Five Manage-PR mock entries (submitted) with offices, items and totals
        {
          id: 'pr-mgr-001',
          type: 'non-cse',
          status: 'submitted',
          officeCode: 'OFF-10',
          officeName: 'Procurement Unit',
          headerDetails: {
            date: '2026-04-08',
            prNumber: 'PR-2026-M01',
            description: 'Office laptops (Procurement review)',
            purpose: 'New staff onboarding',
          },
          items: [
            {
              id: 'item-mgr-001-1',
              itemId: 'it-2001',
              itemName: 'Laptop 14 inch',
              category: 'IT Peripherals',
              quantity: 4,
              unitOfMeasure: 'pc',
              unitPrice: 45000,
              totalAmount: 180000,
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 180000,
          createdBy: 'user-21',
          createdAt: '2026-04-08T08:00:00.000Z',
          updatedAt: '2026-04-08T08:00:00.000Z',
        },
        {
          id: 'pr-mgr-002',
          type: 'non-cse',
          status: 'submitted',
          officeCode: 'OFF-11',
          officeName: 'Finance Office',
          headerDetails: {
            date: '2026-04-07',
            prNumber: 'PR-2026-M02',
            description: 'Office chairs replacement',
            purpose: 'Ergonomics upgrade',
          },
          items: [
            {
              id: 'item-mgr-002-1',
              itemId: 'furn-3001',
              itemName: 'Ergo Office Chair',
              category: 'Furniture',
              quantity: 10,
              unitOfMeasure: 'pc',
              unitPrice: 8500,
              totalAmount: 85000,
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 85000,
          createdBy: 'user-22',
          createdAt: '2026-04-07T09:15:00.000Z',
          updatedAt: '2026-04-07T09:15:00.000Z',
        },
        {
          id: 'pr-mgr-003',
          type: 'non-cse',
          status: 'submitted',
          officeCode: 'OFF-12',
          officeName: 'Admin Office',
          headerDetails: {
            date: '2026-04-06',
            prNumber: 'PR-2026-M03',
            description: 'Stationery monthly replenishment',
            purpose: 'General office supplies',
          },
          items: [
            {
              id: 'item-mgr-003-1',
              itemId: 'stat-4001',
              itemName: 'Ballpoint Pen (Box)',
              category: 'Stationery',
              quantity: 30,
              unitOfMeasure: 'box',
              unitPrice: 450,
              totalAmount: 13500,
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 13500,
          createdBy: 'user-23',
          createdAt: '2026-04-06T13:45:00.000Z',
          updatedAt: '2026-04-06T13:45:00.000Z',
        },
        {
          id: 'pr-mgr-004',
          type: 'non-cse',
          status: 'submitted',
          officeCode: 'OFF-13',
          officeName: 'Operations',
          headerDetails: {
            date: '2026-04-05',
            prNumber: 'PR-2026-M04',
            description: 'Projector for training room',
            purpose: 'Replace faulty projector',
          },
          items: [
            {
              id: 'item-mgr-004-1',
              itemId: 'av-5001',
              itemName: 'Projector (Full HD)',
              category: 'AV Equipment',
              quantity: 1,
              unitOfMeasure: 'pc',
              unitPrice: 45000,
              totalAmount: 45000,
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 45000,
          createdBy: 'user-24',
          createdAt: '2026-04-05T14:00:00.000Z',
          updatedAt: '2026-04-05T14:00:00.000Z',
        },
        {
          id: 'pr-mgr-005',
          type: 'non-cse',
          status: 'submitted',
          officeCode: 'OFF-14',
          officeName: 'IT Support',
          headerDetails: {
            date: '2026-04-04',
            prNumber: 'PR-2026-M05',
            description: 'External SSD drives',
            purpose: 'Backup and deployment images',
          },
          items: [
            {
              id: 'item-mgr-005-1',
              itemId: 'it-2002',
              itemName: 'External SSD 1TB',
              category: 'IT Peripherals',
              quantity: 5,
              unitOfMeasure: 'pc',
              unitPrice: 7500,
              totalAmount: 37500,
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 37500,
          createdBy: 'user-25',
          createdAt: '2026-04-04T09:30:00.000Z',
          updatedAt: '2026-04-04T09:30:00.000Z',
        },

        // --- existing out-of-stock PR seeds left unchanged ---
        {
          id: 'pr-os-001',
          type: 'out-of-stock',
          status: 'draft',
          headerDetails: {
            date: '2026-04-03',
            prNumber: 'PR-OS-2026-01',
            description: 'Out-of-stock: Surgical Gloves',
            purpose: 'Procure gloves per CNAS',
            cnasReferenceNumber: 'CNAS-2026-0001',
            sourceAPR: 'APR-2026-05',
          },
          items: [
            {
              id: 'item-os-001-1',
              itemId: 'cse-1001',
              itemName: 'Surgical Gloves (Box)',
              quantity: 50,
              unitPrice: 250,
              totalAmount: 12500,
              unitOfMeasure: 'box',
              category: 'CSE',
              source: 'apr',
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 12500,
          createdBy: 'user-10',
          createdAt: '2026-04-03T09:00:00.000Z',
          updatedAt: '2026-04-03T09:00:00.000Z',
        },
        {
          id: 'pr-os-002',
          type: 'out-of-stock',
          status: 'draft',
          headerDetails: {
            date: '2026-04-02',
            prNumber: 'PR-OS-2026-02',
            description: 'Out-of-stock: Surgical Face Masks',
            purpose: 'Procure masks per CNAS',
            cnasReferenceNumber: 'CNAS-2026-0002',
            sourceAPR: 'APR-2026-07',
          },
          items: [
            {
              id: 'item-os-002-1',
              itemId: 'cse-1002',
              itemName: 'Surgical Face Mask (Box)',
              quantity: 100,
              unitPrice: 150,
              totalAmount: 15000,
              unitOfMeasure: 'box',
              category: 'CSE',
              source: 'apr',
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 15000,
          createdBy: 'user-11',
          createdAt: '2026-04-02T10:15:00.000Z',
          updatedAt: '2026-04-02T10:15:00.000Z',
        },
        {
          id: 'pr-os-003',
          type: 'out-of-stock',
          status: 'draft',
          headerDetails: {
            date: '2026-04-01',
            prNumber: 'PR-OS-2026-03',
            description: 'Out-of-stock: Eye Drops',
            purpose: 'Procure lubricating eye drops per CNAS',
            cnasReferenceNumber: 'CNAS-2026-0003',
            sourceAPR: 'APR-2026-03',
          },
          items: [
            {
              id: 'item-os-003-1',
              itemId: 'cse-1003',
              itemName: 'Lubricating Eye Drops (10ml)',
              quantity: 20,
              unitPrice: 500,
              totalAmount: 10000,
              unitOfMeasure: 'bottle',
              category: 'CSE',
              source: 'apr',
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 10000,
          createdBy: 'user-12',
          createdAt: '2026-04-01T08:30:00.000Z',
          updatedAt: '2026-04-01T08:30:00.000Z',
        },
        {
          id: 'pr-os-004',
          type: 'out-of-stock',
          status: 'draft',
          headerDetails: {
            date: '2026-03-31',
            prNumber: 'PR-OS-2026-04',
            description: 'Out-of-stock: IV Sets',
            purpose: 'Procure IV sets per CNAS',
            cnasReferenceNumber: 'CNAS-2026-0004',
            sourceAPR: 'APR-2026-02',
          },
          items: [
            {
              id: 'item-os-004-1',
              itemId: 'cse-1004',
              itemName: 'IV Set (Sterile)',
              quantity: 30,
              unitPrice: 800,
              totalAmount: 24000,
              unitOfMeasure: 'pc',
              category: 'CSE',
              source: 'apr',
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 24000,
          createdBy: 'user-13',
          createdAt: '2026-03-31T11:20:00.000Z',
          updatedAt: '2026-03-31T11:20:00.000Z',
        },
        {
          id: 'pr-os-005',
          type: 'out-of-stock',
          status: 'draft',
          headerDetails: {
            date: '2026-03-30',
            prNumber: 'PR-OS-2026-05',
            description: 'Out-of-stock: Face Shields',
            purpose: 'Procure face shields per CNAS',
            cnasReferenceNumber: 'CNAS-2026-0005',
            sourceAPR: 'APR-2026-01',
          },
          items: [
            {
              id: 'item-os-005-1',
              itemId: 'cse-1005',
              itemName: 'Face Shield',
              quantity: 40,
              unitPrice: 300,
              totalAmount: 12000,
              unitOfMeasure: 'pc',
              category: 'CSE',
              source: 'apr',
              estimatedUnitPrice: 0,
            },
          ],
          totalAmount: 12000,
          createdBy: 'user-14',
          createdAt: '2026-03-30T07:50:00.000Z',
          updatedAt: '2026-03-30T07:50:00.000Z',
        },
      ],

      setPurchaseRequests: (prs) => set({ purchaseRequests: prs }),
      addPurchaseRequest: (pr) =>
        set((state) => {
          const updated = [...state.purchaseRequests, pr]
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(
                PERSIST_NAME,
                JSON.stringify({
                  state: { purchaseRequests: updated, metrics: state.metrics },
                }),
              )
            }
          } catch (e) {
            // ignore
          }
          return { purchaseRequests: updated }
        }),
      updatePurchaseRequest: (id, pr) =>
        set((state) => {
          const updatedList = state.purchaseRequests.map((p) =>
            p.id === id ? { ...p, ...pr } : p,
          )
          const updatedActive =
            state.activePR && state.activePR.id === id
              ? { ...state.activePR, ...pr }
              : state.activePR
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(
                PERSIST_NAME,
                JSON.stringify({
                  state: {
                    purchaseRequests: updatedList,
                    metrics: state.metrics,
                  },
                }),
              )
            }
          } catch (e) {
            // ignore
          }
          return {
            purchaseRequests: updatedList,
            activePR: updatedActive,
          }
        }),

      // Approve a PR by uploading a signed PDF. signedPdfUrl is required.
      approvePurchaseRequest: (id, signedPdfUrl) =>
        set((state) => {
          // Only allow approve action when UI is in Manage PR tab
          if (!state.isManagePRView) {
            console.warn(
              'approvePurchaseRequest is only allowed in the Manage PR tab',
            )
            return state
          }

          if (!signedPdfUrl || signedPdfUrl.trim() === '') {
            console.warn('approvePurchaseRequest requires a signedPdfUrl')
            return state
          }

          const updated = state.purchaseRequests.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'approved' as any,
                  signedPdfUrl,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          )

          // derive activePR from the updated list to keep types aligned
          const updatedActive =
            state.activePR && state.activePR.id === id
              ? (updated.find((p) => p.id === id) as PurchaseRequest)
              : state.activePR

          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(
                PERSIST_NAME,
                JSON.stringify({
                  state: { purchaseRequests: updated, metrics: state.metrics },
                }),
              )
            }
          } catch (e) {
            // ignore
          }

          return { purchaseRequests: updated, activePR: updatedActive }
        }),

      // Return a PR - remarks (reason) are mandatory
      returnPurchaseRequest: (id, remarks) =>
        set((state) => {
          // Only allow return action when UI is in Manage PR tab
          if (!state.isManagePRView) {
            console.warn(
              'returnPurchaseRequest is only allowed in the Manage PR tab',
            )
            return state
          }

          if (!remarks || remarks.trim() === '') {
            console.warn('returnPurchaseRequest requires non-empty remarks')
            return state
          }

          const updated = state.purchaseRequests.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'returned' as any,
                  remarks,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          )

          const updatedActive =
            state.activePR && state.activePR.id === id
              ? (updated.find((p) => p.id === id) as PurchaseRequest)
              : state.activePR

          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(
                PERSIST_NAME,
                JSON.stringify({
                  state: { purchaseRequests: updated, metrics: state.metrics },
                }),
              )
            }
          } catch (e) {
            // ignore
          }

          return { purchaseRequests: updated, activePR: updatedActive }
        }),

      // Flag and setter to indicate the UI is currently showing the Manage PR tab
      isManagePRView: false,
      setIsManagePRView: (v: boolean) => set({ isManagePRView: v }),

      // Return only submitted PRs for Manage PR dashboard listing
      getSubmittedPRs: () =>
        (get().purchaseRequests || []).filter((p) => p.status === 'submitted'),

      deletePurchaseRequest: (id) =>
        set((state) => ({
          purchaseRequests: state.purchaseRequests.filter((p) => p.id !== id),
        })),

      resetDraft: () =>
        set({
          draftPR: null,
          currentHeaderDetails: null,
          currentItems: [],
          activePR: null,
        }),
    }),
    {
      // Use environment-aware key so production doesn't persist under a dev suffix.
      name: PERSIST_NAME,
      partialize: (state) => ({
        purchaseRequests: state.purchaseRequests,
        metrics: state.metrics,
      }),
    },
  ),
)
