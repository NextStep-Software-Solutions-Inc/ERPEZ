import type {
  BillingContact,
  CreatePaymentMethodInput,
  Invoice,
  PaymentMethod,
} from "../types";
import { detectCardBrand } from "../utils/money";
import type {
  BillingRepository,
  DeletePaymentMethodResult,
  PaymentProcessResult,
} from "./billingRepository";

interface TenantBillingStorage {
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  contact: BillingContact;
}

function getStorageKey(tenantId: string): string {
  return `erpez_billing_mock_${tenantId || "default"}`;
}

function getInitialState(tenantId: string): TenantBillingStorage {
  return {
    paymentMethods: [
      {
        id: "pm_001",
        type: "credit_card",
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2028,
        cardholderName: "Tenant Admin",
        isDefault: true,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "pm_002",
        type: "credit_card",
        brand: "mastercard",
        last4: "8888",
        expiryMonth: 8,
        expiryYear: 2027,
        cardholderName: "Finance Department",
        isDefault: false,
        createdAt: "2025-06-15T00:00:00.000Z",
      },
    ],
    invoices: [
      {
        id: "inv_2026_003",
        invoiceNumber: "INV-2026-003",
        tenantId,
        planName: "Enterprise Plan - March 2026",
        billingCycle: "monthly",
        invoiceDate: "2026-03-01",
        dueDate: "2026-03-25",
        subtotalCents: 29900,
        taxRate: 0.12,
        taxCents: 3588,
        totalCents: 33488,
        currency: "PHP",
        status: "pending",
        items: [
          {
            id: "item_001",
            description: "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
            quantity: 1,
            unitPriceCents: 29900,
            totalCents: 29900,
          },
        ],
      },
      {
        id: "inv_2026_002",
        invoiceNumber: "INV-2026-002",
        tenantId,
        planName: "Enterprise Plan - February 2026",
        billingCycle: "monthly",
        invoiceDate: "2026-02-01",
        dueDate: "2026-02-15",
        paidDate: "2026-02-14",
        subtotalCents: 29900,
        taxRate: 0.12,
        taxCents: 3588,
        totalCents: 33488,
        currency: "PHP",
        status: "paid",
        paymentMethodSummary: "Visa ending in 4242",
        items: [
          {
            id: "item_002",
            description: "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
            quantity: 1,
            unitPriceCents: 29900,
            totalCents: 29900,
          },
        ],
      },
      {
        id: "inv_2026_001",
        invoiceNumber: "INV-2026-001",
        tenantId,
        planName: "Enterprise Plan - January 2026",
        billingCycle: "monthly",
        invoiceDate: "2026-01-01",
        dueDate: "2026-01-15",
        paidDate: "2026-01-12",
        subtotalCents: 29900,
        taxRate: 0.12,
        taxCents: 3588,
        totalCents: 33488,
        currency: "PHP",
        status: "paid",
        paymentMethodSummary: "Visa ending in 4242",
        items: [
          {
            id: "item_003",
            description: "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
            quantity: 1,
            unitPriceCents: 29900,
            totalCents: 29900,
          },
        ],
      },
      {
        id: "inv_2025_012",
        invoiceNumber: "INV-2025-012",
        tenantId,
        planName: "Professional Plan - December 2025",
        billingCycle: "monthly",
        invoiceDate: "2025-12-01",
        dueDate: "2025-12-15",
        paidDate: "2025-12-10",
        subtotalCents: 9900,
        taxRate: 0.12,
        taxCents: 1188,
        totalCents: 11088,
        currency: "PHP",
        status: "paid",
        paymentMethodSummary: "Mastercard ending in 8888",
        items: [
          {
            id: "item_004",
            description: "Professional Plan Monthly Subscription (Growth Tier)",
            quantity: 1,
            unitPriceCents: 9900,
            totalCents: 9900,
          },
        ],
      },
    ],
    contact: {
      companyName: "ERPEZ Dev Sandbox",
      billingEmail: "dev@erpez.local",
      address: "100 Enterprise Boulevard, Suite 400",
      city: "San Francisco",
      country: "United States",
      postalCode: "94105",
      taxId: "US-987654321",
    },
  };
}

