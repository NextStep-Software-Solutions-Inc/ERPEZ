/**
 * Purchase Request (PR) Main Page
 * Orchestrates all PR tasks in a tab layout
 * Mirrors Performance Review and Procurement Library patterns
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { CreatePRModal } from '../components/CreatePRModal'
import { PRDashboardTab } from '../components/PRDashboardTab'
import { ManagePRTab } from '../components/ManagePRTab'
import { PRDetailsPage } from '../components/PRDetailsPage'
import { PurchaseRequest } from '../types'

export default function PurchaseRequestPageV2() {
  // Detect whether this page was reached via the Manage PRs menu (route
  // '/v2/manage-prs'). When mounted from Manage PRs we show only the
  // 'Manage PR' tab; when mounted from the Purchase Requests page we show the
  // full tab set. We derive this from window.location.pathname so no route
  // specific hooks are required (avoids invariant errors).
  // TODO: Consider using useRouterState or passing the route variant as a prop
  // to avoid direct window.location access (breaks in SSR, hard to test).
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isManagePrsRoute = pathname.includes('/v2/manage-prs')

  // Derive the initial tab from URL search params (so deep linking still works).
  const urlParams =
    typeof window !== 'undefined'
      ? new URL(window.location.href).searchParams
      : new URL('http://localhost').searchParams
  const initialTabFromUrl = urlParams.get('tab') ?? undefined
  const initialAprIdFromUrl = urlParams.get('aprId') ?? undefined
  const initialAprNumberFromUrl = urlParams.get('aprNumber') ?? undefined
  const initialOfficeIdFromUrl = urlParams.get('officeId') ?? undefined

  const TAB_CONFIG = useMemo(
    () =>
      isManagePrsRoute
        ? [
            {
              id: 'manage-pr',
              label: 'Manage PR',
              description: 'Review and approve submitted PRs',
              icon: '✅',
              role: 'approving-authority',
            },
          ]
        : [
            {
              id: 'non-cse',
              label: 'Non-CSE Items',
              description: 'PR for Non-CSE items from approved PPMP',
              icon: '📝',
              role: 'office-staff',
            },
            {
              id: 'out-of-stock',
              label: 'Out-of-Stock Items',
              description: 'PR for CSE out-of-stock items from approved APR',
              icon: '📦',
              role: 'procurement-staff',
            },
          ],
    [isManagePrsRoute],
  )

  const purchaseRequests = usePurchaseRequestStore((s) => s.purchaseRequests)
  const setMetrics = usePurchaseRequestStore((s) => s.setMetrics)
  const setActivePR = usePurchaseRequestStore((s) => s.setActivePR)
  const ppmpItems = usePurchaseRequestStore((s) => s.ppmpItems)

  // Helper: displayStatus respects approved, submitted, for-bac-utilization ground truth
  const getDisplayStatus = (p: PurchaseRequest) => {
    if (!p) return 'draft'
    if (p.status === 'approved' || p.status === 'submitted' || p.status === 'for-bac-utilization') {
      return p.status
    }
    if (p.status === 'returned') {
      return 'returned'
    }
    try {
      if (
        (p as any).remarks &&
        (p as any).remarks.toString().trim().length > 0
      ) {
        return 'returned' as any
      }
    } catch {
      // ignore
    }
    return p.status
  }

  // Determine appropriate grid column count so tab triggers fit the available width
  const tabColsClass =
    TAB_CONFIG.length === 1
      ? 'grid-cols-1'
      : TAB_CONFIG.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3'

  const [activeTab, setActiveTab] = useState<string>(
    initialTabFromUrl ?? (isManagePrsRoute ? 'manage-pr' : 'non-cse'),
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPRType, setCurrentPRType] = useState<
    'non-cse' | 'out-of-stock'
  >('non-cse')
  const [viewingPR, setViewingPR] = useState<PurchaseRequest | null>(null)

  // Update metrics on mount and when PRs change
  useEffect(() => {
    // Calculate total PPMP budget from available PPMP items
    // TODO: Once API is wired, fetch totalPPMPAmount from backend API instead of calculating from store
    const calculatedPPMPTotal =
      ppmpItems.length > 0
        ? ppmpItems.reduce((sum, item) => sum + item.totalAmount, 0)
        : 0

    // Ensure Total PPMP Amount is not smaller than submitted PRs to avoid a negative Available Balance.
    // If PPMP total is lower than submitted PRs, raise it to submittedPRAmount + buffer.
    const PPMP_BUFFER = 10000000 // buffer to keep available balance positive and visible in UI (₱10,000,000)

    // Use displayStatus derivation to compute submitted amounts and counts so remarks-driven 'Returned' is reflected
    const nonDraftPRs = purchaseRequests.filter(
      (pr: PurchaseRequest) => getDisplayStatus(pr) !== 'draft',
    )
    const submittedPRAmount = nonDraftPRs.reduce(
      (sum: number, pr: PurchaseRequest) => sum + pr.totalAmount,
      0,
    )

    const totalPPMPAmount = Math.max(
      calculatedPPMPTotal,
      submittedPRAmount + PPMP_BUFFER,
    )

    const availableBalance = totalPPMPAmount - submittedPRAmount

    setMetrics({
      totalPPMPAmount,
      totalSubmittedPRAmount: submittedPRAmount,
      availableBalance,
      prCount: {
        draft: purchaseRequests.filter(
          (pr: PurchaseRequest) => getDisplayStatus(pr) === 'draft',
        ).length,
        submitted: purchaseRequests.filter(
          (pr: PurchaseRequest) => getDisplayStatus(pr) === 'submitted',
        ).length,
        approved: purchaseRequests.filter(
          (pr: PurchaseRequest) => getDisplayStatus(pr) === 'approved',
        ).length,
        returned: purchaseRequests.filter(
          (pr: PurchaseRequest) => getDisplayStatus(pr) === 'returned',
        ).length,
      },
    })
  }, [purchaseRequests, ppmpItems, setMetrics])

  // Ensure activeTab is valid for the current TAB_CONFIG.
  // Preserve URL-driven initial value; only fall back to a sensible default when
  // the current activeTab isn't present in TAB_CONFIG (e.g. invalid ?tab or route change).
  useEffect(() => {
    const validTabIds = new Set(TAB_CONFIG.map((t) => t.id))
    if (!validTabIds.has(activeTab)) {
      const defaultTab = isManagePrsRoute
        ? 'manage-pr'
        : (TAB_CONFIG[0]?.id ?? 'non-cse')
      setActiveTab(defaultTab)

      // Keep the URL in sync when we programmatically change the active tab.
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', defaultTab)
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [isManagePrsRoute, TAB_CONFIG, activeTab])

  // Automatically trigger Create PR Modal when navigated from an APR deficit alert
  useEffect(() => {
    if (initialTabFromUrl === 'out-of-stock' && initialAprIdFromUrl) {
      setCurrentPRType('out-of-stock')
      setShowCreateModal(true)
    }
  }, [initialTabFromUrl, initialAprIdFromUrl])

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)

    // Keep the URL in sync so deep links and browser navigation work.
    // Use the history API to update the `tab` search param without a full navigation.
    const url = new URL(window.location.href)
    url.searchParams.set('tab', newTab)
    window.history.pushState({}, '', url.toString())
  }

  const handleCreateClick = (prType: 'non-cse' | 'out-of-stock') => {
    setCurrentPRType(prType)
    setShowCreateModal(true)
  }

  const handleViewDetails = (pr: PurchaseRequest) => {
    // set as active in store so PRDetailsPage will reflect live updates
    setActivePR(pr)
    setViewingPR(pr)
  }

  const handleBackFromDetails = () => {
    setViewingPR(null)
    setActivePR(null)
  }

  // Show PR details if viewing
  if (viewingPR) {
    const isManageView = isManagePrsRoute || activeTab === 'manage-pr'
    return (
      <PRDetailsPage
        pr={viewingPR}
        onBack={handleBackFromDetails}
        isManagePRView={isManageView}
      />
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">
                Purchase Request (PR) Management
              </CardTitle>
              <CardDescription className="text-base">
                Unified module for procurement of Non-CSE items and Out-of-Stock
                CSE items with budget tracking and approval workflow
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {isManagePrsRoute ? 'Manage PR' : 'PR'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>PR Management Workspace</CardTitle>
          <CardDescription>
            Select a task to manage Purchase Requests across all procurement
            workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isManagePrsRoute ? (
            // When user navigates via the Manage PRs menu we do not show tabs —
            // render the ManagePR view directly.
            <div className="w-full">
              <ManagePRTab onViewDetails={handleViewDetails} />
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* Tab Navigation */}
              <TabsList
                className={`grid w-full ${tabColsClass} gap-2 bg-muted/50 p-2 mb-6`}
              >
                {TAB_CONFIG.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="whitespace-nowrap text-xs sm:text-sm"
                    title={tab.description}
                  >
                    <span className="hidden sm:inline mr-1">{tab.icon}</span>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Contents */}
              {!isManagePrsRoute && (
                <>
                  <TabsContent value="non-cse" className="space-y-4">
                    <PRDashboardTab
                      prType="non-cse"
                      onCreateClick={() => handleCreateClick('non-cse')}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>

                  <TabsContent value="out-of-stock" className="space-y-4">
                    <PRDashboardTab
                      prType="out-of-stock"
                      onCreateClick={() => handleCreateClick('out-of-stock')}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Create PR Modal */}
      {showCreateModal && (
        <CreatePRModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          prType={currentPRType}
          initialOfficeId={initialOfficeIdFromUrl}
          initialAprId={initialAprIdFromUrl}
          initialAprNumber={initialAprNumberFromUrl}
          initialPurpose={
            currentPRType === 'out-of-stock' && initialAprIdFromUrl
              ? `Procurement of out-of-stock CSE items from ${initialAprNumberFromUrl || 'approved APR'}`
              : undefined
          }
          onSuccess={(pr: PurchaseRequest) => {
            // Optionally navigate to details
            handleViewDetails(pr)
          }}
        />
      )}
    </div>
  )
}
