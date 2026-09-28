import { useState, useEffect, useRef, useMemo } from 'react'
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
import {
  Pencil,
  Save,
  Upload,
  FileText,
  X,
  Send,
  Loader2,
  Download,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  ChevronDown,
  Layers,
  ListFilter,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import api from '@/services/api'

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function getMonthIndexForItem(it: any, _idx: number): number | null {
  const monthNamesLower = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  const shortMonthNamesLower = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

  const parseMonthVal = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null
    if (typeof val === 'number') {
      if (val >= 0 && val <= 11) return val
      if (val >= 1 && val <= 12) return val - 1
      return null
    }
    const str = String(val).trim().toLowerCase()
    const fullIdx = monthNamesLower.indexOf(str)
    if (fullIdx !== -1) return fullIdx
    const shortIdx = shortMonthNamesLower.indexOf(str)
    if (shortIdx !== -1) return shortIdx

    const num = parseInt(str, 10)
    if (!isNaN(num)) {
      if (num >= 0 && num <= 11) return num
      if (num >= 1 && num <= 12) return num - 1
    }

    const parts = str.split('-')
    if (parts.length === 2) {
      const mn = parseInt(parts[1], 10)
      if (!isNaN(mn) && mn >= 1 && mn <= 12) return mn - 1
    }

    const mMatch = str.match(/-m(\d{2})/)
    if (mMatch && mMatch[1]) {
      const mn = parseInt(mMatch[1], 10)
      if (!isNaN(mn) && mn >= 1 && mn <= 12) return mn - 1
    }

    return null
  }

  // 1. Check monthlyAllocations
  if (it.monthlyAllocations && it.monthlyAllocations.length > 0) {
    for (const alloc of it.monthlyAllocations) {
      const parsed = parseMonthVal(alloc.month)
      if (parsed !== null) return parsed
    }
  }

  // 2. Check explicit month or requestedMonth
  if (it.month !== undefined && it.month !== null) {
    const parsed = parseMonthVal(it.month)
    if (parsed !== null) return parsed
  }
  if (it.requestedMonth !== undefined && it.requestedMonth !== null) {
    const parsed = parseMonthVal(it.requestedMonth)
    if (parsed !== null) return parsed
  }

  // 3. Try PR ID like CPR-2026-M02
  if (it.prId) {
    const parsed = parseMonthVal(it.prId)
    if (parsed !== null) return parsed
  }

  return null
}

export function getMonthNameForItem(it: any, idx: number): string {
  const mIndex = getMonthIndexForItem(it, idx)
  return mIndex !== null ? MONTH_NAMES[mIndex] : 'Unspecified'
}

export interface GroupedRFQItem {
  groupKey: string
  itemName: string
  unit: string
  unitPrice: number // Unit ABC
  totalQuantity: number
  totalABCAmount: number
  bidUnitPrice: number
  bidTotalAmount: number
  bidBrand?: string
  bidModel?: string
  bidColor?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
  itemIds: string[]
  subItems: RFQItem[]
}

async function uploadAttachedFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response.data?.succeeded && response.data.data) {
      return `/files/download/${response.data.data}`
    }
  } catch {
    const response = await api.post<{ succeeded: boolean; data: string }>('/files/public/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response.data?.succeeded && response.data.data) {
      return `/files/download/${response.data.data}`
    }
  }
  return URL.createObjectURL(file)
}

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
  itemName: string
  initialModel?: string
  initialBrand?: string
  initialColor?: string
  onSave: (model: string, brand: string, color: string) => void
}

