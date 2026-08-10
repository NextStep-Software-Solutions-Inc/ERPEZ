/**
 * V2 Route Layout
 * Root layout for V2 routes using Dashtail design system
 * Converted from Next.js to TanStack Router
 */

import { Outlet, createFileRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayoutProvider from '@/providers/DashboardLayoutProvider';
import Providers from '@/providers/v2/Providers';
import DirectionProvider from '@/providers/v2/DirectionProvider';
import globals from '@/styles/v2/globals.css?url';
import theme from '@/styles/v2/theme.css?url';
import "flatpickr/dist/themes/light.css";
import "simplebar-react/dist/simplebar.min.css";
import { useState } from 'react';

export const Route = createFileRoute('/v2')({
    component: RouteComponent,
    head: () => ({
        links: [
            {
                rel: 'stylesheet',
                href: globals,
            },
            {
                rel: 'stylesheet',
                href: theme,
            },
        ],
    }),
});

function RouteComponent() {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <Providers>
                <DirectionProvider>
                    <DashboardLayoutProvider>
                        <Outlet />
                    </DashboardLayoutProvider>
                </DirectionProvider>
            </Providers>
        </QueryClientProvider>
    );
}
