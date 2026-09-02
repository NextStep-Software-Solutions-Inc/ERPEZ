import React, { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Download,
  Search,
  FileText,
  ListChecks,
  PackageOpen,
  Building2,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Target,
  Wallet,
  ShieldCheck,
  Layers,
  RotateCcw,
  CheckCircle,
  Eye,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainerDashtail } from '@/components/v2'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import { toast } from 'sonner'
import { formatCurrencyPHP } from '@/utils/formatters'
import {
  useConsolidatedPr,
  useEligiblePrs,
  useUpdateConsolidatedPrItem,
  useSubmitConsolidatedPr,
  useAddPrsToConsolidatedPr,
  useApproveConsolidatedPr,
  useReturnConsolidatedPr,
  useProcurementModes,
} from '@/features/procurement/consolidated-pr/handlers/hooks'
import {
  useGenerateBACResolutionDocument,
  useDownloadBacResolutionDocument,
} from '@/features/procurement/bac-resolution/handlers/hooks'
import type {
  EligiblePr,
  MonthlyQuantitiesApi,
  ConsolidatedPrBacResolution,
} from '@/features/procurement/consolidated-pr/types/apiTypes'
import { BacResolutionStatusBadge } from '@/features/procurement/bac-resolution/components'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConsolidatedPrDetailsPageProps {
  consolidatedPrId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = formatCurrencyPHP

export function ConsolidatedPrStatusBadge({ status }: { status?: string }) {
  const norm = (status ?? 'DRAFT').toUpperCase().replace(/[-_]/g, '')

  if (norm === 'APPROVED') {
    return (
      <Badge className="bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800 rounded-full px-3 py-1 font-semibold text-xs shadow-none">
        Approved
      </Badge>
    )
  }
  if (norm === 'SUBMITTED' || norm === 'PENDING' || norm === 'FORAPPROVAL') {
    return (
      <Badge className="bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800 rounded-full px-3 py-1 font-semibold text-xs shadow-none">
        Submitted
      </Badge>
    )
  }
  if (norm === 'RETURNED') {
    return (
      <Badge className="bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800 rounded-full px-3 py-1 font-semibold text-xs shadow-none">
        Returned
      </Badge>
    )
  }
  return (
    <Badge className="bg-purple-100/70 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-800 rounded-full px-3 py-1 font-semibold text-xs shadow-none">
      Draft
    </Badge>
  )
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getMonthQuantity(
  monthlyQuantities: MonthlyQuantitiesApi | Record<string, number> | undefined,
  monthIndex: number,
): number {
  if (!monthlyQuantities) return 0
  const record = monthlyQuantities as Record<string, number | undefined>

  const padKey = String(monthIndex + 1).padStart(2, '0')
  if (record[padKey] !== undefined && record[padKey] !== null) {
    return Number(record[padKey]) || 0
  }

  const digitKey = String(monthIndex + 1)
  if (record[digitKey] !== undefined && record[digitKey] !== null) {
    return Number(record[digitKey]) || 0
  }

  if (record[String(monthIndex)] !== undefined && record[String(monthIndex)] !== null) {
    return Number(record[String(monthIndex)]) || 0
  }

  const fullName = FULL_MONTH_NAMES[monthIndex]
  if (fullName && record[fullName] !== undefined && record[fullName] !== null) {
    return Number(record[fullName]) || 0
  }

  const shortName = MONTH_NAMES[monthIndex]
  if (shortName && record[shortName] !== undefined && record[shortName] !== null) {
    return Number(record[shortName]) || 0
  }

  return 0
}

function getAllocationSummary(
  monthlyQuantities: MonthlyQuantitiesApi | Record<string, number> | undefined,
  unit: string,
): {
  hasAllocation: boolean
  title: string
  subtitle: string
  allocatedMonths: { month: string; qty: number }[]
  totalAllocated: number
} {
  const allocatedMonths: { month: string; qty: number }[] = []
  let totalAllocated = 0

  MONTH_NAMES.forEach((m, idx) => {
    const qty = getMonthQuantity(monthlyQuantities, idx)
    if (qty > 0) {
      allocatedMonths.push({ month: m, qty })
      totalAllocated += qty
    }
  })

  if (allocatedMonths.length === 0) {
    return {
      hasAllocation: false,
      title: 'No Monthly Allocation',
      subtitle: 'Annual / Overall',
      allocatedMonths,
      totalAllocated,
    }
  }

  if (allocatedMonths.length <= 2) {
    const preview = allocatedMonths
      .map((item) => `${item.month}: ${item.qty} ${unit || 'unit'}`)
      .join(', ')
    return {
      hasAllocation: true,
      title: 'Monthly Allocation',
      subtitle: preview,
      allocatedMonths,
      totalAllocated,
    }
  }

  return {
    hasAllocation: true,
    title: 'Monthly Allocation',
    subtitle: `${allocatedMonths.length} months`,
    allocatedMonths,
    totalAllocated,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConsolidatedPrDetailsPage({
  consolidatedPrId,
}: ConsolidatedPrDetailsPageProps) {
  // ─── Dialog state ──────────────────────────────────────────────────────────
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [selectedPrIds, setSelectedPrIds] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ─── API ───────────────────────────────────────────────────────────────────
  const { data: cprResponse, isLoading } = useConsolidatedPr({
    pathParams: { id: consolidatedPrId },
    queryParams: {}
  })

  const { data: eligiblePrsResponse } = useEligiblePrs({
    pathParams: { id: consolidatedPrId },
    enabled: addOpen,
  })

  const { data: procurementModesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const updateItemMutation = useUpdateConsolidatedPrItem()
  const submitMutation = useSubmitConsolidatedPr()
  const addPrsMutation = useAddPrsToConsolidatedPr()
  const approveMutation = useApproveConsolidatedPr()
  const returnMutation = useReturnConsolidatedPr()

  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [returnRemarks, setReturnRemarks] = useState('')
  const [generatingDocId, setGeneratingDocId] = useState<string | null>(null)

  const navigate = useNavigate()
  const { mutateAsync: generateBACResolutionDocument } = useGenerateBACResolutionDocument()
  const { mutateAsync: downloadBacResolutionDocument } = useDownloadBacResolutionDocument()

  const handleViewOrDownloadDocument = async (
    resolution: ConsolidatedPrBacResolution,
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

  // ─── Derived data ──────────────────────────────────────────────────────────
  const consolidatedPr = cprResponse?.data ?? null
  const eligiblePrs: EligiblePr[] = eligiblePrsResponse?.data ?? []

  const mopOptions = useMemo(
    () =>
      (procurementModesResponse?.data ?? [])
        .filter((m) => m.isActive && !m.isArchived)
        .map((m) => ({ value: m.id as string, label: m.name as string })),
    [procurementModesResponse],
  )

  const linkedBacResolutions = useMemo(() => {
    if (!consolidatedPr?.bacResolutions) return []
    return consolidatedPr.bacResolutions
  }, [consolidatedPr])

  const owningBacResolution = linkedBacResolutions[0] ?? null

  const filteredEligiblePrs = useMemo(() => {
    if (!addSearchTerm.trim()) return eligiblePrs
    const q = addSearchTerm.toLowerCase()
    return eligiblePrs.filter(
      (pr) =>
        pr.prNumber?.toLowerCase().includes(q) ||
        pr.officeName?.toLowerCase().includes(q),
    )
  }, [eligiblePrs, addSearchTerm])

  const selectedCount = selectedPrIds.length

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleOpenAdd() {
    setSelectedPrIds([])
    setAddSearchTerm('')
    setAddOpen(true)
  }

  function handleTogglePr(id: string) {
    setSelectedPrIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleAddPrs() {
    if (selectedPrIds.length === 0) return
    toast.promise(
      addPrsMutation.mutateAsync(
        {
          pathParams: { id: consolidatedPrId },
          queryParams: {},
          payload: {
            purchaseRequestIds: selectedPrIds,
          },
        },
        {
          onSuccess: () => {
            setAddOpen(false)
          },
        },
      ),
      {
        loading: 'Adding PRs to Consolidated PR...',
        success: 'PRs added to the Consolidated PR.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to add the selected PRs.',
      },
    )
  }

  function handleUpdateItemMop(
    itemId: string,
    procurementModeId: string,
    allowPartial: boolean,
  ) {
    toast.promise(
      updateItemMutation.mutateAsync({
        pathParams: { id: consolidatedPrId, itemId },
        queryParams: {},
        payload: { procurementModeId: procurementModeId || undefined, allowPartial },
      }),
      {
        loading: 'Updating item settings...',
        success: 'Item settings updated.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to update the item.',
      },
    )
  }

  function handleSubmit() {
    if (!consolidatedPr) return

    const allLinkedItems = consolidatedPr.prs?.flatMap((pr) => pr.items) ?? []
    const missingMopItems = allLinkedItems.filter((item) => !item.procurementModeId)

    if (missingMopItems.length > 0) {
      const missingNames = missingMopItems.map((i) => i.name)
      const preview = missingNames.slice(0, 3).join(', ')
      const extra = missingNames.length > 3 ? ` (+${missingNames.length - 3} more)` : ''
      toast.error('Missing Mode of Procurement', {
        description: `Please set Mode of Procurement for: ${preview}${extra}.`,
      })
      return
    }

    toast.promise(
      submitMutation.mutateAsync({
        pathParams: { id: consolidatedPrId },
      }),
      {
        loading: 'Submitting Consolidated PR...',
        success: 'Consolidated PR submitted for BAC processing.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to submit the Consolidated PR.',
      },
    )
  }

  function handleApprove() {
    toast.promise(
      approveMutation.mutateAsync({
        pathParams: { id: consolidatedPrId },
      }),
      {
        loading: 'Approving Consolidated PR...',
        success: 'Consolidated PR approved.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to approve Consolidated PR.',
      },
    )
  }

  function handleReturn() {
    if (!returnRemarks.trim()) {
      toast.error('Remarks Required', {
        description: 'Please provide remarks or reasons for returning this Consolidated PR.',
      })
      return
    }

    toast.promise(
      returnMutation.mutateAsync({
        pathParams: { id: consolidatedPrId },
        queryParams: {},
        payload: { remarks: returnRemarks },
      }).then(() => {
        setShowReturnDialog(false)
        setReturnRemarks('')
      }),
      {
        loading: 'Returning Consolidated PR...',
        success: 'Consolidated PR returned for revision.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to return Consolidated PR.',
      },
    )
  }

  // ─── Loading / empty states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <PageContainerDashtail
        title="Consolidated PR Details"
        description="Loading..."
        backTo="/v2/consolidate-prs"
        backLabel="Back to Consolidated PRs"
        titleIcon={<PackageOpen className="h-5 w-5 text-primary" />}
        headerVariant="branded"
        headerSize="small"
      >
        <p className="text-sm text-muted-foreground">Loading Consolidated PR…</p>
      </PageContainerDashtail>
    )
  }

  if (!consolidatedPr) {
    return (
      <PageContainerDashtail
        title="Consolidated PR Details"
        description="Unable to locate the selected Consolidated PR."
        backTo="/v2/consolidate-prs"
        backLabel="Back to Consolidated PRs"
        titleIcon={<PackageOpen className="h-5 w-5 text-primary" />}
        headerVariant="branded"
        headerSize="small"
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Consolidated PR {consolidatedPrId} was not found.
          </AlertDescription>
        </Alert>
      </PageContainerDashtail>
    )
  }

  const rawStatus = (consolidatedPr.status ?? 'DRAFT').toUpperCase().replace(/[-_]/g, '')
  const isDraft = rawStatus === 'DRAFT'
  const isReturned = rawStatus === 'RETURNED'
  const isSubmitted = rawStatus === 'SUBMITTED' || rawStatus === 'PENDING' || rawStatus === 'FORAPPROVAL'
  const isEditable = isDraft || isReturned

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageContainerDashtail
      title={consolidatedPr.cprNumber ?? consolidatedPr.id}
      badge={<ConsolidatedPrStatusBadge status={consolidatedPr.status} />}
      description={
        consolidatedPr.purpose ??
        consolidatedPr.description ??
        'Consolidated PR details'
      }
      backTo="/v2/consolidate-prs"
      backLabel="Back to Consolidated PRs"
      titleIcon={<Layers className="h-5 w-5 text-purple-600" />}
      headerVariant="branded"
      headerSize="small"
      actions={
        <div className="flex items-center gap-2">
          {isEditable && (
            <Button variant="outline" size="sm" onClick={handleOpenAdd}>
              Add Agency/Office PR
            </Button>
          )}
          {isSubmitted && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                onClick={() => {
                  setReturnRemarks('')
                  setShowReturnDialog(true)
                }}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Return
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {isEditable && (
            <Button size="sm" onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      }
      contentClassName="space-y-6"
    >
      {/* ── Summary card ─────────────────────────────────────────────── */}
      <Card className="border border-default-200 shadow-sm rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-purple-600" />
            Consolidated PR Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-purple-100/60 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/20 p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-purple-100/80 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-900/60 dark:text-purple-300/70">
                Description
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground truncate">
                {consolidatedPr.description ?? 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100/60 dark:border-sky-900/30 bg-sky-50/30 dark:bg-sky-950/20 p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-sky-100/80 dark:bg-sky-900/50 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-900/60 dark:text-sky-300/70">
                Purpose
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground truncate">
                {consolidatedPr.purpose ?? 'No purpose provided.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/60 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/60 dark:text-emerald-300/70">
                Total Amount
              </p>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {formatCurrency(
                  consolidatedPr.prs?.reduce((sum, pr) => sum + pr.totalAmount, 0) ?? 0,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100/60 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 p-4 flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-100/80 dark:bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900/60 dark:text-amber-300/70">
                Owning BAC Resolution
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground truncate">
                {owningBacResolution ? owningBacResolution.resolutionNumber : 'Not linked yet'}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                {owningBacResolution
                  ? `${owningBacResolution.resolutionType} · ${owningBacResolution.status}`
                  : 'This Consolidated PR has not been assigned to a BAC Resolution.'}
              </p>
            </div>
          </div>

          <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
              <ConsolidatedPrStatusBadge status={consolidatedPr.status} />
            </div>
            <Badge className="bg-purple-50/60 hover:bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-100 dark:border-purple-900/50 rounded-full px-3 py-1 font-medium text-xs shadow-none">
              Record: {consolidatedPr.cprNumber ?? consolidatedPr.id}
            </Badge>
            <Badge className="bg-purple-50/60 hover:bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-100 dark:border-purple-900/50 rounded-full px-3 py-1 font-medium text-xs shadow-none">
              Source PRs: {consolidatedPr.prs?.length ?? 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {linkedBacResolutions.length > 1 && (
        <Alert color="destructive" variant="soft">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple BAC Resolutions currently reference this Consolidated PR.
            The new workflow only allows one owner and should be corrected in the
            BAC workspace.
          </AlertDescription>
        </Alert>
      )}

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
                This Consolidated PR has not been assigned or linked to an active BAC Resolution. You can create or manage BAC Resolutions in the BAC workspace.
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

      {/* ── Selected PR Items ─────────────────────────────────────────── */}
      <Card className="border border-default-200 shadow-sm rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-5 w-5 text-purple-600" />
            Selected PR Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!consolidatedPr.prs || consolidatedPr.prs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isEditable
                ? 'No PRs added yet. Use "Add Agency/Office PR" to select approved PRs.'
                : 'No PRs in this consolidation.'}
            </p>
          ) : (
            consolidatedPr.prs.map((linkedPr, index) => (
              <div key={linkedPr.purchaseRequestId} className="space-y-4">
                {index > 0 && <Separator className="mb-4" />}

                {/* PR header */}
                <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50/70 dark:bg-muted/30 p-4 rounded-2xl border border-default-100 dark:border-border">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-sm tracking-tight">{linkedPr.prNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {linkedPr.officeName} · {linkedPr.items.length} item{linkedPr.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-purple-200/70 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 text-xs px-3 py-0.5 font-medium shadow-none">
                      {linkedPr.prType === 'OutOfStock' || linkedPr.prType === 'out-of-stock'
                        ? 'Out of Stock'
                        : 'Non-CSE'}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-purple-200/70 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 text-xs px-3 py-0.5 font-bold shadow-none">
                      {formatCurrency(linkedPr.totalAmount)}
                    </Badge>
                  </div>
                </div>

                {/* Items table */}
                <div className="overflow-x-auto rounded-2xl border border-default-200 shadow-sm">
                  <Table>
                    <TableHeader className="bg-purple-50/40 dark:bg-purple-950/20 border-b border-purple-100/60 dark:border-purple-900/40">
                      <TableRow className="border-b border-purple-100/60 dark:border-purple-900/40 hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
                        <TableHead className="min-w-[260px] text-xs font-semibold text-muted-foreground">Item Details</TableHead>
                        <TableHead className="min-w-[90px] text-xs font-semibold text-muted-foreground">Category</TableHead>
                        <TableHead className="min-w-[80px] text-xs font-semibold text-muted-foreground">Fund</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-muted-foreground">Total Qty</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Unit</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-muted-foreground">Unit Price</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-muted-foreground">Total Amount</TableHead>
                        <TableHead className="min-w-[180px] text-xs font-semibold text-muted-foreground">Allocation / Schedule (From PRs)</TableHead>
                        <TableHead className="min-w-[190px] text-xs font-semibold text-muted-foreground">Mode of Procurement (Consolidated PR)</TableHead>
                        <TableHead className="w-24 text-center text-xs font-semibold text-muted-foreground">Allow Partial</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedPr.items.map((item, itemIdx) => {
                        const itemId = item.consolidatedPRItemId ?? item.prItemId
                        const isExpanded = expandedRows.has(itemId)
                        const allocationInfo = getAllocationSummary(item.monthlyQuantities, item.unit)

                        return (
                          <React.Fragment key={itemId}>
                            <TableRow className={cn("transition-colors hover:bg-purple-50/20", isExpanded && "bg-purple-50/30 dark:bg-purple-950/20")}>
                              {/* # with toggle chevron */}
                              <TableCell className="text-center align-top py-3.5">
                                <button
                                  type="button"
                                  onClick={() => toggleRowExpansion(itemId)}
                                  className="inline-flex items-center justify-center gap-1 font-medium text-foreground hover:text-purple-600 transition-colors text-xs p-1 rounded hover:bg-purple-50"
                                  title={isExpanded ? 'Collapse schedule details' : 'Expand schedule details'}
                                >
                                  <span>{itemIdx + 1}</span>
                                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180 text-purple-600")} />
                                </button>
                              </TableCell>

                              {/* Item Details */}
                              <TableCell className="align-top py-3.5">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-purple-100/60 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center shrink-0 mt-0.5">
                                    <PackageOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="font-bold text-foreground text-sm leading-snug">
                                      {item.name}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                      <span>PR: {linkedPr.prNumber}</span>
                                      <span>·</span>
                                      <span>Item No: {itemIdx + 1}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Unit Price: {formatCurrency(item.unitPrice)} per {item.unit || 'unit'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Category */}
                              <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                {item.category ?? '—'}
                              </TableCell>

                              {/* Fund */}
                              <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                {item.fund ?? '—'}
                              </TableCell>

                              {/* Total Qty */}
                              <TableCell className="align-top py-3.5 text-center font-bold text-sm text-foreground">
                                {item.totalQuantity}
                              </TableCell>

                              {/* Unit */}
                              <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                {item.unit || 'unit'}
                              </TableCell>

                              {/* Unit Price */}
                              <TableCell className="align-top py-3.5 text-right font-semibold text-xs text-foreground whitespace-nowrap">
                                {formatCurrency(item.unitPrice)}
                              </TableCell>

                              {/* Total Amount */}
                              <TableCell className="align-top py-3.5 text-right font-bold text-xs text-foreground whitespace-nowrap">
                                {formatCurrency(item.totalAmount)}
                              </TableCell>

                              {/* Allocation / Schedule (From PRs) */}
                              <TableCell className="align-top py-3.5">
                                <div className="space-y-0.5 text-xs">
                                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span>{allocationInfo.title}</span>
                                  </div>
                                  <p className="text-muted-foreground pl-5 leading-tight">
                                    {allocationInfo.subtitle}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => toggleRowExpansion(itemId)}
                                    className="text-purple-600 dark:text-purple-400 hover:underline font-semibold text-left pl-5 text-xs mt-0.5 block"
                                  >
                                    {isExpanded ? 'Hide details' : 'View details'}
                                  </button>
                                </div>
                              </TableCell>

                              {/* Mode of Procurement */}
                              <TableCell className="align-top py-3.5">
                                {isEditable ? (
                                  <Select
                                    value={item.procurementModeId ?? ''}
                                    onValueChange={(val) =>
                                      handleUpdateItemMop(
                                        itemId,
                                        val,
                                        item.allowPartial ?? false,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-48 h-9 text-xs rounded-xl border-purple-200/80 dark:border-purple-800/60 focus:ring-purple-500">
                                      <SelectValue placeholder="Select MOP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mopOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className="text-xs"
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-xs font-medium text-foreground">
                                    {item.procurementModeId
                                      ? (mopOptions.find((o) => o.value === item.procurementModeId)?.label ?? '—')
                                      : '—'}
                                  </span>
                                )}
                              </TableCell>

                              {/* Allow Partial */}
                              <TableCell className="align-top py-3.5 text-center">
                                {isEditable ? (
                                  <div className="flex justify-center pt-1.5">
                                    <Checkbox
                                      checked={item.allowPartial ?? false}
                                      disabled={!item.procurementModeId}
                                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      onCheckedChange={(checked) =>
                                        handleUpdateItemMop(
                                          itemId,
                                          item.procurementModeId ?? '',
                                          checked === true,
                                        )
                                      }
                                    />
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {typeof item.allowPartial === 'boolean'
                                      ? item.allowPartial
                                        ? 'Yes'
                                        : 'No'
                                      : '—'}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>

                            {/* Inline Expandable Schedule Details Panel */}
                            {isExpanded && (
                              <TableRow className="bg-purple-50/20 dark:bg-purple-950/10 border-b border-purple-100/60 dark:border-purple-900/40">
                                <TableCell colSpan={11} className="p-4 pl-12 pr-6">
                                  <div className="rounded-2xl border border-purple-100/80 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 p-4 shadow-sm space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100/60 dark:border-purple-900/40 pb-2.5">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                          Allocation / Schedule Details (From PRs)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <span>Source PR:</span>
                                        <Badge className="bg-purple-100/70 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-800 rounded-full font-medium text-xs px-2.5 py-0.5 shadow-none">
                                          {linkedPr.prNumber}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-purple-100/80 dark:border-purple-900/40 bg-white dark:bg-card">
                                      <Table className="text-xs">
                                        <TableHeader className="bg-purple-50/50 dark:bg-purple-950/30">
                                          <TableRow className="border-b border-purple-100/60 dark:border-purple-900/40 hover:bg-transparent">
                                            <TableHead className="py-2.5 text-left font-medium min-w-[140px] text-xs text-muted-foreground">
                                              Allocated Quantity
                                            </TableHead>
                                            {MONTH_NAMES.map((m) => (
                                              <TableHead key={m} className="py-2.5 text-center font-medium min-w-[44px] text-xs text-muted-foreground">
                                                {m}
                                              </TableHead>
                                            ))}
                                            <TableHead className="py-2.5 text-center font-bold min-w-[60px] text-xs text-foreground">
                                              Total
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow className="hover:bg-transparent">
                                            <TableCell className="py-2.5 font-medium text-muted-foreground text-xs">
                                              Quantity
                                            </TableCell>
                                            {MONTH_NAMES.map((m, idx) => {
                                              const qty = getMonthQuantity(item.monthlyQuantities, idx)
                                              return (
                                                <TableCell
                                                  key={m}
                                                  className={cn(
                                                    "py-2.5 text-center text-xs",
                                                    qty > 0 ? "font-bold text-foreground" : "text-muted-foreground"
                                                  )}
                                                >
                                                  {qty}
                                                </TableCell>
                                              )
                                            })}
                                            <TableCell className="py-2.5 text-center font-bold text-foreground bg-purple-50/40 dark:bg-purple-950/30 text-xs">
                                              {allocationInfo.totalAllocated > 0 ? allocationInfo.totalAllocated : item.totalQuantity}
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* PR items footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-muted-foreground px-1">
                  <div>
                    Showing 1 to {linkedPr.items.length} of {linkedPr.items.length} item{linkedPr.items.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs uppercase tracking-wider">PR Total:</span>
                    <span className="font-bold text-foreground text-sm">
                      {formatCurrency(linkedPr.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Bottom Grand Total Summary Bar */}
          {consolidatedPr.prs && consolidatedPr.prs.length > 0 && (
            <div className="bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-100/80 dark:border-purple-900/40 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm mt-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {consolidatedPr.prs.length} PR(s) · {consolidatedPr.prs.reduce((acc, pr) => acc + pr.items.length, 0)} Item(s)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GRAND TOTAL:</span>
                <span className="text-xl font-extrabold text-purple-700 dark:text-purple-400">
                  {formatCurrency(consolidatedPr.prs.reduce((sum, pr) => sum + pr.totalAmount, 0))}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Agency/Office PR Dialog ──────────────────────────────── */}
      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Agency/Office PR"
        description="Select approved PRs to add to this Consolidated PR"
        size="4xl"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPrs}
              disabled={selectedCount === 0 || addPrsMutation.isPending}
              className="gap-2"
            >
              Add Selected PRs ({selectedCount})
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-6">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PR number or office…"
              value={addSearchTerm}
              onChange={(e) => setAddSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-default-50">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        filteredEligiblePrs.length > 0 &&
                        filteredEligiblePrs.every((pr) =>
                          selectedPrIds.includes(pr.purchaseRequestId),
                        )
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPrIds(
                            filteredEligiblePrs.map((pr) => pr.purchaseRequestId),
                          )
                        } else {
                          setSelectedPrIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEligiblePrs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No approved PRs available to add.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEligiblePrs.map((pr) => (
                    <TableRow key={pr.purchaseRequestId}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedPrIds.includes(pr.purchaseRequestId)}
                          onCheckedChange={() =>
                            handleTogglePr(pr.purchaseRequestId)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {pr.prNumber}
                      </TableCell>
                      <TableCell>{pr.officeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pr.prType === 'OutOfStock' || pr.prType === 'out-of-stock'
                            ? 'Out of Stock'
                            : 'Non-CSE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(pr.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResponsiveDialog>

      {/* ── Return Consolidated PR Dialog ────────────────────────────── */}
      <ResponsiveDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        title="Return Consolidated PR"
        description="Provide remarks or reason for returning this Consolidated PR for revision."
        size="md"
        showCloseButton
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Return Remarks / Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              className="w-full min-h-[110px] rounded-xl border border-default-200 bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-muted-foreground"
              placeholder="e.g. Please update the Mode of Procurement for item #2 or adjust the linked PRs..."
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReturnDialog(false)
                setReturnRemarks('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReturn}
              disabled={returnMutation.isPending}
            >
              {returnMutation.isPending ? 'Returning...' : 'Confirm Return'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* ── Export Dialog ────────────────────────────────────────────── */}
      <ExportComingSoonDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </PageContainerDashtail>
  )
}