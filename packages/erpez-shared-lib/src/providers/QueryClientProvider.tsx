import { QueryClientProvider as Provider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '../lib/get-query-client'
import type * as React from 'react'

// Check if we're on the server (for SSR)
const isServer = typeof window === 'undefined'

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()

    // During SSR, just render children without the provider
    // The provider will be hydrated on the client
    if (isServer) {
        return <>{children}</>
    }

    return (
        <Provider client={queryClient}>
            {children}
            <ReactQueryDevtools />
        </Provider>
    )
}