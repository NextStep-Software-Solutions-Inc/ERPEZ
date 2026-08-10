import { useAuth } from '@clerk/react-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '~/services/api';

interface AuthContextType {
    isTokenReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isSignedIn } = useAuth();
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
                setIsTokenReady(true);
            } catch (error) {
                console.error('Failed to get token:', error);
                setAuthToken(null);
                setIsTokenReady(true);
            }
        };

        fetchToken();
    }, [getToken, isSignedIn]);

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