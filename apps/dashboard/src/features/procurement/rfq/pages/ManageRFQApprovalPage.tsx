import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, CheckCircle, CornerDownLeft, FileText, Send, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { useRFQStore } from '../store/rfqStore'
import { RFQDetailsPage } from './RFQDetailsPage'
import { ApprovePRModal } from '@/features/procurement/purchase-requests-pr/components/ApprovePRModal'
import { ReturnPRModal } from '@/features/procurement/purchase-requests-pr/components/ReturnPRModal'
import { useToast } from '@/components/ui/use-toast'

export default function ManageRFQApprovalPage() {
  const { rfqs, fetchRFQs, changeRFQStatus } = useRFQStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 8

  // For modals
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [activeRFQ, setActiveRFQ] = useState<string | null>(null)

  // Fetch RFQs for approval on mount / search change
  useEffect(() => {
    fetchRFQs({ pageNumber: 1, pageSize: 100, search: search || undefined })
  }, [fetchRFQs, search])

  // Show 'issued' (For Approval), 'closed' (Approved), and 'draft' (Returned) RFQs
  const displayRFQs = rfqs.filter((r) => (r.status === 'submitted' || r.status === 'approved' || (r.status === 'returned' || (r.status === 'draft' && r.remarks))) && (
    !search || r.rfqNumber.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase())
  ))

  const totalPages = Math.max(1, Math.ceil(displayRFQs.length / pageSize))
  const paged = displayRFQs.slice((page - 1) * pageSize, page * pageSize)

  // Calculate status counts for cards
  const statusCounts = {
    forApproval: rfqs.filter((r) => r.status === 'submitted').length,
    approved: rfqs.filter((r) => r.status === 'approved' ).length,
    returned: rfqs.filter((r) => r.status === 'returned' || (r.status === 'draft' && r.remarks)).length,
  }
  const totalRFQs = statusCounts.forApproval + statusCounts.approved + statusCounts.returned

  if (viewing) {
    return <RFQDetailsPage rfqId={viewing} onBack={() => setViewing(null)} />
  }

  const openApprove = (id: string) => {
    setActiveRFQ(id)
    setApproveOpen(true)
  }

  const openReturn = (id: string) => {
    setActiveRFQ(id)
    setReturnOpen(true)
  }

  const handleApprove = async (signedPdfUrl: string) => {
    if (!activeRFQ) return
    await changeRFQStatus(activeRFQ, 'approved', `Signed URL: ${signedPdfUrl}`)
    setApproveOpen(false)
    setActiveRFQ(null)
    toast({ title: 'RFQ approved', description: 'RFQ has been approved.' })
    fetchRFQs({ pageNumber: 1, pageSize: 100, search: search || undefined })
  }

  const handleReturn = async (remarks: string) => {
    if (!activeRFQ) return
    await changeRFQStatus(activeRFQ, 'returned', remarks)
    setReturnOpen(false)
    setActiveRFQ(null)
    toast({ title: 'RFQ returned', description: 'RFQ has been returned with remarks.' })
    fetchRFQs({ pageNumber: 1, pageSize: 100, search: search || undefined })
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <CardTitle className="text-3xl">Manage RFQ</CardTitle>
          <CardDescription className="text-base">Dashboard for BAC Chairperson to review and approve RFQs</CardDescription>
        </div>
        <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
          <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Manage RFQ
        </Badge>
        </div>
      </CardHeader>
      </Card>

      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
        <div>
          <CardTitle>RFQs For Approval</CardTitle>
          <CardDescription>RFQs pending approval by BAC Chairperson</CardDescription>
        </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total RFQs Card */}
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

          {/* For Approval Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">For Approval</p>
                  <p className="text-3xl font-bold text-amber-900">{statusCounts.forApproval}</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
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
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
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

        <div className="flex items-center gap-4 px-4 pb-4">
        <input placeholder="Search RFQ number or description" value={search} onChange={(e) => setSearch(e.target.value)} className="input input-bordered w-96 py-2 px-3" />
        <div className="ml-auto text-sm text-muted-foreground">Page {page} of {totalPages}</div>
        </div>

        {displayRFQs.length === 0 ? (
        <div className="rounded-md border flex-1 flex flex-col min-h-0">
          <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold">No RFQs for approval</h3>
          <p className="text-muted-foreground">There are currently no RFQs with For Approval status.</p>
          </div>
        </div>
        ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tracing Number</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.rfqNumber}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.description || '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.tracingNumber || '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}</TableCell>
              <TableCell>
               {r.status === 'approved' ? (
                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">APPROVED</Badge>
               ) : r.status === 'returned' || (r.status === 'draft' && r.remarks) ? (
                 <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">RETURNED</Badge>
               ) : (
                 <Badge variant="outline">FOR APPROVAL</Badge>
               )}
               </TableCell>
               <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewing(r.id)}>
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </DropdownMenuItem>

                {r.status === 'submitted' && (
                  <>
                  <DropdownMenuItem onClick={() => openApprove(r.id)}>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => openReturn(r.id)}>
                    <CornerDownLeft className="h-4 w-4 mr-2 text-destructive" /> Return
                  </DropdownMenuItem>
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

        <div className="flex items-center justify-between px-6 py-4">
        <div className="text-sm text-muted-foreground">
          {displayRFQs.length} RFQ(s) total ({displayRFQs.filter(r => r.status === 'submitted').length} pending approval, {displayRFQs.filter(r => r.status === 'approved').length} approved, {displayRFQs.filter(r => r.status === 'returned' || (r.status === 'draft' && r.remarks)).length} returned)
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
          <Button size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</Button>
        </div>
        </div>
      </CardContent>
      </Card>

      {/* Reuse the PR modal components but provide RFQ-specific copy via props */}
      <ApprovePRModal
        open={approveOpen}
        onOpenChange={(open: boolean) => {
          setApproveOpen(open)
          if (!open) setActiveRFQ(null)
        }}
        onApprove={(signedPdfUrl: string) => handleApprove(signedPdfUrl)}
      />
            <ReturnPRModal
              open={returnOpen}
              onOpenChange={(open: boolean) => {
                setReturnOpen(open)
                if (!open) setActiveRFQ(null)
              }}
              onReturn={(remarks: string) => handleReturn(remarks)}
            />
          </div>
        )
      }
