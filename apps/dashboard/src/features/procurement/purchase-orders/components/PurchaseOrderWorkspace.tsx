import { useMemo, useState, useEffect } from 'react'
import { PurchaseOrderActionBar } from './PurchaseOrderActionBar'
import { PurchaseOrderTable } from './PurchaseOrderTable'
import { PODirectAcquisitionDetailsPage } from './PODirectAcquisitionDetailsPage'
import {
  ApprovePurchaseOrderDialog,
  CreateDirectAcquisitionPurchaseOrderDialog,
  CreatePublicBiddingPurchaseOrderDialog,
  CreateSvpPurchaseOrderDialog,
  ReturnPurchaseOrderDialog,
  SelectAobDialog,
  SelectDirectAcquisitionDialog,
  SelectNoaDialog,
  SubmitForApprovalPurchaseOrderDialog,
} from '../dialogs'
import { usePurchaseOrderStore } from '../data/purchaseOrderStore'
import { downloadPurchaseOrderBlob } from '../utils/downloadPurchaseOrderBlob'
import type {
  PurchaseOrderListFilter,
  PurchaseOrderMode,
  PurchaseOrderRole,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FileText, Wallet, TrendingUp, List, Layers, ShoppingCart } from 'lucide-react'

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
  const purchaseOrders = usePurchaseOrderStore((state) => state.purchaseOrders)
  const printPurchaseOrder = usePurchaseOrderStore((state) => state.printPurchaseOrder)
  const submitForApproval = usePurchaseOrderStore((state) => state.submitForApproval)
  const linkAob = usePurchaseOrderStore((state) => state.linkAob)
  const linkNoa = usePurchaseOrderStore((state) => state.linkNoa)
  const returnPurchaseOrder = usePurchaseOrderStore((state) => state.returnPurchaseOrder)
  const approvePurchaseOrder = usePurchaseOrderStore((state) => state.approvePurchaseOrder)
  const linkDirectAcquisition = usePurchaseOrderStore((state) => state.linkDirectAcquisition)

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<PurchaseOrderListFilter>(defaultFilter)

  // Force Direct Acquisition workspace to show all rows by default
  useEffect(() => {
    if (mode === 'direct-acquisition') setActiveFilter('all')
  }, [mode])

  const [isSvpCreateOpen, setIsSvpCreateOpen] = useState(false)
  const [isPublicBiddingCreateOpen, setIsPublicBiddingCreateOpen] = useState(false)
  const [isDirectAcquisitionCreateOpen, setIsDirectAcquisitionCreateOpen] = useState(false)
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string | null>(null)
  const [isAobPickerOpen, setIsAobPickerOpen] = useState(false)
  const [isNoaPickerOpen, setIsNoaPickerOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isSubmitForApprovalOpen, setIsSubmitForApprovalOpen] = useState(false)
  const [submitForApprovalPurchaseOrderId, setSubmitForApprovalPurchaseOrderId] = useState<string | null>(null)
  const [, setIsDaPickerOpen] = useState(false)
  const [viewingDaPurchaseOrderId, setViewingDaPurchaseOrderId] = useState<string | null>(null)

  const selectedPurchaseOrder = useMemo(
    () => purchaseOrders.find((po) => po.id === selectedPurchaseOrderId),
    [purchaseOrders, selectedPurchaseOrderId],
  )

  const submitForApprovalPurchaseOrder = useMemo(
    () => purchaseOrders.find((po) => po.id === submitForApprovalPurchaseOrderId) ?? null,
    [purchaseOrders, submitForApprovalPurchaseOrderId],
  )

  const sourceFilteredRows = useMemo(() => {
    const byMode = purchaseOrders.filter((purchaseOrder) => {
      if (mode === 'svp') return purchaseOrder.source === 'svp'
      if (mode === 'public-bidding') return purchaseOrder.source === 'public-bidding'
      if (mode === 'direct-acquisition') return purchaseOrder.source === 'direct-acquisition'
      return true
    })

    return byMode.filter((purchaseOrder) => {
      const matchesFilter = activeFilter === 'all' ? true : purchaseOrder.status === activeFilter
      const haystack = [purchaseOrder.poNumber, purchaseOrder.description, purchaseOrder.supplierName ?? '', purchaseOrder.sourceDocumentNumber ?? '']
        .join(' ')
        .toLowerCase()

      return matchesFilter && haystack.includes(search.toLowerCase())
    })
  }, [activeFilter, mode, purchaseOrders, search])

  const modeFilteredRows = useMemo(() => {
    return purchaseOrders.filter((purchaseOrder) => {
      if (mode === 'svp') return purchaseOrder.source === 'svp'
      if (mode === 'public-bidding') return purchaseOrder.source === 'public-bidding'
      if (mode === 'direct-acquisition') return purchaseOrder.source === 'direct-acquisition'
      return true
    })
  }, [mode, purchaseOrders])

  // PO metrics
  const MODE_ROWS = modeFilteredRows
  const totalPOAmount = MODE_ROWS.reduce((s, p) => s + p.totalAmount, 0)
  const submittedPORows = MODE_ROWS.filter((p) => p.status !== 'draft')
  const totalSubmittedPOAmount = submittedPORows.reduce((s, p) => s + p.totalAmount, 0)
  // Prefer real budget data if available on POs; otherwise only show a fabricated "buffer" in dev or when explicitly enabled.
  const hasBudgetSource = purchaseOrders.some((p) => typeof (p as any).budgetAmount === 'number')

  let availablePOBalance: number | null = null

  if (hasBudgetSource) {
    // Derive available balance from real budget fields when present
    const totalBudget = purchaseOrders.reduce((s, p) => s + ((p as any).budgetAmount ?? 0), 0)
    availablePOBalance = totalBudget - totalSubmittedPOAmount
  } else {
    // Do NOT surface a misleading fabricated budget in production.
    // Allow a developer opt-in via NODE_ENV=development or an explicit env flag.
    const enablePlaceholder =
      process.env.NODE_ENV === 'development' ||
      process.env.REACT_APP_ENABLE_PLACEHOLDER_PO_BALANCE === 'true'

    if (enablePlaceholder) {
      const PO_BUFFER = 10_000_000 // clearly a dev placeholder; controlled by the flag above
      const totalPOBudget = Math.max(totalPOAmount, totalSubmittedPOAmount + PO_BUFFER)
      availablePOBalance = totalPOBudget - totalSubmittedPOAmount
    } else {
      // Hide the widget by keeping availablePOBalance null (UI can treat null as "no data" or hide)
      availablePOBalance = null
    }
  }
  const poCountSummary = {
    draft: MODE_ROWS.filter((p) => p.status === 'draft').length,
    submitted: submittedPORows.length,
    approved: MODE_ROWS.filter((p) => p.status === 'approved').length,
    returned: MODE_ROWS.filter((p) => p.status === 'returned').length,
  }

  // Determine grid columns for the inline status tabs
  const modeLabel = mode === 'svp' ? 'SVP' : mode === 'direct-acquisition' ? 'Direct Acquisition' : 'Public Bidding'

  // If viewing DA PO details, show the full details page
  const viewingDaPo = useMemo(
    () => (viewingDaPurchaseOrderId ? purchaseOrders.find((po) => po.id === viewingDaPurchaseOrderId) : null),
    [purchaseOrders, viewingDaPurchaseOrderId],
  )

  if (viewingDaPo && viewingDaPo.source === 'direct-acquisition') {
    return (
      <PODirectAcquisitionDetailsPage
        purchaseOrder={viewingDaPo}
        onBack={() => setViewingDaPurchaseOrderId(null)}
      />
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card — matches PR Management gradient header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{title}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />{modeLabel}
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
                {mode === 'svp'
                  ? 'SVP purchase orders sourced from approved AOBs'
                  : mode === 'direct-acquisition'
                    ? 'Direct acquisition purchase orders'
                    : 'Public bidding purchase orders sourced from approved NOAs'}
              </CardDescription>
            </div>
            {mode !== 'manage' && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (mode === 'svp') { setIsSvpCreateOpen(true); return }
                  if (mode === 'direct-acquisition') { setIsDirectAcquisitionCreateOpen(true); return }
                  setIsPublicBiddingCreateOpen(true)
                }}
              >
                + {mode === 'svp' ? 'Create SVP PO' : mode === 'direct-acquisition' ? 'Create Direct Acquisition PO' : 'Create Public Bidding PO'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
                      ₱{(totalPOAmount || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Total amount across current source filter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Submitted POs */}
            <Card className="bg-sky-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Total Submitted POs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-700">
                      ₱{(totalSubmittedPOAmount || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Amount in submitted / non-draft POs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Balance */}
            <Card className="bg-emerald-50 hover:shadow-md transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      ₱{(availablePOBalance || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Remaining budget-like balance (derived)</p>
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
          <PurchaseOrderTable
              rows={sourceFilteredRows}
              role={role}
              onPrint={(purchaseOrderId) => {
                const result = printPurchaseOrder(purchaseOrderId)
                if (result) downloadPurchaseOrderBlob(result)
              }}
              onSubmit={(purchaseOrderId) => {
                setSubmitForApprovalPurchaseOrderId(purchaseOrderId)
                setIsSubmitForApprovalOpen(true)
              }}
              onLinkAob={(purchaseOrderId) => { setSelectedPurchaseOrderId(purchaseOrderId); setIsAobPickerOpen(true) }}
              onLinkNoa={(purchaseOrderId) => { setSelectedPurchaseOrderId(purchaseOrderId); setIsNoaPickerOpen(true) }}
              onReturn={(purchaseOrderId) => { setSelectedPurchaseOrderId(purchaseOrderId); setIsReturnOpen(true) }}
              onApprove={(purchaseOrderId) => { setSelectedPurchaseOrderId(purchaseOrderId); setIsApproveOpen(true) }}
              onViewDetails={(purchaseOrderId) => setViewingDaPurchaseOrderId(purchaseOrderId)}
          />
        </CardContent>
      </Card>

      <CreateSvpPurchaseOrderDialog open={isSvpCreateOpen} onOpenChange={setIsSvpCreateOpen} />
      <CreatePublicBiddingPurchaseOrderDialog open={isPublicBiddingCreateOpen} onOpenChange={setIsPublicBiddingCreateOpen} />
      <CreateDirectAcquisitionPurchaseOrderDialog open={isDirectAcquisitionCreateOpen} onOpenChange={setIsDirectAcquisitionCreateOpen} />

      <SubmitForApprovalPurchaseOrderDialog
        open={isSubmitForApprovalOpen}
        onOpenChange={(open) => {
          setIsSubmitForApprovalOpen(open)
          if (!open) setSubmitForApprovalPurchaseOrderId(null)
        }}
        purchaseOrder={submitForApprovalPurchaseOrder}
        onConfirm={(purchaseOrderId) => {
          submitForApproval({ purchaseOrderId })
          setSubmitForApprovalPurchaseOrderId(null)
        }}
      />

      <SelectAobDialog
        open={isAobPickerOpen}
        onOpenChange={(open) => { setIsAobPickerOpen(open); if (!open) setSelectedPurchaseOrderId(null) }}
        selectedAobId={selectedPurchaseOrder?.sourceDocumentId}
        onSelect={(aobId) => { if (selectedPurchaseOrderId) linkAob({ purchaseOrderId: selectedPurchaseOrderId, aobId }); setIsAobPickerOpen(false); setSelectedPurchaseOrderId(null) }}
      />

      <SelectNoaDialog
        open={isNoaPickerOpen}
        onOpenChange={(open) => { setIsNoaPickerOpen(open); if (!open) setSelectedPurchaseOrderId(null) }}
        selectedNoaId={selectedPurchaseOrder?.sourceDocumentId}
        onSelect={(noaId) => { if (selectedPurchaseOrderId) linkNoa({ purchaseOrderId: selectedPurchaseOrderId, noaId }); setIsNoaPickerOpen(false); setSelectedPurchaseOrderId(null) }}
      />

      <SelectDirectAcquisitionDialog
        open={Boolean(selectedPurchaseOrderId && selectedPurchaseOrder?.source === 'direct-acquisition')}
        onOpenChange={(open) => { if (!open) setSelectedPurchaseOrderId(null) }}
        selectedDaId={selectedPurchaseOrder?.sourceDocumentId}
        onSelect={(daId) => { if (selectedPurchaseOrderId) linkDirectAcquisition({ purchaseOrderId: selectedPurchaseOrderId, daId }); setIsDaPickerOpen(false); setSelectedPurchaseOrderId(null) }}
      />

      <ReturnPurchaseOrderDialog
        open={isReturnOpen}
        onOpenChange={(open) => { setIsReturnOpen(open); if (!open) setSelectedPurchaseOrderId(null) }}
        onSubmit={(reason) => { if (selectedPurchaseOrderId) returnPurchaseOrder({ purchaseOrderId: selectedPurchaseOrderId, reason }); setIsReturnOpen(false); setSelectedPurchaseOrderId(null) }}
      />

      <ApprovePurchaseOrderDialog
        open={isApproveOpen}
        onOpenChange={(open) => { setIsApproveOpen(open); if (!open) setSelectedPurchaseOrderId(null) }}
        onSubmit={(signedDocument) => { if (selectedPurchaseOrderId) approvePurchaseOrder({ purchaseOrderId: selectedPurchaseOrderId, signedDocument }); setIsApproveOpen(false); setSelectedPurchaseOrderId(null) }}
      />
    </div>
  )
}
