import TenantMemberPage from '~/pages/protected/TenantMemberPage';
import RoutePermissionGuard from '~/components/layout/RoutePermissionGuard';

function TenantMember() {
    return (
        <RoutePermissionGuard permission="tenant.members.view">
            <TenantMemberPage />
        </RoutePermissionGuard>
    );
}

export default TenantMember;