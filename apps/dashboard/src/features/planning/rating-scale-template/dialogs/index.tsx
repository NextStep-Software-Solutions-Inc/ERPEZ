/**
 * Rating Scale Template Dialogs
 */

import React, { useState } from 'react'
import { useAtom } from 'jotai'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  createTemplateDialogOpenAtom,
  editTemplateDialogOpenAtom,
  deleteTemplateDialogOpenAtom,
  selectedTemplateForEditAtom,
  selectedTemplateForDeleteAtom,
  selectedTemplateAtom,
} from '../atoms'
import {
  CreateTemplateWizard,
  type CreateTemplateWizardRef,
} from '../components/CreateTemplateWizard'
import { useDeleteRatingScaleTemplate } from '../useRatingScaleTemplates'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'

interface DialogProps {
  onSuccess?: (createdId?: string) => void
}

/**
 * Create Template Dialog (with Wizard)
 */
export function CreateTemplateWizardDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(createTemplateDialogOpenAtom)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wizardRefActual = React.useRef<CreateTemplateWizardRef>(null)

  React.useEffect(() => {
    if (open) {
      setCurrentStep(1)
    }
  }, [open])

  const handleNextStep = async () => {
    if (wizardRefActual.current) {
      await wizardRefActual.current.nextStep()
    }
  }

  const handleBackStep = () => {
    if (wizardRefActual.current) {
      wizardRefActual.current.backStep()
    }
  }

  const handleSubmit = async () => {
    if (wizardRefActual.current) {
      setIsSubmitting(true)
      try {
        const createdId = await wizardRefActual.current.submit()
        setOpen(false)
        setCurrentStep(1)
        setIsSubmitting(false)
        onSuccess?.(createdId)
      } catch (error) {
        setIsSubmitting(false)
      }
    }
  }

  const footer = (
    <div className="flex justify-between gap-2">
      <Button
        variant="outline"
        onClick={handleBackStep}
        disabled={currentStep === 1 || isSubmitting}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {currentStep < 3 ? (
        <Button onClick={handleNextStep} disabled={isSubmitting}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Template'}
        </Button>
      )}
    </div>
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Create New Rating Scale"
      description="Create a reusable rating scale template. This can be applied to multiple success indicators to ensure consistent scoring."
      footer={footer}
      size="4xl"
    >
      <CreateTemplateWizard
        ref={wizardRefActual}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSuccess={() => {}}
      />
    </ResponsiveDialogDashtail>
  )
}

/**
 * Edit Template Dialog
 */
export function EditTemplateDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(editTemplateDialogOpenAtom)
  const [selectedTemplate] = useAtom(selectedTemplateForEditAtom)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wizardRefActual = React.useRef<CreateTemplateWizardRef>(null)

  React.useEffect(() => {
    if (open) {
      setCurrentStep(1)
    }
  }, [open])

  if (!selectedTemplate) return null

  // Prevent editing of default/read-only templates
  if (selectedTemplate.isReadOnly) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Edit Template</DialogTitle>
            <DialogDescription>
              Preset/default templates cannot be edited. You can only edit
              custom templates that you have created.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const handleNextStep = async () => {
    if (wizardRefActual.current) {
      await wizardRefActual.current.nextStep()
    }
  }

  const handleBackStep = () => {
    if (wizardRefActual.current) {
      wizardRefActual.current.backStep()
    }
  }

  const handleSubmit = async () => {
    if (wizardRefActual.current) {
      setIsSubmitting(true)
      try {
        await wizardRefActual.current.submit()
        setOpen(false)
        setCurrentStep(1)
        setIsSubmitting(false)
        onSuccess?.()
      } catch (error) {
        setIsSubmitting(false)
      }
    }
  }

  const footer = (
    <div className="flex justify-between gap-2">
      <Button
        variant="outline"
        onClick={handleBackStep}
        disabled={currentStep === 1 || isSubmitting}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {currentStep < 3 ? (
        <Button onClick={handleNextStep} disabled={isSubmitting}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Template'}
        </Button>
      )}
    </div>
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Edit Rating Scale Template"
      description="Update the template definition."
      footer={footer}
      size="4xl"
    >
      <CreateTemplateWizard
        ref={wizardRefActual}
        editingTemplate={selectedTemplate}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSuccess={() => {}}
      />
    </ResponsiveDialogDashtail>
  )
}

/**
 * Delete Template Dialog (Confirmation)
 */
export function DeleteTemplateDialog({ onSuccess }: DialogProps) {
  const [open, setOpen] = useAtom(deleteTemplateDialogOpenAtom)
  const [selectedTemplate] = useAtom(selectedTemplateForDeleteAtom)
  const [selectedTemplateDetail, setSelectedTemplateDetail] =
    useAtom(selectedTemplateAtom)
  const [isLoading, setIsLoading] = useState(false)
  const deleteMutation = useDeleteRatingScaleTemplate()

  if (!selectedTemplate) return null

  // Prevent deletion of default/read-only templates
  if (selectedTemplate.isReadOnly) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Preset/default templates cannot be deleted. Only custom templates
              can be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Close</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteMutation.mutateAsync({
        pathParams: { id: selectedTemplate.id },
      })
      toast.success('Rating scale template deleted successfully')

      // Clear selected template if it was the one deleted
      if (selectedTemplateDetail?.id === selectedTemplate.id) {
        setSelectedTemplateDetail(null)
      }

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete template',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Rating Scale Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>{selectedTemplate.name}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert variant="outline" color="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Review any success indicators that may still reference this template
            before deleting it.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
