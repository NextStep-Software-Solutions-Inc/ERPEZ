import { useState, useEffect } from 'react'
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
import { MoreVertical, Eye, CheckCircle, CornerDownLeft, Trash2, Search, ShoppingCart, Upload, ShoppingBag } from 'lucide-react'
import { useDirectAcquisitionStore, type ProofFile } from '../store/directAcquisitionStore'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { DirectAcquisitionDetailsPage } from '../components/DirectAcquisitionDetailsPage'
import { cn } from '@/lib/utils'

// Add form/dialog imports for PDF approve modal
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type DirectAcquisitionEntry = any

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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
}) {
  const { open, onOpenChange, remarks, onRemarksChange, onConfirm } = props
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Return Direct Acquisition" description="Provide remarks for returning this entry" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <Textarea value={remarks} onChange={(e) => onRemarksChange((e.target as HTMLTextAreaElement).value)} className="mt-2" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!remarks.trim()}>Return</Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}

function UploadApprovalDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (files: { id: string; name: string; fileType?: ProofFile['fileType']; uploadedAt: string }[]) => void
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

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

  // Revoke object URL when it changes or when component unmounts to avoid leaks
  useEffect(() => {
    return () => {
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl) } catch {}
      }
    }
  }, [objectUrl])

  const onSubmit = (data: ApproveFormData) => {
    setIsSubmitting(true)
    try {
      // Revoke previous object URL if present, then create a new one and keep it in component state
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl) } catch {}
        setObjectUrl(null)
      }

      const signedPdfUrl = URL.createObjectURL(data.pdfFile)
      setObjectUrl(signedPdfUrl)

      const fileMeta = [{ id: crypto.randomUUID(), name: data.pdfFile.name, fileType: 'pdf' as ProofFile['fileType'], uploadedAt: new Date().toISOString() }]
      onConfirm(fileMeta)
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
        // revoke any created object URL when dialog closes
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl) } catch {}
          setObjectUrl(null)
        }
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800"><span className="font-medium">Note:</span> Ensure the PDF contains the physical signature of the approving authority and all required approval marks as per Appendix 60 standards.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { onOpenChange(false); setFileSelected(null); form.reset() }} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !fileSelected} className="bg-emerald-600 hover:bg-emerald-700">{isSubmitting ? 'Approving...' : 'APPROVE'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ManageToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: {
  search: string
  setSearch: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search DA#, PR#, office, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="purchase_entry">Purchase Entry</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="for_disbursement">For Disbursement</SelectItem>
          <SelectItem value="returned">Returned</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default function ManageDirectAcquisitionPage() {
  const { entries, updateEntry, removeEntry } = useDirectAcquisitionStore()
  const { toast } = useToast()
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewing, setViewing] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [returnRemarks, setReturnRemarks] = useState('')
  const [approvalTargetId, setApprovalTargetId] = useState<string | null>(null)

  const display = entries.filter((e: DirectAcquisitionEntry) => {
    if (e.status === 'draft') return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.prNumber.toLowerCase().includes(q) ||
      e.office.toLowerCase().includes(q) ||
      (e.supplier || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(display.length / pageSize))
  const paged = display.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => { setPage(1); setSelectedIds([]) }, [search, statusFilter])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [page, totalPages])

  const statusCounts = {
    purchaseEntry: entries.filter((e: DirectAcquisitionEntry) => e.status === 'purchase_entry').length,
    approved: entries.filter((e: DirectAcquisitionEntry) => e.status === 'approved').length,
    forDisbursement: entries.filter((e: DirectAcquisitionEntry) => e.status === 'for_disbursement').length,
    returned: entries.filter((e: DirectAcquisitionEntry) => e.status === 'returned').length,
  }

  const openView = (id: string) => setViewing(id)
  const openReturn = (id: string) => { setActiveId(id); setReturnDialogOpen(true) }
  const openApprove = (id: string) => { setApprovalTargetId(id); setApprovalDialogOpen(true) }

  const handleMarkForDisbursement = (id: string) => {
    updateEntry(id, { status: 'for_disbursement' })
    toast({ title: 'Updated', description: 'Entry marked for disbursement/payment approval.' })
  }

  const handleReturnConfirm = () => {
    if (!activeId) return
    updateEntry(activeId, { status: 'returned', remarks: returnRemarks })
    setReturnRemarks('')
    setReturnDialogOpen(false)
    setActiveId(null)
    toast({ title: 'Returned', description: 'Entry returned with remarks.' })
  }

  const handleApproveConfirm = (files: { id: string; name: string; fileType?: ProofFile['fileType']; uploadedAt: string }[]) => {
    if (!approvalTargetId) return
    // Save uploaded proof files metadata and mark as approved
    updateEntry(approvalTargetId, { status: 'approved', proofFiles: files })
    setApprovalTargetId(null)
    toast({ title: 'Approved', description: 'Entry approved and signed documents uploaded.' })
  }

  const handleRemove = (id: string) => {
    removeEntry(id)
    setSelectedIds((s) => s.filter((x) => x !== id))
    toast({ title: 'Removed', description: 'Entry has been removed.' })
  }

  const activeEntry = entries.find((e: DirectAcquisitionEntry) => e.id === viewing) || null
  if (viewing && activeEntry) {
    return <DirectAcquisitionDetailsPage entry={activeEntry} onBack={() => setViewing(null)} />
  }

  const visibleSelectedCount = selectedIds.filter(id => display.some(d => d.id === id)).length
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
                <CardTitle className="text-3xl">Manage Direct Acquisition</CardTitle>
                <CardDescription className="text-base">Manage recorded Direct Acquisition / Direct Purchase requests (RA 12009)</CardDescription>
              </div>
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Direct Acquisition
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Acquisition Entries</CardTitle>
            <CardDescription>Overview of direct purchase records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Entries</p>
                    <p className="text-3xl font-bold text-blue-900">{entries.filter((e: DirectAcquisitionEntry) => e.status !== 'draft').length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-700" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Approved</p>
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
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">For Disbursement</p>
                    <p className="text-3xl font-bold text-amber-900">{statusCounts.forDisbursement}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-amber-700" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Returned</p>
                    <p className="text-3xl font-bold text-red-900">{statusCounts.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <CornerDownLeft className="h-6 w-6 text-red-700" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <ManageToolbar
              search={search}
              setSearch={(s) => { setSearch(s); setPage(1) }}
              statusFilter={statusFilter}
              setStatusFilter={(s) => { setStatusFilter(s); setPage(1) }}
            />

            {/* Table */}
            {display.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-semibold">No entries found</h3>
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
                      <TableHead>DA Number</TableHead>
                      <TableHead>PR Number</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Total ABC</TableHead>
                      <TableHead>Final Amount</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((r: DirectAcquisitionEntry) => {
                      const cfg = STATUS_CONFIG[r.status] || { label: r.status, className: '' }
                      return (
                        <TableRow key={r.id} className="hover:bg-muted/40">
                          <TableCell onClick={(e) => e.stopPropagation()} className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(r.id)}
                              onChange={(e) => toggleRowSelect(r.id, e.target.checked)}
                              className="h-4 w-4"
                              aria-label={`Select ${r.daNumber}`}
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-primary">{r.daNumber}</TableCell>
                          <TableCell>{r.prNumber}</TableCell>
                          <TableCell className="text-sm">{r.office}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.category}</TableCell>
                          <TableCell className="font-medium">₱{r.totalABC.toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.finalAmount ? `₱${r.finalAmount.toLocaleString()}` : '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.supplier || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.transactionDate ? new Date(r.transactionDate).toLocaleDateString() : '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-xs font-semibold', cfg.className)}>{cfg.label}</Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openView(r.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                {r.status === 'purchase_entry' && (
                                  <>
                                    <DropdownMenuItem onClick={() => openApprove(r.id)}>
                                      <Upload className="h-4 w-4 mr-2 text-emerald-600" /> Approve (upload signed)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openReturn(r.id)}>
                                      <CornerDownLeft className="h-4 w-4 mr-2 text-red-600" /> Return
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {r.status === 'approved' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkForDisbursement(r.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2 text-amber-600" /> Mark For Disbursement
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openReturn(r.id)}>
                                      <CornerDownLeft className="h-4 w-4 mr-2 text-red-600" /> Return
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setConfirmDeleteId(r.id)}
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
              <p className="text-sm text-muted-foreground">{visibleSelectedCount} of {display.length} selected</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReturnDialog
        open={returnDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setReturnDialogOpen(false); setActiveId(null); setReturnRemarks('') }
          else setReturnDialogOpen(true)
        }}
        remarks={returnRemarks}
        onRemarksChange={setReturnRemarks}
        onConfirm={handleReturnConfirm}
      />

      <UploadApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={(open) => setApprovalDialogOpen(open)}
        onConfirm={handleApproveConfirm}
      />

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Direct Acquisition Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (confirmDeleteId) { handleRemove(confirmDeleteId); setConfirmDeleteId(null) } }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
