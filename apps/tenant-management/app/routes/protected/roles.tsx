import { RolesManagementView } from '~/components/features/roles/RolesManagementView';
import { PageContainer } from '~/components/PageContainer';
import RoutePermissionGuard from '~/components/layout/RoutePermissionGuard';

export default function RolesRoute() {
  return (
    <RoutePermissionGuard permission="tenant.roles.view">
      <PageContainer
        title="Roles & Permissions"
        description="Configure workspace roles and custom privilege sets."
      >
        <RolesManagementView />
      </PageContainer>
    </RoutePermissionGuard>
  );
}
