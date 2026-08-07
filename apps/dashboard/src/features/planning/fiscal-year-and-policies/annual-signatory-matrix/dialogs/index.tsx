'use client'

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  editSignatoryDialogOpenAtom,
  deleteSignatoryDialogOpenAtom,
  createSignatoryDialogOpenAtom,
  selectedSignatoryAtom,
} from '../atoms/signatoryMatrixAtoms'
import { useDeleteWorkflowMatrix } from '../handlers/hooks'
import type { SignatoryMatrixFormValues } from '../forms/signatoryMatrixForm.schema'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { getFiscalYearsRequest } from '../../fiscal-year-management/handlers/getFiscalYearsRequest'
import type {
  CreateWorkflowMatrixPayload,
  CreateWorkflowMatrixRequestPayload,
  UpdateWorkflowMatrixPayload,
} from '../types/workflowMatrixTypes'
import { createWorkflowMatrixRequest } from '../handlers/createWorkflowMatrixRequest'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import type { Department, User } from '@/lib/fiscal-year-and-policies/types'
import { CreateWorkflowMatrixForm, EditWorkflowMatrixForm } from '../forms'
import { getPersonnelPositionsRequest } from '@/components/features/planning/organizational-structure/handlers/getPersonnelPositionsRequest'
import { updateWorkflowMatrixRequest } from '../handlers/updateWorkflowMatrixRequest'

interface DialogProps {
  onSuccess?: () => void
}

type ApiError = {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)
const usePersonnelPosition = createQueryHookFromTemplate(
  getPersonnelPositionsRequest,
)
const useCreateWorkflowMatrix = createMutationHookFromTemplate(
  createWorkflowMatrixRequest,
)
const useUpdateWorkflowMatrix = createMutationHookFromTemplate(
  updateWorkflowMatrixRequest,
)

/**
 * Edit Signatory Dialog
 * Updated to use consolidated selectedSignatoryAtom
 */
