/**
 * Manage Parameter Dialog
 * Create/Edit dialog for parameter definitions
 * Location: src/features/planning/market-scoping/dialogs/
 */

import { useState, useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import {
  selectedParameterForEditAtom,
  parametersAtom,
} from '../atoms/managementStateAtoms'
import {
  createParameterRequest,
  updateParameterRequest,
} from '../handlers/getParametersRequest'

interface ManageParameterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const useCreateParameter = createMutationHookFromTemplate(
  createParameterRequest,
)

export function ManageParameterDialog({
  open,
  onOpenChange,
}: ManageParameterDialogProps) {
  const parameter = useAtomValue(selectedParameterForEditAtom)
  const clearSelected = useSetAtom(selectedParameterForEditAtom)
  const setParameters = useSetAtom(parametersAtom)
  const queryClient = useQueryClient()
  const createParameter = useCreateParameter()
  const updateParameter = createMutationHookFromTemplate(
    parameter
      ? updateParameterRequest(parameter.id)
      : updateParameterRequest(''),
  )()

  const [formData, setFormData] = useState({
    name: '',
    guidedQuestion: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (parameter) {
      setFormData({
        name: parameter.displayName,
        guidedQuestion: parameter.guidedQuestion,
        description: parameter.description || '',
        sortOrder: parameter.sortOrder,
        isActive: parameter.isActive,
      })
    } else {
      setFormData({
        name: '',
        guidedQuestion: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      })
    }
    setErrors({})
  }, [parameter, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Parameter name is required'
    if (!formData.guidedQuestion.trim())
      newErrors.guidedQuestion = 'Guided question is required'
    if (formData.sortOrder < 0)
      newErrors.sortOrder = 'Sort order must be non-negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (parameter) {
        const response = await updateParameter.mutateAsync(
          {
            pathParams: { id: parameter.id },
            payload: {
              name: formData.name,
              guidedQuestion: formData.guidedQuestion,
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
                  query.queryKey[0].startsWith(
                    '/market-scoping-parameter-settings',
                  ),
              })
            },
          },
        )

        const updatedParameter = response.data?.data
        if (updatedParameter) {
          setParameters((prev) =>
            prev.map((item) =>
              item.id === parameter.id
                ? {
                    ...item,
                    ...updatedParameter,
                    displayName:
                      updatedParameter.name || updatedParameter.displayName,
                    type: updatedParameter.name || updatedParameter.type,
                  }
                : item,
            ),
          )
        }
      } else {
        const response = await createParameter.mutateAsync(
          {
            pathParams: {},
            payload: {
              name: formData.name,
              guidedQuestion: formData.guidedQuestion,
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
                  query.queryKey[0].startsWith(
                    '/market-scoping-parameter-settings',
                  ),
              })
            },
          },
        )

        const createdParameter = response.data?.data
        if (createdParameter) {
          setParameters((prev) => [
            ...prev,
            {
              ...createdParameter,
              displayName:
                createdParameter.name || createdParameter.displayName,
              type: createdParameter.name || createdParameter.type,
            },
          ])
        }
      }

      const action = parameter ? 'updated' : 'created'
      toast.success(`Parameter "${formData.name}" ${action} successfully.`)
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
            {parameter ? 'Edit Parameter' : 'Create Parameter'}
          </DialogTitle>
          <DialogDescription>
            {parameter
              ? `Editing: ${parameter.displayName}`
              : 'Add a new NGPA evaluation parameter'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Parameter Type Display (Read-only for edits) */}
          {parameter && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Label className="text-sm text-gray-600">Parameter Type</Label>
              <p className="font-mono text-sm font-medium mt-1">
                {parameter.type}
              </p>
            </div>
          )}

          {/* Parameter Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Parameter Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Delivery Lead Time"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Guided Question */}
          <div className="space-y-2">
            <Label htmlFor="guidedQuestion">Guided Question *</Label>
            <Textarea
              id="guidedQuestion"
              value={formData.guidedQuestion}
              onChange={(e) =>
                setFormData({ ...formData, guidedQuestion: e.target.value })
              }
              placeholder="e.g., Was delivery lead time considered in planning?"
              rows={2}
              className={errors.guidedQuestion ? 'border-red-500' : ''}
            />
            {errors.guidedQuestion && (
              <p className="text-sm text-red-600">{errors.guidedQuestion}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional additional details about this parameter..."
              rows={3}
            />
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
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
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
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
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
              Deactivated parameters will not appear in new market scoping
              evaluation forms
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
            {isSubmitting ? 'Saving...' : parameter ? 'Update' : 'Create'}{' '}
            Parameter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
