export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired";

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "void";

export type PaymentMethodType =
  | "credit_card"
  | "bank_transfer"
  | "ewallet";

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "other";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  setAsDefault: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  planName: string;
  billingCycle: BillingCycle;
  invoiceDate: string; // ISO string YYYY-MM-DD
  dueDate: string;     // ISO string YYYY-MM-DD
  paidDate?: string;    // ISO string YYYY-MM-DD
  subtotalCents: number;
  taxRate: number;      // e.g. 0.12 (12%) or 0.00
  taxCents: number;
  totalCents: number;
  currency: string;     // e.g. "USD"
  status: InvoiceStatus;
  paymentMethodSummary?: string;
  items: InvoiceItem[];
}

export interface BillingContact {
  companyName: string;
  billingEmail: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
}

export interface SubscriptionAdapter {
  planName: string;
  status: SubscriptionStatus;
  amountCents: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface NextInvoiceProjection {
  isApplicable: boolean;
  planName: string;
  billingCycle: BillingCycle;
  currency: string;
  dueDate: string;
  subtotalCents: number;
  taxRate: number;
  taxCents: number;
  totalCents: number;
  explanation?: string;
}
