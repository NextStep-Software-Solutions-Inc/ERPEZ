import type {
  BillingContact,
  CreatePaymentMethodInput,
  Invoice,
  PaymentMethod,
} from "../types";

export interface DeletePaymentMethodResult {
  promotedDefaultId?: string;
}

export interface PaymentProcessResult {
  success: boolean;
  error?: string;
  invoice?: Invoice;
}

export interface BillingRepository {
  getPaymentMethods(tenantId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(
    tenantId: string,
    input: CreatePaymentMethodInput
  ): Promise<PaymentMethod>;
  setDefaultPaymentMethod(tenantId: string, methodId: string): Promise<void>;
  deletePaymentMethod(
    tenantId: string,
    methodId: string
  ): Promise<DeletePaymentMethodResult>;
  getInvoices(tenantId: string): Promise<Invoice[]>;
  getInvoiceById(tenantId: string, invoiceId: string): Promise<Invoice | null>;
  processSimulatedPayment(
    tenantId: string,
    invoiceId: string,
    paymentMethodId: string
  ): Promise<PaymentProcessResult>;
  getBillingContact(tenantId: string): Promise<BillingContact>;
  updateBillingContact(
    tenantId: string,
    contact: BillingContact
  ): Promise<BillingContact>;
}
