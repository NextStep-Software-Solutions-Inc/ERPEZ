import { faker } from '@faker-js/faker'
import type { MetaActions } from '@/types/global'
import type { KPIConfig } from '@/components/features/planning/kpi'
import { Column, Toolbar } from '@/components/features/planning/kpi'
import { TemplateTable } from '@/components/TemplateTable'

const generateFakeKpis = (count: number): Array<KPIConfig> => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
  }))
}

function TestKpiPage() {
  const data = generateFakeKpis(50)
  const actions: MetaActions = ['write', 'approve', 'delete']

  return (
    <TemplateTable
      columns={Column}
      data={data}
      actions={actions}
      readonly={false}
      toolbar={(table) => <Toolbar table={table} />}
      forTab
    />
  )
}

export default TestKpiPage
