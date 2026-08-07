import { useState, useEffect, useRef } from 'react'
import { Award, CheckCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import type { GeneralRatingScale } from '@/lib/fiscal-year-and-policies/types'
import {
  validateSingleRatingScale,
  detectOverlappingRanges,
} from '@/lib/fiscal-year-and-policies/utils'
import {
  ReusableFiscalYearSelector,
  ReusableFiscalYearSelectorRef,
} from '../../fiscal-year-management/components/ReusableFiscalYearSelector'
import RatingScaleList from './RatingScaleList'
import RatingScaleForm from './RatingScaleForm'
import RangeConflictWarning from './RangeConflictWarning'
import { Spinner } from '@/components/ui/spinner'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getGeneralRatingScalesRequest } from '../handlers/getGeneralRatingScalesRequest'
import {
  useCreateGeneralRatingScale,
  useUpdateGeneralRatingScale,
} from '../handlers/useGeneralRatingScales'

const useGeneralRatingScales = createQueryHookFromTemplate(
  getGeneralRatingScalesRequest,
)

/**
 * RatingScaleManager - Container component for GeneralRatingScale management
 *
 * Responsibilities:
 * - Manage fiscal year selector state
 * - Fetch rating scales for selected fiscal year
 * - Manage modal open/close state and form mode (edit/duplicate)
 * - Coordinate API calls (create, update, delete)
 * - Handle validation and conflict detection
 * - Manage loading and error states
 * - Coordinate with specialized presentational components
 */
