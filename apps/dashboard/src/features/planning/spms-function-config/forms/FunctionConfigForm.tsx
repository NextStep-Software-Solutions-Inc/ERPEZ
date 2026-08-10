import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, BookOpen, HeartPulse } from 'lucide-react'
import {
  functionConfigBaseSchema,
  functionConfigFormSchema,
  type FunctionConfigFormValues,
} from './functionConfigForm.schema'
import { ReusableFiscalYearSelector } from '../../fiscal-year-and-policies/fiscal-year-management/components/ReusableFiscalYearSelector'
import FieldInfo from '@/components/FieldInfo'

interface FunctionConfigFormProps {
  formId: string
  onSubmit: (values: FunctionConfigFormValues) => void
  isLoading?: boolean
  initialValues?: Partial<FunctionConfigFormValues>
  isEdit?: boolean
}
export default function FunctionConfigForm({
  formId,
  onSubmit,
  isLoading = false,
  initialValues,
  isEdit = false,
}: FunctionConfigFormProps) {
  const form = useForm({
    defaultValues: {
      fiscalYearId: initialValues?.fiscalYearId || '',
      strategicMinWeight: initialValues?.strategicMinWeight ?? 0,
      strategicMaxWeight: initialValues?.strategicMaxWeight ?? null,
      coreFunctionMinWeight: initialValues?.coreFunctionMinWeight ?? 0,
      coreFunctionMaxWeight: initialValues?.coreFunctionMaxWeight ?? null,
      supportMinWeight: initialValues?.supportMinWeight ?? 0,
      supportMaxWeight: initialValues?.supportMaxWeight ?? null,
    },
    validators: {
      onChange: functionConfigBaseSchema,
      onSubmit: functionConfigFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as FunctionConfigFormValues)
    },
  })

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {!isEdit && (
        <form.Field
          name="fiscalYearId"
          children={(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Fiscal Year <span className="text-destructive">*</span>
              </Label>
              <ReusableFiscalYearSelector
                onFiscalYearChange={(_, id) => field.handleChange(id)}
                disabled={isLoading}
                placeholder="Select fiscal year to configure"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      <div className="grid grid-cols-1 gap-5">
        {/* Strategic Section */}
        <div className="space-y-4 p-4 border rounded-xl bg-slate-50/40 border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
              Strategic Function Weights
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="strategicMinWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase">
                    Min Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
            <form.Field
              name="strategicMaxWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase">
                    Max Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.trim()
                      if (val === '') {
                        field.handleChange(null)
                      } else {
                        const num = Number(val)
                        field.handleChange(isNaN(num) ? null : num)
                      }
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
        </div>

        {/* Core Section */}
        <div className="space-y-4 p-4 border rounded-xl bg-blue-50/30 border-blue-100">
          <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-blue-700">
              Core Function Weights
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="coreFunctionMinWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-blue-600 uppercase">
                    Min Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
            <form.Field
              name="coreFunctionMaxWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-blue-600 uppercase">
                    Max Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.trim()
                      if (val === '') {
                        field.handleChange(null)
                      } else {
                        const num = Number(val)
                        field.handleChange(isNaN(num) ? null : num)
                      }
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-4 p-4 border rounded-xl bg-orange-50/30 border-orange-100">
          <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
            <HeartPulse className="h-4 w-4 text-orange-600" />
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-orange-700">
              Support Function Weights
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="supportMinWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-orange-600 uppercase">
                    Min Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
            <form.Field
              name="supportMaxWeight"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-orange-600 uppercase">
                    Max Weight (%)
                  </Label>
                  <Input
                    type="number"
                    value={field.state.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.trim()
                      if (val === '') {
                        field.handleChange(null)
                      } else {
                        const num = Number(val)
                        field.handleChange(isNaN(num) ? null : num)
                      }
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="bg-white"
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
