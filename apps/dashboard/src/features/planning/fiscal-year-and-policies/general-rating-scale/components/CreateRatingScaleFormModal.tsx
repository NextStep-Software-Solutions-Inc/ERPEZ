import { useState } from 'react'
import { Award, AlertCircle, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import { useCreateGeneralRatingScale } from '../handlers/useGeneralRatingScales'
import {
  validateSingleRatingScale,
  decimalToPercentage,
  percentageToDecimal,
} from '@/lib/fiscal-year-and-policies/utils'

// Default 5-level rating scale structure
const DEFAULT_SCALES = [
  { level: 1, name: 'Excellent', minScore: 4.2, maxScore: 5.0 },
  { level: 2, name: 'Very Good', minScore: 3.4, maxScore: 4.19 },
  { level: 3, name: 'Good', minScore: 2.6, maxScore: 3.39 },
  { level: 4, name: 'Fair', minScore: 1.8, maxScore: 2.59 },
  { level: 5, name: 'Below Average', minScore: 0.0, maxScore: 1.79 },
]

interface ScaleLevel {
  level: number
  adjectivalRatingName: string
  minScore: number
  maxScore: number
  errors?: string[]
}

interface CreateRatingScaleFormModalProps {
  isOpen: boolean
  onClose: () => void
  fiscalYears: FiscalYear[]
  onSuccess: (createdScales: GeneralRatingScale[]) => void
}

/**
 * CreateRatingScaleFormModal
 * Form for creating all 5 rating levels for a fiscal year in one submission
 *
 * Features:
 * - Select fiscal year
 * - Configure 5 pre-filled rating levels
 * - Real-time min/max score validation
 * - Percentage display conversion
 * - Batch creation (5 POST calls)
 */
export default function CreateRatingScaleFormModal({
  isOpen,
  onClose,
  fiscalYears,
  onSuccess,
}: CreateRatingScaleFormModalProps) {
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('')
  const [scaleLevels, setScaleLevels] = useState<ScaleLevel[]>(
    DEFAULT_SCALES.map((s) => ({
      level: s.level,
      adjectivalRatingName: s.name,
      minScore: s.minScore,
      maxScore: s.maxScore,
    })),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string[]>
  >({})

  const createMutation = useCreateGeneralRatingScale()
  const isLoading = createMutation.isPending

  const handleFiscalYearChange = (fyId: string) => {
    setSelectedFiscalYearId(fyId)
    setFormError(null)
  }

  const handleScaleLevelChange = (
    level: number,
    field: 'adjectivalRatingName' | 'minScore' | 'maxScore',
    value: string | number,
  ) => {
    setScaleLevels((prev) =>
      prev.map((s) =>
        s.level === level
          ? { ...s, [field]: typeof value === 'string' ? value : Number(value) }
          : s,
      ),
    )
    // Clear errors for this level when user modifies
    setValidationErrors((prev) => {
      const updated = { ...prev }
      delete updated[level]
      return updated
    })
  }

  const handleScoreAsPercentageChange = (
    level: number,
    field: 'min' | 'max',
    percentageValue: string,
  ) => {
    const percentage = parseFloat(percentageValue) || 0
    const decimalValue = percentageToDecimal(percentage)

    handleScaleLevelChange(
      level,
      field === 'min' ? 'minScore' : 'maxScore',
      decimalValue,
    )
  }

  const validateForm = (): boolean => {
    const errors: Record<number, string[]> = {}
    let hasErrors = false

    if (!selectedFiscalYearId) {
      setFormError('Please select a fiscal year')
      return false
    }

    // Validate each scale level
    scaleLevels.forEach((scale) => {
      const scaleErrors = validateSingleRatingScale({
        id: '',
        fiscalYearId: selectedFiscalYearId,
        adjectivalRatingName: scale.adjectivalRatingName,
        minScore: scale.minScore,
        maxScore: scale.maxScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      if (scaleErrors.length > 0) {
        errors[scale.level] = scaleErrors.map((e) => e.message)
        hasErrors = true
      }
    })

    setValidationErrors(errors)
    if (hasErrors) {
      setFormError('Please fix validation errors below')
      return false
    }

    // Check for duplicate names within same fiscal year
    const uniqueNames = new Set(scaleLevels.map((s) => s.adjectivalRatingName))
    if (uniqueNames.size !== scaleLevels.length) {
      setFormError('Duplicate rating level names are not allowed')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const createdScales: GeneralRatingScale[] = []

      // Create each scale level sequentially
      for (const scale of scaleLevels) {
        const result = await createMutation.mutateAsync({
          pathParams: {},
          payload: {
            fiscalYearId: selectedFiscalYearId,
            adjectivalRatingName: scale.adjectivalRatingName,
            minScore: scale.minScore,
            maxScore: scale.maxScore,
          },
        })

        if (result.data) {
          createdScales.push(result.data)
        }
      }

      // Success - reset form and close
      setScaleLevels(
        DEFAULT_SCALES.map((s) => ({
          level: s.level,
          adjectivalRatingName: s.name,
          minScore: s.minScore,
          maxScore: s.maxScore,
        })),
      )
      setSelectedFiscalYearId('')
      setFormError(null)
      setValidationErrors({})

      onSuccess(createdScales)
    } catch (error) {
      console.error('Failed to create rating scales:', error)
      setFormError('Failed to create rating scales. Please try again.')
    }
  }

  const selectedFY = fiscalYears.find((fy) => fy.id === selectedFiscalYearId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Create General Rating Scale
          </DialogTitle>
          <DialogDescription>
            Create a complete 5-level rating scale for a fiscal year
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fiscal Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="fiscal-year-select" className="text-sm font-medium">
              Fiscal Year <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedFiscalYearId}
              onValueChange={handleFiscalYearChange}
              disabled={isLoading}
            >
              <SelectTrigger id="fiscal-year-select">
                <SelectValue placeholder="Select a fiscal year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    FY {fy.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{formError}</p>
            </div>
          )}

          {/* Rating Scale Levels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Rating Levels</Label>
              {selectedFY && (
                <span className="text-xs text-gray-500">
                  FY {selectedFY.year}
                </span>
              )}
            </div>

            {scaleLevels.map((scale) => {
              const levelErrors = validationErrors[scale.level] || []
              const minPercentage = decimalToPercentage(scale.minScore)
              const maxPercentage = decimalToPercentage(scale.maxScore)

              return (
                <div
                  key={scale.level}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  {/* Level Header with Color Indicator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        scale.level === 1
                          ? 'bg-green-500'
                          : scale.level === 2
                            ? 'bg-emerald-500'
                            : scale.level === 3
                              ? 'bg-amber-500'
                              : scale.level === 4
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                      }`}
                    />
                    <Label className="text-sm font-medium text-gray-900">
                      Level {scale.level}
                    </Label>
                  </div>

                  {/* Rating Name Input */}
                  <div className="mb-3">
                    <Label
                      htmlFor={`name-${scale.level}`}
                      className="text-xs font-medium text-gray-700 mb-1.5 block"
                    >
                      Adjectival Rating Name
                    </Label>
                    <Input
                      id={`name-${scale.level}`}
                      type="text"
                      value={scale.adjectivalRatingName}
                      onChange={(e) =>
                        handleScaleLevelChange(
                          scale.level,
                          'adjectivalRatingName',
                          e.target.value,
                        )
                      }
                      disabled={isLoading}
                      placeholder="e.g., Excellent"
                      className="text-sm"
                    />
                  </div>

                  {/* Score Ranges - Min and Max */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Min Score */}
                    <div>
                      <Label
                        htmlFor={`min-${scale.level}`}
                        className="text-xs font-medium text-gray-700 mb-1.5 block"
                      >
                        Min Score (%)
                      </Label>
                      <Input
                        id={`min-${scale.level}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={minPercentage.toFixed(1)}
                        onChange={(e) =>
                          handleScoreAsPercentageChange(
                            scale.level,
                            'min',
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        placeholder="0.0"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ({scale.minScore.toFixed(2)})
                      </p>
                    </div>

                    {/* Max Score */}
                    <div>
                      <Label
                        htmlFor={`max-${scale.level}`}
                        className="text-xs font-medium text-gray-700 mb-1.5 block"
                      >
                        Max Score (%)
                      </Label>
                      <Input
                        id={`max-${scale.level}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={maxPercentage.toFixed(1)}
                        onChange={(e) =>
                          handleScoreAsPercentageChange(
                            scale.level,
                            'max',
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        placeholder="100.0"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ({scale.maxScore.toFixed(2)})
                      </p>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {levelErrors.length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-2.5 mt-3">
                      <ul className="text-xs text-red-800 space-y-1">
                        {levelErrors.map((error, idx) => (
                          <li key={idx} className="flex gap-1.5">
                            <span className="text-red-600 shrink-0">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedFiscalYearId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Rating Scale
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
