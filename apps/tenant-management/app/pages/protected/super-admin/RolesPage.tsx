import { PageContainer } from "~/components/PageContainer";
import { RolesManagementView } from "~/components/features/roles/RolesManagementView";

export default function RolesPage() {
  return (
    <PageContainer
      title="Roles & Permissions"
      description="Manage system and custom governance roles, inspect assigned permissions, and configure platform privilege sets."
    >
      <RolesManagementView />
    </PageContainer>
  );
}
