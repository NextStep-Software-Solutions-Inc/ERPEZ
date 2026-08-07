import { createFileRoute, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import KpiByFunctionTypePage from '@/pages/planning/kpi/KpiByFunctionTypePage'

// Define valid function types
const functionTypeSchema = z.enum([
  'CoreFunction',
  'StrategicPriority',
  'MandatorySupport',
])

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(999),
})

export const Route = createFileRoute('/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/')({
  component: RouteComponent,
  validateSearch: searchSchema, 
  beforeLoad: ({ params }) => {
    const result = functionTypeSchema.safeParse(params.functionType)
    if (!result.success) {
      throw new Error(`Invalid function type: ${params.functionType}`)
    }
  },
})

function RouteComponent() {
  const { functionType } = useParams({
    from: Route.id,
  })

  return <KpiByFunctionTypePage functionType={functionType} />
}



