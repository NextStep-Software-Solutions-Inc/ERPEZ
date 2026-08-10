import { useState } from 'react'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { toast } from 'sonner'
import { updateClusterRequest } from '../handlers/updateOrganizationalClusterRequest'
import CreateOrganizationalClusterForm from '../form/CreateOrganizationalClusterForm'
import type {
  CreateOrganizationalClusterFormType,
} from '../form/CreateOrganizationalClusterForm';
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface UpdateClusterDialogProps {
  clusterId: string
  cluster: CreateOrganizationalClusterFormType
  onUpdated?: (data: {
    name: string
    description?: string
    clusterId?: string | null
  }) => void
  open: boolean
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
}

const useUpdateCluster = createMutationHookFromTemplate(updateClusterRequest)

export default function UpdateClusterDialog({
  clusterId,
  cluster,
  onUpdated,
  open,
  onCancel,
  onOpenChange,
}: UpdateClusterDialogProps) {
  const { mutateAsync } = useUpdateCluster()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const queryClient = useQueryClient()

  const handleUpdateCluster = (data: CreateOrganizationalClusterFormType) => {
    const payload = {
      name: data.name,
      description: data.description ?? undefined,
      id: clusterId,
    }

    toast.promise(
      mutateAsync(
        {
          pathParams: { id: clusterId },
          payload,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === '/clusters',
            })
            onUpdated?.({
              name: data.name,
              description: data.description ?? undefined,
            })
            onOpenChange?.(false)
          },
        },
      ),
      {
        loading: 'Updating Cluster...',
        success: 'Cluster updated successfully!',
        error: 'Failed to update Cluster.',
      },
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={onOpenChange}
        title="Edit Organizational Cluster"
        className="sm:max-w-[700px]"
      >
        <CreateOrganizationalClusterForm
          mode="update"
          initialValues={cluster}
          onSubmit={handleUpdateCluster}
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
