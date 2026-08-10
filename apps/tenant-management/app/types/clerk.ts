// Clerk type extensions
export type ClerkUserRole = "super-admin" | "tenant";

export interface ClerkUserPublicMetadata {
    role?: ClerkUserRole;
    tenantId?: string;
}

// Utility type for Clerk User with typed metadata
export type TypedClerkUser = {
    publicMetadata: ClerkUserPublicMetadata;
    // Include other Clerk User properties
    id: string;
    primaryEmailAddress?: {
        emailAddress: string;
    } | null;
    // If more properties are needed, extend this type with Clerk's official User type.
};