function loadStorage(tenantId: string): TenantBillingStorage {
  if (typeof window === "undefined") {
    return getInitialState(tenantId);
  }

  const key = getStorageKey(tenantId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = getInitialState(tenantId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as TenantBillingStorage;
  } catch (e) {
    console.warn("Failed reading mock billing storage, resetting to initial", e);
    return getInitialState(tenantId);
  }
}

function saveStorage(tenantId: string, state: TenantBillingStorage): void {
  if (typeof window === "undefined") return;
  const key = getStorageKey(tenantId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error("Failed writing mock billing storage", e);
  }
}

export class MockBillingRepository implements BillingRepository {
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    const state = loadStorage(tenantId);
    return state.paymentMethods;
  }

  async addPaymentMethod(
    tenantId: string,
    input: CreatePaymentMethodInput
  ): Promise<PaymentMethod> {
    const state = loadStorage(tenantId);

    // Sanitize and detect brand - never persist raw card numbers or CVC
    const cleanNumber = input.cardNumber.replace(/\D/g, "");
    const last4 = cleanNumber.slice(-4) || "4242";
    const brand = detectCardBrand(cleanNumber);

    const isFirstMethod = state.paymentMethods.length === 0;
    const shouldBeDefault = isFirstMethod || input.setAsDefault;

    if (shouldBeDefault) {
      state.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }

    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: input.type || "credit_card",
      brand,
      last4,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      cardholderName: input.cardholderName.trim(),
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
    };

    state.paymentMethods.push(newMethod);
    saveStorage(tenantId, state);
    return newMethod;
  }

  async setDefaultPaymentMethod(
    tenantId: string,
    methodId: string
  ): Promise<void> {
    const state = loadStorage(tenantId);
    state.paymentMethods.forEach((pm) => {
      pm.isDefault = pm.id === methodId;
    });
    saveStorage(tenantId, state);
  }

  async deletePaymentMethod(
    tenantId: string,
    methodId: string
  ): Promise<DeletePaymentMethodResult> {
    const state = loadStorage(tenantId);

    if (state.paymentMethods.length <= 1) {
      throw new Error(
        "Cannot delete the only payment method. You must keep at least one active payment method or add an alternative first."
      );
    }

    const targetIndex = state.paymentMethods.findIndex((pm) => pm.id === methodId);
    if (targetIndex === -1) {
      return {};
    }

    const wasDefault = state.paymentMethods[targetIndex].isDefault;
    state.paymentMethods.splice(targetIndex, 1);

    let promotedDefaultId: string | undefined;

    // If we deleted the default method, automatically promote the first remaining method
    if (wasDefault && state.paymentMethods.length > 0) {
      state.paymentMethods[0].isDefault = true;
      promotedDefaultId = state.paymentMethods[0].id;
    }

    saveStorage(tenantId, state);
    return { promotedDefaultId };
  }

  async getInvoices(tenantId: string): Promise<Invoice[]> {
    const state = loadStorage(tenantId);
    return state.invoices;
  }

  async getInvoiceById(
    tenantId: string,
    invoiceId: string
  ): Promise<Invoice | null> {
    const state = loadStorage(tenantId);
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);
    return invoice || null;
  }

  async processSimulatedPayment(
    tenantId: string,
    invoiceId: string,
    paymentMethodId: string
  ): Promise<PaymentProcessResult> {
    // Artificial network delay to simulate payment gateway tokenization & capture
    await new Promise((resolve) => setTimeout(resolve, 800));

    const state = loadStorage(tenantId);
    const invoice = state.invoices.find((inv) => inv.id === invoiceId);

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Invoice is already paid" };
    }

    const method = state.paymentMethods.find((pm) => pm.id === paymentMethodId);
    const methodDesc = method
      ? `${method.brand ? method.brand.toUpperCase() : "Card"} ending in ${method.last4}`
      : "Payment Method";

    invoice.status = "paid";
    invoice.paidDate = new Date().toISOString().split("T")[0];
    invoice.paymentMethodSummary = methodDesc;

    saveStorage(tenantId, state);
    return { success: true, invoice };
  }

  async getBillingContact(tenantId: string): Promise<BillingContact> {
    const state = loadStorage(tenantId);
    return state.contact;
  }

  async updateBillingContact(
    tenantId: string,
    contact: BillingContact
  ): Promise<BillingContact> {
    const state = loadStorage(tenantId);
    state.contact = { ...contact };
    saveStorage(tenantId, state);
    return state.contact;
  }
}

export const mockBillingRepository = new MockBillingRepository();
