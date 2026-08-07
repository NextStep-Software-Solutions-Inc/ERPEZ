/**
 * Shared form body for creating and editing a sub-procurement mode.
 * Validation is real-time: threshold fields turn red immediately on blur/change
 * if the value violates the parent bounds.
 */
import { useState, useEffect } from 'react'
import { GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ModeOfProcurement } from '../../types'

export interface SubModeFormValues {
  name: string
  description: string
  minThreshold: string
  maxThreshold: string
}

interface SubModeFormProps {
  parentMode: ModeOfProcurement
  initialValues?: Partial<SubModeFormValues>
  onSubmit: (values: SubModeFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const DEFAULT_VALUES: SubModeFormValues = {
  name: '',
  description: '',
  minThreshold: '',
  maxThreshold: '',
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'unlimited'
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function validateThresholds(
  minRaw: string,
  maxRaw: string,
  parentMin: number,
  parentMax: number | null,
): { minThreshold?: string; maxThreshold?: string } {
  const errs: { minThreshold?: string; maxThreshold?: string } = {}
  const minVal = minRaw.trim() ? parseFloat(minRaw) : null
  const maxVal = maxRaw.trim() ? parseFloat(maxRaw) : null

  if (minVal !== null) {
    if (isNaN(minVal) || minVal < 0) {
      errs.minThreshold = 'Must be a valid non-negative number.'
    } else if (minVal > parentMin) {
      errs.minThreshold = `Cannot exceed parent minimum (${formatCurrency(parentMin)}).`
    }
  }

  if (maxVal !== null) {
    if (isNaN(maxVal) || maxVal < 0) {
      errs.maxThreshold = 'Must be a valid non-negative number.'
    } else if (parentMax !== null && maxVal > parentMax) {
      errs.maxThreshold = `Exceeds parent maximum threshold (${formatCurrency(parentMax)}).`
    } else if (minVal !== null && !errs.minThreshold && maxVal < minVal) {
      errs.maxThreshold = 'Must be greater than the minimum threshold.'
    }
  }

  return errs
}

export function SubModeForm({
  parentMode,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: SubModeFormProps) {
  const [values, setValues] = useState<SubModeFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Track which threshold fields have been touched to show real-time errors
  const [touched, setTouched] = useState({ minThreshold: false, maxThreshold: false })

  const parentMin = parentMode.minThreshold ?? 0
  const parentMax = parentMode.maxThreshold ?? null

  // Re-seed form when initialValues change (e.g. dialog reopens with different mode)
  useEffect(() => {
    if (initialValues) {
      setValues({ ...DEFAULT_VALUES, ...initialValues })
      setErrors({})
      setTouched({ minThreshold: false, maxThreshold: false })
    }
  }, [initialValues?.name])

  // Real-time threshold validation on change (only when field has been touched)
  useEffect(() => {
    if (!touched.minThreshold && !touched.maxThreshold) return
    const thresholdErrs = validateThresholds(
      values.minThreshold,
      values.maxThreshold,
      parentMin,
      parentMax,
    )
    setErrors((prev) => ({
      ...prev,
      minThreshold: touched.minThreshold ? (thresholdErrs.minThreshold ?? '') : (prev.minThreshold ?? ''),
      maxThreshold: touched.maxThreshold ? (thresholdErrs.maxThreshold ?? '') : (prev.maxThreshold ?? ''),
    }))
  }, [values.minThreshold, values.maxThreshold, touched.minThreshold, touched.maxThreshold])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!values.name.trim()) {
      newErrors.name = 'Sub-mode name is required.'
    }
    const thresholdErrs = validateThresholds(
      values.minThreshold,
      values.maxThreshold,
      parentMin,
      parentMax,
    )
    if (thresholdErrs.minThreshold) newErrors.minThreshold = thresholdErrs.minThreshold
    if (thresholdErrs.maxThreshold) newErrors.maxThreshold = thresholdErrs.maxThreshold

    setErrors(newErrors)
    setTouched({ minThreshold: true, maxThreshold: true })
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  // Derive live error state — re-checked on every render so the submit button
  // reflects the current field values without needing an extra state flush
  const liveThresholdErrs = validateThresholds(
    values.minThreshold,
    values.maxThreshold,
    parentMin,
    parentMax,
  )
  const hasThresholdError = !!(errors.minThreshold || errors.maxThreshold)
  const isSubmitBlocked =
    isLoading ||
    !!(liveThresholdErrs.minThreshold || liveThresholdErrs.maxThreshold)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-y-auto max-h-[calc(90vh-300px)] pr-1 space-y-5">
        {/* Parent context pill */}
        <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm">
          <GitBranch className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="text-violet-700">
            Parent: <span className="font-semibold">{parentMode.modeName}</span>
          </span>
          <span className="ml-auto text-violet-500 text-xs">
            {formatCurrency(parentMin)} – {formatCurrency(parentMax)}
          </span>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="sub-name">
            Sub-Mode Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sub-name"
            placeholder="e.g., Small Value Procurement (SVP)"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className={errors.name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="sub-description">Description</Label>
          <Textarea
            id="sub-description"
            placeholder="Optional description of the sub-mode"
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Thresholds */}
        <div>
          <p className="text-sm font-medium mb-1">
            Threshold{' '}
            <span className="text-muted-foreground font-normal">
              (constrained by parent bounds)
            </span>
          </p>
          {hasThresholdError && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>
                Threshold values must not exceed parent bounds:{' '}
                <strong>
                  Min ≤ {formatCurrency(parentMin)} {parentMax !== null ? `& Max ≤ ${formatCurrency(parentMax)}` : ''}
                </strong>
                .
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min */}
            <div className="space-y-2">
              <Label htmlFor="sub-minThreshold">Minimum Threshold</Label>
              <Input
                id="sub-minThreshold"
                type="number"
                min={0}
                max={parentMin}
                step="0.01"
                placeholder={`≤ ${formatCurrency(parentMin)}`}
                value={values.minThreshold}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, minThreshold: true }))
                  setValues({ ...values, minThreshold: e.target.value })
                }}
                onBlur={() => setTouched((t) => ({ ...t, minThreshold: true }))}
                className={errors.minThreshold ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.minThreshold ? (
                <p className="text-xs text-red-500">{errors.minThreshold}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Limit: ≤ {formatCurrency(parentMin)}
                </p>
              )}
            </div>

            {/* Max */}
            <div className="space-y-2">
              <Label htmlFor="sub-maxThreshold">Maximum Threshold</Label>
              <Input
                id="sub-maxThreshold"
                type="number"
                min={0}
                max={parentMax ?? undefined}
                step="0.01"
                placeholder={
                  parentMax !== null ? `≤ ${formatCurrency(parentMax)}` : 'Unlimited'
                }
                value={values.maxThreshold}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, maxThreshold: true }))
                  setValues({ ...values, maxThreshold: e.target.value })
                }}
                onBlur={() => setTouched((t) => ({ ...t, maxThreshold: true }))}
                className={errors.maxThreshold ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.maxThreshold ? (
                <p className="text-xs text-red-500">{errors.maxThreshold}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Max: {formatCurrency(parentMax)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitBlocked}>
          <GitBranch className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
