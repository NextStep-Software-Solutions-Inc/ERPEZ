import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  MoreVertical, Eye, CheckCircle, Search, FileText, ShoppingBag, ShoppingCart, Send
} from 'lucide-react'
import { useDirectContractingStore } from '../store/directContractingStore'
import { DirectContractingDetailsPage } from '../components/DirectContractingDetailsPage'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrencyPHP } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import { useChangeDirectContractingStatus } from '../handlers'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'for-review': { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300' },
  'submitted-to-supplier': { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  submitted: { label: 'SUBMITTED', className: 'bg-blue-100 text-blue-700 border-blue-300' },
}
    //   •  DRAFT  ➔  FOR_REVIEW                                                                                                                                                      
    //   •  FOR_REVIEW  ➔  SUBMITTED_TO_SUPPLIER  or  RETURNED                                                                                                                        
    //   •  SUBMITTED_TO_SUPPLIER  ➔  PENDING_FOR_APPROVAL                                                                                                                            
    //   •  PENDING_FOR_APPROVAL  ➔  APPROVED  or  RETURNED                                                                                                                           
    //   •  RETURNED  ➔  DRAFT  or  FOR_REVIEW    
export function ManageDirectContractingPage() {
  const { toast } = useToast()
  const { entries, fetchEntries } = useDirectContractingStore()
  const statusMutation = useChangeDirectContractingStatus()

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [confirmSubmitToSupplierId, setConfirmSubmitToSupplierId] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Only entries that have progressed beyond 'draft' are shown in Management
  const managedEntries = useMemo(() => 
    entries.filter(e => e.status !== 'draft')
  , [entries])

  const filteredEntries = useMemo(() => {
    return managedEntries.filter(e => {
      const matchSearch = e.dcNumber.toLowerCase().includes(search.toLowerCase()) || 
                          e.dcName.toLowerCase().includes(search.toLowerCase()) ||
                          e.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
                          e.office.toLowerCase().includes(search.toLowerCase())
      
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [managedEntries, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize))
  const paged = filteredEntries.slice((page - 1) * pageSize, page * pageSize)

  const selectedEntry = entries.find(e => e.id === selectedEntryId)

  if (selectedEntry) {
    return (
      <DirectContractingDetailsPage 
        entry={selectedEntry} 
        onBack={() => setSelectedEntryId(null)} 
        isManagementView={true}
      />
    )
  }

  // Stats
  const stats = {
    forReview: managedEntries.filter(e => e.status === 'for-review').length,
    submittedToSupplier: managedEntries.filter(e => e.status === 'submitted-to-supplier').length,
    submittedDirectly: managedEntries.filter(e => e.status === 'submitted').length,
  }

  const allVisibleSelected = paged.length > 0 && paged.every((r) => selectedIds.includes(r.id))
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...paged.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !paged.some((p) => p.id === id)))
  }
  const toggleRowSelect = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  return (
    <>
      <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Manage Direct Contracting</CardTitle>
              <CardDescription className="text-base">Monitor and manage the lifecycle of proprietary procurement requests.</CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Direct Contracting
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Management Overview</CardTitle>
              <CardDescription>Review and track direct contracting requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.forReview}</p>
                </div>
                <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">With Supplier</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.submittedToSupplier}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                  <Send className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Legacy Submissions</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.submittedDirectly}</p>
                </div>
                <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search Direct Contracting number, name, office..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="for-review">For Review</SelectItem>
                <SelectItem value="submitted-to-supplier">Submitted to Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-lg font-semibold">No requests found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="h-4 w-4"
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Direct Contracting Name</TableHead>
                    <TableHead>Direct Contracting number</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Total ABC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry) => {
                    const cfg = STATUS_CONFIG[entry.status] || { label: entry.status, className: '' }
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell onClick={(e) => e.stopPropagation()} className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(entry.id)}
                            onChange={(e) => toggleRowSelect(entry.id, e.target.checked)}
                            className="h-4 w-4"
                            aria-label={`Select ${entry.dcNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">{entry.dcName}</TableCell>
                        <TableCell className="font-mono font-medium text-primary">{entry.dcNumber}</TableCell>
                        <TableCell className="text-sm">{entry.office}</TableCell>
                        <TableCell className="text-sm">{entry.supplierName || '—'}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrencyPHP(entry.totalABC)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs font-semibold', cfg.className)}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DropdownMenuItem onClick={() => setSelectedEntryId(entry.id)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                               {entry.status === 'for-review' && (
                                <DropdownMenuItem 
                                  className="text-primary font-bold"
                                  onClick={() => setConfirmSubmitToSupplierId(entry.id)}
                                >
                                  <Send className="mr-2 h-4 w-4" /> Submit to Supplier
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground text-nowrap">
                Showing {Math.min(filteredEntries.length, (page - 1) * pageSize + 1)} to {Math.min(filteredEntries.length, page * pageSize)} of {filteredEntries.length} entries
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                <div className="flex items-center gap-1 px-4 cursor-default">
                  <span className="text-sm font-medium">{page}</span>
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">{totalPages}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
      <ConfirmAlertDialog
        open={!!confirmSubmitToSupplierId}
        onOpenChange={(v) => !v && setConfirmSubmitToSupplierId(null)}
        title="Submit Request to Supplier?"
        description="Are you sure you want to submit this Direct Contracting request to the supplier?"
        confirmLabel="Submit"
        onConfirm={async () => {
          if (!confirmSubmitToSupplierId) return
          try {
            await statusMutation.mutateAsync({
              pathParams: { id: confirmSubmitToSupplierId },
              payload: { status: 'SUBMITTED_TO_SUPPLIER' }
            })
            toast({ title: 'Submitted to Supplier', description: 'Request has been forwarded to the supplier.' })
            await fetchEntries()
          } catch (err) {
            console.error(err)
            toast({ title: 'Error', description: 'Failed to submit request to supplier.' })
          } finally {
            setConfirmSubmitToSupplierId(null)
          }
        }}
      />
    </>
  )
}
