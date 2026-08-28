import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Eye, CheckCircle, CornerDownLeft, Trash2, Search, ShoppingCart, Upload, ShoppingBag, Loader2, Send } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { DirectAcquisitionDetailsPage } from '../components/DirectAcquisitionDetailsPage'
import {
  useDirectAcquisitions,
  useDirectAcquisitionsSummary,
  useApproveDirectAcquisition,
  useReturnDirectAcquisition,
  useChangeDirectAcquisitionStatus,
  useDeleteDirectAcquisition,
} from '../handlers'
import type { DirectAcquisition } from '../store/directAcquisitionStore'
import api from '@/services/api'
import { cn } from '@/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  purchase_entry: { label: 'PURCHASE ENTRY', className: 'bg-blue-50 text-blue-800 border-blue-300' },
  approved: { label: 'APPROVED', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  for_disbursement: { label: 'FOR DISBURSEMENT', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  returned: { label: 'RETURNED', className: 'bg-red-50 text-red-800 border-red-300' },
}

function ReturnDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  remarks: string
  onRemarksChange: (v: string) => void
  onConfirm: () => void
  isLoading?: boolean
}) {
  const { open, onOpenChange, remarks, onRemarksChange, onConfirm, isLoading } = props
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Return Direct Acquisition" description="Provide remarks for returning this entry" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <Textarea value={remarks} onChange={(e) => onRemarksChange((e.target as HTMLTextAreaElement).value)} className="mt-2" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!remarks.trim() || isLoading} className="gap-1.5">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Return
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

function UploadApprovalDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (file: File) => Promise<void>
}) {
  const { open, onOpenChange, onConfirm } = props

  const approveSchema = z.object({
    pdfFile: z.instanceof(File, { message: 'PDF file is required' }).refine(
      (file) => file.type === 'application/pdf',
      'File must be a PDF',
    ),
  })

  type ApproveFormData = z.infer<typeof approveSchema>

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

  const onSubmit = async (data: ApproveFormData) => {
    setIsSubmitting(true)
    try {
      await onConfirm(data.pdfFile)
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
            Approve Direct Acquisition
          </DialogTitle>
          <DialogDescription>Upload the physically signed approval document to approve it.</DialogDescription>
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
                    <Input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="da-approve-pdf" />
                    <label htmlFor="da-approve-pdf" className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{fileSelected ? fileSelected.name : 'Click to upload'}</p>
                        {fileSelected ? (
                          <p className="text-xs text-muted-foreground mt-1">File size: {(fileSelected.size / 1024 / 1024).toFixed(2)} MB</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
                        )}
                      </div>
                    </label>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!fileSelected || isSubmitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve & Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function ManageDirectAcquisitionPage() {
  const { data: daList, isLoading } = useDirectAcquisitions({ queryParams: {} })
  const { data: summaryData } = useDirectAcquisitionsSummary({ queryParams: {} })
  const approveMutation = useApproveDirectAcquisition()
  const returnMutation = useReturnDirectAcquisition()
  const changeStatusMutation = useChangeDirectAcquisitionStatus()
  const deleteMutation = useDeleteDirectAcquisition()
  const { toast } = useToast()

  const [viewingId, setViewingId] = useState<string | null>(null)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnTargetId, setReturnTargetId] = useState<string | null>(null)
  const [returnRemarks, setReturnRemarks] = useState('')

  const [uploadApprovalOpen, setUploadApprovalOpen] = useState(false)
  const [approvalTargetId, setApprovalTargetId] = useState<string | null>(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const entries: DirectAcquisition[] = daList ?? []

  if (viewingId) {
    const entry = entries.find((e) => e.id === viewingId)
    if (entry) return <DirectAcquisitionDetailsPage entry={entry} onBack={() => setViewingId(null)} readOnly />
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
      e.category.toLowerCase().includes(q) ||
      (e.supplier && e.supplier.toLowerCase().includes(q))
    )
  })

  const counts = {
    total: summaryData?.total ?? entries.length,
    purchase_entry: summaryData?.purchaseEntry ?? entries.filter((e) => e.status === 'purchase_entry').length,
    for_disbursement: summaryData?.forDisbursement ?? entries.filter((e) => e.status === 'for_disbursement').length,
    approved: summaryData?.approved ?? entries.filter((e) => e.status === 'approved').length,
    returned: summaryData?.returned ?? entries.filter((e) => e.status === 'returned').length,
  }

  const handleReturnConfirm = async () => {
    if (!returnTargetId || !returnRemarks.trim()) return
    try {
      await returnMutation.mutateAsync({
        pathParams: { id: returnTargetId },
        payload: { remarks: returnRemarks },
      })
      toast({ title: 'Returned', description: 'Direct acquisition request returned for revision.' })
      setReturnDialogOpen(false)
      setReturnTargetId(null)
      setReturnRemarks('')
    } catch (err: any) {
      toast({ title: 'Return Failed', description: err?.message || 'Failed to return request.', variant: 'destructive' })
    }
  }

  const handleApproveConfirm = async (file: File) => {
    if (!approvalTargetId) return
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const fileId = uploadRes.data?.data

      await approveMutation.mutateAsync({
        pathParams: { id: approvalTargetId },
        payload: {
          approvedFileId: fileId,
          approvedFileName: file.name,
          approvedFileType: 'pdf',
        },
      })

      toast({ title: 'Approved', description: 'Direct acquisition approved with signed document attached.' })
      setUploadApprovalOpen(false)
      setApprovalTargetId(null)
    } catch (err: any) {
      toast({ title: 'Approval Failed', description: err?.message || 'Failed to approve request.', variant: 'destructive' })
    }
  }

  const handleMarkForDisbursement = async (id: string) => {
    try {
      await changeStatusMutation.mutateAsync({
        pathParams: { id },
        payload: { status: 'FOR_DISBURSEMENT' },
      })
      toast({ title: 'Status Updated', description: 'Direct acquisition marked For Disbursement.' })
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err?.message || 'Failed to update status.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ pathParams: { id } })
      toast({ title: 'Deleted', description: 'Direct acquisition request removed.' })
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err?.message || 'Failed to delete request.', variant: 'destructive' })
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Manage Direct Acquisition</CardTitle>
              <CardDescription className="text-base">
                Review, approve, return, and route Direct Acquisitions for disbursement processing under RA 12009.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Direct Acquisition Management
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Acquisition Overview</CardTitle>
          <CardDescription>Review submissions, approve signed documents, or route to disbursement</CardDescription>
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
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Purchase Entry</p>
                  <p className="text-3xl font-bold text-indigo-900">{counts.purchase_entry}</p>
                </div>
                <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-indigo-700" />
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
                  <CheckCircle className="h-6 w-6 text-amber-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Approved</p>
                  <p className="text-3xl font-bold text-emerald-900">{counts.approved}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search DA#, PR#, supplier..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
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
              <SelectTrigger className="w-44" variant="bordered" radius="md" color="default">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="purchase_entry">Purchase Entry</SelectItem>
                <SelectItem value="for_disbursement">For Disbursement</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading direct acquisitions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-lg font-semibold">No direct acquisition records found</h3>
              <p className="text-muted-foreground text-sm mt-1">Direct acquisition requests will appear here for review and disbursement.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DA Number</TableHead>
                    <TableHead>PR Number</TableHead>
                    <TableHead>Requesting Office</TableHead>
                    <TableHead>Supplier / Store</TableHead>
                    <TableHead>Total ABC</TableHead>
                    <TableHead>Final Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setViewingId(entry.id)}>
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
                        <TableCell className="text-sm">
                          {entry.supplier ? (
                            <span className="font-medium">{entry.supplier}</span>
                          ) : (
                            <span className="text-muted-foreground italic">— Not recorded —</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">₱{entry.totalABC.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">
                          {entry.finalAmount ? (
                            `₱${entry.finalAmount.toLocaleString()}`
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs font-semibold', cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingId(entry.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>

                              {entry.status === 'purchase_entry' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setApprovalTargetId(entry.id)
                                      setUploadApprovalOpen(true)
                                    }}
                                    className="text-emerald-600 focus:text-emerald-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Approve (Upload Signed Doc)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleMarkForDisbursement(entry.id)}
                                    className="text-amber-600 focus:text-amber-600"
                                  >
                                    <Send className="h-4 w-4 mr-2" /> Mark For Disbursement
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setReturnTargetId(entry.id)
                                      setReturnDialogOpen(true)
                                    }}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <CornerDownLeft className="h-4 w-4 mr-2" /> Return with Remarks
                                  </DropdownMenuItem>
                                </>
                              )}

                              {entry.status === 'approved' && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkForDisbursement(entry.id)}
                                  className="text-amber-600 focus:text-amber-600"
                                >
                                  <Send className="h-4 w-4 mr-2" /> Route For Disbursement
                                </DropdownMenuItem>
                              )}

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
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-muted-foreground">Showing {paged.length} of {filtered.length} entries</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Dialog */}
      <ReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        remarks={returnRemarks}
        onRemarksChange={setReturnRemarks}
        onConfirm={handleReturnConfirm}
        isLoading={returnMutation.isPending}
      />

      {/* Upload Approval Dialog */}
      <UploadApprovalDialog
        open={uploadApprovalOpen}
        onOpenChange={setUploadApprovalOpen}
        onConfirm={handleApproveConfirm}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Direct Acquisition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the direct acquisition entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId) {
                  handleDelete(confirmDeleteId)
                  setConfirmDeleteId(null)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageDirectAcquisitionPage
