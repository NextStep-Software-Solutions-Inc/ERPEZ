import { useMemo, useState, useEffect } from 'react'
import { PurchaseOrderActionBar } from './PurchaseOrderActionBar'
import { PurchaseOrderTable } from './PurchaseOrderTable'
import { PODirectAcquisitionDetailsPage } from './PODirectAcquisitionDetailsPage'
import {
  ApprovePurchaseOrderDialog,
  CreateDirectAcquisitionPurchaseOrderDialog,
  CreatePublicBiddingPurchaseOrderDialog,
  CreateSvpPurchaseOrderDialog,
  EditPurchaseOrderDialog,
  ReturnPurchaseOrderDialog,
  SubmitForApprovalPurchaseOrderDialog,
} from '../dialogs'
import {
  useGetPurchaseOrders,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrderForApproval,
  useApprovePurchaseOrder,
  useReturnPurchaseOrder,
  uploadPoDocument,
} from '../handlers'
import { downloadPurchaseOrderBlob } from '../utils/downloadPurchaseOrderBlob'
import { normalizePoStatus } from './PurchaseOrderStatusBadge'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type {
  PurchaseOrder,
  PurchaseOrderListFilter,
  PurchaseOrderMode,
  PurchaseOrderRole,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Wallet,
  TrendingUp,
  List,
  Layers,
  ShoppingCart,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

type PurchaseOrderWorkspaceProps = {
  title: string
  description: string
  mode: PurchaseOrderMode
  role: PurchaseOrderRole
  defaultFilter?: PurchaseOrderListFilter
}

export function PurchaseOrderWorkspace({
  title,
  description,
  mode,
  role,
  defaultFilter = 'all',
}: PurchaseOrderWorkspaceProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<PurchaseOrderListFilter>(defaultFilter)
  const [selectedModeTab, setSelectedModeTab] = useState<'all' | 'svp' | 'public-bidding' | 'direct-acquisition'>('all')

  const effectiveMode = mode === 'all' ? selectedModeTab : mode

  // Force Direct Acquisition workspace to show all rows by default
  useEffect(() => {
    if (effectiveMode === 'direct-acquisition') setActiveFilter('all')
  }, [effectiveMode])

  const modeFilter = useMemo(() => {
    if (effectiveMode === 'svp') return 'ProcurementMode==SVP'
    if (effectiveMode === 'public-bidding') return 'ProcurementMode==PUBLIC_BIDDING'
    if (effectiveMode === 'direct-acquisition') return 'ProcurementMode==DIRECT_ACQUISITION'
    return undefined
  }, [effectiveMode])

  const { data: poResponse, isLoading, refetch } = useGetPurchaseOrders({
    filters: modeFilter,
    search: search ? search.trim() : undefined,
    pageSize: 100,
  })

  const purchaseOrders = useMemo(() => {
    if (!poResponse) return []
    if (Array.isArray(poResponse)) return poResponse
    if (Array.isArray((poResponse as any).data)) return (poResponse as any).data
    if (Array.isArray((poResponse as any).items)) return (poResponse as any).items
    return []
  }, [poResponse])

  // CRUD & Workflow mutations
  const deleteMutation = useDeletePurchaseOrder()
  const submitMutation = useSubmitPurchaseOrderForApproval()
  const approveMutation = useApprovePurchaseOrder()
  const returnMutation = useReturnPurchaseOrder()

  const [isSvpCreateOpen, setIsSvpCreateOpen] = useState(false)
  const [isPublicBiddingCreateOpen, setIsPublicBiddingCreateOpen] = useState(false)
  const [isDirectAcquisitionCreateOpen, setIsDirectAcquisitionCreateOpen] = useState(false)
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string | null>(null)
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [deletingPurchaseOrderId, setDeletingPurchaseOrderId] = useState<string | null>(null)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isSubmitForApprovalOpen, setIsSubmitForApprovalOpen] = useState(false)
  const [submitForApprovalPurchaseOrderId, setSubmitForApprovalPurchaseOrderId] = useState<string | null>(null)
  const [viewingDaPurchaseOrderId, setViewingDaPurchaseOrderId] = useState<string | null>(null)

  const deletingPurchaseOrder = useMemo(
    () => purchaseOrders.find((po) => po.id === deletingPurchaseOrderId) ?? null,
    [purchaseOrders, deletingPurchaseOrderId],
  )

  const submitForApprovalPurchaseOrder = useMemo(
    () => purchaseOrders.find((po) => po.id === submitForApprovalPurchaseOrderId) ?? null,
    [purchaseOrders, submitForApprovalPurchaseOrderId],
  )

  const filteredRows = useMemo(() => {
    return purchaseOrders.filter((purchaseOrder) => {
      const normalized = normalizePoStatus(purchaseOrder.status)
      if (activeFilter === 'all') return true
      if (activeFilter === 'submitted' || activeFilter === 'for-approval') {
        return normalized === 'for-approval' || normalized === 'submitted'
      }
      return normalized === activeFilter.toLowerCase().replace(/[-_\s]/g, '') || normalized === activeFilter
    })
  }, [activeFilter, purchaseOrders])

  // PO metrics - accurately segmented by status
  const totalPOAmount = purchaseOrders.reduce((s, p) => s + (p.totalAmount || 0), 0)
  const approvedPORows = purchaseOrders.filter((p) => normalizePoStatus(p.status) === 'approved')
  const totalApprovedPOAmount = approvedPORows.reduce((s, p) => s + (p.totalAmount || 0), 0)

  const poCountSummary = {
    draft: purchaseOrders.filter((p) => normalizePoStatus(p.status) === 'draft').length,
    submitted: purchaseOrders.filter((p) => {
      const s = normalizePoStatus(p.status)
      return s === 'for-approval' || s === 'submitted'
    }).length,
    approved: approvedPORows.length,
    returned: purchaseOrders.filter((p) => normalizePoStatus(p.status) === 'returned').length,
  }

  const modeLabel =
    effectiveMode === 'svp'
      ? 'SVP'
      : effectiveMode === 'direct-acquisition'
        ? 'Direct Acquisition'
        : effectiveMode === 'public-bidding'
          ? 'Public Bidding'
          : 'All Modes'

  // Workflow Handlers
  const handleSubmitForApprovalConfirm = async (purchaseOrderId: string) => {
    try {
      await submitMutation.mutateAsync(purchaseOrderId)
      toast.success('Purchase Order submitted for approval!')
      setIsSubmitForApprovalOpen(false)
      setSubmitForApprovalPurchaseOrderId(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit Purchase Order for approval.')
    }
  }

  const handleApproveConfirm = async (signedDocument: File) => {
    if (!selectedPurchaseOrderId) return
    try {
      if (signedDocument) {
        await uploadPoDocument(signedDocument)
      }
      await approveMutation.mutateAsync(selectedPurchaseOrderId)
      toast.success('Purchase Order approved successfully!')
      setIsApproveOpen(false)
      setSelectedPurchaseOrderId(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve Purchase Order.')
    }
  }

  const handleReturnConfirm = async (reason: string) => {
    if (!selectedPurchaseOrderId) return
    try {
      await returnMutation.mutateAsync({
        id: selectedPurchaseOrderId,
        request: { returnReason: reason },
      })
      toast.success('Purchase Order returned to draft!')
      setIsReturnOpen(false)
      setSelectedPurchaseOrderId(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to return Purchase Order.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPurchaseOrderId) return
    try {
      await deleteMutation.mutateAsync(deletingPurchaseOrderId)
      toast.success('Purchase Order deleted successfully!')
      setDeletingPurchaseOrderId(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete Purchase Order.')
    }
  }

  // If viewing DA PO details, show the full details page
  const viewingDaPo = useMemo(
    () => (viewingDaPurchaseOrderId ? purchaseOrders.find((po) => po.id === viewingDaPurchaseOrderId) : null),
    [purchaseOrders, viewingDaPurchaseOrderId],
  )

  if (viewingDaPo && (viewingDaPo.source === 'direct-acquisition' || viewingDaPo.procurementMode === 'DIRECT_ACQUISITION')) {
    return (
      <PODirectAcquisitionDetailsPage
        purchaseOrder={viewingDaPo}
        onBack={() => setViewingDaPurchaseOrderId(null)}
      />
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{title}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {modeLabel}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Single unified card — workspace header + summary widgets + table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>PO Management Workspace</CardTitle>
              <CardDescription>
                {effectiveMode === 'svp'
                  ? 'SVP purchase orders sourced from approved AOBs'
                  : effectiveMode === 'direct-acquisition'
                    ? 'Direct acquisition purchase orders'
                    : effectiveMode === 'public-bidding'
                      ? 'Public bidding purchase orders sourced from approved NOAs'
                      : 'Unified view of all purchase orders across all procurement modes'}
              </CardDescription>
            </div>
            {mode !== 'manage' && (
              <>
                {effectiveMode === 'all' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="gap-2">
                        + Create Purchase Order
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setIsSvpCreateOpen(true)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        SVP / Shopping PO
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setIsPublicBiddingCreateOpen(true)}>
                        <Layers className="h-4 w-4 mr-2" />
                        Public Bidding PO
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setIsDirectAcquisitionCreateOpen(true)}>
                        <Wallet className="h-4 w-4 mr-2" />
                        Direct Acquisition PO
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      if (effectiveMode === 'svp') {
                        setIsSvpCreateOpen(true)
                        return
                      }
                      if (effectiveMode === 'direct-acquisition') {
                        setIsDirectAcquisitionCreateOpen(true)
                        return
                      }
                      setIsPublicBiddingCreateOpen(true)
                    }}
                  >
                    +{' '}
                    {effectiveMode === 'svp'
                      ? 'Create SVP PO'
                      : effectiveMode === 'direct-acquisition'
                        ? 'Create Direct Acquisition PO'
                        : 'Create Public Bidding PO'}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Tabs for Unified Route */}
          {mode === 'all' && (
            <div className="border-b pb-4">
              <Tabs
                value={selectedModeTab}
                onValueChange={(val) => setSelectedModeTab(val as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
                  <TabsTrigger value="all">All Modes</TabsTrigger>
                  <TabsTrigger value="svp">SVP / Shopping</TabsTrigger>
                  <TabsTrigger value="public-bidding">Public Bidding</TabsTrigger>
                  <TabsTrigger value="direct-acquisition">Direct Acquisition</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total PO Amount */}
            <Card className="bg-indigo-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Total PO Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-white text-indigo-600 shadow-sm">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">
                      ₱{(totalPOAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Total across current mode</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Approved POs */}
            <Card className="bg-sky-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Total Approved POs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-700">
                      ₱{(totalApprovedPOAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Amount in approved POs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Count */}
            <Card className="bg-emerald-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {purchaseOrders.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Total POs created</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PO Summary */}
            <Card className="bg-gray-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <List className="h-4 w-4 text-muted-foreground" />
                  PO Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
                    <span className="text-muted-foreground">Drafts:</span>
                  </div>
                  <span className="font-medium">{poCountSummary.draft}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500 inline-block" />
                    <span className="text-muted-foreground">Submitted:</span>
                  </div>
                  <span className="font-medium">{poCountSummary.submitted}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-muted-foreground">Approved:</span>
                  </div>
                  <span className="font-medium">{poCountSummary.approved}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                    <span className="text-muted-foreground">Returned:</span>
                  </div>
                  <span className="font-medium">{poCountSummary.returned}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + filter */}
          <PurchaseOrderActionBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={activeFilter}
            onStatusFilterChange={(v) => setActiveFilter(v as PurchaseOrderListFilter)}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading purchase orders...</span>
            </div>
          ) : (
            <PurchaseOrderTable
              rows={filteredRows}
              role={role}
              mode={mode}
              onPrint={(purchaseOrderId) => {
                const po = purchaseOrders.find((p) => p.id === purchaseOrderId)
                if (po) {
                  // If printable document exists or mock download
                  const blob = new Blob([JSON.stringify(po, null, 2)], { type: 'application/json' })
                  downloadPurchaseOrderBlob({ blob, filename: `${po.poNumber || 'PO'}.json` })
                }
              }}
              onSubmit={(purchaseOrderId) => {
                setSubmitForApprovalPurchaseOrderId(purchaseOrderId)
                setIsSubmitForApprovalOpen(true)
              }}
              onReturn={(purchaseOrderId) => {
                setSelectedPurchaseOrderId(purchaseOrderId)
                setIsReturnOpen(true)
              }}
              onApprove={(purchaseOrderId) => {
                setSelectedPurchaseOrderId(purchaseOrderId)
                setIsApproveOpen(true)
              }}
              onViewDetails={(purchaseOrderId) => setViewingDaPurchaseOrderId(purchaseOrderId)}
              onEdit={(po) => setEditingPurchaseOrder(po)}
              onDelete={(purchaseOrderId) => setDeletingPurchaseOrderId(purchaseOrderId)}
            />
          )}
        </CardContent>
      </Card>

      <CreateSvpPurchaseOrderDialog open={isSvpCreateOpen} onOpenChange={setIsSvpCreateOpen} />
      <CreatePublicBiddingPurchaseOrderDialog open={isPublicBiddingCreateOpen} onOpenChange={setIsPublicBiddingCreateOpen} />
      <CreateDirectAcquisitionPurchaseOrderDialog open={isDirectAcquisitionCreateOpen} onOpenChange={setIsDirectAcquisitionCreateOpen} />

      <EditPurchaseOrderDialog
        open={Boolean(editingPurchaseOrder)}
        onOpenChange={(open) => {
          if (!open) setEditingPurchaseOrder(null)
        }}
        purchaseOrder={editingPurchaseOrder}
      />

      <ConfirmAlertDialog
        open={Boolean(deletingPurchaseOrderId)}
        onOpenChange={(open) => {
          if (!open) setDeletingPurchaseOrderId(null)
        }}
        title="Delete Purchase Order"
        description={`Are you sure you want to delete purchase order "${deletingPurchaseOrder?.poNumber || ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <SubmitForApprovalPurchaseOrderDialog
        open={isSubmitForApprovalOpen}
        onOpenChange={(open) => {
          setIsSubmitForApprovalOpen(open)
          if (!open) setSubmitForApprovalPurchaseOrderId(null)
        }}
        purchaseOrder={submitForApprovalPurchaseOrder}
        onConfirm={handleSubmitForApprovalConfirm}
        isSubmitting={submitMutation.isPending}
      />

      <ReturnPurchaseOrderDialog
        open={isReturnOpen}
        onOpenChange={(open) => {
          setIsReturnOpen(open)
          if (!open) setSelectedPurchaseOrderId(null)
        }}
        onSubmit={handleReturnConfirm}
        isSubmitting={returnMutation.isPending}
      />

      <ApprovePurchaseOrderDialog
        open={isApproveOpen}
        onOpenChange={(open) => {
          setIsApproveOpen(open)
          if (!open) setSelectedPurchaseOrderId(null)
        }}
        onSubmit={handleApproveConfirm}
        isSubmitting={approveMutation.isPending}
      />
    </div>
  )
}
