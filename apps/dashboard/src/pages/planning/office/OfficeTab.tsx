import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { Column, Toolbar } from '@/components/features/planning/office'
import { TemplateTable } from '@/components/TemplateTable'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { getClustersRequest } from '@/components/features/planning/office/office/handlers/getClustersRequest'

const useOffices = createQueryHookFromTemplate(getOfficesRequest)
const useClusters = createQueryHookFromTemplate(getClustersRequest)

function OfficeTab({ officeSearch }: { officeSearch?: string }) {
  const { data: offices } = useOffices({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
    },
  })

  const { data: clusters } = useClusters({
    pathParams: {},
    queryParams: {},
  })

  const actions: MetaActions = ['write', 'approve', 'delete']
  return (
    <TemplateTable
      columns={Column}
      data={offices?.data || []}
      actions={actions}
      readonly={false}
      toolbar={(table) => <Toolbar table={table} officeSearch={officeSearch} />}
      forTab
      fixedPageSize={11}
      meta={{ clusters: clusters?.data || [] }}
    />
  )
}

export default OfficeTab
