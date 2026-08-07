import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Eye, Trash2, ShoppingCart, Plus, Search, Send, CheckCircle2, RotateCcw } from 'lucide-react'
import { useDirectAcquisitionStore } from '../store/directAcquisitionStore'
import { CreateDirectAcquisitionModal } from '../components/CreateDirectAcquisitionModal'
import { DirectAcquisitionDetailsPage } from '../components/DirectAcquisitionDetailsPage'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  purchase_entry: { label: 'PURCHASE ENTRY', className: 'bg-blue-50 text-blue-800 border-blue-300' },
  for_disbursement: { label: 'FOR DISBURSEMENT', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  returned: { label: 'RETURNED', className: 'bg-red-50 text-red-800 border-red-300' },
}

export function DirectAcquisitionRequestPage() {
  const { entries, removeEntry } = useDirectAcquisitionStore()
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [viewing, setViewing] = useState<string | null>(null)

  // --- Filters / KPI state kept at page level ---
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  if (viewing) {
    const entry = entries.find((e) => e.id === viewing)
    if (entry) return <DirectAcquisitionDetailsPage entry={entry} onBack={() => setViewing(null)} />
  }

  const filtered = entries.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.daNumber.toLowerCase().includes(q) ||
      e.prNumber.toLowerCase().includes(q) ||
      (e.bacResolutionNumber && e.bacResolutionNumber.toLowerCase().includes(q)) ||
      e.office.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    )
  })

  const counts = {
    total: entries.length,
    draft: entries.filter((e) => e.status === 'draft').length,
    purchase_entry: entries.filter((e) => e.status === 'purchase_entry').length,
    for_disbursement: entries.filter((e) => e.status === 'for_disbursement').length,
    returned: entries.filter((e) => e.status === 'returned').length,
  }

  const handleRemove = (id: string) => {
    removeEntry(id)
    toast({ title: 'Removed', description: 'Direct acquisition request removed.' })
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Direct Acquisition Request</CardTitle>
              <CardDescription className="text-base">
                Manage streamlined direct purchases under RA 12009 — no bidding, no BAC resolution required.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Direct Acquisition
              </Badge>
              {/* Create Request button removed from header */}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Single unified card — summary widgets + status tiles + table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Acquisition Dashboard</CardTitle>
              <CardDescription>List of Direct Acquisition Requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-blue-900">{counts.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Draft</p>
                  <p className="text-3xl font-bold text-gray-800">{counts.draft}</p>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">For Disbursement</p>
                  <p className="text-3xl font-bold text-amber-900">{counts.for_disbursement}</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-amber-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Returned</p>
                  <p className="text-3xl font-bold text-red-900">{counts.returned}</p>
                </div>
                <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-red-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar + Table + Pagination extracted into small components */}
          <TableToolbar
            search={search}
            setSearch={(s: string) => {
              setSearch(s)
              setPage(1)
            }}
            statusFilter={statusFilter}
            setStatusFilter={(s: string) => {
              setStatusFilter(s)
              setPage(1)
            }}
            onCreate={() => setCreateOpen(true)}
          />

          <DirectAcquisitionTable
            entries={filtered}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            onView={(id: string) => setViewing(id)}
            onRemove={handleRemove}
          />
        </CardContent>
      </Card>

      <CreateDirectAcquisitionModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

/* -------------------- Small extracted components -------------------- */

function TableToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onCreate,
}: {
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  onCreate: () => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search DA#, PR#, Reso#, office..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40" variant="bordered" radius="md" color="default">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="purchase_entry">Purchase Entry</SelectItem>
          <SelectItem value="for_disbursement">For Disbursement</SelectItem>
          <SelectItem value="returned">Returned</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onCreate} className="gap-2 ml-auto">
        <Plus className="h-4 w-4" /> Create Direct Acquisition
      </Button>
    </div>
  )
}

function DirectAcquisitionTable({
  entries,
  page,
  setPage,
  pageSize,
  onView,
  onRemove,
}: {
  entries: any[]
  page: number
  setPage: (p: number) => void
  pageSize: number
  onView: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const paged = entries.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...paged.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !paged.map((p) => p.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  const allVisibleSelected = paged.length > 0 && paged.every((r) => selectedIds.includes(r.id))
  const someVisibleSelected = paged.some((r) => selectedIds.includes(r.id)) && !allVisibleSelected

  return entries.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
      <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <h3 className="text-lg font-semibold">No requests found</h3>
      <p className="text-muted-foreground text-sm mt-1">Create a new Direct Acquisition Request to get started.</p>
    </div>
  ) : (
    <> 
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(v) => toggleSelectAll(!!v)}
                  aria-label="Select all"
                  aria-checked={someVisibleSelected ? 'mixed' : allVisibleSelected ? 'true' : 'false'}
                />
              </TableHead>
              <TableHead>DA Number</TableHead>
              <TableHead>PR Number</TableHead>
              <TableHead>Requesting Office</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total ABC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((entry) => {
              const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft
              return (
                <TableRow key={entry.id} className="hover:bg-muted/40">
                  <TableCell onClick={(e) => e.stopPropagation()} className="w-12">
                    <Checkbox checked={selectedIds.includes(entry.id)} onCheckedChange={(v) => toggleRowSelect(entry.id, !!v)} aria-label={`Select ${entry.daNumber}`} />
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{entry.daNumber}</TableCell>
                  <TableCell>
                    <div>{entry.prNumber}</div>
                    {entry.bacResolutionNumber && (
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        Reso: {entry.bacResolutionNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{entry.office}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.category}</TableCell>
                  <TableCell className="font-medium">₱{entry.totalABC.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs font-semibold', cfg.className)}>
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(entry.id)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setConfirmDeleteId(entry.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-sm text-muted-foreground">{selectedIds.length} of {entries.length} selected</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Direct Acquisition Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected Direct Acquisition Request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId) {
                  onRemove(confirmDeleteId)
                  setConfirmDeleteId(null)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
