export type Tenant = {
  id: string;
  name: string;
  description?: string;
  isDisabled?: boolean;
  allowedDomain?: string;
  maxAllowedTenants?: number;

  tenantSetting: {
    id: string;
    name: string;
    baseURL: string;
    onPremise: boolean;
    billingContactEmail: string;
    dbConnectionString: string;
    allowedDomain?: string;
    maxAllowedTenants?: number;
  };
  tenantSubscription?: {
    id: string;
    tenantId?: string;
    amount: number;
    plan: string;
    status: string;
    billingCycle: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
  tenantSubscriptions?: Array<{
    id: string;
    tenantId?: string;
    amount: number;
    plan: string;
    status: string;
    billingCycle: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  }>;
  modules?: Array<{
    id: string;
    key: string;
    name: string;
    description?: string;
    isActive: boolean;
  }>;
};

export type TenantDetails = Tenant;
