import { useState, useEffect, useMemo } from 'react'
import { useRFQStore, RFQItem } from '../store/rfqStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  ChevronLeft,
  Search as SearchIcon,
  Calendar,
  Hash,
  Layers,
  DollarSign,
  Download,
  Send,
  Eye,
  Trash2,
  FileText,
  Info,
  Building,
  User,
  Mail,
  MapPin,
  Tag,
  Shield,
  Loader2,
  Edit,
  CornerDownLeft,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import DebouncedInput from '@/components/DebouncedInput'
import { AddConsolidatedPRModal } from '../components/AddConsolidatedPRModal'
import { SetQuotationModal } from '../components/SetQuotationModal'
import { CreateRFQModal } from '../components/CreateRFQModal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
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
import { generateAndDownloadRfqDocument } from '../utils/generateRfqDocumentRequest'
import { SupplierRFQPreviewDialog } from '@/features/procurement/aob/dialogs/SupplierRFQPreviewDialog'
import type { BidMatrix } from '@/features/procurement/aob/types/aobTypes'
import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { SupplierDetail } from '../types'

interface RFQDetailsPageProps {
  rfqId: string
  supplierId?: string
  onBack?: () => void
  isSupplierPortal?: boolean
}

export function RFQDetailsPage({
  rfqId,
  supplierId,
  onBack,
  isSupplierPortal = false,
}: RFQDetailsPageProps) {
  const { fetchRFQById, submitRFQ, addRFQItems, removeRFQItem } = useRFQStore()
  const [rfq, setRfq] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [greenSpecs, setGreenSpecs] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPRModal, setShowAddPRModal] = useState(false)
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewingSupplier, setViewingSupplier] = useState<string | null>(null)
  const [viewingSupplierDetail, setViewingSupplierDetail] = useState<SupplierDetail | null>(null)
  const [isLoadingSupplierDetail, setIsLoadingSupplierDetail] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFund, setSelectedFund] = useState<string>('all')
  const [previewingSupplierRFQ, setPreviewingSupplierRFQ] = useState<any | null>(null)

  const rfqBidMatrix = useMemo<BidMatrix>(() => ({
    id: rfq?.id || '',
    aobNumber: rfq?.rfqNumber || 'RFQ',
    description: rfq?.description || rfq?.purpose || '',
    openingDate: rfq?.deadline || '',
    status: rfq?.status || '',
    awardCriterion: 'LCRB',
    isBidsOpened: true,
    linkedRFQs: rfq ? [{
      id: rfq.id,
      rfqNumber: rfq.rfqNumber || '',
      tracingNumber: rfq.prNumber || '',
      totalAmount: rfq.totalAmount || 0,
      status: rfq.status,
      date: rfq.date || '',
      deadline: rfq.deadline,
    }] : [],
    lineItems: (rfq?.items || []).map((it: any) => ({
      lineItemId: it.id,
      rfqItemId: it.id,
      itemCode: it.itemCode || '',
      name: it.itemName || '',
      description: it.itemName || '',
      quantity: it.quantity || 1,
      unit: it.unit || 'units',
      abcUnitPrice: it.unitPrice || 0,
      totalABC: (it.unitPrice || 0) * (it.quantity || 1),
      lineItems: [{
        supplierId: previewingSupplierRFQ?.id || previewingSupplierRFQ?.supplierId || '',
        supplierName: previewingSupplierRFQ?.name || previewingSupplierRFQ?.supplierName || '',
        unitBid: it.bidUnitPrice,
        totalBid: (it.bidUnitPrice || 0) * (it.quantity || 1),
        brand: it.bidBrand,
        model: it.bidModel,
        color: it.bidColor,
        isResponsive: true,
      }],
    })),
    suppliers: previewingSupplierRFQ ? [{
      id: previewingSupplierRFQ.id,
      supplierId: previewingSupplierRFQ.id,
      supplierName: previewingSupplierRFQ.name || previewingSupplierRFQ.supplierName || 'Supplier',
      name: previewingSupplierRFQ.name || previewingSupplierRFQ.supplierName || 'Supplier',
      rfqId: rfq?.id,
      rfqNumber: rfq?.rfqNumber,
      hasSubmitted: true,
      contactPerson: previewingSupplierRFQ.contact || previewingSupplierRFQ.contactPerson,
      quotationDocumentUrl: previewingSupplierRFQ.quotationDocumentUrl,
      signatureUrl: previewingSupplierRFQ.signatureUrl,
      signatoryName: previewingSupplierRFQ.signatoryName,
    }] : [],
  }), [rfq, previewingSupplierRFQ])

  const loadRFQ = async (silent = false) => {
    if (!silent) setIsLoading(true)
    if (isSupplierPortal && supplierId) {
      try {
        const rfqRes = await api.get<{ data: any }>(`/api/supplier/rfqs/${rfqId}?supplierId=${supplierId}`)
        const rfqData = rfqRes.data?.data

        let bidData = null
        try {
          const bidRes = await api.get<{ data: any }>(
            `/api/supplier/rfqs/${rfqId}/my-bid?supplierId=${supplierId}`,
            { skipToast: true } as any
          )
          bidData = bidRes.data?.data ?? null
        } catch {
          // Supplier bid might not exist yet; treat as normal empty state
          bidData = null
        }

        if (rfqData) {
          const bidItemMap = new Map((bidData?.items || []).map((b: any) => [b.rfqItemId, b]))

          setRfq({
            id: rfqData.id,
            rfqNumber: rfqData.rfqNumber,
            prNumber: rfqData.tracingNumber || '',
            department: 'Procurement Division',
            date: rfqData.date,
            deadline: rfqData.deadline || '',
            status: rfqData.status || 'approved',
            description: rfqData.description,
            purpose: rfqData.purpose,
            deliveryPeriod: rfqData.deliveryPeriod,
            totalAmount: rfqData.totalAmount,
            quotationStatus: bidData?.status ? bidData.status.toLowerCase() : rfqData.hasSubmittedBid ? 'submitted' : 'draft',
            quotationSubmittedAt: bidData?.submittedAt,
            items: (rfqData.items || []).map((it: any) => {
              const existingBidItem: any = bidItemMap.get(it.id)
              return {
                id: it.id,
                itemCode: it.id.substring(0, 8),
                itemName: it.itemName,
                description: it.itemName,
                quantity: it.quantity,
                unit: 'pcs',
                unitOfMeasure: 'pcs',
                unitPrice: it.unitPriceSnapshot,
                totalAmount: it.totalABC,
                category: it.category || 'General',
                fund: it.fund || 'General Fund',
                isRequiredBrochure: it.isBrochureRequired,
                greenSpecification: it.greenSpecification,
                month: it.month,
                monthlyAllocations: (it.monthlyAllocations || []).map((m: any) => ({
                  month: m.month,
                  quantity: m.quantity,
                })),
                bidUnitPrice: existingBidItem?.unitPrice,
                bidTotalAmount: existingBidItem?.totalPrice,
                bidBrand: existingBidItem?.brand,
                bidModel: existingBidItem?.model,
                bidColor: existingBidItem?.color,
                bidBrochureUrl: existingBidItem?.brochureFileUrl,
              }
            }),
            invitedSuppliers: [],
          })
          if (!silent) setIsLoading(false)
          return
        }
      } catch (e) {
        console.error('Failed to load supplier RFQ details', e)
      }
    }

    const res = await fetchRFQById(rfqId)
    setRfq(res)
    if (!silent) setIsLoading(false)
  }

  useEffect(() => {
    loadRFQ()
  }, [rfqId, supplierId])

  // Fetch the real supplier detail from the API when a supplier is selected for
  // viewing. This previously used getSupplierById() against a local mock dataset
  // (../data/mockSuppliers), which never contains real supplier GUIDs from the
  // backend — every lookup silently returned undefined, showing "Supplier
  // details are unavailable." regardless of whether the supplier actually exists.
  useEffect(() => {
    if (!viewingSupplier) {
      setViewingSupplierDetail(null)
      return
    }
    setIsLoadingSupplierDetail(true)
    api
      .get<APIResponse<SupplierDetail>>(`/suppliers/${viewingSupplier}`)
      .then((response) => {
        setViewingSupplierDetail(response.data.data ?? null)
      })
      .catch((e) => {
        console.error('Failed to fetch supplier details', e)
        setViewingSupplierDetail(null)
      })
      .finally(() => setIsLoadingSupplierDetail(false))
  }, [viewingSupplier])

  // Status badge config (match Purchase Request styling)
  const STATUS_BADGE_CONFIG: Record<
    string,
    { label?: string; color?: any; variant?: any }
  > = {
    draft: { label: 'Draft', color: 'secondary' },
    submitted: { label: 'Submitted', color: 'info', variant: 'outline' },
    approved: { label: 'Approved', color: 'success', variant: 'outline' },
    returned: { label: 'Returned', color: 'destructive', variant: 'outline' },
  }

  const normalizeStatus = (status: string | undefined, remarks?: string) => {
    if (!status) return status || ''

    if (status === 'draft' && remarks?.trim()) return 'returned'
    if (status === 'issued') return 'submitted'
    if (status === 'closed') return 'approved'

    return status
  }

  const displayStatus = normalizeStatus(rfq?.status, rfq?.remarks)

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading RFQ details...</div>
  if (!rfq) return <div className="p-8 text-center text-destructive">RFQ not found</div>

  const toggleBrochure = async (itemId: string, v: boolean) => {
    const item = rfq.items.find((it: any) => it.id === itemId)
    if (!item) return

    // Optimistic in-place update to prevent jump or reload disruption
    setRfq((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        items: (prev.items || []).map((it: any) =>
          it.id === itemId ? { ...it, isRequiredBrochure: v } : it
        ),
      }
    })

    try {
      await addRFQItems(rfqId, [{
        cprItemId: item.itemId || item.prId || '',
        quantity: item.quantity,
        isBrochureRequired: v,
        greenSpecification: greenSpecs[itemId] !== undefined ? greenSpecs[itemId] : (item.greenSpecification || ''),
      }])
      loadRFQ(true)
    } catch (err) {
      console.error('Failed to toggle brochure requirement:', err)
      loadRFQ(true)
    }
  }

  const handleGreenSpecificationChange = (itemId: string, value: string) => {
    setGreenSpecs((prev) => ({ ...prev, [itemId]: value }))
  }

  const handleGreenSpecificationBlur = async (itemId: string, value: string) => {
    const item = rfq.items.find((it: any) => it.id === itemId)
    if (!item) return
    await addRFQItems(rfqId, [{
      cprItemId: item.itemId || item.prId || '',
      quantity: item.quantity,
      isBrochureRequired: !!item.isRequiredBrochure,
      greenSpecification: value,
    }])
    loadRFQ(true)
  }

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    await removeRFQItem(rfqId, itemToDelete)
    toast({ title: 'Item removed', description: 'Item removed from RFQ' })
    setItemToDelete(null)
    loadRFQ()
  }
  const handleAddConsolidatedPR = async (items: RFQItem[]) => {
    const payload = items.map(it => ({
      cprItemId: it.itemId || it.id || it.prId || '',
      quantity: it.quantity,
      isBrochureRequired: !!it.isRequiredBrochure,
      greenSpecification: it.greenSpecification || '',
    }))
    await addRFQItems(rfqId, payload)
    toast({
      title: 'Items added',
      description: `${items.length} item(s) added to RFQ from consolidated PR(s)`,
    })
    loadRFQ()
  }

  const totalAmount = rfq.items.reduce((s: number, it: any) => s + (it.totalAmount || 0), 0)
  const canEdit = !isSupplierPortal && (rfq?.status === 'draft' || rfq?.status === 'returned')
  const canSubmit = canEdit && (rfq?.items?.length || 0) > 0

  // Supplier portal quotation state helpers
  const quotationIsPending =
    !rfq.quotationStatus || rfq.quotationStatus === 'draft'
  const quotationIsSubmitted =
    rfq.quotationStatus === 'submitted' && !rfq.quotationApprovalStatus
  const quotationIsApproved = rfq.quotationApprovalStatus === 'approved'
  const quotationIsReturned = rfq.quotationApprovalStatus === 'returned'

  // Authoritative calculations for supplier bid & comparison
  const totalRFQAmount = rfq.items.reduce(
    (s: number, it: any) => s + (it.totalAmount || ((it.quantity || 0) * (it.unitPrice || 0)) || 0),
    0
  )
  const hasAnyBid = rfq.items.some(
    (it: any) => it.bidUnitPrice !== undefined && it.bidUnitPrice !== null && it.bidUnitPrice > 0
  )
  const isCompleteBid =
    rfq.items.length > 0 &&
    rfq.items.every((it: any) => it.bidUnitPrice !== undefined && it.bidUnitPrice !== null && it.bidUnitPrice > 0)
  const totalBidAmount = rfq.items.reduce(
    (s: number, it: any) =>
      s + (it.bidTotalAmount !== undefined && it.bidTotalAmount !== null ? it.bidTotalAmount : (it.bidUnitPrice ? it.bidUnitPrice * it.quantity : 0)),
    0
  )
  const overBudgetItemsCount = rfq.items.filter(
    (it: any) => (it.bidUnitPrice || 0) > (it.unitPrice || 0) && (it.bidUnitPrice || 0) > 0
  ).length
  const isOverallWithinABC = totalBidAmount <= totalRFQAmount && overBudgetItemsCount === 0
  const netSavings = totalRFQAmount - totalBidAmount

  // Precompute rendered table rows for items (keeps JSX cleaner and avoids parser issues)
  const monthsList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // derive categories and funds from items (include 'all' option)
  const categoriesList = Array.from(
    new Set(rfq.items.map((it: any) => (it as any).category || 'Uncategorized')),
  )
  const fundsList = Array.from(
    new Set(rfq.items.map((it: any) => (it as any).fund || 'General Fund')),
  )

  const getMonthIndexForItem = (it: RFQItem, _idx: number): number | null => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    const parseMonthVal = (val: any): number | null => {
      if (val === undefined || val === null || val === '') return null
      if (typeof val === 'number') {
        if (val >= 0 && val <= 11) return val
        if (val >= 1 && val <= 12) return val - 1
        return null
      }
      const str = String(val).trim().toLowerCase()
      const fullIdx = monthNames.indexOf(str)
      if (fullIdx !== -1) return fullIdx
      const shortIdx = shortMonthNames.indexOf(str)
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

    // Check monthlyAllocations first
    if ((it as any).monthlyAllocations && (it as any).monthlyAllocations.length > 0) {
      for (const alloc of (it as any).monthlyAllocations) {
        const parsed = parseMonthVal(alloc.month)
        if (parsed !== null) return parsed
      }
    }

    // Prefer explicit month field
    if ((it as any).month !== undefined && (it as any).month !== null) {
      const parsed = parseMonthVal((it as any).month)
      if (parsed !== null) return parsed
    }

    // Try PR id like CPR-2026-M02
    if (it.prId) {
      const parsed = parseMonthVal(it.prId)
      if (parsed !== null) return parsed
    }

    return null
  }

  // prepare array with original indices so fallback month is consistent
  const itemsWithIndex = rfq.items.map((it: RFQItem, idx: number) => ({
    it,
    idx,
  }))

  // Apply search and month filter
  const filteredItems = itemsWithIndex.filter(({ it, idx }: any) => {
    const term = searchTerm?.trim().toLowerCase()
    if (term) {
      const hay =
        `${it.itemName || ''} ${(it as any).category || ''} ${it.prId || ''}`.toLowerCase()
      if (!hay.includes(term)) return false
    }

    if (selectedMonth && selectedMonth !== 'all') {
      const sel = parseInt(selectedMonth, 10)
      if (!isNaN(sel)) {
        const mi = getMonthIndexForItem(it, idx)
        // If month is unknown (null), do not match a specific month filter
        if (mi === null || mi !== sel - 1) return false
      }
    }

    // category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = (it as any).category || 'Uncategorized'
      if (cat !== selectedCategory) return false
    }

    // fund filter
    if (selectedFund && selectedFund !== 'all') {
      const f = (it as any).fund || 'General Fund'
      if (f !== selectedFund) return false
    }

    return true
  })

  // Render rows from filtered items (separated from filtering logic)
  const itemRows = filteredItems.map(({ it, idx }: any) => {
    const mockMonths = monthsList
    const monthIndex: number | null = getMonthIndexForItem(it, idx)

    // month label uses resolved month index or 'Unknown' when null
    const monthLabel = monthIndex !== null ? mockMonths[monthIndex] : 'Unknown'

    // Build a month-by-month quantity array: place quantity only at the resolved month index if known.
    let monthlyQty = new Array(12)
      .fill(0)
      .map((_, i) =>
        monthIndex !== null && i === monthIndex ? it.quantity || 0 : 0,
      )

    if (it.monthlyAllocations && it.monthlyAllocations.length > 0) {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      const newMonthlyQty = new Array(12).fill(0)
      it.monthlyAllocations.forEach((alloc: any) => {
        if (alloc.month !== undefined && alloc.month !== null) {
          const str = String(alloc.month).trim().toLowerCase()
          let foundIdx = monthNames.indexOf(str)
          if (foundIdx === -1) {
            foundIdx = shortMonthNames.indexOf(str)
          }
          if (foundIdx === -1) {
            const num = parseInt(str, 10)
            if (!isNaN(num)) {
              if (num >= 0 && num <= 11) foundIdx = num
              else if (num >= 1 && num <= 12) foundIdx = num - 1
            }
          }
          if (foundIdx !== -1) {
            newMonthlyQty[foundIdx] = alloc.quantity || it.quantity || 0
          }
        }
      })
      if (newMonthlyQty.some(q => q > 0)) {
        monthlyQty = newMonthlyQty
      }
    }

    const activeMonths = mockMonths
      .map((m, i) => ({ month: m, qty: monthlyQty[i] }))
      .filter((x) => x.qty > 0)

    let monthBadgeText = '—'
    if (activeMonths.length === 1) {
      monthBadgeText = `${activeMonths[0].month} (${activeMonths[0].qty})`
    } else if (activeMonths.length > 1) {
      monthBadgeText = activeMonths.map((a) => a.month).join(', ')
    }

    return (
      <TableRow key={it.id}>
        <TableCell>{it.itemName}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {it.category || '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {it.fund || '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 focus:outline-none"
                title={`Month breakdown for ${it.itemName}`}
                aria-label={`View month breakdown for ${it.itemName}`}
              >
                {activeMonths.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-xs font-medium cursor-pointer border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {monthBadgeText}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="min-w-[320px] max-w-[420px] p-3 shadow-md"
            >
              <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                <span>Monthly Allocation</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Total: {monthlyQty.reduce((s, q) => s + q, 0)} {it.unitOfMeasure || 'units'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mockMonths.map((m, mi) => (
                  <div
                    key={m}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs ${
                      monthlyQty[mi] > 0
                        ? 'bg-primary/10 border border-primary/20 text-primary font-medium'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className="whitespace-nowrap">{m}</div>
                    <span className={monthlyQty[mi] > 0 ? 'font-bold' : ''}>
                      {monthlyQty[mi] > 0 ? monthlyQty[mi] : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>
        <TableCell>{it.quantity}</TableCell>
        <TableCell>{it.unitOfMeasure}</TableCell>
        <TableCell>₱{(it.unitPrice || 0).toLocaleString()}</TableCell>
        <TableCell>₱{(it.totalAmount || 0).toLocaleString()}</TableCell>
        <TableCell>
          <RadioGroup
            value={it.isRequiredBrochure ? 'yes' : 'no'}
            onValueChange={(value) => toggleBrochure(it.id, value === 'yes')}
            disabled={!canEdit}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`yes-${it.id}`} />
              <label
                htmlFor={`yes-${it.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Yes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`no-${it.id}`} />
              <label
                htmlFor={`no-${it.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                No
              </label>
            </div>
          </RadioGroup>
        </TableCell>
        <TableCell>
          {canEdit ? (
            <Input
              value={greenSpecs[it.id] !== undefined ? greenSpecs[it.id] : (it.greenSpecification || '')}
              onChange={(e) =>
                handleGreenSpecificationChange(it.id, e.target.value)
              }
              onBlur={(e) =>
                handleGreenSpecificationBlur(it.id, e.target.value)
              }
              placeholder="Enter green/eco-friendly specs (optional)"
              className="min-w-[250px]"
            />
          ) : (
            <span
              className={
                it.greenSpecification
                  ? 'text-sm'
                  : 'text-sm text-muted-foreground italic'
              }
            >
              {it.greenSpecification || 'No green specification provided'}
            </span>
          )}
        </TableCell>
        <TableCell>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(it.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    )
  })

  // Explicit business language outcome renderer for supplier comparison
  const renderSupplierResultStatus = (it: any) => {
    const hasBid = it.bidUnitPrice !== undefined && it.bidUnitPrice !== null && it.bidUnitPrice > 0
    if (!hasBid) {
      return (
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-medium">
          Pending Bid
        </Badge>
      )
    }

    const unitBid = it.bidUnitPrice
    const unitABC = it.unitPrice || 0
    const totalBid = it.bidTotalAmount ?? (unitBid * it.quantity)
    const totalABC = it.totalAmount ?? (unitABC * it.quantity)
    const lineSavings = totalABC - totalBid

    if (unitBid > unitABC) {
      const overAmount = totalBid - totalABC
      return (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-destructive">
            ₱{overAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over
          </div>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-semibold">
            Exceeds ABC
          </Badge>
        </div>
      )
    }

    if (unitBid === unitABC) {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-700">
            ₱0.00 variance
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-slate-300 bg-slate-100 text-slate-700 uppercase tracking-wide font-semibold">
            At ABC
          </Badge>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <div className="text-sm font-semibold text-emerald-700">
          ₱{lineSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} savings
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-emerald-300 bg-emerald-50 text-emerald-700 uppercase tracking-wide font-semibold">
          Within ABC
        </Badge>
      </div>
    )
  }

  // Precomputed hierarchical comparison rows for Supplier Portal
  const supplierItemRows = filteredItems.map(({ it }: any) => {
    return (
      <TableRow key={it.id} className="hover:bg-slate-50/80 transition-colors">
        {/* 1. Item & Description */}
        <TableCell className="align-top py-3.5">
          <div className="font-semibold text-slate-900 text-sm">{it.itemName}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[11px] py-0 px-1.5 text-muted-foreground bg-slate-50 font-normal">
              {it.category || 'General'}
            </Badge>
            {it.greenSpecification && (
              <Badge variant="outline" className="text-[11px] py-0 px-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 font-normal" title={it.greenSpecification}>
                Eco/Green
              </Badge>
            )}
          </div>
        </TableCell>

        {/* 2. Qty & Unit */}
        <TableCell className="align-top py-3.5 text-center">
          <div className="font-bold text-slate-900 text-sm">{it.quantity}</div>
          <div className="text-xs text-muted-foreground">{it.unitOfMeasure || it.unit || 'pcs'}</div>
        </TableCell>

        {/* 3. RFQ / ABC (Baseline) */}
        <TableCell className="align-top py-3.5 bg-slate-50/60">
          <div className="text-sm font-medium text-slate-700">
            ₱{(it.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs text-muted-foreground font-normal"> / unit</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            ₱{(it.totalAmount || ((it.quantity || 0) * (it.unitPrice || 0)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
          </div>
        </TableCell>

        {/* 4. YOUR BID (Dominant) */}
        <TableCell className="align-top py-3.5 bg-indigo-50/30 border-l border-r border-indigo-100/60">
          {it.bidUnitPrice ? (
            <div>
              <div className="text-sm font-bold text-indigo-950">
                ₱{it.bidUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs text-indigo-700/80 font-normal"> / unit</span>
              </div>
              <div className="text-xs font-semibold text-indigo-900/80 mt-0.5">
                ₱{(it.bidTotalAmount || (it.bidUnitPrice * it.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
              </div>
            </div>
          ) : (
            <span className="text-xs italic text-muted-foreground">— Not Quoted —</span>
          )}
        </TableCell>

        {/* 5. Result & Outcome */}
        <TableCell className="align-top py-3.5">
          {renderSupplierResultStatus(it)}
        </TableCell>

        {/* 6. Details & Specs */}
        <TableCell className="align-top py-3.5">
          <div className="space-y-1 text-xs">
            {(it.bidBrand || it.bidModel || it.bidColor) ? (
              <div className="text-slate-700">
                {it.bidBrand && <div><span className="text-muted-foreground">Brand:</span> {it.bidBrand}</div>}
                {it.bidModel && <div><span className="text-muted-foreground">Model:</span> {it.bidModel}</div>}
                {it.bidColor && <div><span className="text-muted-foreground">Color:</span> {it.bidColor}</div>}
              </div>
            ) : (
              <span className="text-muted-foreground italic">No brand/model</span>
            )}
            {it.bidBrochureUrl && (
              <div className="pt-1">
                <a
                  href={it.bidBrochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Brochure
                </a>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    )
  })

  // If viewing a supplier, show the supplier detail as a full-page view,
  // sourced from the real GET /suppliers/{id} endpoint (see effect above),
  // not the previous mock dataset which never matched real supplier GUIDs.
  if (viewingSupplier) {
    return (
      <div className="w-full space-y-6 pb-10">
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingSupplier(null)}
            className="px-2 py-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {isLoadingSupplierDetail ? (
          <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading supplier details...
          </div>
        ) : !viewingSupplierDetail ? (
          <div className="p-4 rounded-md bg-muted text-sm text-muted-foreground">
            Supplier details are unavailable.
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Building className="h-6 w-6 text-primary" />
                {viewingSupplierDetail.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  color={
                    viewingSupplierDetail.status === 'approved' ? 'success' :
                    viewingSupplierDetail.status === 'declined' ? 'destructive' :
                    viewingSupplierDetail.status === 'under_review' ? 'info' : 'secondary'
                  }
                  variant={viewingSupplierDetail.status === 'approved' ? 'outline' : undefined}
                >
                  {viewingSupplierDetail.status.toUpperCase().replace('_', ' ')}
                </Badge>
                {viewingSupplierDetail.isBlocked && (
                  <Badge color="destructive" className="gap-1">
                    Blocked
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Supplier Category
                  </div>
                  <div className="font-medium">{viewingSupplierDetail.supplierCategory?.name || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PhilGEPS Number
                  </div>
                  <div className="font-medium font-mono text-sm">{viewingSupplierDetail.philGEPSNumber || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Business Permit No.
                  </div>
                  <div className="font-medium">{viewingSupplierDetail.businessPermitNo || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    TIN Number
                  </div>
                  <div className="font-medium font-mono text-sm">{viewingSupplierDetail.tinNumber || '—'}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Person
                    </div>
                    <div className="font-medium">{viewingSupplierDetail.contactPerson || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="font-medium">{viewingSupplierDetail.email || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contact Number
                    </div>
                    <div className="font-medium">{viewingSupplierDetail.contactNumber || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </div>
                    <div className="font-medium">{viewingSupplierDetail.address || '—'}</div>
                  </div>
                </div>
              </div>

              {viewingSupplierDetail.supplierRequirements && viewingSupplierDetail.supplierRequirements.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Compliance Requirements
                  </h3>
                  <div className="space-y-2">
                    {viewingSupplierDetail.supplierRequirements.map((req) => (
                      <div
                        key={req.supplierRequirementId}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <span className="text-sm font-medium">{req.requirementName}</span>
                        <Badge
                          color={req.isVerified ? 'success' : 'secondary'}
                          variant={req.isVerified ? 'outline' : undefined}
                          className="gap-1"
                        >
                          {req.isVerified && <Shield className="h-3 w-3" />}
                          {req.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingSupplierDetail.statusNote && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Status Note
                  </h3>
                  <div className="text-sm bg-muted/40 border rounded-md p-3">
                    {viewingSupplierDetail.statusNote}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const handleSubmitRFQ = async () => {
    if (!rfq) return
    if ((rfq.items || []).length === 0) {
      toast({
        title: 'Submission Failed',
        description: 'Add at least one item before submitting.',
        variant: 'destructive',
      })
      return
    }

    try {
      const success = await submitRFQ(rfqId)
      if (success) {
        toast({
          title: 'RFQ Submitted',
          description: `${rfq.rfqNumber} has been submitted successfully for BAC review.`,
        })
        loadRFQ()
      }
    } catch (e: any) {
      console.error('Failed to submit RFQ:', e)
    }
  }

  const handleExportPDF = async () => {
    if (!rfq?.id) return
    setIsExporting(true)
    toast({
      title: 'Generating Blank RFQ Canvass PDF...',
      description: 'Please wait while the official blank template is being prepared.',
    })
    try {
      await generateAndDownloadRfqDocument({
        rfqId: rfq.id,
        format: 'Pdf',
        blankTemplate: true,
        filename: `RFQ_${rfq.rfqNumber || rfq.id}_Blank_Canvass.pdf`,
      })
      toast({
        title: 'RFQ Template Downloaded',
        description: `Successfully exported blank RFQ canvass template for ${rfq.rfqNumber || ''}.`,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export RFQ PDF'
      toast({
        title: 'Export Failed',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadSupplierTemplate = async () => {
    if (!rfq?.id) return
    try {
      await generateAndDownloadRfqDocument({
        rfqId: rfq.id,
        format: 'Pdf',
        blankTemplate: true,
        filename: `RFQ_${rfq.rfqNumber || rfq.id}_Blank_Template.pdf`,
      })
      toast({
        title: 'Template Downloaded',
        description: 'Blank RFQ template is ready for offline routing/signing.',
      })
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err?.message || 'Could not download RFQ template.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back above card */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Header card - white with inline badge and export button */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold m-0">{rfq.rfqNumber}</h1>
                {/* In supplier portal show the quotation lifecycle status, not the internal RFQ status */}
                {isSupplierPortal ? (
                  <>
                    {quotationIsPending && (
                      <Badge
                        className="bg-amber-100 text-amber-700 border-amber-300 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                        variant="outline"
                      >
                        PENDING
                      </Badge>
                    )}
                    {quotationIsSubmitted && (
                      <Badge
                        className="bg-indigo-100 text-indigo-700 border-indigo-300 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                        variant="outline"
                      >
                        SUBMITTED
                      </Badge>
                    )}
                    {quotationIsApproved && (
                      <Badge
                        className="bg-green-100 text-green-700 border-green-300 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                        variant="outline"
                      >
                        APPROVED
                      </Badge>
                    )}
                    {quotationIsReturned && (
                      <Badge
                        className="bg-orange-100 text-orange-700 border-orange-300 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                        variant="outline"
                      >
                        RETURNED
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge
                    color={STATUS_BADGE_CONFIG[displayStatus]?.color}
                    variant={STATUS_BADGE_CONFIG[displayStatus]?.variant}
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase"
                  >
                    {String(displayStatus).toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground mt-2">
                {rfq.description || 'No description'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSupplierPortal &&
                (quotationIsPending || quotationIsReturned) && (
                  <Button
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90"
                    onClick={() => setShowQuotationModal(true)}
                  >
                    {quotationIsReturned ? 'Revise Quotation' : 'Set Quotation'}
                  </Button>
                )}

              <Button
                variant="outline"
                size="sm"
                disabled={isExporting}
                onClick={handleExportPDF}
                className="gap-2"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </Button>

              {!isSupplierPortal && canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit RFQ
                </Button>
              )}

              {!isSupplierPortal && canSubmit && (
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-90"
                  onClick={handleSubmitRFQ}
                >
                  <Send className="w-4 h-4" />
                  {rfq?.status === 'returned' ? 'Re-submit RFQ' : 'Submit RFQ'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Return Reason Card — shown when RFQ has been returned */}
      {!isSupplierPortal && (displayStatus === 'returned' || rfq.status === 'returned' || (rfq.status === 'draft' && rfq.remarks)) && (
        <Card className="shadow-sm mt-6 border-l-4 border-l-destructive border-red-200 bg-gradient-to-r from-red-50/90 via-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:to-red-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <CornerDownLeft className="h-4 w-4 text-red-700 dark:text-red-300" />
              </div>
              <div>
                <CardTitle className="text-red-800 dark:text-red-300 text-base font-bold">
                  Return Reason / Remarks
                </CardTitle>
                <CardDescription className="text-xs text-red-600 dark:text-red-400">
                  This RFQ was returned for revision by the BAC Chairperson. Please address the remarks below before editing or re-submitting.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="p-3.5 bg-white/90 dark:bg-slate-900/80 rounded-md border border-red-200 dark:border-red-900/60 text-sm font-medium text-red-950 dark:text-red-100 whitespace-pre-wrap leading-relaxed">
              {rfq.remarks?.trim() ? rfq.remarks : 'No specific return reason was provided.'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details card */}
      <Card className="shadow-sm mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* RFQ Date Card */}
            <div className="p-5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-700" />
                </div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  RFQ Date
                </div>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {rfq.date
                  ? new Date(rfq.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>

            {/* Tracing Number Card */}
            <div className="p-5 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-purple-700" />
                </div>
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  Tracing Number
                </div>
              </div>
              <div className="text-xl font-bold text-purple-900">
                {rfq.tracingNumber || '—'}
              </div>
            </div>

            {/* Delivery Period Card */}
            <div className="p-5 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-cyan-700" />
                </div>
                <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                  Deadline
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-bold text-cyan-900">
                  {rfq.deadline
                    ? new Date(rfq.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </div>
                <div className="text-sm text-cyan-700 mt-2">
                  <span className="font-medium">Delivery Period:</span>
                  <span className="ml-2">
                    {rfq.deliveryPeriod ? `${rfq.deliveryPeriod} days` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount Card */}
            <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  Total RFQ Amount
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-900">
                ₱{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Purpose Card */}
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-700" />
              </div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Purpose
              </div>
            </div>
            <div className="text-base font-medium text-slate-900 leading-relaxed">
              {rfq.description || '—'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returned notice — shown in supplier portal when quotation was returned */}
      {isSupplierPortal && quotationIsReturned && (
        <Card className="border-orange-300 bg-orange-50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                <Info className="h-4 w-4 text-orange-700" />
              </div>
              <CardTitle className="text-orange-800 text-base">
                Quotation Returned
              </CardTitle>
              {rfq.quotationApprovalAt && (
                <span className="text-xs text-orange-600 ml-auto">
                  {new Date(rfq.quotationApprovalAt).toLocaleString()}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 font-medium mb-1">
              Reason / Remarks:
            </p>
            <p className="text-sm text-orange-900 bg-white border border-orange-200 rounded-md px-4 py-3">
              {rfq.quotationApprovalRemarks || 'No remarks provided.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suppliers - Hidden in supplier portal */}
      {!isSupplierPortal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Suppliers invited for this RFQ</CardDescription>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="gap-1.5 text-xs h-8"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Manage Suppliers
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rfq.suppliers.length === 0 ? (
                <div className="text-muted-foreground">No suppliers added</div>
              ) : (
                rfq.suppliers.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-white border rounded-md px-4 py-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {(s.name || '').slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {s.contact || ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewingSupplierRFQ({
                          id: s.id,
                          supplierId: s.id,
                          name: s.name,
                          supplierName: s.name,
                          rfqId: rfq.id,
                          rfqNumber: rfq.rfqNumber,
                          contactPerson: s.contact,
                          hasSubmitted: true,
                        })}
                        className="gap-1.5 text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Preview Submitted RFQ
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingSupplier(s.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Portal Quotation Summary Card */}
      {isSupplierPortal && (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/40 shadow-sm">
          <CardHeader className="pb-3 border-b border-indigo-100/60">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg text-indigo-950 font-bold">
                    {rfq.quotationStatus === 'submitted' ? 'Submitted Quotation Summary' : 'Draft Quotation Summary'}
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-900/70">
                    Comparison against Approved Budget for Contract (ABC)
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={handleDownloadSupplierTemplate}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download RFQ Template
                </Button>
                {rfq.quotationStatus === 'submitted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-8 border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                    onClick={() => setPreviewingSupplierRFQ({
                      id: supplierId || '00000000-0000-0000-0000-000000000001',
                      supplierId: supplierId || '00000000-0000-0000-0000-000000000001',
                      name: 'My Submitted RFQ',
                      supplierName: 'My Submitted RFQ',
                      rfqId: rfq.id,
                      rfqNumber: rfq.rfqNumber,
                      hasSubmitted: true,
                    })}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Preview Submitted RFQ
                  </Button>
                )}
                {rfq.quotationStatus === 'submitted' ? (
                  <Badge className="bg-emerald-600 text-white font-semibold">
                    SUBMITTED
                  </Badge>
                ) : hasAnyBid ? (
                  <Badge variant="outline" className="border-amber-300 bg-amber-100/80 text-amber-800 font-semibold">
                    DRAFT BID
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-600 font-semibold">
                    NOT YET QUOTED
                  </Badge>
                )}
                {(quotationIsPending || quotationIsReturned) && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                    onClick={() => setShowQuotationModal(true)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {hasAnyBid ? 'Edit Quotation' : 'Set Quotation'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Items */}
              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-xs">
                <div className="text-xs text-muted-foreground font-medium mb-1">Total Items</div>
                <div className="text-2xl font-bold text-slate-900">{rfq.items.length} item(s)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {rfq.items.filter((it: any) => (it.bidUnitPrice || 0) > 0).length} of {rfq.items.length} quoted
                </div>
              </div>

              {/* Total Quotation Amount vs Total RFQ ABC */}
              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-xs">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  {rfq.quotationStatus === 'submitted' ? 'Total Submitted Bid' : 'Total Draft Bid'}
                </div>
                <div className="text-2xl font-bold text-indigo-950">
                  ₱{totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Allowed RFQ ABC: <span className="font-semibold text-slate-700">₱{totalRFQAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Overall Budget Comparison Outcome */}
              <div className={`p-4 bg-white rounded-lg border shadow-xs ${
                !hasAnyBid
                  ? 'border-slate-200'
                  : isOverallWithinABC
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-red-200 bg-red-50/30'
              }`}>
                <div className="text-xs text-muted-foreground font-medium mb-1">Budget Outcome</div>
                {!hasAnyBid ? (
                  <div>
                    <div className="text-lg font-semibold text-slate-600">Pending Quotation</div>
                    <div className="text-xs text-muted-foreground mt-1">Click Set Quotation to enter your bids</div>
                  </div>
                ) : isOverallWithinABC ? (
                  <div>
                    <div className="text-2xl font-bold text-emerald-700">
                      ₱{netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                      <span>✓ Within Approved Budget (ABC)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-destructive">
                      ₱{Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Over
                    </div>
                    <div className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
                      <span>⚠ {overBudgetItemsCount} item(s) exceed allowed ABC</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Explicit status banner */}
            {hasAnyBid && (
              <div className={`p-3 rounded-lg border flex items-center justify-between flex-wrap gap-2 text-xs font-medium ${
                isOverallWithinABC
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {isOverallWithinABC ? (
                    <span>✓ Your {rfq.quotationStatus === 'submitted' ? 'submitted bid' : 'draft bid'} is <strong>₱{netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} below</strong> the Approved Budget (ABC).</span>
                  ) : (
                    <span>⚠ Attention: Your bid exceeds the Approved Budget for {overBudgetItemsCount} item(s). Please review your unit bids before submitting.</span>
                  )}
                </div>
                {isCompleteBid && (quotationIsPending || quotationIsReturned) && (
                  <Button
                    size="sm"
                    onClick={() => setShowQuotationModal(true)}
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Submit Quotation
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items / Office PPMPs style section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSupplierPortal ? 'Items & Quotation Comparison' : 'Items'}
          </CardTitle>
          <CardDescription>
            {isSupplierPortal
              ? `${rfq.items.length} item(s) — Compare Approved Budget for Contract (ABC) with your quotation`
              : `${rfq.items.length} item(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-72">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search by item name, category, or PRMP..."
                className="pl-10 w-full"
                onChange={(v: any) => setSearchTerm(String(v))}
                value={searchTerm}
              />
            </div>

            <Select
              onValueChange={(v) => setSelectedMonth(v)}
              defaultValue="all"
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthsList.map((m, mi) => (
                  <SelectItem key={m} value={`${mi + 1}`}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(v) => setSelectedCategory(v)}
              defaultValue="all"
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categoriesList as string[]).map((c: string) => {
                  return <SelectItem key={c} value={c}>{c}</SelectItem>
                })}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(v) => setSelectedFund(v)}
              defaultValue="all"
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Funds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                {(fundsList as string[]).map((f: string) => {
                  return <SelectItem key={f} value={f}>{f}</SelectItem>
                })}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              {canEdit && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-95"
                  onClick={() => setShowAddPRModal(true)}
                >
                  Add Consolidated PR
                </Button>
              )}
            </div>
          </div>

          {/* Green Specification Information Alert (Procurement view only) */}
          {!isSupplierPortal && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Green Specification:</strong> Optional field to indicate
                environmental or eco-friendly requirements for items (e.g.,
                energy-efficient, recyclable materials, sustainable sourcing,
                eco-certified products).
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border bg-white">
            <Table>
              {isSupplierPortal ? (
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b">
                    <TableHead className="text-sm font-semibold text-slate-700 min-w-[220px]">
                      Item & Description
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-slate-700 text-center w-24">
                      Qty & Unit
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-slate-700 min-w-[160px] bg-slate-100/60">
                      <div className="flex flex-col">
                        <span>RFQ / ABC</span>
                        <span className="text-[11px] font-normal text-muted-foreground">Unit / Total</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-bold text-indigo-950 min-w-[160px] bg-indigo-50/50">
                      <div className="flex flex-col">
                        <span>YOUR BID {rfq.quotationStatus === 'submitted' ? '' : '(DRAFT)'}</span>
                        <span className="text-[11px] font-normal text-indigo-700/80">Unit / Total</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-slate-700 min-w-[180px]">
                      Result & Outcome
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-slate-700 min-w-[140px]">
                      Details & Specs
                    </TableHead>
                  </TableRow>
                </TableHeader>
              ) : (
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-sm font-medium text-slate-600">
                      Item
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Category
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Fund
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Month
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Quantity
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Unit
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Unit Price
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Total
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Brochure
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600">
                      Green Specification
                    </TableHead>
                    <TableHead className="text-sm font-medium text-slate-600"></TableHead>
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {isSupplierPortal ? supplierItemRows : itemRows}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Consolidated PR Modal */}
      <AddConsolidatedPRModal
        open={showAddPRModal}
        onOpenChange={setShowAddPRModal}
        onAdd={handleAddConsolidatedPR}
        existingCPRItemIds={(rfq?.items || []).map((it: any) => it.itemId || it.prId || '')}
        currentConsolidatedPRId={rfq?.consolidatedPRId}
        currentConsolidatedPRNumber={rfq?.consolidatedPRNumber}
        currentModeOfProcurementId={rfq?.modeOfProcurementId}
        currentModeOfProcurementName={rfq?.modeOfProcurementName || rfq?.modeOfProcurement}
      />

      {/* Set Quotation Modal */}
      <SetQuotationModal
        open={showQuotationModal}
        onOpenChange={setShowQuotationModal}
        rfqId={rfqId}
        supplierId={supplierId}
        initialRFQ={rfq}
        onSuccess={() => {
          setShowQuotationModal(false)
          loadRFQ()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item from RFQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the RFQ? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit RFQ Modal */}
      <CreateRFQModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        initialRFQ={rfq}
        onSuccess={() => {
          setShowEditModal(false)
          loadRFQ()
        }}
      />

      {/* Supplier RFQ Submission Preview Dialog */}
      <SupplierRFQPreviewDialog
        open={Boolean(previewingSupplierRFQ)}
        onOpenChange={(open) => !open && setPreviewingSupplierRFQ(null)}
        supplier={previewingSupplierRFQ}
        bidMatrix={rfqBidMatrix}
      />
    </div>
  )
}
