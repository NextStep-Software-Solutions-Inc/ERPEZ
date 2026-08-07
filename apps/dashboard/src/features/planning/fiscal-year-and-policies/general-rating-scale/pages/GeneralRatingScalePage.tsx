import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import RatingScaleManager from '../components/RatingScaleManager'
import CreateRatingScaleFormModal from '../components/CreateRatingScaleFormModal'
import { getFiscalYearsRequest } from '../../fiscal-year-management/handlers/getFiscalYearsRequest'
import { PageContainerDashtail } from '@/components/v2'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import type { FiscalYear } from '../../fiscal-year-management/types/types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
/**
 * RatingScaleTab - Route-level container for GeneralRatingScale management
 *
 * Responsibilities:
 * - Fetch fiscal years data
 * - Pass fiscal years to RatingScaleManager
 * - Handle create modal state
 * - Provide page structure and header
 *
 * Does NOT contain:
 * - Fiscal year selection logic (moved to RatingScaleManager)
 * - Rating scales fetch logic (moved to RatingScaleManager)
 * - Business logic
 */
export default function RatingScaleTab() {
  const queryClient = useQueryClient()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)

  // Fetch all fiscal years for the create modal
  const { data: fiscalYearsData, isLoading: isFiscalYearsLoading } =
    useFiscalYears({
      pathParams: {},
      queryParams: { pageSize: 100 },
    })

  const fiscalYears = (fiscalYearsData?.data || []) as FiscalYear[]

  const handleCreateSuccess = () => {
    // Invalidate all general rating scales queries (any variant with filters/params)
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].startsWith('/general-rating-scales'),
    })
    setIsCreateFormOpen(false)
  }

  if (isFiscalYearsLoading) {
    return (
      <PageContainerDashtail
        title="General Rating Scales"
        description="Configure 5-level rating scales with adjectival descriptions and numeric ranges. View and manage scales across all fiscal years or select a specific one."
        mode="simple"
      >
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      </PageContainerDashtail>
    )
  }

  return (
    <PageContainerDashtail
      title="General Rating Scales"
      description="Configure 5-level rating scales with adjectival descriptions and numeric ranges. View and manage scales across all fiscal years or select a specific one."
      mode="simple"
      actions={
        <Button
          onClick={() => setIsCreateFormOpen(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add General Rating Scale
        </Button>
      }
    >
      <div className="space-y-6 pt-4">
        {/* Rating Scale Manager */}
        <RatingScaleManager />

        {/* Create Rating Scale Form Modal */}
        {isCreateFormOpen && (
          <CreateRatingScaleFormModal
            isOpen={isCreateFormOpen}
            onClose={() => setIsCreateFormOpen(false)}
            fiscalYears={fiscalYears}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </PageContainerDashtail>
  )
}
