import { api } from "~/services/api";
import type {
  BillingContact,
  CardBrand,
  CreatePaymentMethodInput,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PaymentMethod,
  PaymentMethodType,
} from "../types";
import type {
  BillingRepository,
  DeletePaymentMethodResult,
  PaymentProcessResult,
} from "./billingRepository";

interface BackendInvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BackendInvoiceDto {
  id: string;
  tenantId: string;
  tenantSubscriptionId?: string;
  invoiceNumber: string;
  planName: string;
  billingCycle: string;
  invoiceDate: string;
  dueDate: string;
  paidDate?: string | null;
  subtotalAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethodSummary?: string | null;
  items: BackendInvoiceItemDto[];
}

interface BackendPaymentMethodDto {
  id: string;
  tenantId: string;
  type: string;
  brand?: string | null;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
}

interface BackendDeletePaymentMethodResponse {
  promotedDefaultId?: string | null;
}

interface BackendBillingContactDto {
  companyName: string;
  billingEmail: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  taxId?: string | null;
}

function normalizePaymentMethodType(rawType: string): PaymentMethodType {
  const normalized = (rawType || "").toLowerCase().replace(/[-_ ]/g, "");
  if (normalized === "banktransfer") return "bank_transfer";
  if (normalized === "ewallet") return "ewallet";
  return "credit_card";
}

function normalizeCardBrand(rawBrand?: string | null): CardBrand {
  const b = (rawBrand || "").toLowerCase();
  if (b === "visa" || b === "mastercard" || b === "amex" || b === "discover") {
    return b;
  }
  return "other";
}

function mapPaymentMethod(dto: BackendPaymentMethodDto): PaymentMethod {
  return {
    id: dto.id,
    type: normalizePaymentMethodType(dto.type),
    brand: normalizeCardBrand(dto.brand),
    last4: dto.last4,
    expiryMonth: dto.expiryMonth,
    expiryYear: dto.expiryYear,
    cardholderName: dto.cardholderName,
    isDefault: dto.isDefault,
    createdAt: dto.createdAt,
  };
}

function mapInvoice(dto: BackendInvoiceDto): Invoice {
  const items: InvoiceItem[] = (dto.items || []).map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPriceCents: Math.round(Number(item.unitPrice || 0) * 100),
    totalCents: Math.round(Number(item.totalPrice || 0) * 100),
  }));

  const invoiceDate = (dto.invoiceDate || "").includes("T")
    ? dto.invoiceDate.split("T")[0]
    : dto.invoiceDate;

  const dueDate = (dto.dueDate || "").includes("T")
    ? dto.dueDate.split("T")[0]
    : dto.dueDate;

  const paidDate = dto.paidDate
    ? dto.paidDate.includes("T")
      ? dto.paidDate.split("T")[0]
      : dto.paidDate
    : undefined;

  return {
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    tenantId: dto.tenantId,
    planName: dto.planName,
    billingCycle: (dto.billingCycle?.toLowerCase() === "yearly" ? "yearly" : "monthly"),
    invoiceDate,
    dueDate,
    paidDate,
    subtotalCents: Math.round(Number(dto.subtotalAmount || 0) * 100),
    taxRate: Number(dto.taxRate || 0),
    taxCents: Math.round(Number(dto.taxAmount || 0) * 100),
    totalCents: Math.round(Number(dto.totalAmount || 0) * 100),
    currency: dto.currency || "USD",
    status: (dto.status?.toLowerCase() || "draft") as InvoiceStatus,
    paymentMethodSummary: dto.paymentMethodSummary || undefined,
    items,
  };
}

export class ApiBillingRepository implements BillingRepository {
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    const response = await api.get<{ data: BackendPaymentMethodDto[] }>(
      "/billing/payment-methods",
      { params: { tenantId } }
    );
    const dtos = response.data?.data || [];
    return dtos.map(mapPaymentMethod);
  }

  async addPaymentMethod(
    tenantId: string,
    input: CreatePaymentMethodInput
  ): Promise<PaymentMethod> {
    const payload = {
      tenantId,
      type: input.type,
      cardNumber: input.cardNumber,
      cardholderName: input.cardholderName,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      cvc: input.cvc,
      setAsDefault: input.setAsDefault,
    };

    const response = await api.post<{ data: BackendPaymentMethodDto }>(
      "/billing/payment-methods",
      payload
    );
    return mapPaymentMethod(response.data.data);
  }

  async setDefaultPaymentMethod(
    _tenantId: string,
    methodId: string
  ): Promise<void> {
    await api.put(`/billing/payment-methods/${methodId}/default`);
  }

  async deletePaymentMethod(
    _tenantId: string,
    methodId: string
  ): Promise<DeletePaymentMethodResult> {
    const response = await api.delete<{ data: BackendDeletePaymentMethodResponse }>(
      `/billing/payment-methods/${methodId}`
    );
    return {
      promotedDefaultId: response.data?.data?.promotedDefaultId || undefined,
    };
  }

  async getInvoices(tenantId: string): Promise<Invoice[]> {
    const response = await api.get<{ data: BackendInvoiceDto[] }>(
      "/billing/invoices",
      { params: { tenantId, pageSize: 50 } }
    );
    const dtos = response.data?.data || [];
    return dtos.map(mapInvoice);
  }

  async getInvoiceById(
    _tenantId: string,
    invoiceId: string
  ): Promise<Invoice | null> {
    try {
      const response = await api.get<{ data: BackendInvoiceDto }>(
        `/billing/invoices/${invoiceId}`
      );
      if (!response.data?.data) return null;
      return mapInvoice(response.data.data);
    } catch {
      return null;
    }
  }

  async processSimulatedPayment(
    _tenantId: string,
    invoiceId: string,
    paymentMethodId: string
  ): Promise<PaymentProcessResult> {
    try {
      const response = await api.post<{ data: BackendInvoiceDto }>(
        `/billing/invoices/${invoiceId}/pay`,
        { paymentMethodId }
      );
      if (response.data?.data) {
        return {
          success: true,
          invoice: mapInvoice(response.data.data),
        };
      }
      return { success: false, error: "Payment processing failed" };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      return {
        success: false,
        error: message || "Failed to process payment. Please try again.",
      };
    }
  }

  async getBillingContact(tenantId: string): Promise<BillingContact> {
    const response = await api.get<{ data: BackendBillingContactDto }>(
      "/billing/contact",
      { params: { tenantId } }
    );
    const data = response.data?.data || ({} as BackendBillingContactDto);
    return {
      companyName: data.companyName || "",
      billingEmail: data.billingEmail || "",
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      postalCode: data.postalCode || undefined,
      taxId: data.taxId || undefined,
    };
  }

  async updateBillingContact(
    tenantId: string,
    contact: BillingContact
  ): Promise<BillingContact> {
    const response = await api.put<{ data: BackendBillingContactDto }>(
      "/billing/contact",
      {
        tenantId,
        companyName: contact.companyName,
        billingEmail: contact.billingEmail,
        address: contact.address,
        city: contact.city,
        country: contact.country,
        postalCode: contact.postalCode,
        taxId: contact.taxId,
      }
    );
    const data = response.data?.data || contact;
    return {
      companyName: data.companyName || contact.companyName,
      billingEmail: data.billingEmail || contact.billingEmail,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      postalCode: data.postalCode || undefined,
      taxId: data.taxId || undefined,
    };
  }
}

export const apiBillingRepository = new ApiBillingRepository();
