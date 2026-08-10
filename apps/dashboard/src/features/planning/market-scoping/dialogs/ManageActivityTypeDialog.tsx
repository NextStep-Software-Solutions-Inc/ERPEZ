/**
 * Manage Activity Type Dialog
 * Create/Edit dialog for activity type definitions
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState, useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { selectedActivityTypeForEditAtom, activityTypesAtom } from '../atoms/managementStateAtoms'
import {
  createActivityTypeRequest,
  updateActivityTypeRequest,
} from '../handlers/getActivityTypesRequest'

interface ManageActivityTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const useCreateActivityType = createMutationHookFromTemplate(createActivityTypeRequest)

export function ManageActivityTypeDialog({
  open,
  onOpenChange,
}: ManageActivityTypeDialogProps) {
  const activity = useAtomValue(selectedActivityTypeForEditAtom)
  const clearSelected = useSetAtom(selectedActivityTypeForEditAtom)
  const setActivityTypes = useSetAtom(activityTypesAtom)
  const queryClient = useQueryClient()
  const createActivityType = useCreateActivityType()
  const updateActivityType = createMutationHookFromTemplate(
    activity ? updateActivityTypeRequest(activity.id) : updateActivityTypeRequest('')
  )()

  const [formData, setFormData] = useState({
    activityType: '',
    label: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (activity) {
      setFormData({
        activityType: activity.activityType ?? activity.type,
        label: activity.label,
        description: activity.description,
        sortOrder: activity.sortOrder,
        isActive: activity.isActive,
      })
    } else {
      setFormData({
        activityType: '',
        label: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      })
    }
    setErrors({})
  }, [activity, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.activityType.trim()) newErrors.activityType = 'Activity type is required'
    if (!formData.label.trim()) newErrors.label = 'Label is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.sortOrder < 0) newErrors.sortOrder = 'Sort order must be non-negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (activity) {
        const response = await updateActivityType.mutateAsync(
          {
            pathParams: { id: activity.id },
            payload: {
              activityType: formData.activityType,
              label: formData.label,
              description: formData.description,
              sortOrder: formData.sortOrder,
              isActive: formData.isActive,
            },
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/market-scoping-activity-settings'),
              })
            },
          },
        )

        const updatedActivity = response.data?.data
        if (updatedActivity) {
          setActivityTypes((prev) =>
            prev.map((item) =>
              item.id === activity.id
                ? {
                    ...item,
                    ...updatedActivity,
                    type: ((updatedActivity as unknown) as Record<string, unknown>).activityType as string ?? updatedActivity.type,
                  }
                : item
            )
          )
        }
      } else {
        const response = await createActivityType.mutateAsync(
          {
            pathParams: {},
            payload: {
              activityType: formData.activityType,
              label: formData.label,
              description: formData.description,
              sortOrder: formData.sortOrder,
              isActive: formData.isActive,
            },
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/market-scoping-activity-settings'),
              })
            },
          },
        )

        const createdActivity = response.data?.data
        if (createdActivity) {
          setActivityTypes((prev) => [
            ...prev,
            {
              ...createdActivity,
              type: ((createdActivity as unknown) as Record<string, unknown>).activityType as string ?? createdActivity.type,
            },
          ])
        }
      }

      const action = activity ? 'updated' : 'created'
      toast.success(`Activity type "${formData.label}" ${action} successfully.`)
      onOpenChange(false)
      clearSelected(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit Activity Type' : 'Create Activity Type'}
          </DialogTitle>
          <DialogDescription>
            {activity
              ? `Editing: ${activity.label}`
              : 'Add a new market research activity type'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type *</Label>
            <Input
              id="activityType"
              value={formData.activityType}
              onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
              placeholder="e.g., sa"
              className={errors.activityType ? 'border-red-500' : ''}
            />
            {errors.activityType && (
              <p className="text-sm text-red-600">{errors.activityType}</p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Supplier Visits"
              className={errors.label ? 'border-red-500' : ''}
            />
            {errors.label && <p className="text-sm text-red-600">{errors.label}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this activity type..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order *</Label>
            <Input
              id="sortOrder"
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
              }
              className={errors.sortOrder ? 'border-red-500' : ''}
            />
            {errors.sortOrder && (
              <p className="text-sm text-red-600">{errors.sortOrder}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive" className="cursor-pointer m-0">
              Active
            </Label>
          </div>

          {/* Info Box */}
          <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Deactivated activity types will not appear in new market scoping forms
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : activity ? 'Update' : 'Create'} Activity Type
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
