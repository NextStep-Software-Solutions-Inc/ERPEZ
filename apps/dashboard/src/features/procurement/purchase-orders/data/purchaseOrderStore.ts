import { create } from 'zustand'
import {
  calculatePurchaseOrderTotal,
  cloneLineItems,
  initialPurchaseOrders,
  mockApprovedAobs,
  mockApprovedDirectAcquisitions,
  mockApprovedNoas,
} from './mockPurchaseOrderData'
import type {
  ApprovePurchaseOrderPayload,
  CreatePurchaseOrderPayload,
  LinkAobPayload,
  LinkDirectAcquisitionPayload,
  LinkNoaPayload,
  PrintPurchaseOrderResult,
  PurchaseOrder,
  ReturnPurchaseOrderPayload,
  SubmitPurchaseOrderPayload,
} from '../types'

type PurchaseOrderStore = {
  purchaseOrders: PurchaseOrder[]
  approvedAobs: typeof mockApprovedAobs
  approvedNoas: typeof mockApprovedNoas
  approvedDirectAcquisitions: typeof mockApprovedDirectAcquisitions
  getPurchaseOrderById: (purchaseOrderId: string) => PurchaseOrder | undefined
  createDraft: (payload: CreatePurchaseOrderPayload) => PurchaseOrder
  linkAob: (payload: LinkAobPayload) => PurchaseOrder | undefined
  linkNoa: (payload: LinkNoaPayload) => PurchaseOrder | undefined
  linkDirectAcquisition: (payload: LinkDirectAcquisitionPayload) => PurchaseOrder | undefined
  linkDirectAcquisitionByObject: (payload: { purchaseOrderId: string; da: any }) => PurchaseOrder | undefined
  submitForApproval: (
    payload: SubmitPurchaseOrderPayload,
  ) => PurchaseOrder | undefined
  returnPurchaseOrder: (
    payload: ReturnPurchaseOrderPayload,
  ) => PurchaseOrder | undefined
  approvePurchaseOrder: (
    payload: ApprovePurchaseOrderPayload,
  ) => PurchaseOrder | undefined
  printPurchaseOrder: (
    purchaseOrderId: string,
  ) => PrintPurchaseOrderResult | undefined
}

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function touchPurchaseOrder(purchaseOrder: PurchaseOrder) {
  return {
    ...purchaseOrder,
    updatedAt: new Date().toISOString(),
  }
}

