export type Tenant = {
  id: string;
  name: string;
  description?: string;

  tenantSetting: {
    id: string;
    name: string;
    baseURL: string;
    onPremise: boolean;
    billingContactEmail: string;
    dbConnectionString: string;
  };
  tenantSubscription: {
    id: string;
    tenantId: string;
    amount: number;
    plan: string;
    status: string;
    billingCycle: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
};

export type TenantDetails = Tenant;
