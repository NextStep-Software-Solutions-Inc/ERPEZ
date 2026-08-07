import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPerformanceMeasuresRequest } from '../../performance-measure/handlers/getPerformanceMeasuresRequest'
import { createRatingRequest } from '../../rating/handlers/createRatingRequest'
import AddKPIPerformanceMeasureForm from '../../kpi-performance-measure/forms/AddKPIPerformanceMeasureForm'
import type { PerformanceMeasureRating } from '../../kpi/types'
import { useKpiData } from '@/providers/KpiProvider'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddKPIPerformanceMeasureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export default function AddKPIPerformanceMeasureDialog({
  open,
  onOpenChange,
}: AddKPIPerformanceMeasureDialogProps) {
  const kpi = useKpiData()
  const queryClient = useQueryClient()

  const usePerformanceMeasures = createQueryHookFromTemplate(getPerformanceMeasuresRequest)
  const { data: performanceMeasures } = usePerformanceMeasures({
    pathParams: {},
    queryParams: {}
  })

  const useCreateRating = createMutationHookFromTemplate(createRatingRequest)
  const createMutation = useCreateRating()

  // Get already used performance measure IDs
  const usedPerformanceMeasureIds = new Set(
    kpi.KPIRatings.map(rating => rating.performanceMeasureId)
  )

  // Filter out already used performance measures
  const availablePerformanceMeasures = performanceMeasures?.data?.filter(
    (measure: PerformanceMeasureRating) => !usedPerformanceMeasureIds.has(measure.id)
  ) || []

  const [kpiRatings, setKpiRatings] = useState<Array<KpiRatingEntry>>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (kpiRatings.length === 0) {
      toast.error('Please add at least one performance measure')
      return
    }

    setIsSubmitted(true)

    try {
      // Create ratings for all selected performance measures sequentially with delay
      for (const entry of kpiRatings) {
        for (const rating of entry.ratings) {
          await createMutation.mutateAsync({
            pathParams: {},
            payload: {
              kpiId: kpi.id,
              performanceMeasureId: entry.performanceMeasureId,
              numericalRating: rating.value,
              remarks: rating.remarks,
            },
          })
          // Add 200ms delay between each creation
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      toast.success('Performance measures added successfully')
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/kpi'),
      })
      onOpenChange(false)

      // Reset form
      setKpiRatings([])
      setIsSubmitted(false)
    } catch (error) {
      toast.error('Failed to add performance measures')
      setIsSubmitted(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setKpiRatings([])
    setIsSubmitted(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Performance Measures</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <AddKPIPerformanceMeasureForm
            availablePerformanceMeasures={availablePerformanceMeasures}
            kpiRatings={kpiRatings}
            setKpiRatings={setKpiRatings}
            isLoading={createMutation.isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitted}
          >
            {isSubmitted ? 'Adding...' : 'Add Performance Measures'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}