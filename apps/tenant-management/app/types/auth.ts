// Auth & Clerk User Types
export type UserRole = "super-admin" | "tenant" | "admin" | "member";

export interface UserPublicMetadata {
    role?: UserRole;
    tenantId?: string;
}

export type AuthUser = {
    id: string;
    username: string;
    email?: string | null;
    displayName?: string | null;
    roles: string[];
    role?: string | null;
    tenantId?: string | null;
    isSuperAdmin: boolean;
};
