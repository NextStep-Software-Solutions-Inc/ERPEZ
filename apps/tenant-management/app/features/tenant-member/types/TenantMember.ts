export type TenantMember = {
  id: string;
  tenantId?: string;
  userId?: string;
  externalIdentityId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  role?: string;
  roles?: string[];
  roleIds?: string[];
  status?: string;
  concurrencyStamp?: string;
  invitationExpiresAtUtc?: string;
};
