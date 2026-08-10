import { useCallback, useState } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { appListAtom } from '../atoms'
import type { AppMaster } from '../types'

interface DeleteAPPDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  appIds: string[]
  onSuccess?: () => void
}

export function DeleteAPPDialog({
  open,
  onOpenChange,
  appIds,
  onSuccess,
}: DeleteAPPDialogProps) {
  const [, setAppList] = useAtom(appListAtom)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (isDeleting || appIds.length === 0) return

    setIsDeleting(true)
    try {
      // TODO: Call API to delete APP records
      for (const _ of appIds) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast.success(
        `${appIds.length === 1 ? 'APP' : `${appIds.length} APPs`} deleted successfully!`,
      )

      // Update app list by removing deleted items
      setAppList((prevList: AppMaster[]) =>
        prevList.filter((app: AppMaster) => !appIds.includes(app.id)),
      )

      onSuccess?.()
      onOpenChange?.(false)
    } catch (error) {
      toast.error('Failed to delete APP')
    } finally {
      setIsDeleting(false)
    }
  }, [appIds, isDeleting, setAppList, onSuccess, onOpenChange])

  const handleCancel = useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[99999] pointer-events-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete {appIds.length === 1 ? 'this APP' : `${appIds.length} APPs`}.
            This action cannot be undone. This will permanently delete the
            record{appIds.length !== 1 ? 's' : ''} from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting} className="pointer-events-auto cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="pointer-events-auto cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
