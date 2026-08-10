/**
 * For Approval Page
 * Shows PPMPs in Pending Review state, filtered to the current user's approval role.
 * Approver can click a row to open the workspace and approve/reject.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { Search, Inbox, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApprovalRole } from '../types'
import { PPMPState } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'
import { PpmpStatusBadge } from '../components'
import { ApprovalDialog } from '../dialogs'
import {
  approvalDialogOpenAtom,
  rejectionDialogOpenAtom,
  selectedPpmpForEditAtom,
} from '../atoms'
// import { usePpmpList } from '../hooks/usePpmpList'
// import { getPpmpRequest } from '../handlers/getPpmpRequest'
// import type { PPMPListItem } from '../types'

// Simulated current user's role (replace with Keycloak hook)
const MOCK_ROLE: ApprovalRole = 'budget_officer' as ApprovalRole

export function ForApprovalPage() {
  // const navigate = useNavigate()
  // const [search, setSearch] = useState('')
  // const setApproveOpen = useSetAtom(approvalDialogOpenAtom)
  // const setRejectOpen = useSetAtom(rejectionDialogOpenAtom)
  // const setPpmpForEdit = useSetAtom(selectedPpmpForEditAtom)

  // const { data, isLoading, reload } = usePpmpList({
  //   state: PPMPState.PENDING_REVIEW,
  //   search,
  // })

  // // Filter to items at the current user's approval stage
  // const forMyApproval = data.filter((p) => p.currentApprovalStage === MOCK_ROLE)

  // const loadAndApprove = async (
  //   item: PPMPListItem,
  //   action: 'approve' | 'reject',
  // ) => {
  //   const full = await getPpmpRequest.fetcher({
  //     finalUrl: getPpmpRequest.endpoint,
  //     ppmpId: item.id,
  //   })
  //   setPpmpForEdit(full)
  //   if (action === 'approve') setApproveOpen(true)
  //   else setRejectOpen(true)
  // }

  // return (
  //   <div className="space-y-4">
  //     {/* Toolbar */}
  //     <div className="flex items-center gap-3">
  //       <div className="relative flex-1 max-w-sm">
  //         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //         <Input
  //           placeholder="Search pending PPMPs…"
  //           value={search}
  //           onChange={(e) => setSearch(e.target.value)}
  //           className="pl-9"
  //         />
  //       </div>
  //       <p className="text-xs text-muted-foreground ml-auto">
  //         Role: <strong>{MOCK_ROLE.replace('_', ' ').toUpperCase()}</strong>
  //       </p>
  //     </div>

  //     {/* Table */}
  //     {isLoading ? (
  //       <div className="space-y-2">
  //         {[...Array(3)].map((_, i) => (
  //           <Skeleton key={i} className="h-14 w-full rounded" />
  //         ))}
  //       </div>
  //     ) : forMyApproval.length === 0 ? (
  //       <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
  //         <Inbox className="h-8 w-8 text-muted-foreground/40" />
  //         <p className="text-sm text-muted-foreground">
  //           No PPMPs awaiting your approval.
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
  //               <th className="px-4 py-2 text-center font-medium">Stage</th>
  //               <th className="px-4 py-2 text-center font-medium">Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody className="divide-y divide-border">
  //             {forMyApproval.map((ppmp) => (
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
  //                 <td className="px-4 py-3 text-right text-xs">
  //                   {formatCurrency(ppmp.totalBudget)}
  //                 </td>
  //                 <td className="px-4 py-3 text-center">
  //                   <PpmpStatusBadge
  //                     state={ppmp.state}
  //                     currentApprovalStage={
  //                       ppmp.currentApprovalStage ?? undefined
  //                     }
  //                   />
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
  //                       className="h-7 text-xs"
  //                     >
  //                       View
  //                     </Button>
  //                     <Button
  //                       size="sm"
  //                       variant="outline"
  //                       onClick={() => loadAndApprove(ppmp, 'approve')}
  //                       className="h-7 gap-1 text-xs"
  //                     >
  //                       <CheckCircle2 className="h-3 w-3" />
  //                       Approve
  //                     </Button>
  //                     <Button
  //                       size="sm"
  //                       variant="ghost"
  //                       onClick={() => loadAndApprove(ppmp, 'reject')}
  //                       className="h-7 text-xs text-destructive hover:text-destructive"
  //                     >
  //                       Reject
  //                     </Button>
  //                   </div>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     )}

  //     <ApprovalDialog currentUserRole={MOCK_ROLE} onSuccess={reload} />
  //   </div>
  // )
}
