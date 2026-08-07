import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import type {
  FiscalYear} from '@/components/features/planning/function-allocation/table';
import { TemplateTable } from '@/components/TemplateTable'
import { getFiscalYearsRequest } from '@/components/features/planning/fiscal-year/handlers/getFiscalYearsRequest'
import {
  Toolbar,
  useDynamicColumns,
} from '@/components/features/planning/function-allocation/table'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

function FiscalYearTab({ fiscalYearSearch }: { fiscalYearSearch?: string }) {
  const columns = useDynamicColumns()
  const { data: functions } = useFiscalYears({
    pathParams: {},
    queryParams: {},
  })

  const filteredData = (functions?.data || []).filter((fiscalYear: FiscalYear) => {
    const coreFunction =
      fiscalYear.functionAllocations.find(
        (alloc) => alloc.functionType === 'CoreFunction'
      )?.percentage || 0
    const strategicPriority =
      fiscalYear.functionAllocations.find(
        (alloc) => alloc.functionType === 'StrategicPriority'
      )?.percentage || 0
    const mandatorySupport =
      fiscalYear.functionAllocations.find(
        (alloc) => alloc.functionType === 'MandatorySupport'
      )?.percentage || 0
    return coreFunction > 0 || strategicPriority > 0 || mandatorySupport > 0
  })

  const actions: MetaActions = ['write', 'approve', 'delete', 'lock']
  return (
    <>
      <TemplateTable
        columns={columns}
        data={filteredData}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <Toolbar table={table} fiscalYearSearch={fiscalYearSearch} />
        )}
        forTab
        fixedPageSize={11}
      />
    </>
  )
}

export default FiscalYearTab
