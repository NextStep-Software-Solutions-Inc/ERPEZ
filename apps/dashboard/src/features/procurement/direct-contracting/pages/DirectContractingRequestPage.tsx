import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { MoreVertical, Eye, Trash2, ShoppingCart, Plus, Search, Send, CheckCircle2, Building } from 'lucide-react'
import { CreateDirectContractingModal } from '../components/CreateDirectContractingModal'
import { UpdateDirectContractingModal } from '../components/UpdateDirectContractingModal'
import { ViewProposalDetailsModal } from '../components/ViewProposalDetailsModal'
import { DirectContractingDetailsPage } from '../components/DirectContractingDetailsPage'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { DirectContracting } from '../store/directContractingStore'
import type { DirectContractingRequestSearch } from '@/routes/v2/(procurement)/direct-contracting-request/index'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  submitted: { label: 'SUBMITTED', className: 'bg-blue-50 text-blue-800 border-blue-300' },
  'for-review': { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300' },
  'submitted-to-supplier': { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
}

export function DirectContractingRequestPage() {
  const searchParams = useSearch({ strict: false }) as DirectContractingRequestSearch
  const navigate = useNavigate({
    from: "/v2/direct-contracting-request"
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [editEntryId, setEditEntryId] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmSubmitId, setConfirmSubmitId] = useState<string | null>(null)

  // Search and filter parameters from route search schema
  const search = searchParams?.searchQuery ?? ''
  const statusFilter = searchParams?.status ?? 'all'
  const page = searchParams?.pageNumber ?? 1
  const pageSize = searchParams?.pageSize ?? 8

  const handleSearchChange = (q: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        searchQuery: q || undefined,
        pageNumber: 1,
      }),
    })
  }

  const handleStatusChange = (val: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: val === 'all' ? undefined : val,
        pageNumber: 1,
      }),
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageNumber: newPage,
      }),
    })
  }

  // Placeholder data for requests until query hooks are wired
  const entries: DirectContracting[] = []

  // Empty KPI counts placeholder
  const counts = {
    total: 0,
    draft: 0,
    submitted: 0,
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null

  const handleOpenView = (entry: DirectContracting) => {
    setSelectedEntryId(entry.id)
  }

  if (selectedEntry) {
    return (
      <DirectContractingDetailsPage
        entry={selectedEntry}
        onBack={() => setSelectedEntryId(null)}
      />
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Direct Contracting</CardTitle>
              <CardDescription className="text-base">
                Single-source procurement for proprietary items. Strictly requires Proof of Exclusivity.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <Building className="h-3.5 w-3.5 mr-1.5" /> RA 12009 / Rule XVI
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Contracting Dashboard</CardTitle>
              <CardDescription>List of Direct Contracting Requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Submitted</p>
                  <p className="text-3xl font-bold text-amber-900">{counts.submitted}</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-amber-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search Direct Contracting number, PR#, Supplier..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48" variant="bordered" radius="md">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 ml-auto">
              <Plus className="h-4 w-4" /> Create Request
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Direct Contracting Name</TableHead>
                  <TableHead>Direct Contracting number</TableHead>
                  <TableHead>PR / Resolution</TableHead>
                  <TableHead>Exclusive Supplier</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mb-1" />
                        <p className="text-sm font-medium text-muted-foreground">
                          No direct contracting requests found
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Click &quot;+ Create Request&quot; to initialize a new request.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/40">
                        <TableCell onClick={(e) => e.stopPropagation()}><Checkbox /></TableCell>
                        <TableCell className="font-semibold">{entry.dcName}</TableCell>
                        <TableCell className="font-semibold text-primary">{entry.dcNumber}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{entry.prNumber}</div>
                          <div className="text-xs text-muted-foreground">{entry.bacResolutionNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">{entry.supplierName || 'Not Assigned'}</div>
                          <div className="text-xs text-muted-foreground">{entry.office}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">₱{entry.totalABC.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[10px] font-bold", cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => handleOpenView(entry)}>
                                <Eye className="h-4 w-4" /> View Details
                              </DropdownMenuItem>

                              {entry.status === 'draft' && (
                                <DropdownMenuItem
                                  className="gap-2 text-blue-600 font-semibold"
                                  onClick={() => setConfirmSubmitId(entry.id)}
                                >
                                  <Send className="h-4 w-4" /> Submit
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmDeleteId(entry.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? 'Showing 0 to 0 of 0 entries'
                : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, entries.length)} of ${entries.length} entries`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? 'default' : 'outline'}
                    size="sm"
                    className="w-8"
                    disabled={entries.length === 0}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateDirectContractingModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      {editEntryId && (
        <UpdateDirectContractingModal
          open={!!editEntryId}
          onOpenChange={(v) => {
            if (!v) setEditEntryId(null)
          }}
          editEntryId={editEntryId}
        />
      )}
      <ViewProposalDetailsModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        entry={selectedEntry}
      />

      <ConfirmAlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete Request?"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => setConfirmDeleteId(null)}
      />
      <ConfirmAlertDialog
        open={!!confirmSubmitId}
        onOpenChange={(v) => !v && setConfirmSubmitId(null)}
        title="Submit Request for Review?"
        description="Are you sure you want to submit this Direct Contracting request for review?"
        confirmLabel="Submit"
        onConfirm={() => setConfirmSubmitId(null)}
      />
    </div>
  )
}

