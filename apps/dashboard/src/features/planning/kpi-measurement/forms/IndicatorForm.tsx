import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import {
  indicatorBaseSchema,
  type IndicatorFormValues,
} from './indicator-form.schema'

interface IndicatorFormProps {
  formId: string
  onSubmit: (values: IndicatorFormValues) => void
  isLoading?: boolean
  initialValues?: Partial<IndicatorFormValues>
  ratingScaleTemplates?: Array<{ id: string; name: string }>
}

export default function IndicatorForm({
  formId,
  onSubmit,
  isLoading = false,
  initialValues,
  ratingScaleTemplates = [],
}: IndicatorFormProps) {
  const form = useForm({
    defaultValues: initialValues || {
      code: '',
      name: '',
      description: '',
      dimensions: [],
      mov: [],
      ratingScaleTemplateIds: [],
    },
    validators: { onChange: indicatorBaseSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value as IndicatorFormValues)
    },
  })

  const addDimension = (field: any) => {
    const newDimension =
      (document.getElementById('dimension-input') as HTMLInputElement)?.value ||
      ''
    if (newDimension.trim()) {
      const current = field.state.value || []
      field.handleChange([...current, newDimension])
      ;(document.getElementById('dimension-input') as HTMLInputElement).value =
        ''
    }
  }

  const removeDimension = (field: any, index: number) => {
    const current = field.state.value || []
    field.handleChange(current.filter((_: string, i: number) => i !== index))
  }

  const addMov = (field: any) => {
    const newMov =
      (document.getElementById('mov-input') as HTMLInputElement)?.value || ''
    if (newMov.trim()) {
      const current = field.state.value || []
      field.handleChange([...current, newMov])
      ;(document.getElementById('mov-input') as HTMLInputElement).value = ''
    }
  }

  const removeMov = (field: any, index: number) => {
    const current = field.state.value || []
    field.handleChange(current.filter((_: string, i: number) => i !== index))
  }

  const addTemplate = (field: any, templateId: string) => {
    const current = field.state.value || []
    if (!current.includes(templateId)) {
      field.handleChange([...current, templateId])
    }
  }

  const removeTemplate = (field: any, templateId: string) => {
    const current = field.state.value || []
    field.handleChange(current.filter((id: string) => id !== templateId))
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5 py-4"
    >
      {/* Code Field */}
      <form.Field name="code">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
              placeholder="e.g., SI-001"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Name Field */}
      <form.Field name="name">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
              placeholder="e.g., Customer Satisfaction Rate"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Description Field */}
      <form.Field name="description">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
              placeholder="Provide a detailed description of this success indicator"
              rows={3}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Dimensions Array Field */}
      <form.Field name="dimensions">
        {(field) => (
          <div className="space-y-2">
            <Label>Dimensions *</Label>
            <div className="flex gap-2">
              <Input
                id="dimension-input"
                placeholder="Enter a dimension"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addDimension(field)
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={() => addDimension(field)}
                disabled={isLoading}
                variant="outline"
              >
                Add
              </Button>
            </div>
            {field.state.value && field.state.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.state.value.map((dimension: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {dimension}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => removeDimension(field, index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Means of Verification (MOV) Array Field */}
      <form.Field name="mov">
        {(field) => (
          <div className="space-y-2">
            <Label>Means of Verification (MOV) *</Label>
            <div className="flex gap-2">
              <Input
                id="mov-input"
                placeholder="Enter a means of verification"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMov(field)
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={() => addMov(field)}
                disabled={isLoading}
                variant="outline"
              >
                Add
              </Button>
            </div>
            {field.state.value && field.state.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.state.value.map((mov: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {mov}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => removeMov(field, index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Rating Scale Templates Field */}
      <form.Field name="ratingScaleTemplateIds">
        {(field) => (
          <div className="space-y-2">
            <Label>Rating Scale Templates *</Label>
            <div className="space-y-2">
              {ratingScaleTemplates.map((template) => (
                <div key={template.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`template-${template.id}`}
                    checked={(field.state.value || []).includes(template.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addTemplate(field, template.id)
                      } else {
                        removeTemplate(field, template.id)
                      }
                    }}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor={`template-${template.id}`}
                    className="cursor-pointer font-normal flex-1"
                  >
                    {template.name}
                  </Label>
                </div>
              ))}
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </form>
  )
}
