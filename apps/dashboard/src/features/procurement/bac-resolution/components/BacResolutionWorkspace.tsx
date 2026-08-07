import useBacResolutionService from '../hooks/useBacResolutionService'
import SummaryCards from './SummaryCards'
import { PageContainerDashtail } from '@/components/v2'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import { BacResolutionActionBar } from './index'
import { Badge } from '@/components/ui/badge'
import { ScrollText } from 'lucide-react'
import { downloadBacResolutionBlob } from '../utils/downloadBacResolutionBlob'
import InboxPanel from './InboxPanel'
import DetailsPanel from './DetailsPanel'
import DialogsController from './DialogsController'
import type {
  BacResolutionListRoutePath,
  BacResolutionInboxFilter,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import { ClauseTemplateManagerDialog } from './ClauseTemplateManagerDialog'

interface BacResolutionWorkspaceProps {
  role: BacResolutionRole
  title: string
  description: string
  defaultFilter?: BacResolutionInboxFilter
  initialSelectedResolutionId?: string
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BacResolutionWorkspace({
  role,
  title,
  description,
  defaultFilter = 'all',
  initialSelectedResolutionId,
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
}: BacResolutionWorkspaceProps) {
  const [clauseManagerOpen, setClauseManagerOpen] = useState(false)
  const { ws, isLoading, metricCards } = useBacResolutionService(
    defaultFilter,
    initialSelectedResolutionId,
    workspaceScope,
  )

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match Fiscal Year & Policies styling */}
      <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">{title}</CardTitle>
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold"
              >
                <ScrollText className="h-3.5 w-3.5 mr-1.5" /> BAC Resolutions
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <PageContainerDashtail
        mode="simple"
        contentType="default"
        containerClassName="h-full min-h-0"
        contentClassName="space-y-4"
      >
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex flex-col gap-3 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">
              Quick Actions and Inbox Summary
            </CardTitle>
            <BacResolutionActionBar
              role={role}
              resolution={ws.selectedResolution ?? undefined}
              onManageClauses={
                role === 'procurement-staff'
                  ? () => setClauseManagerOpen(true)
                  : undefined
              }
              onCreate={
                role === 'procurement-staff'
                  ? () => ws.setCreateOpen(true)
                  : undefined
              }
              onApprove={
                role === 'bac-chairperson' && ws.selectedResolution
                  ? () => ws.setApproveOpen(true)
                  : undefined
              }
              onReturn={
                role === 'bac-chairperson' && ws.selectedResolution
                  ? () => ws.setReturnOpen(true)
                  : undefined
              }
              isLoading={isLoading}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <SummaryCards metricCards={metricCards} />
          </CardContent>
        </Card>

        <InboxPanel
          inboxCards={ws.inboxCards}
          isLoading={ws.isBacResolutionsLoading}
          resolutions={ws.resolutions}
          filteredResolutions={ws.filteredResolutions}
          selectedResolutionId={ws.selectedResolutionId}
          setSelectedResolutionId={ws.setSelectedResolutionId}
          searchValue={ws.searchValue}
          setSearchValue={ws.setSearchValue}
          filter={ws.filter}
          setFilter={ws.setFilter}
          role={role}
          workspaceScope={workspaceScope}
          bacListRoutePath={bacListRoutePath}
          onEdit={(res) => {
            ws.setEditingResolution(res)
            ws.setEditOpen(true)
          }}
          onDelete={ws.handleDelete}
          onViewDetails={(id) => {
            ws.setDetailsResolutionId(id)
            ws.setDetailsOpen(true)
          }}
        />

        <div className="space-y-4">
          <DetailsPanel
            selectedResolution={ws.selectedResolution}
            role={role}
            workspaceScope={workspaceScope}
            bacListRoutePath={bacListRoutePath}
            handleViewConsolidatedPrDetails={ws.handleViewConsolidatedPrDetails}
            isLoading={isLoading}
            onLinkPrs={
              role === 'procurement-staff' && ws.selectedResolution
                ? () => ws.setLinkOpen(true)
                : undefined
            }
            onPrint={
              ws.selectedResolution
                ? async () => {
                    const result = await ws.handlePrint()
                    if (result)
                      downloadBacResolutionBlob(result.blob, result.fileName)
                  }
                : undefined
            }
            onSubmit={
              role === 'procurement-staff' && ws.selectedResolution
                ? ws.handleSubmit
                : undefined
            }
          />
        </div>

        <DialogsController
          createOpen={ws.createOpen}
          setCreateOpen={ws.setCreateOpen}
          onCreate={ws.handleCreate}
          editOpen={ws.editOpen}
          setEditOpen={ws.setEditOpen}
          editingResolution={ws.editingResolution ?? undefined}
          onUpdate={ws.handleUpdate}
          deleteConfirmOpen={ws.deleteConfirmOpen}
          setDeleteConfirmOpen={ws.setDeleteConfirmOpen}
          onConfirmDelete={ws.handleConfirmDelete}
          detailsOpen={ws.detailsOpen}
          setDetailsOpen={ws.setDetailsOpen}
          detailsResolutionId={ws.detailsResolutionId}
          viewConsolidatedPrOpen={ws.viewConsolidatedPrOpen}
          setViewConsolidatedPrOpen={ws.setViewConsolidatedPrOpen}
          viewConsolidatedPrId={ws.viewConsolidatedPrId}
          linkOpen={ws.linkOpen}
          setLinkOpen={ws.setLinkOpen}
          selectedResolution={ws.selectedResolution ?? undefined}
          availablePrs={ws.availablePrs}
          onLink={ws.handleLink}
          onViewConsolidatedPr={ws.handleViewConsolidatedPrDetails}
          approveOpen={ws.approveOpen}
          setApproveOpen={ws.setApproveOpen}
          onApprove={ws.handleApprove}
          returnOpen={ws.returnOpen}
          setReturnOpen={ws.setReturnOpen}
          onReturn={ws.handleReturn}
          submitConfirmOpen={ws.submitConfirmOpen}
          setSubmitConfirmOpen={ws.setSubmitConfirmOpen}
          onConfirmSubmit={ws.handleConfirmSubmit}
        />

        <ClauseTemplateManagerDialog
          open={clauseManagerOpen}
          onOpenChange={setClauseManagerOpen}
        />
      </PageContainerDashtail>
    </div>
  )
}
