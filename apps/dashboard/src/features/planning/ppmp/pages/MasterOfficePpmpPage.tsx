/**
 * MasterOfficePpmpPage
 * Lists Master Office PPMPs and gives Office Heads an entry point to open the
 * consolidation workspace or create a new master PPMP.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import {
  FilePlus2,
  Search,
  FolderOpen,
  Layers3,
  GitMerge,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '../lib/ppmpUtils'
// import { usePpmpList } from '../hooks/usePpmpList'
import { PpmpStatusBadge } from '../components'
import { CreatePpmpDialog } from '../dialogs'
import { createMasterPpmpDialogOpenAtom } from '../atoms'
import { mockPpmpDatabase } from '../data/mockPpmpData'

export function MasterOfficePpmpPage() {
  // const navigate = useNavigate()
  // const [search, setSearch] = useState('')
  // const setCreateMasterOpen = useSetAtom(createMasterPpmpDialogOpenAtom)

  // const { data, isLoading } = usePpmpList({
  //   state: 'all',
  //   search: '',
  //   page: 1,
  //   pageSize: 200,
  // })

  // const masters = useMemo(
  //   () =>
  //     data.filter(
  //       (item) =>
  //         item.isMasterOffice &&
  //         (!search.trim() ||
  //           item.documentName.toLowerCase().includes(search.toLowerCase()) ||
  //           item.ppmpNumber.toLowerCase().includes(search.toLowerCase()) ||
  //           item.libName.toLowerCase().includes(search.toLowerCase())),
  //     ),
  //   [data, search],
  // )

  // const referenceFiscalYear = masters[0]?.fiscalYear ?? new Date().getFullYear()
  // const importedCount = (masterId: string) =>
  //   mockPpmpDatabase.filter((item) => item.consolidatedIntoId === masterId)
  //     .length

  // return (
  //   <div className="space-y-4">
  //     {/* Metrics Cards */}
  //     <div className="grid gap-4 sm:grid-cols-3">
  //       <div className="rounded-xl border border-indigo-100 bg-white border-l-4 border-l-indigo-500 hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between shadow-sm">
  //         <div className="space-y-1">
  //           <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/80">
  //             Master PPMPs
  //           </div>
  //           <div className="text-3xl font-extrabold text-indigo-950">
  //             {masters.length}
  //           </div>
  //         </div>
  //         <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500">
  //           <Layers3 className="h-5 w-5" />
  //         </div>
  //       </div>

  //       <div className="rounded-xl border border-emerald-100 bg-white border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between shadow-sm">
  //         <div className="space-y-1">
  //           <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80">
  //             Consolidated Children
  //           </div>
  //           <div className="text-3xl font-extrabold text-emerald-950">
  //             {masters.reduce(
  //               (sum, master) => sum + importedCount(master.id),
  //               0,
  //             )}
  //           </div>
  //         </div>
  //         <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
  //           <GitMerge className="h-5 w-5" />
  //         </div>
  //       </div>

  //       <div className="rounded-xl border border-amber-100 bg-white border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between shadow-sm">
  //         <div className="space-y-1">
  //           <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600/80">
  //             Same-FY Department PPMPs
  //           </div>
  //           <div className="text-3xl font-extrabold text-amber-950">
  //             {
  //               data.filter(
  //                 (item) =>
  //                   !item.isMasterOffice &&
  //                   item.fiscalYear === referenceFiscalYear &&
  //                   !item.consolidatedToMasterId,
  //               ).length
  //             }
  //           </div>
  //         </div>
  //         <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
  //           <Building2 className="h-5 w-5" />
  //         </div>
  //       </div>
  //     </div>

  //     {/* Main Content Card */}
  //     <Card className="border-border/70 bg-white shadow-sm">
  //       <CardContent className="space-y-4 p-4">
  //         <div className="flex items-center gap-3 justify-between flex-wrap">
  //           <div className="relative flex-1 max-w-sm">
  //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //             <Input
  //               placeholder="Search master office PPMPs…"
  //               value={search}
  //               onChange={(e) => setSearch(e.target.value)}
  //               className="pl-9"
  //             />
  //           </div>
  //           <Button
  //             size="sm"
  //             onClick={() => setCreateMasterOpen(true)}
  //             className="gap-1.5"
  //           >
  //             <FilePlus2 className="h-3.5 w-3.5" />
  //             Create Master PPMP
  //           </Button>
  //         </div>

  //         {isLoading ? (
  //           <div className="space-y-2">
  //             {[...Array(4)].map((_, i) => (
  //               <Skeleton key={i} className="h-14 w-full rounded" />
  //             ))}
  //           </div>
  //         ) : masters.length === 0 ? (
  //           <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
  //             <Layers3 className="h-8 w-8 text-muted-foreground/40" />
  //             <p className="text-sm text-muted-foreground">
  //               {search
  //                 ? 'No master office PPMPs match your search.'
  //                 : 'No master office PPMPs yet.'}
  //             </p>
  //             {!search && (
  //               <Button
  //                 size="sm"
  //                 variant="outline"
  //                 onClick={() => setCreateMasterOpen(true)}
  //                 className="mt-2 gap-1.5"
  //               >
  //                 <FilePlus2 className="h-3.5 w-3.5" />
  //                 Create the first master PPMP
  //               </Button>
  //             )}
  //           </div>
  //         ) : (
  //           <div className="rounded-lg border border-border overflow-hidden bg-white shadow-sm">
  //             <table className="w-full text-sm">
  //               <thead>
  //                 <tr className="bg-muted/40 border-b border-border text-sm font-medium text-muted-foreground">
  //                   <th className="px-4 py-3 text-left font-medium">
  //                     Document
  //                   </th>
  //                   <th className="px-4 py-3 text-center font-medium">FY</th>
  //                   <th className="px-4 py-3 text-right font-medium">Budget</th>
  //                   <th className="px-4 py-3 text-center font-medium">
  //                     Imported
  //                   </th>
  //                   <th className="px-4 py-3 text-center font-medium">
  //                     Status
  //                   </th>
  //                   <th className="px-4 py-3 text-center font-medium">
  //                     Actions
  //                   </th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-border">
  //                 {masters.map((master) => (
  //                   <tr
  //                     key={master.id}
  //                     className="hover:bg-muted/20 transition-colors"
  //                   >
  //                     <td className="px-4 py-3">
  //                       <div className="font-medium text-foreground">
  //                         {master.documentName}
  //                       </div>
  //                       <div className="text-xs text-muted-foreground">
  //                         {master.ppmpNumber} · {master.libName}
  //                       </div>
  //                     </td>
  //                     <td className="px-4 py-3 text-center">
  //                       {master.fiscalYear}
  //                     </td>
  //                     <td className="px-4 py-3 text-right font-medium">
  //                       {formatCurrency(master.totalBudget)}
  //                     </td>
  //                     <td className="px-4 py-3 text-center">
  //                       <Badge variant="outline">
  //                         {importedCount(master.id)} batches
  //                       </Badge>
  //                     </td>
  //                     <td className="px-4 py-3 text-center">
  //                       <PpmpStatusBadge
  //                         state={master.state}
  //                         currentApprovalStage={
  //                           master.currentApprovalStage ?? undefined
  //                         }
  //                       />
  //                     </td>
  //                     <td className="px-4 py-3">
  //                       <div className="flex items-center justify-center gap-1">
  //                         <Button
  //                           variant="ghost"
  //                           size="sm"
  //                           onClick={() =>
  //                             navigate({
  //                               to: '/v2/ppmp/master-office/$ppmpId',
  //                               params: { ppmpId: master.id },
  //                             })
  //                           }
  //                           className="h-7 gap-1 text-xs"
  //                         >
  //                           <FolderOpen className="h-3 w-3" />
  //                           Open
  //                         </Button>
  //                       </div>
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //             <div className="px-4 py-3 border-t border-border text-sm font-medium text-muted-foreground bg-muted/40 flex items-center justify-between">
  //               <span>
  //                 Showing {masters.length} of {masters.length} documents
  //               </span>
  //             </div>
  //           </div>
  //         )}
  //       </CardContent>
  //     </Card>

  //     <CreatePpmpDialog
  //       openAtom={createMasterPpmpDialogOpenAtom}
  //       title="Create Master Office PPMP"
  //       description="Create a master PPMP workspace for consolidating submitted department PPMPs."
  //       preSelectedOfficeId="master-office"
  //     />
  //   </div>
  // )
}
