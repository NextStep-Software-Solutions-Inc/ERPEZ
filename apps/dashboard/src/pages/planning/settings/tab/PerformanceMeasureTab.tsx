import type { MetaActions } from '@/types/global'
import type {PerformanceMeasure} from '@/components/features/planning/settings/performance-measure';
import { TemplateTable } from '@/components/TemplateTable'
import {
  Column,
  
  Toolbar
} from '@/components/features/planning/settings/performance-measure'

const generateFakePerformanceMeasure = (
  count: number,
): Array<PerformanceMeasure> => {
  return Array.from({ length: count }, (_, index) => ({
    id: `PerformanceMeasure-${index + 1}`,
    name: `Performance Measure ${index + 1}`,
    description: `Description for Performance Measure ${index + 1}`,
  }))
}

export default function PerformanceMeasureTab() {
  const actions: MetaActions = ['write', 'delete']
  const data = generateFakePerformanceMeasure(110)

  return (
    <TemplateTable
      actions={actions}
      columns={Column}
      readonly={false}
      data={data}
      toolbar={(table) => <Toolbar table={table} />}
    />
  )
}
