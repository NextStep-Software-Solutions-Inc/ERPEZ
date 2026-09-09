export type TenantMember = {
    id: string;
    name: string;
    email?: string;
    role: string;
    status: 'Active' | 'Pending' | 'Disabled' | string;
};

export type TenantMemberDetails = TenantMember & {
    description: string;
};
