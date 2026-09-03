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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
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
import { EditPRModal } from './EditPRModal'
import { ReturnPRModal } from './ReturnPRModal'
import { ApprovePRModal } from './ApprovePRModal'
import { PRAttachmentsPanel } from './PRAttachmentsPanel'
import { purchaseRequestRequiresTor } from '../utils/torAttachment'
import { openSignedDocument } from '../utils/openSignedDocument'

import api from '@/services/api'

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
  const isManagePRView = isManagePRViewProp ?? storeIsManagePRView
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

  // Sync server data into activePR whenever a fresh response arrives.
  useEffect(() => {
    const apiData = freshPRResponse?.data
    if (!apiData) return
    if (hasUnsavedChanges) return // Don't overwrite local edits

    const base = activePR ?? initialPR
    const merged: PurchaseRequest = {
      ...base,
      signedPdfUrl: base.signedPdfUrl,
      status: fromApiStatus(apiData.status),
      type: fromApiPrType(apiData.prType),
      totalAmount: apiData.totalAmount,
      bacResolutions: apiData.bacResolutions ?? base.bacResolutions ?? [],
      headerDetails: {
        ...base.headerDetails,
        prNumber: apiData.prNumber,
        description: apiData.description ?? '',
        purpose: apiData.purpose ?? '',
        date: apiData.requestedDate,
        uacs: apiData.uacsCode ?? base.headerDetails.uacs ?? '',
        fundCluster: apiData.fundSource ?? base.headerDetails.fundCluster ?? '',
        procurementCategoryName: apiData.procurementCategory ?? base.headerDetails.procurementCategoryName ?? '',
        officeId: apiData.officeId ?? base.headerDetails.officeId,
        officeName: apiData.officeName ?? base.headerDetails.officeName,
      },
      // Map server items preserving source IDs for subsequent Save Changes calls
      items: (apiData.items ?? []).map((i) => ({
        id: i.id,
        itemId: i.aprItemId ?? i.ppmpItemId,
        itemName: i.name,
        description: i.description || '',
        category: i.category || '',
        quantity: i.requestedQuantity,
        unitOfMeasure: i.unit || '',
        unitPrice: i.unitCost,
        totalAmount: i.amount,
        estimatedUnitPrice: i.unitCost,
        month: i.requestedMonth,
        fund: i.fund || '',
        procurementModeId: i.procurementModeId,
        procurementModeName: i.procurementModeName,
        source: i.isNonCSE ? ('ppmp' as const) : ('apr' as const),
        ppmpDocId: i.ppmpId,
        ppmpDocName: i.ppmpNumber
          ? `${i.ppmpNumber} — ${i.officeName || apiData.officeName || ''}`
          : undefined,
      })),
    }

    setActivePR(merged)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshPRResponse, hasUnsavedChanges])

  const buildPayloadItems = (items: PRItem[]): UpdatePurchaseRequestItemPayload[] => {
    return items.flatMap((group): UpdatePurchaseRequestItemPayload[] => {
      // Handle legacy grouped APR structure (optimistic items added before server sync)
      if (group.aprGroup && group.aprGroup.items) {
        return group.aprGroup.items.flatMap((aprItem): UpdatePurchaseRequestItemPayload[] => {
          const monthsMap = aprItem.monthlyQuantities || (aprItem.month ? { [aprItem.month]: aprItem.quantity } : {})
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
      
      // If there's a monthlyQuantities object (from optimistic UI state), split it up
      if (group.monthlyQuantities && Object.keys(group.monthlyQuantities).length > 0) {
        return Object.entries(group.monthlyQuantities).filter(([, qty]) => qty > 0).map(([m, qty]) => ({
          ppmpItemId: isApr ? undefined : (group.itemId || group.id),
          aprItemId: isApr ? (group.itemId || group.id) : undefined,
          name: group.itemName,
          description: group.description || '',
          unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
          requestedQuantity: qty,
          stockNo: group.stockNo || '',
          isNonCSE: !isApr,
          requestedMonth: m
        }))
      }

      // Single month item (synced from server or single-month optimistic)
      return [{
        ppmpItemId: isApr ? undefined : (group.itemId || group.id),
        aprItemId: isApr ? (group.itemId || group.id) : undefined,
        name: group.itemName,
        description: group.description || '',
        unitCost: group.unitPrice || group.estimatedUnitPrice || 0,
        requestedQuantity: group.quantity,
        stockNo: group.stockNo || '',
        isNonCSE: !isApr,
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

  const pr = activePR || initialPR

  // Derive a display status: if remarks exist but status wasn't set to 'returned', prefer showing Returned
  const getDisplayStatus = (p: typeof pr) => {
    try {
      if (p && p.remarks && p.remarks.toString().trim().length > 0) {
        return 'returned' as PRStatus
      }
    } catch {
      // ignore
    }
    return p?.status
  }
  const displayStatus = getDisplayStatus(pr)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddItems, setShowAddItems] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSubmitConfirmDialog, setShowSubmitConfirmDialog] = useState(false)
  const [expandedPPMPs, setExpandedPPMPs] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [fundFilter, setFundFilter] = useState<string>('all')
  const [torSubmitError, setTorSubmitError] = useState<string | null>(null)
  const torSectionRef = useRef<HTMLDivElement | null>(null)
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
            const ppmpId = item.ppmpDocId || 'unknown'
            if (!map.has(ppmpId)) {
              map.set(ppmpId, [])
            }
            map.get(ppmpId)!.push(item)
            return map
          }, new Map<string, PRItem[]>()),
        ).map(([ppmpId, items]) => ({ ppmpId, items }))
      : []

  // Count APR-grouped PR items (for out-of-stock/consolidated PRs)
  const aprGroupCount = (pr.items || []).filter((i) => i.aprGroup).length

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
      ? []
      : Array.from(
          new Set(
            pr.items
              .map((item) => item.month)
              .filter((m): m is string => Boolean(m) && m !== ''),
          ),
        )

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

  // Filter PPMPs based on selected filters
  const filteredGroupedPPMPs =
    pr.type === 'non-cse'
      ? groupedPPMPs
          .map(({ ppmpId, items: ppmItems }) => {
            const filteredItems = ppmItems.filter((item) => {
              const ppmpName = ppmItems[0]?.ppmpDocName || ''
              const searchMatch =
                item.itemName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.category
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                ppmpName.toLowerCase().includes(searchTerm.toLowerCase())
              const categoryMatch =
                categoryFilter === 'all' || item.category === categoryFilter
              const monthMatch =
                monthFilter === 'all' || item.month === monthFilter
              const fundMatch = fundFilter === 'all' || item.fund === fundFilter
              return searchMatch && categoryMatch && monthMatch && fundMatch
            })
            return { ppmpId, items: filteredItems }
          })
          .filter(({ items: ppmItems }) => ppmItems.length > 0)
      : []

  const openDeletePPMPDialog = (
    ppmpId: string,
    ppmpName: string,
    items: PRItem[],
  ) => {
    setDeleteConfirmDialog({
      isOpen: true,
      ppmpId,
      ppmpName,
      itemIds: items.map((i) => i.id),
      type: 'ppmp',
    })
  }

  const openDeleteAPRDialog = (
    aprId: string,
    aprName: string,
    items: PRItem[],
  ) => {
    setDeleteConfirmDialog({
      isOpen: true,
      ppmpId: aprId,
      ppmpName: aprName,
      itemIds: items.map((i) => i.id),
      type: 'apr',
    })
  }

  const handleConfirmDeletePPMP = () => {
    if (deleteConfirmDialog.type === 'apr' && deleteConfirmDialog.ppmpId) {
      const aprId = deleteConfirmDialog.ppmpId
      const newItems = pr.items.filter(
        (i) => !(i.aprGroup && i.aprGroup.id === aprId),
      )
      const newTotal = newItems.reduce((sum, i) => sum + i.totalAmount, 0)
      updatePurchaseRequest(pr.id, {
        items: newItems,
        totalAmount: newTotal,
      })
      setHasUnsavedChanges(true)

      toast.success('APR Removed', {
        description: 'The APR and its items have been removed.',
      })

      setDeleteConfirmDialog({
        isOpen: false,
        ppmpId: null,
        ppmpName: null,
        itemIds: [],
        type: 'ppmp',
      })
      return
    }

    if (deleteConfirmDialog.ppmpId && deleteConfirmDialog.itemIds.length > 0) {
      const newItems = pr.items.filter(
        (i) => !deleteConfirmDialog.itemIds.includes(i.id),
      )
      const newTotal = newItems.reduce((sum, i) => sum + i.totalAmount, 0)
      updatePurchaseRequest(pr.id, {
        items: newItems,
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

  const handleAddItems = (items: PRItem[]) => {
    const updatedItems = [...pr.items, ...items]
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    )

    updatePurchaseRequest(pr.id, {
      items: updatedItems,
      totalAmount: newTotal,
    })
    setHasUnsavedChanges(true)

    toast.success('Items Added', {
      description: `${items.length} item(s) have been added to this PR.`,
    })

    setShowAddItems(false)
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
        updatePurchaseRequest(pr.id, { status: 'submitted', updatedAt: new Date().toISOString() })
      })(),
      {
        loading: 'Submitting Purchase Request...',
        success: `${pr.headerDetails.prNumber} is now waiting for approval.`,
        error: (error: unknown) => (error instanceof Error ? error.message : 'Unable to submit the PR. Please try again.'),
      }
    )
    setShowSubmitConfirmDialog(false)
  }

  const handleReturnPR = (remarks: string) => {
    toast.promise(
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

  const handleApprovePR = (signedPdfUrl: string) => {
    toast.promise(
      statusMutation.mutateAsync({
        pathParams: { id: pr.id },
        queryParams: { id: pr.id },
        payload: { prId: pr.id, newStatus: 'Approved' },
      }).then(() => {
        updatePurchaseRequest(pr.id, { status: 'approved', signedPdfUrl, updatedAt: new Date().toISOString() })
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
  const canAddItems = pr.status === 'draft'
  const canSubmit = pr.status === 'draft' && pr.items.length > 0
  const canReturn = pr.status === 'submitted' && Boolean(isManagePRView)
  const canApprove = pr.status === 'submitted' && Boolean(isManagePRView)
  const canEditNeeded = pr.status === 'draft' && !isManagePRView

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
                  className="gap-2 h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSubmitPR}
                >
                  <Send className="h-4 w-4" />
                  Submit
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
                  {pr.status === 'draft' && (
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
                {pr.type === 'non-cse' ? 'Office PPMPs' : 'APRs'}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                {pr.type === 'non-cse'
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
                      const aprCount = (pr.items || []).filter(
                        (i) => i.aprGroup,
                      ).length
                      return `${aprCount} APR${aprCount !== 1 ? 's' : ''} selected`
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
                        pr.type === 'non-cse'
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
                <Button
                  onClick={() => setShowAddItems(true)}
                  size="sm"
                  className="gap-2 flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  {pr.type === 'non-cse' ? 'Add Office PPMP' : 'Add APR'}
                </Button>
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
                {pr.type === 'non-cse'
                  ? 'No Office PPMP added yet'
                  : 'No items added yet'}
              </p>
              {canAddItems && (
                <Button
                  onClick={() => setShowAddItems(true)}
                  variant="outline"
                  size="sm"
                >
                  {pr.type === 'non-cse' ? 'Add Office PPMP' : 'Add APR'}
                </Button>
              )}
            </div>
          ) : pr.type === 'non-cse' ? (
            <div className="space-y-4">
              <div className="space-y-4">
                {filteredGroupedPPMPs.map(({ ppmpId, items }) => {
                  const isExpanded = expandedPPMPs.has(ppmpId)
                  const ppmpTotal = items.reduce(
                    (sum, item) => sum + item.totalAmount,
                    0,
                  )
                  const hasAnyMonth = items.some((i) => Boolean(i.month))

                  return (
                    <div
                      key={ppmpId}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow my-3"
                    >
                      <div
                        className="px-6 py-4 min-h-[68px] flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-900 dark:hover:to-slate-800 cursor-pointer transition bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-900/10 dark:to-slate-800/10"
                        onClick={() => toggleExpandPPMP(ppmpId)}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-slate-900 dark:text-slate-50">
                            {items[0]?.ppmpDocName || 'Office PPMP'}
                          </div>
                          <div className="text-xs truncate text-slate-600 dark:text-slate-400">
                            {items.length} item(s)
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-3">
                          <Badge
                            color="default"
                            className="text-sm font-semibold"
                          >
                            ₱{ppmpTotal.toLocaleString()}
                          </Badge>

                          {!canAddItems ? null : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 p-0 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeletePPMPDialog(
                                  ppmpId,
                                  items[0]?.ppmpDocName || 'Office PPMP',
                                  items,
                                )
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-muted/10 overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/40">
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Mode of Procurement</TableHead>
                                <TableHead>Fund</TableHead>
                                {hasAnyMonth && <TableHead className="text-center">Month</TableHead>}
                                <TableHead className="text-center w-32">Req Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead className="text-right">
                                  Total Amount
                                </TableHead>
                                {pr.status === 'draft' && (
                                  <TableHead className="text-center w-16">
                                    Actions
                                  </TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => {
                                const unitPrice =
                                  item.unitPrice ?? item.estimatedUnitPrice ?? 0

                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold whitespace-nowrap">
                                        {item.procurementModeName || 'Direct Acquisition'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{item.fund || '—'}</TableCell>
                                    {hasAnyMonth && (
                                      <TableCell className="text-center">
                                        {item.month || '—'}
                                      </TableCell>
                                    )}
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <Input
                                          type="number"
                                          min={1}
                                          value={item.quantity || 0}
                                          onChange={(e) => {
                                            const v = parseInt(e.target.value || '0', 10)
                                            const val = Number.isNaN(v) ? 0 : Math.max(0, v)
                                            
                                            const updatedItems = pr.items.map((pi) => {
                                              if (pi.id === item.id) {
                                                return {
                                                  ...pi,
                                                  quantity: val,
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
                                            setHasUnsavedChanges(true)
                                          }}
                                          disabled={pr.status !== 'draft'}
                                          className="h-8 w-20 text-center font-medium tabular-nums"
                                        />
                                        <span className="text-xs text-muted-foreground pointer-events-none">
                                          {item.unitOfMeasure || 'pcs'}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      ₱{unitPrice.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      ₱
                                      {(
                                        (item.quantity || 0) * unitPrice
                                      ).toLocaleString()}
                                    </TableCell>
                                    {pr.status === 'draft' && (
                                      <TableCell className="text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                          title={`Remove ${item.itemName}`}
                                          onClick={() => {
                                            const updatedItems = pr.items.filter((pi) => pi.id !== item.id)
                                            const newTotal = updatedItems.reduce((s, it) => s + (it.totalAmount || 0), 0)
                                            updatePurchaseRequest(pr.id, {
                                              items: updatedItems,
                                              totalAmount: newTotal,
                                            })
                                            setHasUnsavedChanges(true)
                                            toast.success('Item Removed', {
                                              description: `${item.itemName} (${item.month}) removed from PR.`,
                                            })
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-4">
                {(pr.items || [])
                  .filter((i) => i.aprGroup)
                  .map((groupItem) => {
                    const aprId = groupItem.aprGroup!.id || groupItem.aprGroup!.aprId || ''
                    const isExpanded = expandedPPMPs.has(aprId)
                    const nested: PRItem[] = (groupItem.aprGroup!.items ||
                      []) as PRItem[]
                    const aprTotal =
                      groupItem.totalAmount ||
                      nested.reduce(
                        (s: number, ni: PRItem) => s + (ni.totalAmount || 0),
                        0,
                      )

                    return (
                      <div
                        key={groupItem.id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow my-3"
                      >
                        <div
                          className="px-6 py-4 min-h-[68px] flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 cursor-pointer transition bg-gradient-to-r from-slate-50/30 to-slate-100/30"
                          onClick={() => toggleExpandPPMP(aprId)}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {groupItem.aprGroup!.aprNumber} •{' '}
                              {groupItem.aprGroup!.officeName}
                            </div>
                            <div className="text-xs truncate text-slate-600">
                              {nested.length} item(s)
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-3">
                            <Badge
                              color="default"
                              className="text-sm font-semibold"
                            >
                              ₱{aprTotal.toLocaleString()}
                            </Badge>
                            {canAddItems && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 p-0 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openDeleteAPRDialog(
                                    aprId,
                                    `${groupItem.aprGroup!.aprNumber} • ${groupItem.aprGroup!.officeName}`,
                                    nested,
                                  )
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t bg-muted/10 overflow-x-auto">
                            <Table style={{ minWidth: '1600px' }}>
                              <TableHeader>
                                <TableRow className="bg-muted/40">
                                  <TableHead className="min-w-[150px] sticky left-0 bg-muted/40 z-10">Item Name</TableHead>
                                  <TableHead className="min-w-[140px]">Category</TableHead>
                                  <TableHead className="min-w-[110px]">Fund</TableHead>
                                  {ORDERED_MONTHS.map((m: string) => (
                                    <TableHead key={m} className="text-center min-w-[80px]">
                                      <span className="flex flex-col items-center gap-0.5">
                                        <span>{m.slice(0, 3)}</span>
                                        {canEditNeeded && (
                                          <span className="text-[9px] font-normal text-primary/60 leading-none">editable</span>
                                        )}
                                      </span>
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-center min-w-[110px]">
                                    Total Qty
                                  </TableHead>
                                  <TableHead className="min-w-[110px]">Unit Price</TableHead>
                                  <TableHead className="text-right min-w-[120px]">
                                    Total Amount
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {nested.map((ni) => {
                                  const unitPrice = ni.unitPrice || 0

                                  const monthlyQty =
                                    ni.monthlyQuantities &&
                                    Object.keys(ni.monthlyQuantities).length > 0
                                      ? ni.monthlyQuantities
                                      : ni.month
                                        ? { [ni.month]: ni.quantity }
                                        : {}

                                  const monthlySum = ORDERED_MONTHS.reduce(
                                    (s: number, mm: string) =>
                                      s + ((monthlyQty && (monthlyQty[mm] || 0)) || 0),
                                    0,
                                  )

                                  const requiredTotal =
                                    monthlySum > 0 ? monthlySum : (ni.originalNeeded || ni.quantity || 0)

                                  const alreadyGot = ni.totalGot || 0
                                  const deficitQty = Math.max(requiredTotal - alreadyGot, 0)
                                  const lineTotal = deficitQty * unitPrice

                                  return (
                                    <TableRow key={ni.id}>
                                      <TableCell className="font-medium">
                                        {ni.itemName}
                                      </TableCell>
                                      <TableCell>{ni.category}</TableCell>
                                      <TableCell>{ni.fund || '—'}</TableCell>

                                      {ORDERED_MONTHS.map((m: string) => {
                                        const currentVal =
                                          ni.monthlyQuantities &&
                                          typeof ni.monthlyQuantities[m] === 'number'
                                            ? ni.monthlyQuantities[m]
                                            : monthlyQty[m] || 0

                                        return (
                                          <TableCell
                                            key={`${ni.id}-${m}`}
                                            className="text-center px-2 py-2 group/cell hover:bg-primary/5 transition-colors rounded"
                                          >
                                            <div className="inline-flex items-baseline gap-0.5">
                                              <input
                                                type="number"
                                                min={0}
                                                value={currentVal}
                                                title="Click to edit"
                                                onChange={(e) => {
                                                  const v = parseInt(e.target.value || '0', 10)
                                                  const val = Number.isNaN(v) ? 0 : v

                                                  const updatedItems = pr.items.map((pi) => {
                                                    if (pi.id !== groupItem.id) return pi
                                                    const updatedAprGroup = {
                                                      ...pi.aprGroup!,
                                                      items: (pi.aprGroup!.items || []).map(
                                                        (inner: PRItem) => {
                                                          if (inner.id !== ni.id) return inner
                                                          const prevMonthly =
                                                            inner.monthlyQuantities &&
                                                            Object.keys(inner.monthlyQuantities).length > 0
                                                              ? { ...inner.monthlyQuantities }
                                                              : inner.month
                                                                ? { [inner.month]: inner.quantity }
                                                                : {}
                                                          const nextMonthly = { ...prevMonthly, [m]: val }
                                                          const computedQty = ORDERED_MONTHS.reduce(
                                                            (s: number, mm: string) =>
                                                              s + (nextMonthly[mm] || 0),
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
                                                        },
                                                      ),
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

                                                  const newTotal = updatedItems.reduce(
                                                    (s, it) => s + (it.totalAmount || 0),
                                                    0,
                                                  )
                                                  updatePurchaseRequest(pr.id, {
                                                    items: updatedItems,
                                                    totalAmount: newTotal,
                                                  })
                                                  setHasUnsavedChanges(true)
                                                }}
                                                readOnly={!canEditNeeded}
                                                disabled={!canEditNeeded}
                                                className={`w-8 text-center tabular-nums text-sm bg-transparent border-none outline-none p-0 caret-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${canEditNeeded ? 'cursor-text focus:outline-none focus:border-b-2 focus:border-primary' : 'cursor-default opacity-70'}`}
                                              />
                                              <span className="text-sm text-slate-600 dark:text-slate-400 pointer-events-none">
                                                {ni.unitOfMeasure || 'pcs'}
                                              </span>
                                            </div>
                                          </TableCell>
                                        )
                                      })}

                                      <TableCell className="text-center">
                                        <Badge color="default" className="tabular-nums">
                                          {ORDERED_MONTHS.reduce((s: number, m: string) => {
                                            const cellVal =
                                              ni.monthlyQuantities &&
                                              typeof ni.monthlyQuantities[m] === 'number'
                                                ? ni.monthlyQuantities[m]
                                                : monthlyQty[m] || 0
                                            return s + cellVal
                                          }, 0)} {ni.unitOfMeasure || 'pcs'}
                                        </Badge>
                                      </TableCell>

                                      <TableCell>
                                        ₱{unitPrice.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₱{(lineTotal || 0).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Remarks */}
      {displayStatus === 'returned' && pr.remarks && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Return Remarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{pr.remarks}</p>
          </CardContent>
        </Card>
      )}

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
              onClick={handleConfirmDeletePPMP}
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
    </div>
  )
}

