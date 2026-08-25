import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RFQDetailsPage } from '@/features/procurement/rfq/pages/RFQDetailsPage'
import { Eye, Calendar, ShoppingBag, Loader2, UserCheck, AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getSupplierRFQInvitationsRequest } from '../handlers/supplierPortalRequests'
import { useSuppliers } from '@/components/features/planning/procurement-library/suppliers/useSuppliers'

const useSupplierRFQInvitations = createQueryHookFromTemplate(getSupplierRFQInvitationsRequest)

export function RFQItemPage() {
  const [viewing, setViewing] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 5

  // 1. Fetch registered suppliers from API
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({
    pathParams: {},
    queryParams: {},
  })
  const registeredSuppliers = suppliersData?.data ?? []

  // 2. Active Supplier ID: Priority is .env -> user selection -> first registered supplier
  const envSupplierId = (import.meta.env.VITE_TEST_SUPPLIER_ID as string) || ''
  const [activeSupplierId, setActiveSupplierId] = useState<string>(envSupplierId)

  useEffect(() => {
    if (!activeSupplierId && registeredSuppliers.length > 0) {
      setActiveSupplierId(registeredSuppliers[0].id)
    }
  }, [registeredSuppliers, activeSupplierId])

  // 3. Fetch invited RFQs for this supplier directly from backend API
  const { data: apiRfqs, isLoading: isLoadingRfqs } = useSupplierRFQInvitations({
    pathParams: {},
    queryParams: {
      supplierId: activeSupplierId,
    },
    enabled: Boolean(activeSupplierId),
  })

  const supplierViewRFQs = useMemo(() => {
    if (!apiRfqs) return []

    return apiRfqs.map((r) => ({
      id: r.id,
      rfqNumber: r.rfqNumber,
      prNumber: r.tracingNumber || '',
      department: 'Procurement Division',
      date: r.date,
      deadline: r.deadline || '',
      status: r.status || 'approved',
      items: (r.items || []).map((it) => ({
        id: it.id,
        itemCode: it.id.substring(0, 8),
        itemName: it.itemName,
        description: it.itemName,
        quantity: it.quantity,
        unit: 'pcs',
        unitPrice: it.unitPriceSnapshot,
        totalAmount: it.totalABC,
        category: it.category || 'General',
        fund: 'General Fund',
      })),
      invitedSuppliers: [],
      quotationStatus: r.hasSubmittedBid ? 'submitted' : 'draft',
      quotationApprovalStatus: r.bidStatus?.toLowerCase(),
    }))
  }, [apiRfqs])

  const totalPages = Math.max(1, Math.ceil(supplierViewRFQs.length / pageSize))
  const pagedRFQs = supplierViewRFQs.slice((page - 1) * pageSize, page * pageSize)

  const allVisibleSelected = pagedRFQs.length > 0 && pagedRFQs.every((r) => selectedIds.includes(r.id))

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

  const selectedSupplierObj = registeredSuppliers.find((s) => s.id === activeSupplierId)

  if (viewing) {
    return (
      <RFQDetailsPage
        rfqId={viewing}
        supplierId={activeSupplierId}
        onBack={() => setViewing(null)}
        isSupplierPortal={true}
      />
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Module Header with Supplier Switcher */}
      <Card className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-violet-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Supplier Portal</CardTitle>
              <CardDescription className="text-base">
                Supplier-facing portal for viewing RFQs and submitting quotations
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/80 border border-violet-200 rounded-lg px-3 py-1.5 shadow-sm">
                <UserCheck className="h-4 w-4 text-violet-700" />
                <span className="text-xs font-semibold text-violet-900">Acting as:</span>
                {isLoadingSuppliers ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Select value={activeSupplierId} onValueChange={setActiveSupplierId}>
                    <SelectTrigger className="h-8 border-violet-200 bg-white text-xs w-[220px]">
                      <SelectValue placeholder="Select a supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredSuppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id} className="text-xs">
                          {sup.name || 'Unnamed Supplier'} ({sup.status || 'Active'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-violet-300 bg-violet-100 text-violet-800">
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Supplier Portal
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
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
                  {selectedSupplierObj?.name || 'Selected Supplier'}
                </Badge>
              </div>
              <CardDescription className="text-orange-700 text-sm mt-1 leading-relaxed">
                View RFQs for which this supplier was invited and submit quotations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-xs text-muted-foreground">Available RFQs</div>
              <div className="text-2xl font-bold">{stats.available}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-xs text-amber-800">Pending Quotation</div>
              <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-800">Submitted</div>
              <div className="text-2xl font-bold text-blue-900">{stats.submitted}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-800">Approved</div>
              <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-800">Returned</div>
              <div className="text-2xl font-bold text-red-900">{stats.returned}</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={(c) => toggleSelectAll(Boolean(c))}
                    />
                  </TableHead>
                  <TableHead>RFQ Number</TableHead>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Quotation Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRfqs ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <div className="text-sm text-muted-foreground mt-2">Loading invited RFQs...</div>
                    </TableCell>
                  </TableRow>
                ) : !activeSupplierId ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      Please select a supplier from the dropdown above.
                    </TableCell>
                  </TableRow>
                ) : pagedRFQs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No RFQs available for this supplier at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRFQs.map((r) => {
                    const isSelected = selectedIds.includes(r.id)
                    const isSubmitted = r.quotationStatus === 'submitted'
                    return (
                      <TableRow key={r.id} className={isSelected ? 'bg-muted/40' : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(c) => toggleRowSelect(r.id, Boolean(c))}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{r.rfqNumber}</TableCell>
                        <TableCell>{r.prNumber || '—'}</TableCell>
                        <TableCell>{r.items?.length || 0} item(s)</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSubmitted ? (
                            <Badge className="bg-blue-600">Submitted</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewing(r.id)}
                            className="gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View & Quote
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
              <div>
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, supplierViewRFQs.length)} of{' '}
                {supplierViewRFQs.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