export default function RatingScaleManager() {
  const selectorRef = useRef<ReusableFiscalYearSelectorRef>(null)
  const queryClient = useQueryClient()
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('')

  // Determine if we're in "all fiscal years" mode
  const isInAllMode = selectedFiscalYearId === 'all' || !selectedFiscalYearId
  const isAllFiscalYearsMode = isInAllMode

  // Validate and safely extract fiscalYearId - only pass valid GUID when single FY selected
  const validSelectedFyId =
    selectedFiscalYearId &&
    selectedFiscalYearId !== 'all' &&
    selectedFiscalYearId !== undefined
      ? selectedFiscalYearId
      : undefined

  // Build filters only when a specific fiscal year is selected; otherwise leave undefined
  const filters = validSelectedFyId
    ? `fiscalYearId==${validSelectedFyId}`
    : undefined

  const { data: ratingScalesData, isLoading } = useGeneralRatingScales({
    pathParams: {},
    queryParams: {
      filters,
    },
  })
  const ratingScales = ratingScalesData?.data || []
  const initialRatingScales = ratingScales

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'edit' | 'duplicate'>('edit')
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [overlapConflict, setOverlapConflict] = useState<{
    scaleName: string
    minScore: number
    maxScore: number
    suggestion: string
  } | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [localRatingScales, setLocalRatingScales] =
    useState<GeneralRatingScale[]>(initialRatingScales)

  // API mutations
  const createMutation = useCreateGeneralRatingScale()
  const updateMutation = useUpdateGeneralRatingScale()

  // Sync with props
  useEffect(() => {
    setLocalRatingScales(initialRatingScales)
  }, [initialRatingScales])

  const editingScale = editingScaleId
    ? localRatingScales.find((s) => s.id === editingScaleId)
    : null

  const needsInitialization = localRatingScales.length === 0

  // Group rating scales by fiscal year if needed
  const groupedScales = isAllFiscalYearsMode
    ? localRatingScales.reduce(
        (acc, scale) => {
          const fyId = scale.fiscalYearId ?? 'unknown'
          if (!acc[fyId]) {
            acc[fyId] = {
              fiscalYearId: fyId,
              scales: [],
              // We'll populate these from scale data if available
              fiscalYearName: scale.fiscalYearYear?.toString() ?? fyId,
            }
          }
          acc[fyId].scales.push(scale)
          return acc
        },
        {} as Record<
          string,
          {
            fiscalYearId: string
            scales: GeneralRatingScale[]
            fiscalYearName: string
          }
        >,
      )
    : {}

  const sortedGroupedScales = isAllFiscalYearsMode
    ? Object.values(groupedScales).sort(
        (a, b) =>
          parseInt(b.fiscalYearName) - parseInt(a.fiscalYearName) || // Sort by year descending
          a.fiscalYearId.localeCompare(b.fiscalYearId),
      )
    : []

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleEditClick = (scaleId: string) => {
    setEditingScaleId(scaleId)
    setFormMode('edit')
    setIsFormOpen(true)
    setFormErrors([])
    setOverlapConflict(null)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingScaleId(null)
    setFormMode('edit')
    setFormErrors([])
    setOverlapConflict(null)
  }

  const handleFormSubmit = async (formData: Partial<GeneralRatingScale>) => {
    if (!editingScale) return

    // 1. Validate single scale
    const singleErrors = validateSingleRatingScale({
      ...editingScale,
      ...formData,
    })

    if (singleErrors.length > 0) {
      setFormErrors(singleErrors.map((e) => e.message))
      return
    }

    // 2. Check for overlaps (excluding current scale if editing)
    // Only check against scales in the same fiscal year
    const scalesForFY = localRatingScales.filter(
      (s) => s.fiscalYearId === editingScale.fiscalYearId,
    )
    const updatedScale = { ...editingScale, ...formData }
    const scaleToCheck =
      formMode === 'duplicate' ? undefined : editingScaleId || undefined
    const overlap = detectOverlappingRanges(
      scalesForFY, // Now checking only scales from the same FY
      updatedScale,
      scaleToCheck,
    )

    if (overlap) {
      setOverlapConflict({
        scaleName: overlap.scaleName,
        minScore: overlap.minScore,
        maxScore: overlap.maxScore,
        suggestion: overlap.suggestion,
      })
      return
    }

    setOverlapConflict(null)

    // 3. Submit to API
    try {
      if (formMode === 'edit') {
        // Update existing scale
        await updateMutation.mutateAsync({
          pathParams: { id: editingScaleId as string },
          payload: {
            adjectivalRatingName: formData.adjectivalRatingName,
            minScore: formData.minScore,
            maxScore: formData.maxScore,
          },
        })
        // Update local state
        setLocalRatingScales((prev) =>
          prev.map((s) =>
            s.id === editingScaleId ? { ...s, ...formData } : s,
          ),
        )
        setSuccessMessage('Rating scale updated successfully')
      } else if (formMode === 'duplicate') {
        // Create new scale based on duplicate - use the source scale's fiscal year
        const sourceScaleFyId = editingScale?.fiscalYearId || validSelectedFyId
        const newScale = await createMutation.mutateAsync({
          pathParams: {},
          payload: {
            fiscalYearId: sourceScaleFyId as string,
            adjectivalRatingName: `Copy of ${formData.adjectivalRatingName}`,
            minScore: formData.minScore as number,
            maxScore: formData.maxScore as number,
          },
        })
        // Update local state
        if (newScale.data) {
          setLocalRatingScales((prev) => [...prev, newScale.data])
        }
        setSuccessMessage('Rating scale duplicated successfully')
      }

      // Close form and refresh
      handleFormClose()
      queryClient.invalidateQueries({
        queryKey: ['/general-rating-scales'],
      })
    } catch (error) {
      console.error('Failed to save rating scale:', error)
      setFormErrors(['Failed to save rating scale. Please try again.'])
    }
  }

  return (
    <div className="space-y-6">
      {/* Fiscal Year Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ReusableFiscalYearSelector
          ref={selectorRef}
          onFiscalYearChange={(_, fyId) => setSelectedFiscalYearId(fyId)}
          label="Select Fiscal Year"
          placeholder="Select a fiscal year or view all"
          showAllOption={true}
          allOptionLabel="All Fiscal Years"
          size="lg"
        />
        {isAllFiscalYearsMode && (
          <p className="text-xs text-gray-500 mt-3 italic">
            Displaying all general rating scales across all fiscal years
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      )}

      {/* Rating Scale Card */}
      {!isLoading && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-blue-600" />
              Rating Scales
            </CardTitle>
            <CardDescription className="mt-1">
              Configure and manage 5-level rating scales with numeric ranges.
              {/* {!groupByFiscalYear && fiscalYearStatus && (
            <span className="ml-2 inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Status: {fiscalYearStatus}
            </span>
          )} */}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Success message */}
            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Empty state - no scales for selected FY */}
            {localRatingScales.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No rating scales found
                </p>
                <p className="text-xs text-gray-500">
                  {isAllFiscalYearsMode
                    ? 'Create your first rating scale using the button in the header'
                    : 'Create rating scales for this fiscal year'}
                </p>
              </div>
            )}

            {/* Validation warnings */}
            {/* {hasValidationIssues && !needsInitialization && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Validation Issues:
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  {allErrors.map((error, index) => (
                    <li key={index} className="flex gap-1.5">
                      <span className="shrink-0">•</span>
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )} */}

            {/* Rating scales display - grouped or flat view */}
            {!needsInitialization && localRatingScales.length > 0 && (
              <>
                {isAllFiscalYearsMode ? (
                  /* Grouped accordion view by fiscal year */
                  <Accordion type="multiple" className="space-y-3">
                    {sortedGroupedScales.map((group) => (
                      <AccordionItem
                        key={group.fiscalYearId}
                        value={group.fiscalYearId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                              {/* FY {JSON.stringify(group, null, 2)} */}
                              {group.scales[0]?.fiscalYearYear ||
                                'Unknown Fiscal Year'}
                            </span>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {group.scales.length} levels
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 border-t border-gray-100">
                          <RatingScaleList
                            ratingScales={group.scales}
                            // canEdit={canEdit}
                            selectedFY={group.fiscalYearId}
                            onEditClick={handleEditClick}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  /* Flat list view */
                  <RatingScaleList
                    ratingScales={localRatingScales}
                    // canEdit={canEdit}
                    selectedFY={validSelectedFyId}
                    onEditClick={handleEditClick}
                  />
                )}
                {/* Form modal */}
                {isFormOpen && editingScale && (
                  <RatingScaleForm
                    scale={editingScale}
                    isOpen={isFormOpen}
                    errors={formErrors}
                    onSubmit={handleFormSubmit}
                    onClose={handleFormClose}
                    isLoading={
                      updateMutation.isPending || createMutation.isPending
                    }
                    mode={formMode}
                  />
                )}
                {/* Conflict warning */}
                {overlapConflict && (
                  <RangeConflictWarning
                    conflictingScaleName={overlapConflict.scaleName}
                    conflictingMin={overlapConflict.minScore}
                    conflictingMax={overlapConflict.maxScore}
                    suggestion={overlapConflict.suggestion}
                    onDismiss={() => setOverlapConflict(null)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
