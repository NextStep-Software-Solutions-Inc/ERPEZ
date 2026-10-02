/**
 * PR Details Page
 * View and edit individual Purchase Request details
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  Edit2,
  FileText,
  Tag,
  Building2,
  Eye,
  ExternalLink,
  Loader2,
  Boxes,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { useUpdatePurchaseRequestStatus, useUpdatePurchaseRequest, usePurchaseRequest } from '../handlers/hooks'
import {
  useGenerateBACResolutionDocument,
  useDownloadBacResolutionDocument,
} from '@/features/procurement/bac-resolution/handlers/hooks'
import { BacResolutionStatusBadge } from '@/features/procurement/bac-resolution/components'
import { PurchaseRequest, PRItem, PRStatus } from '../types'
import type { UpdatePurchaseRequestItemPayload, PRBacResolutionApi } from '../types/apiTypes'
import { fromApiStatus, fromApiPrType } from '../types/apiTypes'
import { AddItemsModal } from './AddItemsModal'
import { AddNonCSEItemModal, FALLBACK_NON_CSE_ITEMS, FALLBACK_PROCUREMENT_MODES } from './IndependentItemShoppingModal'
import { EditPRModal } from './EditPRModal'
import { ReturnPRModal } from './ReturnPRModal'
import { ApprovePRModal } from './ApprovePRModal'
import { PRAttachmentsPanel } from './PRAttachmentsPanel'
import { PRReturnRemarksBanner } from './PRReturnRemarksBanner'
import { PRPPMPItemsSection } from './PRPPMPItemsSection'
import { PRAPRItemsSection } from './PRAPRItemsSection'
import { RequestItemDialog } from '@/features/planning/ppmp/catalog/dialogs/RequestItemDialog'
import type { RequestItemFormValues } from '@/features/planning/ppmp/catalog/forms/requestItemFormSchema'
import { useNonCSEItems } from '@/features/planning/ppmp/catalog/hooks/useNonCSEItemQueries'
import { useProcurementModes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import { purchaseRequestRequiresTor } from '../utils/torAttachment'
import { openSignedDocument } from '../utils/openSignedDocument'

import api from '@/services/api'

/**
 * Deduplicate PR Items to guarantee no duplicates in View Details
 * and preserve remaining quantity against set quantity.
 */
function deduplicatePRItems(items: PRItem[]): PRItem[] {
  const result: PRItem[] = []
  const seen = new Map<string, number>()

  for (const item of items) {
    const key = `${item.itemId || item.id || item.itemName}_${item.month || ''}`
    if (seen.has(key)) {
      const idx = seen.get(key)!
      const existing = result[idx]
      const totalQty = (existing.quantity || 0) + (item.quantity || 0)
      const setQty = (existing.setQuantity ?? existing.quantity) + (item.setQuantity ?? item.quantity)
      const unitPrice = existing.unitPrice ?? existing.estimatedUnitPrice ?? item.unitPrice ?? 0
      result[idx] = {
        ...existing,
        quantity: totalQty,
        setQuantity: setQty,
        remainingQuantity: Math.max(0, setQty - totalQty),
        totalAmount: totalQty * unitPrice,
      }
    } else {
      seen.set(key, result.length)
      const setQty = item.setQuantity ?? item.quantity
      result.push({
        ...item,
        setQuantity: setQty,
        remainingQuantity: item.remainingQuantity ?? Math.max(0, setQty - item.quantity),
      })
    }
  }

  return result
}