export const usePurchaseOrderStore = create<PurchaseOrderStore>((set, get) => ({
  purchaseOrders: initialPurchaseOrders,
  approvedAobs: mockApprovedAobs,
  approvedNoas: mockApprovedNoas,
  approvedDirectAcquisitions: mockApprovedDirectAcquisitions,
  getPurchaseOrderById: (purchaseOrderId) =>
    get().purchaseOrders.find(
      (purchaseOrder) => purchaseOrder.id === purchaseOrderId,
    ),
  createDraft: (payload) => {
    const newPurchaseOrder: PurchaseOrder = {
      id: generateId('po'),
      poNumber: payload.poNumber,
      description: payload.description,
      source: payload.source,
      status: 'draft',
      date: payload.date,
      placeOfDelivery: payload.placeOfDelivery,
      dateOfDelivery: payload.dateOfDelivery,
      deliveryTerm: payload.deliveryTerm,
      paymentTerm: payload.paymentTerm,
      sourceDocumentType: (payload as any).sourceDocumentType ?? null,
      sourceDocumentId: (payload as any).sourceDocumentId ?? null,
      sourceDocumentNumber: (payload as any).sourceDocumentNumber ?? null,
      sourceDocumentDescription: (payload as any).sourceDocumentDescription ?? null,
      supplierName: payload.supplierName ?? null,
      supplierTin: payload.supplierTin ?? null,
      bidSupportingDocument: payload.bidSupportingDocument,
      totalAmount: (payload as any).totalAmount ?? 0,
      lineItems: (payload as any).lineItems ? cloneLineItems((payload as any).lineItems) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({
      purchaseOrders: [newPurchaseOrder, ...state.purchaseOrders],
    }))

    return newPurchaseOrder
  },
  linkAob: ({ purchaseOrderId, aobId }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)
    const selectedAob = get().approvedAobs.find((aob) => aob.id === aobId)

    if (!purchaseOrder || !selectedAob || purchaseOrder.status === 'approved') {
      return undefined
    }

    let linkedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        linkedPurchaseOrder = touchPurchaseOrder({
          ...po,
          sourceDocumentType: 'aob',
          sourceDocumentId: selectedAob.id,
          sourceDocumentNumber: selectedAob.aobNumber,
          sourceDocumentDescription: selectedAob.description,
          supplierName: selectedAob.winningSupplier,
          totalAmount: calculatePurchaseOrderTotal(selectedAob.awardedItems),
          lineItems: cloneLineItems(selectedAob.awardedItems),
        })

        return linkedPurchaseOrder
      }),
    }))

    return linkedPurchaseOrder
  },
  linkNoa: ({ purchaseOrderId, noaId }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)
    const selectedNoa = get().approvedNoas.find((noa) => noa.id === noaId)

    if (!purchaseOrder || !selectedNoa || purchaseOrder.status === 'approved') {
      return undefined
    }

    let linkedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        linkedPurchaseOrder = touchPurchaseOrder({
          ...po,
          sourceDocumentType: 'noa',
          sourceDocumentId: selectedNoa.id,
          sourceDocumentNumber: selectedNoa.noaNumber,
          sourceDocumentDescription: selectedNoa.description,
          supplierName: selectedNoa.supplierName,
          totalAmount: calculatePurchaseOrderTotal(selectedNoa.awardedItems),
          lineItems: cloneLineItems(selectedNoa.awardedItems),
        })

        return linkedPurchaseOrder
      }),
    }))

    return linkedPurchaseOrder
  },
  linkDirectAcquisition: ({ purchaseOrderId, daId }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)
    const selectedDa = get().approvedDirectAcquisitions.find(
      (da) => da.id === daId,
    )

    if (!purchaseOrder || !selectedDa || purchaseOrder.status === 'approved') {
      return undefined
    }

    let linkedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        linkedPurchaseOrder = touchPurchaseOrder({
          ...po,
          sourceDocumentType: 'direct-acquisition',
          sourceDocumentId: selectedDa.id,
          sourceDocumentNumber: selectedDa.daNumber,
          sourceDocumentDescription: selectedDa.description,
          supplierName: selectedDa.supplierName,
          totalAmount: calculatePurchaseOrderTotal(selectedDa.awardedItems),
          lineItems: cloneLineItems(selectedDa.awardedItems),
        })

        return linkedPurchaseOrder
      }),
    }))

    return linkedPurchaseOrder
  },
  // Link using a supplied DA object (useful when the DA originates from another store)
  linkDirectAcquisitionByObject: ({ purchaseOrderId, da }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)

    if (!purchaseOrder || !da || purchaseOrder.status === 'approved') {
      return undefined
    }

    let linkedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) return po

        linkedPurchaseOrder = touchPurchaseOrder({
          ...po,
          sourceDocumentType: 'direct-acquisition',
          sourceDocumentId: da.id,
          sourceDocumentNumber: da.daNumber,
          sourceDocumentDescription: da.description,
          supplierName: da.supplierName,
          totalAmount: calculatePurchaseOrderTotal(da.awardedItems),
          lineItems: cloneLineItems(da.awardedItems),
        })

        return linkedPurchaseOrder
      }),
    }))

    return linkedPurchaseOrder
  },
  submitForApproval: ({ purchaseOrderId }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)

    if (
      !purchaseOrder ||
      !(purchaseOrder.status === 'draft' || purchaseOrder.status === 'returned')
    ) {
      return undefined
    }

    let updatedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        updatedPurchaseOrder = touchPurchaseOrder({
          ...po,
          status: 'for-approval',
        })

        return updatedPurchaseOrder
      }),
    }))

    return updatedPurchaseOrder
  },
  returnPurchaseOrder: ({ purchaseOrderId, reason }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)

    if (!purchaseOrder || purchaseOrder.status !== 'for-approval') {
      return undefined
    }

    let updatedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        updatedPurchaseOrder = touchPurchaseOrder({
          ...po,
          status: 'returned',
          returnReason: reason,
        })

        return updatedPurchaseOrder
      }),
    }))

    return updatedPurchaseOrder
  },
  approvePurchaseOrder: ({ purchaseOrderId, signedDocument }) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)

    if (!purchaseOrder || purchaseOrder.status !== 'for-approval') {
      return undefined
    }

    let updatedPurchaseOrder: PurchaseOrder | undefined

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => {
        if (po.id !== purchaseOrderId) {
          return po
        }

        updatedPurchaseOrder = touchPurchaseOrder({
          ...po,
          status: 'approved',
          approvedBy: 'HOPE Office',
          approvedAt: new Date().toISOString(),
          signedDocument,
          signedDocumentFileName: signedDocument.name,
        })

        return updatedPurchaseOrder
      }),
    }))

    return updatedPurchaseOrder
  },
  printPurchaseOrder: (purchaseOrderId) => {
    const purchaseOrder = get().getPurchaseOrderById(purchaseOrderId)

    if (!purchaseOrder) {
      return undefined
    }

    const printFileName = `${purchaseOrder.poNumber}.pdf`
    const blob = new Blob(
      [
        `Purchase Order: ${purchaseOrder.poNumber}\n`,
        `Supplier: ${purchaseOrder.supplierName ?? 'Unlinked'}\n`,
        `Description: ${purchaseOrder.description}\n`,
        `Total Amount: ${purchaseOrder.totalAmount.toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}\n`,
      ],
      { type: 'application/pdf' },
    )

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((item) =>
        item.id === purchaseOrderId
          ? touchPurchaseOrder({
              ...item,
              printFileName,
            })
          : item,
      ),
    }))

    return {
      fileName: printFileName,
      blob,
    }
  },
}))
