import { useAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  deleteIndicatorDialogOpenAtom,
  selectedIndicatorForDeleteAtom,
  kpiWithIndicatorsAtom,
} from '../atoms'
import {
  deleteIndicatorHandler,
  getKpiWithIndicatorsHandler,
} from '../handlers'

export function DeleteIndicatorDialog() {
  const [open, setOpen] = useAtom(deleteIndicatorDialogOpenAtom)
  const [selectedIndicator, setSelectedIndicator] = useAtom(
    selectedIndicatorForDeleteAtom,
  )
  const [_, setKpisWithIndicators] = useAtom(kpiWithIndicatorsAtom)

  // Delete indicator mutation
  const { mutateAsync: deleteIndicator, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedIndicator?.id) {
        throw new Error('No indicator selected')
      }
      return deleteIndicatorHandler(selectedIndicator.id)
    },
    onSuccess: async () => {
      toast.success('Indicator deleted successfully')
      // Refresh KPI list
      const result = await getKpiWithIndicatorsHandler()
      setKpisWithIndicators(result.data)
      // Reset dialog
      setOpen(false)
      setSelectedIndicator(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete indicator',
      )
    },
  })

  const handleConfirmDelete = async () => {
    await deleteIndicator()
  }

  const handleDialogClose = () => {
    setOpen(false)
    setSelectedIndicator(null)
  }

  if (!selectedIndicator) return null

  return (
    <AlertDialog open={open} onOpenChange={handleDialogClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Success Indicator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{selectedIndicator.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Code:</span>{' '}
            {selectedIndicator.code}
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
