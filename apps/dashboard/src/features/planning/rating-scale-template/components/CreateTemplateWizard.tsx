import { useState, useImperativeHandle, forwardRef, useRef } from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  RatingScaleTemplate,
  RatingScaleTemplateFormValues,
  ScaleType,
} from '../types'
import { TemplatePreview } from './TemplatePreview'
import {
  createTemplateDialogOpenAtom,
  createTemplateFormDataAtom,
} from '../atoms'
import {
  useCreateRatingScaleTemplate,
  useRatingScaleTemplates,
  useUpdateRatingScaleTemplate,
} from '../useRatingScaleTemplates'
import {
  createTemplateWizardBaseSchema,
  type CreateTemplateWizardFormValues,
  defaultCreateTemplateWizardValues,
} from '../forms/CreateTemplateWizard.schema'
import FieldInfo from '@/components/FieldInfo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'

interface CreateTemplateWizardProps {
  currentStep: 1 | 2 | 3
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>
  /**
   * Form ID for linking with dialog footer buttons
   */
  formId?: string
  /**
   * Template being edited (if any)
   */
  editingTemplate?: RatingScaleTemplate | null
  /**
   * Success callback
   */
  onSuccess?: () => void
}

export interface CreateTemplateWizardRef {
  /**
   * Get current form values
   */
  getFormValues: () => CreateTemplateWizardFormValues | null
  /**
   * Get current step
   */
  getCurrentStep: () => 1 | 2 | 3
  /**
   * Check if currently submitting
   */
  isSubmitting: () => boolean
  /**
   * Advance to next step
   */
  nextStep: () => Promise<void>
  /**
   * Go back to previous step
   */
  backStep: () => void
  /**
   * Submit the wizard form; resolves with the new template's ID on create
   */
  submit: () => Promise<string | undefined>
}

export const CreateTemplateWizard = forwardRef<
  CreateTemplateWizardRef,
  CreateTemplateWizardProps
