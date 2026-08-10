// PerformanceMeasureCard component

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { NUMERICAL_RATINGS } from './EditPerformanceMeasuresConstants'
import type { KpiRating, KpiRatingEntry } from './EditPerformanceMeasuresTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle } from '@/components/ui/alert'

interface PerformanceMeasureCardProps {
  rating: KpiRatingEntry
  index: number
  measureName: string
  measureDescription: string
  onRemove: (measureId: string) => void
  isLoading?: boolean
  form: any // TanStack form instance
  showRemoveButton?: boolean
}

export default function PerformanceMeasureCard({
  rating,
  index,
  measureName,
  measureDescription,
  onRemove,
  isLoading = false,
  form,
  showRemoveButton = true,
}: PerformanceMeasureCardProps) {
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
            {measureName}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {measureDescription}
          </p>
        </div>
        {showRemoveButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0"
            onClick={() => onRemove(rating.performanceMeasureId)}
            title="Remove this performance measure"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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
            <form.Field
              key={`${rating.performanceMeasureId}-rating-${r.value}`}
              name={
                `KPIRatings[${index}].ratings[${ratingIndex}].remarks` as const
              }
              children={(field) => (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 min-w-max border-2 border-gray-300 rounded-md font-semibold text-sm bg-white">
                    {r.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      placeholder="Description or remarks"
                      value={(field.state.value) || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value)
                      }
                      disabled={isLoading}
                      className="text-sm w-full truncate"
                    />
                  </div>
                </div>
              )}
            />
          ),
        )}
      </div>
    </motion.div>
  )
}