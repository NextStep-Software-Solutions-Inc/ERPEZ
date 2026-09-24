import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { CreateRFQModal } from '../components/CreateRFQModal'
import { useRFQStore } from '../store/rfqStore'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { RFQDetailsPage } from './RFQDetailsPage'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Search as SearchIcon, Edit, Trash2, FileText, Send, CheckCircle2, XCircle, ClipboardList, Loader2 } from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import type { RFQ } from '../store/rfqStore'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'

export function RFQPage() {
  const [open, setOpen] = useState(false)
  const [editingRFQ, setEditingRFQ] = useState<RFQ | null>(null)
  const { rfqs, totalCount, summary, fetchRFQs, fetchRFQSummary, fetchRFQById, removeRFQ } = useRFQStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewing, setViewing] = useState<string | null>(null)
  // ID of the row whose Edit action is currently fetching GET /rfqs/{id};
  // keeps the action button visually responsive during the request.
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'returned'>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')
  const columnVisibility: Record<string, boolean> = {
    date: false,
    rfqNumber: true,
    description: true,
    tracingNumber: true,
    modeOfProcurement: true,
    deadline: true,
    deliveryPeriod: true,
    status: true,
  }

  // Re-fetch whenever page, search, or any filter changes.
  useEffect(() => {
    fetchRFQs({
      pageNumber: page,
      pageSize,
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      mode: modeFilter === 'all' ? undefined : modeFilter,
    })
    fetchRFQSummary()
  }, [page, search, statusFilter, modeFilter, fetchRFQs, fetchRFQSummary])

  // Badge color/variant map keyed by normalized status string.
  const STATUS_BADGE_CONFIG: Record<string, { color?: any; variant?: any }> = {
    draft: { color: 'secondary' },
    submitted: { color: 'info', variant: 'outline' },
    approved: { color: 'success', variant: 'outline' },
    returned: { color: 'destructive', variant: 'outline' },
  }

  const normalizeStatus = (sOrR?: string | RFQ) => {
    if (!sOrR) return sOrR as any

    // When given a full RFQ object, use status + remarks to detect "returned".
    if (typeof sOrR === 'object') {
      const st = String(sOrR.status || '').toLowerCase()
      const hasRemarks = !!(sOrR as any).remarks
      if (st === 'draft' && hasRemarks) return 'returned'
      if (st === 'issued') return 'submitted'
      if (st === 'closed') return 'approved'
      return st
    }

    // When given a plain status string, map API aliases to display values.
    const s = String(sOrR).toLowerCase()
    if (s === 'issued') return 'submitted'
    if (s === 'closed') return 'approved'
    return s
  }

  const displayRFQs = rfqs
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const paged = displayRFQs

  // Status counts for the summary cards, sourced from the summary endpoint.
  const statusCounts = {
    draft: summary?.draft ?? 0,
    submitted: summary?.submitted ?? 0,
    approved: summary?.approved ?? 0,
    returned: summary?.returned ?? 0,
  }
  const totalRFQs = summary?.total ?? 0

  // Render the details view in-place when an RFQ is selected.
  // isSupplierPortal={false} — internal procurement view only.
  // The supplier-facing equivalent is RFQItemPage (/supplier-portal/rfq-item),
  // which passes isSupplierPortal={true}.
  if (viewing) {
    return <RFQDetailsPage rfqId={viewing} onBack={() => setViewing(null)} isSupplierPortal={false} />
  }

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...paged.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !paged.map((p) => p.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  // Derive select-all / indeterminate state from the current page.
  const allVisibleSelected = paged.length > 0 && paged.every((r) => selectedIds.includes(r.id))
  const someVisibleSelected = paged.some((r) => selectedIds.includes(r.id)) && !allVisibleSelected

  // Fetch the full RFQ detail before opening the edit modal.
  // GET /rfqs returns list rows without supplier data, so we call
  // GET /rfqs/{id} to ensure supplier checkboxes are pre-populated
  // and won't be silently cleared on save.
  const handleEditClick = async (id: string) => {
    setLoadingEditId(id)
    try {
      const full = await fetchRFQById(id)
      if (full) {
        setEditingRFQ(full)
        setOpen(true)
      }
    } finally {
      setLoadingEditId(null)
    }
  }

  const handleSearchChange = (v: string) => {
    const nextVal = String(v ?? '')
    setSearch((prev) => {
      if (prev !== nextVal) {
        setPage(1)
        return nextVal
      }
      return prev
    })
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Module header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Request for Quotation</CardTitle>
              <CardDescription className="text-base">Manage RFQs — create, edit, and review Requests for Quotation within the procurement module.</CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> RFQ
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RFQ Dashboard</CardTitle>
              <CardDescription>List of RFQs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary cards — click a card to filter by that status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total RFQs</p>
                    <p className="text-3xl font-bold text-blue-900">{totalRFQs}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter('draft')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Draft</p>
                    <p className="text-3xl font-bold text-gray-900">{statusCounts.draft}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Edit className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter('submitted')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-600 mb-1">Submitted</p>
                    <p className="text-3xl font-bold text-cyan-900">{statusCounts.submitted}</p>
                  </div>
                  <div className="h-12 w-12 bg-cyan-200 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-cyan-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter('approved')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{statusCounts.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter('returned')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Returned</p>
                    <p className="text-3xl font-bold text-red-900">{statusCounts.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar: search, filters, and create action */}
          <div className="flex items-center w-full gap-4 flex-wrap pb-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search RFQ number, description or tracing number"
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as any)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={modeFilter}
              onValueChange={(v) => {
                setModeFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filter by Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Small Value Procurement">Small Value Procurement</SelectItem>
                <SelectItem value="Negotiated Procurement">Negotiated Procurement</SelectItem>
                <SelectItem value="Direct Contracting">Direct Contracting</SelectItem>
                <SelectItem value="Public Bidding">Public Bidding</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button onClick={() => setOpen(true)} size="sm" className="gap-2">Create RFQ</Button>
            </div>
          </div>

          {/* RFQ table — empty state shown when there are no results */}
          {displayRFQs.length === 0 ? (
            <div className="rounded-md border flex flex-col min-h-0">
              <div className="flex flex-col items-center justify-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No RFQs found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add a new RFQ.</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allVisibleSelected || (someVisibleSelected && 'indeterminate')}
                          onCheckedChange={(v) => toggleSelectAll(!!v)}
                          aria-label="Select all"
                        />
                      </TableHead>
                      {columnVisibility.date && <TableHead>Date</TableHead>}
                      {columnVisibility.rfqNumber && <TableHead>RFQ Number</TableHead>}
                      {columnVisibility.description && <TableHead>Description</TableHead>}
                      {columnVisibility.tracingNumber && <TableHead>Tracing Number</TableHead>}
                      {columnVisibility.modeOfProcurement && <TableHead>Mode of Procurement</TableHead>}
                      {columnVisibility.deadline && <TableHead>Deadline</TableHead>}
                      {columnVisibility.deliveryPeriod && <TableHead>Delivery Period</TableHead>}
                      {columnVisibility.status && <TableHead>Status</TableHead>}
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="w-12">
                          <Checkbox checked={selectedIds.includes(r.id)} onCheckedChange={(v) => toggleRowSelect(r.id, !!v)} aria-label={`Select ${r.rfqNumber}`} />
                        </TableCell>
                        {columnVisibility.date && (
                          <TableCell className="text-sm text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</TableCell>
                        )}
                        {columnVisibility.rfqNumber && (
                          <TableCell className="font-medium">{r.rfqNumber}</TableCell>
                        )}
                        {columnVisibility.description && (
                          <TableCell className="text-sm text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span title={r.description || ''} className="text-sm truncate cursor-help max-w-[12rem] inline-block">{r.description || '—'}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">{r.description || '—'}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
                        {columnVisibility.tracingNumber && (
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="truncate max-w-[12rem] inline-block">{r.tracingNumber || '—'}</span>
                          </TableCell>
                        )}
                        {columnVisibility.modeOfProcurement && (
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="truncate max-w-[12rem] inline-block">{r.modeOfProcurement || '—'}</span>
                          </TableCell>
                        )}
                        {columnVisibility.deadline && (
                          <TableCell className="text-sm text-muted-foreground">{r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}</TableCell>
                        )}
                        {columnVisibility.deliveryPeriod && (
                          <TableCell className="text-sm text-muted-foreground">{r.deliveryPeriod || '—'}</TableCell>
                        )}
                        {columnVisibility.status && (
                          <TableCell>
                            {r.remarks && normalizeStatus(r) === 'returned' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      className="cursor-help"
                                      color={STATUS_BADGE_CONFIG[normalizeStatus(r)]?.color}
                                      variant={STATUS_BADGE_CONFIG[normalizeStatus(r)]?.variant}
                                    >
                                      {normalizeStatus(r).toUpperCase()}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs text-xs">
                                    <p className="font-semibold mb-1">Return Reason / Remarks:</p>
                                    <p className="text-slate-600">{r.remarks}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Badge
                                color={STATUS_BADGE_CONFIG[normalizeStatus(r)]?.color}
                                variant={STATUS_BADGE_CONFIG[normalizeStatus(r)]?.variant}
                              >
                                {normalizeStatus(r).toUpperCase()}
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={loadingEditId === r.id}>
                                {loadingEditId === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewing(r.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {(normalizeStatus(r) === 'draft' || normalizeStatus(r) === 'returned') && (
                                <DropdownMenuItem onClick={() => handleEditClick(r.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {normalizeStatus(r) === 'draft' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem>
                                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete RFQ</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this RFQ? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeRFQ(r.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          )}

          {/* Pagination controls */}
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">{selectedIds.length} of {displayRFQs.length} selected</div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
              <Button size="sm" disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateRFQModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditingRFQ(null)
        }}
        onSuccess={(rfqId) => {
          setOpen(false)
          setEditingRFQ(null)
          if (rfqId) setViewing(rfqId)
        }}
        initialRFQ={editingRFQ}
      />
    </div>
  )
}
