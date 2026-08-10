import { z } from 'zod'
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { PageContainer } from '@/components/PageContainer'
import { SubKpiCard } from '@/components/features/planning/kpi/components/SubKpiCard'

export const Route = createFileRoute(
    '/v1/planning/kpi-assignment-for-du/$kpiAssignmentForDuId/subKpi',
)({
    validateSearch: z.object({
        assignmentId: z.string().optional(),
    }),
    component: RouteComponent,
})
const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)

function RouteComponent() {
    const { kpiAssignmentForDuId } = useParams({
        from: Route.id,
    })
    const { assignmentId } = useSearch({
        from: Route.id,
    })
    const {
        data: deliveryUnit,
        isLoading,
        error
    } = useDeliveryUnit({
        pathParams: {
            id: kpiAssignmentForDuId
        },
        queryParams: {},
    })

    if (isLoading) {
        return (
            <PageContainer
                title="Loading..."
                description="View Sub-KPIs for this KPI Assignment"
                backTo
                backLabel="Back to KPI Assignment Details"
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
                description="View Sub-KPIs for this KPI Assignment"
                backTo
                backLabel="Back to KPI Assignment Details"
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            Failed to load sub-KPI data. Please try again.
                        </p>
                    </div>
                </div>
            </PageContainer>
        )
    }

    // Find the specific KPI assignment
    const kpiAssignment = deliveryUnit.data.kpiTargetAssignments.find(
        (assignment) => assignment.id === assignmentId
    )

    if (!kpiAssignment) {
        return (
            <PageContainer
                title="KPI Assignment Not Found"
                description="View Sub-KPIs for this KPI Assignment"
                backTo
                backLabel="Back to KPI Assignment Details"
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            The KPI assignment could not be found.
                        </p>
                    </div>
                </div>
            </PageContainer>
        )
    }

    const subKPIs = kpiAssignment.subKPIs || []
    const kpiName = kpiAssignment.KPI.name

    return (
        <PageContainer
            title={`Sub-KPIs: ${kpiName}`}
            description="View detailed information about sub-KPIs under this KPI assignment"
            backTo
            backLabel="Back to KPI Assignment Details"
        >
            {subKPIs.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        No sub-KPIs found for this KPI assignment.
                    </p>
                </div>
            ) : (
                <div className="space-y-4" role="list">
                    {subKPIs.map((subKpi, index) => (
                        <SubKpiCard 
                            subKpi={subKpi}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </PageContainer>
    )
}
