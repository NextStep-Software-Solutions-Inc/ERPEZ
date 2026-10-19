import { createContext, useContext } from 'react';
import { useClerkAuth } from './ClerkAuthProvider';

interface AuthContextType {
    isTokenReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isInitialized, isAuthenticated, token } = useClerkAuth();

    // A token is ready when Clerk has fully initialized and, for authenticated users,
    // the session bearer token is non-null and synced to Axios.
    const isTokenReady = isInitialized && (!isAuthenticated || Boolean(token));

    return (
        <AuthContext.Provider value={{ isTokenReady }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthReady() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthReady must be used within an AuthProvider');
    }
    return context;
}