import { useState, useRef, useCallback, useMemo } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  CloudUpload,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Loader2,
  Download,
  AlertTriangle,
  Calendar,
  Banknote,
  ShieldCheck,
  Paperclip,
  Check,
  Eye,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PublicProject, SubmissionResult, RequiredDocument } from '../types/portalTypes'
import { printDocument } from '../utils/printDocument'
import {
  useSubmitPublicApplication,
  useUploadPublicFile,
  useValidatePublicApplication,
} from '../hooks/usePublicPortalApi'

interface BACApplicationFormProps {
  project: PublicProject
  onBack: () => void
  selectedBidNotices?: RequiredDocument[]
}

interface UploadedFile {
  documentId: string
  documentName: string
  file: File
}

interface ItemBidState {
  unitPrice: number | ''
  brand: string
  model: string
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const roundToCentavos = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100


export function BACApplicationForm({
  project,
  onBack,
  selectedBidNotices: _selectedBidNotices = [],
}: BACApplicationFormProps) {
  const hasItemizedItems = Boolean(project.items && project.items.length > 0)
  const isCompetitiveBidding = project.mop === 'public-bidding'
  const isItemized = project.pricingStructure === 'Itemized' || (!project.pricingStructure && hasItemizedItems)
  const isRfq = project.mop === 'svp'

  const validateMutation = useValidatePublicApplication()
  const uploadMutation = useUploadPublicFile()
  const submitMutation = useSubmitPublicApplication()

  const initialItemBids: Record<string, ItemBidState> = {}
  if (project.items) {
    project.items.forEach((item) => {
      initialItemBids[item.id] = { unitPrice: '', brand: '', model: '' }
    })
  }

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      supplierName: '',
      email: '',
      contactNumber: '',
      address: '',
      tinNumber: '',
      deliveryPeriod: project.deliveryPeriod || '',
      paymentTerms: '',
      warrantyTerms: '',
      validityPeriodDays: 60 as number | '',
      remarks: '',
      proposedBidAmount: '' as number | '',
      bidSecurityType: 'Bid Securing Declaration',
      bidSecurityAmount: '' as number | '',
      bidSecurityNumber: '',
      bidSecurityValidityDays: 120 as number | '',
      itemBids: initialItemBids,
    },
    onSubmit: async () => {
      // Submission handled via handleFormSubmit
    },
  })

  const formValues = useStore(form.store, (s) => s.values)

  // Per-item brochure / technical spec sheets
  const [itemBrochures, setItemBrochures] = useState<Record<string, File>>({})
  const itemBrochureInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Checklist document uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)

  const generateQuotationPdfBlob = async (): Promise<Blob> => {
    const payload = {
      companyName: formValues.supplierName?.trim() || 'Prospective Supplier',
      contactPerson: formValues.supplierName?.trim() || 'Authorized Representative',
      emailAddress: formValues.email?.trim() || '',
      contactNumber: formValues.contactNumber?.trim() || '',
      tinNumber: formValues.tinNumber?.trim() || '',
      businessAddress: formValues.address?.trim() || '',
      checklistItemIds: [],
      proposedBidAmount: totalQuotedBid,
      deliveryPeriod: formValues.deliveryPeriod || project.deliveryPeriod || '',
      paymentTerms: formValues.paymentTerms || '',
      warrantyTerms: formValues.warrantyTerms || '',
      validityPeriodDays: formValues.validityPeriodDays || 60,
      remarks: formValues.remarks || '',
      itemBids: (project.items || []).map((it) => ({
        rfqItemId: it.id,
        unitPrice: Number(formValues.itemBids[it.id]?.unitPrice || 0),
        brand: formValues.itemBids[it.id]?.brand || '',
        model: formValues.itemBids[it.id]?.model || '',
      })),
    }

    const response = await api.post(
      `/api/public/projects/${project.id}/generate-quotation`,
      payload,
      { responseType: 'blob' }
    )

    return new Blob([response.data], { type: 'application/pdf' })
  }

  const handleDownloadFilledQuotation = async () => {
    setIsGeneratingQuotation(true)
    try {
      const blob = await generateQuotationPdfBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeName = (formValues.supplierName || 'Quotation').replace(/[^a-zA-Z0-9_-]/g, '_')
      link.download = `RFQ_${project.referenceNo || 'Quotation'}_${safeName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Failed to generate filled quotation:', err)
    } finally {
      setIsGeneratingQuotation(false)
    }
  }

  const handlePreviewFilledQuotation = async () => {
    setIsGeneratingQuotation(true)
    try {
      const blob = await generateQuotationPdfBlob()
      const url = URL.createObjectURL(blob)
      setPreviewPdfUrl(url)
    } catch (err: any) {
      console.error('Failed to preview filled quotation:', err)
    } finally {
      setIsGeneratingQuotation(false)
    }
  }

  const requiredUploads = project.requiredDocuments

  // Calculate live total quoted bid with centavo rounding to prevent off-by-one discrepancies
  const totalQuotedBid = useMemo(() => {
    if (isItemized && project.items) {
      return roundToCentavos(
        project.items.reduce((sum, item) => {
          const price = Number(formValues.itemBids[item.id]?.unitPrice || 0)
          return sum + roundToCentavos(price * item.quantity)
        }, 0)
      )
    }
    return roundToCentavos(Number(formValues.proposedBidAmount || 0))
  }, [isItemized, project.items, formValues.itemBids, formValues.proposedBidAmount])

  // NGPA / statutory ABC compliance check with centavo precision
  const numericAbc = roundToCentavos(Number(project.approvedBudget || 0))
  const isOverAbc = numericAbc > 0 && totalQuotedBid > numericAbc
  const varianceFromAbc = numericAbc > 0 ? roundToCentavos(numericAbc - totalQuotedBid) : 0

  const isPastDeadline =
    project.deadline && !isNaN(Date.parse(project.deadline))
      ? new Date(project.deadline).getTime() < Date.now()
      : false
  const isClosedOrExpired = project.status === 'closed' || isPastDeadline

  const handleContactChange = (
    field: 'supplierName' | 'email' | 'contactNumber' | 'address' | 'tinNumber',
    value: string
  ) => {
    form.setFieldValue(field, value)
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleItemBidChange = (itemId: string, field: keyof ItemBidState, value: string | number) => {
    form.setFieldValue('itemBids', {
      ...formValues.itemBids,
      [itemId]: {
        ...(formValues.itemBids[itemId] || { unitPrice: '', brand: '', model: '' }),
        [field]: value,
      },
    })
    setErrors((prev) => ({ ...prev, [`item_${itemId}`]: '', generalBid: '' }))
  }

  const handleItemBrochureSelect = (itemId: string, file: File | null) => {
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [`brochure_${itemId}`]: `File exceeds ${MAX_SIZE_MB}MB limit` }))
      return
    }
    setErrors((prev) => ({ ...prev, [`brochure_${itemId}`]: '' }))
    setItemBrochures((prev) => ({ ...prev, [itemId]: file }))
  }

  const removeItemBrochure = (itemId: string) => {
    setItemBrochures((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    if (itemBrochureInputRefs.current[itemId]) {
      itemBrochureInputRefs.current[itemId]!.value = ''
    }
  }

  const handleFileDrop = useCallback((documentId: string, documentName: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    const acceptedExtensions = ACCEPTED_TYPES.split(',').map((s) => s.trim().replace(/^\./, '').toLowerCase())
    const fileExt = (file.name.split('.').pop() || '').toLowerCase()
    const mime = file.type || ''

    const mimeAllowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    const isAccepted =
      (fileExt && acceptedExtensions.includes(fileExt)) ||
      mimeAllowed.includes(mime) ||
      mime.startsWith('image/')

    if (!isAccepted) {
      setErrors((prev) => ({
        ...prev,
        [documentId]: `Unsupported file type. Accepted: ${ACCEPTED_TYPES.replace(/\./g, '')}`,
      }))
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [documentId]: `File exceeds ${MAX_SIZE_MB}MB limit` }))
      return
    }

    setErrors((prev) => ({ ...prev, [documentId]: '' }))
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.documentId !== documentId)
      return [...filtered, { documentId, documentName, file }]
    })
  }, [])

  const removeFile = (documentId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.documentId !== documentId))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Deadline & status check
    if (isClosedOrExpired) {
      newErrors.submit =
        'The submission deadline for this opportunity has passed. Applications are no longer being accepted.'
      setErrors(newErrors)
      return false
    }

    // Contact info validation
    if (!formValues.supplierName.trim()) newErrors.supplierName = 'Supplier name is required'
    if (!formValues.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email))
      newErrors.email = 'Valid email is required'
    if (!formValues.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required'
    if (!formValues.address.trim()) newErrors.address = 'Address is required'
    if (!formValues.tinNumber.trim()) newErrors.tinNumber = 'TIN number is required'

    // Financial bid validation
    if (isItemized && project.items) {
      let hasMissingPrice = false
      project.items.forEach((item) => {
        const price = formValues.itemBids[item.id]?.unitPrice
        if (price === '' || price === undefined || Number(price) <= 0) {
          newErrors[`item_${item.id}`] = 'Unit price is required (> ₱0.00)'
          hasMissingPrice = true
        }
      })
      if (hasMissingPrice) {
        newErrors.generalBid = 'Please enter a valid quoted unit price for all line items.'
      }
      if (!formValues.deliveryPeriod.trim()) newErrors.deliveryPeriod = 'Delivery period is required'
      if (!formValues.paymentTerms.trim()) newErrors.paymentTerms = 'Payment terms are required'
    } else {
      if (formValues.proposedBidAmount === '' || Number(formValues.proposedBidAmount) <= 0) {
        newErrors.proposedBidAmount = 'Proposed bid amount is required and must be greater than ₱0.00'
      }
      if (!formValues.deliveryPeriod.trim()) newErrors.deliveryPeriod = 'Delivery period is required'
      if (!formValues.paymentTerms.trim()) newErrors.paymentTerms = 'Payment terms are required'
    }

    if (
      isCompetitiveBidding &&
      formValues.bidSecurityType !== 'Bid Securing Declaration' &&
      (!formValues.bidSecurityAmount || Number(formValues.bidSecurityAmount) <= 0)
    ) {
      newErrors.bidSecurityAmount = 'Bid security amount is required for the selected guarantee type'
    }

    // NGPA / statutory ABC limit enforcement
    if (isOverAbc) {
      if (isItemized) {
        newErrors.generalBid = `Total quoted bid (₱${totalQuotedBid.toLocaleString(undefined, { minimumFractionDigits: 2 })}) exceeds the ABC (₱${numericAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Under the New Government Procurement Act (NGPA / RA 12009) and applicable procurement rules, bids exceeding the ABC cannot be submitted.`
      } else {
        newErrors.proposedBidAmount = `Proposed bid cannot exceed the ABC of ₱${numericAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      }
      newErrors.abcExceeded = `Your bid exceeds the Approved Budget for the Contract (₱${numericAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Under the New Government Procurement Act (NGPA / RA 12009) and applicable procurement rules, bids exceeding the ABC cannot be accepted.`
    }

    // Required checklist documents
    requiredUploads.forEach((doc) => {
      if (!uploadedFiles.find((f) => f.documentId === doc.id)) {
        newErrors[doc.id] = 'This document is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      // 0. Pre-flight check: validate on server BEFORE uploading any files to prevent storage exhaustion
      const preFlightPayload = {
        companyName: formValues.supplierName.trim(),
        contactPerson: formValues.supplierName.trim(),
        emailAddress: formValues.email.trim(),
        contactNumber: formValues.contactNumber.trim(),
        tinNumber: formValues.tinNumber.trim(),
        businessAddress: formValues.address.trim(),
        checklistItemIds: uploadedFiles.map((uf) => uf.documentId),
        proposedBidAmount: totalQuotedBid > 0 ? totalQuotedBid : undefined,
        deliveryPeriod: formValues.deliveryPeriod.trim() || undefined,
        paymentTerms: formValues.paymentTerms.trim() || undefined,
        warrantyTerms: formValues.warrantyTerms.trim() || undefined,
        validityPeriodDays: formValues.validityPeriodDays ? Number(formValues.validityPeriodDays) : undefined,
        remarks: formValues.remarks.trim() || undefined,
        bidSecurityType: isCompetitiveBidding ? formValues.bidSecurityType : undefined,
        bidSecurityAmount:
          isCompetitiveBidding && formValues.bidSecurityAmount
            ? Number(formValues.bidSecurityAmount)
            : undefined,
        bidSecurityNumber:
          isCompetitiveBidding && formValues.bidSecurityNumber
            ? formValues.bidSecurityNumber.trim()
            : undefined,
        bidSecurityValidityDays:
          isCompetitiveBidding && formValues.bidSecurityValidityDays
            ? Number(formValues.bidSecurityValidityDays)
            : undefined,
        itemBids:
          isItemized && project.items
            ? project.items.map((item) => {
                const state = formValues.itemBids[item.id]
                return {
                  rfqItemId: item.id,
                  unitPrice: roundToCentavos(Number(state?.unitPrice || 0)),
                  brand: state?.brand?.trim() || null,
                  model: state?.model?.trim() || null,
                }
              })
            : undefined,
      }

      await validateMutation.mutateAsync({
        projectId: project.id,
        payload: preFlightPayload,
      })

      // 1. Upload required checklist documents (executed ONLY after pre-flight validation succeeds)
      const uploadPromises = uploadedFiles.map(async (uf) => {
        const fileId = await uploadMutation.mutateAsync(uf.file)
        return { checklistItemId: uf.documentId, fileId }
      })
      const uploadedDocs = await Promise.all(uploadPromises)

      // 2. Upload per-item brochures if attached
      const itemBrochureFileIds: Record<string, string> = {}
      for (const [itemId, file] of Object.entries(itemBrochures)) {
        if (file) {
          const fileId = await uploadMutation.mutateAsync(file)
          itemBrochureFileIds[itemId] = fileId
        }
      }

      // 3. Prepare itemized bids if opportunity has line items
      const formattedItemBids =
        isItemized && project.items
          ? project.items.map((item) => {
              const state = formValues.itemBids[item.id]
              return {
                rfqItemId: item.id,
                unitPrice: roundToCentavos(Number(state?.unitPrice || 0)),
                brand: state?.brand?.trim() || null,
                model: state?.model?.trim() || null,
                brochureFileId: itemBrochureFileIds[item.id] || null,
              }
            })
          : undefined

      // 4. Build application payload
      const payload = {
        companyName: formValues.supplierName.trim(),
        contactPerson: formValues.supplierName.trim(),
        emailAddress: formValues.email.trim(),
        contactNumber: formValues.contactNumber.trim(),
        tinNumber: formValues.tinNumber.trim(),
        businessAddress: formValues.address.trim(),
        documents: uploadedDocs,
        proposedBidAmount: totalQuotedBid > 0 ? totalQuotedBid : undefined,
        deliveryPeriod: formValues.deliveryPeriod.trim() || undefined,
        paymentTerms: formValues.paymentTerms.trim() || undefined,
        warrantyTerms: formValues.warrantyTerms.trim() || undefined,
        validityPeriodDays: formValues.validityPeriodDays ? Number(formValues.validityPeriodDays) : undefined,
        remarks: formValues.remarks.trim() || undefined,
        bidSecurityType: isCompetitiveBidding ? formValues.bidSecurityType : undefined,
        bidSecurityAmount:
          isCompetitiveBidding && formValues.bidSecurityAmount
            ? Number(formValues.bidSecurityAmount)
            : undefined,
        bidSecurityNumber:
          isCompetitiveBidding && formValues.bidSecurityNumber
            ? formValues.bidSecurityNumber.trim()
            : undefined,
        bidSecurityValidityDays:
          isCompetitiveBidding && formValues.bidSecurityValidityDays
            ? Number(formValues.bidSecurityValidityDays)
            : undefined,
        itemBids: formattedItemBids,
      }

      const res = await submitMutation.mutateAsync({
        projectId: project.id,
        payload,
      })

      setResult({
        referenceNumber: res.referenceNumber,
        submittedAt: new Date().toISOString(),
        projectTitle: project.title,
        totalBidAmount: totalQuotedBid,
      })
    } catch (err: unknown) {
      console.error(err)
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Submission failed. Please check your inputs.')
      setErrors((prev) => ({ ...prev, submit: errorMsg }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Success screen */}
      {result ? (
        <BACSubmissionSuccess result={result} project={project} onDone={onBack} />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1a2a5e] via-[#1e3a8a] to-[#1a2a5e] text-white">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Project Details
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-xl p-2.5">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    {isRfq ? 'Submit Price Quotation' : 'Submit Bid Proposal'}
                  </h1>
                  <p className="text-blue-200 text-sm truncate max-w-lg">{project.title}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {/* 1. Supplier Contact Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Supplier Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    field: 'supplierName' as const,
                    label: 'Company / Supplier Name',
                    placeholder: 'Enter company name',
                    icon: User,
                  },
                  {
                    field: 'email' as const,
                    label: 'Email Address',
                    placeholder: 'contact@company.com',
                    icon: Mail,
                  },
                  {
                    field: 'contactNumber' as const,
                    label: 'Contact Number',
                    placeholder: '+63 9XX XXX XXXX',
                    icon: Phone,
                  },
                  {
                    field: 'tinNumber' as const,
                    label: 'TIN Number',
                    placeholder: '000-000-000-000',
                    icon: Hash,
                  },
                ].map(({ field, label, placeholder, icon: Icon }) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field} className="text-sm font-medium text-slate-700">
                      {label} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id={field}
                        placeholder={placeholder}
                        value={formValues[field]}
                        onChange={(e) => handleContactChange(field, e.target.value)}
                        className={`pl-9 ${errors[field] ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                      />
                    </div>
                    {errors[field] && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors[field]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Business Address */}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                    Business Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="address"
                      placeholder="Full business address"
                      value={formValues.address}
                      onChange={(e) => handleContactChange('address', e.target.value)}
                      className={`pl-9 ${errors.address ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Financial Bid Proposal */}
            {isItemized && project.items ? (
              /* Itemized Proposal Table (Price Schedule / BOQ / RFQ Items) */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-slate-600" />
                    <h2 className="font-semibold text-slate-800">
                      {isCompetitiveBidding
                        ? 'Financial Bid Proposal (Itemized Price Schedule / BOQ)'
                        : 'Financial Quotation Proposal (Itemized)'}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {project.items.length} {project.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Please provide your offered unit price in Philippine Pesos (PHP) and specify the offered brand/model for each item.
                    You may also attach a technical brochure or specification sheet per item to prove technical compliance.
                  </p>

                  <div className="space-y-4">
                    {project.items.map((item, idx) => {
                      const state = formValues.itemBids[item.id] || { unitPrice: '', brand: '', model: '' }
                      const unitPriceNum = Number(state.unitPrice || 0)
                      const itemTotal = roundToCentavos(unitPriceNum * item.quantity)
                      const itemBrochure = itemBrochures[item.id]
                      const itemError = errors[`item_${item.id}`]
                      const brochureError = errors[`brochure_${item.id}`]

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4.5 transition-colors ${
                            itemError
                              ? 'border-red-300 bg-red-50/30'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          {/* Item Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                            <div className="flex items-start gap-2.5">
                              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#1e3a8a] text-white text-xs font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900">{item.itemName}</h3>
                                {item.description && (
                                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 sm:self-center pl-8 sm:pl-0">
                              <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                Quantity:{' '}
                                <strong className="text-slate-800">
                                  {item.quantity} {item.uom || 'Unit'}
                                </strong>
                              </span>
                              <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                ABC Unit:{' '}
                                <strong className="text-slate-800">
                                  ₱{item.abcUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Inputs Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-3.5">
                            {/* Offered Unit Price */}
                            <div className="sm:col-span-4 space-y-1.5">
                              <Label className="text-xs font-medium text-slate-700">
                                Offered Unit Price (₱) <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                                  ₱
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={state.unitPrice}
                                  onChange={(e) =>
                                    handleItemBidChange(
                                      item.id,
                                      'unitPrice',
                                      e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className={`pl-8 ${itemError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                />
                              </div>
                              {itemError && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> {itemError}
                                </p>
                              )}
                            </div>

                            {/* Line Subtotal */}
                            <div className="sm:col-span-3 space-y-1.5">
                              <Label className="text-xs font-medium text-slate-700">Line Total Quoted</Label>
                              <div className="h-10 px-3 bg-white border border-slate-200 rounded-md flex items-center justify-between text-sm font-semibold text-slate-800">
                                <span>₱{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Brand / Model / Spec */}
                            <div className="sm:col-span-5 space-y-1.5">
                              <Label className="text-xs font-medium text-slate-700">Offered Brand / Model</Label>
                              <Input
                                placeholder="e.g., Brand X, Model Y"
                                value={state.brand || ''}
                                onChange={(e) => handleItemBidChange(item.id, 'brand', e.target.value)}
                              />
                            </div>

                            {/* Item Brochure / Spec Sheet Upload */}
                            <div className="sm:col-span-12 pt-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                  <Paperclip className="h-3.5 w-3.5" /> Technical Brochure / Spec Sheet (Optional)
                                </span>
                                {itemBrochure ? (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="truncate max-w-xs">{itemBrochure.name}</span>
                                    <span className="text-emerald-500 text-[10px]">
                                      ({formatFileSize(itemBrochure.size)})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeItemBrochure(item.id)}
                                      className="text-emerald-500 hover:text-red-500 ml-1"
                                      title="Remove brochure"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => itemBrochureInputRefs.current[item.id]?.click()}
                                      className="h-8 text-xs font-medium gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                                    >
                                      <Upload className="h-3 w-3" /> Attach Spec Sheet
                                    </Button>
                                    <input
                                      ref={(el) => {
                                        itemBrochureInputRefs.current[item.id] = el
                                      }}
                                      type="file"
                                      accept={ACCEPTED_TYPES}
                                      className="hidden"
                                      onChange={(e) =>
                                        handleItemBrochureSelect(item.id, e.target.files?.[0] || null)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                              {brochureError && (
                                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> {brochureError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {errors.generalBid && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> {errors.generalBid}
                    </p>
                  )}

                  {/* Live Total Bid & ABC Summary Banner */}
                  <div
                    className={`p-5 rounded-xl border ${
                      isOverAbc
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-blue-50/60 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                          Total Quoted Price Proposal
                        </div>
                        <div className="text-2xl font-black mt-0.5">
                          ₱{totalQuotedBid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs mt-1 flex items-center gap-2">
                          <span>
                            ABC:{' '}
                            <strong>
                              ₱{project.approvedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span>•</span>
                          {isOverAbc ? (
                            <span className="font-bold text-red-600">
                              Exceeds ABC by ₱
                              {(totalQuotedBid - project.approvedBudget).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-700">
                              Savings / Variance: ₱
                              {varianceFromAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>

                      {isOverAbc ? (
                        <div className="flex items-center gap-2 bg-red-100/80 border border-red-300 px-3 py-2 rounded-lg text-xs font-bold text-red-700">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>Statutory Ceiling Non-Compliant</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold text-emerald-800">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>Within Approved Budget</span>
                        </div>
                      )}
                    </div>

                    {!isOverAbc && totalQuotedBid > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-blue-900 leading-relaxed max-w-xl">
                          <strong>Official RFQ Quotation Document:</strong> You can download or preview your pre-filled quotation based on your entered prices. Print, sign/stamp (or digitally sign), and upload it under the checklist below.
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePreviewFilledQuotation}
                            disabled={isGeneratingQuotation}
                            className="gap-1.5 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                          >
                            {isGeneratingQuotation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                            Preview Quotation
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleDownloadFilledQuotation}
                            disabled={isGeneratingQuotation}
                            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            {isGeneratingQuotation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            Download Pre-Filled PDF
                          </Button>
                        </div>
                      </div>
                    )}

                    {isOverAbc && (
                      <div className="mt-3.5 pt-3 border-t border-red-200 text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          <strong>Statutory Ceiling Non-Compliance Alert:</strong> Under the New Government
                          Procurement Act (NGPA / RA 12009) and applicable procurement rules, any bid that
                          exceeds the Approved Budget for the Contract (ABC) shall be disqualified and cannot be
                          submitted. Please lower your quoted unit prices to remain within the ABC.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Public Bidding or Non-itemized Quotation Proposal */
              <div className="space-y-6">
                {/* For Public Bidding with items: Show Schedule of Requirements table overview */}
                {isCompetitiveBidding && project.items && project.items.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <h2 className="font-semibold text-slate-800">
                          Schedule of Requirements / Scope of Items
                        </h2>
                      </div>
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        {project.items.length} {project.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The items listed below comprise the approved Schedule of Requirements for this
                        contract. Under Philippine Bidding Documents (PBDs) for Public Bidding, your detailed
                        itemized breakdown (unit prices, taxes, and delivery/freight) must be completed using
                        the official Price Schedule form and uploaded in the{' '}
                        <strong>Second Envelope (Financial Component)</strong> below.
                      </p>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-3.5 py-2.5 w-10 text-center">#</th>
                              <th className="px-3.5 py-2.5">Item & Technical Description</th>
                              <th className="px-3.5 py-2.5 w-24 text-center">Qty</th>
                              <th className="px-3.5 py-2.5 w-32 text-right">ABC Unit Price</th>
                              <th className="px-3.5 py-2.5 w-32 text-right">ABC Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {project.items.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="px-3.5 py-2.5 text-center text-slate-400 font-medium">
                                  {idx + 1}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <span className="font-semibold text-slate-800">{item.itemName}</span>
                                  {item.description && (
                                    <span className="block text-[11px] text-slate-500 mt-0.5">
                                      {item.description}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2.5 text-center font-medium text-slate-700">
                                  {item.quantity} {item.uom || 'Unit'}
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-slate-600">
                                  ₱{item.abcUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-semibold text-slate-900">
                                  ₱
                                  {(item.abcTotalPrice || item.quantity * item.abcUnitPrice).toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 2 }
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lump-Sum Bid Proposal for Public Bidding & Non-itemized Opportunities */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-slate-600" />
                      <h2 className="font-semibold text-slate-800">
                        {isCompetitiveBidding ? 'Financial Bid Proposal' : 'Financial Quotation Proposal'}
                      </h2>
                    </div>
                    {isOverAbc ? (
                      <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Exceeds ABC (Statutory Ceiling Non-Compliant)
                      </span>
                    ) : totalQuotedBid > 0 ? (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Within Approved Budget
                      </span>
                    ) : null}
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="proposedBidAmount" className="text-sm font-medium text-slate-700">
                          {isCompetitiveBidding
                            ? 'Proposed Bid Amount (₱)'
                            : 'Proposed Quotation / Bid Amount (₱)'}{' '}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                            ₱
                          </span>
                          <Input
                            id="proposedBidAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formValues.proposedBidAmount}
                            onChange={(e) => {
                              const val =
                                e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0)
                              form.setFieldValue('proposedBidAmount', val)
                              setErrors((prev) => ({ ...prev, proposedBidAmount: '', abcExceeded: '' }))
                            }}
                            className={`pl-8 ${
                              isOverAbc
                                ? 'border-red-500 bg-red-50/20 text-red-950 focus-visible:ring-red-500'
                                : errors.proposedBidAmount
                                ? 'border-red-400 focus-visible:ring-red-400'
                                : ''
                            }`}
                          />
                        </div>
                        {isOverAbc ? (
                          <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Exceeds ABC by ₱
                            {(totalQuotedBid - numericAbc).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}{' '}
                            (Statutory Ceiling Non-Compliant)
                          </p>
                        ) : errors.proposedBidAmount ? (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.proposedBidAmount}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">
                          Approved Budget for Contract (ABC)
                        </Label>
                        <div className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-sm font-semibold text-slate-800">
                          <span>₱{numericAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-[11px] text-slate-500 font-normal">Maximum Ceiling</span>
                        </div>
                      </div>
                    </div>

                    {isOverAbc && (
                      <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                            Approved Budget for the Contract (ABC) Ceiling Alert
                          </p>
                          <p className="text-xs text-red-700 leading-relaxed">
                            Your proposed bid amount of{' '}
                            <strong>
                              ₱{totalQuotedBid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </strong>{' '}
                            exceeds the Approved Budget for the Contract (ABC) of{' '}
                            <strong>
                              ₱{numericAbc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </strong>{' '}
                            by{' '}
                            <strong className="text-red-800">
                              ₱
                              {(totalQuotedBid - numericAbc).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </strong>
                            .
                          </p>
                          <p className="text-[11px] text-red-600 font-medium">
                            Under the New Government Procurement Act (NGPA / RA 12009) and applicable procurement
                            rules, all bids that exceed the ABC are automatically rejected and cannot be submitted.
                            Form submission is disabled until the bid is within the ABC.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2b. Bid Security Information (Competitive / Public Bidding Only — NGPA / Applicable Procurement Rules) */}
            {isCompetitiveBidding && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <h2 className="font-semibold text-slate-800">Bid Security Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Bid Security Form / Type</Label>
                      <Select
                        value={formValues.bidSecurityType}
                        onValueChange={(val) => form.setFieldValue('bidSecurityType', val)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Bid Security" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bid Securing Declaration">
                            Bid Securing Declaration (GPPB Prescribed)
                          </SelectItem>
                          <SelectItem value="Cash or Manager's Check">
                            Cash or Cashier's / Manager's Check (2% of ABC)
                          </SelectItem>
                          <SelectItem value="Bank Guarantee">
                            Bank Guarantee / Irrevocable LC (2% of ABC)
                          </SelectItem>
                          <SelectItem value="Surety Bond">Surety Bond Callable on Demand (5% of ABC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formValues.bidSecurityType !== 'Bid Securing Declaration' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">
                          Bid Security Amount (₱) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formValues.bidSecurityAmount}
                          onChange={(e) =>
                            form.setFieldValue(
                              'bidSecurityAmount',
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          className={errors.bidSecurityAmount ? 'border-red-400' : ''}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">
                        Security Number / Reference (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., BSD-2026-001 or Guarantee No."
                        value={formValues.bidSecurityNumber}
                        onChange={(e) => form.setFieldValue('bidSecurityNumber', e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Validity Period (Calendar Days)</Label>
                      <Input
                        type="number"
                        placeholder="120"
                        value={formValues.bidSecurityValidityDays}
                        onChange={(e) =>
                          form.setFieldValue(
                            'bidSecurityValidityDays',
                            e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Commercial & Delivery Terms */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Commercial Terms & Warranty</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryPeriod" className="text-sm font-medium text-slate-700">
                    Delivery Period <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deliveryPeriod"
                    placeholder="e.g., 15-30 Calendar Days upon receipt of PO/NTP"
                    value={formValues.deliveryPeriod}
                    onChange={(e) => {
                      form.setFieldValue('deliveryPeriod', e.target.value)
                      setErrors((prev) => ({ ...prev, deliveryPeriod: '' }))
                    }}
                    className={errors.deliveryPeriod ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.deliveryPeriod && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.deliveryPeriod}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentTerms" className="text-sm font-medium text-slate-700">
                    Payment Terms <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., Net 30 Days / Upon Complete Delivery & Acceptance"
                    value={formValues.paymentTerms}
                    onChange={(e) => {
                      form.setFieldValue('paymentTerms', e.target.value)
                      setErrors((prev) => ({ ...prev, paymentTerms: '' }))
                    }}
                    className={errors.paymentTerms ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.paymentTerms && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.paymentTerms}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="warrantyTerms" className="text-sm font-medium text-slate-700">
                    Warranty Terms (Optional)
                  </Label>
                  <Input
                    id="warrantyTerms"
                    placeholder="e.g., 1 Year Comprehensive Warranty on Parts & Labor"
                    value={formValues.warrantyTerms}
                    onChange={(e) => form.setFieldValue('warrantyTerms', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="validityPeriodDays" className="text-sm font-medium text-slate-700">
                    Price Validity (Calendar Days)
                  </Label>
                  <Input
                    id="validityPeriodDays"
                    type="number"
                    placeholder="60"
                    value={formValues.validityPeriodDays}
                    onChange={(e) =>
                      form.setFieldValue(
                        'validityPeriodDays',
                        e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="remarks" className="text-sm font-medium text-slate-700">
                    Additional Remarks / Compliance Statement (Optional)
                  </Label>
                  <Textarea
                    id="remarks"
                    placeholder="Provide any additional specifications, clarifications, or remarks for the Bids and Awards Committee"
                    value={formValues.remarks}
                    onChange={(e) => form.setFieldValue('remarks', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 4. Required Documents Checklist */}
            {requiredUploads.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Required Eligibility & Compliance Documents</h2>
                  <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    {uploadedFiles.length}/{requiredUploads.length} uploaded
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500">
                    Accepted formats: PDF, Word, Excel, or image files. Maximum {MAX_SIZE_MB}MB per file.
                  </p>
                  {requiredUploads.map((doc) => {
                    const uploaded = uploadedFiles.find((f) => f.documentId === doc.id)
                    const isDragOver = dragOverId === doc.id
                    return (
                      <div key={doc.id} className="space-y-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            {uploaded ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-slate-800">{doc.name}</span>
                                {project.mop === 'public-bidding' && (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                      doc.envelopeType === 2
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    {doc.envelopeType === 2
                                      ? 'Second Envelope — Financial'
                                      : 'First Envelope — Eligibility & Technical'}
                                  </span>
                                )}
                              </div>
                              {doc.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Download Buttons: Display ONLY on Price Quotation; remove from Mayor's permit, PhilGEPS, and OSS */}
                          {(() => {
                            const lowerName = doc.name.toLowerCase()
                            const isQuotationDoc =
                              (lowerName.includes('quotation') ||
                               lowerName.includes('rfq') ||
                               lowerName.includes('price proposal') ||
                               lowerName.includes('financial') ||
                               lowerName.includes('bid form')) &&
                              !lowerName.includes('permit') &&
                              !lowerName.includes('philgeps') &&
                              !lowerName.includes('omnibus') &&
                              !lowerName.includes('sworn statement') &&
                              !lowerName.includes('oss')

                            if (!isQuotationDoc) return null

                            return (
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Pre-Filled PDF Button (when quotation item and prices entered) */}
                                {totalQuotedBid > 0 && !isOverAbc && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadFilledQuotation()
                                    }}
                                    disabled={isGeneratingQuotation}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                                    title="Download RFQ quotation pre-filled with your entered prices and details"
                                  >
                                    {isGeneratingQuotation ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Download className="h-3.5 w-3.5" />
                                    )}
                                    Download Pre-Filled PDF
                                  </button>
                                )}

                                {/* Download Blank Template Button */}
                                {(doc.downloadUrl || doc.viewerDocId) &&
                                  (doc.viewerDocId ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        printDocument(doc.viewerDocId!)
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      Download Template
                                    </button>
                                  ) : (
                                    <a
                                      href={doc.downloadUrl ?? '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      Download Template
                                    </a>
                                  ))}
                              </div>
                            )
                          })()}
                        </div>

                        {/* Upload Slot */}
                        {uploaded ? (
                          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="text-sm text-emerald-700 font-medium truncate">
                                {uploaded.file.name}
                              </span>
                              <span className="text-xs text-emerald-500 shrink-0">
                                ({formatFileSize(uploaded.file.size)})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(doc.id)}
                              className="text-emerald-400 hover:text-red-500 transition-colors shrink-0"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              setDragOverId(doc.id)
                            }}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setDragOverId(null)
                              handleFileDrop(doc.id, doc.name, e.dataTransfer.files)
                            }}
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                              isDragOver
                                ? 'border-blue-400 bg-blue-50'
                                : errors[doc.id]
                                ? 'border-red-300 bg-red-50 hover:border-red-400'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <CloudUpload
                              className={`h-7 w-7 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`}
                            />
                            <p className="text-sm font-medium text-slate-600">
                              {isDragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              PDF, Word, Excel, Images up to {MAX_SIZE_MB}MB
                            </p>
                            <input
                              ref={(el) => {
                                fileInputRefs.current[doc.id] = el
                              }}
                              type="file"
                              accept={ACCEPTED_TYPES}
                              className="hidden"
                              onChange={(e) => handleFileDrop(doc.id, doc.name, e.target.files)}
                            />
                          </div>
                        )}

                        {errors[doc.id] && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors[doc.id]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error banner if submission failed */}
            {errors.submit && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Submit Action Bar */}
            <div
              className={`flex items-center justify-between gap-4 rounded-2xl border shadow-sm p-6 flex-wrap transition-colors ${
                isClosedOrExpired || isOverAbc ? 'bg-red-50/60 border-red-300' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1 max-w-lg">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  {(isClosedOrExpired || isOverAbc) && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {isClosedOrExpired
                    ? 'Submissions Closed'
                    : isOverAbc
                    ? 'Submission Blocked (Exceeds ABC Ceiling)'
                    : 'Ready to submit?'}
                </p>
                <p
                  className={`text-xs ${
                    isClosedOrExpired || isOverAbc ? 'text-red-700 font-medium leading-relaxed' : 'text-slate-500'
                  }`}
                >
                  {isClosedOrExpired
                    ? 'The submission deadline for this project has passed. Applications are no longer being accepted.'
                    : isOverAbc
                    ? `Your quoted bid of ₱${totalQuotedBid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })} exceeds the ABC of ₱${numericAbc.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}. Under the New Government Procurement Act (NGPA / RA 12009) and applicable rules, bids exceeding the ABC cannot be accepted. Please adjust your bid before submitting.`
                    : 'Ensure all item prices and required documents are complete. Submissions cannot be modified after sending.'}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleFormSubmit}
                disabled={isSubmitting || isOverAbc || isClosedOrExpired}
                className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-semibold gap-2 min-w-[170px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> {isRfq ? 'Submit Quotation' : 'Submit Application'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} University of Science and Technology of Southern Philippines — BAC
              Secretariat
            </p>
          </div>
        </>
      )}

      {/* Quotation PDF Preview Dialog */}
      <Dialog open={!!previewPdfUrl} onOpenChange={(open) => !open && setPreviewPdfUrl(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-4">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <DialogTitle className="text-base font-bold text-slate-800">
                Official RFQ Quotation Preview
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your pre-filled quotation before printing/signing and uploading.
              </p>
            </div>
            {previewPdfUrl && (
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = previewPdfUrl
                  const safeName = (formValues.supplierName || 'Quotation').replace(/[^a-zA-Z0-9_-]/g, '_')
                  link.download = `RFQ_${project.referenceNo || 'Quotation'}_${safeName}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mt-2">
            {previewPdfUrl && (
              <iframe
                src={`${previewPdfUrl}#toolbar=1&navpanes=0`}
                title="Quotation Preview"
                className="w-full h-full border-0"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* Local BACSubmissionSuccess component */
function BACSubmissionSuccess({
  result,
  project,
  onDone,
}: {
  result: SubmissionResult
  project: PublicProject
  onDone: () => void
}) {
  const submittedAt = result.submittedAt ? new Date(result.submittedAt).toLocaleString() : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Application Submitted</h3>
        <p className="text-sm text-slate-500 mb-4">
          Your proposal has been successfully registered with the BAC Secretariat.
        </p>

        <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4 space-y-3">
          <div>
            <p className="text-xs text-slate-500">Reference Number</p>
            <p className="font-semibold text-slate-800 font-mono text-sm truncate">{result.referenceNumber}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Project Title</p>
            <p className="text-sm text-slate-700 truncate">{project.title}</p>
          </div>

          {result.totalBidAmount !== undefined && result.totalBidAmount > 0 && (
            <div>
              <p className="text-xs text-slate-500">Total Quoted Bid</p>
              <p className="text-sm font-bold text-emerald-700">
                ₱{result.totalBidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500">Submitted At</p>
            <p className="text-sm text-slate-700">{submittedAt}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onDone} className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
