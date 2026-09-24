import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MoreVertical,
  Eye,
  CheckCircle,
  CornerDownLeft,
  Trash2,
  Search,
  ShoppingBag,
  Upload,
} from 'lucide-react'
import { useDirectContractingStore } from '@/features/procurement/direct-contracting/store/directContractingStore'
import type { DirectContracting } from '../types'
import { useReviewProposal, useApproveDirectContracting } from '../handlers'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { DirectContractingItemDetails } from '@/features/procurement/supplier-portal/_components/DirectContractingItemDetails'
// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'for-review': {
    label: 'PENDING FOR APPROVAL',
    className: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  approved: {
    label: 'APPROVED',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  rejected: {
    label: 'RETURNED',
    className: 'bg-red-50 text-red-800 border-red-300',
  },
}

// ── Return Dialog ─────────────────────────────────────────────────────────────
function ReturnDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  remarks: string
  onRemarksChange: (v: string) => void
  onConfirm: () => void
}) {
  const { open, onOpenChange, remarks, onRemarksChange, onConfirm } = props
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Return Direct Contracting"
      description="Provide remarks for returning this entry"
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <Textarea
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!remarks.trim()}>
            Return
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

// ── Upload Approval Dialog ────────────────────────────────────────────────────
const approveSchema = z.object({
  pdfFile: z
    .instanceof(File, { message: 'PDF file is required' })
    .refine((file) => file.type === 'application/pdf', 'File must be a PDF'),
})
type ApproveFormData = z.infer<typeof approveSchema>

function UploadApprovalDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (file: File) => void
}) {
  const { open, onOpenChange, onConfirm } = props
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileSelected, setFileSelected] = useState<File | null>(null)

  const form = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
    defaultValues: { pdfFile: undefined as unknown as File },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFileSelected(f)
      form.setValue('pdfFile', f)
    }
  }

  const onSubmit = () => {
    setIsSubmitting(true)
    try {
      if (fileSelected) onConfirm(fileSelected)
      setFileSelected(null)
      form.reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setFileSelected(null)
          form.reset()
        }
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            Approve Direct Contracting
          </DialogTitle>
          <DialogDescription>
            Upload the physically signed approval document to approve it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pdfFile"
              render={() => (
                <FormItem>
                  <FormLabel>Signed Approval Document</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="supplier-dc-approve-pdf"
                    />
                    <label
                      htmlFor="supplier-dc-approve-pdf"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {fileSelected ? fileSelected.name : 'Click to upload'}
                        </p>
                        {fileSelected ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            File size: {(fileSelected.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                        )}
                      </div>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <span className="font-medium">Note:</span> Ensure the PDF contains the physical
                signature of the approving authority and all required approval marks as per
                Appendix 60 standards.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setFileSelected(null)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !fileSelected}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Approving...' : 'APPROVE'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageSupplierDirectContractingPage() {
  const { entries, updateEntry, fetchEntries } = useDirectContractingStore()

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Viewing item details
  const [viewing, setViewing] = useState<string | null>(null)

  // Return dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [returnRemarks, setReturnRemarks] = useState('')

  // Approve dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalTargetId, setApprovalTargetId] = useState<string | null>(null)

  // Confirm remove
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Only show items submitted by the supplier
  const submittedItems = entries.filter(
    (item) =>
      (item.daRequirementsStatus === 'submitted' ||
        item.quotationStatus === 'submitted' ||
        ['for-review', 'approved', 'rejected'].includes(item.status)) &&
      !item.removedFromDashboard,
  )  // Apply search + status filters
  const display = submittedItems.filter((item) => {
    const sFilter = statusFilter === 'all' ? true : item.status === statusFilter
    if (!sFilter) return false

    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.dcNumber.toLowerCase().includes(q) ||
      item.prNumber.toLowerCase().includes(q) ||
      item.dcName.toLowerCase().includes(q) ||
      (item.supplierName || '').toLowerCase().includes(q) ||
      item.office.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(display.length / pageSize))
  const paged = display.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
    setSelectedIds([])
  }, [search, statusFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  // KPI counts
  const statusCounts = {
    total: submittedItems.length,
    forReview: submittedItems.filter((i) => i.status === 'for-review').length,
    approved: submittedItems.filter((i) => i.status === 'approved').length,
    returned: submittedItems.filter((i) => i.status === 'rejected').length,
  }

  // Selection helpers
  const allVisibleSelected =
    paged.length > 0 && paged.every((r) => selectedIds.includes(r.id))
  const visibleSelectedCount = selectedIds.filter((id) => display.some((d) => d.id === id)).length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, ...paged.map((p) => p.id)])))
    else setSelectedIds((s) => s.filter((id) => !paged.some((p) => p.id === id)))
  }
  const toggleRowSelect = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((s) => Array.from(new Set([...s, id])))
    else setSelectedIds((s) => s.filter((x) => x !== id))
  }

  // Handlers
  const openReturn = (id: string) => {
    setActiveId(id)
    setReturnDialogOpen(true)
  }
  const openApprove = (id: string) => {
    setApprovalTargetId(id)
    setApprovalDialogOpen(true)
  }

  const reviewProposalMutation = useReviewProposal()
  const approveMutation = useApproveDirectContracting()

  const handleReturnConfirm = async () => {
    if (!activeId) return
    try {
      await reviewProposalMutation.mutateAsync({
        pathParams: { id: activeId },
        payload: {
          action: "Reject",
          remarks: returnRemarks
        }
      })
      updateEntry(activeId, { status: 'rejected', remarks: returnRemarks })
      setReturnRemarks('')
      setReturnDialogOpen(false)
      setActiveId(null)
      toast({ title: 'Returned', description: 'Entry returned with remarks.' })
      await fetchEntries()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to submit review action.'
      })
    }
  }

  const handleApproveConfirm = async (file?: File) => {
    if (!approvalTargetId) return
    if (!file) {
      toast({
        title: 'Document Required',
        description: 'Physical signed document is required for approval.',
        variant: 'destructive',
      })
      return
    }

    try {
      await approveMutation.mutateAsync({
        pathParams: { id: approvalTargetId },
        payload: {
          directContractingId: approvalTargetId,
          signedDocument: file,
        }
      })

      const basePatch: Partial<DirectContracting> = {
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString().split('T')[0],
      }

      try {
        const blobUrl = URL.createObjectURL(file)

        const existing = entries.find((i) => i.id === approvalTargetId)?.approvalDocumentUrl
        if (existing && existing.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(existing)
          } catch {
            /* ignore revoke errors */
          }
        }

        const patch: Partial<DirectContracting> = {
          ...basePatch,
          approvalDocumentFileName: file.name,
          approvalDocumentUrl: blobUrl,
        }

        updateEntry(approvalTargetId, patch)
        setApprovalTargetId(null)
        toast({
          title: 'Approved',
          description: 'Entry approved and signed document uploaded (preview available).',
        })
      } catch (err) {
        updateEntry(approvalTargetId, basePatch)
        setApprovalTargetId(null)
        toast({
          title: 'Approved',
          description: 'Entry approved (failed to create preview URL for uploaded file).',
        })
      }

      await fetchEntries()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to submit review approval.'
      })
    }
  }

  const handleRemove = (id: string) => {
    updateEntry(id, { removedFromDashboard: true })
    setSelectedIds((s) => s.filter((x) => x !== id))
    toast({ title: 'Removed', description: 'Entry hidden from dashboard.' })
  }

  // If viewing item details
  const viewingItem = viewing ? entries.find((i) => i.id === viewing) ?? null : null
  if (viewing && viewingItem) {
    return <DirectContractingItemDetails item={viewingItem} onBack={() => setViewing(null)} />
  }

  return (
    <>
      <div className="w-full space-y-6 pb-10">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <CardTitle className="text-3xl">Manage Supplier Direct Contracting</CardTitle>
                <CardDescription className="text-base">
                  Manage supplier-facing Direct Contracting entries and interactions
                </CardDescription>
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
            <CardTitle>Direct Contracting Entries</CardTitle>
            <CardDescription>Overview of direct purchase records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Total Entries
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{statusCounts.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-700" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                      Approved
                    </p>
                    <p className="text-3xl font-bold text-emerald-900">{statusCounts.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-700" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Pending for Approval
                    </p>
                    <p className="text-3xl font-bold text-amber-900">{statusCounts.forReview}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-amber-700" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                      Returned
                    </p>
                    <p className="text-3xl font-bold text-red-900">{statusCounts.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <CornerDownLeft className="h-6 w-6 text-red-700" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search DC#, PR#, office, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="for-review">Pending for Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {display.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-semibold">No entries found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {submittedItems.length === 0
                    ? 'No supplier-submitted DC entries yet. Submitted entries from the Supplier Portal will appear here.'
                    : 'Try adjusting your search or filter.'}
                </p>
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
                      <TableHead>DC Number</TableHead>
                      <TableHead>PR Number</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Total ABC</TableHead>
                      <TableHead>Final Amount</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((item: DirectContracting) => {
                      const cfg =
                        STATUS_CONFIG[item.status] ?? { label: item.status, className: '' }
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/40">
                          <TableCell
                            onClick={(e) => e.stopPropagation()}
                            className="w-12"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={(e) => toggleRowSelect(item.id, e.target.checked)}
                              className="h-4 w-4"
                              aria-label={`Select ${item.dcNumber}`}
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {item.dcNumber}
                          </TableCell>
                          <TableCell>{item.prNumber}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.office}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.category}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₱{item.totalABC.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.proposalAmount
                              ? `₱${item.proposalAmount.toLocaleString()}`
                              : `₱${item.totalABC.toLocaleString()}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.supplierName || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('text-xs font-semibold', cfg.className)}
                            >
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
                                <DropdownMenuItem onClick={() => setViewing(item.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                {item.status === 'for-review' && (
                                  <>
                                    <DropdownMenuItem onClick={() => openApprove(item.id)}>
                                      <Upload className="h-4 w-4 mr-2 text-emerald-600" />
                                      Approve (upload signed)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openReturn(item.id)}>
                                      <CornerDownLeft className="h-4 w-4 mr-2 text-red-600" />
                                      Return
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setConfirmDeleteId(item.id)}
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
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-muted-foreground">
                {visibleSelectedCount} of {display.length} selected
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Return Dialog */}
      <ReturnDialog
        open={returnDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setReturnDialogOpen(false)
            setActiveId(null)
            setReturnRemarks('')
          } else {
            setReturnDialogOpen(true)
          }
        }}
        remarks={returnRemarks}
        onRemarksChange={setReturnRemarks}
        onConfirm={handleReturnConfirm}
      />

      {/* Upload Approval Dialog */}
      <UploadApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        onConfirm={(file: File) => handleApproveConfirm(file)}
      />

      {/* Confirm Remove */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Direct Contracting Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the entry from this view. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId) {
                  handleRemove(confirmDeleteId)
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
