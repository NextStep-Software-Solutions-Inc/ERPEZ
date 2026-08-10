import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import {
  Column,
  Toolbar,
} from '@/components/features/planning/kpi-assignment-for-du'
import { TemplateTable } from '@/components/TemplateTable'
import { getDeliveryUnitsRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitsRequest'

const useKpiAssignments = createQueryHookFromTemplate(getDeliveryUnitsRequest);

function KpiAssignmentForDuTab({ kpiAssignmentForDuSearch }: { kpiAssignmentForDuSearch?: string }) {
  const { data: assignments } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      filters: `parentId==null&&kpiCount>0`
    },
  });
  const actions: MetaActions = ['write', 'approve', 'delete']
  return (
    <TemplateTable
      columns={Column}
      data={assignments?.data || []}
      actions={actions}
      readonly={false}
      toolbar={(table) => <Toolbar table={table} kpiAssignmentForDuSearch={kpiAssignmentForDuSearch} />}
      forTab
      fixedPageSize={11}
    />
  )
}

export default KpiAssignmentForDuTab
