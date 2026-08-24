import { useNavigate } from '@tanstack/react-router'
import useBacResolutionService from '../hooks/useBacResolutionService'
import { PageContainerDashtail } from '@/components/v2'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollText, Plus, BookOpen } from 'lucide-react'
import InboxPanel from './InboxPanel'
import DetailsPanel from './DetailsPanel'
import DialogsController from './DialogsController'
import { CreateBacResolutionDialog } from '../dialogs/CreateBacResolutionDialog'
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
  selectedId?: string
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
}

export function BacResolutionWorkspace({
  role,
  title,
  description,
  defaultFilter = 'all',
  selectedId,
  workspaceScope = 'all',
  bacListRoutePath = '/v2/bac-resolutions',
}: BacResolutionWorkspaceProps) {
  const navigate = useNavigate()
  const [clauseManagerOpen, setClauseManagerOpen] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)
  const [createPrModalOpen, setCreatePrModalOpen] = useState(false)

  const { ws } = useBacResolutionService(
    defaultFilter,
    selectedId,
    workspaceScope,
  )

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Sleek Unified Hero Header */}
      <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-semibold"
                >
                  <ScrollText className="h-3 w-3 mr-1.5" /> Bids and Awards Committee
                </Badge>
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </CardDescription>
            </div>

            {/* Global Workspace Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {role === 'procurement-staff' && (
                <Button
                  variant="outline"
                  onClick={() => void navigate({ to: '/v2/bac-resolutions/clauses' })}
                  className="gap-1.5 text-xs h-9 bg-white/80 hover:bg-white shadow-xs border-default-300"
                >
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Manage WHEREAS Clauses
                </Button>
              )}

              {role === 'procurement-staff' && (
                <Button
                  onClick={() => ws.setCreateOpen(true)}
                  className="gap-1.5 text-xs h-9 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Create BAC Resolution
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <PageContainerDashtail
        mode="simple"
        contentType="default"
        containerClassName="h-full min-h-0"
        contentClassName="space-y-6"
      >
        {/* 2-Column Responsive Split Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Master Queue (4 cols on desktop) */}
          <div className="lg:col-span-4">
            <InboxPanel
              inboxCards={ws.inboxCards}
              selectedId={selectedId ?? null}
              onSelectId={(id) =>
                void navigate({
                  to: '/v2/bac-resolutions/$resolutionId',
                  params: { resolutionId: id },
                })
              }
              searchValue={ws.searchValue}
              setSearchValue={ws.setSearchValue}
              filter={ws.filter}
              setFilter={ws.setFilter}
              sourceTypeFilter={ws.sourceTypeFilter}
              setSourceTypeFilter={ws.setSourceTypeFilter}
              budgetTier={ws.budgetTier}
              setBudgetTier={ws.setBudgetTier}
              customMinBudget={ws.customMinBudget}
              setCustomMinBudget={ws.setCustomMinBudget}
              customMaxBudget={ws.customMaxBudget}
              setCustomMaxBudget={ws.setCustomMaxBudget}
              sortBy={ws.sortBy}
              setSortBy={ws.setSortBy}
              resetAllFilters={ws.resetAllFilters}
              role={role}
              workspaceScope={workspaceScope}
              bacListRoutePath={bacListRoutePath}
              onEdit={(res) => {
                ws.setEditingResolution(res as any)
                ws.setEditOpen(true)
              }}
              onDelete={ws.handleDelete}
              onViewDetails={(id) => {
                ws.setDetailsResolutionId(id)
                ws.setDetailsOpen(true)
              }}
            />
          </div>

          {/* Right Column: Workbench Details Pane (8 cols on desktop) */}
          <div className="lg:col-span-8">
            <DetailsPanel
              selectedId={selectedId ?? null}
              role={role}
              workspaceScope={workspaceScope}
              bacListRoutePath={bacListRoutePath}
              handleViewConsolidatedPrDetails={ws.handleViewConsolidatedPrDetails}
              onLinkPrs={
                role === 'procurement-staff' && selectedId
                  ? () => ws.setLinkOpen(true)
                  : undefined
              }
              onSubmit={
                role === 'procurement-staff' && selectedId
                  ? ws.handleSubmit
                  : undefined
              }
              onViewDocument={
                selectedId ? () => setDocPreviewOpen(true) : undefined
              }
            />
          </div>
        </div>

        <CreateBacResolutionDialog
          open={ws.createOpen}
          onOpenChange={ws.setCreateOpen}
        />

        <DialogsController
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
          availablePrs={[]}
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
          docPreviewOpen={docPreviewOpen}
          setDocPreviewOpen={setDocPreviewOpen}
          createPrOpen={createPrModalOpen}
          setCreatePrOpen={setCreatePrModalOpen}
        />

        <ClauseTemplateManagerDialog
          open={clauseManagerOpen}
          onOpenChange={setClauseManagerOpen}
        />
      </PageContainerDashtail>
    </div>
  )
}

export default BacResolutionWorkspace
