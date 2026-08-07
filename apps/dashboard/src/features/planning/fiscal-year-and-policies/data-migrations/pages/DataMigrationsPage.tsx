import DataRolloverWizard from '../components/wizards/DataRolloverWizard'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
// Query hooks
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

export default function DataMigrationsTab() {
  // Fetch fiscal years
  const { data: fiscalYearsData } = useFiscalYears({
    pathParams: {},
    queryParams: {},
  })

  const fiscalYears = fiscalYearsData?.data || []

  return <DataRolloverWizard fiscalYears={fiscalYears} />
}
