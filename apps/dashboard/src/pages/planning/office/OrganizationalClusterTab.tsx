import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import { getOrganizationalClustersRequest } from '@/components/features/planning/organizationalCluster/handlers/getOrganizationalClustersRequest'
import Toolbar from '@/components/features/planning/organizationalCluster/table/Toolbar'
import { Column } from '@/components/features/planning/organizationalCluster/table'

const useOrganizationalClusters = createQueryHookFromTemplate(
  getOrganizationalClustersRequest,
)

function OrganizationalClusterTab({
  clusterSearch,
  navigate,
  search,
}: {
  clusterSearch?: string
  navigate?: any
  search?: any
}) {
  const { data: clusters } = useOrganizationalClusters({
    pathParams: {},
    queryParams: {},
  })

  const actions: MetaActions = ['write', 'approve', 'delete']

  return (
    <TemplateTable
      columns={Column}
      data={clusters?.data || []}
      actions={actions}
      readonly={false}
      toolbar={(table) => (
        <Toolbar
          table={table}
          clusterSearch={clusterSearch}
          navigate={navigate}
          search={search}
        />
      )}
      forTab
      fixedPageSize={11}
      meta={{ clusters: clusters?.data || [] }}
    />
  )
}

export default OrganizationalClusterTab
