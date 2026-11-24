import { createContext, useContext } from 'react';
import type { UnifiedAuthContextType } from './types';

export const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export function useUnifiedAuth(): UnifiedAuthContextType {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

// Backward-compatible alias for existing codebase
export const useKeycloak = useUnifiedAuth;
