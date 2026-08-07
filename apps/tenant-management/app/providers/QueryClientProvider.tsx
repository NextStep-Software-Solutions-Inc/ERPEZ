import { QueryClientProvider as Provider } from 'erpez-shared-lib'
import {
    ReactQueryDevtools, getQueryClient,
} from 'erpez-shared-lib'

import type * as React from 'react'

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()

    return (
        <Provider client={queryClient}>
            {children}
            <ReactQueryDevtools />
        </Provider>
    )
}