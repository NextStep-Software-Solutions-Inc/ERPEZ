import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Building,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  ShoppingBag,
  Upload,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import {
  SupplierDirectContractingTable,
  type SupplierTableActionHandlers,
} from '../tables'
import { DARequirementsModal } from '../_components/DARequirementsModal'
import { useSuppliers } from '@/components/features/planning/procurement-library/suppliers/useSuppliers'
import { useSupplierDirectContractings } from '../handlers/supplierPortalRequests'
import {
  useChangeDirectContractingStatus,
  useDirectContractings,
  useSubmitProposal,
} from '@/features/procurement/direct-contracting/handlers'
import type { DirectContracting } from '@/features/procurement/direct-contracting/types'
import { useQueryClient } from 'erpez-shared-lib'
import React from 'react'

export function DirectContractingItemPage() {
  const queryClient = useQueryClient()
  const submitProposalMutation = useSubmitProposal()
  const statusMutation = useChangeDirectContractingStatus()

  // 1. URL-based Search Parameters & Navigation
  const searchParams = useSearch({
    from: '/v2/(procurement)/supplier-portal/direct-contracting-item/',
  })
  const navigate = useNavigate({
    from: '/v2/supplier-portal/direct-contracting-item',
  })

  const { pageNumber, pageSize, status, searchQuery } = searchParams

  const updateSearch = React.useCallback(
    (updates: Partial<typeof searchParams>) => {
      navigate({
        search: (prev) => {
          const next = {
            ...prev,
            ...updates,
          }
          if (!next.searchQuery || !next.searchQuery.trim()) {
            delete (next as any).searchQuery
          }
          return next
        },
        replace: true,
      })
    },
    [navigate],
  )

  // 2. Fetch Registered Suppliers for "Acting as" selector
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({
    pathParams: {},
    queryParams: {},
  })
  const registeredSuppliers = suppliersData?.data ?? []

  const envSupplierId =
    (typeof window !== 'undefined'
      ? localStorage.getItem('erpez_active_supplier_id') || undefined
      : undefined) ||
    (import.meta.env.VITE_TEST_SUPPLIER_ID as string) ||
    ''
  const [activeSupplierId, setActiveSupplierId] = React.useState<string>(envSupplierId)

  React.useEffect(() => {
    if (!activeSupplierId && registeredSuppliers.length > 0) {
      setActiveSupplierId(registeredSuppliers[0].id)
      if (typeof window !== 'undefined') {
        localStorage.setItem('erpez_active_supplier_id', registeredSuppliers[0].id)
      }
    }
  }, [registeredSuppliers, activeSupplierId])

  const handleSelectSupplier = (id: string) => {
    setActiveSupplierId(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('erpez_active_supplier_id', id)
    }
  }

  const selectedSupplierObj = registeredSuppliers.find((s) => s.id === activeSupplierId)

  // 3. Fetch Direct Contracting Items for Supplier
  // Primary query: dedicated supplier-scoped endpoint
  const {
    data: supplierItems,
    isLoading: isLoadingSupplierItems,
    refetch: refetchSupplierItems,
  } = useSupplierDirectContractings({
    queryParams: {
      supplierId: activeSupplierId,
    }, pathParams: {},
    enabled: Boolean(activeSupplierId),
  })

  // Fallback query: BAC direct contractings list (defense against empty backend supplier DB while developing)
  const {
    data: bacResponse,
    isLoading: isLoadingBac,
    refetch: refetchBac,
  } = useDirectContractings({
    pathParams: {},
    queryParams: { pageSize: 200 },
  })

  const isLoading = (isLoadingSupplierItems && Boolean(activeSupplierId)) || (isLoadingBac && !supplierItems?.length)

  // 4. Transform and merge data defensively
  const processedItems: DirectContracting[] = React.useMemo(() => {
    let rawList: DirectContracting[] = []

    if (supplierItems && supplierItems.length > 0) {
      rawList = supplierItems
    } else {
      // Use bacResponse.data (fixing the previous response.items bug!)
      const bacList = bacResponse?.data ?? []
      rawList = bacList.filter((item) => {
        // Suppliers never see internal drafts
        if ((item.status || '').toLowerCase() === 'draft') return false
        // If an active supplier is chosen, filter by that supplier if matched
        if (activeSupplierId && item.exclusiveSupplierId) {
          const isMatchingSupplier = item.exclusiveSupplierId.toLowerCase() === activeSupplierId.toLowerCase()
          // If match found, show only that supplier's items; otherwise if user wants to see test data, show items
          return isMatchingSupplier || bacList.every((b) => b.exclusiveSupplierId !== activeSupplierId)
        }
        return true
      })
    }

    const statusMap: Record<string, string> = {
      approved: 'approved',
      draft: 'draft',
      submitted: 'submitted',
      'for-review': 'for-review',
      for_review: 'for-review',
      'submitted-to-supplier': 'submitted-to-supplier',
      submitted_to_supplier: 'submitted-to-supplier',
      pending_for_approval: 'for-review',
      'pending-for-approval': 'for-review',
      returned: 'returned',
      rejected: 'returned',
    }

    return rawList.map((item) => ({
      ...item,
      dcName: item.dcName || item.name || '',
      prNumber: item.prNumber || item.bacProjectTitle || '',
      supplierName: item.supplierName || item.exclusiveSupplierName || '',
      status: statusMap[(item.status || '').toLowerCase()] || item.status || 'submitted-to-supplier',
    }))
  }, [supplierItems, bacResponse?.data, activeSupplierId])

  // 5. Interactive KPI Summary Counts
  const stats = React.useMemo(() => {
    const total = processedItems.length
    let pending = 0
    let submitted = 0
    let approved = 0
    let returned = 0

    processedItems.forEach((it) => {
      const s = (it.status || '').toLowerCase()
      const hasProposal = Boolean(it.proposalAmount || it.proposal)
      if (s === 'approved') approved += 1
      else if (s === 'returned' || s === 'rejected') returned += 1
      else if (s === 'for-review' || s === 'pending_for_approval' || s === 'submitted' || hasProposal) submitted += 1
      else pending += 1
    })

    return { total, pending, submitted, approved, returned }
  }, [processedItems])

  // 6. Quotation Modal State
  const [quotationItem, setQuotationItem] = React.useState<DirectContracting | null>(null)
  const [isQuotationOpen, setIsQuotationOpen] = React.useState(false)

  // 7. Table Action Handlers
  const handlers: SupplierTableActionHandlers = React.useMemo(
    () => ({
      onViewDetails: (id: string) => {
        const matched = processedItems.find((it) => it.id === id)
        const supId = matched?.exclusiveSupplierId || activeSupplierId
        navigate({
          to: '/v2/supplier-portal/direct-contracting-item/$id',
          params: { id },
          search: supId ? { supplierId: supId } : undefined,
        })
      },
      onOpenQuotation: (item: DirectContracting) => {
        setQuotationItem(item)
        setIsQuotationOpen(true)
      },
      onCopyDCNumber: (dcNumber: string) => {
        navigator.clipboard.writeText(dcNumber)
        toast.success(`Reference ${dcNumber} copied to clipboard.`)
      },
    }),
    [navigate],
  )

  // 8. Proposal Submit Handler
  const handleWizardSave = async (patch: Partial<DirectContracting> | any) => {
    if (!quotationItem) return
    if (patch.quotationStatus === 'submitted') {
      try {
        const payload = {
          exclusivityProofUrl: patch.exclusivityProofUrl || '',
          exclusivityProofFileName: patch.exclusivityProofFileName || '',
          proposalNotes: patch.proposalNotes || '',
          proposalAmount: patch.proposalAmount || 0,
          bidTotalAmount: patch.bidTotalAmount || 0,
          brand: patch.bidBrand || '',
          model: patch.bidModel || '',
          color: patch.bidColor || '',
          brochureFileUrl: patch.bidBrochureUrl || '',
          brochureFileName: patch.bidBrochureFileName || '',
          quotationItems: patch.quotationItems?.map((q: any) => ({
            cprItemId: q.cprItemId,
            unitPrice: q.bidUnitPrice,
            totalBid: q.bidTotalAmount,
            bidTotalAmount: q.bidTotalAmount,
            bidModel: q.bidModel,
            bidBrand: q.bidBrand,
            bidColor: q.bidColor,
            bidBrochureUrl: q.bidBrochureUrl,
            bidBrochureFileName: q.bidBrochureFileName,
          })),
        }

        await submitProposalMutation.mutateAsync({
          pathParams: { id: quotationItem.id },
          payload,
        })
        await statusMutation.mutateAsync({
          pathParams: { id: quotationItem.id },
          payload: { status: 'PENDING_FOR_APPROVAL' },
        })

        toast.success('Your formal bid and quotation have been submitted successfully to the BAC.')
        setIsQuotationOpen(false)
        setQuotationItem(null)

        // Invalidate queries to refresh data
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            query.queryKey[0].includes('direct-contracting'),
        })
        refetchSupplierItems()
        refetchBac()
      } catch (err) {
        console.error(err)
        toast.error('Failed to submit quotation. Please verify all required fields.')
      }
    }
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header Banner with Supplier Switcher */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-background border-violet-500/20 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Supplier Portal
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-300 font-semibold"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Direct Contracting
                </Badge>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Review exclusive procurement invitations, upload proof of exclusivity, and submit binding price proposals under RA 12009.
              </CardDescription>
            </div>

            {/* Acting As Supplier Selector */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur border border-violet-200 dark:border-violet-900 rounded-lg px-3 py-1.5 shadow-xs">
                <UserCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Acting as:
                </span>
                {isLoadingSuppliers ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Select value={activeSupplierId} onValueChange={handleSelectSupplier}>
                    <SelectTrigger className="h-8 border-violet-200 dark:border-violet-800 bg-background text-xs w-[220px]">
                      <SelectValue placeholder="Select a supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredSuppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id} className="text-xs">
                          {sup.name || 'Unnamed Supplier'} ({sup.status || 'Active'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold border-default-300"
              >
                <Building className="h-3.5 w-3.5 mr-1.5 text-primary" /> RA 12009 / Rule XVI
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interactive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invitations */}
        <Card
          onClick={() => updateSearch({ status: 'all', pageNumber: 1 })}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md border',
            !status || status === 'all'
              ? 'ring-2 ring-violet-500/50 border-violet-500 bg-violet-500/[0.04]'
              : 'hover:border-violet-400/40',
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Invitations
              </p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats.total}
              </p>
              <p className="text-[11px] text-muted-foreground">
                All proprietary requests
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-700 dark:text-violet-300">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Quotations */}
        <Card
          onClick={() => updateSearch({ status: 'pending', pageNumber: 1 })}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md border',
            status === 'pending'
              ? 'ring-2 ring-amber-500/50 border-amber-500 bg-amber-500/[0.04]'
              : 'hover:border-amber-400/40',
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Pending Quotation
              </p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {isLoading ? '...' : stats.pending}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Requires proposal submission
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Upload className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Proposals Submitted */}
        <Card
          onClick={() => updateSearch({ status: 'submitted', pageNumber: 1 })}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md border',
            status === 'submitted'
              ? 'ring-2 ring-sky-500/50 border-sky-500 bg-sky-500/[0.04]'
              : 'hover:border-sky-400/40',
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                Proposals Submitted
              </p>
              <p className="text-2xl font-bold text-sky-800 dark:text-sky-300">
                {isLoading ? '...' : stats.submitted}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Under review by BAC
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Approved Awards */}
        <Card
          onClick={() => updateSearch({ status: 'approved', pageNumber: 1 })}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md border',
            status === 'approved'
              ? 'ring-2 ring-emerald-500/50 border-emerald-500 bg-emerald-500/[0.04]'
              : 'hover:border-emerald-400/40',
          )}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Approved Awards
              </p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                {isLoading ? '...' : stats.approved}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ready for PO issuance
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modular TanStack Table v8 */}
      <SupplierDirectContractingTable
        data={processedItems}
        isLoading={isLoading}
        handlers={handlers}
        pageNumber={pageNumber}
        pageSize={pageSize}
        status={status}
        searchQuery={searchQuery}
        onPageChange={(page) => updateSearch({ pageNumber: page })}
        onPageSizeChange={(size) => updateSearch({ pageSize: size, pageNumber: 1 })}
        onStatusChange={(status) => updateSearch({ status, pageNumber: 1 })}
        onSearchChange={(query) => updateSearch({ searchQuery: query || undefined, pageNumber: 1 })}
      />

      {/* Quotation Wizard Modal */}
      {quotationItem && (
        <DARequirementsModal
          open={isQuotationOpen}
          onOpenChange={(open) => {
            setIsQuotationOpen(open)
            if (!open) setQuotationItem(null)
          }}
          item={quotationItem}
          onSave={handleWizardSave}
        />
      )}
    </div>
  )
}