function ItemBidSpecModal({
  open,
  onOpenChange,
  itemName,
  initialModel = '',
  initialBrand = '',
  initialColor = '',
  onSave,
}: ItemBidSpecModalProps) {
  const [model, setModel] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (open) {
      setModel(initialModel || '')
      setBrand(initialBrand || '')
      setColor(initialColor || '')
    }
  }, [open, initialModel, initialBrand, initialColor])

  const handleSave = () => {
    onSave(model, brand, color)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Item Bid Specification</DialogTitle>
          <DialogDescription>
            Enter the specifications for {itemName || 'Item'}
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
  const [viewMode, setViewMode] = useState<'consolidated' | 'per-item'>('consolidated')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [specModalOpen, setSpecModalOpen] = useState(false)
  const [specTarget, setSpecTarget] = useState<
    | { type: 'group'; group: GroupedRFQItem }
    | { type: 'item'; item: RFQItem }
    | null
  >(null)
  const [uploadingBrochureKeys, setUploadingBrochureKeys] = useState<{ [key: string]: boolean }>({})
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
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const [isUploadingManualDoc, setIsUploadingManualDoc] = useState(false)

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

  // Resilient fallback: Query saved bid details directly from API if supplierId is present
  useEffect(() => {
    let isMounted = true
    if (open && rfqId && supplierId) {
      api
        .get<{ data: any }>(
          `/api/supplier/rfqs/${rfqId}/my-bid?supplierId=${supplierId}`,
          { skipToast: true } as any,
        )
        .then((res) => {
          const bidData = res.data?.data
          if (bidData && isMounted) {
            if (bidData.signatoryName) setSignatoryName(bidData.signatoryName)
            if (bidData.signatureUrl) setSignatureUrl(bidData.signatureUrl)
            if (bidData.quotationDocumentUrl) {
              setQuotationDocumentUrl(bidData.quotationDocumentUrl)
              setQuotationDocumentName(
                bidData.quotationDocumentName || 'Uploaded_RFQ_Quotation.pdf',
              )
            }
            if (bidData.deliveryPeriod) setDeliveryPeriod(bidData.deliveryPeriod)
            if (bidData.paymentTerms) setPaymentTerms(bidData.paymentTerms)
            if (bidData.warrantyTerms) setWarrantyTerms(bidData.warrantyTerms)
            if (bidData.remarks) setRemarks(bidData.remarks)
            if (bidData.submissionType) {
              setSubmissionType(
                bidData.submissionType === 'Manual' ? 'Manual' : 'Electronic',
              )
            }
          }
        })
        .catch(() => {})
    }
    return () => {
      isMounted = false
    }
  }, [open, rfqId, supplierId])

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

  // Month-filtered items
  const filteredItems = useMemo(() => {
    if (selectedMonth === 'all') return items
    const targetMonthIdx = parseInt(selectedMonth, 10) - 1
    return items.filter((it, idx) => {
      const mi = getMonthIndexForItem(it, idx)
      return mi === targetMonthIdx
    })
  }, [items, selectedMonth])

  // Count allocations per month for the dropdown
  const monthItemCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    items.forEach((it, idx) => {
      const mi = getMonthIndexForItem(it, idx)
      if (mi !== null) {
        counts[mi] = (counts[mi] || 0) + 1
      }
    })
    return counts
  }, [items])

  // Group items by unique catalog key (name + unit ABC + unit of measure)
  // based on the currently filtered items.
  const groupedItems = useMemo<GroupedRFQItem[]>(() => {
    const groups: { [key: string]: GroupedRFQItem } = {}
    const order: string[] = []

    for (const item of filteredItems) {
      const normalizedName = (item.itemName || '').trim().toLowerCase()
      const normalizedUnit = (item.unit || (item as any).unitOfMeasure || 'pcs').trim().toLowerCase()
      const unitABC = Number(item.unitPrice || 0)
      const groupKey = `${normalizedName}___${unitABC}___${normalizedUnit}`

      if (!groups[groupKey]) {
        groups[groupKey] = {
          groupKey,
          itemName: item.itemName,
          unit: item.unit || (item as any).unitOfMeasure || 'pcs',
          unitPrice: unitABC,
          totalQuantity: 0,
          totalABCAmount: 0,
          bidUnitPrice: item.bidUnitPrice || 0,
          bidTotalAmount: 0,
          bidBrand: item.bidBrand,
          bidModel: item.bidModel,
          bidColor: item.bidColor,
          bidBrochureUrl: item.bidBrochureUrl,
          bidBrochureFileName: item.bidBrochureFileName,
          itemIds: [],
          subItems: [],
        }
        order.push(groupKey)
      }

      const group = groups[groupKey]
      const qty = item.quantity || 1
      group.totalQuantity += qty
      group.totalABCAmount += unitABC * qty
      group.itemIds.push(item.id)
      group.subItems.push(item)

      // Sync non-empty bid details if group doesn't have it yet
      if ((item.bidUnitPrice || 0) > 0 && !group.bidUnitPrice) {
        group.bidUnitPrice = item.bidUnitPrice || 0
      }
      if (item.bidBrand && !group.bidBrand) group.bidBrand = item.bidBrand
      if (item.bidModel && !group.bidModel) group.bidModel = item.bidModel
      if (item.bidColor && !group.bidColor) group.bidColor = item.bidColor
      if (item.bidBrochureUrl && !group.bidBrochureUrl) {
        group.bidBrochureUrl = item.bidBrochureUrl
        group.bidBrochureFileName = item.bidBrochureFileName
      }
    }

    return order.map((key) => {
      const group = groups[key]
      group.bidTotalAmount = (group.bidUnitPrice || 0) * group.totalQuantity
      return group
    })
  }, [filteredItems])

  const handleOpenGroupSpec = (group: GroupedRFQItem) => {
    if (isSubmitted) {
      toast({
        title: 'Cannot edit',
        description: 'You cannot edit your bid after submission.',
      })
      return
    }
    setSpecTarget({ type: 'group', group })
    setSpecModalOpen(true)
  }

  const handleOpenItemSpec = (item: RFQItem) => {
    if (isSubmitted) {
      toast({
        title: 'Cannot edit',
        description: 'You cannot edit your bid after submission.',
      })
      return
    }
    setSpecTarget({ type: 'item', item })
    setSpecModalOpen(true)
  }

  const handleSaveBidSpec = (
    model: string,
    brand: string,
    color: string,
  ) => {
    if (!specTarget) return
    if (specTarget.type === 'group') {
      const idSet = new Set(specTarget.group.itemIds)
      setItems((prevItems) =>
        prevItems.map((item) =>
          idSet.has(item.id)
            ? { ...item, bidModel: model, bidBrand: brand, bidColor: color }
            : item,
        ),
      )
      toast({
        title: 'Specification saved',
        description: `Item bid specification updated for ${specTarget.group.itemName}.`,
      })
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === specTarget.item.id
            ? { ...item, bidModel: model, bidBrand: brand, bidColor: color }
            : item,
        ),
      )
      toast({
        title: 'Specification saved',
        description: `Item bid specification updated for ${specTarget.item.itemName}.`,
      })
    }
  }

  const handleGroupUnitBidChange = (group: GroupedRFQItem, value: string) => {
    const unitBid = parseFloat(value) || 0
    const idSet = new Set(group.itemIds)
    setItems((prevItems) =>
      prevItems.map((item) =>
        idSet.has(item.id)
          ? {
              ...item,
              bidUnitPrice: unitBid,
              bidTotalAmount: unitBid * (item.quantity || 1),
            }
          : item,
      ),
    )
  }

  const handleItemUnitBidChange = (itemId: string, value: string) => {
    const unitBid = parseFloat(value) || 0
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              bidUnitPrice: unitBid,
              bidTotalAmount: unitBid * (item.quantity || 1),
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

  const handleGroupBrochureUpload = async (group: GroupedRFQItem, file: File) => {
    const prev = group.bidBrochureUrl
    if (
      prev &&
      prev.startsWith('blob:') &&
      createdObjectUrlsRef.current[group.groupKey] === prev
    ) {
      try {
        URL.revokeObjectURL(prev)
      } catch {}
      delete createdObjectUrlsRef.current[group.groupKey]
    }

    setUploadingBrochureKeys((prevMap) => ({ ...prevMap, [group.groupKey]: true }))
    try {
      const fileUrl = await uploadAttachedFile(file)
      const idSet = new Set(group.itemIds)
      setItems((prevItems) =>
        prevItems.map((item) =>
          idSet.has(item.id)
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
        description: `File "${file.name}" uploaded for ${group.itemName}.`,
      })
    } catch {
      const fileUrl = URL.createObjectURL(file)
      createdObjectUrlsRef.current[group.groupKey] = fileUrl
      const idSet = new Set(group.itemIds)
      setItems((prevItems) =>
        prevItems.map((item) =>
          idSet.has(item.id)
            ? {
                ...item,
                bidBrochureUrl: fileUrl,
                bidBrochureFileName: file.name,
              }
            : item,
        ),
      )
      toast({
        title: 'Brochure attached (Local Preview)',
        description: `File "${file.name}" attached.`,
      })
    } finally {
      setUploadingBrochureKeys((prevMap) => ({ ...prevMap, [group.groupKey]: false }))
    }
  }

  const handleRemoveGroupBrochure = (group: GroupedRFQItem) => {
    const idSet = new Set(group.itemIds)
    setItems((prevItems) =>
      prevItems.map((item) =>
        idSet.has(item.id)
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
      description: `Brochure removed for ${group.itemName}.`,
    })
  }

  const handleItemBrochureUpload = async (item: RFQItem, file: File) => {
    const prev = item.bidBrochureUrl
    if (
      prev &&
      prev.startsWith('blob:') &&
      createdObjectUrlsRef.current[item.id] === prev
    ) {
      try {
        URL.revokeObjectURL(prev)
      } catch {}
      delete createdObjectUrlsRef.current[item.id]
    }

    setUploadingBrochureKeys((prevMap) => ({ ...prevMap, [item.id]: true }))
    try {
      const fileUrl = await uploadAttachedFile(file)
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                bidBrochureUrl: fileUrl,
                bidBrochureFileName: file.name,
              }
            : i,
        ),
      )
      toast({
        title: 'Brochure uploaded',
        description: `File "${file.name}" uploaded.`,
      })
    } catch {
      const fileUrl = URL.createObjectURL(file)
      createdObjectUrlsRef.current[item.id] = fileUrl
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                bidBrochureUrl: fileUrl,
                bidBrochureFileName: file.name,
              }
            : i,
        ),
      )
      toast({
        title: 'Brochure attached (Local Preview)',
        description: `File "${file.name}" attached.`,
      })
    } finally {
      setUploadingBrochureKeys((prevMap) => ({ ...prevMap, [item.id]: false }))
    }
  }

  const handleRemoveItemBrochure = (itemId: string) => {
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.id === itemId
          ? {
              ...i,
              bidBrochureUrl: undefined,
              bidBrochureFileName: undefined,
            }
          : i,
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

  const handleManualDocumentUpload = async (file: File) => {
    setIsUploadingManualDoc(true)
    try {
      const url = await uploadAttachedFile(file)
      setQuotationDocumentUrl(url)
      setQuotationDocumentName(file.name)
      toast({
        title: 'Manual RFQ Document Attached',
        description: `File "${file.name}" attached successfully.`,
      })
    } catch {
      const url = URL.createObjectURL(file)
      setQuotationDocumentUrl(url)
      setQuotationDocumentName(file.name)
      toast({
        title: 'Manual RFQ Document Attached (Local Preview)',
        description: `File "${file.name}" attached.`,
      })
    } finally {
      setIsUploadingManualDoc(false)
    }
  }

  const handleSignatureUpload = async (file: File) => {
    setIsUploadingSignature(true)
    try {
      const url = await uploadAttachedFile(file)
      setSignatureUrl(url)
      toast({
        title: 'E-Signature Attached',
        description: `Signature image uploaded successfully.`,
      })
    } catch {
      const url = URL.createObjectURL(file)
      setSignatureUrl(url)
      toast({
        title: 'E-Signature Attached (Local Preview)',
        description: `Signature image attached.`,
      })
    } finally {
      setIsUploadingSignature(false)
    }
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

  const filteredABCAmount = filteredItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0,
  )
  const filteredBidAmount = filteredItems.reduce(
    (sum, item) => sum + (item.bidTotalAmount || 0),
    0,
  )

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
                      disabled={isUploadingManualDoc}
                      className="gap-2 text-xs h-8 border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                    >
                      {isUploadingManualDoc ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {isUploadingManualDoc ? 'Uploading Document...' : 'Select Scanned RFQ File (PDF / Images)'}
                    </Button>
                  </div>
                )
              )}
            </div>
          )}

          {/* View Controls: Consolidated vs Per-Item & Schedule Month Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/20 border rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                View Mode:
              </span>
              <div className="inline-flex rounded-lg border bg-background p-0.5 shadow-2xs">
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'consolidated' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3 gap-1.5"
                  onClick={() => setViewMode('consolidated')}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Consolidated View
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'per-item' ? 'default' : 'ghost'}
                  className="text-xs h-7 px-3 gap-1.5"
                  onClick={() => setViewMode('per-item')}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  Per-Item / Schedule View
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Filter Month:
              </span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] h-7 text-xs bg-background">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Delivery Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Months ({items.length} lines)
                  </SelectItem>
                  {MONTH_NAMES.map((m, mi) => {
                    const count = monthItemCounts[mi] || 0
                    return (
                      <SelectItem key={m} value={`${mi + 1}`} className="text-xs">
                        {m} {count > 0 ? `(${count})` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {selectedMonth !== 'all' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMonth('all')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Contextual Notice */}
          {viewMode === 'consolidated' ? (
            groupedItems.length < filteredItems.length && (
              <div className="flex items-center justify-between text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-200/80 px-3.5 py-2.5 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-300 bg-indigo-100/70 text-indigo-800 text-[10px] font-semibold">
                    Consolidated View Active
                  </Badge>
                  <span>
                    Identical items across multiple delivery schedules have been consolidated into single bidding rows. Your unit bid and specifications are automatically applied to all allocations.
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap ml-2 text-indigo-900">
                  {groupedItems.length} distinct item{groupedItems.length === 1 ? '' : 's'} ({filteredItems.length} allocation{filteredItems.length === 1 ? '' : 's'})
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-100/80 border border-slate-200 px-3.5 py-2 rounded-md">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-300 bg-white text-slate-800 text-[10px] font-semibold">
                  Per-Item Schedule View
                </Badge>
                <span>
                  Showing individual PR and delivery schedule allocations. You can set bids and specifications individually, or switch to Consolidated View to apply across identical items.
                </span>
              </div>
              <span className="font-semibold whitespace-nowrap ml-2 text-slate-800">
                {filteredItems.length} item line{filteredItems.length === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-md border overflow-x-auto">
            {viewMode === 'consolidated' ? (
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
                  {groupedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        No procurement items found for {selectedMonth !== 'all' ? MONTH_NAMES[parseInt(selectedMonth, 10) - 1] : 'this selection'}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupedItems.map((group) => {
                      const isItemOverBudget = Boolean(
                        group.bidUnitPrice &&
                          group.unitPrice &&
                          group.bidUnitPrice > group.unitPrice,
                      )
                      const isUploadingBrochure = Boolean(uploadingBrochureKeys[group.groupKey])

                      const allocationBreakdown = group.subItems
                        .map((s: any, sIdx: number) => {
                          const month = getMonthNameForItem(s, sIdx)
                          return `${month}: ${s.quantity}`
                        })
                        .join(' • ')

                      return (
                        <TableRow key={group.groupKey}>
                          <TableCell className="font-medium">
                            <div>
                              <span className="font-semibold text-slate-900">{group.itemName}</span>
                              {group.subItems.length > 1 && (
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-normal border-indigo-200 bg-indigo-50/80 text-indigo-700 py-0"
                                  >
                                    Consolidated ({group.subItems.length} allocations)
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {allocationBreakdown}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-bold text-slate-800 text-sm">
                              {group.totalQuantity}
                            </div>
                            {group.subItems.length > 1 && (
                              <div
                                className="text-[10px] text-muted-foreground whitespace-nowrap font-mono mt-0.5"
                                title={`Allocations: ${allocationBreakdown}`}
                              >
                                {group.subItems.map((s) => s.quantity).join(' + ')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">{group.unit}</TableCell>
                          <TableCell>
                            {group.bidModel || group.bidBrand || group.bidColor ? (
                              <div className="text-xs space-y-0.5">
                                {group.bidModel && (
                                  <div>
                                    <span className="text-muted-foreground">Model:</span> {group.bidModel}
                                  </div>
                                )}
                                {group.bidBrand && (
                                  <div>
                                    <span className="text-muted-foreground">Brand:</span> {group.bidBrand}
                                  </div>
                                )}
                                {group.bidColor && (
                                  <div>
                                    <span className="text-muted-foreground">Color:</span> {group.bidColor}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">
                                Not specified
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-700 whitespace-nowrap">
                            ₱
                            {(group.unitPrice || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={group.bidUnitPrice || ''}
                                onChange={(e) =>
                                  handleGroupUnitBidChange(group, e.target.value)
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
                            {(group.bidTotalAmount || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            {group.bidBrochureUrl ? (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                <a
                                  href={group.bidBrochureUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline max-w-[120px] truncate block"
                                  title={group.bidBrochureFileName || 'Brochure'}
                                >
                                  {group.bidBrochureFileName || 'View Brochure'}
                                </a>
                                {!isSubmitted && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveGroupBrochure(group)}
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
                                      ref={(el) => {
                                        fileInputRefs.current[group.groupKey] = el
                                      }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file)
                                          handleGroupBrochureUpload(group, file)
                                      }}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUploadingBrochure}
                                      onClick={() =>
                                        fileInputRefs.current[group.groupKey]?.click()
                                      }
                                      className="gap-1.5 text-xs h-8"
                                    >
                                      {isUploadingBrochure ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Upload className="h-3.5 w-3.5" />
                                      )}
                                      {isUploadingBrochure ? 'Uploading...' : 'Upload'}
                                    </Button>
                                  </>
                                )}
                                {isSubmitted && (
                                  <span className="text-muted-foreground text-xs">
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
                                onClick={() => handleOpenGroupSpec(group)}
                                className="gap-1.5 text-xs h-8"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Specification
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead className="whitespace-nowrap">Schedule Month</TableHead>
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
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        No procurement items found for {selectedMonth !== 'all' ? MONTH_NAMES[parseInt(selectedMonth, 10) - 1] : 'this selection'}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const isItemOverBudget = Boolean(
                        item.bidUnitPrice &&
                          item.unitPrice &&
                          item.bidUnitPrice > item.unitPrice,
                      )
                      const isUploadingBrochure = Boolean(uploadingBrochureKeys[item.id])
                      const monthName = getMonthNameForItem(item, idx)

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>
                              <span className="font-semibold text-slate-900">{item.itemName}</span>
                              {item.prId && (
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  Ref: {item.prId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary" className="text-xs bg-slate-100 font-medium">
                              {monthName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-800 text-sm">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">{item.unit || (item as any).unitOfMeasure || 'pcs'}</TableCell>
                          <TableCell>
                            {item.bidModel || item.bidBrand || item.bidColor ? (
                              <div className="text-xs space-y-0.5">
                                {item.bidModel && (
                                  <div>
                                    <span className="text-muted-foreground">Model:</span> {item.bidModel}
                                  </div>
                                )}
                                {item.bidBrand && (
                                  <div>
                                    <span className="text-muted-foreground">Brand:</span> {item.bidBrand}
                                  </div>
                                )}
                                {item.bidColor && (
                                  <div>
                                    <span className="text-muted-foreground">Color:</span> {item.bidColor}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">
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
                                  handleItemUnitBidChange(item.id, e.target.value)
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
                                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                <a
                                  href={item.bidBrochureUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline max-w-[120px] truncate block"
                                  title={item.bidBrochureFileName || 'Brochure'}
                                >
                                  {item.bidBrochureFileName || 'View Brochure'}
                                </a>
                                {!isSubmitted && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItemBrochure(item.id)}
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
                                      ref={(el) => {
                                        fileInputRefs.current[item.id] = el
                                      }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file)
                                          handleItemBrochureUpload(item, file)
                                      }}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUploadingBrochure}
                                      onClick={() =>
                                        fileInputRefs.current[item.id]?.click()
                                      }
                                      className="gap-1.5 text-xs h-8"
                                    >
                                      {isUploadingBrochure ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Upload className="h-3.5 w-3.5" />
                                      )}
                                      {isUploadingBrochure ? 'Uploading...' : 'Upload'}
                                    </Button>
                                  </>
                                )}
                                {isSubmitted && (
                                  <span className="text-muted-foreground text-xs">
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
                                onClick={() => handleOpenItemSpec(item)}
                                className="gap-1.5 text-xs h-8"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Specification
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-50 border rounded-lg">
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
              {selectedMonth !== 'all' && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  (Filtered Month ABC: ₱{filteredABCAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              )}
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
              {selectedMonth !== 'all' && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  (Filtered Month Bid: ₱{filteredBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              )}
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
                        disabled={isUploadingSignature}
                        className="gap-2 text-xs h-8 w-full border-dashed"
                      >
                        {isUploadingSignature ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        {isUploadingSignature ? 'Uploading Signature...' : 'Attach Signature Image (PNG/JPEG)'}
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
        itemName={
          specTarget?.type === 'group'
            ? specTarget.group.itemName
            : specTarget?.item.itemName || 'Item'
        }
        initialModel={
          specTarget?.type === 'group'
            ? specTarget.group.bidModel
            : specTarget?.item.bidModel
        }
        initialBrand={
          specTarget?.type === 'group'
            ? specTarget.group.bidBrand
            : specTarget?.item.bidBrand
        }
        initialColor={
          specTarget?.type === 'group'
            ? specTarget.group.bidColor
            : specTarget?.item.bidColor
        }
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
