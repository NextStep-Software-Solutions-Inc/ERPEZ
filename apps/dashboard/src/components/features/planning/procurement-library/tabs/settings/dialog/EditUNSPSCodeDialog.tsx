import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { UNSPSCodeForm } from './UNSPSCodeForm'
import { useToast } from '@/components/ui/use-toast'
import { UNSPSCode, UNSPSCodeFormData } from '../../../types'

type MetaActions = ("write" | "delete" | "read" | "approve" | "reject" | "suspend" | "submit" | "lock")[];

interface EditUNSPSCodeDialogProps {
  unspscCode: UNSPSCode
  actions: MetaActions
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditSuccess?: (data: UNSPSCodeFormData, unspscCodeId: string) => void
  onRefresh?: () => void
  availableParents?: UNSPSCode[]
}

export function EditUNSPSCodeDialog({
  unspscCode,
  actions,
  open,
  onOpenChange,
  onEditSuccess,
  onRefresh,
  availableParents = [],
}: EditUNSPSCodeDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: UNSPSCodeFormData) => {
    try {
      setIsLoading(true)
      console.log('Updating UNSPSC Code:', unspscCode.id, data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('UNSPSC Code updated successfully, calling onEditSuccess callback')
      onEditSuccess?.(data, unspscCode.id)
      onRefresh?.()
      onOpenChange(false)
      console.log('Dialog closed')
    } catch (error) {
      console.error('Error updating UNSPSC code:', error)
      toast({
        title: 'Error',
        description: 'Error updating UNSPSC code. Please try again.',
        color: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initialData: UNSPSCodeFormData = {
    ParentId: unspscCode.ParentId,
    Name: unspscCode.Name,
    Code: unspscCode.Code,
    Level: unspscCode.Level,
    IsActive: unspscCode.IsActive,
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Edit UNSPSC Code"
        description="Update UNSPSC code information"
        footer={null}
        showCloseButton
      >
        <UNSPSCodeForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={initialData}
          isLoading={isLoading}
          availableParents={availableParents}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}