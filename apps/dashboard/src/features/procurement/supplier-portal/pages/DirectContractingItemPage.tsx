import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Search as SearchIcon,
  ShoppingCart,
  Upload,
  CheckCircle2,
  Eye,
  MoreVertical,
  X,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useDirectContractingStore } from '@/features/procurement/direct-contracting/store/directContractingStore'
import { DirectContractingItemDetails } from '../_components/DirectContractingItemDetails'
import { cn } from '@/lib/utils'

export function DirectContractingItemPage() {
  const { entries, fetchEntries } = useDirectContractingStore()

  useEffect(() => {
    if (fetchEntries) {
      fetchEntries()
    }
  }, [fetchEntries])

  // Filters
  const [search, setSearch] = useState('')

  // Full-page view id (replaces modal/dialog view)
  const [viewingId, setViewingId] = useState<string | null>(null)

  // Row selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Filtered Direct Contracting entries (submitted to supplier, for-review, approved, or rejected)
  const dcEntries = entries.filter((e) =>
    ['submitted-to-supplier', 'for-review', 'approved', 'rejected'].includes(e.status)
  )

  // Filter based on search
  const filtered = dcEntries.filter((it) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      it.dcNumber.toLowerCase().includes(q) ||
      it.prNumber.toLowerCase().includes(q) ||
      it.dcName.toLowerCase().includes(q) ||
      (it.supplierName || '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const allVisibleSelected = pagedItems.length > 0 && pagedItems.every((it) => selectedIds.includes(it.id))
  const someVisibleSelected = selectedIds.length > 0 && !allVisibleSelected

  const toggleSelectAll = (checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...pagedItems.map((it) => it.id)])))
    else setSelectedIds((s) => s.filter((id) => !pagedItems.map((it) => it.id).includes(id)))
  }

  const toggleRowSelect = (id: string, checked?: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  // If viewing an item, render the full-page details component (same pattern as RFQDetailsPage)
  const viewingEntry = viewingId ? entries.find((it) => it.id === viewingId) ?? null : null
  if (viewingEntry) {
    return <DirectContractingItemDetails item={viewingEntry} onBack={() => setViewingId(null)} />
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
                Supplier-facing portal for direct contracting and RFQ interactions
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Supplier Portal
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-orange-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl text-orange-900">Direct Contracting Item</CardTitle>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 h-fit">
                  Supplier Portal
                </Badge>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 h-fit text-xs">
                  RA 12009
                </Badge>
              </div>
              <CardDescription className="text-orange-700 text-sm mt-1 leading-relaxed">
                Record and manage direct supplier/store purchases under the RA 12009 Direct Contracting process.
                Upload receipts, track approval status, and ensure threshold compliance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase">Proprietary Requests</p>
                  <p className="text-2xl font-bold text-indigo-900">{dcEntries.length}</p>
                </div>
                <div className="h-10 w-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pending Bids</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {dcEntries.filter(e => e.status === 'submitted-to-supplier' && !e.proposalAmount).length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                  <Upload className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Submitted Proposals</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {dcEntries.filter(e => e.status === 'for-review' || e.status === 'approved' || e.status === 'rejected' || e.proposalAmount).length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="shadow-sm border rounded-md">
            <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Direct Contracting Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct supplier/store purchases under RA 12009 — threshold-compliant transactions
                  </p>
                </div>
              </div>
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <div className="relative w-72">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search DC number, item, or supplier..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-0">
              {dcEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500 text-center max-w-md">Try adjusting your filters or search term.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                        <TableHead className="font-semibold whitespace-nowrap">DC Number</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">PR Number</TableHead>
                        <TableHead className="font-semibold">Item Name</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Supplier / Store</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Purchase Source</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Purchase Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedItems.map((item) => {
                        return (
                          <TableRow key={item.id} className="hover:bg-violet-50/40 transition-colors">
                            <TableCell className="w-12">
                              <Checkbox
                                checked={selectedIds.includes(item.id)}
                                onCheckedChange={(v) => toggleRowSelect(item.id, !!v)}
                                aria-label={`Select ${item.dcNumber}`}
                              />
                            </TableCell>
                            <TableCell className="font-semibold text-violet-900 whitespace-nowrap">
                              {item.dcNumber}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {item.prNumber}
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px]">
                              <span title={item.dcName} className="line-clamp-2">
                                {item.dcName}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[160px]">
                              <span title={item.supplierName} className="line-clamp-1">
                                {item.supplierName}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                Accredited Supplier
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs flex items-center whitespace-nowrap px-3 py-1 font-semibold",
                                  item.status === 'approved'
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : item.status === 'rejected'
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : (item.status === 'for-review' || item.proposalAmount)
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                )}
                              >
                                {item.status === 'approved' ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                                    Approved
                                  </>
                                ) : item.status === 'rejected' ? (
                                  <>
                                    <X className="h-3 w-3 mr-1 text-red-600" />
                                    Rejected
                                  </>
                                ) : (item.status === 'for-review' || item.proposalAmount) ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                                    Submitted
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                    Pending Quotation
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewingId(item.id)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
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
              )}
            </div>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4 mt-2">
              <div className="text-sm text-muted-foreground">
                {selectedIds.length} of {filtered.length} row(s) selected.
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
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
