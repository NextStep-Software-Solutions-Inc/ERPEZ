'use client'

import QueryClientProvider from './QueryClientProvider'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider>{children}</QueryClientProvider>
}