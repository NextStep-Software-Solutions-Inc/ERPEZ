import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRFQStore } from '@/features/procurement/rfq/store/rfqStore'
import { RFQDetailsPage } from '@/features/procurement/rfq/pages/RFQDetailsPage'
import { Eye, FileText, CheckCircle2, Send, Search as SearchIcon, Calendar, ShoppingBag, XCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { RFQ } from '@/features/procurement/rfq/store/rfqStore'

export function RFQItemPage() {
  const { rfqs } = useRFQStore()
  const [viewing, setViewing] = useState<string | null>(null)

  // Row selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 5

  const normalizeStatus = (r: RFQ) => {
    const st = String(r.status || '').toLowerCase()
    if (st === 'issued') return 'submitted'
    if (st === 'closed') return 'approved'
    return st
  }

  // Suppliers should see RFQs that are open for bidding: both 'submitted' (issued)
  // and 'approved' (closed) statuses are valid. Filtering to only 'approved' would
  // hide RFQs that are actively open but not yet closed/awarded.
  const supplierViewRFQs = rfqs.filter((r) => {
    const s = normalizeStatus(r)
    return s === 'approved' || s === 'submitted'
  })

  const totalPages = Math.max(1, Math.ceil(supplierViewRFQs.length / pageSize))
  const pagedRFQs = supplierViewRFQs.slice((page - 1) * pageSize, page * pageSize)

  const allVisibleSelected = pagedRFQs.length > 0 && pagedRFQs.every((r) => selectedIds.includes(r.id))
  const someVisibleSelected = pagedRFQs.some((r) => selectedIds.includes(r.id)) && !allVisibleSelected

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...pagedRFQs.map((r) => r.id)])))
    else setSelectedIds((s) => s.filter((id) => !pagedRFQs.map((r) => r.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  const stats = {
    available: supplierViewRFQs.length,
    submitted: supplierViewRFQs.filter((r) => r.quotationStatus === 'submitted' && !r.quotationApprovalStatus).length,
    approved: supplierViewRFQs.filter((r) => r.quotationApprovalStatus === 'approved').length,
    returned: supplierViewRFQs.filter((r) => r.quotationApprovalStatus === 'returned').length,
    pending: supplierViewRFQs.filter((r) => !r.quotationStatus || r.quotationStatus === 'draft').length,
  }

  if (viewing) {
    return <RFQDetailsPage rfqId={viewing} onBack={() => setViewing(null)} isSupplierPortal={true} />
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Module Header (purple) */}
      <Card className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-violet-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Supplier Portal</CardTitle>
              <CardDescription className="text-base">
                Supplier-facing portal for viewing RFQs and submitting quotations
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Supplier Portal
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card with orange sub-header and all content inside */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-orange-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl text-orange-900">RFQ Item</CardTitle>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 h-fit">
                  Supplier Portal
                </Badge>
              </div>
              <CardDescription className="text-orange-700 text-sm mt-1 leading-relaxed">
                View approved RFQs and submit your quotations. All RFQs listed below are open for bidding.
                Click "View Details" to see item specifications and submit your competitive bid.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Available RFQs</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.available}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">Pending Quotes</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.pending}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Submitted Quotes</p>
                    <p className="text-3xl font-bold text-indigo-900">{stats.submitted}</p>
                  </div>
                  <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">Returned</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RFQ List (within main card) */}
          <div className="shadow-sm border rounded-md">
            <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Open RFQs</h3>
                  <p className="text-sm text-muted-foreground">Request for Quotations available for bidding</p>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  {stats.available} Available
                </Badge>
              </div>
            </div>
            <div className="p-0">
              {supplierViewRFQs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQs Available</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    There are currently no approved RFQs open for bidding. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allVisibleSelected || (someVisibleSelected ? 'indeterminate' : false)}
                            onCheckedChange={(v) => toggleSelectAll(!!v)}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead className="font-semibold">RFQ Number</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Deadline</TableHead>
                        <TableHead className="font-semibold">Mode of Procurement</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRFQs.map((r) => {
                        const isApproved = r.quotationApprovalStatus === 'approved'
                        const isReturned = r.quotationApprovalStatus === 'returned'
                        const isSubmitted = r.quotationStatus === 'submitted' && !r.quotationApprovalStatus
                        const isPending = !r.quotationStatus || r.quotationStatus === 'draft'
                        return (
                          <TableRow key={r.id} className="hover:bg-blue-50/50 transition-colors">
                            <TableCell className="w-12">
                              <Checkbox
                                checked={selectedIds.includes(r.id)}
                                onCheckedChange={(v) => toggleRowSelect(r.id, !!v)}
                                aria-label={`Select ${r.rfqNumber}`}
                              />
                            </TableCell>
                            <TableCell className="font-semibold text-blue-900">{r.rfqNumber}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {r.description || '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {r.date
                                ? new Date(r.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {r.deadline
                                    ? new Date(r.deadline).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {r.modeOfProcurement || '—'}
                            </TableCell>
                            <TableCell>
                              {isApproved ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300" variant="outline">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  APPROVED
                                </Badge>
                              ) : isReturned ? (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-300" variant="outline">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  RETURNED
                                </Badge>
                              ) : isSubmitted ? (
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300" variant="outline">
                                  <Send className="h-3 w-3 mr-1" />
                                  SUBMITTED
                                </Badge>
                              ) : isPending ? (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-300" variant="outline">
                                  <Send className="h-3 w-3 mr-1" />
                                  PENDING
                                </Badge>
                              ) : (
                                <Badge variant="outline">{normalizeStatus(r).toUpperCase()}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant={isSubmitted || isApproved || isReturned ? 'outline' : 'default'}
                                  onClick={() => setViewing(r.id)}
                                  className={isSubmitted || isApproved || isReturned ? '' : 'bg-blue-600 hover:bg-blue-700'}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {supplierViewRFQs.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4 mt-2">
              <div className="text-sm text-muted-foreground">
                {selectedIds.length} of {supplierViewRFQs.length} row(s) selected.
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page <= 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page >= totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
