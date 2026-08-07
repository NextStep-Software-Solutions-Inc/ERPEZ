import { ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PerformanceMeasure } from '../../performance-measure/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle } from '@/components/ui/alert'

interface AddKPIPerformanceMeasureFormProps {
    availablePerformanceMeasures: Array<PerformanceMeasure>
    kpiRatings: Array<KpiRatingEntry>
    setKpiRatings: (ratings: Array<KpiRatingEntry>) => void
    isLoading?: boolean
}

// Types for KPI ratings
interface KpiRating {
    value: number
    remarks: string
}

interface KpiRatingEntry {
    performanceMeasureId: string
    ratings: Array<KpiRating>
}

// Numerical ratings scale (1-5)
const NUMERICAL_RATINGS = [
    { value: 5, label: 'Excellent' },
    { value: 4, label: 'Very Good' },
    { value: 3, label: 'Good' },
    { value: 2, label: 'Fair' },
    { value: 1, label: 'Poor' },
] as const

export default function AddKPIPerformanceMeasureForm({
    availablePerformanceMeasures,
    kpiRatings,
    setKpiRatings,
    isLoading = false,
}: AddKPIPerformanceMeasureFormProps) {
    const [showAddMenu, setShowAddMenu] = useState(false)

    // Ref for scrolling to newly added measure
    const measuresContainerRef = useRef<HTMLDivElement>(null)
    const lastAddedMeasureRef = useRef<string | null>(null)

    // Clean up invalid entries in kpiRatings
    useEffect(() => {
        const validRatings = kpiRatings.filter(
            (rating: KpiRatingEntry): rating is KpiRatingEntry =>
                typeof rating.performanceMeasureId === 'string' &&
                rating.performanceMeasureId.trim() !== '' &&
                Array.isArray(rating.ratings),
        )
        if (validRatings.length !== kpiRatings.length) {
            setKpiRatings(validRatings)
        }
    }, [kpiRatings, setKpiRatings])

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
        return kpiRatings.some(
            (rating: KpiRatingEntry) => rating.performanceMeasureId === measureId,
        )
    }

    const getAvailableMeasures = () => {
        return availablePerformanceMeasures.filter((m) => !isMeasureSelected(m.id))
    }

    const handleAddMeasure = (measureId: string) => {
        if (isMeasureSelected(measureId)) return

        const newRating = {
            performanceMeasureId: measureId,
            ratings: NUMERICAL_RATINGS.map((scale) => ({
                value: scale.value,
                remarks: '',
            })),
        }

        const updatedRatings = [...kpiRatings, newRating]
        setKpiRatings(updatedRatings)
        setShowAddMenu(false)

        // Track the newly added measure for scrolling
        lastAddedMeasureRef.current = measureId
    }

    const handleRemoveMeasure = (measureId: string) => {
        const updatedRatings = kpiRatings
            .filter(
                (rating: KpiRatingEntry) => rating.performanceMeasureId !== measureId,
            )
            .filter(
                (rating: KpiRatingEntry): rating is KpiRatingEntry =>
                    typeof rating.performanceMeasureId === 'string' &&
                    rating.performanceMeasureId.trim() !== '' &&
                    Array.isArray(rating.ratings),
            )
        setKpiRatings(updatedRatings)
    }

    const getMeasureName = (measureId: string) => {
        return availablePerformanceMeasures.find((m) => m.id === measureId)
    }

    const handleRatingChange = (measureIndex: number, ratingIndex: number, remarks: string) => {
        const newRatings = [...kpiRatings]
        newRatings[measureIndex].ratings[ratingIndex].remarks = remarks
        setKpiRatings(newRatings)
    }

    const canAddMore = getAvailableMeasures().length > 0

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <Label className="font-medium">Performance Measures *</Label>
                {canAddMore && (
                    <div className="relative">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            Add Performance Measure
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Dropdown menu for available measures */}
                        {showAddMenu && (
                            <div className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                    {getAvailableMeasures().map((measure) => (
                                        <button
                                            key={measure.id}
                                            type="button"
                                            onClick={() => handleAddMeasure(measure.id)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            <div className="font-medium text-sm">{measure.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Display selected measures */}
            {kpiRatings.length > 0 && (
                <div ref={measuresContainerRef} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {kpiRatings.map((rating: KpiRatingEntry, index: number) => {
                            const measure = getMeasureName(rating.performanceMeasureId)
                            if (!measure) return null

                            return (
                                <motion.div
                                    key={`selected-measure-${rating.performanceMeasureId}`}
                                    data-measure-id={rating.performanceMeasureId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.8,
                                        transition: { duration: 0.2 },
                                    }}
                                    className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-4 mb-4 min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base truncate">
                                                {measure.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {measure.description}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0"
                                            onClick={() =>
                                                handleRemoveMeasure(rating.performanceMeasureId)
                                            }
                                            title="Remove this performance measure"
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Numerical Ratings */}
                                    <div className="space-y-3">
                                        <Alert
                                            variant="default"
                                            className="bg-blue-100 ring-blue-500 ring-1 text-blue-500 text-xs"
                                        >
                                            <AlertTitle>
                                                Tip: Keep each description specific to the measure
                                                (e.g., Timeliness, Error rate, Customer Satisfaction)
                                            </AlertTitle>
                                        </Alert>
                                        {rating.ratings.map(
                                            (r: KpiRating, ratingIndex: number) => (
                                                <div key={`${rating.performanceMeasureId}-rating-${r.value}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md min-w-0">
                                                    <div className="flex items-center justify-center h-10 w-10 min-w-max border-2 border-gray-300 rounded-md font-semibold text-sm bg-white">
                                                        {r.value}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Input
                                                            type="text"
                                                            placeholder="Description or remarks"
                                                            value={r.remarks}
                                                            onChange={(e) =>
                                                                handleRatingChange(index, ratingIndex, e.target.value)
                                                            }
                                                            disabled={isLoading}
                                                            className="text-sm w-full truncate"
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty State */}
            {kpiRatings.length === 0 && (
                <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50 text-center">
                    <p className="text-gray-600 text-sm">
                        No performance measures added yet.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                        Click "Add Performance Measure" to get started.
                    </p>
                </div>
            )}
        </div>
    )
}