/**
 * V2 Route Layout
 * Root layout for V2 routes using Dashtail design system
 * Converted from Next.js to TanStack Router
 */

import { Outlet, createFileRoute } from '@tanstack/react-router';
import DashboardLayoutProvider from '@/providers/DashboardLayoutProvider';
import Providers from '@/providers/v2/Providers';
import DirectionProvider from '@/providers/v2/DirectionProvider';
import globals from '@/styles/v2/globals.css?url';
import theme from '@/styles/v2/theme.css?url';
import "flatpickr/dist/themes/light.css";
import "simplebar-react/dist/simplebar.min.css";

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
    return (
        <Providers>
            <DirectionProvider>
                <DashboardLayoutProvider>
                    <Outlet />
                </DashboardLayoutProvider>
            </DirectionProvider>
        </Providers>
    );
}
