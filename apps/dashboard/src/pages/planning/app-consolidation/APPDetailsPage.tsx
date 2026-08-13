import { useNavigate, useParams } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { ArrowLeft, Edit2, Download, Plus } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryClient } from '@tanstack/react-query'
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  currentAppAtom,
  selectPPMPDialogOpenAtom,
  appDetailsDialogOpenAtom,
  signatoriesDialogOpenAtom,
  appExportDialogOpenAtom,
  createSupplementalAPPDialogOpenAtom,
} from '@/features/planning/app-consolidation/atoms'
import {
  PPMPListSection,
  AppDetailsHeader,
  AggregatedItemsSection,
  BACDetailsSection,
  SignatoriesSection,
  QuickActionsPanel,
  StatusBadge,
  SupplementalAPPsTable,
} from '@/features/planning/app-consolidation/components'
import {
  SelectPPMPDialog,
  EditAPPBACDialog,
  EditSignatoriesDialog,
  AppExportDialog,
  CreateSupplementalAPPDialog,
  AddAPPItemDialog,
  CreateUpdatedAPPDialog,
  CreateFinalAPPDialog,
} from '@/features/planning/app-consolidation/dialogs'
import { getAPPDetailRequest } from '@/features/planning/app-consolidation/handlers'
import { changeAPPStatusRequest } from '@/features/planning/app-consolidation/handlers/changeAPPStatusRequest'
import { transformAppDetailToAppMaster } from '@/features/planning/app-consolidation/utils/transformAppDetail'
import api from '@/services/api'

const useAPPDetail = createQueryHookFromTemplate(getAPPDetailRequest)
const useChangeAPPStatus = createMutationHookFromTemplate(changeAPPStatusRequest)

