export interface UnifiedTenantContext {
  id: string;             // Deterministic internal ERPEZ Tenant.Id (GUID)
  externalOrgId?: string; // IdP organization identifier (e.g. Clerk org_2...)
  name: string;
  slug?: string;
  authProvider?: 'clerk' | 'keycloak';
}

export interface UnifiedUser {
  id: string; // Federated sub
  username: string;
  email: string;
  displayName: string;
  roles: string[];
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
export type TenantState = 'loading' | 'resolved' | 'unavailable' | 'forbidden';

export interface WorkspaceMemberInfo {
  userId: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string;
}

export interface WorkspaceInvitationInfo {
  id: string;
  email: string;
  role?: string;
  status: string;
  createdAt?: string;
}

export interface UnifiedAuthContextType {
  authState: AuthState;
  tenantState: TenantState;
  authReady: boolean;          // authState === 'authenticated'
  tenantContextReady: boolean; // tenantState === 'resolved'
  user: UnifiedUser | null;
  workspaceMembers: WorkspaceMemberInfo[];
  workspaceInvitations: WorkspaceInvitationInfo[];
  inviteWorkspaceMember: (email: string, role?: string) => Promise<void>;
  revokeWorkspaceInvitation: (invitationId: string) => Promise<void>;
  activeTenant: UnifiedTenantContext | null;
  availableTenants: UnifiedTenantContext[];
  switchTenant: (tenantId: string) => Promise<void>; // Takes internal ERPEZ Tenant.Id
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  provider: 'clerk' | 'keycloak';

  // Backward compatibility fields for existing UI components
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | null;
  refreshToken: string | null;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  roles: string[];
  tenantId: string | null;
  isSuperAdmin: boolean;
  activeDevUser: string;
  login: () => void;
  register: () => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  switchDevUser: (username: string) => Promise<void>;
}
