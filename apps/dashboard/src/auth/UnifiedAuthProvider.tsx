import React from 'react';
import { ClerkAuthProvider } from './ClerkAuthProvider';
import { KeycloakProvider } from '@/providers/KeycloakProvider';

interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'keycloak').toLowerCase();

  if (provider === 'clerk') {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
  }

  return <KeycloakProvider>{children}</KeycloakProvider>;
}

export default UnifiedAuthProvider;
