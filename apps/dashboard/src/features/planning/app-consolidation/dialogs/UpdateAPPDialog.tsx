import { useState, useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { AppMaster } from '../types'
import { SignatoryForm } from '../forms/SignatoryForm'
import { BACWorkspace } from '../components/BACWorkspace'
import { appDetailsDialogOpenAtom, currentAppAtom } from '../atoms'

interface UpdateAPPDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpdateAPPDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UpdateAPPDialogProps) {
  const [dialogOpen, setDialogOpen] = useAtom(appDetailsDialogOpenAtom)
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState<AppMaster | null>(currentApp)

  const isOpen = controlledOpen !== undefined ? controlledOpen : dialogOpen
  const handleOpenChange = controlledOnOpenChange || setDialogOpen

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(currentApp),
    [formData, currentApp],
  )

  const handleSave = useCallback(async () => {
    if (!formData || isUpdating) return

    setIsUpdating(true)
    try {
      // TODO: Call API to update APP
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('APP updated successfully!')
      setCurrentApp(formData)
      handleOpenChange(false)
    } catch (error) {
      toast.error('Failed to update APP')
    } finally {
      setIsUpdating(false)
    }
  }, [formData, isUpdating, setCurrentApp, handleOpenChange])

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true)
    } else {
      handleOpenChange(false)
    }
  }, [isDirty, handleOpenChange])

  if (!formData) return null

  return (
    <>
      <ResponsiveDialog
        open={isOpen && !showUnsavedWarning}
        onOpenChange={handleOpenChange}
        title="Edit Annual Procurement Plan"
        description="Update the APP details and configuration."
        className="z-[999] pointer-events-auto sm:max-w-[800px]"
        onPointerDownOutside={(e) => {
          if (isUpdating) e.preventDefault()
        }}
      >
        <div className="space-y-6">
          {/* Signatories Section */}
          <div>
            <h3 className="font-semibold mb-4">Update Signatories</h3>
            <SignatoryForm
              initialData={formData.signatories}
              onSave={(signatories) =>
                setFormData({ ...formData, signatories })
              }
            />
          </div>

          {/* BAC Workspace Section */}
          <div>
            <h3 className="font-semibold mb-4">Update BAC Configuration</h3>
            <Card className="pt-6">
              <BACWorkspace
                workspace={formData.bac}
                onUpdate={(bac) => setFormData({ ...formData, bac })}
              />
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="pointer-events-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || !isDirty} className="pointer-events-auto cursor-pointer">
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Warning */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
          <Card className="w-96 p-6 space-y-4">
            <div>
              <h3 className="font-semibold">Unsaved Changes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You have unsaved changes. Are you sure you want to discard
                them?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedWarning(false)}
                className="pointer-events-auto cursor-pointer"
              >
                Keep Editing
              </Button>
              <Button
                onClick={() => {
                  setShowUnsavedWarning(false)
                  handleOpenChange(false)
                }}
                className="pointer-events-auto cursor-pointer bg-red-600 hover:bg-red-700 text-white"
              >
                Discard Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
