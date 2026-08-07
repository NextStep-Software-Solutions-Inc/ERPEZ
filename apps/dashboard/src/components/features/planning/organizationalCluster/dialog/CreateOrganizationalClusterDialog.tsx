import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOrganizationalClusterRequest } from '../handlers/createOrganizationalClusterRequest'
import CreateOrganizationalClusterForm from '../form/CreateOrganizationalClusterForm'
import type {
  CreateOrganizationalClusterFormType,
} from '../form/CreateOrganizationalClusterForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface CreateClusterDialogProps {
  onCreated?: (data: { name: string; description?: string }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useCreateCluster = createMutationHookFromTemplate(
  createOrganizationalClusterRequest,
)

export default function CreateClusterDialog({
  onCreated,
  open,
  onCancel,
  onOpenChange,
}: CreateClusterDialogProps) {
  const { mutateAsync } = useCreateCluster()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleCreateCluster = (data: CreateOrganizationalClusterFormType) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: data,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/clusters',
            })
            onCreated?.({
              name: data.name,
              description: data.description ?? undefined,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Creating Cluster...',
        success: 'Cluster created successfully!',
        error: 'Failed to create Cluster.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Create Organizational Cluster"
        description="Create new Organizational Cluster with all required information."
        className="sm:max-w-[700px]"
      >
        <CreateOrganizationalClusterForm
          mode="create"
          onSubmit={handleCreateCluster}
          onCancel={(form) =>
            form.state.isDirty
              ? setShowUnsavedWarning(true)
              : (onCancel?.() ?? onOpenChange?.(false))
          }
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={() => {
          setShowUnsavedWarning(false)
          onCancel?.() ?? onOpenChange?.(false)
        }}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