export function EditSignatoryDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(editSignatoryDialogOpenAtom)
  const [selectedSignatory, setSelectedSignatory] = useAtom(
    selectedSignatoryAtom,
  )
  const { data: fiscalYears } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })
  const { data: officesData } = useOffices({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })
  const { data: personnelPositionsData } = usePersonnelPosition({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })
  const { mutateAsync: updateWorkflowMatrix, isPending } =
    useUpdateWorkflowMatrix()

  const personnelPositions = personnelPositionsData?.data ?? []

  const personnelPositionByUserId = useMemo(
    () => new Map(personnelPositions.map((entry) => [entry.user.id, entry])),
    [personnelPositions],
  )

  const availableUsers: User[] = useMemo(
    () =>
      personnelPositions.map((entry) => {
        const fullName =
          entry.user.fullName ||
          [
            entry.user.firstName,
            entry.user.middleName,
            entry.user.lastName,
            entry.user.nameExtension,
          ]
            .filter(Boolean)
            .join(' ')

        return {
          id: entry.user.id,
          name:
            fullName ||
            entry.user.username ||
            entry.user.email ||
            entry.user.id,
          department:
            entry.user.officeName ||
            entry.position.officeName ||
            'Unknown Office',
          position:
            entry.positionTitle ||
            entry.position.title ||
            entry.position.functionalTitle ||
            'Unknown',
        }
      }),
    [personnelPositions],
  )

  const availableDepartments: Department[] = (officesData?.data || []).map(
    (office) => ({
      id: office.id,
      name: office.name,
      code: office.code || '',
    }),
  )

  const handleClose = () => {
    setOpen(false)
    setSelectedSignatory(null)
  }

  const handleSubmit = async (values: SignatoryMatrixFormValues) => {
    if (!selectedSignatory?.id) return

    try {
      const recommendingApprover = personnelPositionByUserId.get(
        values.recommendingApproverId,
      )
      const finalApprover = personnelPositionByUserId.get(
        values.finalApproverId,
      )

      if (!recommendingApprover?.positionId || !finalApprover?.positionId) {
        throw new Error(
          'Unable to resolve approver positions from the selected users.',
        )
      }

      const payload: UpdateWorkflowMatrixPayload = {
        documentType: values.documentType,
        recommendingApproverPositionId: recommendingApprover.positionId,
        finalApproverPositionId: finalApprover.positionId,
      }

      const response = await updateWorkflowMatrix({
        pathParams: { id: selectedSignatory.id },
        payload,
      })

      toast.success(response.message || 'Signatory updated successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update signatory'
      toast.error(errorMessage)
    }
  }

  const formId = 'edit-signatory-form'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Edit Workflow Matrix"
      description="Update the recommending and final approvers for this office workflow matrix."
      size="xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update'}
          </Button>
        </div>
      }
    >
      {selectedSignatory && (
        <EditWorkflowMatrixForm
          formId={formId}
          onSubmit={handleSubmit}
          isLoading={isPending}
          isEdit={true}
          fiscalYearId={selectedSignatory.fiscalYearId}
          departmentId={selectedSignatory.departmentId}
          departmentName={selectedSignatory.departmentName}
          documentType={selectedSignatory.documentType || ''}
          recommendingApproverId={selectedSignatory.recommendingApproverId}
          finalApproverId={selectedSignatory.finalApproverId}
          availableUsers={availableUsers}
          availableDepartments={availableDepartments}
          availableFiscalYears={fiscalYears?.data || []}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}

/**
 * Delete Signatory Confirmation Dialog
 * Updated to use consolidated selectedSignatoryAtom
 */
export function DeleteSignatoryDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(deleteSignatoryDialogOpenAtom)
  const [selectedSignatory, setSelectedSignatory] = useAtom(
    selectedSignatoryAtom,
  )
  const { mutateAsync: deleteWorkflowMatrix, isPending } =
    useDeleteWorkflowMatrix()

  const handleClose = () => {
    setOpen(false)
    setSelectedSignatory(null)
  }

  const handleDelete = async () => {
    if (!selectedSignatory?.id) return

    try {
      const response = await deleteWorkflowMatrix({
        pathParams: { id: selectedSignatory.id },
      })

      toast.success(response.message || 'Signatory deleted successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete signatory'
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Signatory Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this signatory assignment? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Create Signatory Dialog
 * Uses consolidated selectedSignatoryAtom for consistency
 */

export function CreateSignatoryDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(createSignatoryDialogOpenAtom)
  const { mutateAsync: createWorkflowMatrix, isPending } =
    useCreateWorkflowMatrix()
  const { data: fiscalYears } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })
  const { data: officesData } = useOffices({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })
  const { data: personnelPositionsData } = usePersonnelPosition({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const personnelPositions = personnelPositionsData?.data ?? []

  const availableUsers: User[] = useMemo(
    () =>
      personnelPositions.map((entry) => {
        const fullName =
          entry.user.fullName ||
          [
            entry.user.firstName,
            entry.user.middleName,
            entry.user.lastName,
            entry.user.nameExtension,
          ]
            .filter(Boolean)
            .join(' ')

        return {
          id: entry.user.id,
          name:
            fullName ||
            entry.user.username ||
            entry.user.email ||
            entry.user.id,
          department:
            entry.user.officeName ||
            entry.position.officeName ||
            'Unknown Office',
          position:
            entry.positionTitle ||
            entry.position.title ||
            entry.position.functionalTitle ||
            'Unknown',
        }
      }),
    [personnelPositions],
  )

  const personnelPositionByUserId = useMemo(
    () => new Map(personnelPositions.map((entry) => [entry.user.id, entry])),
    [personnelPositions],
  )

  const handleClose = () => setOpen(false)

  const availableOffices: Department[] = (officesData?.data || []).map(
    (office) => ({
      id: office.id,
      name: office.name,
      code: office.code || '',
    }),
  )

  const handleSubmit = async (values: CreateWorkflowMatrixPayload) => {
    try {
      const recommendingApprover = personnelPositionByUserId.get(
        values.recommendingApproverUserId,
      )
      const finalApprover = personnelPositionByUserId.get(
        values.finalApproverUserId,
      )

      if (!recommendingApprover?.positionId || !finalApprover?.positionId) {
        throw new Error(
          'Unable to resolve approver positions from the selected users.',
        )
      }

      const payload: CreateWorkflowMatrixRequestPayload = {
        officeId: values.officeId,
        fiscalYearId: values.fiscalYearId,
        recommendingApproverPositionId: recommendingApprover.positionId,
        finalApproverPositionId: finalApprover.positionId,
        documentType: values.documentType,
      }
      const response = await createWorkflowMatrix({
        pathParams: {},
        payload,
      })
      toast.success(response.message || 'Workflow matrix created successfully')
      handleClose()
      onSuccess?.()
    } catch (error) {
      const err = error as ApiError
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create workflow matrix'
      toast.error(errorMessage)
    }
  }

  const formId = 'create-signatory-form'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Create Workflow Matrix"
      description="Assign recommending and final approvers for an office workflow matrix."
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      }
    >
      <CreateWorkflowMatrixForm
        formId={formId}
        onSubmit={handleSubmit}
        isLoading={isPending}
        availableUsers={availableUsers}
        availableOffices={availableOffices}
        availableFiscalYears={fiscalYears?.data || []}
      />
    </ResponsiveDialogDashtail>
  )
}
