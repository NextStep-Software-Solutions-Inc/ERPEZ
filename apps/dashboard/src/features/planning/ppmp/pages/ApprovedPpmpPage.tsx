/**
 * Approved PPMP Page
 * Lists all Approved PPMPs. Approvers can view details.
 * Allows starting a mid-year amendment from an approved PPMP.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { Search, Award, FolderOpen, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PPMPState } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'
import { PpmpStatusBadge } from '../components'
import { AmendmentDialog } from '../dialogs'
import { amendmentDialogOpenAtom, selectedPpmpForEditAtom } from '../atoms'


export function ApprovedPpmpPage() {
  // const navigate = useNavigate()
  // const [search, setSearch] = useState('')
  // const setAmendOpen = useSetAtom(amendmentDialogOpenAtom)
  // const setPpmpForEdit = useSetAtom(selectedPpmpForEditAtom)

  // const { data, isLoading, reload } = usePpmpList({
  //   state: PPMPState.APPROVED,
  //   search,
  // })

  // const handleStartAmendment = async (item: PPMPListItem) => {
  //   const full = await getPpmpRequest.fetcher({
  //     finalUrl: getPpmpRequest.endpoint,
  //     ppmpId: item.id,
  //   })
  //   setPpmpForEdit(full)
  //   setAmendOpen(true)
  // }

  // return (
  //   <div className="space-y-4">
  //     {/* Toolbar */}
  //     <div className="relative max-w-sm">
  //       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //       <Input
  //         placeholder="Search approved PPMPs…"
  //         value={search}
  //         onChange={(e) => setSearch(e.target.value)}
  //         className="pl-9"
  //       />
  //     </div>

  //     {isLoading ? (
  //       <div className="space-y-2">
  //         {[...Array(3)].map((_, i) => (
  //           <Skeleton key={i} className="h-14 w-full rounded" />
  //         ))}
  //       </div>
  //     ) : data.length === 0 ? (
  //       <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
  //         <Award className="h-8 w-8 text-muted-foreground/40" />
  //         <p className="text-sm text-muted-foreground">
  //           {search
  //             ? 'No approved PPMPs match your search.'
  //             : 'No approved PPMPs yet.'}
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
  //                 <td className="px-4 py-3 text-right  text-xs">
  //                   {formatCurrency(ppmp.totalBudget)}
  //                 </td>
  //                 <td className="px-4 py-3 text-center">
  //                   <PpmpStatusBadge state={ppmp.state} />
  //                 </td>
  //                 <td className="px-4 py-3">
  //                   <div className="flex items-center justify-center gap-1">
  //                     <Button
  //                       variant="ghost"
  //                       size="sm"
  //                       onClick={() =>
  //                         navigate({
  //                           to: '/v2/ppmp/$ppmpId',
  //                           params: { ppmpId: ppmp.id },
  //                         })
  //                       }
  //                       className="h-7 gap-1 text-xs"
  //                     >
  //                       <FolderOpen className="h-3 w-3" />
  //                       View
  //                     </Button>
  //                     <Button
  //                       variant="outline"
  //                       size="sm"
  //                       onClick={() => handleStartAmendment(ppmp)}
  //                       className="h-7 gap-1 text-xs"
  //                     >
  //                       <FileEdit className="h-3 w-3" />
  //                       Amend
  //                     </Button>
  //                   </div>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     )}

  //     <AmendmentDialog onSuccess={reload} />
  //   </div>
  // )
}
