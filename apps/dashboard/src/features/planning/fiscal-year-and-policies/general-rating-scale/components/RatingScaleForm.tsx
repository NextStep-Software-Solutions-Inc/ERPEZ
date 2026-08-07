import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import {
  decimalToPercentage,
  formatDecimalScore,
} from '@/lib/fiscal-year-and-policies/utils'

interface RatingScaleFormProps {
  scale: GeneralRatingScale
  isOpen: boolean
  errors: string[]
  onSubmit: (formData: Partial<GeneralRatingScale>) => void
  onClose: () => void
  isLoading?: boolean
  mode?: 'edit' | 'duplicate'
}

/**
 * RatingScaleForm - Presentational component for editing a rating scale
 *
 * Responsibilities:
 * - Display form fields (name, minScore, maxScore)
 * - Show real-time percentage conversion
 * - Render validation errors
 * - Delegate submission to parent
 *
 * Does NOT contain:
 * - Validation logic (only display errors passed from parent)
 * - State persistence
 */
export default function RatingScaleForm({
  scale,
  isOpen,
  errors,
  onSubmit,
  onClose,
  isLoading = false,
  mode = 'edit',
}: RatingScaleFormProps) {
  const [formData, setFormData] = useState<Partial<GeneralRatingScale>>({
    adjectivalRatingName: scale.adjectivalRatingName,
    minScore: scale.minScore,
    maxScore: scale.maxScore,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    field: keyof GeneralRatingScale,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!isOpen) return null

  const minPercentage =
    typeof formData.minScore === 'number'
      ? decimalToPercentage(formData.minScore)
      : 0
  const maxPercentage =
    typeof formData.maxScore === 'number'
      ? decimalToPercentage(formData.maxScore)
      : 0

  const hasErrors = errors.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'duplicate'
              ? 'Duplicate Rating Scale'
              : 'Edit Rating Scale'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close form"
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* Errors */}
          {hasErrors && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900 mb-2">
                Validation Errors:
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Adjectival Rating Name */}
          <div>
            <label
              htmlFor="adjectivalRatingName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rating Name
            </label>
            <input
              id="adjectivalRatingName"
              type="text"
              maxLength={50}
              value={formData.adjectivalRatingName || ''}
              onChange={(e) =>
                handleChange('adjectivalRatingName', e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Excellent"
            />
            <p className="mt-1 text-xs text-gray-500">
              {(formData.adjectivalRatingName || '').length}/50 characters
            </p>
          </div>

          {/* Min Score */}
          <div>
            <label
              htmlFor="minScore"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Minimum Score
            </label>
            <div className="space-y-1">
              <input
                id="minScore"
                type="number"
                step={0.01}
                min={0}
                max={5}
                value={formData.minScore || 0}
                onChange={(e) =>
                  handleChange('minScore', parseFloat(e.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                aria-describedby="minScoreHint"
              />
              <p id="minScoreHint" className="text-xs text-gray-500">
                {formatDecimalScore(formData.minScore as number)} (
                {Math.round(minPercentage)}%)
              </p>
            </div>
          </div>

          {/* Max Score */}
          <div>
            <label
              htmlFor="maxScore"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Maximum Score
            </label>
            <div className="space-y-1">
              <input
                id="maxScore"
                type="number"
                step={0.01}
                min={0}
                max={5}
                value={formData.maxScore || 5}
                onChange={(e) =>
                  handleChange('maxScore', parseFloat(e.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                aria-describedby="maxScoreHint"
              />
              <p id="maxScoreHint" className="text-xs text-gray-500">
                {formatDecimalScore(formData.maxScore as number)} (
                {Math.round(maxPercentage)}%)
              </p>
            </div>
          </div>

          {/* Range Display */}
          <div className="rounded-lg bg-blue-50 px-3 py-2">
            <p className="text-xs font-medium text-blue-900">Score Range</p>
            <p className="text-sm text-blue-800 font-mono mt-1">
              {formatDecimalScore(formData.minScore as number)}–
              {formatDecimalScore(formData.maxScore as number)}(
              {Math.round(minPercentage)}–{Math.round(maxPercentage)}%)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              aria-label={
                mode === 'duplicate'
                  ? 'Create duplicate rating scale'
                  : 'Save changes'
              }
            >
              {isLoading && <span className="inline-block mr-2">⏳</span>}
              {mode === 'duplicate' ? 'Create Duplicate' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
              aria-label="Cancel editing"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
