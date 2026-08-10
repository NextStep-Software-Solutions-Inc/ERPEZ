import { useNavigate, useParams } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { ArrowLeft, Edit2, Download, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AppStatsGrid,
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
} from '@/features/planning/app-consolidation/dialogs'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAPPDetailRequest } from '@/features/planning/app-consolidation/handlers'
import { transformAppDetailToAppMaster } from '@/features/planning/app-consolidation/utils/transformAppDetail'

const useAPPDetail = createQueryHookFromTemplate(getAPPDetailRequest)

export function APPDetailsPage() {
  const navigate = useNavigate()
  const { appId } = useParams({ from: '/v2/(planning)/app-consolidation/$appId' })
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const setSelectPPMPDialog = useSetAtom(selectPPMPDialogOpenAtom)
  const [, setAppDetailsDialog] = useAtom(appDetailsDialogOpenAtom)
  const [, setSignatoriesDialog] = useAtom(signatoriesDialogOpenAtom)
  const [appExportOpen, setAppExportOpen] = useAtom(appExportDialogOpenAtom)
  const [createSupplementalOpen, setCreateSupplementalOpen] = useAtom(createSupplementalAPPDialogOpenAtom)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch APP detail from API
  const { data: apiResponse, isLoading, error } = useAPPDetail({
    pathParams: { appId },
    queryParams: { appId },
  })

  // Use transformed API data or currentApp for real-time updates
  const apiApp = apiResponse?.data ? transformAppDetailToAppMaster(apiResponse.data) : null

  useEffect(() => {
    if (apiApp && (!currentApp || currentApp.id !== apiApp.id)) {
      setCurrentApp(apiApp)
    }
  }, [apiApp, currentApp, setCurrentApp])

  const app = currentApp && currentApp.id === appId 
    ? currentApp 
    : apiApp

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

  const isDraft = app.status === 'Draft'
  const isLocked = app.status === 'Locked' || (app as any).isLocked
  const canEdit = isDraft && !isLocked
  const lineItemsCount = app.bac?.lineItems?.length || 0
  const lineItemsTotalQuantity = app.bac?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const itemCount = app.aggregationResults?.items && app.aggregationResults.items.length > 0
    ? app.aggregationResults.items.reduce((sum, item) => sum + item.items.length, 0)
    : lineItemsCount
  const totalQuantity = app.aggregationResults?.items && app.aggregationResults.items.length > 0
    ? app.aggregationResults.items.reduce((sum, item) => sum + item.totalQuantity, 0)
    : lineItemsTotalQuantity

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

  const handleRemovePPMP = (_ppmpId: string) => {
    toast.success('PPMP item removed')
  }

  const handleSubmit = () => {
    const updatedApp = { ...app, status: 'Submitted' as const }
    setCurrentApp(updatedApp)
    toast.success('APP submitted for review')
  }

  const handleApprove = () => {
    const updatedApp = { ...app, status: 'Approved' as const }
    setCurrentApp(updatedApp)
    toast.success('APP approved')
  }

  const handleMarkAsFinal = () => {
    const updatedApp = {
      ...app,
      appType: 'Final' as const,
    }
    setCurrentApp(updatedApp)
    toast.success('APP marked as Final. It can now be submitted for review.')
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

      {/* APP Header & Stats */}
      <AppDetailsHeader app={app} />
      <AppStatsGrid app={app} itemCount={itemCount} totalQuantity={totalQuantity} />

      {/* Main Content Grid - with Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Action Buttons */}
          {/* NOTE: Consider consolidating these buttons into ActionButtonsBar component for consistency */}
          <div className="flex gap-2 justify-end pointer-events-auto flex-wrap">
            {isDraft && app.appType === 'Indicative' && (
              <Button 
                onClick={handleMarkAsFinal} 
                className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Mark as Final
              </Button>
            )}
            {isDraft && (
              <Button onClick={handleSubmit} className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity">
                Submit for Review
              </Button>
            )}
            {app.status === 'Submitted' && (
              <Button onClick={handleApprove} className="gap-2 cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity">
                Approve
              </Button>
            )}
            {(app.status === 'Approved' || app.status === 'Locked') && (
              <Button
                onClick={handleCreateSupplemental}
                disabled={app.status !== 'Locked'}
                variant={app.status === 'Locked' ? 'default' : 'outline'}
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
              <TabsTrigger value="aggregations" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">Aggregations</TabsTrigger>
              <TabsTrigger value="bac" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">BAC Details</TabsTrigger>
              <TabsTrigger value="signatories" className="cursor-pointer pointer-events-auto transition-all hover:opacity-80">Signatories</TabsTrigger>
              {app.status === 'Locked' && (
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

        {/* Aggregations Tab */}
        <TabsContent value="aggregations" className="space-y-4 pointer-events-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Aggregated Items</CardTitle>
              {canEdit && itemCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info('Aggregations update coming soon')}
                  className="gap-2 cursor-pointer pointer-events-auto hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Update
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <AggregatedItemsSection app={app} isDraft={canEdit} onEdit={() => toast.info('Edit aggregated items coming soon')} />
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
              {canEdit && itemCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentApp(app)
                    setAppDetailsDialog(true)
                  }}
                  className="gap-2 cursor-pointer pointer-events-auto hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Signatories</CardTitle>
              {canEdit && itemCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentApp(app)
                    setSignatoriesDialog(true)
                  }}
                  className="gap-2 cursor-pointer pointer-events-auto hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <SignatoriesSection 
                app={app} 
                isDraft={canEdit} 
                itemCount={itemCount}
                onEdit={() => {
                  setCurrentApp(app)
                  setSignatoriesDialog(true)
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplementals Tab */}
        {app.status === 'Locked' && (
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
      {/* Task 2.10: Export Dialog */}
      <AppExportDialog
        open={appExportOpen}
        onOpenChange={setAppExportOpen}
        app={app}
      />
      {/* Task 3.10: Create Supplemental Dialog */}
      <CreateSupplementalAPPDialog
        open={createSupplementalOpen}
        onOpenChange={setCreateSupplementalOpen}
        masterApp={app}
      />
      <AddAPPItemDialog />
    </div>
  )
}
