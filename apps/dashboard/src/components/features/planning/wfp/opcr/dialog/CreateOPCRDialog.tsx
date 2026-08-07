import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { createOPCRRequest } from '../handlers/createOPCRRequest'
import { createOPCRDialogAtom } from '../atoms'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'

interface CreateOPCRDialogProps {
  wfpId: string
  deliveryUnitId?: string
  fiscalYearId?: string
  onSuccess?: () => void
}

const useCreateOPCR = createMutationHookFromTemplate(createOPCRRequest)

export default function CreateOPCRDialog({
  wfpId,
  deliveryUnitId,
  fiscalYearId,
  onSuccess,
}: CreateOPCRDialogProps) {
  const [dialogState, setDialogState] = useAtom(createOPCRDialogAtom)
  const { mutateAsync, isPending } = useCreateOPCR()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter an OPCR name')
      return
    }

    if (!deliveryUnitId || !fiscalYearId) {
      toast.error('Missing required delivery unit or fiscal year')
      return
    }

    try {
      await mutateAsync({
        pathParams: {},
        payload: {
          name: formData.name,
          deliveryUnitId,
          fiscalYearId,
        },
      })

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some((key) => typeof key === 'string' && key.includes('/opcrs')),
      })

      toast.success('OPCR created successfully!')
      setFormData({ name: '' })
      setDialogState({ isOpen: false, selectedId: null })
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to create OPCR')
    }
  }

  const handleCancel = () => {
    setDialogState({ isOpen: false, selectedId: null })
    setFormData({ name: '' })
  }

  return (
    <ResponsiveDialog
      open={dialogState.isOpen}
      onOpenChange={(open) => setDialogState({ ...dialogState, isOpen: open })}
      title="Add OPCR"
      description="Create a new Office Performance Commitment and Review entry"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="opcr-name">OPCR Name</Label>
            <Input
              id="opcr-name"
              placeholder="Enter OPCR name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {isPending ? 'Creating...' : 'Create OPCR'}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveDialog>
  )
}
