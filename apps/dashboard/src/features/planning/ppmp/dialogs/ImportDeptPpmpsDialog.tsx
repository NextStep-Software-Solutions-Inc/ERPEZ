/**
 * ImportDeptPpmpsDialog
 * Lets a Master Office PPMP import same-fiscal-year department PPMPs in batches.
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PpmpStatusBadge } from '../components'
import { importDeptPpmpsRequest } from '../handlers'
import {
  importDeptPpmpDialogOpenAtom,
  selectedMasterPpmpForImportAtom,
} from '../atoms'

interface ImportDeptPpmpsDialogProps {
  onSuccess?: () => void
}

// export function ImportDeptPpmpsDialog({ onSuccess }: ImportDeptPpmpsDialogProps) {
//   const navigate = useNavigate()
//   const [open, setOpen] = useAtom(importDeptPpmpDialogOpenAtom)
//   const masterPpmp = useAtomValue(selectedMasterPpmpForImportAtom)
//   const clearMaster = useSetAtom(selectedMasterPpmpForImportAtom)
//   const { data, isLoading, reload } = usePpmpList({ state: 'all', pageSize: 200 })
//   const [search, setSearch] = useState('')
//   const [selectedIds, setSelectedIds] = useState<string[]>([])
//   const [isLoadingImport, setIsLoadingImport] = useState(false)

//   useEffect(() => {
//     if (!open) {
//       setSearch('')
//       setSelectedIds([])
//     }
//   }, [open])

//   const eligible = useMemo(() => {
//     if (!masterPpmp) return []

//     return data.filter(
//       (ppmp) =>
//         ppmp.id !== masterPpmp.id &&
//         !ppmp.isMasterOffice &&
//         ppmp.fiscalYear === masterPpmp.fiscalYear &&
//         !ppmp.consolidatedToMasterId &&
//         (ppmp.documentName.toLowerCase().includes(search.toLowerCase()) ||
//           ppmp.ppmpNumber.toLowerCase().includes(search.toLowerCase()) ||
//           ppmp.libName.toLowerCase().includes(search.toLowerCase())),
//     )
//   }, [data, masterPpmp, search])

//   const toggleSelection = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
//     )
//   }

//   const closeDialog = () => {
//     setOpen(false)
//     clearMaster(null)
//   }

//   const handleImport = async () => {
//     if (!masterPpmp || selectedIds.length === 0) return

//     setIsLoadingImport(true)
//     try {
//       const updated = await importDeptPpmpsRequest.fetcher({
//         data: {
//           masterPpmpId: masterPpmp.id,
//           departmentPpmpIds: selectedIds,
//         },
//       })
//       toast.success(`Imported ${selectedIds.length} department PPMP(s) into the master plan.`)
//       closeDialog()
//       onSuccess?.()
//       navigate({ to: '/v2/ppmp/master-office/$ppmpId', params: { ppmpId: updated.id } })
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Failed to import department PPMPs.')
//     } finally {
//       setIsLoadingImport(false)
//       reload()
//     }
//   }

//   return (
//     <ResponsiveDialog
//       open={open}
//       onOpenChange={(v) => {
//         if (!v) closeDialog()
//         else setOpen(true)
//       }}
//       title="Import Department PPMPs"
//       description={
//         masterPpmp
//           ? `Select same-fiscal-year department PPMPs to consolidate into "${masterPpmp.documentName}".`
//           : 'Select a master PPMP first.'
//       }
//       size="lg"
//       showCloseButton
//     >
//       <div className="space-y-4">
//         <div className="flex items-center gap-3">
//           <Input
//             placeholder="Search department PPMPs…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-sm"
//           />
//           <Badge variant="outline">
//             {eligible.length} eligible department PPMP{eligible.length === 1 ? '' : 's'}
//           </Badge>
//         </div>

//         <div className="rounded-lg border border-border">
//           <ScrollArea className="h-[360px]">
//             {isLoading ? (
//               <div className="p-6 text-sm text-muted-foreground">Loading department PPMPs…</div>
//             ) : eligible.length === 0 ? (
//               <div className="p-6 text-sm text-muted-foreground">
//                 No department PPMPs match the selected fiscal year and search.
//               </div>
//             ) : (
//               <table className="w-full text-sm">
//                 <thead className="sticky top-0 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
//                   <tr>
//                     <th className="px-4 py-2 text-left font-medium">Select</th>
//                     <th className="px-4 py-2 text-left font-medium">Document</th>
//                     <th className="px-4 py-2 text-center font-medium">Status</th>
//                     <th className="px-4 py-2 text-right font-medium">Budget</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border">
//                   {eligible.map((ppmp) => {
//                     const isSelected = selectedIds.includes(ppmp.id)
//                     return (
//                       <tr key={ppmp.id} className={isSelected ? 'bg-primary/5' : ''}>
//                         <td className="px-4 py-3">
//                           <Checkbox
//                             checked={isSelected}
//                             onCheckedChange={() => toggleSelection(ppmp.id)}
//                           />
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="font-medium text-foreground">{ppmp.documentName}</div>
//                           <div className="text-xs text-muted-foreground">
//                             {ppmp.ppmpNumber} · {ppmp.libName}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <PpmpStatusBadge
//                             state={ppmp.state}
//                             currentApprovalStage={ppmp.currentApprovalStage ?? undefined}
//                           />
//                         </td>
//                         <td className="px-4 py-3 text-right font-medium">
//                           {new Intl.NumberFormat('en-PH', {
//                             style: 'currency',
//                             currency: 'PHP',
//                           }).format(ppmp.totalBudget)}
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </ScrollArea>
//         </div>

//         <div className="flex items-center justify-between gap-3">
//           <p className="text-xs text-muted-foreground">
//             Imported department PPMPs become read-only forever after consolidation.
//           </p>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={closeDialog} disabled={isLoadingImport}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleImport}
//               disabled={!masterPpmp || selectedIds.length === 0 || isLoadingImport}
//             >
//               {isLoadingImport ? 'Importing…' : `Import ${selectedIds.length || ''}`}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </ResponsiveDialog>
//   )
// }
export function ImportDeptPpmpsDialog() { }