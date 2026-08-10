import { useState, useRef, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  CheckCircle, AlertTriangle, Receipt, CreditCard,
  ArrowRight, ChevronLeft, ChevronRight, ShoppingCart,
  FileCheck, Upload, ClipboardList, X, ArrowLeft,
  FileText, FileImage, File, Trash2, ListChecks, Plus, UserCheck, Search, ChevronDown,
} from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import { useToast } from '@/components/ui/use-toast'
import { useDirectAcquisitionStore, type DirectAcquisition, type ProofFile } from '../store/directAcquisitionStore'
import { useConsolidatedPRStore, type ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { formatCurrencyPHP } from '@/utils/formatters'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { SUPPLIER_OPTIONS, type SupplierOption } from '../config/supplierOptions'
import { EMPLOYEE_OPTIONS } from '../config/employeeOptions'

function groupItemsByPr(items: ConsolidatedPRItem[]) {
  return items.reduce<Record<string, ConsolidatedPRItem[]>>((groups, item) => {
    if (!groups[item.prId]) groups[item.prId] = []
    groups[item.prId].push(item)
    return groups
  }, {})
}

function formatMonthLabel(monthValue: string) {
  const [, month] = monthValue.split('-')
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const idx = Number(month) - 1
  return (idx >= 0 && idx < 12) ? monthNames[idx] : monthValue
}

function formatStatusLabel(status: string) {
  return status.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ')
}

const THRESHOLD = 200000

/**
 * In-dialog-only type that carries a transient blob preview URL.
 * This URL is produced by URL.createObjectURL() and is intentionally
 * NOT persisted to the Zustand store — it becomes a dead link after a page
 * refresh. Only the metadata (id, name, fileType, uploadedAt) is saved.
 *
 * TODO: Once a file-upload backend endpoint exists, replace blobUrl with
 *       the durable server URL returned from the upload response.
 */
type DialogProofFile = ProofFile & { blobUrl?: string; _size?: number }

/** Internal dialog sub-steps for recording a purchase */
const RECORD_STEPS = [
  { id: 1, label: 'Purchase Entry', icon: ClipboardList },
  { id: 2, label: 'Upload Proof', icon: Upload },
  { id: 3, label: 'Review & Submit', icon: FileCheck },
]

/** Top-level DA pipeline phases */
const DA_PIPELINE = [
  { id: 1, key: 'draft', label: 'Create Direct Acquisition', description: 'DA record created and linked to approved Consolidated PR', icon: ShoppingCart },
  { id: 2, key: 'purchase_entry', label: 'Purchase Entry', description: 'Record purchase details & proof of transaction', icon: Receipt },
  { id: 3, key: 'for_disbursement', label: 'Payment / Disbursement Approval', description: 'Routes to Budget / Accounting / HoPE — no BAC routing', icon: CreditCard },
] as const

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  approved: { label: 'APPROVED', className: 'bg-green-50 text-green-800 border-green-300' },
  purchase_entry: { label: 'PURCHASE ENTRY', className: 'bg-blue-50 text-blue-800 border-blue-300' },
  for_disbursement: { label: 'FOR DISBURSEMENT', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  returned: { label: 'RETURNED', className: 'bg-red-50 text-red-800 border-red-300' },
}

interface Props {
  entry: DirectAcquisition
  onBack: () => void
  readOnly?: boolean
}

export function DirectAcquisitionDetailsPage({ entry, onBack, readOnly = false }: Props) {
  const { toast } = useToast()
  const [exportOpen, setExportOpen] = useState(false)
  const { updateEntry } = useDirectAcquisitionStore()
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)

  const linkedConsolidatedPr = useMemo(() => {
    if (!entry.consolidatedPrId && !entry.prNumber) return null
    return consolidatedPRs.find((pr) =>
      pr.id === entry.consolidatedPrId ||
      pr.prNumber === entry.consolidatedPrId ||
      pr.id === entry.prNumber ||
      pr.prNumber === entry.prNumber
    ) ?? null
  }, [consolidatedPRs, entry.consolidatedPrId, entry.prNumber])

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [supplier, setSupplier] = useState(entry.supplier || '')
  const [supplierOther, setSupplierOther] = useState('')
  const [supplierTin, setSupplierTin] = useState(entry.supplierTin || '')
  const [finalAmount, setFinalAmount] = useState<number | ''>(entry.finalAmount || '')
  const [transactionDate, setTransactionDate] = useState(entry.transactionDate || '')
  const [remarks, setRemarks] = useState(entry.remarks || '')
  const [movFiles, setMovFiles] = useState<DialogProofFile[]>(
    // Restore existing metadata-only records on dialog open (no blobUrl)
    (entry.proofFiles ?? []).map((f) => ({ ...f })),
  )
  const [dragOver, setDragOver] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Quick-register state for adding a new retail/online store
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [quickRegName, setQuickRegName] = useState('')
  const [quickRegTin, setQuickRegTin] = useState('')
  const [customSuppliers, setCustomSuppliers] = useState<SupplierOption[]>([])
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [supplierSearch, setSupplierSearch] = useState('')

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'direct_vendor' | 'employee_reimbursement'>(
    entry.paymentMethod || 'direct_vendor'
  )
  const [payeeName, setPayeeName] = useState(entry.payeeName || '')

  const handleQuickRegisterSave = () => {
    if (!quickRegName.trim()) return
    const newSupplier: SupplierOption = {
      id: `custom-${crypto.randomUUID()}`,
      name: quickRegName.trim(),
      tin: quickRegTin.trim() || undefined,
    }
    setCustomSuppliers((s) => [...s, newSupplier])
    setSupplier(newSupplier.name)
    setSupplierTin(newSupplier.tin || '')
    setSupplierOther('')
    setShowQuickRegister(false)
    setQuickRegName('')
    setQuickRegTin('')
    setSupplierDropdownOpen(false)
  }

  const allSupplierOptions: SupplierOption[] = [...SUPPLIER_OPTIONS, ...customSuppliers]

  const addFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const fileType: DialogProofFile['fileType'] = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
        ? 'image'
        : ext === 'pdf'
          ? 'pdf'
          : 'document'
      // blobUrl is kept in local state ONLY for in-session preview.
      // It is intentionally stripped before saving to the store.
      const blobUrl = URL.createObjectURL(file)
      setMovFiles((s) => [
        ...s,
        { id: crypto.randomUUID(), name: file.name, blobUrl, fileType, uploadedAt: new Date().toISOString(), _size: file.size },
      ])
    })
    if (uploadInputRef.current) uploadInputRef.current.value = ''
  }

  const eligible = entry.totalABC <= THRESHOLD
  // Only allow opening the Record Purchase flow when the DA is still in 'draft'.
  // If status is already 'purchase_entry' the purchase has been recorded and
  // the button must not be shown.
  const canRecord = eligible && entry.status === 'draft'

  /** Purchase amount must be <= legislative direct acquisition threshold (₱200,000) */
  const amountExceedsABC = Number(finalAmount) > THRESHOLD

  // Removed unused handleAddMOV / handleRemoveMOV helpers — file add/remove are handled inline now.

  const resolvedSupplier = supplier === '__other__' ? supplierOther : supplier
  const step1Valid = resolvedSupplier.trim() !== '' && Number(finalAmount) > 0 && !amountExceedsABC && transactionDate !== ''
    && (paymentMethod === 'direct_vendor' || payeeName.trim() !== '')
  const step2Valid = movFiles.length > 0

  const handleOpenRecord = () => {
    setStep(1)
    setSupplier(entry.supplier || '')
    setSupplierOther('')
    setSupplierTin(entry.supplierTin || '')
    setFinalAmount(entry.finalAmount || '')
    setTransactionDate(entry.transactionDate || '')
    setRemarks(entry.remarks || '')
    setPaymentMethod(entry.paymentMethod || 'direct_vendor')
    setPayeeName(entry.payeeName || '')
    setShowQuickRegister(false)
    setQuickRegName('')
    setQuickRegTin('')
    // Restore metadata-only records — no blobUrl since we never stored them
    setMovFiles((entry.proofFiles ?? []).map((f) => ({ ...f })))
    setOpen(true)
  }

  const handleNext = () => {
    if (step === 1 && !step1Valid) {
      if (!resolvedSupplier.trim()) return toast({ title: 'Required', description: 'Supplier name is required.' })
      if (!finalAmount || Number(finalAmount) <= 0) return toast({ title: 'Required', description: 'Enter a valid transaction amount.' })
      if (amountExceedsABC) return toast({ title: 'Amount Exceeds Threshold', description: `Actual purchase amount must not exceed the legislative threshold of ₱${THRESHOLD.toLocaleString()}.` })
      if (!transactionDate) return toast({ title: 'Required', description: 'Transaction date is required.' })
      return
    }
    if (step === 2 && !step2Valid) {
      return toast({ title: 'Required', description: 'Upload at least one proof of transaction document.' })
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const handleSubmit = () => {
    // Record the purchase entry but do NOT jump directly to disbursement.
    // This preserves the intermediate 'purchase_entry' status so other parts
    // of the app that expect that phase will behave correctly. Transition
    // to 'for_disbursement' should happen via the explicit approval flow.

    // Validate step 1 fields
    if (!step1Valid) {
      setStep(1)
      if (!resolvedSupplier.trim()) return toast({ title: 'Required', description: 'Supplier name is required.' })
      if (!finalAmount || Number(finalAmount) <= 0) return toast({ title: 'Required', description: 'Enter a valid transaction amount.' })
      if (amountExceedsABC) return toast({ title: 'Amount Exceeds Threshold', description: `Actual purchase amount must not exceed the legislative threshold of ₱${THRESHOLD.toLocaleString()}.` })
      if (!transactionDate) return toast({ title: 'Required', description: 'Transaction date is required.' })
      return
    }

    // Validate step 2 (files)
    if (!step2Valid) {
      setStep(2)
      return toast({ title: 'Required', description: 'Upload at least one proof of transaction document.' })
    }

    // Persist as 'purchase_entry' (intermediate recorded state).
    // Strip transient blobUrl and _size before saving — only metadata is durable.
    // Revoke blob URLs to free memory.
    const storeProofFiles: ProofFile[] = movFiles.map((f) => {
      if (f.blobUrl) URL.revokeObjectURL(f.blobUrl)
      return {
        id: f.id,
        name: f.name,
        fileType: f.fileType,
        uploadedAt: f.uploadedAt,
      }
    })

    updateEntry(entry.id, {
      status: 'purchase_entry',
      supplier: resolvedSupplier,
      supplierTin: supplierTin || undefined,
      finalAmount: Number(finalAmount),
      transactionDate,
      remarks,
      paymentMethod,
      payeeName: paymentMethod === 'employee_reimbursement' ? payeeName : undefined,
      proofFiles: storeProofFiles,
    })
    setOpen(false)
    toast({
      title: '✅ Purchase Entry Recorded',
      description: 'Direct purchase details saved. Routing to For Disbursement will occur through the approval process.',
    })
  }
  const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft

  /** Map status to pipeline phase index (1-based).
   *  Treat 'returned' explicitly by mapping it back to the Purchase Entry phase (2)
   *  and map 'approved' to the Disbursement phase (3).
   */
  const activePipelineStep =
    entry.status === 'draft' ? 1 :
    entry.status === 'purchase_entry' ? 2 :
    entry.status === 'returned' ? 2 :
    entry.status === 'approved' ? 3 :
    entry.status === 'for_disbursement' ? 3 :
    3

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-1">
          <ArrowLeft className="h-4 w-4" /> Back to Requests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{entry.daNumber}</CardTitle>
                <Badge variant="outline" className={cn('text-xs font-semibold px-2.5 py-1', statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {entry.prNumber}
              </CardDescription>
            </div>

            {/* Action buttons: Record Purchase & Export (swapped) */}
            {!readOnly && (
              <div className="flex items-center gap-2">
                {canRecord && (
                  <Button size="sm" onClick={handleOpenRecord} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                    <Receipt className="h-4 w-4" /> Record Purchase
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2">
                  <FileText className="h-4 w-4" /> Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* PR Details */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Request Details</CardTitle>
          <CardDescription>Approved PR tagged for Direct Acquisition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">DA Number</div>
              <div className="text-lg font-bold text-blue-900">{entry.daNumber}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Consolidated PR Number</div>
              <div className="text-lg font-bold text-blue-900">{entry.consolidatedPrId || entry.prNumber || '—'}</div>
            </div>
            {entry.bacResolutionNumber && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">BAC Resolution Number</div>
                <div className="text-lg font-bold text-blue-900">{entry.bacResolutionNumber}</div>
              </div>
            )}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Requesting Office</div>
              <div className="text-lg font-bold text-purple-900">{entry.office}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
              <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1">Procurement Category</div>
              <div className="text-lg font-bold text-cyan-900">{entry.category}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Total ABC</div>
              <div className="text-lg font-bold text-amber-900">₱{entry.totalABC.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Mode of Procurement</div>
              <div className="text-lg font-bold text-green-900">{entry.modeOfProcurement}</div>
            </div>
          </div>

          {eligible ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm font-medium">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Eligible for Direct Acquisition — ABC is within the ₱200,000 threshold.
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">ABC exceeds ₱200,000 threshold.</span>{' '}
                Direct Acquisition is not applicable. Please amend the APP/PR or select another mode of procurement.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Pipeline</CardTitle>
          <CardDescription>
            Simplified 3-step Direct Acquisition workflow — RFQ, Abstract of Quotations, BAC Resolution, and Exclusivity modules are bypassed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 3-step tracker */}
          <div className="flex items-center w-full gap-0">
            {DA_PIPELINE.map((phase, i) => {
              const Icon = phase.icon
              const isCompleted = activePipelineStep > phase.id
              const isActive = activePipelineStep === phase.id
              return (
                <div key={phase.id} className="flex items-center flex-1 last:flex-none">
                  <div className={cn(
                    'flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all flex-1',
                    isActive
                      ? phase.id === 3
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-primary/10 border-primary'
                      : isCompleted
                        ? 'bg-green-50 border-green-400'
                        : 'bg-muted/30 border-muted'
                  )}>
                    <div className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                      isActive
                        ? phase.id === 3 ? 'bg-amber-500 text-white' : 'bg-primary text-white'
                        : isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{phase.id}. {phase.label}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{phase.description}</div>
                    </div>
                    {isActive && (
                      <Badge className={cn('ml-auto shrink-0 text-xs', phase.id === 3 ? 'bg-amber-500 text-white' : 'bg-primary text-white')}>
                        Active
                      </Badge>
                    )}
                  </div>
                  {i < DA_PIPELINE.length - 1 && (
                    <div className="flex items-center px-2 shrink-0">
                      <div className="w-6 border-t-2 border-dashed border-muted-foreground/30" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 mx-0.5 shrink-0" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Entry Summary (if recorded) */}
      {entry.status !== 'draft' && entry.supplier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Purchase Entry Details
            </CardTitle>
            <CardDescription>Recorded direct purchase information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key value rows */}
            <div className="rounded-lg border bg-muted/20 divide-y text-sm">
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Retail Supplier / Store</span>
                <div>
                  <span className="font-semibold">{entry.supplier}</span>
                  {entry.supplierTin && (
                    <span className="ml-2 text-xs text-muted-foreground">TIN: {entry.supplierTin}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Final Transaction Amount</span>
                <span className="font-semibold text-green-700">₱{entry.finalAmount?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Transaction Date</span>
                <span className="font-semibold">
                  {entry.transactionDate
                    ? new Date(entry.transactionDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Payment Method</span>
                <span className={cn('font-semibold', entry.paymentMethod === 'employee_reimbursement' ? 'text-amber-700' : '')}>
                  {entry.paymentMethod === 'employee_reimbursement' ? 'Employee Reimbursement' : 'Direct to Vendor'}
                </span>
              </div>
              {entry.payeeName && (
                <div className="grid grid-cols-2 px-4 py-3 gap-2">
                  <span className="text-muted-foreground font-medium">Payee (DV Recipient)</span>
                  <span className="font-semibold flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                    {entry.payeeName}
                  </span>
                </div>
              )}
              {entry.remarks && (
                <div className="grid grid-cols-2 px-4 py-3 gap-2">
                  <span className="text-muted-foreground font-medium">Remarks</span>
                  <span className="font-semibold">{entry.remarks}</span>
                </div>
              )}
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Proof of Transaction</span>
                <div className="flex flex-col gap-2">
                  {entry.proofFiles && entry.proofFiles.length > 0
                    ? entry.proofFiles.map((f) => {
                        const fileUrl = (f as any).url
                        const isPdf = f.fileType === 'pdf'
                        const isImage = f.fileType === 'image'
                        const Icon = isImage ? FileImage : isPdf ? FileText : File
                        const content = (
                          <>
                            <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', fileUrl ? 'bg-primary/10' : 'bg-green-50')}>
                              <Icon className={cn('h-3.5 w-3.5', fileUrl ? 'text-primary' : 'text-green-600')} />
                            </div>
                            <span className="flex-1 truncate text-xs font-medium">{f.name}</span>
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          </>
                        )
                        return fileUrl ? (
                          <a
                            key={f.id}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
                          >
                            {content}
                          </a>
                        ) : (
                          <div key={f.id} className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2">
                            {content}
                          </div>
                        )
                      })
                    : <span className="text-muted-foreground text-xs">No files uploaded.</span>}
                </div>
              </div>
            </div>

            {/* Reimbursement notice */}
            {entry.paymentMethod === 'employee_reimbursement' && entry.payeeName && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                <UserCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Reimbursement: </span>
                  Vendor <span className="font-semibold">{entry.supplier}</span> is linked for audit. Disbursement Voucher will be issued to <span className="font-semibold">{entry.payeeName}</span>.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Consolidated PR Items ─── */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Consolidated PR Items
          </CardTitle>
          <CardDescription>
            Items from the linked Consolidated PR ({entry.consolidatedPrId || entry.prNumber || '—'})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!linkedConsolidatedPr ? (
            <p className="text-sm text-muted-foreground">
              No Consolidated PR data found for <span className="font-mono">{entry.consolidatedPrId || entry.prNumber}</span>.
            </p>
          ) : linkedConsolidatedPr.selectedPRItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items are attached to this Consolidated PR.</p>
          ) : (
            <>
              <Tabs defaultValue="by-office" className="w-full">
                <TabsList className="grid grid-cols-2 gap-2 bg-muted/50 p-2 mb-4">
                  <TabsTrigger value="by-office" className="flex items-center gap-2">📋 By Office</TabsTrigger>
                  <TabsTrigger value="summary" className="flex items-center gap-2">📊 Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="by-office" className="space-y-4">
                  {Object.entries(
                    linkedConsolidatedPr.selectedPRItems.reduce<Record<string, ConsolidatedPRItem[]>>((g, it) => {
                      const k = it.prOffice || '—'
                      if (!g[k]) g[k] = []
                      g[k].push(it)
                      return g
                    }, {})
                  ).map(([office, items], index) => {
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                    const sourceTotal = items.reduce((sum, item) => sum + item.totalAmount, 0)
                    const prs = Array.from(new Set(items.map(i => i.prNumber).filter(Boolean)))

                    const uniqueMonths = Array.from(new Set(items.map(i => i.month).filter(Boolean)))
                    const monthLabel = uniqueMonths.length === 0 ? '—' : uniqueMonths.length === 1 ? formatMonthLabel(uniqueMonths[0]) : 'Multiple'
                    const uniqueFunds = Array.from(new Set(items.map(i => i.fund).filter(Boolean)))
                    const fundLabel = uniqueFunds.length === 0 ? '—' : uniqueFunds.length === 1 ? uniqueFunds[0] : 'Multiple'
                    const uniquePrTypes = Array.from(new Set(items.map(i => i.prType).filter(Boolean)))
                    const prTypeLabel = uniquePrTypes.length === 0
                      ? '—'
                      : uniquePrTypes.length === 1
                      ? (uniquePrTypes[0] === 'out-of-stock' ? 'Out of Stock' : 'Non-CSE')
                      : 'Multiple'

                    return (
                      <div key={office}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <>
                              <div className="space-y-1">
                                <p className="font-medium">{office}</p>
                                <p className="text-sm text-muted-foreground">{prs.length > 0 ? `${prs.join(', ')} · ` : ''}{items.length} item(s)</p>
                                <p className="text-xs text-muted-foreground">Month: {monthLabel} · Fund: {fundLabel}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline">{prTypeLabel}</Badge>
                                <Badge variant="outline">{formatCurrencyPHP(sourceTotal)}</Badge>
                              </div>
                            </>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-default-200">
                          <Table>
                            <TableHeader className="bg-default-50">
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Fund</TableHead>
                                {monthNames.map((m) => (
                                  <TableHead key={m} className="text-center">{m}</TableHead>
                                ))}
                                <TableHead className="text-center">Total Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead className="text-left">Total Amount</TableHead>
                                <TableHead>Mode of Procurement</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => {
                                const itemMop = linkedConsolidatedPr.itemMOPs?.[item.id]
                                const itemMonth = formatMonthLabel(item.month)
                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.fund}</TableCell>
                                    {monthNames.map((m) => (
                                      <TableCell key={m} className="text-center">
                                        {itemMonth === m ? `${item.qty} ${item.unit}` : `0 ${item.unit}`}
                                      </TableCell>
                                    ))}
                                    <TableCell className="text-center font-semibold">
                                      <Badge variant="outline">{item.qty} {item.unit}</Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                                    <TableCell className="text-left">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                                    <TableCell>
                                      {itemMop?.mop ? formatStatusLabel(itemMop.mop) : '—'}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>
              <TabsContent value="summary" className="space-y-4">
                {(() => {
                    const officeGroups = linkedConsolidatedPr.selectedPRItems.reduce<Record<string, ConsolidatedPRItem[]>>((g, it) => {
                      const k = it.prOffice || '—'
                      if (!g[k]) g[k] = []
                      g[k].push(it)
                      return g
                    }, {})

                    const officeSummaries = Object.entries(officeGroups).map(([office, items]) => {
                      const distinctItems = new Set(items.map((i) => i.id)).size
                      const totalQtyByUnit = items.reduce<Record<string, number>>((acc, i) => {
                        const unit = i.unit || 'unit'
                        acc[unit] = (acc[unit] || 0) + i.qty
                        return acc
                      }, {})

                      const totalQtyLabel = Object.entries(totalQtyByUnit)
                        .map(([unit, qty]) => `${qty} ${unit}`)
                        .join(', ')

                      const totalAmount = items.reduce((s, i) => s + i.totalAmount, 0)
                      const totalDeficit = items.reduce((s, i) => s + (i.deficit ?? 0), 0)
                      return { office, distinctItems, totalQty: totalQtyLabel, qtyByUnit: totalQtyByUnit, totalAmount, totalDeficit }
                    })

                    // Grand totals: sum amounts/deficits/distinctItems and aggregate qtys by unit.
                    const grandQtyByUnit = officeSummaries.reduce<Record<string, number>>((acc, s) => {
                      Object.entries(s.qtyByUnit || {}).forEach(([unit, qty]) => {
                        acc[unit] = (acc[unit] || 0) + qty
                      })
                      return acc
                    }, {})

                    const grand = officeSummaries.reduce((acc, s) => ({
                      distinctItems: acc.distinctItems + s.distinctItems,
                      totalQty: acc.totalQty, // placeholder, computed below as a label
                      totalAmount: acc.totalAmount + s.totalAmount,
                      totalDeficit: acc.totalDeficit + s.totalDeficit,
                    }), { distinctItems: 0, totalQty: '' as any, totalAmount: 0, totalDeficit: 0 })

                    // Replace numeric totalQty with a human-friendly label that groups by unit.
                    grand.totalQty = Object.entries(grandQtyByUnit)
                      .map(([unit, qty]) => `${qty} ${unit}`)
                      .join(', ') || '0'

                    return (
                      <div>
                        {/* Small summary cards (colored, aligned to match table headers) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="rounded-lg p-3 shadow-sm bg-amber-50 border border-amber-100">
                            <div className="text-xs text-amber-700">Offices</div>
                            <div className="text-lg font-semibold text-amber-900">{officeSummaries.length}</div>
                          </div>
                          <div className="rounded-lg p-3 shadow-sm bg-sky-50 border border-sky-100 text-center">
                            <div className="text-xs text-sky-700">Distinct Item Types</div>
                            <div className="text-lg font-semibold text-sky-900">{grand.distinctItems}</div>
                          </div>
                          <div className="rounded-lg p-3 shadow-sm bg-violet-50 border border-violet-100 text-center">
                            <div className="text-xs text-violet-700">Total Quantity</div>
                            <div className="text-lg font-semibold text-violet-900">{grand.totalQty}</div>
                          </div>
                          <div className="rounded-lg p-3 shadow-sm bg-emerald-50 border border-emerald-100 text-right">
                            <div className="text-xs text-emerald-700">Total Amount</div>
                            <div className="text-lg font-semibold text-emerald-900">{formatCurrencyPHP(grand.totalAmount)}</div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">Summary by requesting office</div>

                        <div className="overflow-x-auto rounded-lg border border-default-200">
                          <Table>
                            <TableHeader className="bg-default-50 sticky top-0">
                              <TableRow>
                                <TableHead className="text-left">Office</TableHead>
                                <TableHead className="text-left">Distinct Items</TableHead>
                                <TableHead className="text-left">Total Qty</TableHead>
                                <TableHead className="text-left">Total Amount</TableHead>
                                <TableHead className="text-center">Deficit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {officeSummaries.map((s) => (
                                <TableRow key={s.office} className="hover:bg-muted/5">
                                  <TableCell className="font-medium">{s.office}</TableCell>
                                  <TableCell className="text-left">{s.distinctItems}</TableCell>
                                  <TableCell className="text-left">{s.totalQty}</TableCell>
                                  <TableCell className="text-left font-semibold text-foreground">{formatCurrencyPHP(s.totalAmount)}</TableCell>
                                  <TableCell className="text-center">
                                    {s.totalDeficit > 0 ? (
                                      <Badge className="bg-red-50 text-red-700">{s.totalDeficit}</Badge>
                                    ) : (
                                      <Badge className="bg-green-50 text-green-700">OK</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}

                              <TableRow className="bg-default-50">
                                <TableCell className="font-semibold">Total</TableCell>
                                <TableCell className="text-left font-semibold">{grand.distinctItems}</TableCell>
                                <TableCell className="text-left font-semibold">{grand.totalQty}</TableCell>
                                <TableCell className="text-left font-semibold">{formatCurrencyPHP(grand.totalAmount)}</TableCell>
                                <TableCell className="text-center font-semibold">{grand.totalDeficit || '—'}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── 3-Step Record Dialog ─── */}
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Record Direct Purchase"
        description={`${entry.daNumber} · ${entry.prNumber} · ${entry.office}`}
        size="lg"
        className="w-full"
        footer={null}
        showCloseButton
        fitContent
      >
        <div className="flex flex-col" style={{ height: '620px' }}>
          {/* Step Indicator */}
          <div className="px-6 pt-2 pb-0 shrink-0">
            <div className="flex items-center">
              {RECORD_STEPS.map((s, i) => {
                const Icon = s.icon
                const isCompleted = step > s.id
                const isActive = step === s.id
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all',
                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                        isActive ? 'bg-primary border-primary text-white' :
                        'bg-muted border-muted-foreground/20 text-muted-foreground'
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={cn(
                        'text-xs font-medium text-center leading-tight',
                        isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      )}>{s.label}</span>
                    </div>
                    {i < RECORD_STEPS.length - 1 && (
                      <div className={cn('flex-1 h-0.5 mx-2 mb-4', step > s.id ? 'bg-green-400' : 'bg-muted-foreground/20')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t mx-6 mt-3 shrink-0" />

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                  Enter the reputable source name (retail store, department store, or e-commerce platform) and the actual transaction amount.
                </div>

                {/* Supplier Selection */}
                <div>
                  <label className="text-sm font-semibold">Retail Supplier / Store <span className="text-destructive">*</span></label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select an existing store or add a new one on the fly.</p>

                  {/* Trigger row: combobox trigger + Add New Store button */}
                  <div className="flex items-center gap-2">
                    {/* Custom searchable combobox trigger */}
                    <button
                      type="button"
                      onClick={() => { setSupplierDropdownOpen((v) => !v); setShowQuickRegister(false); setSupplierSearch('') }}
                      className={cn(
                        'flex-1 h-11 flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
                        'hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        !supplier && 'text-muted-foreground'
                      )}
                    >
                      <span className="truncate">
                        {supplier
                          ? supplierTin ? `${supplier} · TIN ${supplierTin}` : supplier
                          : '— Select Retail Supplier —'}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                    </button>

                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 h-11 gap-1.5 border-primary text-primary hover:bg-primary/5 font-semibold"
                      onClick={() => { setShowQuickRegister((v) => !v); setSupplierDropdownOpen(false) }}
                    >
                      <Plus className="h-4 w-4" /> Add New Store
                    </Button>
                  </div>

                  {/* Searchable dropdown panel */}
                  {supplierDropdownOpen && (
                    <div className="relative z-50">
                      <div className="absolute top-1 left-0 w-full rounded-lg border bg-popover shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '260px' }}>
                        <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
                          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                          <input
                            autoFocus
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Search store name or TIN..."
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {allSupplierOptions
                            .filter((s) => {
                              const q = supplierSearch.toLowerCase()
                              return s.name.toLowerCase().includes(q) || (s.tin ?? '').toLowerCase().includes(q)
                            })
                            .map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSupplier(s.name)
                                  setSupplierTin(s.tin || '')
                                  setSupplierDropdownOpen(false)
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted/60 transition-colors',
                                  supplier === s.name && 'bg-primary/5 text-primary'
                                )}
                              >
                                <span className="font-medium">{s.name}</span>
                                {s.tin && (
                                  <span className={cn('text-xs', supplier === s.name ? 'text-primary/70' : 'text-muted-foreground')}>
                                    TIN: {s.tin}
                                  </span>
                                )}
                              </button>
                            ))}
                          {allSupplierOptions.filter((s) => {
                            const q = supplierSearch.toLowerCase()
                            return s.name.toLowerCase().includes(q) || (s.tin ?? '').toLowerCase().includes(q)
                          }).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6">No stores found. Use "+ Add New Store".</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Registration Panel */}
                  {showQuickRegister && (
                    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-primary">Quick Register: New Retail / Online Store</p>
                        <button
                          type="button"
                          onClick={() => { setShowQuickRegister(false); setQuickRegName(''); setQuickRegTin('') }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Store / Company Name <span className="text-destructive">*</span></label>
                        <Input
                          placeholder="e.g. Shopee Philippines Inc."
                          value={quickRegName}
                          onChange={(e: any) => setQuickRegName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold">TIN <span className="text-xs font-normal text-muted-foreground">(from receipt)</span></label>
                        <Input
                          placeholder="e.g. 000-234-567-000"
                          value={quickRegTin}
                          onChange={(e: any) => setQuickRegTin(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm"
                          onClick={() => { setShowQuickRegister(false); setQuickRegName(''); setQuickRegTin('') }}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" disabled={!quickRegName.trim()} onClick={handleQuickRegisterSave}>
                          Save & Select
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Transaction Amount */}
                <div>
                  <label className="text-sm font-semibold">
                    Final Transaction Amount <span className="text-destructive">*</span>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(must not exceed ₱200,000)</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
                    <Input
                      type="number" placeholder="0.00"
                      value={finalAmount === '' ? '' : String(finalAmount)}
                      onChange={(e: any) => setFinalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className={cn('pl-7', amountExceedsABC ? 'border-destructive' : '')}
                    />
                  </div>
                  {amountExceedsABC && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Exceeds the legislative Direct Acquisition threshold of ₱200,000.</p>
                  )}
                </div>

                {/* Transaction Date */}
                <div>
                  <label className="text-sm font-semibold">Transaction Date <span className="text-destructive">*</span></label>
                  <Input type="date" value={transactionDate} onChange={(e: any) => setTransactionDate(e.target.value)} className="mt-1.5" />
                </div>

                {/* Payment Method Toggle */}
                <div>
                  <label className="text-sm font-semibold">Payment Method <span className="text-destructive">*</span></label>
                  <p className="text-xs text-muted-foreground mb-2">How was this purchase paid?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'direct_vendor', label: 'Direct to Vendor', description: 'Agency pays supplier directly' },
                      { value: 'employee_reimbursement', label: 'Employee Reimbursement', description: 'Employee fronted the payment' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setPaymentMethod(opt.value); setPayeeName('') }}
                        className={cn(
                          'rounded-lg border-2 px-4 py-3 text-left transition-all',
                          paymentMethod === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/40'
                        )}
                      >
                        <p className={cn('text-sm font-semibold', paymentMethod === opt.value ? 'text-primary' : '')}>{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Payee — only for Employee Reimbursement */}
                {paymentMethod === 'employee_reimbursement' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <UserCheck className="h-4 w-4 shrink-0" />
                      <p className="text-sm font-semibold">Select Payee (Disbursement Voucher Recipient)</p>
                    </div>
                    <p className="text-xs text-amber-700">
                      The vendor is linked to the transaction for audit. The payee below will be named on the Disbursement Voucher.
                    </p>
                    <Select value={payeeName} onValueChange={setPayeeName}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Select employee / petty cash custodian..." />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] max-h-64">
                        {EMPLOYEE_OPTIONS.map((emp) => (
                          <SelectItem key={emp.id} value={emp.name}>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.position} · {emp.office}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {paymentMethod === 'employee_reimbursement' && !payeeName && (
                      <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Payee selection is required for reimbursement.</p>
                    )}
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="text-sm font-semibold">Remarks / Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
                  <Textarea placeholder="Additional context..." value={remarks} onChange={(e: any) => setRemarks(e.target.value)} className="mt-1.5" rows={3} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                  Upload proof of transaction. Accepted: <strong>Official Receipt</strong>, <strong>Charge Slip</strong>, <strong>E-commerce Order Confirmation</strong>, or <strong>Screenshot</strong>.
                </div>

                <div>
                  <label className="text-sm font-semibold">Proof of Transaction <span className="text-destructive">*</span></label>

                  {/* Drop Zone */}
                  <div
                    onClick={() => uploadInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                    className={cn(
                      'mt-2 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-10 px-6 text-center',
                      dragOver
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-muted-foreground/25 bg-muted/10 hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-full transition-all', dragOver ? 'bg-primary/20' : 'bg-primary/10')}>
                      <Upload className={cn('h-6 w-6 transition-all', dragOver ? 'text-primary scale-110' : 'text-primary')} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {dragOver ? 'Drop files here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC, XLSX — multiple files allowed</p>
                    </div>
                    <input
                      ref={uploadInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </div>

                  {/* File List */}
                  {movFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uploaded Files ({movFiles.length})</p>
                      {movFiles.map((f) => {
                        const isImage = f.fileType === 'image'
                        const isPdf = f.fileType === 'pdf'
                        const Icon = isImage ? FileImage : isPdf ? FileText : File
                        const sizeKB = f._size ? `${(f._size / 1024).toFixed(1)} KB` : null
                        return (
                          <div key={f.id} className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 shadow-sm">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{f.name}</p>
                              {sizeKB && <p className="text-xs text-muted-foreground">{sizeKB}</p>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {f.blobUrl && (
                                <a href={f.blobUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline px-2 py-1">
                                  Preview
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (f.blobUrl) URL.revokeObjectURL(f.blobUrl)
                                  setMovFiles((s) => s.filter((x) => x.id !== f.id))
                                }}
                                className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {movFiles.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">No files uploaded yet. At least one is required.</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Review the details below. Submitting will bypass the BAC Secretariat and route directly for Disbursement Voucher processing.
                </div>
                <div className="rounded-lg border bg-muted/30 divide-y text-sm">
                  {[
                    ['DA Number', entry.daNumber],
                    ['PR Number', entry.prNumber],
                    ['Requesting Office', entry.office],
                    ['Supplier / Source', resolvedSupplier],
                    ...(supplierTin ? [['Supplier TIN', supplierTin]] : []),
                    ['Transaction Amount', `₱${Number(finalAmount).toLocaleString()}`],
                    ['Transaction Date', transactionDate ? new Date(transactionDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
                    ['Payment Method', paymentMethod === 'employee_reimbursement' ? 'Employee Reimbursement' : 'Direct to Vendor'],
                    ...(paymentMethod === 'employee_reimbursement' && payeeName ? [['Payee (DV Recipient)', payeeName]] : []),
                    ['Remarks', remarks || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-2 px-4 py-3 gap-2">
                      <span className="text-muted-foreground font-medium">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">Proof Files</span>
                    <div className="flex flex-col gap-1">
                      {movFiles.map((f: any) => (
                        <span key={f.id} className="text-xs text-primary flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" /> {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 px-4 py-3 gap-2">
                    <span className="text-muted-foreground font-medium">Routing</span>
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> For Disbursement / Payment Approval
                    </span>
                  </div>
                </div>

                {paymentMethod === 'employee_reimbursement' && payeeName && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                    <UserCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Reimbursement Notice:</span> The vendor <span className="font-semibold">{resolvedSupplier}</span> will be linked for audit purposes. The Disbursement Voucher will be issued to <span className="font-semibold">{payeeName}</span>.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20 shrink-0">
            <Button onClick={() => step === 1 ? setOpen(false) : setStep((s) => s - 1)} className="gap-1 rounded-md px-4 py-2 bg-violet-100 text-violet-800 hover:bg-violet-200">
              {step === 1 ? <><X className="h-4 w-4" /> Cancel</> : <><ChevronLeft className="h-4 w-4" /> Back</>}
            </Button>
            <div className="flex items-center gap-2">
              {step < 3
                ? <Button onClick={handleNext} className="gap-1">Next <ChevronRight className="h-4 w-4" /></Button>
                : <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4" /> Submit for Payment Processing</Button>
              }
            </div>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Export Coming Soon dialog */}
      <ExportComingSoonDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        entityLabel="Direct Acquisition summary"
        description="Excel export for Direct Acquisition summaries is coming soon."
        whatsNext="Export will support XLSX with formatting and column selection."
      />
    </div>
  )
}
