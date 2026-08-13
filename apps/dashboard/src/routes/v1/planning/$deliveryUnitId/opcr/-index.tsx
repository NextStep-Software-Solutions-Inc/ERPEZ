// import { createFileRoute } from '@tanstack/react-router'
// import { z } from 'zod'
// import DeliveryUnitOPCRPage from '@/pages/planning/opcr/DeliveryUnitOPCRPage'
// import DeliveryUnitOPCRLayout from '@/pages/planning/opcr/DeliveryUnitOPCRLayout'

// const searchSchema = z.object({
//   page: z.number().optional().default(1),
//   limit: z.number().optional().default(10),
//   search: z.string().optional(),
//   kpiSearch: z.string().optional(),
//   opcrSearch: z.string().optional(),
//   sortBy: z.string().optional(),
//   sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
//   tab: z
//     .enum(['kpi', 'opcr', 'consolidate'])
//     .optional()
//     .default('kpi'),
// })

// export const Route = createFileRoute('/v1/planning/$deliveryUnitId/opcr/')({
//   component: RouteComponent,
//   validateSearch: searchSchema,
// })

// function RouteComponent() {
//   return (
//     <DeliveryUnitOPCRLayout>
//       <DeliveryUnitOPCRPage />
//     </DeliveryUnitOPCRLayout>
//   )
// }
