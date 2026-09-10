import { useCallback, useEffect, useState } from "react";
import { useTenant } from "~/providers/TenantProvider";
import { apiBillingRepository } from "../repositories/apiBillingRepository";
import { mockBillingRepository } from "../repositories/mockBillingRepository";
import type { BillingRepository } from "../repositories/billingRepository";
import type {
  BillingContact,
  CreatePaymentMethodInput,
  Invoice,
  NextInvoiceProjection,
  PaymentMethod,
  SubscriptionAdapter,
} from "../types";
import { adaptTenantSubscription, calculateNextInvoice } from "../utils/billing";

export interface BillingData {
  subscription: SubscriptionAdapter | null;
  nextInvoice: NextInvoiceProjection;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  invoices: Invoice[];
  billingContact: BillingContact;
}

export interface UseBillingDataResult {
  data: BillingData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  repository: BillingRepository;
  addPaymentMethod: (input: CreatePaymentMethodInput) => Promise<PaymentMethod>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<{ promotedDefaultId?: string }>;
  processPayment: (
    invoiceId: string,
    paymentMethodId: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateBillingContact: (contact: BillingContact) => Promise<BillingContact>;
}

export function useBillingData(
  repo: BillingRepository = apiBillingRepository
): UseBillingDataResult {
  const { tenant, isLoading: isTenantLoading, error: tenantError } = useTenant();
  const tenantId = tenant?.id || "00000000-0000-0000-0000-000000000001";

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingContact, setBillingContact] = useState<BillingContact>({
    companyName: tenant?.name || "ERPEZ Dev Sandbox",
    billingEmail: tenant?.tenantSetting?.billingContactEmail || "dev@erpez.local",
  });
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(true);
  const [repoError, setRepoError] = useState<Error | null>(null);

  const fetchRepoData = useCallback(async () => {
    setIsLoadingRepo(true);
    setRepoError(null);
    try {
      const [methods, invs, contact] = await Promise.all([
        repo.getPaymentMethods(tenantId),
        repo.getInvoices(tenantId),
        repo.getBillingContact(tenantId),
      ]);
      setPaymentMethods(methods);
      setInvoices(invs);
      setBillingContact({
        ...contact,
        companyName: tenant?.name || contact.companyName,
        billingEmail: tenant?.tenantSetting?.billingContactEmail || contact.billingEmail,
      });
    } catch (err) {
      setRepoError(err instanceof Error ? err : new Error("Failed loading billing data"));
    } finally {
      setIsLoadingRepo(false);
    }
  }, [repo, tenantId, tenant?.name, tenant?.tenantSetting?.billingContactEmail]);

  useEffect(() => {
    fetchRepoData();
  }, [fetchRepoData]);

  // Derived subscription from authoritative backend data
  const subscription = adaptTenantSubscription(tenant);
  const nextInvoice = calculateNextInvoice(subscription);
  const defaultPaymentMethod =
    paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0] || null;

  const addPaymentMethod = useCallback(
    async (input: CreatePaymentMethodInput) => {
      const created = await repo.addPaymentMethod(tenantId, input);
      await fetchRepoData();
      return created;
    },
    [repo, tenantId, fetchRepoData]
  );

  const setDefaultPaymentMethod = useCallback(
    async (id: string) => {
      await repo.setDefaultPaymentMethod(tenantId, id);
      await fetchRepoData();
    },
    [repo, tenantId, fetchRepoData]
  );

  const deletePaymentMethod = useCallback(
    async (id: string) => {
      const result = await repo.deletePaymentMethod(tenantId, id);
      await fetchRepoData();
      return result;
    },
    [repo, tenantId, fetchRepoData]
  );

  const processPayment = useCallback(
    async (invoiceId: string, paymentMethodId: string) => {
      const result = await repo.processSimulatedPayment(
        tenantId,
        invoiceId,
        paymentMethodId
      );
      if (result.success) {
        await fetchRepoData();
      }
      return result;
    },
    [repo, tenantId, fetchRepoData]
  );

  const updateBillingContact = useCallback(
    async (contact: BillingContact) => {
      const updated = await repo.updateBillingContact(tenantId, contact);
      setBillingContact(updated);
      return updated;
    },
    [repo, tenantId]
  );

  const combinedLoading = isTenantLoading || isLoadingRepo;
  const combinedError =
    (tenantError ? (tenantError instanceof Error ? tenantError : new Error(String(tenantError))) : null) ||
    repoError;

  const data: BillingData | null = combinedLoading
    ? null
    : {
        subscription,
        nextInvoice,
        paymentMethods,
        defaultPaymentMethod,
        invoices,
        billingContact,
      };

  return {
    data,
    isLoading: combinedLoading,
    error: combinedError,
    refetch: fetchRepoData,
    repository: repo,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    processPayment,
    updateBillingContact,
  };
}
