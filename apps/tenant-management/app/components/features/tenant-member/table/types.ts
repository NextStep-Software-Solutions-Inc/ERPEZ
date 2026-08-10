export type TenantMember = {
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Pending' | 'Disabled';
};

export type TenantMemberDetails = TenantMember & {
    description: string;
};
