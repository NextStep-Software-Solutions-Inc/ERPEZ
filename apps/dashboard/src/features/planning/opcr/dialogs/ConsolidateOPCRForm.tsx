import { useState, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import FieldInfo from '@/components/FieldInfo'
import {
  consolidateOPCRRequest,
  type ConsolidateOPCRPayload,
} from '@/features/planning/opcr/handlers/consolidateOPCRRequest'
import type { OPCR } from '@/features/planning/opcr/types'

// Create mutation hook from template
const useConsolidateOPCR = createMutationHookFromTemplate(
  consolidateOPCRRequest,
)

const consolidateFormSchema = z.object({
  name: z.string().min(1, 'Consolidation name is required'),
})

export type ConsolidateOPCRFormValues = z.infer<typeof consolidateFormSchema>

// Helper to extract the form type
const useConsolidateOPCRFormInstance = (
  defaultValues: { name: string },
  onSubmit: (value: ConsolidateOPCRFormValues) => Promise<void>,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: consolidateFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

export type ConsolidateOPCRFormApi = ReturnType<
  typeof useConsolidateOPCRFormInstance
>

interface ConsolidateOPCRFormProps {
  selectedOpcrs: OPCR[]
  onConsolidationComplete: () => void
  setForm?: (form: ConsolidateOPCRFormApi) => void
}

// Generate auto-generated name
const generateConsolidationName = (): string => {
  const today = new Date()
  const date = today.toISOString().split('T')[0]
  return `OPCR-Consolidation-${date}`
}

export default function ConsolidateOPCRForm({
  selectedOpcrs,
  onConsolidationComplete,
  setForm,
}: ConsolidateOPCRFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate: consolidate } = useConsolidateOPCR()

  const defaultName = useMemo(() => generateConsolidationName(), [])

  const handleConsolidate = async (
    values: ConsolidateOPCRFormValues,
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    return new Promise((resolve) => {
      consolidate(
        {
          pathParams: {},
          payload: {
            opcrIds: selectedOpcrs.map((opcr) => opcr.id),
            name: values.name,
          } as ConsolidateOPCRPayload,
        },
        {
          onSuccess: () => {
            setIsLoading(false)
            setTimeout(() => {
              onConsolidationComplete()
              resolve()
            }, 1500)
          },
          onError: (error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : 'Consolidation failed'
            setError(errorMessage)
            setIsLoading(false)
            resolve()
          },
        },
      )
    })
  }

  const formDefaults = {
    name: defaultName,
  }

  const form = useConsolidateOPCRFormInstance(formDefaults, handleConsolidate)

  // Expose form to parent on creation
  setForm?.(form)

  return (
    <form
      id="consolidate-opcr-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Consolidation Name Field */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Consolidation Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="Enter consolidation name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
            />
            <FieldInfo field={field} />
            <span className="text-xs text-muted-foreground">
              Auto-generated but can be customized
            </span>
          </div>
        )}
      />

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-sm text-red-700 font-medium">{error}</div>
        </Card>
      )}

      {/* Selected OPCRs */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          OPCRs for Consolidation
        </Label>
        <div className="space-y-2">
          {selectedOpcrs.map((opcr) => (
            <Card
              key={opcr.id}
              className="p-3 bg-blue-50 border-blue-200 flex items-center gap-3"
            >
              <Icon icon="mdi:check-circle" className="text-blue-600 text-lg" />
              <span className="text-sm font-medium text-slate-900">
                {opcr.name}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 border-dashed border-2 text-center">
          <Icon
            icon="mdi:loading"
            className="mx-auto text-2xl mb-4 animate-spin"
          />
          <p className="text-sm text-muted-foreground">
            Processing consolidation...
          </p>
        </Card>
      )}
    </form>
  )
}
