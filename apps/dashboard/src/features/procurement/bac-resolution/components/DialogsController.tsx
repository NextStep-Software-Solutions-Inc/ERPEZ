import {
  CreateBacResolutionDialog,
  LinkConsolidatedPrsDialog,
  ApproveBacResolutionDialog,
  ReturnBacResolutionDialog,
  EditBacResolutionDialog,
  ViewBacResolutionDetailsDialog,
  ViewConsolidatedPrDetailsDialog,
} from '../dialogs'
import { BacResolutionDocumentPreviewModal } from '../dialogs/BacResolutionDocumentPreviewModal'
import { CreatePrFromBacModal } from '../dialogs/CreatePrFromBacModal'
import type {
  BacResolution,
  CreateBacResolutionPayload,
  LinkConsolidatedPrsPayload,
} from '../types'
import type { LinkableConsolidatedPr } from '../utils/bacResolutionWorkflow'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

interface DialogsControllerProps {
  createOpen: boolean
  setCreateOpen: (open: boolean) => void
  onCreate: (payload: CreateBacResolutionPayload) => Promise<void> | void
  editOpen: boolean
  setEditOpen: (open: boolean) => void
  editingResolution?: BacResolution
  onUpdate: (id: string, payload: CreateBacResolutionPayload) => Promise<void> | void
  deleteConfirmOpen: boolean
  setDeleteConfirmOpen: (open: boolean) => void
  onConfirmDelete: () => Promise<void> | void
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
  detailsResolutionId?: string | null
  viewConsolidatedPrOpen: boolean
  setViewConsolidatedPrOpen: (open: boolean) => void
  viewConsolidatedPrId?: string | null
  linkOpen: boolean
  setLinkOpen: (open: boolean) => void
  selectedResolution?: BacResolution
  availablePrs: LinkableConsolidatedPr[]
  onLink: (payload: LinkConsolidatedPrsPayload) => Promise<void> | void
  onViewConsolidatedPr?: (id: string) => void
  approveOpen: boolean
  setApproveOpen: (open: boolean) => void
  onApprove: (payload: {
    bacResolutionId: string
    signedDocument: File
  }) => Promise<void> | void
  returnOpen: boolean
  setReturnOpen: (open: boolean) => void
  onReturn: (payload: {
    bacResolutionId: string
    reason: string
  }) => Promise<void> | void
  submitConfirmOpen: boolean
  setSubmitConfirmOpen: (open: boolean) => void
  onConfirmSubmit: () => Promise<void> | void
  // Multi-source additional dialog controls
  docPreviewOpen?: boolean
  setDocPreviewOpen?: (open: boolean) => void
  createPrOpen?: boolean
  setCreatePrOpen?: (open: boolean) => void
  onPrCreated?: (prNumber: string) => void
}

export function DialogsController({
  createOpen,
  setCreateOpen,
  onCreate,
  editOpen,
  setEditOpen,
  editingResolution,
  onUpdate,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  onConfirmDelete,
  detailsOpen,
  setDetailsOpen,
  detailsResolutionId,
  viewConsolidatedPrOpen,
  setViewConsolidatedPrOpen,
  viewConsolidatedPrId,
  linkOpen,
  setLinkOpen,
  selectedResolution,
  availablePrs,
  onLink,
  onViewConsolidatedPr,
  approveOpen,
  setApproveOpen,
  onApprove,
  returnOpen,
  setReturnOpen,
  onReturn,
  submitConfirmOpen,
  setSubmitConfirmOpen,
  onConfirmSubmit,
  docPreviewOpen = false,
  setDocPreviewOpen,
  createPrOpen = false,
  setCreatePrOpen,
  onPrCreated,
}: DialogsControllerProps) {
  return (
    <>
      <CreateBacResolutionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreate}
      />

      <EditBacResolutionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        resolution={editingResolution}
        onUpdate={onUpdate}
      />

      <ConfirmAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete BAC Resolution Draft?"
        description="Are you sure you want to delete this BAC Resolution draft? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={onConfirmDelete}
      />

      <ConfirmAlertDialog
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        title="Submit BAC Resolution?"
        description="Are you sure you want to submit this BAC Resolution for approval?"
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={onConfirmSubmit}
      />

      <ViewBacResolutionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        resolutionId={detailsResolutionId}
        onCreatePr={() => {
          setDetailsOpen(false)
          setCreatePrOpen?.(true)
        }}
      />

      <ViewConsolidatedPrDetailsDialog
        open={viewConsolidatedPrOpen}
        onOpenChange={setViewConsolidatedPrOpen}
        consolidatedPrId={viewConsolidatedPrId}
      />

      {setDocPreviewOpen && (
        <BacResolutionDocumentPreviewModal
          open={docPreviewOpen}
          onOpenChange={setDocPreviewOpen}
          resolution={selectedResolution ?? null}
        />
      )}

      {setCreatePrOpen && (
        <CreatePrFromBacModal
          open={createPrOpen}
          onOpenChange={setCreatePrOpen}
          resolution={selectedResolution ?? null}
          onPrCreated={onPrCreated}
        />
      )}

      {selectedResolution && (
        <LinkConsolidatedPrsDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          bacResolutionId={selectedResolution.id}
          resolutionNumber={selectedResolution.bacResolutionNumber}
          availablePrs={availablePrs}
          selectedId={selectedResolution.linkedConsolidatedPrs?.[0]?.id || null}
          onLink={onLink}
          onViewDetails={onViewConsolidatedPr}
        />
      )}

      {selectedResolution && (
        <ApproveBacResolutionDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          bacResolutionId={selectedResolution.id}
          onApprove={onApprove}
        />
      )}

      {selectedResolution && (
        <ReturnBacResolutionDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          bacResolutionId={selectedResolution.id}
          onReturn={onReturn}
        />
      )}
    </>
  )
}

export default DialogsController
