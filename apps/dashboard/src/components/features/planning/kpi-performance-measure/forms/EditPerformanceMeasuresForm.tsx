import { useForm } from '@tanstack/react-form'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  editPerformanceMeasuresSchema
} from './EditPerformanceMeasuresTypes'
import { NUMERICAL_RATINGS, usePerformanceMeasures } from './EditPerformanceMeasuresConstants'
import AddPerformanceMeasureDropdown from './AddPerformanceMeasureDropdown'
import PerformanceMeasureCard from './PerformanceMeasureCard'
import EmptyPerformanceMeasuresState from './EmptyPerformanceMeasuresState'
import type {
  EditPerformanceMeasuresFormProps,
  EditPerformanceMeasuresFormValues,
  EditPerformanceMeasuresSubmission,
  KpiRating,
  KpiRatingEntry} from './EditPerformanceMeasuresTypes';
import type { KPIPerformanceMeasure } from '../types'
import { useKpiData } from '@/providers/KpiProvider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function EditPerformanceMeasuresForm({
    onSubmit,
    onCancel,
    isLoading = false,
    performanceMeasureId,
}: EditPerformanceMeasuresFormProps) {
    const kpi = useKpiData()
    const { data: performanceMeasures } = usePerformanceMeasures({
        pathParams: {},
        queryParams: {},
    })

    // Group existing ratings by performanceMeasureId and ensure all 5 ratings are present
    const groupedRatings: Array<KpiRatingEntry> = []
    const ratingMap = new Map<string, Array<KpiRating>>()

    // Filter ratings if editing a specific performance measure
    const relevantRatings = performanceMeasureId
        ? kpi.KPIRatings.filter(r => r.performanceMeasureId === performanceMeasureId)
        : kpi.KPIRatings

    relevantRatings.forEach(r => {
        if (!ratingMap.has(r.performanceMeasureId)) {
            ratingMap.set(r.performanceMeasureId, [])
        }
        ratingMap.get(r.performanceMeasureId)!.push({
            id: r.id,
            value: r.numericalRating,
            remarks: r.remarks,
        })
    })

    ratingMap.forEach((ratings, measureId) => {
        // Ensure all 5 ratings are present
        const completeRatings = NUMERICAL_RATINGS.map(scale => {
            const existing = ratings.find(r => r.value === scale.value)
            return existing || { value: scale.value, remarks: '' }
        })
        groupedRatings.push({
            performanceMeasureId: measureId,
            ratings: completeRatings,
        })
    })

    const [kpiRatings, setKpiRatings] = useState<Array<KpiRatingEntry>>(groupedRatings)
    const [showAddMenu, setShowAddMenu] = useState(false)

    // Ref for scrolling to newly added measure
    const measuresContainerRef = useRef<HTMLDivElement>(null)
    const lastAddedMeasureRef = useRef<string | null>(null)

    const form = useForm({
        defaultValues: {
            KPIRatings: groupedRatings,
        } as EditPerformanceMeasuresFormValues,
        validators: {
            onChange: editPerformanceMeasuresSchema,
        },
        onSubmit: ({ value }) => {
            // Flatten the grouped ratings to the submission format
            const flattened: EditPerformanceMeasuresSubmission = value.KPIRatings.flatMap(entry =>
                entry.ratings.map(rating => ({
                    id: rating.id,
                    performanceMeasureId: entry.performanceMeasureId,
                    numericalRating: rating.value,
                    remarks: rating.remarks,
                }))
            )
            onSubmit(flattened)
        },
    })

    useEffect(() => {
        const unsubscribe = form.store.subscribe(() => {
            setKpiRatings(form.state.values.KPIRatings)
        })
        return unsubscribe
    }, [form.store])

    // Clean up invalid entries in kpiRatings
    useEffect(() => {
        const currentRatings = form.state.values.KPIRatings
        if (Array.isArray(currentRatings)) {
            const validRatings = currentRatings.filter(
                (rating: KpiRatingEntry): rating is KpiRatingEntry =>
                    typeof rating.performanceMeasureId === 'string' &&
                    rating.performanceMeasureId.trim() !== '' &&
                    Array.isArray(rating.ratings),
            )
            if (validRatings.length !== currentRatings.length) {
                form.setFieldValue('KPIRatings', validRatings)
            }
        }
    }, [form.state.values.KPIRatings, form])

    // Scroll to newly added measure
    useEffect(() => {
        if (lastAddedMeasureRef.current && measuresContainerRef.current) {
            const newMeasureElement = measuresContainerRef.current.querySelector(
                `[data-measure-id="${lastAddedMeasureRef.current}"]`,
            )
            if (newMeasureElement) {
                newMeasureElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
                lastAddedMeasureRef.current = null
            }
        }
    }, [kpiRatings])

    const isMeasureSelected = (measureId: string): boolean => {
        if (!Array.isArray(kpiRatings)) return false
        return kpiRatings.some(
            (rating: KpiRatingEntry) => rating.performanceMeasureId === measureId,
        )
    }

    const getAvailableMeasures = () => {
        return performanceMeasures?.data.filter((m: KPIPerformanceMeasure) => !isMeasureSelected(m.id))
    }

    const handleAddMeasure = (measureId: string) => {
        if (isMeasureSelected(measureId)) return

        const newRating: KpiRatingEntry = {
            performanceMeasureId: measureId,
            ratings: NUMERICAL_RATINGS.map((scale) => ({
                value: scale.value,
                remarks: '',
            })),
        }

        const currentRatings = Array.isArray(kpiRatings) ? kpiRatings : [] 
        const validRatings = currentRatings.filter(
            (rating: KpiRatingEntry): rating is KpiRatingEntry =>
                typeof rating.performanceMeasureId === 'string' &&
                rating.performanceMeasureId.trim() !== '' &&
                Array.isArray(rating.ratings),
        )
        const updatedRatings = [...validRatings, newRating]
        form.setFieldValue('KPIRatings', updatedRatings)
        setShowAddMenu(false)

        // Track the newly added measure for scrolling
        lastAddedMeasureRef.current = measureId
    }

    const handleRemoveMeasure = (measureId: string) => {
        const ratings = Array.isArray(kpiRatings) ? kpiRatings : []
        const updatedRatings = ratings
            .filter(
                (rating: KpiRatingEntry) => rating.performanceMeasureId !== measureId,
            )
            .filter(
                (rating: KpiRatingEntry): rating is KpiRatingEntry =>
                    typeof rating.performanceMeasureId === 'string' &&
                    rating.performanceMeasureId.trim() !== '' &&
                    Array.isArray(rating.ratings),
            )
        form.setFieldValue('KPIRatings', updatedRatings)
    }

    const getMeasureName = (measureId: string) => {
        return performanceMeasures?.data.find((m: KPIPerformanceMeasure) => m.id === measureId)
    }

    const canAddMore = (getAvailableMeasures() || []).length > 0

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <Label className="font-medium">Performance Measures *</Label>
                    {!performanceMeasureId && canAddMore && (
                        <AddPerformanceMeasureDropdown
                          showAddMenu={showAddMenu}
                          setShowAddMenu={setShowAddMenu}
                          availableMeasures={getAvailableMeasures() || []}
                          onAddMeasure={handleAddMeasure}
                          isLoading={isLoading}
                        />
                    )}
                </div>

                {/* Display selected measures */}
                {Array.isArray(kpiRatings) && kpiRatings.length > 0 && (
                    <div ref={measuresContainerRef} className="space-y-4 max-h-96 overflow-y-auto">
                        <AnimatePresence mode="popLayout">
                            {kpiRatings.map((rating: KpiRatingEntry, index: number) => {
                                const measure = getMeasureName(rating.performanceMeasureId)
                                if (!measure) return null

                                return (
                                    <PerformanceMeasureCard
                                      key={`selected-measure-${rating.performanceMeasureId}`}
                                      rating={rating}
                                      index={index}
                                      measureName={measure.name}
                                      measureDescription={measure.description}
                                      onRemove={handleRemoveMeasure}
                                      isLoading={isLoading}
                                      form={form}
                                        showRemoveButton={!performanceMeasureId && kpiRatings.length > 1}
                                    />
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State */}
                {(!Array.isArray(kpiRatings) || kpiRatings.length === 0) && (
                    <EmptyPerformanceMeasuresState />
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                />
            </div>
        </form>
    )
}