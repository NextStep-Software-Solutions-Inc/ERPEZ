import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { UNSPSCodeForm } from './UNSPSCodeForm'
import { useToast } from '@/components/ui/use-toast'
import type { UNSPSCodeFormData, UNSPSCode } from '../../../types'
import type { MetaActions } from '@/types/global'

interface CreateUNSPSCodeDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: UNSPSCodeFormData) => void
  onRefresh?: () => void
  availableParents?: UNSPSCode[]
}

export function CreateUNSPSCodeDialog({
  actions,
  onCreateSuccess,
  onRefresh,
  availableParents = [],
}: CreateUNSPSCodeDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: UNSPSCodeFormData) => {
    try {
      setIsLoading(true)
      console.log('Creating UNSPSC Code:', data)

      console.log('UNSPSC Code created successfully, calling onCreateSuccess callback')
      onCreateSuccess?.(data)
      onRefresh?.()
      setOpen(false)
      console.log('Dialog closed')
    } catch (error) {
      console.error('Error creating UNSPSC code:', error)
      toast({
        title: 'Error',
        description: 'Error creating UNSPSC code. Please try again.',
        color: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add UNSPSC Code"
        description="Create a new UNSPSC code"
        trigger={
          <Button size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Add UNSPSC Code
          </Button>
        }
        footer={null}
        showCloseButton
      >
        <UNSPSCodeForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
          availableParents={availableParents}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}