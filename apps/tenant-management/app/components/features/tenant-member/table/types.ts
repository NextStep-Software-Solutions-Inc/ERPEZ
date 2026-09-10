export type TenantMember = {
    id: string;
    name: string;
    email?: string;
    role: string;
    roles: string[];
    roleIds: string[];
    status: 'Active' | 'Pending' | 'Disabled' | 'Cancelled' | string;
    concurrencyStamp: string;
    invitationExpiresAtUtc?: string;
};

export type TenantMemberDetails = TenantMember & {
    description: string;
};
