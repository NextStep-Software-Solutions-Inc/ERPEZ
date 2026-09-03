import { Outlet, createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'
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
        <RoutePermissionGuard
            permission={[
                PERMISSIONS.Planning.Dashboard.ViewGlobal,
                PERMISSIONS.Planning.Dashboard.ViewOffice,
            ]}
            message="You do not have permission to view the Planning Dashboard."
        >
            <Outlet />
        </RoutePermissionGuard>
    )
}
