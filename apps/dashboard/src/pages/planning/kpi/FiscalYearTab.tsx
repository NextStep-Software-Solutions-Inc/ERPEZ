import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { Column, Toolbar } from '@/components/features/planning/fiscal-year'
import { TemplateTable } from '@/components/TemplateTable'
import { getFiscalYearsRequest } from '@/components/features/planning/fiscal-year/handlers/getFiscalYearsRequest'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

function FiscalYearTab({ fiscalYearSearch }: { fiscalYearSearch?: string }) {
  const { data: functions } = useFiscalYears({
    pathParams: {},
    queryParams: {},
  })

  // const columns = useDynamicColumns();
  const actions: MetaActions = ['write', 'approve', 'delete', 'lock']
  return (
    <TemplateTable
      columns={Column}
      data={functions?.data || []}
      actions={actions}
      readonly={false}
      toolbar={(table) => (
        <Toolbar table={table} fiscalYearSearch={fiscalYearSearch} />
      )}
      forTab
      fixedPageSize={11}
    />
  )
}

export default FiscalYearTab
