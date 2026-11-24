import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'sonner'
import { useQueryClient } from 'erpez-shared-lib'
import {
  useResolutionClauses,
  useCreateResolutionClause,
  useUpdateResolutionClause,
  useDeleteResolutionClause,
} from '../handlers/hooks'
import { ResolutionClausesTable } from '../components/ResolutionClausesTable'
import { ResolutionClauseFormDialog } from '../components/ResolutionClauseFormDialog'
import type { ResolutionClause, ResolutionClauseType } from '../types'

export function ResolutionClausesPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()

  const canManage = hasPermission(PERMISSIONS.Procurement.ProcurementLibrary.Manage)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingClause, setEditingClause] = useState<ResolutionClause | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clauseToDelete, setClauseToDelete] = useState<ResolutionClause | null>(null)

  // Fetch all clauses from API
  const { data: clausesData, isPending: isLoading } = useResolutionClauses({
    pathParams: {},
    queryParams: { pageSize: 500 },
  })

  const clauses = useMemo<ResolutionClause[]>(() => {
    if (!clausesData) return []
    if (Array.isArray(clausesData.data)) return clausesData.data
    if (Array.isArray(clausesData)) return clausesData
    return []
  }, [clausesData])

  // Mutations
  const createMutation = useCreateResolutionClause()
  const updateMutation = useUpdateResolutionClause()
  const deleteMutation = useDeleteResolutionClause()

  const handleOpenCreate = () => {
    if (!canManage) {
      toast.error('You do not have permission to create resolution clauses.')
      return
    }
    setEditingClause(null)
    setFormDialogOpen(true)
  }

  const handleOpenEdit = (clause: ResolutionClause) => {
    if (!canManage) {
      toast.error('You do not have permission to edit resolution clauses.')
      return
    }
    setEditingClause(clause)
    setFormDialogOpen(true)
  }

  const handleOpenDelete = (clause: ResolutionClause) => {
    if (!canManage) {
      toast.error('You do not have permission to delete resolution clauses.')
      return
    }
    setClauseToDelete(clause)
    setDeleteDialogOpen(true)
  }

  const handleSaveClause = async (
    name: string,
    body: string,
    type: ResolutionClauseType,
  ) => {
    if (!canManage) {
      toast.error('Unauthorized: manage permission required.')
      return
    }

    try {
      if (editingClause) {
        await updateMutation.mutateAsync({
          pathParams: { id: editingClause.id },
          payload: { name, body, clauseType: type },
        })
        toast.success(`Resolution clause "${name}" updated successfully.`)
      } else {
        await createMutation.mutateAsync({
          pathParams: {},
          payload: { name, body, clauseType: type },
        })
        toast.success(`Resolution clause "${name}" created successfully.`)
      }

      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/resolution-clauses'),
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save resolution clause'
      toast.error(msg)
      throw error
    }
  }

  const handleConfirmDelete = async () => {
    if (!clauseToDelete || !canManage) return

    try {
      await deleteMutation.mutateAsync({
        pathParams: { id: clauseToDelete.id },
        payload: undefined,
      })
      toast.success(`Resolution clause "${clauseToDelete.name}" deleted successfully.`)
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/resolution-clauses'),
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete resolution clause'
      toast.error(msg)
    } finally {
      setDeleteDialogOpen(false)
      setClauseToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Resolution Clauses Library
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage reusable standard WHEREAS, NOW THEREFORE, and RESOLVED clause templates for BAC Resolution documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResolutionClausesTable
            clauses={clauses}
            isLoading={isLoading}
            canManage={canManage}
            onCreate={handleOpenCreate}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <ResolutionClauseFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        clause={editingClause}
        onSave={handleSaveClause}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Alert Dialog */}
      <ConfirmAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Resolution Clause Template?"
        description={`Are you sure you want to permanently delete "${clauseToDelete?.name}"? This template will no longer be available when authoring new BAC Resolutions.`}
        confirmLabel="Delete Clause"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setClauseToDelete(null)
        }}
      />
    </div>
  )
}

export default ResolutionClausesPage
