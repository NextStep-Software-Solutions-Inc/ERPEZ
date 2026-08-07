import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import * as erpSharedLib from 'erpez-shared-lib'
import { useAtom, useSetAtom } from 'jotai'
import { deleteKpiRequest } from '../../handlers/deleteKpiRequest'
import {
  closeDeleteDialogAtom,
  closeDeleteMultipleDialogAtom,
  deleteDialogAtom,
  deleteMultipleDialogAtom,
} from '../atoms'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const { useQueryClient } = erpSharedLib
const useDeleteSubKpi = createMutationHookFromTemplate(deleteKpiRequest)

interface DeleteSubKpiDialogProps {
  ids: Array<string>
}

export default function DeleteSubKpiDialog({
  ids,
}: DeleteSubKpiDialogProps) {
  const { mutateAsync, isPending } = useDeleteSubKpi()
  const queryClient = useQueryClient()
  
  // Determine if this is single or multiple delete based on which atom is open
  const [deleteState] = useAtom(deleteDialogAtom)
  const [deleteMultipleState] = useAtom(deleteMultipleDialogAtom)
  const closeDelete = useSetAtom(closeDeleteDialogAtom)
  const closeDeleteMultiple = useSetAtom(closeDeleteMultipleDialogAtom)
  
  const isOpen = deleteState.isOpen || deleteMultipleState.isOpen
  const isMultiple = deleteMultipleState.isOpen

  const onDelete = () => {
    for (const id of ids) {
      toast.promise(
        mutateAsync(
          { pathParams: { id } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/kpis'),
              })
            },
          },
        ),
        {
          loading: 'Deleting SubKPI...',
          success: (res) => {
            if (isMultiple) {
              closeDeleteMultiple()
            } else {
              closeDelete()
            }
            return res.message
          },
          error: 'Failed to delete SubKPI.',
        },
      )
    }
  }

  const handleCancelDelete = () => {
    void queryClient.cancelQueries({
      queryKey: ['kpis/:kpiId/sub-kpi/:subKpiId'],
    })
    if (isMultiple) {
      closeDeleteMultiple()
    } else {
      closeDelete()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelDelete()
    }
  }

  return (
    <ConfirmAlertDialog
      loading={isPending}
      onConfirm={onDelete}
      onCancel={handleCancelDelete}
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={`Are you absolutely sure you want to delete ${ids.length > 1 ? 'these Sub-KPIs' : 'this Sub-KPI'}?`}
      description="This action cannot be undone. This will permanently delete the record from the server."
    />
  )
}
