export interface LicenseKey {
  id: string;
  tenantId?: string;
  tenantName?: string;
  key: string;
  prefix: string;
  boundEmail: string;
  plan: string;
  allowedDomain: string;
  maxTenants: number;
  maxUsers: number;
  issuedAt: string;
  expiresAt: string;
  status: "Active" | "Expired" | "Revoked" | "Suspended" | string;
  isAirGapped: boolean;
  isExpired: boolean;
  remainingDays: number;
  activatedAt?: string;
  notes?: string;
}
