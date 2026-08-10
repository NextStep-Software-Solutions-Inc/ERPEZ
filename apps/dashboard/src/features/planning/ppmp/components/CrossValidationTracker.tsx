// /**
//  * CrossValidationTracker
//  * Sticky summary bar used by Master Office PPMPs to compare the master LIB
//  * allocation against the current consolidated PPMP total and remaining balance.
//  */

// import { cn } from '@/lib/utils'
// import { Badge } from '@/components/ui/badge'
// import type { PPMP } from '../types'
// import { mockLineItemBudgets } from '../data/mockPpmpData'
// import { formatCurrency } from '../lib/ppmpUtils'

// interface CrossValidationTrackerProps {
//   ppmp: PPMP
//   importedCount?: number
//   className?: string
// }

// export function CrossValidationTracker({
//   ppmp,
//   importedCount = 0,
//   className,
// }: CrossValidationTrackerProps) {
//   const libBudget =
//     mockLineItemBudgets.find((lib) => lib.id === ppmp.libId)?.totalAllocation ??
//     0
//   const remainingBudget = libBudget - ppmp.totalBudget

//   return (
//     <div
//       className={cn(
//         'sticky top-0 z-20 rounded-xl border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
//         className,
//       )}
//     >
//       <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
//         <div className="flex items-center gap-2">
//           <Badge variant="outline">Master LIB budget</Badge>
//           <span className="font-semibold">{formatCurrency(libBudget)}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Badge variant="outline">Current PPMP cost</Badge>
//           <span className="font-semibold">{formatCurrency(ppmp.totalBudget)}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Badge variant="outline">Remaining budget</Badge>
//           <span
//             className={cn(
//               'font-semibold',
//               remainingBudget < 0 ? 'text-destructive' : 'text-emerald-600',
//             )}
//           >
//             {formatCurrency(remainingBudget)}
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Badge
//             variant={importedCount > 0 ? 'soft' : 'outline'}
//             color="secondary"
//           >
//             {importedCount} imported department PPMP
//             {importedCount === 1 ? '' : 's'}
//           </Badge>
//         </div>
//       </div>
//     </div>
//   )
// }
