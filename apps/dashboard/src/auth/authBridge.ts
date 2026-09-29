let tokenProvider: () => Promise<string | null> = () => Promise.resolve(null);
let tenantProvider: () => string | null = () => null;
let refreshProvider: (minValidity?: number) => Promise<boolean> = () => Promise.resolve(false);

export const setTokenProvider = (provider: () => Promise<string | null>) => {
  tokenProvider = provider;
};

export const setTenantProvider = (provider: () => string | null) => {
  tenantProvider = provider;
};

export const setRefreshProvider = (provider: (minValidity?: number) => Promise<boolean>) => {
  refreshProvider = provider;
};

export const getAuthToken = () => tokenProvider();
export const getCandidateTenantId = () => tenantProvider();
export const refreshAuthToken = (minValidity?: number) => refreshProvider(minValidity);
