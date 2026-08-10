import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateContractModal } from '../components/CreateContractModal'
import { useContractStore } from '../store/contractStore'
import { Badge } from '@/components/ui/badge'
import { ContractDetailsPage } from '../components/ContractDetailsPage'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Search as SearchIcon, Edit, Trash2, Send, CheckCircle2, XCircle, FileSignature } from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import type { Contract } from '../store/contractStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'

export function ContractPage() {
  const [open, setOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const { contracts, removeContract } = useContractStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewing, setViewing] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'for-approval' | 'approved' | 'returned'>('all')

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    contractDate: true,
    contractNumber: true,
    description: true,
    noaNumber: true,
    supplier: true,
    category: true,
    totalAmount: true,
    status: true,
  })

  const toggleColumn = (key: string) =>
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }))

  // Status badge configuration
  const STATUS_BADGE_CONFIG: Record<string, { color?: any; variant?: any }> = {
    draft: { color: 'secondary' },
    'for-approval': { color: 'info', variant: 'outline' },
    approved: { color: 'success', variant: 'outline' },
    returned: { color: 'destructive', variant: 'outline' },
  }

  const matchesStatusFilter = (
    contract: Contract,
    filter: 'all' | 'draft' | 'for-approval' | 'approved' | 'returned',
  ) => {
    if (filter === 'all') return true
    return contract.status === filter
  }

  const displayContracts = contracts.filter((c) => {
    const q = (search || '').trim().toLowerCase()
    if (!matchesStatusFilter(c, statusFilter)) return false
    if (!q) return true
    return (
      (c.contractNumber || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.noaNumber || '').toLowerCase().includes(q) ||
      (c.supplierName || '').toLowerCase().includes(q)
    )
  })

  // Keep the current page clamped
  const totalPagesForDisplay = Math.max(1, Math.ceil(displayContracts.length / pageSize))
  useEffect(() => {
    setPage((p) => {
      if (p < 1) return 1
      if (p > totalPagesForDisplay) return totalPagesForDisplay
      return p
    })
  }, [displayContracts.length, pageSize, totalPagesForDisplay])

  const totalPages = Math.max(1, Math.ceil(displayContracts.length / pageSize))
  const paged = displayContracts.slice((page - 1) * pageSize, page * pageSize)

  // Calculate status counts for cards
  const statusCounts = {
    draft: contracts.filter((c) => c.status === 'draft').length,
    forApproval: contracts.filter((c) => c.status === 'for-approval').length,
    approved: contracts.filter((c) => c.status === 'approved').length,
    returned: contracts.filter((c) => c.status === 'returned').length,
  }
  const totalContracts = contracts.length

  // If viewing a specific contract, render the details page
  if (viewing) {
    return <ContractDetailsPage contractId={viewing} onBack={() => setViewing(null)} />
  }

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...paged.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !paged.map((p) => p.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  // Calculate if all or some visible items are selected
  const allVisibleSelected = paged.length > 0 && paged.every((c) => selectedIds.includes(c.id))
  const someVisibleSelected = paged.some((c) => selectedIds.includes(c.id)) && !allVisibleSelected

  return (
    <div className="w-full space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Contracts (For Consulting/Infrastructure)</CardTitle>
              <CardDescription className="text-base">
                Contract management placeholder page for consulting and infrastructure.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <FileSignature className="h-3.5 w-3.5 mr-1.5" /> Contracts
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contract Dashboard</CardTitle>
              <CardDescription>Manage contracts linked to approved NOAs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Contracts Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Contracts</p>
                    <p className="text-3xl font-bold text-blue-900">{totalContracts}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <FileSignature className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Draft Card */}
            <Card
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setStatusFilter('draft')}
            >
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

            {/* For Approval Card */}
            <Card
              className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setStatusFilter('for-approval')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-600 mb-1">For Approval</p>
                    <p className="text-3xl font-bold text-cyan-900">{statusCounts.forApproval}</p>
                  </div>
                  <div className="h-12 w-12 bg-cyan-200 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-cyan-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Card */}
            <Card
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setStatusFilter('approved')}
            >
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

            {/* Returned Card */}
            <Card
              className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setStatusFilter('returned')}
            >
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

          {/* Toolbar */}
          <div className="flex items-center w-full gap-4 flex-wrap pb-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search contract, NOA, or supplier"
                value={search}
                onChange={(v: any) => setSearch(String(v))}
                className="w-full pl-10"
              />
            </div>

            <div className="flex gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.keys(columnVisibility).map((key) => (
                    <DropdownMenuItem
                      key={key}
                      onSelect={(e) => { e.preventDefault(); toggleColumn(key) }}
                      className="flex items-center gap-2 capitalize cursor-pointer"
                    >
                      <Checkbox checked={columnVisibility[key]} className="pointer-events-none" />
                      {key.replace(/([A-Z])/g, ' $1')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => {
                  setEditingContract(null)
                  setOpen(true)
                }}
                size="sm"
                className="gap-2"
              >
                Create Contract
              </Button>
            </div>
          </div>

          {displayContracts.length === 0 ? (
            <div className="rounded-md border flex-1 flex flex-col min-h-0">
              <div className="flex flex-col items-center justify-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No contracts found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or add a new contract.</p>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setEditingContract(null)
                      setOpen(true)
                    }}
                    size="sm"
                  >
                    Create Contract
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
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
                    {columnVisibility.contractNumber && <TableHead>Contract Number</TableHead>}
                    {columnVisibility.description && <TableHead>Description</TableHead>}
                    {columnVisibility.noaNumber && <TableHead>Linked NOA</TableHead>}
                    {columnVisibility.supplier && <TableHead>Supplier</TableHead>}
                    {columnVisibility.category && <TableHead>Category</TableHead>}
                    {columnVisibility.totalAmount && <TableHead className="text-right">Total Amount</TableHead>}
                    {columnVisibility.contractDate && <TableHead>Date</TableHead>}
                    {columnVisibility.status && <TableHead>Status</TableHead>}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={(v) => toggleRowSelect(c.id, !!v)}
                          aria-label={`Select ${c.contractNumber}`}
                        />
                      </TableCell>
                      {columnVisibility.contractNumber && <TableCell className="font-medium">{c.contractNumber}</TableCell>}
                      {columnVisibility.description && (
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {c.description || '—'}
                        </TableCell>
                      )}
                      {columnVisibility.noaNumber && (
                        <TableCell className="text-sm font-medium text-blue-600">{c.noaNumber}</TableCell>
                      )}
                      {columnVisibility.supplier && (
                        <TableCell className="text-sm text-muted-foreground">{c.supplierName}</TableCell>
                      )}
                      {columnVisibility.category && (
                        <TableCell>
                          <Badge variant="outline">
                            {c.category}
                          </Badge>
                        </TableCell>
                      )}
                      {columnVisibility.totalAmount && (
                        <TableCell className="text-right font-semibold">₱ {c.totalAmount.toLocaleString()}</TableCell>
                      )}
                      {columnVisibility.contractDate && (
                        <TableCell className="text-sm text-muted-foreground">
                          {c.contractDate ? new Date(c.contractDate).toLocaleDateString() : '—'}
                        </TableCell>
                      )}
                      {columnVisibility.status && (
                        <TableCell>
                          <Badge
                            color={STATUS_BADGE_CONFIG[c.status]?.color}
                            variant={STATUS_BADGE_CONFIG[c.status]?.variant}
                          >
                            {c.status === 'for-approval' ? 'FOR APPROVAL' : c.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewing(c.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {c.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingContract(c)
                                    setOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Contract</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this contract? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeContract(c.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {displayContracts.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * pageSize + 1, displayContracts.length)} to{' '}
                {Math.min(page * pageSize, displayContracts.length)} of {displayContracts.length} contracts
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Contract Modal */}
      <CreateContractModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setEditingContract(null)
        }}
        onSuccess={(id) => setViewing(id)}
        initialContract={editingContract}
      />
    </div>
  )
}
