import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './KeycloakProvider';
import { setAuthToken } from '~/services/api';

interface AuthContextType {
    isTokenReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const [isTokenReady, setIsTokenReady] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                if (isSignedIn) {
                    const token = await getToken();
                    setAuthToken(token);
                } else {
                    setAuthToken(null);
                }
                setIsTokenReady(isLoaded);
            } catch (error) {
                console.error('Failed to get token:', error);
                setAuthToken(null);
                setIsTokenReady(true);
            }
        };

        fetchToken();
    }, [getToken, isSignedIn, isLoaded]);

    return (
        <AuthContext.Provider value={{ isTokenReady: isTokenReady || isLoaded }}>
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