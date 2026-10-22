import { useState, useEffect, useRef } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type { BacProject, BacProjectDetails } from '../types'
import {
  EditBacResolutionForm,
  type EditBacResolutionFormRef,
} from '../forms/EditBacResolutionForm'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getBacResolutionRequest } from '../handlers/getBacResolutionRequest'
import { UpdateBacProjectPayload } from '../handlers/updateBacResolutionRequest'

const useBacResolution = createQueryHookFromTemplate(getBacResolutionRequest)

interface EditBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolution?: BacProject | BacProjectDetails
  onUpdate: (id: string, values: UpdateBacProjectPayload) => Promise<void> | void
}

export function EditBacResolutionDialog({
  open,
  onOpenChange,
  resolution,
  onUpdate,
}: EditBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [pendingValues, setPendingValues] = useState<UpdateBacProjectPayload | null>(null)
  const formRef = useRef<EditBacResolutionFormRef>(null)

  const { data: detailsData } = useBacResolution({
    pathParams: { id: resolution?.id || '' },
    queryParams: {},
    enabled: open && !!resolution?.id
  })

  // Reset dirty status on open change
  useEffect(() => {
    if (open) {
      setIsDirty(false)
      setShowSaveConfirm(false)
      setPendingValues(null)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmitForm = (values: UpdateBacProjectPayload) => {
    setPendingValues(values)
    setShowSaveConfirm(true)
  }

  const handleSaveClick = async () => {
    if (formRef.current) {
      await formRef.current.submit()
    }
  }

  const handleConfirmSave = async () => {
    if (pendingValues && resolution) {
      await onUpdate(resolution.id, pendingValues)
      setShowSaveConfirm(false)
      setPendingValues(null)
      onOpenChange(false)
    }
  }

  if (!resolution) return null

  // Extract inner BACResolution if present on full project response or resolution object
  const fullProject = detailsData?.data || (resolution as BacProjectDetails)
  const resDetail = fullProject.bacResolutions?.[0]

  // Map generic clause links if present
  const allClauseLinks = resDetail?.clauseLinks || []
  const whereasClauseLinks = allClauseLinks
    .filter((c) => (c.clauseType || 'Whereas').toLowerCase() === 'whereas')
    .map((c) => ({ resolutionClauseId: c.resolutionClauseId, order: c.order }))

  const nowThereforeClauses = allClauseLinks
    .filter((c) => (c.clauseType || '').toLowerCase() === 'nowtherefore')
    .map((c) => ({ resolutionClauseId: c.resolutionClauseId, order: c.order }))

  const resolvedClauses = allClauseLinks
    .filter((c) => (c.clauseType || '').toLowerCase() === 'resolved')
    .map((c) => ({ resolutionClauseId: c.resolutionClauseId, order: c.order }))

  // Legacy fallback for Whereas clauses
  const rawWhereas = fullProject.whereasClauses || resDetail?.whereasClauses || []
  const prepopulatedClauses = rawWhereas
    .map((c: Record<string, unknown>, idx: number) => ({
      whereasClauseId: String(c.whereasClauseId || c.id || ''),
      order: typeof c.order === 'number' ? c.order : idx,
      name: (c.name || c.title || '') as string,
      body: (c.body || c.content || '') as string,
    }))
    .filter((c) => !!c.whereasClauseId)

  const initialValues: Partial<UpdateBacProjectPayload & { abc?: number }> = {
    title: fullProject.title || fullProject.appItem?.ppmpItemName || fullProject.consolidatedPR?.description || '',
    abc: fullProject.abc,
    resolutionType: fullProject.resolutionType || resDetail?.resolutionType || 'award-recommendation',
    resolutionNumber: fullProject.resolutionNumber || resDetail?.resolutionNumber || '',
    dateResolved: fullProject.dateResolved || resDetail?.dateResolved || '',
    resolvedLocation: fullProject.resolvedLocation || resDetail?.resolvedLocation || '',
    whereasClauses: prepopulatedClauses,
    whereasClauseLinks: whereasClauseLinks.length > 0 ? whereasClauseLinks : undefined,
    nowThereforeClauses: nowThereforeClauses.length > 0 ? nowThereforeClauses : undefined,
    resolvedClauses: resolvedClauses.length > 0 ? resolvedClauses : undefined,
    endUserRepresentativeId: fullProject.endUserRepresentativeId || fullProject.endUserRepresentative?.id || undefined,
    techRepresentativeId: fullProject.techRepresentativeId || fullProject.techRepresentative?.id || undefined,
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning && !showSaveConfirm}
        onOpenChange={handleOpenChange}
        title="Edit BAC Resolution"
        description="Update the BAC Resolution draft details."
        size="4xl"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveClick}>
              Save Changes
            </Button>
          </div>
        }
      >
        <EditBacResolutionForm
          ref={formRef}
          initialValues={initialValues}
          projectDetails={fullProject}
          onSubmit={handleSubmitForm}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title="Confirm Save Changes?"
        description="Are you sure you want to update this BAC Resolution draft?"
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={() => {
          setShowSaveConfirm(false)
          setPendingValues(null)
        }}
      />

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard changes?"
        description="You have unsaved edits. Do you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          setIsDirty(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}

