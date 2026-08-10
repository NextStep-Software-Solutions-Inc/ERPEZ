import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { TrendingUp } from 'lucide-react'
import {
  economicIndicatorBaseSchema,
  economicIndicatorFormSchema,
  type EconomicIndicatorFormValues,
} from './economicIndicatorForm.schema'
import { ReusableFiscalYearSelector } from '../../fiscal-year-and-policies/fiscal-year-management/components/ReusableFiscalYearSelector'
import FieldInfo from '@/components/FieldInfo'

interface EconomicIndicatorFormProps {
  formId: string
  onSubmit: (values: EconomicIndicatorFormValues) => void
  isLoading?: boolean
  initialValues?: Partial<EconomicIndicatorFormValues>
  isEdit?: boolean
}

export default function EconomicIndicatorForm({
  formId,
  onSubmit,
  isLoading = false,
  initialValues,
  isEdit = false,
}: EconomicIndicatorFormProps) {
  const form = useForm({
    defaultValues: {
      fiscalYearId: initialValues?.fiscalYearId || '',
      vatRate: initialValues?.vatRate ?? 0,
      inflationRate: initialValues?.inflationRate ?? 0,
      incomeTaxRate: initialValues?.incomeTaxRate ?? 0,
    },
    validators: {
      onChange: economicIndicatorBaseSchema,
      onSubmit: economicIndicatorFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as EconomicIndicatorFormValues)
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
      {/* Fiscal Year Selector (only shown in create mode) */}
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
                placeholder="Select fiscal year for indicators"
                label=""
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {/* Fiscal Year Display (only shown in edit mode) */}
      {isEdit && initialValues?.fiscalYearId && (
        <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-600 font-medium">
            Fiscal Year (Read-only)
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {initialValues.fiscalYearId}
          </p>
        </div>
      )}

      {/* Economic Indicators Section */}
      <div className="space-y-4 p-4 border rounded-xl bg-emerald-50/40 border-emerald-200">
        <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-emerald-700">
            Economic Indicators (%)
          </h3>
        </div>

        <div className="space-y-6">
          {/* VAT Rate */}
          <form.Field
            name="vatRate"
            children={(field) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    VAT Rate (%)
                  </Label>
                  <span className="text-lg font-bold text-emerald-600">
                    {field.state.value.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      const clamped = Math.max(0, Math.min(100, val))
                      field.handleChange(clamped)
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="w-24 bg-white text-center"
                  />
                  <Slider
                    value={[field.state.value]}
                    onValueChange={(val) => field.handleChange(val[0])}
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Inflation Rate */}
          <form.Field
            name="inflationRate"
            children={(field) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Inflation Rate (%)
                  </Label>
                  <span className="text-lg font-bold text-blue-600">
                    {field.state.value.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      const clamped = Math.max(0, Math.min(100, val))
                      field.handleChange(clamped)
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="w-24 bg-white text-center"
                  />
                  <Slider
                    value={[field.state.value]}
                    onValueChange={(val) => field.handleChange(val[0])}
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Income Tax Rate */}
          <form.Field
            name="incomeTaxRate"
            children={(field) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Income Tax Rate (%)
                  </Label>
                  <span className="text-lg font-bold text-purple-600">
                    {field.state.value.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      const clamped = Math.max(0, Math.min(100, val))
                      field.handleChange(clamped)
                    }}
                    disabled={isLoading}
                    variant="bordered"
                    className="w-24 bg-white text-center"
                  />
                  <Slider
                    value={[field.state.value]}
                    onValueChange={(val) => field.handleChange(val[0])}
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />
        </div>
      </div>
    </form>
  )
}
