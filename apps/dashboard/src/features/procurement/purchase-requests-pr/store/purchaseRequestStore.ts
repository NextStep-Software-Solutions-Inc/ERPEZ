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

      purchaseRequests: [],
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
