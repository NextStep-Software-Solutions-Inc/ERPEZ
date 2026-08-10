import { useMemo, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import type { KpiTargetAssignments } from '@/components/features/planning/kpi-assignment-for-du'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KpiAssignmentCard } from '@/components/features/planning/kpi/components/KpiAssignmentCard'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { openCreateDialogAtom } from '@/components/features/planning/kpi-assignment-for-du/atoms/dialogAtoms'
import CreateKpiAssignmentDialog from '@/components/features/planning/kpi-assignment-for-du/dialog/CreateKpiAssignmentDialog'

const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest) 

function KpiAssignmentDetailsPage({
  deliveryUnitId,
}: {
    deliveryUnitId: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const openCreateDialog = useSetAtom(openCreateDialogAtom)
  const {
    data: deliveryUnit,
    isLoading,
    error
  } = useDeliveryUnit({
    pathParams: {
      id: deliveryUnitId
    },
    queryParams: {},
  })

  // Filter KPI assignments based on search query
  const filteredKpiTargetAssignments = useMemo(() => {
    if (!deliveryUnit?.data.kpiTargetAssignments) return []
    
    if (!searchQuery.trim()) {
      return deliveryUnit.data.kpiTargetAssignments
    }

    const query = searchQuery.toLowerCase()
    return deliveryUnit.data.kpiTargetAssignments.filter((assignment: KpiTargetAssignments) => {
      const kpiName = assignment.KPI.name.toLowerCase()
      const functionType = assignment.KPI.functionType.toLowerCase()
      const sdgs = ((assignment.KPI).SDGs?.filter((sdgNames) => sdgNames.name) ?? []) 

      return (
        kpiName.includes(query) ||
        functionType.includes(query) ||
        sdgs.some(sdg => sdg.name.toLowerCase().includes(query))
      )
    })
  }, [deliveryUnit?.data.kpiTargetAssignments, searchQuery])



  if (isLoading) {
    return (
      <PageContainer
        title="Loading..."
        description="View Detailed information about this KPI assignment for DU"
        backTo
        backLabel="Back to KPI Assignment for DU"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    )
  }

  if (error || !deliveryUnit?.data) {
    return (
      <PageContainer
        title="Error Loading Data"
        description="View Detailed information about this KPI assignment for DU"
        backTo
        backLabel="Back to KPI Assignment for DU"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              Failed to load delivery unit data. Please try again.
            </p>
          </div>
        </div>
      </PageContainer>
    )
  }

  const officeName = deliveryUnit.data.office.name || 'Delivery Unit'

  return (
    <PageContainer
      title={`${officeName}`}
      description="View Detailed information about this KPI assignment for DU"
      backTo={'/planning/kpi'}
      backLabel="Back to KPI Assignment for DU"
    >
      {/* Header with Search and Assign Button */}
      <div className="flex flex-col justify-between sm:flex-row gap-3 mb-6">
        <div className="relative ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search KPI assignments by name, function type, or SDG"
          />
        </div>
        <Button
          onClick={() => openCreateDialog(deliveryUnitId)}
          className="sm:w-auto w-full bg-(--button-blue)"
          aria-label="Assign KPI to delivery unit"
        >
          <Plus className="h-4 w-4" />
          Assign KPI
        </Button>
      </div>

      {/* KPI Assignment Cards */}
      {filteredKpiTargetAssignments.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? 'No KPI assignments found matching your search.'
              : 'No KPI assignments found.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4" role="list">
            {filteredKpiTargetAssignments.map((assignment: KpiTargetAssignments, index: number) => (
            <KpiAssignmentCard
              key={assignment.id}
                assignment={assignment}
                onViewSubKpis={(assignmentId) => {
                  navigate({
                    to: '/planning/kpi-assignment-for-du/$kpiAssignmentForDuId/subKpi',
                    params: { kpiAssignmentForDuId: deliveryUnitId },
                    search: { assignmentId }
                  }) 
                }}
              index={index}
            />
          ))}
        </div>
      )}
      <CreateKpiAssignmentDialog />
    </PageContainer>
  )
}

export default KpiAssignmentDetailsPage
