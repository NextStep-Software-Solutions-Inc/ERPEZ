import { useNavigate } from '@tanstack/react-router'
import { PageContainerDashtail } from '@/components/v2'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollText, Plus, BookOpen } from 'lucide-react'
import InboxPanel from './InboxPanel'
import DetailsPanel from './DetailsPanel'
import { CreateBacResolutionDialog } from '../dialogs/CreateBacResolutionDialog'
import { EditBacResolutionDialog } from '../dialogs/EditBacResolutionDialog'
import { ViewBacResolutionDetailsDialog } from '../dialogs/ViewBacResolutionDetailsDialog'
import { ViewConsolidatedPrDetailsDialog } from '../dialogs/ViewConsolidatedPrDetailsDialog'
import { BacResolutionDocumentPreviewModal } from '../dialogs/BacResolutionDocumentPreviewModal'
import { CreatePrFromBacModal } from '../dialogs/CreatePrFromBacModal'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type {
  BacResolutionListRoutePath,
  BacResolutionInboxFilter,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
  BacProject,
  BacProjectDetails,
} from '../types'
import { ClauseTemplateManagerDialog } from './ClauseTemplateManagerDialog'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { useSubmitBacResolution } from '../handlers/hooks'
import { deleteBacResolutionRequest } from '../handlers/deleteBacResolutionRequest'
import { updateBacResolutionRequest } from '../handlers/updateBacResolutionRequest'
import { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'
import { toast } from 'sonner'

const useDeleteBacResolution = createMutationHookFromTemplate(deleteBacResolutionRequest)
const useUpdateBacResolution = createMutationHookFromTemplate(updateBacResolutionRequest)

interface BacResolutionWorkspaceProps {
  role: BacResolutionRole
  title: string
  description: string
  defaultFilter?: BacResolutionInboxFilter
  selectedId?: string
  workspaceScope?: BacResolutionWorkspaceScope
  bacListRoutePath?: BacResolutionListRoutePath
}

const statusOptions: BacResolutionInboxFilter[] = [
  'all',
  'draft',
  'for-approval',
  'returned',
  'approved',
]

function formatInboxFilterLabel(status: BacResolutionInboxFilter) {
  return status === 'all'
    ? 'All'
    : status
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')
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
  const navigate = useNavigate({
    from: '/v2/bac-resolutions/'
  })
  const queryClient = useQueryClient()
  const { mutateAsync: deleteBacProject } = useDeleteBacResolution()
  const { mutateAsync: updateBacProject } = useUpdateBacResolution()
  const { mutateAsync: submitBacResolution } = useSubmitBacResolution()

  // Filter & Queue Search States
  const [searchValue, setSearchValue] = useState('')
  const [filter, setFilter] = useState<BacResolutionInboxFilter>(defaultFilter)
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'APP_ITEM' | 'CONSOLIDATED_PR'>('all')
  const [budgetTier, setBudgetTier] = useState<'all' | 'under-1m' | '1m-5m' | 'above-5m' | 'custom'>('all')
  const [customMinBudget, setCustomMinBudget] = useState<number | null>(null)
  const [customMaxBudget, setCustomMaxBudget] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-desc' | 'amount-asc'>('newest')

  const resetAllFilters = () => {
    setSearchValue('')
    setFilter('all')
    setSourceTypeFilter('all')
    setBudgetTier('all')
    setCustomMinBudget(null)
    setCustomMaxBudget(null)
    setSortBy('newest')
  }

  // Modals & Dialog States
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingResolution, setEditingResolution] = useState<BacProject | undefined>(undefined)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resolutionToDeleteId, setResolutionToDeleteId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsResolutionId, setDetailsResolutionId] = useState<string | null>(null)
  const [viewConsolidatedPrOpen, setViewConsolidatedPrOpen] = useState(false)

  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)
  const [createPrModalOpen, setCreatePrModalOpen] = useState(false)
  const [clauseManagerOpen, setClauseManagerOpen] = useState(false)

  // Inbox cards definition
  const inboxCards = useMemo(() => {
    return statusOptions.map((status) => ({
      status,
      label: formatInboxFilterLabel(status),
      count: 0,
    }))
  }, [])

  // Handlers

  const handleDelete = (id: string) => {
    setResolutionToDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!resolutionToDeleteId) return
    const idToDelete = resolutionToDeleteId

    try {
      await toast.promise(
        deleteBacProject(
          { pathParams: { id: idToDelete } },
          {
            onSuccess: async () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/bac/projects'),
              })
              if (selectedId === idToDelete) {
                void navigate({
                  search: (prev: Record<string, unknown>) => ({ ...prev, id: undefined }),
                  replace: true,
                })
              }
            },
          },
        ),
        {
          loading: 'Deleting BAC Project...',
          success: 'BAC Project deleted successfully!',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to delete BAC Project.',
        },
      )
    } catch {
      // toast handles presentation
    } finally {
      setDeleteConfirmOpen(false)
      setResolutionToDeleteId(null)
    }
  }

  const handleUpdate = async (id: string, payload: CreateBacResolutionPayload) => {
    try {
      await toast.promise(
        updateBacProject(
          {
            pathParams: { id }, queryParams: {},
            payload
          },
          {
            onSuccess: async () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/bac/projects'),
              })
            },
          },
        ),
        {
          loading: 'Updating BAC Project...',
          success: 'BAC Project updated successfully!',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to update BAC Project.',
        },
      )
    } catch {
      // toast handles presentation
    }
  }
  const handleSubmit = () => { setSubmitConfirmOpen(true) }
  const handleConfirmSubmit = async () => {
    if (!selectedId) return
    setSubmitConfirmOpen(false)
    try {
      await toast.promise(
        submitBacResolution(
          {
            payload: { bacResolutionId: selectedId },
          },
          {
            onSuccess: async () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/bac/projects'),
              })
            },
          },
        ),
        {
          loading: 'Submitting BAC Resolution for approval...',
          success: 'BAC Resolution submitted for approval successfully!',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to submit BAC Resolution.',
        },
      )
    } catch {
      // toast handles presentation
    }
  }


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
                  onClick={() => setCreateOpen(true)}
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
              inboxCards={inboxCards}
              selectedId={selectedId ?? null}
              onSelectId={(id) =>
                void navigate({
                  search: (prev: Record<string, unknown>) => ({ ...prev, id }),
                  replace: true,
                })
              }
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              filter={filter}
              setFilter={setFilter}
              sourceTypeFilter={sourceTypeFilter}
              setSourceTypeFilter={setSourceTypeFilter}
              budgetTier={budgetTier}
              setBudgetTier={setBudgetTier}
              customMinBudget={customMinBudget}
              setCustomMinBudget={setCustomMinBudget}
              customMaxBudget={customMaxBudget}
              setCustomMaxBudget={setCustomMaxBudget}
              sortBy={sortBy}
              setSortBy={setSortBy}
              resetAllFilters={resetAllFilters}
              role={role}
              workspaceScope={workspaceScope}
              bacListRoutePath={bacListRoutePath}
              onEdit={(res: BacProject) => {
                setEditingResolution(res)
                setEditOpen(true)
              }}
              onDelete={handleDelete}
              onViewDetails={(id) => {
                setDetailsResolutionId(id)
                setDetailsOpen(true)
              }}
            />
          </div>

          {/* Right Column: Workbench Details Pane (8 cols on desktop) */}
          <div className="lg:col-span-8">
            <DetailsPanel
              selectedId={selectedId ?? null}
              role={role}
              onEdit={
                selectedId
                  ? (project?: BacProjectDetails) => {
                    if (project) {
                      setEditingResolution(project)
                    }
                    setEditOpen(true)
                  }
                  : undefined
              }
              onLinkPrs={
                () => { }
              }
              onSubmit={
                role === 'procurement-staff' && selectedId
                  ? handleSubmit
                  : undefined
              }
              onViewDocument={
                selectedId ? () => setDocPreviewOpen(true) : undefined
              }
              onDelete={
                selectedId ? () => handleDelete(selectedId) : undefined
              }
            />
          </div>
        </div>

        <CreateBacResolutionDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <EditBacResolutionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          resolution={editingResolution ?? undefined}
          onUpdate={handleUpdate}
        />

        <ConfirmAlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete BAC Resolution Draft?"
          description="Are you sure you want to delete this BAC Resolution draft? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
        />

        <ConfirmAlertDialog
          open={submitConfirmOpen}
          onOpenChange={setSubmitConfirmOpen}
          title="Submit BAC Resolution?"
          description="Are you sure you want to submit this BAC Resolution for approval?"
          confirmLabel="Submit"
          cancelLabel="Cancel"
          onConfirm={handleConfirmSubmit}
        />

        <ViewBacResolutionDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          resolutionId={detailsResolutionId}
          onCreatePr={() => {
            setDetailsOpen(false)
            setCreatePrModalOpen(true)
          }}
        />

        <ViewConsolidatedPrDetailsDialog
          open={viewConsolidatedPrOpen}
          onOpenChange={setViewConsolidatedPrOpen}
          consolidatedPrId={""}
        />

        <BacResolutionDocumentPreviewModal
          open={docPreviewOpen}
          onOpenChange={setDocPreviewOpen}
          resolution={null}
        />

        <CreatePrFromBacModal
          open={createPrModalOpen}
          onOpenChange={setCreatePrModalOpen}
          resolution={null}
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