// Fixed ordered months used across the procurement views
const ORDERED_MONTHS: string[] = [
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

const STATUS_BADGE_CONFIG: Record<
  PRStatus,
  {
    label: string
    color?:
      | 'default'
      | 'destructive'
      | 'success'
      | 'info'
      | 'warning'
      | 'dark'
      | 'secondary'
    variant?: 'outline' | undefined
    icon: LucideIcon
  }
> = {
  draft: { label: 'Draft', color: 'secondary', icon: AlertCircle },
  submitted: {
    label: 'Submitted',
    color: 'info',
    variant: 'outline',
    icon: Send,
  },
  approved: {
    label: 'Approved',
    color: 'success',
    variant: 'outline',
    icon: CheckCircle,
  },
  returned: {
    label: 'Returned',
    color: 'destructive',
    variant: 'outline',
    icon: AlertCircle,
  },
  'for-bac-utilization': {
    label: 'For BAC Utilization',
    color: 'default',
    icon: CheckCircle,
  },
}

interface PRDetailsPageProps {
  pr: PurchaseRequest
  onBack: () => void
  isManagePRView?: boolean
}

export function PRDetailsPage({
  pr: initialPR,
  onBack,
  isManagePRView: isManagePRViewProp,
}: PRDetailsPageProps) {
  const storeIsManagePRView = usePurchaseRequestStore((s) => s.isManagePRView)
  const isManagePRView =
    isManagePRViewProp ??
    (typeof window !== 'undefined' && window.location.pathname.includes('/v2/manage-prs')
      ? storeIsManagePRView
      : false)
  const { activePR, updatePurchaseRequest, setActivePR } =
    usePurchaseRequestStore()
  const statusMutation = useUpdatePurchaseRequestStatus()
  const { mutateAsync: updateApi, isPending: isUpdating } = useUpdatePurchaseRequest()

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  // Always fetch fresh data from the server so edits (purpose, items) are reflected
  // after mutations without requiring a full page reload.
  const { data: freshPRResponse } = usePurchaseRequest({
    pathParams: { id: initialPR.id }
  })

  // Fetch master catalog items so we can accurately distinguish Master Catalog vs Custom / Ad-hoc items
  const { data: nonCseCatalogResponse } = useNonCSEItems({
    pageSize: 200,
    page: 1,
  })

  // Set of known Master Catalog item names and IDs (lowercased for robust matching)
  const masterCatalogIdentifiers = useMemo(() => {
    const set = new Set<string>()
    for (const item of nonCseCatalogResponse?.data ?? []) {
      if (item.id) set.add(item.id.toLowerCase())
      if (item.name) set.add(item.name.trim().toLowerCase())
    }
    for (const item of FALLBACK_NON_CSE_ITEMS) {
      if (item.id) set.add(item.id.toLowerCase())
      if (item.name) set.add(item.name.trim().toLowerCase())
    }
    return set
  }, [nonCseCatalogResponse])

  // Fetch live Procurement Modes from API (/procurement-modes)
  const { data: modesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Live options with graceful Philippine procurement defaults (deduplicated)
  const procurementModeOptions = useMemo<string[]>(() => {
    const rawModes = modesResponse?.data ?? []
    const uniqueNames = Array.from(
      new Set(
        rawModes
          .filter((m) => m.isActive && !m.isArchived && m.name && m.name.trim() !== '')
          .map((m) => (m.name as string).trim())
      )
    )
    if (uniqueNames.length > 0) return uniqueNames
    return FALLBACK_PROCUREMENT_MODES
  }, [modesResponse])

  // Sync server data into activePR whenever a fresh response arrives.
  useEffect(() => {
    const apiData = freshPRResponse?.data
    if (!apiData) return
    if (hasUnsavedChanges) return // Don't overwrite local edits

    const base = activePR ?? initialPR

    // Deduplicate server items by (ppmpItemId || aprItemId || id || name) + requestedMonth
    const deduplicatedItems: PRItem[] = []
    const seenKeys = new Map<string, number>()

    for (const i of apiData.items ?? []) {
      const key = `${i.ppmpItemId || i.aprItemId || i.id || i.name}_${i.requestedMonth || ''}`
      if (seenKeys.has(key)) {
        const existingIdx = seenKeys.get(key)!
        const existing = deduplicatedItems[existingIdx]
        const mergedQty = (existing.quantity || 0) + (i.requestedQuantity || 0)
        const unitCost = existing.unitPrice || i.unitCost || 0
        const mergedSetQty = (existing.setQuantity ?? existing.quantity) + (i.requestedQuantity || 0)
        deduplicatedItems[existingIdx] = {
          ...existing,
          quantity: mergedQty,
          setQuantity: mergedSetQty,
          remainingQuantity: Math.max(0, mergedSetQty - mergedQty),
          totalAmount: mergedQty * unitCost,
        }
      } else {
        seenKeys.set(key, deduplicatedItems.length)
        const isLinkedToOfficePpmp = Boolean(i.ppmpItemId)
        const isLinkedToApr = Boolean(i.aprItemId)
        const isCatalog =
          !isLinkedToOfficePpmp &&
          !isLinkedToApr &&
          (masterCatalogIdentifiers.has((i.name || '').trim().toLowerCase()) ||
            (i.id && masterCatalogIdentifiers.has(i.id.toLowerCase())) ||
            base.items?.some((bi) => bi.itemName === i.name && bi.source === 'catalog'))

        const itemSource = isLinkedToApr
          ? ('apr' as const)
          : isLinkedToOfficePpmp
            ? ('ppmp' as const)
            : isCatalog
              ? ('catalog' as const)
              : ('custom' as const)

        const itemQty = i.requestedQuantity || 0
        const existingLocalItem = base.items?.find(
          (bi) => bi.id === i.id || bi.itemId === i.id || (bi.itemName === i.name && bi.month === i.requestedMonth)
        )
        const catalogMatch =
          (nonCseCatalogResponse?.data ?? []).find(
            (c: any) => (c.id && c.id.toLowerCase() === (i.id || '').toLowerCase()) || (c.name && c.name.trim().toLowerCase() === (i.name || '').trim().toLowerCase())
          ) ??
          FALLBACK_NON_CSE_ITEMS.find(
            (c: any) => (c.id && c.id.toLowerCase() === (i.id || '').toLowerCase()) || (c.name && c.name.trim().toLowerCase() === (i.name || '').trim().toLowerCase())
          )

        const itemCategory =
          i.category ||
          existingLocalItem?.category ||
          catalogMatch?.procurementCategoryName ||
          (catalogMatch as { category?: string })?.category ||
          base.headerDetails?.procurementCategoryName ||
          ''

        const itemFund =
          i.fund ||
          existingLocalItem?.fund ||
          apiData.fundSource ||
          base.headerDetails?.fundCluster ||
          'General Fund'
        
        deduplicatedItems.push({
          id: i.id,
          itemId: i.aprItemId ?? i.ppmpItemId ?? i.id,
          itemName: i.name,
          description: i.description || '',
          category: itemCategory,
          quantity: itemQty,
          setQuantity: itemQty,
          remainingQuantity: 0,
          unitOfMeasure: i.unit || '',
          unitPrice: i.unitCost,
          totalAmount: i.amount || (itemQty * i.unitCost),
          estimatedUnitPrice: i.unitCost,
          month: i.requestedMonth,
          fund: itemFund,
          procurementModeId: i.procurementModeId || existingLocalItem?.procurementModeId,
          procurementModeName: i.procurementModeName || existingLocalItem?.procurementModeName,
          source: itemSource,
          isNonCSE: i.isNonCSE,
          ppmpDocId: i.ppmpId,
          ppmpDocName: i.ppmpNumber
            ? `${i.ppmpNumber} — ${i.officeName || apiData.officeName || ''}`
            : undefined,
          aprId: i.aprId || existingLocalItem?.aprId || (i as any)?.aprItemId || (i as any)?.aprItem?.aprId,
          aprItemId: i.aprItemId || (i as any)?.aprItem?.id,
          aprNumber: i.aprNumber || existingLocalItem?.aprNumber || (i as any)?.aprItem?.apr?.aprNumber || (i as any)?.apr?.aprNumber,
          aprOffice:
            i.aprOfficeName ||
            i.officeName ||
            (i as any)?.aprItem?.apr?.office?.name ||
            (i as any)?.apr?.office?.name ||
            existingLocalItem?.aprOffice ||
            apiData.officeName ||
            base.headerDetails?.officeName ||
            'General Administration',
        })
      }
    }

    const merged: PurchaseRequest = {
      ...base,
      signedPdfUrl: base.signedPdfUrl,
      status: fromApiStatus(apiData.status),
      type: fromApiPrType(apiData.prType),
      totalAmount: apiData.totalAmount,
      remarks: (apiData.status === 'Approved' || apiData.status === 'Submitted' || apiData.status === 'ForBACUtilization') ? undefined : (apiData.returnRemarks || base.remarks),
      returnRemarks: (apiData.status === 'Approved' || apiData.status === 'Submitted' || apiData.status === 'ForBACUtilization') ? undefined : apiData.returnRemarks,
      returnedDate: (apiData.status === 'Approved' || apiData.status === 'Submitted' || apiData.status === 'ForBACUtilization') ? undefined : apiData.returnedDate,
      returnedBy: (apiData.status === 'Approved' || apiData.status === 'Submitted' || apiData.status === 'ForBACUtilization') ? undefined : apiData.returnedBy,
      bacResolutions: apiData.bacResolutions ?? base.bacResolutions ?? [],
      headerDetails: {
        ...base.headerDetails,
        prNumber: apiData.prNumber,
        description: apiData.description ?? '',
        purpose: apiData.purpose ?? '',
        date: apiData.requestedDate,
        uacs: apiData.uacsCode ?? base.headerDetails?.uacs ?? '',
        fundCluster: apiData.fundSource ?? base.headerDetails?.fundCluster ?? '',
        procurementCategoryName: apiData.procurementCategory ?? base.headerDetails?.procurementCategoryName ?? '',
        officeId: apiData.officeId ?? base.headerDetails?.officeId,
        officeName: apiData.officeName ?? base.headerDetails?.officeName,
      },
      items: deduplicatedItems,
    }

    setActivePR(merged)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshPRResponse, hasUnsavedChanges])

  const buildPayloadItems = (items: PRItem[]): UpdatePurchaseRequestItemPayload[] => {
    return items.flatMap((group): UpdatePurchaseRequestItemPayload[] => {
      // Handle legacy grouped APR structure (optimistic items added before server sync)
      if (group.aprGroup && group.aprGroup.items) {
        return group.aprGroup.items.flatMap((aprItem): UpdatePurchaseRequestItemPayload[] => {
          const effectiveMonth = aprItem.month || (aprItem.monthlyQuantities && Object.keys(aprItem.monthlyQuantities)[0]) || 'January'
          const monthsMap = (aprItem.monthlyQuantities && Object.keys(aprItem.monthlyQuantities).length > 0)
            ? aprItem.monthlyQuantities
            : { [effectiveMonth]: aprItem.quantity }
          return Object.entries(monthsMap).filter(([, qty]) => qty > 0).map(([m, qty]) => ({
            aprItemId: aprItem.itemId || aprItem.id,
            name: aprItem.itemName,
            description: aprItem.description || '',
            unitCost: aprItem.unitPrice,
            requestedQuantity: qty,
            stockNo: '',
            isNonCSE: false,
            requestedMonth: m
          }))
        })
      }

      const isApr = group.source === 'apr'
      const isIndependent = group.source === 'independent' || group.source === 'catalog' || group.source === 'custom'
      
      // If there's a monthlyQuantities object (from optimistic UI state), split it up
      if (group.monthlyQuantities && Object.keys(group.monthlyQuantities).length > 0) {
        return Object.entries(group.monthlyQuantities).filter(([, qty]) => qty > 0).map(([m, qty]) => ({
          ppmpItemId: (isApr || isIndependent) ? undefined : (group.itemId || group.id),
          aprItemId: isApr ? (group.itemId || group.id) : undefined,
          name: group.itemName,
          description: group.description || '',
          unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
          requestedQuantity: qty,
          stockNo: group.stockNo || '',
          isNonCSE: group.isNonCSE !== undefined ? group.isNonCSE : !isApr,
          requestedMonth: m
        }))
      }

      // Single month item (synced from server or single-month optimistic)
      return [{
        ppmpItemId: (isApr || isIndependent) ? undefined : (group.itemId || group.id),
        aprItemId: isApr ? (group.itemId || group.id) : undefined,
        name: group.itemName,
        description: group.description || '',
        unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
        requestedQuantity: group.quantity,
        stockNo: group.stockNo || '',
        isNonCSE: group.isNonCSE !== undefined ? group.isNonCSE : !isApr,
        requestedMonth: group.month || 'January',
      }]
    })
  }

  const handleSaveChanges = () => {
    const payloadItems = buildPayloadItems(pr.items)

    toast.promise(
      updateApi({
        pathParams: { id: pr.id },
        queryParams: { id: pr.id },
        payload: {
          description: pr.headerDetails.description || '',
          purpose: pr.headerDetails.purpose || '',
          ...(pr.headerDetails.procurementCategoryId ? { procurementCategoryId: pr.headerDetails.procurementCategoryId } : {}),
          requestedDate: pr.headerDetails.date || new Date().toISOString(),
          items: payloadItems,
        },
      }).then(() => {
        setHasUnsavedChanges(false)
      }),
      {
        loading: 'Saving changes...',
        success: 'PR items updated successfully.',
        error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to save changes.'),
      }
    )
  }

  const rawPr = activePR || initialPR
  const pr = useMemo(() => {
    if (!rawPr) return rawPr
    return {
      ...rawPr,
      items: deduplicatePRItems(rawPr.items || []),
    }
  }, [rawPr])

  // Ground truth: PR status from DB. Only display 'returned' if pr.status is strictly 'returned' (or draft with returnRemarks).
  // Once a PR is 'approved' or 'submitted', it is definitely NOT returned.
  const getDisplayStatus = (p: typeof pr) => {
    if (!p) return 'draft'
    if (p.status === 'approved' || p.status === 'submitted' || p.status === 'for-bac-utilization') {
      return p.status
    }
    if (p.status === 'returned') {
      return 'returned'
    }
    if (
      p.status === 'draft' &&
      ((p.remarks && p.remarks.toString().trim().length > 0) ||
        ((p as any).returnRemarks && (p as any).returnRemarks.toString().trim().length > 0))
    ) {
      return 'returned'
    }
    return p.status || 'draft'
  }
  const displayStatus = getDisplayStatus(pr)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddItems, setShowAddItems] = useState(false)
  const [showShoppingModal, setShowShoppingModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false)
  const [expandedPPMPs, setExpandedPPMPs] = useState<Set<string>>(new Set(['independent-items']))
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')
  const [torSubmitError, setTorSubmitError] = useState<string | null>(null)
  const torSectionRef = useRef<HTMLDivElement | null>(null)

  const isIndependentPR = Boolean(
    pr.isIndependent ||
    pr.headerDetails?.isIndependent ||
    pr.headerDetails?.sourceType === 'INDEPENDENT' ||
    pr.headerDetails?.prNumber?.startsWith('PR-IND') ||
    pr.prNumber?.startsWith('PR-IND') ||
    pr.items.some((item) => item.source === 'independent' || item.source === 'catalog' || item.source === 'custom')
  )

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean
    ppmpId: string | null
    ppmpName: string | null
    itemIds: string[]
    type?: 'ppmp' | 'apr'
  }>({
    isOpen: false,
    ppmpId: null,
    ppmpName: null,
    itemIds: [],
    type: 'ppmp',
  })

  const [requestItemModalOpen, setRequestItemModalOpen] = useState(false)
  const [prefilledRequestItem, setPrefilledRequestItem] = useState<Partial<RequestItemFormValues> | null>(null)

  const handleOpenSubmitItemRequest = (item: PRItem) => {
    setPrefilledRequestItem({
      name: item.itemName,
      specifications: item.description || `Procurement specification for ${item.itemName}`,
      estimatedUnitCost: item.unitPrice ?? item.estimatedUnitPrice ?? 0,
      procurementCategory: 'Goods',
      itemCategory: item.category || 'Other Non-CSE Goods & Equipment',
      unitOfMeasure: item.unitOfMeasure || 'unit',
    })
    setRequestItemModalOpen(true)
  }

  const navigate = useNavigate()
  const [generatingDocId, setGeneratingDocId] = useState<string | null>(null)
  const { mutateAsync: generateBACResolutionDocument } = useGenerateBACResolutionDocument()
  const { mutateAsync: downloadBacResolutionDocument } = useDownloadBacResolutionDocument()

  const linkedBacResolutions: PRBacResolutionApi[] = useMemo(() => {
    return pr?.bacResolutions ?? freshPRResponse?.data?.bacResolutions ?? []
  }, [pr?.bacResolutions, freshPRResponse?.data?.bacResolutions])

  const owningBacResolution = linkedBacResolutions[0] ?? null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const handleViewOrDownloadDocument = async (
    resolution: PRBacResolutionApi,
    action: 'view' | 'download',
  ) => {
    if (!resolution.id) {
      toast.error('No BAC Resolution identifier available.')
      return
    }

    try {
      setGeneratingDocId(resolution.id)
      const genResponse = await generateBACResolutionDocument({
        pathParams: { id: resolution.id },
        queryParams: { format: 'Pdf' },
      })

      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('Document generation service did not return a document ID.')
      }

      const downloadResponse = await downloadBacResolutionDocument({
        pathParams: { documentId },
      })

      const blob = downloadResponse.blob
      const filename = `BAC_Resolution_${resolution.resolutionNumber || resolution.id}.pdf`

      if (action === 'view') {
        const fileUrl = URL.createObjectURL(blob)
        window.open(fileUrl, '_blank')
      } else {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
        toast.success('BAC Resolution document downloaded successfully.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate BAC Resolution document.')
    } finally {
      setGeneratingDocId(null)
    }
  }

  if (!pr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">PR not found</p>
      </div>
    )
  }

  const requiresTorAttachment = useMemo(
    () => purchaseRequestRequiresTor(pr),
    [pr],
  )
  const hasTorAttachment = Boolean(pr.torAttachment?.url)

  useEffect(() => {
    if (hasTorAttachment && torSubmitError) {
      setTorSubmitError(null)
    }
  }, [hasTorAttachment, torSubmitError])

  // Group items by PPMP Doc ID (for non-CSE PRs)
  const groupedPPMPs =
    pr.type === 'non-cse'
      ? Array.from(
          pr.items.reduce((map, item) => {
            const ppmpId = item.ppmpDocId || (item.source === 'independent' || item.source === 'catalog' || item.source === 'custom' ? 'independent-items' : 'unknown')
            if (!map.has(ppmpId)) {
              map.set(ppmpId, [])
            }
            map.get(ppmpId)!.push(item)
            return map
          }, new Map<string, PRItem[]>()),
        ).map(([ppmpId, items]) => ({ ppmpId, items }))
      : []

  // Auto-expand all item groups by default so items and actions (like Submit as Item Request) are visible
  useEffect(() => {
    if (groupedPPMPs.length > 0) {
      setExpandedPPMPs((prev) => {
        const next = new Set(prev)
        for (const g of groupedPPMPs) {
          next.add(g.ppmpId)
        }
        return next
      })
    }
  }, [groupedPPMPs.length])

  // Group items by APR (for out-of-stock PRs)
  const groupedAPRs = useMemo(() => {
    if (pr.type !== 'out-of-stock') return []

    // 1. If items already have aprGroup wrapper (e.g. freshly added via modal before server sync)
    const wrappedGroups = (pr.items || []).filter((i) => i.aprGroup)
    if (wrappedGroups.length > 0) {
      return wrappedGroups
    }

    // 2. Otherwise, group flat items by APR (from server or after save)
    const flatItems = (pr.items || []).filter((i) => !i.aprGroup)
    if (flatItems.length === 0) return []

    const map = new Map<string, PRItem[]>()
    for (const item of flatItems) {
      const key = item.aprNumber || item.aprId || 'APR-2026-0001'
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(item)
    }

    return Array.from(map.entries()).map(([aprKey, items], idx) => {
      const first = items[0]
      const aprId = first.aprId || `apr-${idx}`
      const aprNumber = first.aprNumber || (aprKey.startsWith('APR') ? aprKey : `APR-${aprKey}`)
      const officeName = first.aprOffice || pr.headerDetails?.officeName || 'Innovation and Technology Solutions Division'
      const totalAmount = items.reduce((s, it) => s + (it.totalAmount || 0), 0)

      return {
        id: `apr-group-${aprKey}`,
        itemId: `apr-group-${aprKey}`,
        itemName: `${aprNumber} (${officeName})`,
        category: 'Consolidated APR',
        quantity: items.length,
        unitOfMeasure: 'group',
        unitPrice: totalAmount,
        totalAmount,
        source: 'apr' as const,
        aprId,
        aprNumber,
        aprOffice: officeName,
        aprGroup: {
          id: aprId,
          aprId,
          aprNumber,
          officeName,
          totalAmount,
          items,
        },
      } as PRItem
    })
  }, [pr.items, pr.type, pr.headerDetails?.officeName])

  // Count APR-grouped PR items (for out-of-stock/consolidated PRs)
  const aprGroupCount = groupedAPRs.length

  // Auto-expand all APR groups by default so items are immediately visible
  useEffect(() => {
    if (groupedAPRs.length > 0) {
      setExpandedPPMPs((prev) => {
        const next = new Set(prev)
        for (const g of groupedAPRs) {
          const aprId = g.aprGroup?.id || g.aprGroup?.aprId || ''
          if (aprId) next.add(aprId)
        }
        return next
      })
    }
  }, [groupedAPRs])

  const toggleExpandPPMP = (ppmpId: string) => {
    const newExpanded = new Set(expandedPPMPs)
    if (newExpanded.has(ppmpId)) {
      newExpanded.delete(ppmpId)
    } else {
      newExpanded.add(ppmpId)
    }
    setExpandedPPMPs(newExpanded)
  }

  // Get unique categories, months, and funds from items
  const categories =
    pr.type === 'non-cse'
      ? Array.from(
          new Set(
            pr.items
              .map((item) => item.category)
              .filter((c): c is string => Boolean(c) && c !== '')
          )
        ).sort()
      : []

  const months =
    pr.type === 'non-cse'
      ? Array.from(
          new Set(
            pr.items
              .map((item) => item.month)
              .filter((m): m is string => Boolean(m) && m !== '')
          )
        ).sort()
      : []

  const funds =
    pr.type === 'non-cse'
      ? Array.from(
          new Set(
            pr.items
              .map((item) => item.fund)
              .filter((f): f is string => Boolean(f) && f !== '')
          )
        ).sort()
      : []

  // Filter grouped PPMPs based on search and filters
  const filteredGroupedPPMPs =
    pr.type === 'non-cse'
      ? groupedPPMPs
          .map(({ ppmpId, items }) => {
            const filteredItems = items.filter((item) => {
              const matchesSearch =
                searchTerm === '' ||
                item.itemName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())

              const matchesCategory =
                categoryFilter === 'all' || item.category === categoryFilter
              const matchesMonth =
                monthFilter === 'all' || item.month === monthFilter
              const matchesFund =
                fundFilter === 'all' || item.fund === fundFilter

              return (
                matchesSearch &&
                matchesCategory &&
                matchesMonth &&
                matchesFund
              )
            })

            return { ppmpId, items: filteredItems }
          })
          .filter(({ items }) => items.length > 0)
      : []

  const openDeletePPMPDialog = (
    ppmpId: string,
    ppmpName: string,
    items: PRItem[],
  ) => {
    const itemIds = items.map((i) => i.id)
    setDeleteConfirmDialog({
      isOpen: true,
      ppmpId,
      ppmpName,
      itemIds,
      type: 'ppmp',
    })
  }

  const openDeleteAPRGroupDialog = (
    aprGroupNumber: string,
    displayName: string,
    items: PRItem[],
  ) => {
    const itemIds = items.map((i) => i.id)
    setDeleteConfirmDialog({
      isOpen: true,
      ppmpId: aprGroupNumber,
      ppmpName: displayName || `APR #${aprGroupNumber}`,
      itemIds,
      type: 'apr',
    })
  }

  const handleConfirmDelete = () => {
    const { ppmpId, type } = deleteConfirmDialog

    if (type === 'apr') {
      const updatedItems = pr.items.filter((item) => {
        if (!item.aprGroup) return true
        return item.aprGroup.aprNumber !== ppmpId
      })

      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      )

      updatePurchaseRequest(pr.id, {
        items: updatedItems,
        totalAmount: newTotal,
      })
      setHasUnsavedChanges(true)

      toast.success('APR Removed', {
        description: 'The APR and its items have been removed.',
      })
    } else {
      const updatedItems = pr.items.filter((item) => {
        const itemPpmpId = item.ppmpDocId || (item.source === 'independent' || item.source === 'catalog' || item.source === 'custom' ? 'independent-items' : 'unknown')
        return itemPpmpId !== ppmpId
      })

      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      )

      updatePurchaseRequest(pr.id, {
        items: updatedItems,
        totalAmount: newTotal,
      })
      setHasUnsavedChanges(true)

      toast.success('Office PPMP Removed', {
        description: 'The Office PPMP and its items have been removed.',
      })
    }

    setDeleteConfirmDialog({
      isOpen: false,
      ppmpId: null,
      ppmpName: null,
      itemIds: [],
      type: 'ppmp',
    })
  }

  const handleUpdateItemProcurementMode = (
    item: PRItem,
    selectedModeName?: string,
    modeId?: string,
  ) => {
    const updatedItems = pr.items.map((pi) => {
      if (pi.id === item.id) {
        return {
          ...pi,
          procurementModeName: selectedModeName,
          procurementModeId: modeId || (selectedModeName ? pi.procurementModeId : undefined),
        }
      }
      return pi
    })
    updatePurchaseRequest(pr.id, {
      items: updatedItems,
    })
    setActivePR({
      ...pr,
      items: updatedItems,
    })
    setHasUnsavedChanges(true)
  }

  const handleUpdatePPMPItemQuantity = (item: PRItem, val: number) => {
    const unitPrice = item.unitPrice ?? item.estimatedUnitPrice ?? 0
    const updatedItems = pr.items.map((pi) => {
      if (pi.id === item.id) {
        const setQty = pi.setQuantity ?? (pi.quantity > 0 ? pi.quantity : val)
        const remainingQty = Math.max(0, setQty - val)
        return {
          ...pi,
          quantity: val,
          setQuantity: setQty,
          remainingQuantity: remainingQty,
          totalAmount: val * unitPrice,
        }
      }
      return pi
    })

    const newTotal = updatedItems.reduce((s, it) => s + (it.totalAmount || 0), 0)
    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setActivePR({
      ...pr,
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)
  }

  const handleDeletePPMPItem = (item: PRItem) => {
    const updatedItems = pr.items.filter((pi) => pi.id !== item.id)
    const newTotal = updatedItems.reduce((s, it) => s + (it.totalAmount || 0), 0)
    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setActivePR({
      ...pr,
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)
    toast.success('Item Removed', {
      description: `${item.itemName} (${item.month}) removed from PR.`,
    })
  }

  const handleUpdateAPRMonthlyQuantity = (
    groupItemId: string,
    innerItem: PRItem,
    month: string,
    val: number,
  ) => {
    const hasWrapper = pr.items.some((pi) => pi.id === groupItemId && Boolean(pi.aprGroup))
    const updatedItems: PRItem[] = hasWrapper
      ? pr.items.map((pi) => {
          if (pi.id !== groupItemId) return pi
          const updatedAprGroup: PRItem['aprGroup'] = {
            ...(pi.aprGroup || {}),
            items: (pi.aprGroup?.items || []).map((inner: PRItem) => {
              if (inner.id !== innerItem.id) return inner
              const prevMonthly =
                inner.monthlyQuantities && Object.keys(inner.monthlyQuantities).length > 0
                  ? { ...inner.monthlyQuantities }
                  : inner.month
                    ? { [inner.month]: inner.quantity }
                    : {}
              const nextMonthly = { ...prevMonthly, [month]: val }
              const computedQty = ORDERED_MONTHS.reduce(
                (s: number, mm: string) => s + (nextMonthly[mm] || 0),
                0,
              )
              return {
                ...inner,
                monthlyQuantities: nextMonthly,
                editedNeeded: computedQty,
                quantity: computedQty,
                outOfStockQuantity: computedQty,
                totalAmount: computedQty * (inner.unitPrice || 0),
              }
            }),
          }
          const newGroupTotal = (updatedAprGroup.items || []).reduce(
            (s: number, it: PRItem) => s + (it.totalAmount || 0),
            0,
          )
          const newGroupQty = (updatedAprGroup.items || []).reduce(
            (s: number, it: PRItem) => s + (it.quantity || 0),
            0,
          )
          return {
            ...pi,
            aprGroup: updatedAprGroup,
            quantity: newGroupQty,
            totalAmount: newGroupTotal,
          }
        })
      : pr.items.map((pi) => {
          if (pi.id !== innerItem.id && pi.itemId !== innerItem.itemId) return pi
          const prevMonthly =
            pi.monthlyQuantities && Object.keys(pi.monthlyQuantities).length > 0
              ? { ...pi.monthlyQuantities }
              : pi.month
                ? { [pi.month]: pi.quantity }
                : {}
          const nextMonthly = { ...prevMonthly, [month]: val }
          const computedQty = ORDERED_MONTHS.reduce(
            (s: number, mm: string) => s + (nextMonthly[mm] || 0),
            0,
          )
          return {
            ...pi,
            monthlyQuantities: nextMonthly,
            editedNeeded: computedQty,
            quantity: computedQty,
            outOfStockQuantity: computedQty,
            totalAmount: computedQty * (pi.unitPrice || 0),
          }
        })

    const newTotal = updatedItems.reduce((s, it) => s + (it.totalAmount || 0), 0)
    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setActivePR({
      ...pr,
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)
  }

  const handleDeleteAPRItem = (groupItemId: string, innerItem: PRItem) => {
    const hasWrapper = pr.items.some((pi) => pi.id === groupItemId && Boolean(pi.aprGroup))
    const updatedItems: PRItem[] = hasWrapper
      ? pr.items
          .map((pi) => {
            if (pi.id !== groupItemId) return pi
            const remaining = (pi.aprGroup?.items || []).filter((inner) => inner.id !== innerItem.id)
            const newTotal = remaining.reduce((s, it) => s + (it.totalAmount || 0), 0)
            const newQty = remaining.reduce((s, it) => s + (it.quantity || 0), 0)
            return {
              ...pi,
              aprGroup: { ...(pi.aprGroup || {}), items: remaining },
              quantity: newQty,
              totalAmount: newTotal,
            }
          })
          .filter((pi) => !pi.aprGroup || (pi.aprGroup.items && pi.aprGroup.items.length > 0))
      : pr.items.filter((pi) => pi.id !== innerItem.id && pi.itemId !== innerItem.itemId)

    const newTotal = updatedItems.reduce((s, it) => s + (it.totalAmount || 0), 0)
    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setActivePR({
      ...pr,
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)
    toast.success('Item Removed', {
      description: `${innerItem.itemName} removed from PR.`,
    })
  }

  const handleAddItems = (items: PRItem[]) => {
    const updatedItems = [...pr.items]

    for (const incoming of items) {
      const incomingKey = (incoming.itemId || incoming.id || incoming.itemName) + `_${incoming.month || ''}`
      const existingIndex = updatedItems.findIndex((existing) => {
        const existingKey = (existing.itemId || existing.id || existing.itemName) + `_${existing.month || ''}`
        return existingKey === incomingKey || existing.id === incoming.id
      })

      if (existingIndex >= 0) {
        const existing = updatedItems[existingIndex]
        const incomingSetQty = incoming.setQuantity ?? incoming.quantity
        const currentSetQty = existing.setQuantity ?? existing.quantity
        const newSetQty = currentSetQty + incomingSetQty
        const newQty = existing.quantity + incoming.quantity
        const unitCost = existing.unitPrice ?? existing.estimatedUnitPrice ?? incoming.unitPrice ?? 0

        updatedItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          setQuantity: newSetQty,
          remainingQuantity: Math.max(0, newSetQty - newQty),
          totalAmount: newQty * unitCost,
        }
      } else {
        const setQty = incoming.setQuantity ?? incoming.quantity
        updatedItems.push({
          ...incoming,
          setQuantity: setQty,
          remainingQuantity: incoming.remainingQuantity ?? Math.max(0, setQty - incoming.quantity),
        })
      }
    }

    const newTotal = updatedItems.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0,
    )

    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)

    toast.success('Items Added', {
      description: `${items.length} item(s) processed.`,
    })

    setShowAddItems(false)
    setShowShoppingModal(false)
  }

  const handleSubmitPR = () => {
    if (pr.items.length === 0) {
      toast.error('Submission Failed', {
        description: 'Please add at least one item before submitting.',
      })
      return
    }

    if (requiresTorAttachment && !hasTorAttachment) {
      const nextError =
        'Upload the Terms of Reference before submitting this PR.'
      setTorSubmitError(nextError)
      torSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      toast.error('Submission Failed', {
        description: nextError,
      })
      return
    }

    setTorSubmitError(null)
    setShowSubmitConfirmDialog(true)
  }

  const handleConfirmSubmitPR = async () => {
    const payloadItems = buildPayloadItems(pr.items)

    toast.promise(
      (async () => {
        // Persist items & header to backend first
        await updateApi({
          pathParams: { id: pr.id },
          queryParams: { id: pr.id },
          payload: {
            description: pr.headerDetails.description || '',
            purpose: pr.headerDetails.purpose || '',
            ...(pr.headerDetails.procurementCategoryId ? { procurementCategoryId: pr.headerDetails.procurementCategoryId } : {}),
            requestedDate: pr.headerDetails.date || new Date().toISOString(),
            items: payloadItems,
          },
        })
        setHasUnsavedChanges(false)

        // Then execute status transition to Submitted
        await statusMutation.mutateAsync({
          pathParams: { id: pr.id },
          queryParams: { id: pr.id },
          payload: { prId: pr.id, newStatus: 'Submitted' },
        })
        updatePurchaseRequest(pr.id, { status: 'submitted', remarks: undefined, updatedAt: new Date().toISOString() })
      })(),
      {
        loading: 'Submitting Purchase Request...',
        success: `${pr.headerDetails.prNumber} is now waiting for approval.`,
        error: (error: unknown) => (error instanceof Error ? error.message : 'Unable to submit the PR. Please try again.'),
      }
    )
    setShowSubmitConfirmDialog(false)
  }

  const handleReturnPR = async (remarks: string) => {
    await toast.promise(
      statusMutation.mutateAsync({
        pathParams: { id: pr.id },
        queryParams: { id: pr.id },
        payload: { prId: pr.id, newStatus: 'Returned', remarks },
      }).then(() => {
        updatePurchaseRequest(pr.id, { status: 'returned', remarks, updatedAt: new Date().toISOString() })
      }),
      {
        loading: 'Returning Purchase Request...',
        success: 'The purchase request has been returned with remarks.',
        error: (error: unknown) => (error instanceof Error ? error.message : 'Unable to return the PR. Please try again.'),
      }
    )
    setShowReturnModal(false)
  }

  const handleApprovePR = async (signedPdfUrl: string) => {
    await toast.promise(
      statusMutation.mutateAsync({
        pathParams: { id: pr.id },
        queryParams: { id: pr.id },
        payload: { prId: pr.id, newStatus: 'Approved' },
      }).then(() => {
        updatePurchaseRequest(pr.id, { status: 'approved', signedPdfUrl, remarks: undefined, updatedAt: new Date().toISOString() })
      }),
      {
        loading: 'Approving Purchase Request...',
        success: 'The purchase request has been approved successfully.',
        error: (error: unknown) => (error instanceof Error ? error.message : 'Unable to approve the PR. Please try again.'),
      }
    )
    setShowApproveModal(false)
  }

  const handleExportPR = async () => {
    setIsExporting(true)
    const toastId = toast.loading('Preparing Purchase Request PDF...')
    try {
      if (hasUnsavedChanges) {
        toast.loading('Saving changes before exporting...', { id: toastId })
        const payloadItems = buildPayloadItems(pr.items)
        await updateApi({
          pathParams: { id: pr.id },
          queryParams: { id: pr.id },
          payload: {
            description: pr.headerDetails.description || '',
            purpose: pr.headerDetails.purpose || '',
            ...(pr.headerDetails.procurementCategoryId ? { procurementCategoryId: pr.headerDetails.procurementCategoryId } : {}),
            requestedDate: pr.headerDetails.date || new Date().toISOString(),
            items: payloadItems,
          },
        })
        setHasUnsavedChanges(false)
      }

      toast.loading('Generating Purchase Request PDF...', { id: toastId })
      const response = await api.post<{ succeeded: boolean; data: string; message: string }>(
        `/api/planning/documents/purchase-request/${pr.id}/generate?format=Pdf`
      )
      const documentId = response.data?.data
      if (documentId) {
        toast.loading('Downloading Purchase Request PDF...', { id: toastId })
        const downloadRes = await api.get(`/api/planning/documents/${documentId}/download`, {
          responseType: 'blob',
        })
        const blob = new Blob([downloadRes.data], {
          type: 'application/pdf',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PR_${pr.headerDetails.prNumber || pr.id}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Purchase Request PDF downloaded successfully.', { id: toastId })
      } else {
        toast.error('Failed to generate PR document.', { id: toastId })
      }
    } catch (err: unknown) {
      console.error('❌ PR document generation error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to generate Purchase Request PDF.', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  const StatusIcon = STATUS_BADGE_CONFIG[displayStatus].icon
  const isDraftOrReturned = pr.status === 'draft' || pr.status === 'returned' || displayStatus === 'returned'
  const isEditable = isDraftOrReturned && !isManagePRView
  const canAddItems = isEditable
  const canSubmit = isEditable && pr.items.length > 0
  const canReturn = pr.status === 'submitted' && Boolean(isManagePRView)
  const canApprove = pr.status === 'submitted' && Boolean(isManagePRView)

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* PR Header Card - Modern Design */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {pr.headerDetails.prNumber}
                </CardTitle>
                <Badge
                  color={STATUS_BADGE_CONFIG[displayStatus].color}
                  variant={STATUS_BADGE_CONFIG[displayStatus].variant}
                  className="text-xs font-semibold px-3 py-1"
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {STATUS_BADGE_CONFIG[displayStatus].label}
                </Badge>
                {pr.approvalOrigin === 'APPROVED_VIA_BAC' && (
                  <Badge className="bg-emerald-600 text-white font-semibold text-xs px-3 py-1">
                    Approved via BAC Resolution ({pr.bacResolutionNumber || 'Path A'})
                  </Badge>
                )}
              </div>
              {pr.headerDetails.description && (
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {pr.headerDetails.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pr.approvalOrigin === 'APPROVED_VIA_BAC' && (
                <Button
                  size="sm"
                  className="gap-2 h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => {
                    const mode = (pr.modeOfProcurement || pr.headerDetails?.modeOfProcurement || '').toLowerCase()
                    let targetPath = '/v2/bidding-master-calendar'
                    if (mode.includes('direct')) targetPath = '/v2/direct-contracting-request'
                    else if (mode.includes('shopping') || mode.includes('small value') || mode.includes('svp')) targetPath = '/v2/rfq'
                    if (typeof window !== 'undefined') {
                      window.location.href = targetPath
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Proceed to Execution
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 border-slate-200 dark:border-slate-700"
                onClick={handleExportPR}
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              {(pr.signedPdfUrl || pr.status === 'approved') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 border-purple-300 text-purple-900 bg-purple-50/50 hover:bg-purple-100/50 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                  onClick={() => {
                    if (pr.signedPdfUrl) {
                      openSignedDocument(pr.signedPdfUrl, 'Signed PR Document')
                    } else {
                      handleExportPR()
                    }
                  }}
                >
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  View Signed Document
                </Button>
              )}
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="gap-2 shadow-sm"
                >
                  Save Changes
                </Button>
              )}
              {canReturn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setShowReturnModal(true)}
                >
                  <AlertCircle className="h-4 w-4" />
                  Return
                </Button>
              )}
              {canApprove && (
                <Button
                  size="sm"
                  className="gap-2 h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={() => setShowApproveModal(true)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {canSubmit && (
                <Button
                  size="sm"
                  className="gap-2 h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  onClick={handleSubmitPR}
                >
                  <Send className="h-4 w-4" />
                  {pr.status === 'returned' || displayStatus === 'returned' ? 'Resubmit PR' : 'Submit'}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-slate-200 dark:border-slate-700"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isEditable && (
                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                  )}
                  {canReturn && (
                    <DropdownMenuItem onClick={() => setShowReturnModal(true)}>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Return
                    </DropdownMenuItem>
                  )}
                  {canApprove && (
                    <DropdownMenuItem onClick={() => setShowApproveModal(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Return Reason Card — shown when PR has been returned (matching RFQ style) */}
      <PRReturnRemarksBanner
        displayStatus={displayStatus}
        prStatus={pr.status}
        returnedDate={pr.returnedDate}
        returnedBy={pr.returnedBy}
        returnRemarks={pr.returnRemarks}
        remarks={pr.remarks}
      />

      {/* PR Details Grid */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PR Date */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/50 hover:shadow-sm transition-shadow min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-blue-100 dark:bg-transparent dark:border-blue-800 shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    PR Date
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {pr.headerDetails.date
                      ? new Date(pr.headerDetails.date).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Procurement Category */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50 hover:shadow-sm transition-shadow min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-cyan-100 dark:bg-transparent dark:border-cyan-800 shrink-0">
                  <Tag className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                    Category
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate" title={pr.headerDetails.procurementCategoryName || 'Goods and General Services'}>
                    {pr.headerDetails.procurementCategoryName || 'Goods and General Services'}
                  </p>
                </div>
              </div>
            </div>

            {/* Total PR Amount */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-sm transition-shadow min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white/70 border border-emerald-100 dark:bg-transparent dark:border-emerald-800 shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Total PR Amount
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                    ₱{pr.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800/30 dark:to-slate-700/20 border border-slate-300 dark:border-slate-600/50 hover:shadow-sm transition-shadow col-span-full">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Purpose
              </p>
              <p className="text-sm font-normal text-slate-800 dark:text-slate-100 break-words">
                {pr.headerDetails.purpose || '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section (Terms of Reference) */}
      <PRAttachmentsPanel
        pr={pr}
        torValidationMessage={torSubmitError}
      />

      {/* ── Unified BAC Resolution Section ───────────────────────────── */}
      {linkedBacResolutions.length > 0 ? (
        <Card className="border border-purple-200/90 dark:border-purple-800/70 bg-gradient-to-br from-purple-50/90 via-purple-50/50 to-white dark:from-purple-950/50 dark:via-purple-950/30 dark:to-card shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-purple-100/50 dark:bg-purple-900/30 pb-3 pt-3.5 px-6 border-b border-purple-200/80 dark:border-purple-800/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-200/80 dark:bg-purple-800/60 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    BAC Resolution
                  </CardTitle>
                  <p className="text-[11px] text-purple-950/70 dark:text-purple-300/80 font-medium">
                    Procurement milestone & resolution context
                  </p>
                </div>
              </div>
              {owningBacResolution && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 dark:bg-background/90 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 font-semibold gap-1.5 shadow-xs"
                  onClick={() =>
                    navigate({
                      to: '/v2/bac-resolutions',
                      search: { id: owningBacResolution.procurementProjectId },
                    })
                  }
                >
                  View BAC Details
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-5 pb-6 px-6">
            {linkedBacResolutions.map((resolution, index) => (
              <div key={resolution.id || index} className="space-y-4">
                {index > 0 && <Separator className="my-4 border-purple-200/60 dark:border-purple-800/40" />}

                {/* Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* BAC Status */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      BAC Status
                    </p>
                    <div>
                      <BacResolutionStatusBadge status={resolution.status} />
                    </div>
                  </div>

                  {/* Resolution No. */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      Resolution No.
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {resolution.resolutionNumber}
                    </p>
                  </div>

                  {/* Resolution Type */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      Resolution Type
                    </p>
                    <p className="text-sm font-medium text-foreground/90 truncate capitalize">
                      {resolution.resolutionType?.replace(/[-_]/g, ' ') || '—'}
                    </p>
                  </div>

                  {/* Source */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      Source
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0.5 px-2.5 rounded-full border-purple-300 text-purple-800 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-900/50 font-medium"
                    >
                      {resolution.sourceType === 'APPItem'
                        ? 'Inherited from APP Item'
                        : 'Created from Consolidated PR'}
                    </Badge>
                  </div>

                  {/* Resolution Date */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      Resolution Date
                    </p>
                    <p className="text-sm text-foreground/80 font-medium">
                      {resolution.dateResolved
                        ? new Date(resolution.dateResolved).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>

                  {/* ABC */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      ABC
                    </p>
                    <div>
                      <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-purple-200 text-purple-900 dark:text-purple-200 bg-white/80 dark:bg-card">
                        {formatCurrency(resolution.abc)}
                      </Badge>
                    </div>
                  </div>

                  {/* Procurement / BAC Project Title */}
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-6 space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-950/70 dark:text-purple-300/80">
                      Procurement / BAC Project
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {resolution.projectTitle || resolution.resolutionType || '—'}
                    </p>
                    {resolution.resolvedLocation && (
                      <p className="text-xs text-muted-foreground pt-0.5">
                        Location: <span className="font-medium text-foreground/80">{resolution.resolvedLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* BAC Resolution Document Sub-Panel */}
                <div className="rounded-xl border border-purple-200/90 dark:border-purple-800/70 bg-purple-50/70 dark:bg-purple-950/50 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/80 dark:border-purple-800/60">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        BAC Resolution Document
                      </p>
                      <p className="text-[11px] text-purple-900/80 dark:text-purple-300/90 font-mono font-medium truncate">
                        BAC_Resolution_{resolution.resolutionNumber || resolution.id}.pdf
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generatingDocId === resolution.id}
                      className="h-8 gap-1.5 text-xs bg-white dark:bg-card hover:bg-purple-50 dark:hover:bg-purple-900/40 text-foreground border-purple-200 dark:border-purple-800 font-medium shadow-xs"
                      onClick={() => handleViewOrDownloadDocument(resolution, 'view')}
                    >
                      {generatingDocId === resolution.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generatingDocId === resolution.id}
                      className="h-8 gap-1.5 text-xs bg-white dark:bg-card hover:bg-purple-50 dark:hover:bg-purple-900/40 text-foreground border-purple-200 dark:border-purple-800 font-medium shadow-xs"
                      onClick={() => handleViewOrDownloadDocument(resolution, 'download')}
                    >
                      {generatingDocId === resolution.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-dashed border-purple-200/80 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-purple-100/30 dark:bg-purple-900/20 pb-3 pt-3.5 px-6 border-b border-purple-100/80 dark:border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold text-muted-foreground">
                BAC Resolution
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-6 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                No BAC Resolution yet
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This Purchase Request has not been assigned or linked to an active BAC Resolution. You can create or manage BAC Resolutions in the BAC workspace.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 bg-white dark:bg-card shadow-xs"
              onClick={() => navigate({ to: '/v2/bac-resolutions' })}
            >
              Go to BAC Workspace
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Items/PPMPs Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {isIndependentPR
                  ? 'Requisition Items'
                  : pr.type === 'non-cse'
                    ? 'Office PPMPs'
                    : 'APRs'}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                {isIndependentPR
                  ? `${pr.items.length} item${pr.items.length !== 1 ? 's' : ''} in Purchase Request`
                  : pr.type === 'non-cse'
                    ? (() => {
                        const uniquePPMPs = new Set(
                          pr.items
                            .filter((item) => item.ppmpDocId)
                            .map((item) => item.ppmpDocId),
                        )
                        const ppmpCount = uniquePPMPs.size
                        return `${ppmpCount} Office PPMP${ppmpCount !== 1 ? 's' : ''} selected`
                      })()
                    : (() => {
                        return `${aprGroupCount} APR${aprGroupCount !== 1 ? 's' : ''} selected`
                      })()}
              </CardDescription>
            </div>

            <div className="flex gap-3 items-end justify-between">
              <div className="flex gap-3 items-end flex-1">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        isIndependentPR
                          ? 'Search by item name, category, or code...'
                          : pr.type === 'non-cse'
                            ? 'Search by item name, category, or PPMP...'
                            : 'Search by APR number, office, or item...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>

                <div style={{ minWidth: 'fit-content' }}>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {months.length > 0 && (
                  <div style={{ minWidth: 'fit-content' }}>
                    <Select value={monthFilter} onValueChange={setMonthFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div style={{ minWidth: 'fit-content' }}>
                  <Select value={fundFilter} onValueChange={setFundFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Funds</SelectItem>
                      {funds.map((fund) => (
                        <SelectItem key={fund} value={fund}>
                          {fund}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {canAddItems && (
                <div className="flex items-center gap-2">
                  {isIndependentPR ? (
                    <Button
                      onClick={() => setShowShoppingModal(true)}
                      size="sm"
                      className="gap-2 flex-shrink-0"
                    >
                      <Boxes className="h-4 w-4" />
                      Add Non-CSE Items
                    </Button>
                  ) : pr.type === 'non-cse' ? (
                    <Button
                      onClick={() => setShowAddItems(true)}
                      size="sm"
                      className="gap-2 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add Office PPMP
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowAddItems(true)}
                      size="sm"
                      className="gap-2 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add APR
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pr.type !== 'non-cse' && aprGroupCount === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No APRs added yet</p>
              {canAddItems && (
                <Button
                  onClick={() => setShowAddItems(true)}
                  variant="outline"
                  size="sm"
                >
                  Add APR
                </Button>
              )}
            </div>
          ) : pr.items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {isIndependentPR
                  ? 'No Non-CSE items added yet'
                  : pr.type === 'non-cse'
                    ? 'No Office PPMP or items added yet'
                    : 'No items added yet'}
              </p>
              {canAddItems && (
                <div className="flex items-center justify-center gap-3">
                  {isIndependentPR ? (
                    <Button
                      onClick={() => setShowShoppingModal(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Boxes className="h-4 w-4" />
                      Add Non-CSE Items
                    </Button>
                  ) : pr.type === 'non-cse' ? (
                    <Button
                      onClick={() => setShowAddItems(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Office PPMP
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowAddItems(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add APR
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : pr.type === 'non-cse' ? (
            <PRPPMPItemsSection
              filteredGroupedPPMPs={filteredGroupedPPMPs}
              expandedPPMPs={expandedPPMPs}
              toggleExpandPPMP={toggleExpandPPMP}
              isEditable={isEditable}
              masterCatalogIdentifiers={masterCatalogIdentifiers}
              modesResponseData={modesResponse?.data}
              procurementModeOptions={procurementModeOptions}
              onUpdateProcurementMode={handleUpdateItemProcurementMode}
              onUpdateItemQuantity={handleUpdatePPMPItemQuantity}
              onDeleteItem={handleDeletePPMPItem}
              onDeletePPMPGroup={openDeletePPMPDialog}
              onOpenSubmitItemRequest={handleOpenSubmitItemRequest}
            />
          ) : (
            <PRAPRItemsSection
              groupedAPRs={groupedAPRs}
              expandedPPMPs={expandedPPMPs}
              toggleExpandPPMP={toggleExpandPPMP}
              isEditable={isEditable}
              canAddItems={canAddItems}
              defaultOfficeName={pr.headerDetails?.officeName}
              onUpdateMonthlyQuantity={handleUpdateAPRMonthlyQuantity}
              onDeleteItem={handleDeleteAPRItem}
              onDeleteAPRGroup={openDeleteAPRGroupDialog}
            />
          )}
        </CardContent>
      </Card>


      {/* Modals */}
      <AddItemsModal
        open={showAddItems}
        onOpenChange={setShowAddItems}
        prType={pr.type}
        onAddItems={handleAddItems}
        prId={pr.id}
        officeId={pr.officeCode ?? pr.headerDetails?.officeId}
        currentItems={pr.items}
      />

      <AddNonCSEItemModal
        open={showShoppingModal}
        onOpenChange={setShowShoppingModal}
        onAddItems={handleAddItems}
        onSubmitItemRequest={handleOpenSubmitItemRequest}
      />

      <ReturnPRModal
        open={showReturnModal}
        onOpenChange={setShowReturnModal}
        onReturn={handleReturnPR}
      />

      <ApprovePRModal
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        onApprove={handleApprovePR}
      />

      {/* Submit PR Confirmation Dialog */}
      <AlertDialog
        open={showSubmitConfirmDialog}
        onOpenChange={setShowSubmitConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Submit Purchase Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                You are about to submit{' '}
                <span className="font-semibold text-foreground">
                  {pr.headerDetails.prNumber}
                </span>{' '}
                for approval.
              </span>
              <span className="block text-muted-foreground text-sm">
                Once submitted, this PR will be forwarded to the approving
                authority. Make sure all items and details are correct before
                proceeding.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmitPR}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Send className="h-4 w-4" />
              Confirm Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete PPMP Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDeleteConfirmDialog({
              isOpen: false,
              ppmpId: null,
              ppmpName: null,
              itemIds: [],
              type: 'ppmp',
            })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirmDialog.type === 'apr'
                ? 'Remove APR?'
                : 'Remove Office PPMP?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmDialog.type === 'apr' ? (
                <>
                  Are you sure you want to remove{' '}
                  <span className="font-semibold">
                    {deleteConfirmDialog.ppmpName}
                  </span>{' '}
                  and all its {deleteConfirmDialog.itemIds.length} item(s) from
                  this PR? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to remove{' '}
                  <span className="font-semibold">
                    {deleteConfirmDialog.ppmpName}
                  </span>{' '}
                  and all its {deleteConfirmDialog.itemIds.length} item(s) from
                  this PR? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Coming Soon Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Purchase Request</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="flex items-end gap-1 mb-2">
              <div className="w-4 h-8 bg-red-500 rounded-sm"></div>
              <div className="w-4 h-12 bg-yellow-500 rounded-sm"></div>
              <div className="w-4 h-16 bg-green-600 rounded-sm"></div>
              <div className="w-4 h-20 bg-blue-600 rounded-sm"></div>
            </div>

            <h3 className="text-lg font-semibold text-center">Coming Soon</h3>

            <p className="text-sm text-center text-muted-foreground px-4">
              Excel export functionality is being developed. We're connecting
              the xlsx/sheetjs library to provide powerful export capabilities.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 w-full">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">What's next:</span> Soon you'll
                be able to export Purchase Request details to Excel with custom
                formatting.
              </p>
            </div>

            <Button
              onClick={() => setShowExportDialog(false)}
              className="w-full mt-4"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit PR Header Modal */}
      <EditPRModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        pr={pr}
        onSuccess={() => {
          setShowEditModal(false)
        }}
      />

      {/* Intentional Item Request Dialog for Custom/Ad-hoc PR Items */}
      <RequestItemDialog
        open={requestItemModalOpen}
        onOpenChange={setRequestItemModalOpen}
        initialOfficeId={pr.headerDetails?.officeId}
        initialValues={prefilledRequestItem ?? undefined}
        onSuccess={() => {
          setRequestItemModalOpen(false)
          setPrefilledRequestItem(null)
          toast.success('Item Request submitted', {
            description: 'Item Request submitted to BAC for catalog evaluation. Your PR line item remains unaffected.',
          })
        }}
      />
    </div>
  )
}