>(
  (
    {
      currentStep,
      setCurrentStep,
      editingTemplate,
      onSuccess,
    }: CreateTemplateWizardProps,
    ref,
  ) => {
    const [, setCreateDialogOpen] = useAtom(createTemplateDialogOpenAtom)
    const [, setFormData] = useAtom(createTemplateFormDataAtom)
    const [isSubmitting, setIsSubmitting] = useState(false)
  const [presetTemplates, setPresetTemplates] = useState<RatingScaleTemplate[]>(
    [],
  )
  const [showStarterLibrary, setShowStarterLibrary] = useState(false)
  const { refetch: refetchTemplates } = useRatingScaleTemplates({
    pathParams: {},
    queryParams: {},
    enabled: false,
  })
  const createMutation = useCreateRatingScaleTemplate()
  const updateMutation = useUpdateRatingScaleTemplate()
  const createdIdRef = useRef<string | undefined>(undefined)

  // Initialize TanStack Form with Zod schema
  const initialValues: CreateTemplateWizardFormValues = editingTemplate
    ? {
        name: editingTemplate.name,
        description: editingTemplate.description || '',
        scaleType: editingTemplate.scaleType,
        rating5: { ...editingTemplate.rating5 },
        rating4: { ...editingTemplate.rating4 },
        rating3: { ...editingTemplate.rating3 },
        rating2: { ...editingTemplate.rating2 },
        rating1: { ...editingTemplate.rating1 },
      }
    : defaultCreateTemplateWizardValues

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: createTemplateWizardBaseSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const submitData: RatingScaleTemplateFormValues = {
          name: value.name,
          description: value.description || undefined,
          scaleType: value.scaleType,
          rating5: { ...value.rating5, rating: 5 as const },
          rating4: { ...value.rating4, rating: 4 as const },
          rating3: { ...value.rating3, rating: 3 as const },
          rating2: { ...value.rating2, rating: 2 as const },
          rating1: { ...value.rating1, rating: 1 as const },
        }

        if (editingTemplate) {
          await updateMutation.mutateAsync({
            pathParams: { id: editingTemplate.id },
            payload: {
              ...submitData,
              isDefault: editingTemplate.isDefault ?? false,
            },
          })
          toast.success('Template updated successfully')
        } else {
          const result = await createMutation.mutateAsync({
            pathParams: {},
            payload: submitData,
          })
          createdIdRef.current = result?.data?.id
          toast.success('Template created successfully')
        }

        setFormData({})
        setCurrentStep(1)
        setCreateDialogOpen(false)
        onSuccess?.()
      } catch (error) {
        toast.error(
          `Failed to ${editingTemplate ? 'update' : 'create'} template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const loadPresetTemplates = async () => {
    try {
      const result = await refetchTemplates()
      const templates = result.data?.data ?? []
      setPresetTemplates(templates.filter((template) => template.isDefault))
    } catch (error) {
      console.error('Failed to load preset templates:', error)
    }
  }

  const handleSelectStarterTemplate = (template: RatingScaleTemplate) => {
    form.setFieldValue('scaleType', template.scaleType)
    form.setFieldValue('rating5' as const, { ...template.rating5 })
    form.setFieldValue('rating4' as const, { ...template.rating4 })
    form.setFieldValue('rating3' as const, { ...template.rating3 })
    form.setFieldValue('rating2' as const, { ...template.rating2 })
    form.setFieldValue('rating1' as const, { ...template.rating1 })
    setShowStarterLibrary(false)
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const name = form.getFieldValue('name')
      if (!name || !name.toString().trim()) {
        toast.error('Please enter a template name')
        return
      }
      await loadPresetTemplates()
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev === 1 ? 1 : prev - 1) as 1 | 2 | 3)
    }
  }

  const handleSubmit = async (): Promise<string | undefined> => {
    const name = form.getFieldValue('name')
    if (!name || !name.toString().trim()) {
      toast.error('Please enter a template name')
      return undefined
    }

    createdIdRef.current = undefined
    setIsSubmitting(true)
    try {
      await form.handleSubmit()
    } finally {
      setIsSubmitting(false)
    }
    return createdIdRef.current
  }

  // Expose methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      getFormValues: () => {
        const values = form.state.values
        return values as CreateTemplateWizardFormValues
      },
      getCurrentStep: () => currentStep,
      isSubmitting: () => isSubmitting,
      nextStep: handleNextStep,
      backStep: handleBackStep,
      submit: handleSubmit,
    }),
    [currentStep, isSubmitting, form.state.values],
  )

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep === step
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </div>
            {step < 3 && (
              <div
                className={`w-8 h-1 transition-colors ${
                  currentStep > step ? 'bg-success' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-350px)]">
        {/* Left: Form */}
        <div className="col-span-1 overflow-y-auto pr-2">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form.Field
                  name="name"
                  children={(field) => (
                    <div>
                      <label className="text-sm font-medium">
                        Template Name *
                      </label>
                      <Input
                        placeholder="e.g., Performance Scale, Quality Assessment"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="mt-1"
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />

                <form.Field
                  name="description"
                  children={(field) => (
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Describe what this template is used for..."
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="scaleType"
                  children={(field) => (
                    <div>
                      <label className="text-sm font-medium">
                        Scale Type *
                      </label>
                      <div className="flex gap-4 mt-2">
                        {([ScaleType.FIXED, ScaleType.NON_FIXED] as const).map(
                          (type) => (
                            <label
                              key={type}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                checked={field.state.value === type}
                                onChange={() => field.handleChange(type)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">
                                {type}
                                {type === ScaleType.FIXED ? (
                                  <span className="text-xs text-muted-foreground block">
                                    Text-based descriptions
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground block">
                                    Numeric ranges
                                  </span>
                                )}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Choose Template or Start Blank */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Template Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Would you like to start from a preset template or start with a
                  blank template?
                </p>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowStarterLibrary(true)
                      loadPresetTemplates()
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">
                        Start from Preset Template
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Choose from existing system templates
                      </div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentStep(3)}
                  >
                    <div className="text-left">
                      <div className="font-medium">Start Blank</div>
                      <div className="text-xs text-muted-foreground">
                        Create from scratch with custom ratings
                      </div>
                    </div>
                  </Button>
                </div>

                {showStarterLibrary && (
                  <TemplateStarterLibraryInline
                    templates={presetTemplates}
                    onSelect={handleSelectStarterTemplate}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Configure Ratings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Configure Rating Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([5, 4, 3, 2, 1] as const).map((level) => (
                  <form.Field
                    key={level}
                    name={`rating${level}`}
                    children={() => (
                      <div className="pb-4 border-b last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="info" variant="soft">
                            Level {level}
                          </Badge>
                        </div>

                        <div className="space-y-3 ml-2">
                          <form.Field
                            name={`rating${level}.description`}
                            children={(descField) => (
                              <div>
                                <label className="text-sm font-medium">
                                  Description *
                                </label>
                                <Input
                                  placeholder={`e.g., ${level === 5 ? 'Excellent' : level === 1 ? 'Poor' : 'Acceptable'}`}
                                  value={descField.state.value || ''}
                                  onChange={(e) =>
                                    descField.handleChange(e.target.value)
                                  }
                                  onBlur={descField.handleBlur}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          />

                          <form.Subscribe
                            selector={(state) => state.values.scaleType}
                            children={(scaleType) => {
                              if (scaleType !== ScaleType.NON_FIXED) return null
                              return (
                                <div className="grid grid-cols-2 gap-2">
                                  <form.Field
                                    name={`rating${level}.minRange`}
                                    children={(minField) => (
                                      <div>
                                        <label className="text-sm font-medium">
                                          Min Range
                                        </label>
                                        <Input
                                          type="number"
                                          placeholder="Min"
                                          value={minField.state.value ?? ''}
                                          onChange={(e) =>
                                            minField.handleChange(
                                              e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                            )
                                          }
                                          onBlur={minField.handleBlur}
                                          className="mt-1"
                                        />
                                      </div>
                                    )}
                                  />
                                  <form.Field
                                    name={`rating${level}.maxRange`}
                                    children={(maxField) => (
                                      <div>
                                        <label className="text-sm font-medium">
                                          Max Range
                                        </label>
                                        <Input
                                          type="number"
                                          placeholder="Max"
                                          value={maxField.state.value ?? ''}
                                          onChange={(e) =>
                                            maxField.handleChange(
                                              e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                            )
                                          }
                                          onBlur={maxField.handleBlur}
                                          className="mt-1"
                                        />
                                      </div>
                                    )}
                                  />
                                </div>
                              )
                            }}
                          />
                        </div>
                      </div>
                    )}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Preview */}
        <div className="col-span-1 overflow-y-auto pl-2">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <form.Subscribe
                selector={(state) => state.values}
                children={(values) => {
                  const previewTemplate: RatingScaleTemplate = {
                    id: editingTemplate?.id || 'preview',
                    name: values.name || 'New Template',
                    description: values.description,
                    scaleType: values.scaleType,
                    rating5: {
                      rating: 5,
                      description: values.rating5?.description || '',
                      minRange: values.rating5?.minRange,
                      maxRange: values.rating5?.maxRange,
                    },
                    rating4: {
                      rating: 4,
                      description: values.rating4?.description || '',
                      minRange: values.rating4?.minRange,
                      maxRange: values.rating4?.maxRange,
                    },
                    rating3: {
                      rating: 3,
                      description: values.rating3?.description || '',
                      minRange: values.rating3?.minRange,
                      maxRange: values.rating3?.maxRange,
                    },
                    rating2: {
                      rating: 2,
                      description: values.rating2?.description || '',
                      minRange: values.rating2?.minRange,
                      maxRange: values.rating2?.maxRange,
                    },
                    rating1: {
                      rating: 1,
                      description: values.rating1?.description || '',
                      minRange: values.rating1?.minRange,
                      maxRange: values.rating1?.maxRange,
                    },
                    isDefault: false,
                    isReadOnly: false,
                    author: 'Current User',
                    usageCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                  return (
                    <TemplatePreview
                      template={previewTemplate}
                      compact={false}
                    />
                  )
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
})

// Inline template starter display
function TemplateStarterLibraryInline({
  templates,
  onSelect,
}: {
  templates: RatingScaleTemplate[]
  onSelect: (template: RatingScaleTemplate) => void
}) {
  return (
    <Card className="mt-4 border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm">Available Preset Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelect(template)}
          >
            <div className="text-left flex-1">
              <div className="font-medium text-sm items-center">
                {template.name}{' '}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-full',
                        )}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className="whitespace-normal wrap-break-word text-xs max-w-xs"
                    >
                      {template.description || 'No description available'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Badge
              color={template.scaleType === 'Fixed' ? 'info' : 'warning'}
              variant="soft"
              className="text-xs shrink-0"
            >
              {template.scaleType}
            </Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
