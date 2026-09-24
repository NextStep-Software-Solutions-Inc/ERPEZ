import { useState, useEffect, useRef } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useRFQStore, RFQItem } from '../store/rfqStore'
import { Pencil, Save, Upload, FileText, X, Send, Loader2, Download, CheckCircle2, FileCheck, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { generateAndDownloadRfqDocument } from '../utils/generateRfqDocumentRequest'
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
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { submitSupplierBidRequest } from '@/features/procurement/supplier-portal/handlers/supplierPortalRequests'

const useSubmitSupplierBid = createMutationHookFromTemplate(
  submitSupplierBidRequest,
)

interface SetQuotationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqId: string
  supplierId?: string
  initialRFQ?: any
  onSuccess?: () => void
}

interface ItemBidSpecModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: RFQItem | null
  onSave: (itemId: string, model: string, brand: string, color: string) => void
}

function ItemBidSpecModal({
  open,
  onOpenChange,
  item,
  onSave,
}: ItemBidSpecModalProps) {
  const [model, setModel] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (open && item) {
      setModel(item.bidModel || '')
      setBrand(item.bidBrand || '')
      setColor(item.bidColor || '')
    }
  }, [open, item])

  const handleSave = () => {
    if (item) {
      onSave(item.id, model, brand, color)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open && Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Item Bid Specification</DialogTitle>
          <DialogDescription>
            Enter the specifications for {item?.itemName || 'Item'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter model"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Enter color"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SetQuotationModal({
  open,
  onOpenChange,
  rfqId,
  supplierId,
  initialRFQ,
  onSuccess,
}: SetQuotationModalProps) {
  const { rfqs } = useRFQStore()
  const rfq = initialRFQ || rfqs.find((r) => r.id === rfqId)
  const { toast } = useToast()
  const [items, setItems] = useState<RFQItem[]>([])
  const [specModalOpen, setSpecModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RFQItem | null>(null)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const manualDocInputRef = useRef<HTMLInputElement | null>(null)
  const signatureInputRef = useRef<HTMLInputElement | null>(null)

  const [submissionType, setSubmissionType] = useState<'Electronic' | 'Manual'>('Electronic')
  const [signatoryName, setSignatoryName] = useState('')
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>()
  const [quotationDocumentUrl, setQuotationDocumentUrl] = useState<string | undefined>()
  const [quotationDocumentName, setQuotationDocumentName] = useState<string | undefined>()
  const [deliveryPeriod, setDeliveryPeriod] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [warrantyTerms, setWarrantyTerms] = useState('')
  const [remarks, setRemarks] = useState('')
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  const { mutateAsync: submitBidMutation, isPending: isSubmitting } =
    useSubmitSupplierBid()

  const isSubmitted =
    rfq?.quotationStatus === 'submitted' &&
    rfq?.quotationApprovalStatus !== 'returned'

  useEffect(() => {
    if (rfq && open) {
      if (rfq.quotationSubmissionType === 'Manual' || rfq.submissionType === 'Manual') {
        setSubmissionType('Manual')
      } else {
        setSubmissionType('Electronic')
      }

      setSignatoryName(rfq.signatoryName || rfq.supplierSignatoryName || '')
      setSignatureUrl(rfq.signatureUrl)
      setQuotationDocumentUrl(rfq.quotationDocumentUrl)
      setQuotationDocumentName(rfq.quotationDocumentName || (rfq.quotationDocumentUrl ? 'Uploaded_RFQ_Quotation.pdf' : undefined))
      setDeliveryPeriod(rfq.deliveryPeriod || '')
      setPaymentTerms(rfq.paymentTerms || '')
      setWarrantyTerms(rfq.warrantyTerms || '')
      setRemarks(rfq.remarks || '')

      setItems(
        (rfq.items || []).map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice ?? item.unitPriceSnapshot ?? 0),
          totalAmount: Number(
            item.totalAmount ??
              item.totalABC ??
              (item.unitPrice ?? item.unitPriceSnapshot ?? 0) *
                (item.quantity || 1),
          ),
          bidUnitPrice:
            item.bidUnitPrice !== undefined
              ? item.bidUnitPrice
              : item.supplierUnitPrice || 0,
          bidTotalAmount:
            item.bidTotalAmount !== undefined
              ? item.bidTotalAmount
              : (item.bidUnitPrice ?? item.supplierUnitPrice ?? 0) *
                (item.quantity || 1),
          bidBrand: item.bidBrand || item.brand || '',
          bidModel: item.bidModel || item.model || '',
          bidColor: item.bidColor || item.color || '',
          bidBrochureUrl: item.bidBrochureUrl || item.brochureFileUrl,
          bidBrochureFileName: item.bidBrochureFileName,
        })),
      )
    }
  }, [rfq, open])

  if (!rfq) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Set Quotation"
        description="Loading quotation details..."
      >
        <div className="p-8 text-center text-muted-foreground">
          Loading quotation details...
        </div>
      </ResponsiveDialog>
    )
  }

  const handleBidSpecClick = (item: RFQItem) => {
    if (isSubmitted) {
      toast({
        title: 'Cannot edit',
        description: 'You cannot edit your bid after submission.',
      })
      return
    }
    setSelectedItem(item)
    setSpecModalOpen(true)
  }

  const handleSaveBidSpec = (
    itemId: string,
    model: string,
    brand: string,
    color: string,
  ) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, bidModel: model, bidBrand: brand, bidColor: color }
          : item,
      ),
    )
    toast({
      title: 'Specification saved',
      description: 'Item bid specification has been updated.',
    })
  }

  const handleUnitBidChange = (itemId: string, value: string) => {
    const unitBid = parseFloat(value) || 0
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              bidUnitPrice: unitBid,
              bidTotalAmount: unitBid * item.quantity,
            }
          : item,
      ),
    )
  }

  const createdObjectUrlsRef = useRef<Record<string, string>>({})
  const prevBidUrlsRef = useRef<Record<string, string | undefined>>({})

  useEffect(() => {
    if (!open) {
      Object.values(createdObjectUrlsRef.current).forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {}
      })
      createdObjectUrlsRef.current = {}
      prevBidUrlsRef.current = {}
    }
    return () => {
      Object.values(createdObjectUrlsRef.current).forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {}
      })
      createdObjectUrlsRef.current = {}
      prevBidUrlsRef.current = {}
    }
  }, [open])

  useEffect(() => {
    const prev = prevBidUrlsRef.current
    items.forEach((it) => {
      const prevUrl = prev[it.id]
      const currUrl = it.bidBrochureUrl
      if (
        prevUrl &&
        prevUrl !== currUrl &&
        createdObjectUrlsRef.current[it.id] === prevUrl
      ) {
        try {
          URL.revokeObjectURL(prevUrl)
        } catch {}
        delete createdObjectUrlsRef.current[it.id]
      }
    })
    prevBidUrlsRef.current = items.reduce(
      (acc, it) => {
        acc[it.id] = it.bidBrochureUrl
        return acc
      },
      {} as Record<string, string | undefined>,
    )
  }, [items])

  const handleBrochureUpload = (itemId: string, file: File) => {
    const prev = items.find((i) => i.id === itemId)?.bidBrochureUrl
    if (
      prev &&
      prev.startsWith('blob:') &&
      createdObjectUrlsRef.current[itemId] === prev
    ) {
      try {
        URL.revokeObjectURL(prev)
      } catch {}
      delete createdObjectUrlsRef.current[itemId]
    }

    const fileUrl = URL.createObjectURL(file)
    createdObjectUrlsRef.current[itemId] = fileUrl

    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              bidBrochureUrl: fileUrl,
              bidBrochureFileName: file.name,
            }
          : item,
      ),
    )
    toast({
      title: 'Brochure uploaded',
      description: `File "${file.name}" has been uploaded.`,
    })
  }

  const handleRemoveBrochure = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              bidBrochureUrl: undefined,
              bidBrochureFileName: undefined,
            }
          : item,
      ),
    )
    toast({
      title: 'Brochure removed',
      description: 'The brochure has been removed.',
    })
  }

  const handleDownloadTemplate = async (format: 'Pdf' | 'Excel' = 'Pdf') => {
    if (!rfq?.id) return
    setIsDownloadingTemplate(true)
    const ext = format === 'Excel' ? 'xlsx' : 'pdf'
    try {
      await generateAndDownloadRfqDocument({
        rfqId: rfq.id,
        format,
        supplierId: supplierId || undefined,
        blankTemplate: true,
        filename: `RFQ_${rfq.rfqNumber || rfq.id}_Template.${ext}`,
      })
      toast({
        title: `Template Downloaded (${format})`,
        description: `Pre-filled RFQ ${format} template is ready for quotation and offline routing/signing.`,
      })
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err?.message || 'Could not generate RFQ template.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleManualDocumentUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setQuotationDocumentUrl(url)
    setQuotationDocumentName(file.name)
    toast({
      title: 'Manual RFQ Document Attached',
      description: `File "${file.name}" attached.`,
    })
  }

  const handleSignatureUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setSignatureUrl(url)
    toast({
      title: 'E-Signature Attached',
      description: `Signature image uploaded.`,
    })
  }

  const handleSaveDraft = async () => {
    try {
      const targetSupplierId =
        supplierId || '00000000-0000-0000-0000-000000000001'
      await submitBidMutation({
        pathParams: { rfqId: rfq.id },
        payload: {
          rfqId: rfq.id,
          supplierId: targetSupplierId,
          submissionType,
          status: 'DRAFT',
          signatoryName: signatoryName.trim() || undefined,
          signatureUrl,
          quotationDocumentUrl,
          deliveryPeriod: deliveryPeriod.trim() || undefined,
          paymentTerms: paymentTerms.trim() || undefined,
          warrantyTerms: warrantyTerms.trim() || undefined,
          remarks: remarks.trim() || undefined,
          items: items.map((i) => ({
            rfqItemId: i.id,
            unitPrice: i.bidUnitPrice || 0,
            brand: i.bidBrand,
            model: i.bidModel,
            color: i.bidColor,
            brochureFileUrl: i.bidBrochureUrl,
            isResponsive: true,
          })),
        },
      })

      toast({
        title: 'Draft saved',
        description: 'Your quotation has been saved as draft.',
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not save quotation draft.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitQuotation = () => {
    if (submissionType === 'Manual' && !quotationDocumentUrl) {
      toast({
        title: 'Manual RFQ Document Required',
        description: 'Please upload the scanned/signed RFQ document before submitting.',
        variant: 'destructive',
      })
      return
    }

    if (!signatoryName.trim()) {
      toast({
        title: 'Signatory Name Required',
        description: 'Please enter the authorized representative / signatory name.',
        variant: 'destructive',
      })
      return
    }

    if (submissionType === 'Electronic') {
      const incomplete = items.filter(
        (item) => !item.bidUnitPrice || item.bidUnitPrice <= 0,
      )

      if (incomplete.length > 0) {
        toast({
          title: 'Incomplete quotation',
          description: 'Please enter unit bid prices for all items.',
        })
        return
      }
    }

    setSubmitConfirmOpen(true)
  }

  const confirmSubmit = async () => {
    try {
      const targetSupplierId =
        supplierId || '00000000-0000-0000-0000-000000000001'
      await submitBidMutation({
        pathParams: { rfqId: rfq.id },
        payload: {
          rfqId: rfq.id,
          supplierId: targetSupplierId,
          submissionType,
          status: 'SUBMITTED',
          signatoryName: signatoryName.trim() || undefined,
          signatureUrl,
          quotationDocumentUrl,
          deliveryPeriod: deliveryPeriod.trim() || undefined,
          paymentTerms: paymentTerms.trim() || undefined,
          warrantyTerms: warrantyTerms.trim() || undefined,
          remarks: remarks.trim() || undefined,
          items: items.map((i) => ({
            rfqItemId: i.id,
            unitPrice: i.bidUnitPrice || 0,
            brand: i.bidBrand,
            model: i.bidModel,
            color: i.bidColor,
            brochureFileUrl: i.bidBrochureUrl,
            isResponsive: true,
          })),
        },
      })

      toast({
        title: 'Quotation submitted',
        description: 'Your quotation has been successfully submitted.',
      })
      setSubmitConfirmOpen(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Could not submit quotation.',
        variant: 'destructive',
      })
    }
  }

  const totalABCAmount = items.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0,
  )
  const totalBidAmount = items.reduce(
    (sum, item) => sum + (item.bidTotalAmount || 0),
    0,
  )
  const isTotalOverBudget =
    totalABCAmount > 0 && totalBidAmount > totalABCAmount

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Set Quotation - ${rfq.rfqNumber}`}
        description="Submit your quotation either electronically or by uploading a manually routed, signed RFQ document."
        size="5xl"
        className="w-full max-w-[1350px]"
        showCloseButton
      >
        <div className="space-y-6">
          {/* Top Actions & Submission Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/30 border rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Submission Method:
              </span>
              <div className="inline-flex rounded-lg border bg-background p-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant={submissionType === 'Electronic' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3 gap-1.5"
                  onClick={() => !isSubmitted && setSubmissionType('Electronic')}
                  disabled={isSubmitted}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Electronic Bid Form
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={submissionType === 'Manual' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3 gap-1.5"
                  onClick={() => !isSubmitted && setSubmissionType('Manual')}
                  disabled={isSubmitted}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Manually Routed RFQ (PDF)
                </Button>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloadingTemplate}
                  className="gap-1.5 text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  {isDownloadingTemplate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Download RFQ Template
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleDownloadTemplate('Pdf')} className="gap-2 cursor-pointer text-xs">
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  Download PDF Template (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadTemplate('Excel')} className="gap-2 cursor-pointer text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Download Excel Template (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Manual Routed RFQ Document Upload Card */}
          {submissionType === 'Manual' && (
            <div className="border-2 border-dashed border-indigo-200 rounded-lg p-5 bg-indigo-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  Upload Signed & Routed RFQ Document
                </div>
                <Badge variant="outline" className="border-indigo-300 text-indigo-700 text-xs">
                  Physical / Scanned Submission
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please attach the scanned copy of the official RFQ with your printed prices, authorized signature, and company stamp.
              </p>

              {quotationDocumentUrl ? (
                <div className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-md">
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-900">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <a
                      href={quotationDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline max-w-[280px] truncate"
                    >
                      {quotationDocumentName || 'Attached_Signed_RFQ.pdf'}
                    </a>
                    <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-800">
                      Attached
                    </Badge>
                  </div>
                  {!isSubmitted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setQuotationDocumentUrl(undefined)
                        setQuotationDocumentName(undefined)
                      }}
                      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                !isSubmitted && (
                  <div>
                    <input
                      type="file"
                      ref={manualDocInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleManualDocumentUpload(file)
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => manualDocInputRef.current?.click()}
                      className="gap-2 text-xs h-8 border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Select Scanned RFQ File (PDF / Images)
                    </Button>
                  </div>
                )
              )}
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Model/Brand/Color</TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Unit ABC (₱)
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    Unit Bid (₱)
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Total Bid (₱)
                  </TableHead>
                  <TableHead>Brochure</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isItemOverBudget = Boolean(
                    item.bidUnitPrice &&
                      item.unitPrice &&
                      item.bidUnitPrice > item.unitPrice,
                  )

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.bidModel || item.bidBrand || item.bidColor ? (
                          <div className="text-sm">
                            {item.bidModel && <div>Model: {item.bidModel}</div>}
                            {item.bidBrand && <div>Brand: {item.bidBrand}</div>}
                            {item.bidColor && <div>Color: {item.bidColor}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700 whitespace-nowrap">
                        ₱
                        {(item.unitPrice || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.bidUnitPrice || ''}
                            onChange={(e) =>
                              handleUnitBidChange(item.id, e.target.value)
                            }
                            disabled={isSubmitted}
                            className={`w-32 ${
                              isItemOverBudget
                                ? 'border-amber-500 focus-visible:ring-amber-500 text-amber-900 bg-amber-50/40'
                                : ''
                            }`}
                            min="0"
                            step="0.01"
                          />
                          {isItemOverBudget && (
                            <span className="text-[10px] text-amber-600 block font-medium">
                              Exceeds ABC
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        ₱
                        {(item.bidTotalAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {item.bidBrochureUrl ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <a
                              href={item.bidBrochureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline max-w-[120px] truncate block"
                              title={item.bidBrochureFileName || 'Brochure'}
                            >
                              {item.bidBrochureFileName || 'View Brochure'}
                            </a>
                            {!isSubmitted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBrochure(item.id)}
                                className="h-6 w-6 p-0 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div>
                            {!isSubmitted && (
                              <>
                                <input
                                  type="file"
                                  ref={(el) =>
                                    (fileInputRefs.current[item.id] = el)
                                  }
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file)
                                      handleBrochureUpload(item.id, file)
                                  }}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    fileInputRefs.current[item.id]?.click()
                                  }
                                  className="gap-2"
                                >
                                  <Upload className="h-3 w-3" />
                                  Upload
                                </Button>
                              </>
                            )}
                            {isSubmitted && (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isSubmitted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBidSpecClick(item)}
                            className="gap-2"
                          >
                            <Pencil className="h-3 w-3" />
                            Item Bid Specification
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-between items-center p-4 bg-slate-50 border rounded-lg">
            <div>
              <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">
                TOTAL APPROVED BUDGET (ABC)
              </span>
              <span className="text-lg font-bold text-slate-700">
                ₱
                {totalABCAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">
                TOTAL QUOTATION AMOUNT
              </span>
              <div className="flex items-center gap-2.5 justify-end">
                <span
                  className={`text-2xl font-bold ${isTotalOverBudget ? 'text-amber-600' : 'text-primary'}`}
                >
                  ₱
                  {totalBidAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {isTotalOverBudget && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-medium"
                  >
                    Exceeds Total ABC
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Signatory & Verification Details Card */}
          <div className="border rounded-lg p-5 bg-card space-y-4">
            <div className="flex items-center gap-2 border-b pb-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Signatory & Commercial Terms Verification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="signatoryName" className="text-xs font-medium">
                  Authorized Signatory / Bidder Representative Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="signatoryName"
                  placeholder="e.g., Juan Dela Cruz (Managing Director)"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  disabled={isSubmitted}
                  className="h-8 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  The person legally authorized to bind the supplier to this quotation.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signature" className="text-xs font-medium">
                  E-Signature / Stamp Image
                </Label>
                {signatureUrl ? (
                  <div className="flex items-center gap-3 p-2 border rounded-md bg-muted/20">
                    <img
                      src={signatureUrl}
                      alt="Uploaded Signature"
                      className="h-7 max-w-[120px] object-contain border bg-white p-0.5 rounded"
                    />
                    <span className="text-xs text-muted-foreground">Signature Attached</span>
                    {!isSubmitted && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSignatureUrl(undefined)}
                        className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 ml-auto"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  !isSubmitted && (
                    <div>
                      <input
                        type="file"
                        ref={signatureInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleSignatureUpload(file)
                        }}
                        accept="image/png,image/jpeg"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => signatureInputRef.current?.click()}
                        className="gap-2 text-xs h-8 w-full border-dashed"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Attach Signature Image (PNG/JPEG)
                      </Button>
                    </div>
                  )
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliveryPeriod" className="text-xs font-medium">
                  Delivery Period
                </Label>
                <Input
                  id="deliveryPeriod"
                  placeholder="e.g., 7-15 Calendar Days"
                  value={deliveryPeriod}
                  onChange={(e) => setDeliveryPeriod(e.target.value)}
                  disabled={isSubmitted}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentTerms" className="text-xs font-medium">
                  Payment Terms
                </Label>
                <Input
                  id="paymentTerms"
                  placeholder="e.g., Net 30 days upon inspection"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  disabled={isSubmitted}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="warrantyTerms" className="text-xs font-medium">
                  Warranty Terms
                </Label>
                <Input
                  id="warrantyTerms"
                  placeholder="e.g., 1 Year Comprehensive Warranty"
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  disabled={isSubmitted}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs font-medium">
                  Remarks / Special Instructions
                </Label>
                <Input
                  id="remarks"
                  placeholder="Additional commercial or technical notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={isSubmitted}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Badge className="bg-green-600">SUBMITTED</Badge>
              <span className="text-sm text-green-800">
                This quotation was submitted on{' '}
                {rfq?.quotationSubmittedAt
                  ? new Date(rfq.quotationSubmittedAt).toLocaleString()
                  : '—'}
                . You cannot edit your bid after submission.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {!isSubmitted && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmitQuotation}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Quotation
                </Button>
              </>
            )}
          </div>
        </div>
      </ResponsiveDialog>

      <ItemBidSpecModal
        open={specModalOpen}
        onOpenChange={setSpecModalOpen}
        item={selectedItem}
        onSave={handleSaveBidSpec}
      />

      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              You cannot edit your bid after submission. Are you sure you want
              to submit this quotation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
