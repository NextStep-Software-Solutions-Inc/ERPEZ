/**
 * Amendments Page
 * Lists PPMPs in Amending state (active mid-year amendments, v2+).
 * Shows original PPMP reference and amendment version.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, GitBranch, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { PPMPState } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'
import { PpmpStatusBadge } from '../components'


export function AmendmentsPage() {
  // const navigate = useNavigate()
  // const [search, setSearch] = useState('')

  // const { data, isLoading } = usePpmpList({
  //   state: PPMPState.AMENDING,
  //   search,
  // })

  // return (
  //   <div className="space-y-4">
  //     {/* Toolbar */}
  //     <div className="relative max-w-sm">
  //       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //       <Input
  //         placeholder="Search amendments…"
  //         value={search}
  //         onChange={(e) => setSearch(e.target.value)}
  //         className="pl-9"
  //       />
  //     </div>

  //     {isLoading ? (
  //       <div className="space-y-2">
  //         {[...Array(2)].map((_, i) => (
  //           <Skeleton key={i} className="h-14 w-full rounded" />
  //         ))}
  //       </div>
  //     ) : data.length === 0 ? (
  //       <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
  //         <GitBranch className="h-8 w-8 text-muted-foreground/40" />
  //         <p className="text-sm text-muted-foreground">
  //           {search
  //             ? 'No amendments match your search.'
  //             : 'No active amendments.'}
  //         </p>
  //       </div>
  //     ) : (
  //       <div className="rounded-lg border border-border overflow-hidden">
  //         <table className="w-full text-sm">
  //           <thead>
  //             <tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
  //               <th className="px-4 py-2 text-left font-medium">
  //                 Document Name
  //               </th>
  //               <th className="px-4 py-2 text-left font-medium">LIB</th>
  //               <th className="px-4 py-2 text-center font-medium">FY</th>
  //               <th className="px-4 py-2 text-center font-medium">Version</th>
  //               <th className="px-4 py-2 text-right font-medium">
  //                 Total Budget
  //               </th>
  //               <th className="px-4 py-2 text-center font-medium">Status</th>
  //               <th className="px-4 py-2 text-center font-medium">Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody className="divide-y divide-border">
  //             {data.map((ppmp) => (
  //               <tr
  //                 key={ppmp.id}
  //                 className="hover:bg-muted/20 transition-colors"
  //               >
  //                 <td className="px-4 py-3 font-medium text-foreground">
  //                   {ppmp.documentName}
  //                 </td>
  //                 <td className="px-4 py-3 text-muted-foreground text-xs">
  //                   {ppmp.libName}
  //                 </td>
  //                 <td className="px-4 py-3 text-center">{ppmp.fiscalYear}</td>
  //                 <td className="px-4 py-3 text-center">
  //                   <Badge variant="outline" className="text-[10px]">
  //                     v{ppmp.amendmentVersion}
  //                   </Badge>
  //                 </td>
  //                 <td className="px-4 py-3 text-right  text-xs">
  //                   {formatCurrency(ppmp.totalBudget)}
  //                 </td>
  //                 <td className="px-4 py-3 text-center">
  //                   <PpmpStatusBadge state={ppmp.state} />
  //                 </td>
  //                 <td className="px-4 py-3 text-center">
  //                   <Button
  //                     variant="ghost"
  //                     size="sm"
  //                     onClick={() =>
  //                       navigate({
  //                         to: '/v2/ppmp/$ppmpId',
  //                         params: { ppmpId: ppmp.id },
  //                       })
  //                     }
  //                     className="h-7 gap-1 text-xs"
  //                   >
  //                     <FolderOpen className="h-3 w-3" />
  //                     Open
  //                   </Button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     )}
  //   </div>
  // )
}
