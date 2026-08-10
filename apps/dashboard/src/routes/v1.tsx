import { Outlet, createFileRoute } from '@tanstack/react-router'
import appCss from '@/styles.css?url'

export const Route = createFileRoute('/v1')({
    component: V1Layout,
    head: () => ({
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
        ],
    }),
})

function V1Layout() {
    return (
        <Outlet />
    )
}
