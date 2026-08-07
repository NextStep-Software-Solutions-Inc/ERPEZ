/**
 * Master KPI Dialogs
 */

export * from './KpiDialog'
import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteKpiDialogOpenAtom,
  deleteMultipleKpisDialogOpenAtom,
  selectedKpiForDeleteAtom,
  selectedKpiIdsAtom,
} from '../atoms'
import type { MasterKPI } from '../types'
import { deleteMultipleKpisHandler } from '../handlers'
import { deleteKpiRequest } from '../handlers/deleteKpiRequest.ts'

interface DeleteKpiDialogProps {
  availableKpis: MasterKPI[]
}

const useDeleteKpi = createMutationHookFromTemplate(deleteKpiRequest)

/**
 * Delete Indicator Dialog
 */
export function DeleteKpiDialog({ availableKpis }: DeleteKpiDialogProps) {
  const [open, setOpen] = useAtom(deleteKpiDialogOpenAtom)
  const [selectedKpi] = useAtom(selectedKpiForDeleteAtom)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const deleteKpiMutation = useDeleteKpi()

  if (!selectedKpi) return null

  const hasChildren = availableKpis.some(
    (k) => k.parentKPIId === selectedKpi.id,
  )

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteKpiMutation.mutateAsync({
        pathParams: { id: selectedKpi.id },
      })
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/kpis')
        },
      })
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete indicator',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Key Performance Indicator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{selectedKpi.name}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Show warnings if applicable */}
        {hasChildren && (
          <Alert variant="outline">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This indicator has{' '}
              {
                availableKpis.filter((k) => k.parentKPIId === selectedKpi.id)
                  .length
              }{' '}
              child indicator(s). Delete them first before removing this
              indicator.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || hasChildren}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Delete Multiple KPIs Dialog
 */
export function DeleteMultipleKpisDialog() {
  const [open, setOpen] = useAtom(deleteMultipleKpisDialogOpenAtom)
  const [selectedIds, setSelectedIds] = useAtom(selectedKpiIdsAtom)
  const [isLoading, setIsLoading] = useState(false)

  const selectedCount = Object.keys(selectedIds).filter(
    (key) => selectedIds[key],
  ).length

  if (selectedCount === 0) return null

  const handleDeleteMultiple = async () => {
    setIsLoading(true)
    try {
      const idsToDelete = Object.keys(selectedIds).filter(
        (key) => selectedIds[key],
      )
      await deleteMultipleKpisHandler(idsToDelete)
      toast.success(`${selectedCount} indicator(s) deleted successfully`)
      setSelectedIds({})
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete selected indicators',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Multiple Indicators</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{selectedCount}</strong>{' '}
            selected indicator(s)? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert variant="outline" className="border-warning/50 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground text-xs">
            Indicators with associated sub-indicators will not be deleted.
            Please delete sub-indicators first.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 justify-end items-center mt-4">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMultiple}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : `Delete ${selectedCount} Items`}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
