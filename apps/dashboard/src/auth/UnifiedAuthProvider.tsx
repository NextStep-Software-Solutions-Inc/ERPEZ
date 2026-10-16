import React from 'react';
import { ClerkAuthProvider } from './ClerkAuthProvider';
import { KeycloakProvider } from '@/providers/KeycloakProvider';

interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const isCloudOrDevHost =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('erpez.') ||
      window.location.hostname.includes('dev.nextstep-software.com'));

  const provider = (
    import.meta.env.VITE_AUTH_PROVIDER ||
    (isCloudOrDevHost ? 'clerk' : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'clerk' : 'keycloak')
  ).toLowerCase();

  if (provider === 'clerk') {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
  }

  return <KeycloakProvider>{children}</KeycloakProvider>;
}

export default UnifiedAuthProvider;
