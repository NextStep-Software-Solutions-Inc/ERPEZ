import { usePurchaseOrderStore } from '../data/purchaseOrderStore'

export const getPurchaseOrdersRequest = () =>
  usePurchaseOrderStore.getState().purchaseOrders

export const getPurchaseOrderRequest = (purchaseOrderId: string) =>
  usePurchaseOrderStore.getState().getPurchaseOrderById(purchaseOrderId)
