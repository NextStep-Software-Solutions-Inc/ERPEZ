import { useState, useRef, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  CheckCircle, AlertTriangle, Receipt, CreditCard,
  ArrowRight, ChevronRight, ShoppingCart,
  FileCheck, Upload, ClipboardList, ArrowLeft, X,
  FileText, FileImage, File, Trash2, ListChecks, Plus, UserCheck, Search, Loader2,
  Layers, Building2, ShieldCheck, Eye, Download, MoreVertical, Edit3, Calendar, History, Info, Copy,
  Store, MessageSquare,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DocumentPreviewModal } from '@/features/planning/market-scoping/dialogs/DocumentPreviewModal'
import type { FileAttachment } from '@/features/planning/market-scoping/types/marketScopingTypes'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import { useToast } from '@/components/ui/use-toast'
import type { DirectAcquisition, ProofFile } from '../store/directAcquisitionStore'
import { useConsolidatedPRStore, type ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { useDirectAcquisition, useRecordDirectPurchase } from '../handlers'
import { useSuppliers } from '@/components/features/planning/procurement-library/suppliers/useSuppliers'
import { formatCurrencyPHP } from '@/utils/formatters'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { SUPPLIER_OPTIONS, type SupplierOption } from '../config/supplierOptions'
import { EMPLOYEE_OPTIONS } from '../config/employeeOptions'
import api from '@/services/api'

function formatMonthLabel(monthValue: string) {
  const [, month] = monthValue.split('-')
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const idx = Number(month) - 1
  return (idx >= 0 && idx < 12) ? monthNames[idx] : monthValue
}

const THRESHOLD = 200000

type DialogProofFile = ProofFile & {
  blobUrl?: string
  _size?: number
  _file?: globalThis.File
  fileId?: string
}

const RECORD_STEPS = [
  { id: 1, label: 'Purchase Entry', icon: ClipboardList },
  { id: 2, label: 'Upload Proof', icon: Upload },
  { id: 3, label: 'Review & Submit', icon: FileCheck },
]

const DA_PIPELINE = [
  { id: 1, key: 'draft', label: 'Create Direct Acquisition', description: 'DA record created and linked to approved Consolidated PR', icon: ShoppingCart },
  { id: 2, key: 'purchase_entry', label: 'Purchase Entry', description: 'Record purchase details & proof of transaction', icon: Receipt },
  { id: 3, key: 'for_disbursement', label: 'Payment / Disbursement Approval', description: 'Routes to Budget / Accounting / HoPE — no BAC routing', icon: CreditCard },
] as const

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  approved: { label: 'APPROVED', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
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
  const queryClient = useQueryClient()
  const [exportOpen, setExportOpen] = useState(false)
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)

  // Live detail query
  const { data: daDetail } = useDirectAcquisition({ pathParams: { id: entry.id } })
  const recordPurchaseMutation = useRecordDirectPurchase()

  const liveEntry: DirectAcquisition = useMemo(() => {
    if (!daDetail) return entry
    const allDocs = (daDetail.purchaseEntry?.proofDocuments && daDetail.purchaseEntry.proofDocuments.length > 0)
      ? daDetail.purchaseEntry.proofDocuments
      : (daDetail.documents || [])

    const proofFiles: ProofFile[] = allDocs.map((doc) => ({
      id: doc.id || doc.fileId,
      fileId: doc.fileId || doc.id,
      name: doc.fileName || 'Proof Document',
      fileType: (doc.fileType?.toLowerCase().includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image') as ProofFile['fileType'],
      documentType: doc.documentType || 'PROOF_OF_TRANSACTION',
      url: `/files/download/${doc.fileId || doc.id}`,
      uploadedAt: doc.uploadedAt,
    }))

    const s = (daDetail.status || '').toUpperCase()
    let mappedStatus: DirectAcquisition['status'] = 'draft'
    if (s === 'PURCHASE_ENTRY' || s === 'PURCHASEENTRY') mappedStatus = 'purchase_entry'
    else if (s === 'FOR_DISBURSEMENT' || s === 'FORDISBURSEMENT') mappedStatus = 'for_disbursement'
    else if (s === 'APPROVED') mappedStatus = 'approved'
    else if (s === 'RETURNED') mappedStatus = 'returned'

    const rawRemarks = daDetail.remarks || daDetail.purchaseEntry?.remarks || entry.remarks || ''
    const cleanRemarks = rawRemarks.startsWith('SELECTED_ITEMS:')
      ? (daDetail.purchaseEntry?.remarks || entry.remarks || '')
      : rawRemarks

    return {
      id: daDetail.id,
      daNumber: daDetail.daNumber,
      consolidatedPrId: daDetail.consolidatedPRId,
      prNumber: daDetail.cprNumber || '',
      bacResolutionId: daDetail.bacProjectId,
      bacResolutionNumber: daDetail.bacResolutionNumber,
      office: daDetail.office || 'Procurement Office',
      category: daDetail.category || 'General',
      modeOfProcurement: daDetail.modeOfProcurement || 'Direct Acquisition',
      totalABC: daDetail.totalABC || 0,
      status: mappedStatus,
      supplier: daDetail.purchaseEntry?.supplierName || entry.supplier,
      finalAmount: daDetail.purchaseEntry?.finalAmount ?? entry.finalAmount,
      transactionDate: daDetail.purchaseEntry?.transactionDate || entry.transactionDate,
      remarks: cleanRemarks || undefined,
      proofFiles: proofFiles.length > 0 ? proofFiles : entry.proofFiles,
      paymentMethod: daDetail.purchaseEntry?.paymentMethod === 'EMPLOYEE_REIMBURSEMENT' ? 'employee_reimbursement' : 'direct_vendor',
      payeeName: daDetail.purchaseEntry?.payeeName || entry.payeeName,
      supplierTin: daDetail.purchaseEntry?.supplierTIN || entry.supplierTin,
      createdBy: daDetail.createdBy,
      createdAt: daDetail.createdAt || entry.createdAt,
    }
  }, [daDetail, entry])

  const linkedConsolidatedPr = useMemo(() => {
    if (!liveEntry.consolidatedPrId && !liveEntry.prNumber) return null
    return consolidatedPRs.find((pr) =>
      pr.id === liveEntry.consolidatedPrId ||
      pr.prNumber === liveEntry.consolidatedPrId ||
      pr.id === liveEntry.prNumber ||
      pr.prNumber === liveEntry.prNumber
    ) ?? null
  }, [consolidatedPRs, liveEntry.consolidatedPrId, liveEntry.prNumber])

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [supplier, setSupplier] = useState(liveEntry.supplier || '')
  const [supplierOther, setSupplierOther] = useState('')
  const [supplierTin, setSupplierTin] = useState(liveEntry.supplierTin || '')
  const [finalAmount, setFinalAmount] = useState<number | ''>(liveEntry.finalAmount || '')
  const [transactionDate, setTransactionDate] = useState(liveEntry.transactionDate || '')
  const [remarks, setRemarks] = useState(
    (liveEntry.remarks && !liveEntry.remarks.startsWith('SELECTED_ITEMS:')) ? liveEntry.remarks : ''
  )
  const [movFiles, setMovFiles] = useState<DialogProofFile[]>(
    (liveEntry.proofFiles ?? []).map((f) => ({ ...f })),
  )
  const [dragOver, setDragOver] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Quick-register state
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [quickRegName, setQuickRegName] = useState('')
  const [quickRegTin, setQuickRegTin] = useState('')
  const [customSuppliers, setCustomSuppliers] = useState<SupplierOption[]>([])
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [supplierSearch, setSupplierSearch] = useState('')

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'direct_vendor' | 'employee_reimbursement'>(
    liveEntry.paymentMethod || 'direct_vendor'
  )
  const [payeeName, setPayeeName] = useState(liveEntry.payeeName || '')

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

  // Fetch live registered suppliers from the backend library
  const { data: suppliersResponse } = useSuppliers({
    pathParams: {},
    queryParams: {},
    enabled: open,
  })

  const registeredSuppliers: SupplierOption[] = useMemo(() => {
    const raw = (suppliersResponse as any)?.data
    if (!raw || !Array.isArray(raw)) return []
    return raw.map((s: any) => ({
      id: s.id,
      name: s.businessName || s.name || 'Registered Supplier',
      tin: s.taxIdNumber || s.tin || undefined,
      isRegistered: true,
    }))
  }, [suppliersResponse])

  const allSupplierOptions: SupplierOption[] = useMemo(() => {
    const map = new Map<string, SupplierOption>()

    // 1. Live registered suppliers from DB
    registeredSuppliers.forEach((s) => {
      if (s.name) map.set(s.name.toLowerCase(), s)
    })

    // 2. Custom/quick registered suppliers in this session
    customSuppliers.forEach((s) => {
      if (s.name) map.set(s.name.toLowerCase(), s)
    })

    // 3. Standard reputable presets
    SUPPLIER_OPTIONS.forEach((s) => {
      if (!map.has(s.name.toLowerCase())) {
        map.set(s.name.toLowerCase(), s)
      }
    })

    return Array.from(map.values())
  }, [registeredSuppliers, customSuppliers])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const fileType: DialogProofFile['fileType'] = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
        ? 'image'
        : ext === 'pdf'
          ? 'pdf'
          : 'document'
      const blobUrl = URL.createObjectURL(file)
      setMovFiles((s) => [
        ...s,
        {
          id: crypto.randomUUID(),
          name: file.name,
          blobUrl,
          fileType,
          uploadedAt: new Date().toISOString(),
          _size: file.size,
          _file: file,
        },
      ])
    })
    if (uploadInputRef.current) uploadInputRef.current.value = ''
  }

  const eligible = liveEntry.totalABC <= THRESHOLD
  const canRecord = eligible && (liveEntry.status === 'draft' || liveEntry.status === 'returned')

  const amountExceedsABC = Number(finalAmount) > THRESHOLD

  const resolvedSupplier = supplier === '__other__' ? supplierOther.trim() : supplier

  const step1Valid =
    Boolean(resolvedSupplier.trim()) &&
    Boolean(finalAmount) &&
    Number(finalAmount) > 0 &&
    !amountExceedsABC &&
    Boolean(transactionDate) &&
    (paymentMethod !== 'employee_reimbursement' || Boolean(payeeName.trim()))

  const step2Valid = movFiles.length > 0

  // Preview and Download Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedPreviewAttachment, setSelectedPreviewAttachment] = useState<FileAttachment | null>(null)

  const handlePreviewDocument = (f: ProofFile) => {
    const isPdf = f.fileType === 'pdf' || f.name.toLowerCase().endsWith('.pdf')
    setSelectedPreviewAttachment({
      id: f.fileId || f.id,
      fileName: f.name,
      fileUrl: f.url || `/files/download/${f.fileId || f.id}`,
      fileSize: f.size,
      fileType: isPdf ? 'application/pdf' : 'image/png',
    })
    setPreviewModalOpen(true)
  }

  const handleDownloadDocument = async (f: ProofFile) => {
    const fileId = f.fileId || f.id
    try {
      toast({
        title: 'Downloading Document',
        description: `Preparing ${f.name} for download...`,
      })
      const res = await api.get<Blob>(`/files/download/${fileId}`, { responseType: 'blob' })
      const blob = res.data
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = f.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Could not download the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleOpenRecord = () => {
    setStep(1)
    setSupplier(liveEntry.supplier || '')
    setSupplierOther('')
    setSupplierTin(liveEntry.supplierTin || '')
    setFinalAmount(liveEntry.finalAmount || (liveEntry.totalABC > 0 ? liveEntry.totalABC : ''))
    setTransactionDate(liveEntry.transactionDate || '')
    setRemarks((liveEntry.remarks && !liveEntry.remarks.startsWith('SELECTED_ITEMS:')) ? liveEntry.remarks : '')
    setPaymentMethod(liveEntry.paymentMethod || 'direct_vendor')
    setPayeeName(liveEntry.payeeName || '')
    setShowQuickRegister(false)
    setQuickRegName('')
    setQuickRegTin('')
    setMovFiles((liveEntry.proofFiles ?? []).map((f) => ({ ...f })))
    setOpen(true)
  }

  const handleNext = () => {
    if (step === 1 && !step1Valid) {
      if (!resolvedSupplier.trim()) return toast({ title: 'Required', description: 'Supplier name is required.' })
      if (!finalAmount || Number(finalAmount) <= 0) return toast({ title: 'Required', description: 'Enter a valid transaction amount.' })
      if (amountExceedsABC) return toast({ title: 'Amount Exceeds Threshold', description: `Actual purchase amount must not exceed the legislative threshold of ₱${THRESHOLD.toLocaleString()}.` })
      if (!transactionDate) return toast({ title: 'Required', description: 'Transaction date is required.' })
      if (paymentMethod === 'employee_reimbursement' && !payeeName.trim()) return toast({ title: 'Required', description: 'Payee selection is required for Employee Reimbursement.' })
      return
    }
    if (step === 2 && !step2Valid) {
      return toast({ title: 'Required', description: 'Upload at least one proof of transaction document.' })
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const handleSubmit = async () => {
    if (!step1Valid) {
      setStep(1)
      if (!resolvedSupplier.trim()) return toast({ title: 'Required', description: 'Supplier name is required.' })
      if (!finalAmount || Number(finalAmount) <= 0) return toast({ title: 'Required', description: 'Enter a valid transaction amount.' })
      if (amountExceedsABC) return toast({ title: 'Amount Exceeds Threshold', description: `Actual purchase amount must not exceed the legislative threshold of ₱${THRESHOLD.toLocaleString()}.` })
      if (!transactionDate) return toast({ title: 'Required', description: 'Transaction date is required.' })
      return
    }

    if (!step2Valid) {
      setStep(2)
      return toast({ title: 'Required', description: 'Upload at least one proof of transaction document.' })
    }

    try {
      // 1. Upload files to /files/upload if they have an active File instance
      const uploadedProofFiles = await Promise.all(
        movFiles.map(async (f) => {
          if (f.fileId) {
            return {
              fileId: f.fileId,
              fileName: f.name,
              fileType: f.fileType,
              documentType: 'PROOF_OF_TRANSACTION',
            }
          }
          if (f._file) {
            const formData = new FormData()
            formData.append('file', f._file)
            const uploadRes = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
            return {
              fileId: uploadRes.data?.data,
              fileName: f.name,
              fileType: f.fileType,
              documentType: 'PROOF_OF_TRANSACTION',
            }
          }
          return {
            fileId: f.id,
            fileName: f.name,
            fileType: f.fileType,
            documentType: 'PROOF_OF_TRANSACTION',
          }
        })
      )

      // 2. Submit Record Purchase payload
      await recordPurchaseMutation.mutateAsync({
        pathParams: { id: liveEntry.id },
        payload: {
          supplierName: resolvedSupplier,
          supplierTIN: supplierTin || undefined,
          finalAmount: Number(finalAmount),
          transactionDate: new Date(transactionDate).toISOString(),
          paymentMethod: paymentMethod === 'employee_reimbursement' ? 'EMPLOYEE_REIMBURSEMENT' : 'DIRECT_TO_VENDOR',
          payeeName: paymentMethod === 'employee_reimbursement' ? payeeName : undefined,
          remarks: remarks || undefined,
          proofFiles: uploadedProofFiles.filter((f) => !!f.fileId) as any,
        },
      })

      // Invalidate queries so liveEntry immediately refreshes with updated proof files and names
      await queryClient.invalidateQueries({ queryKey: ['direct-acquisition'] })
      await queryClient.invalidateQueries({ queryKey: ['direct-acquisitions'] })

      // Clean up object URLs
      movFiles.forEach((f) => {
        if (f.blobUrl) {
          try { URL.revokeObjectURL(f.blobUrl) } catch {}
        }
      })

      setOpen(false)
      toast({
        title: '✅ Purchase Entry Recorded',
        description: 'Direct purchase details and proof documents saved successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Record Failed',
        description: error?.message || 'Failed to record purchase entry.',
        variant: 'destructive',
      })
    }
  }

  const statusCfg = STATUS_CONFIG[liveEntry.status] || STATUS_CONFIG.draft

  const activePipelineStep =
    liveEntry.status === 'draft' ? 1 :
    liveEntry.status === 'purchase_entry' ? 2 :
    liveEntry.status === 'returned' ? 2 :
    3

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
                <CardTitle className="text-2xl">{liveEntry.daNumber}</CardTitle>
                <Badge variant="outline" className={cn('text-xs font-semibold px-2.5 py-1', statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {liveEntry.prNumber}
              </CardDescription>
            </div>

            {/* Action buttons */}
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

      {/* PR Details — Enhanced Metadata Cards Matching Pipeline Typography */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base font-semibold">Procurement Source & Request Details</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Direct Acquisition under RA 12009 (Low-value direct purchase)
              </CardDescription>
            </div>
            {eligible ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs px-3 py-1 font-medium flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" /> Within statutory threshold (≤ ₱200k)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs px-3 py-1 font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-600" /> Exceeds ₱200k threshold
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Consolidated PR */}
            <div className="rounded-xl border border-purple-100/90 bg-purple-50/50 dark:bg-purple-950/20 p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-900/70 dark:text-purple-300/80">
                  Consolidated PR
                </p>
                <p className="font-semibold text-sm text-foreground truncate mt-0.5">
                  {daDetail?.cprNumber || (liveEntry.prNumber && !liveEntry.prNumber.includes('-') ? liveEntry.prNumber : liveEntry.prNumber || 'CPR Reference')}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  {daDetail?.consolidatedPRItems?.length ?? 1} item(s) acquired
                </p>
              </div>
            </div>

            {/* Card 2: Requesting Office */}
            <div className="rounded-xl border border-sky-100/90 bg-sky-50/50 dark:bg-sky-950/20 p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-900/70 dark:text-sky-300/80">
                  Requesting Office
                </p>
                <p className="font-semibold text-sm text-foreground truncate mt-0.5" title={liveEntry.office}>
                  {liveEntry.office}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  {liveEntry.category}
                </p>
              </div>
            </div>

            {/* Card 3: Mode & BAC Resolution */}
            <div className="rounded-xl border border-amber-100/90 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70 dark:text-amber-300/80">
                  BAC Resolution
                </p>
                <p className="font-semibold text-sm text-foreground truncate mt-0.5" title={liveEntry.bacResolutionNumber || 'Direct'}>
                  {liveEntry.bacResolutionNumber || 'Not linked / Direct'}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Supporting reference
                </p>
              </div>
            </div>

            {/* Card 4: Total ABC */}
            <div className="rounded-xl border border-emerald-100/90 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 shrink-0">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70 dark:text-emerald-300/80">
                  Total Approved ABC
                </p>
                <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ₱{liveEntry.totalABC.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Direct Acquisition (RA 12009)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Pipeline</CardTitle>
          <CardDescription>
            Simplified 3-step Direct Acquisition workflow under RA 12009 — competitive bidding and quotation procedures are bypassed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center w-full gap-0 flex-wrap sm:flex-nowrap">
            {DA_PIPELINE.map((phase, i) => {
              const Icon = phase.icon
              const isCompleted = activePipelineStep > phase.id
              const isActive = activePipelineStep === phase.id
              return (
                <div key={phase.id} className="flex items-center flex-1 last:flex-none w-full sm:w-auto">
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
                    <div className="hidden sm:flex items-center px-2 shrink-0">
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

      {/* Purchase Entry Details Section */}
      {liveEntry.status !== 'draft' && liveEntry.supplier && (
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-slate-200/80 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Purchase Entry Details</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Recorded direct purchase information and proof documents
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 shrink-0">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">TOTAL AMOUNT</p>
                  <p className="text-base font-semibold text-emerald-600">
                    ₱{liveEntry.finalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                  </p>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">STATUS</p>
                  <Badge className="bg-purple-100 text-purple-700 font-medium text-xs px-3 py-0.5 rounded-full border-0 shadow-none">
                    Active
                  </Badge>
                </div>
              </div>

              {(liveEntry.status === 'purchase_entry' || liveEntry.status === 'returned') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenRecord}
                  className="gap-1.5 h-8 text-xs font-medium border-purple-300 text-purple-700 hover:bg-purple-50 px-3 rounded-lg ml-auto sm:ml-2"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Purchase Entry
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* 4-Column x 2-Row Information Grid Layout */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden divide-y divide-slate-200/80">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
                {/* Cell 1: Retail Supplier / Store */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">RETAIL SUPPLIER / STORE</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">{liveEntry.supplier || '—'}</p>
                    {liveEntry.supplierTin && (
                      <span className="inline-block text-[10px] font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full mt-1">
                        TIN: {liveEntry.supplierTin}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cell 2: Payment Method */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">PAYMENT METHOD</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {liveEntry.paymentMethod === 'employee_reimbursement' ? 'Employee Reimbursement' : 'Direct to Vendor'}
                    </p>
                    {liveEntry.paymentMethod === 'employee_reimbursement' && liveEntry.payeeName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">({liveEntry.payeeName})</p>
                    )}
                  </div>
                </div>

                {/* Cell 3: Transaction Date */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">TRANSACTION DATE</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {liveEntry.transactionDate
                        ? new Date(liveEntry.transactionDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Cell 4: Office / Requesting Unit */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">OFFICE / REQUESTING UNIT</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {liveEntry.office || 'Finance and Management Service'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
                {/* Cell 1: Final Transaction Amount */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-medium text-base mt-0.5">
                    ₱
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">FINAL TRANSACTION AMOUNT</p>
                    <p className="text-base font-semibold text-emerald-600 mt-0.5">
                      ₱{liveEntry.finalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Cell 2: Reference No. */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">REFERENCE NO.</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {linkedConsolidatedPr?.prNumber || liveEntry.prNumber || 'CPR-2026-4929'}
                    </p>
                  </div>
                </div>

                {/* Cell 3: Remarks */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">REMARKS</p>
                    <p className="text-sm font-normal text-foreground mt-0.5">
                      {liveEntry.remarks || 'lorem ipsum'}
                    </p>
                  </div>
                </div>

                {/* Cell 4: Created By */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 font-medium text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {(liveEntry.createdBy || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">CREATED BY</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">{liveEntry.createdBy || 'system'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {liveEntry.createdAt
                        ? new Date(liveEntry.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
                          ' ' +
                          new Date(liveEntry.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
                        : 'Aug 28, 2026 12:16 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Transaction Section */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <FileCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Proof of Transaction</p>
                      <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0 font-medium">
                        {liveEntry.proofFiles?.length || 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Uploaded supporting documents and proof of transaction</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Max file size: 25MB • PDF, PNG, JPG <Info className="inline h-3 w-3 -mt-0.5 ml-0.5 text-muted-foreground/70" />
                  </span>
                  {(liveEntry.status === 'purchase_entry' || liveEntry.status === 'returned') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenRecord}
                      className="gap-1.5 h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Upload Document
                    </Button>
                  )}
                </div>
              </div>

              {/* Document Row Container */}
              <div className="rounded-xl border divide-y overflow-hidden bg-card/60">
                {liveEntry.proofFiles && liveEntry.proofFiles.length > 0 ? (
                  liveEntry.proofFiles.map((f, idx) => {
                    const isPdf = f.fileType === 'pdf' || f.name.toLowerCase().endsWith('.pdf')
                    const isPng = f.name.toLowerCase().endsWith('.png')
                    const isJpg = f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg')

                    const docCategory = f.documentType === 'PROOF_OF_PAYMENT' || idx === 1
                      ? 'Proof of Payment'
                      : 'Proof of Transaction'

                    const formattedDate = f.uploadedAt
                      ? new Date(f.uploadedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
                        ' ' +
                        new Date(f.uploadedAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
                      : 'Aug 28, 2026 11:15 AM'

                    return (
                      <div key={f.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* File Type Badge */}
                          <div
                            className={cn(
                              'h-10 w-10 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold text-[10px] tracking-wider border',
                              isPdf ? 'bg-red-50 text-red-600 border-red-200' :
                              isPng ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              isJpg ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-sky-50 text-sky-600 border-sky-200'
                            )}
                          >
                            {isPdf ? 'PDF' : isPng ? 'PNG' : isJpg ? 'JPG' : 'DOC'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p
                                onClick={() => handlePreviewDocument(f)}
                                className="text-sm font-semibold text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                                title={f.name}
                              >
                                {f.name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{docCategory}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] px-2 py-0.5 rounded-full font-medium">
                            Uploaded
                          </Badge>

                          <div className="text-right hidden md:block">
                            <p className="text-xs font-medium text-foreground">{f.size ? `${(f.size / 1024).toFixed(0)} KB` : (isPdf ? '245 KB' : '512 KB')}</p>
                            <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreviewDocument(f)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Preview Document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(f)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Download Document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => handlePreviewDocument(f)} className="gap-2 text-xs">
                                  <Eye className="h-3.5 w-3.5" />
                                  View Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(f)} className="gap-2 text-xs">
                                  <Download className="h-3.5 w-3.5" />
                                  Download File
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const url = window.location.origin + (f.url || `/files/download/${f.fileId || f.id}`)
                                    navigator.clipboard.writeText(url)
                                    toast({ title: 'Link Copied', description: 'Document link copied to clipboard.' })
                                  }}
                                  className="gap-2 text-xs"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No proof documents attached.
                  </div>
                )}
              </div>
            </div>

            {/* Security / Assurance Footer */}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Documents are securely stored and linked to this Purchase Entry.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">You can preview or download the files anytime.</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: 'Audit History', description: 'Direct Acquisition audit trail and document revisions are logged.' })}
                className="gap-1.5 h-8 text-xs font-medium bg-white hover:bg-muted/50 shrink-0 border-emerald-200 text-emerald-800"
              >
                <History className="h-3.5 w-3.5 text-emerald-700" />
                View Document History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consolidated PR Items */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Consolidated PR Items
          </CardTitle>
          <CardDescription>
            Items acquired under this Direct Acquisition ({daDetail?.cprNumber || liveEntry.prNumber || 'Consolidated PR'})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Check if we have items from live backend DTO or linked store CPR */}
          {daDetail?.consolidatedPRItems && daDetail.consolidatedPRItems.length > 0 ? (
            <Tabs defaultValue="by-office" className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 bg-muted/50 p-2 mb-4">
                <TabsTrigger value="by-office" className="flex items-center gap-2">📋 By Office</TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">📊 Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="by-office" className="space-y-4">
                {Object.entries(
                  daDetail.consolidatedPRItems.reduce<Record<string, typeof daDetail.consolidatedPRItems>>((g, it) => {
                    const k = it.prOffice || 'Procurement Office'
                    if (!g[k]) g[k] = []
                    g[k].push(it)
                    return g
                  }, {})
                ).map(([office, items], index) => {
                  const sourceTotal = items.reduce((sum, item) => sum + item.totalAmount, 0)
                  const prs = Array.from(new Set(items.map(i => i.prNumber).filter(Boolean)))

                  return (
                    <div key={office}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium">{office}</p>
                            <p className="text-sm text-muted-foreground">{prs.length > 0 ? `${prs.join(', ')} · ` : ''}{items.length} item(s)</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">{formatCurrencyPHP(sourceTotal)}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-default-200 mt-3">
                        <Table>
                          <TableHeader className="bg-default-50">
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Fund</TableHead>
                              <TableHead className="text-center">Total Qty</TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead className="text-left">Total Amount</TableHead>
                              <TableHead>Mode of Procurement</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  <div>{item.itemName}</div>
                                  {item.itemDescription && <div className="text-xs text-muted-foreground">{item.itemDescription}</div>}
                                </TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.fund || '—'}</TableCell>
                                <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                                <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                                <TableCell className="font-semibold text-green-700">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                                <TableCell>{item.procurementMode || 'Direct Acquisition'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-default-200">
                  <Table>
                    <TableHeader className="bg-default-50">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Total Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daDetail.consolidatedPRItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                          <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                          <TableCell className="font-semibold text-green-700">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          ) : linkedConsolidatedPr && linkedConsolidatedPr.selectedPRItems.length > 0 ? (
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
                  const sourceTotal = items.reduce((sum, item) => sum + item.totalAmount, 0)
                  const prs = Array.from(new Set(items.map(i => i.prNumber).filter(Boolean)))

                  return (
                    <div key={office}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium">{office}</p>
                            <p className="text-sm text-muted-foreground">{prs.length > 0 ? `${prs.join(', ')} · ` : ''}{items.length} item(s)</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">{formatCurrencyPHP(sourceTotal)}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-default-200 mt-3">
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
                                  <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                                  <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                                  <TableCell className="font-semibold text-green-700">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                                  <TableCell>
                                    {typeof linkedConsolidatedPr.itemMOPs?.[item.id] === 'object'
                                      ? (linkedConsolidatedPr.itemMOPs?.[item.id] as any)?.mop || 'Direct Acquisition'
                                      : (linkedConsolidatedPr.itemMOPs?.[item.id] as any) || 'Direct Acquisition'}
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
                <div className="overflow-x-auto rounded-lg border border-default-200">
                  <Table>
                    <TableHeader className="bg-default-50">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Total Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedConsolidatedPr.selectedPRItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                          <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                          <TableCell className="font-semibold text-green-700">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-sm text-muted-foreground">
              No Consolidated PR items found for <span className="font-mono">{liveEntry.consolidatedPrId || liveEntry.prNumber}</span>.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3-Step Record Purchase Modal */}
      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => { if (!v) setOpen(false); else setOpen(true) }}
        title="Record Direct Purchase"
        description="Capture retail purchase details and proof of transaction (RA 12009)"
        size="lg"
        className="w-full max-h-[85vh]"
        footer={null}
        showCloseButton
      >
        <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-6 py-2">
          {/* Stepper Header */}
          <div className="flex items-center justify-between px-2">
            {RECORD_STEPS.map((s, idx) => {
              const Icon = s.icon
              const isCurrent = step === s.id
              const isPast = step > s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                      isPast ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      {isPast ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={cn('text-xs font-medium hidden sm:inline', isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                      {s.label}
                    </span>
                  </div>
                  {idx < RECORD_STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-3', isPast ? 'bg-green-600' : 'bg-muted')} />
                  )}
                </div>
              )
            })}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">
                  Retail Supplier / Store Name <span className="text-destructive">*</span>
                </label>
                <div className="mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <Select
                      value={supplier}
                      onValueChange={(val) => {
                        setSupplier(val)
                        if (val !== '__other__') {
                          const found = allSupplierOptions.find((s) => s.name === val)
                          setSupplierTin(found?.tin || '')
                          setSupplierOther('')
                        }
                      }}
                      open={supplierDropdownOpen}
                      onOpenChange={setSupplierDropdownOpen}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select or search registered supplier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search store name or TIN..."
                              value={supplierSearch}
                              onChange={(e) => setSupplierSearch(e.target.value)}
                              className="pl-8 h-8 text-xs"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {allSupplierOptions
                          .filter((s) =>
                            s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                            (s.tin && s.tin.includes(supplierSearch))
                          )
                          .map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  {s.isRegistered && (
                                    <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-300 px-1 py-0 font-normal">
                                      Registered
                                    </Badge>
                                  )}
                                </div>
                                {s.tin && <span className="text-xs text-muted-foreground font-mono">TIN: {s.tin}</span>}
                              </div>
                            </SelectItem>
                          ))}
                        <SelectItem value="__other__">
                          <span className="italic text-muted-foreground">+ Type custom store name</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0 text-xs"
                    onClick={() => setShowQuickRegister((v) => !v)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Quick Register
                  </Button>
                </div>
              </div>

              {showQuickRegister && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary">Quick Register New Merchant</p>
                    <button type="button" onClick={() => setShowQuickRegister(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">Store Name <span className="text-destructive">*</span></label>
                      <Input
                        placeholder="e.g. Ace Hardware Makati"
                        value={quickRegName}
                        onChange={(e) => setQuickRegName(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">TIN <span className="text-muted-foreground">(optional)</span></label>
                      <Input
                        placeholder="e.g. 123-456-789-000"
                        value={quickRegTin}
                        onChange={(e) => setQuickRegTin(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowQuickRegister(false)}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" className="h-7 text-xs" onClick={handleQuickRegisterSave} disabled={!quickRegName.trim()}>
                      Add Store
                    </Button>
                  </div>
                </div>
              )}

              {supplier === '__other__' && (
                <div>
                  <label className="text-sm font-semibold">Custom Store Name <span className="text-destructive">*</span></label>
                  <Input
                    placeholder="Enter retail store or online merchant name"
                    value={supplierOther}
                    onChange={(e) => setSupplierOther(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold">Merchant TIN <span className="text-muted-foreground text-xs font-normal">(optional)</span></label>
                <Input
                  placeholder="e.g. 000-123-456-000"
                  value={supplierTin}
                  onChange={(e) => setSupplierTin(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Payment Method <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  <div
                    onClick={() => setPaymentMethod('direct_vendor')}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all',
                      paymentMethod === 'direct_vendor'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <CreditCard className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Direct to Vendor</p>
                      <p className="text-xs text-muted-foreground">Disbursement Voucher is issued directly to the supplier/store.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('employee_reimbursement')}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all',
                      paymentMethod === 'employee_reimbursement'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <UserCheck className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-semibold">Employee Reimbursement</p>
                      <p className="text-xs text-muted-foreground">For employees who fronted cash for direct purchases. Generates DV for payee.</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'employee_reimbursement' && (
                <div className="space-y-1.5 p-3.5 rounded-lg border border-amber-200 bg-amber-50/60">
                  <label className="text-xs font-semibold text-amber-900">
                    Payee Employee (DV Recipient) <span className="text-destructive">*</span>
                  </label>
                  <Select value={payeeName} onValueChange={setPayeeName}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select employee to reimburse..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_OPTIONS.map((emp) => (
                        <SelectItem key={emp.id} value={emp.name}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-xs text-muted-foreground">{emp.office} · {emp.position}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">
                    Final Transaction Amount <span className="text-destructive">*</span>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">max ₱200,000</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={THRESHOLD}
                    placeholder="e.g. 18500"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className={cn('mt-1.5', amountExceedsABC ? 'border-destructive' : '')}
                  />
                  {amountExceedsABC && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Amount exceeds legislative threshold of ₱200,000.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold">Transaction Date <span className="text-destructive">*</span></label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Remarks <span className="text-muted-foreground text-xs font-normal">(optional)</span></label>
                <Textarea
                  placeholder="Additional notes about this direct purchase..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1.5 resize-none h-20"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Upload Proof of Transaction <span className="text-destructive">*</span></label>
                <p className="text-xs text-muted-foreground mt-0.5">Attach Official Receipt (OR), Sales Invoice, Cash Receipt, or Charge Slip.</p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                onClick={() => uploadInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center',
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30'
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click or drag files here to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Accepts PDF, JPG, PNG (receipts, invoices, vouchers)</p>
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {movFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Uploaded Proof Files ({movFiles.length})</p>
                    <span className="text-[11px] text-muted-foreground">Click filename to rename</span>
                  </div>
                  <div className="space-y-2">
                    {movFiles.map((f) => {
                      const Icon = f.fileType === 'image' ? FileImage : f.fileType === 'pdf' ? FileText : File
                      return (
                        <div key={f.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Icon className="h-4 w-4 text-primary shrink-0" />
                            <Input
                              value={f.name}
                              onChange={(e) => {
                                const newName = e.target.value
                                setMovFiles((s) => s.map((x) => x.id === f.id ? { ...x, name: newName } : x))
                              }}
                              className="h-7 text-xs bg-background/90 px-2 flex-1 border-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary"
                              placeholder="e.g. Official Receipt No. 12345"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => {
                              if (f.blobUrl) {
                                try { URL.revokeObjectURL(f.blobUrl) } catch {}
                              }
                              setMovFiles((s) => s.filter((x) => x.id !== f.id))
                            }}
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3 text-sm">
                <p className="font-semibold text-base border-b pb-2">Purchase Entry Review</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-semibold">{resolvedSupplier}</span>
                  {supplierTin && (
                    <>
                      <span className="text-muted-foreground">TIN:</span>
                      <span className="font-mono">{supplierTin}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Final Amount:</span>
                  <span className="font-semibold text-green-700">₱{Number(finalAmount).toLocaleString()}</span>
                  <span className="text-muted-foreground">Transaction Date:</span>
                  <span>{transactionDate}</span>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold">{paymentMethod === 'employee_reimbursement' ? 'Employee Reimbursement' : 'Direct to Vendor'}</span>
                  {paymentMethod === 'employee_reimbursement' && payeeName && (
                    <>
                      <span className="text-muted-foreground">Payee:</span>
                      <span className="font-semibold text-amber-700">{payeeName}</span>
                    </>
                  )}
                  {remarks && (
                    <>
                      <span className="text-muted-foreground">Remarks:</span>
                      <span>{remarks}</span>
                    </>
                  )}
                </div>

                <div className="border-t pt-2 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Proof Files ({movFiles.length})</p>
                  {movFiles.map((f) => (
                    <p key={f.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      {f.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 1) setOpen(false)
              else setStep((s) => s - 1)
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={recordPurchaseMutation.isPending}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {recordPurchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
              Submit Purchase Entry
            </Button>
          )}
        </div>
      </ResponsiveDialog>

      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false)
          setSelectedPreviewAttachment(null)
        }}
        attachment={selectedPreviewAttachment}
      />

      <ExportComingSoonDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
