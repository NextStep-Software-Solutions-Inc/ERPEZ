/**
 * My Drafts Page
 * Lists Draft and Rejected PPMPs belonging to the current user.
 * Provides Create, Open Workspace, and Delete actions.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { PlusCircle, FolderOpen, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PPMPState } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'
import { PpmpStatusBadge } from '../components'
import { CreatePpmpDialog, DeletePpmpDialog } from '../dialogs'
import {
  createPpmpDialogOpenAtom,
  deletePpmpDialogOpenAtom,
  selectedPpmpForDeleteAtom,
} from '../atoms'


export function MyDraftsPage() {
  // const navigate = useNavigate()
  // const [search, setSearch] = useState('')
  // const [page] = useState(1)

  // const setCreateOpen = useSetAtom(createPpmpDialogOpenAtom)
  // const setDeleteOpen = useSetAtom(deletePpmpDialogOpenAtom)
  // const setDeleteTarget = useSetAtom(selectedPpmpForDeleteAtom)

  // const { data, total, isLoading, reload } = usePpmpList({
  //   state: 'all',
  //   search,
  //   page,
  //   pageSize: 20,
  // })

  // // Filter to drafts + rejected client-side (handler already does server-side filter but state='all' lets us show both)
  // const filtered = data.filter(
  //   (p) => p.state === PPMPState.DRAFT || p.state === PPMPState.REJECTED,
  // )

  // const handleDelete = (item: PPMPListItem) => {
  //   setDeleteTarget(item)
  //   setDeleteOpen(true)
  // }

  // return (
  //   <div className="space-y-4">
  //     {/* Toolbar */}
  //     <div className="flex items-center gap-3 justify-between">
  //       <div className="relative flex-1 max-w-sm">
  //         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //         <Input
  //           placeholder="Search PPMPs…"
  //           value={search}
  //           onChange={(e) => setSearch(e.target.value)}
  //           className="pl-9"
  //         />
  //       </div>
  //       <Button
  //         size="sm"
  //         onClick={() => setCreateOpen(true)}
  //         className="gap-1.5"
  //       >
  //         <PlusCircle className="h-3.5 w-3.5" />
  //         New PPMP
  //       </Button>
  //     </div>

  //     {/* Table */}
  //     {isLoading ? (
  //       <div className="space-y-2">
  //         {[...Array(4)].map((_, i) => (
  //           <Skeleton key={i} className="h-14 w-full rounded" />
  //         ))}
  //       </div>
  //     ) : filtered.length === 0 ? (
  //       <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
  //         <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
  //         <p className="text-sm text-muted-foreground">
  //           {search
  //             ? 'No PPMPs match your search.'
  //             : "You don't have any drafts yet."}
  //         </p>
  //         {!search && (
  //           <Button
  //             size="sm"
  //             variant="outline"
  //             onClick={() => setCreateOpen(true)}
  //             className="mt-2 gap-1.5"
  //           >
  //             <PlusCircle className="h-3.5 w-3.5" />
  //             Create your first PPMP
  //           </Button>
  //         )}
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
  //             {filtered.map((ppmp) => (
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
  //                       Open
  //                     </Button>
  //                     <Button
  //                       variant="ghost"
  //                       size="sm"
  //                       onClick={() => handleDelete(ppmp)}
  //                       className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
  //                     >
  //                       <Trash2 className="h-3 w-3" />
  //                       Delete
  //                     </Button>
  //                   </div>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //         <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
  //           Showing {filtered.length} of {total} documents
  //         </div>
  //       </div>
  //     )}

  //     {/* Dialogs */}
  //     <CreatePpmpDialog />
  //     <DeletePpmpDialog onSuccess={reload} />
  //   </div>
  // )
}
