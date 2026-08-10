// import { useSearch } from '@tanstack/react-router'
// import { Suspense, lazy } from 'react'
// import { TabsContent } from '@/components/ui/tabs'
// import { SkeletonTable } from '@/components/SkeletonLoader'

// export default function DeliveryUnitOPCRPage() {
//   const search = useSearch({ from: '/v1/planning/$deliveryUnitId/opcr/' })

//   const {
//     opcrSearch,
//   } = search

//   return (
//     <Suspense fallback={<SkeletonTable columns={5} rows={15} />}>
//       <TabsContent value="kpi" className="space-y-4">
//         <DeliveryUnitKPITab />
//       </TabsContent>
//       <TabsContent value="opcr" className="space-y-4">
//         <DeliveryUnitOPCRTab opcrSearch={opcrSearch} />
//       </TabsContent>
//       <TabsContent value="consolidate" className="space-y-4">
//         <ConsolidateOPCRTab opcrSearch={opcrSearch} />
//       </TabsContent>
//     </Suspense>
//   )
// }