export function APPDetailsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { appId } = useParams({ from: '/v2/(planning)/app-consolidation/$appId' })
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const setSelectPPMPDialog = useSetAtom(selectPPMPDialogOpenAtom)
  const [, setAppDetailsDialog] = useAtom(appDetailsDialogOpenAtom)
  const [, setSignatoriesDialog] = useAtom(signatoriesDialogOpenAtom)
  const [appExportOpen, setAppExportOpen] = useAtom(appExportDialogOpenAtom)
  const [createSupplementalOpen, setCreateSupplementalOpen] = useAtom(createSupplementalAPPDialogOpenAtom)
  const [createUpdatedOpen, setCreateUpdatedOpen] = useState(false)
  const [createFinalOpen, setCreateFinalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch APP detail from API
  const { data: apiResponse, isLoading, error, refetch } = useAPPDetail({
    pathParams: { appId },
    queryParams: { appId },
  })

  // Real status mutation
  const changeStatus = useChangeAPPStatus()

  // Use transformed API data or currentApp for real-time updates
  const rawApiApp = apiResponse?.data ? transformAppDetailToAppMaster(apiResponse.data) : null

  // Preserve signatories from currentApp if apiApp has none
  const apiApp = useMemo(() => {
    if (!rawApiApp) return null
    if (currentApp?.id === rawApiApp.id && currentApp.signatories && !rawApiApp.signatories?.preparedBy) {
      return { ...rawApiApp, signatories: currentApp.signatories }
    }
    return rawApiApp
  }, [rawApiApp, currentApp])

  useEffect(() => {
    if (apiApp && (!currentApp || currentApp.id !== apiApp.id)) {
      setCurrentApp(apiApp)
    }
  }, [apiApp, currentApp, setCurrentApp])

  // Always prefer fresh API data; fall back to atom only while refetching
  const app = apiApp ?? (currentApp?.id === appId ? currentApp : null)

  // Invalidate both the detail and the list after a status change
  const invalidateAfterStatusChange = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/apps'] }),
      queryClient.invalidateQueries({ queryKey: [`/apps/${appId}`] }),
    ])
    await refetch()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/v2/app-consolidation' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading Annual Procurement Plan...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error || !app) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/v2/app-consolidation' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              {error ? 'Failed to load APP details' : 'Annual Procurement Plan not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDraft = app.status === 'Draft' || app.status === ('Returned' as any)
  const isLocked = app.status === 'Locked'
  const canEdit = isDraft && !isLocked
  const lineItemsCount = app.bac?.lineItems?.length || 0
  const lineItemsTotalQuantity = app.bac?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const itemCount = app.aggregationResults?.items && app.aggregationResults.items.length > 0
    ? app.aggregationResults.items.reduce((sum, item) => sum + item.items.length, 0)
    : lineItemsCount
  const totalQuantity = app.aggregationResults?.items && app.aggregationResults.items.length > 0
    ? app.aggregationResults.items.reduce((sum, item) => sum + item.totalQuantity, 0)
    : lineItemsTotalQuantity

  // ── Lifecycle-aware action visibility ─────────────────────────────────────
  // Follow-up (documented in implementation_plan.md):
  //   Indicative + Approved → [Create Final APP]   (not Create Updated)
  //   Final/Updated + Approved → [Create Updated APP]
  // For now we apply the immediate fix: gate "Create Updated APP" on appType.
  const canCreateUpdated =
    (app.status === 'Approved' || isLocked) &&
    (app.appType === 'Final' || app.appType === 'Updated')

  const handleExport = () => {
    setCurrentApp(app)
    setAppExportOpen(true)
  }

  const handleCreateSupplemental = () => {
    if (app.status !== 'Locked') {
      toast.error('Master APP must be locked before creating supplementals')
      return
    }
    setCurrentApp(app)
    setCreateSupplementalOpen(true)
  }

  const handleRemovePPMP = async (ppmpId: string) => {
    try {
      const response = await api.put(`/apps/${appId}/remove-ppmps`, { ppmpIds: [ppmpId] })
      if (response.data?.succeeded !== false) {
        toast.success('PPMP source removed from APP successfully')
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
        })
        await refetch()
      } else {
        toast.error(response.data?.message || 'Failed to remove PPMP')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove PPMP from APP')
    }
  }

  // ── Status mutations wired to real backend ────────────────────────────────

  const handleSubmit = async () => {
    try {
      await changeStatus.mutateAsync({
        pathParams: { appId },
        payload: { appId, status: 'Submitted' },
      })
      toast.success('APP submitted for review')
      await invalidateAfterStatusChange()
    } catch {
      toast.error('Failed to submit APP — please try again')
    }
  }

  const handleApprove = async () => {
    try {
      await changeStatus.mutateAsync({
        pathParams: { appId },
        payload: { appId, status: 'Approved' },
      })
      toast.success('APP approved')
      await invalidateAfterStatusChange()
    } catch {
      toast.error('Failed to approve APP — please try again')
    }
  }

  const handleMarkAsFinal = () => {
    setCreateFinalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pointer-events-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/v2/app-consolidation' })}
          className="pl-0 hover:bg-transparent cursor-pointer pointer-events-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to APPs
        </Button>
        <StatusBadge status={app.status} />
      </div>

      {/* APP Header */}
      <AppDetailsHeader app={app} />

      {/* Main Content Grid - with Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pointer-events-auto flex-wrap">
            {/* Indicative + Approved → Create Final APP (lifecycle follow-up) */}
            {app.appType === 'Indicative' && app.status === 'Approved' && (
              <Button
                onClick={handleMarkAsFinal}
                className="gap-2 cursor-pointer pointer-events-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Create Final APP
              </Button>
            )}

            {/* Submit for Review — Draft or Returned */}
            {isDraft && (
              <Button
                onClick={handleSubmit}
                disabled={changeStatus.isPending}
                className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity"
              >
                {changeStatus.isPending ? 'Submitting…' : 'Submit for Review'}
              </Button>
            )}

            {/* Approve — Submitted only */}
            {app.status === 'Submitted' && (
              <Button
                onClick={handleApprove}
                disabled={changeStatus.isPending}
                className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity"
              >
                {changeStatus.isPending ? 'Approving…' : 'Approve'}
              </Button>
            )}

            {/* Create Updated APP — Final or Updated + Approved/Locked only */}
            {canCreateUpdated && (
              <Button
                onClick={() => setCreateUpdatedOpen(true)}
                className="gap-2 cursor-pointer pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Updated APP
              </Button>
            )}

            {/* Create Supplemental — Locked only */}
            {isLocked && (
              <Button
                onClick={handleCreateSupplemental}
                variant="default"
                className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create Supplemental
              </Button>
            )}

            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2 cursor-pointer pointer-events-auto hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 pointer-events-auto">
              <TabsTrigger value="overview" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">Overview</TabsTrigger>
              <TabsTrigger value="aggregations" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">Summary</TabsTrigger>
              <TabsTrigger value="bac" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">APP Item Details</TabsTrigger>
              <TabsTrigger value="signatories" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">Signatories</TabsTrigger>
              {isLocked && (
                <TabsTrigger value="supplementals" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">
                  Supplementals
                </TabsTrigger>
              )}
            </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pointer-events-auto">
          <PPMPListSection
            app={app}
            isDraft={canEdit}
            status={app.status}
            onAddPPMP={() => {
              setCurrentApp(app)
              setSelectPPMPDialog(true)
            }}
            onRemovePPMP={handleRemovePPMP}
          />
        </TabsContent>

        {/* Summary Tab — fetches real analytics from /apps/{id}/analytics */}
        <TabsContent value="aggregations" className="space-y-4 pointer-events-auto">
          <Card className="border border-slate-200 shadow-xs bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 py-4 px-6">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">APP Summary</CardTitle>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Consolidated financial, procurement, and organizational summary
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AggregatedItemsSection appId={appId} app={app} isDraft={canEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BAC Details Tab */}
        <TabsContent value="bac" className="space-y-4 pointer-events-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Budget Alignment & Procurement</CardTitle>
              {isLocked && (
                <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded">
                  🔒 LOCKED - No edits allowed
                </span>
              )}
            </CardHeader>
            <CardContent>
              <BACDetailsSection
                app={app}
                isDraft={canEdit}
                itemCount={itemCount}
                onEdit={() => {
                  setCurrentApp(app)
                  setAppDetailsDialog(true)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signatories Tab */}
        <TabsContent value="signatories" className="space-y-4 pointer-events-auto">
          <SignatoriesSection
            app={app}
            isDraft={canEdit}
            itemCount={itemCount}
            onEdit={() => {
              setCurrentApp(app)
              setSignatoriesDialog(true)
            }}
          />
        </TabsContent>

        {/* Supplementals Tab */}
        {isLocked && (
          <TabsContent value="supplementals" className="space-y-4 pointer-events-auto">
            <SupplementalAPPsTable
              masterAppId={app.id}
              onViewDetails={(supplemental: any) => {
                toast.info(`Viewing supplemental: ${supplemental.supplementalName}`)
              }}
              onEdit={(supplemental: any) => {
                toast.info(`Editing supplemental: ${supplemental.supplementalName}`)
              }}
              onDelete={(supplemental: any) => {
                toast.success(`Deleted: ${supplemental.supplementalName}`)
              }}
            />
          </TabsContent>
        )}
      </Tabs>
        </div>

        {/* Quick Actions Panel - 1 column */}
        <QuickActionsPanel app={app} onTabChange={setActiveTab} isDraft={isDraft} />
      </div>

      {/* Dialogs */}
      <SelectPPMPDialog />
      <EditAPPBACDialog />
      <EditSignatoriesDialog />
      <AppExportDialog
        open={appExportOpen}
        onOpenChange={setAppExportOpen}
        app={app}
      />
      <CreateSupplementalAPPDialog
        open={createSupplementalOpen}
        onOpenChange={setCreateSupplementalOpen}
        masterApp={app}
      />
      <CreateUpdatedAPPDialog
        open={createUpdatedOpen}
        onOpenChange={setCreateUpdatedOpen}
      />
      <CreateFinalAPPDialog
        open={createFinalOpen}
        onOpenChange={setCreateFinalOpen}
        indicativeApp={app}
      />
      <AddAPPItemDialog />
    </div>
  )
}
