import type { MetaActions } from '@/types/global'
import type {Evaluation} from '@/components/features/planning/evaluation';
import { TemplateTable } from '@/components/TemplateTable'
import {
  Column,
  
  Toolbar
} from '@/components/features/planning/evaluation'

const generateFakeEvaluation = (count: number): Array<Evaluation> => {
  return Array.from({ length: count }, (_, index) => ({
    id: `Evaluation-${index + 1}`,
    deliveryUnit: `Delivery Unit ${(index % 5) + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,

    status: ['Pending', 'Returned', 'Approved'][index % 3] as
      | 'Pending'
      | 'Returned'
      | 'Approved',
  }))
}
function EvaluationPage() {
  const data = generateFakeEvaluation(100)
  const actions: MetaActions = ['write', 'approve', 'delete']
  return (
    <TemplateTable
      title="Evaluation"
      description="List of delivery unit evaluations and ratings"
      columns={Column}
      data={data}
      readonly={false}
      actions={actions}
      toolbar={(table) => <Toolbar table={table} />}
    />
  )
}

export default EvaluationPage
