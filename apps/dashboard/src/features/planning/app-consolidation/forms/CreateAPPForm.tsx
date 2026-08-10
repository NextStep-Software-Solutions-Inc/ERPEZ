import { useState } from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { appListAtom, selectPPMPDialogOpenAtom, currentAppAtom } from '../atoms'
import { createAppSchema, type CreateAppFormValues } from './createAppSchema'
import { createAppObject } from '../utils/createAppHelper'

/**
 * APP Initialization Form
 *
 * TanStack Form + Zod validation for creating new APPs
 * Features:
 * - Validated APP Name, Code, Fiscal Year, Type
 * - Real-time error messages
 * - Unsaved changes detection
 * - Auto-transition to PPMP selection after creation
 *
 * Documentation: See documentations/app-initialization-form.md
 */

interface CreateAPPFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CURRENT_FISCAL_YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return year
})

export function CreateAPPForm({ open, onOpenChange }: CreateAPPFormProps) {
  const [, setAppList] = useAtom(appListAtom)
  const [, setCurrentApp] = useAtom(currentAppAtom)
  const [, setSelectPPMPOpen] = useAtom(selectPPMPDialogOpenAtom)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      appName: '',
      appCode: '',
      fiscalYear: new Date().getFullYear(),
      type: 'Indicative' as 'Indicative' | 'Supplemental',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Create new APP object using validated values
        const newApp = createAppObject(value as CreateAppFormValues)

        // Update global state
        setAppList((prevList) => [...prevList, newApp])
        setCurrentApp(newApp)

        toast.success(`APP "${value.appName}" created successfully`)

        // Close form and open PPMP selection
        onOpenChange(false)
        form.reset()

        // Auto-open PPMP selection dialog
        setTimeout(() => {
          setSelectPPMPOpen(true)
        }, 300)
      } catch (error) {
        toast.error('Failed to create APP')
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    validators: {
      onSubmit: createAppSchema,
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.state.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        form.reset()
        onOpenChange(false)
      }
    } else {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Annual Procurement Plan</DialogTitle>
          <DialogDescription>
            Provide basic information for your new APP. You&apos;ll select PPMPs to consolidate next.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* APP Name Field */}
          <form.Field
            name="appName"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="appName">APP Name *</Label>
                <Input
                  id="appName"
                  placeholder="e.g., IT Systems Upgrade"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                  className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {(field.state.meta.errors[0] as any)?.message || String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          />

          {/* APP Code Field */}
          <form.Field
            name="appCode"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="appCode">APP Code * (Format: APP-YYYY-XXX)</Label>
                <Input
                  id="appCode"
                  placeholder="APP-2024-001"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                  className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {(field.state.meta.errors[0] as any)?.message || String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          />

          {/* Fiscal Year Field */}
          <form.Field
            name="fiscalYear"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                <Select value={String(field.state.value)} onValueChange={(val) => field.handleChange(parseInt(val))}>
                  <SelectTrigger disabled={isSubmitting}>
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENT_FISCAL_YEARS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        FY {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {(field.state.meta.errors[0] as any)?.message || String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          />

          {/* APP Type Field */}
          <form.Field
            name="type"
            children={(field) => (
              <div className="space-y-2">
                <Label>APP Type *</Label>
                <RadioGroup
                  value={field.state.value || 'Indicative'}
                  onValueChange={(val) => field.handleChange(val as any)}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Indicative" id="indicative" disabled={isSubmitting} />
                    <Label htmlFor="indicative" className="cursor-pointer font-normal">
                      Indicative (Standard Annual Plan)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Supplemental" id="supplemental" disabled={isSubmitting} />
                    <Label htmlFor="supplemental" className="cursor-pointer font-normal">
                      Supplemental (Additional Items)
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    {(field.state.meta.errors[0] as any)?.message || String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          />

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-900">
              After creating the APP, you&apos;ll be able to select PPMPs to consolidate.
            </AlertDescription>
          </Alert>

          {/* Form Errors */}
          {Object.keys(form.state.fieldMeta).length > 0 &&
            Object.values(form.state.fieldMeta).some((field) => field.errors?.length > 0) && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-sm text-red-900">
                  Please fix the errors above before submitting.
                </AlertDescription>
              </Alert>
            )}
        </form>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => form.handleSubmit()}
            disabled={isSubmitting || form.state.isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create APP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
