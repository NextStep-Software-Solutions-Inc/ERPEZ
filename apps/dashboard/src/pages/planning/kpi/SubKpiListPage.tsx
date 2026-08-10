/**
 * SubKpiListPage Component
 * Displays a list of sub-KPIs for a given KPI assignment
 * Similar to KpiAssignmentDetailsPage but focused on sub-KPIs
 */
import { useMemo, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Search } from 'lucide-react'
import type { SubKPI } from '@/components/features/planning/delivery-unit/table/types'
import { PageContainer } from '@/components/PageContainer'
import { Input } from '@/components/ui/input'
import { SubKpiCard } from '@/components/features/planning/kpi/components/SubKpiCard'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'

const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)

interface SubKpiListPageProps {
    kpiAssignmentId: string
}

/**
 * SubKpiListPage Component
 * Fetches and displays sub-KPIs for a specific KPI assignment
 */
function SubKpiListPage({ kpiAssignmentId }: SubKpiListPageProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const {
        data: deliveryUnit,
        isLoading,
        error,
    } = useDeliveryUnit({
        pathParams: {
            id: kpiAssignmentId,
        },
        queryParams: {},
    })

    // Find the specific KPI assignment and extract sub-KPIs
    const kpiAssignment = useMemo(() => {
        if (!deliveryUnit?.data.kpiAssignments) return null
        return deliveryUnit.data.kpiAssignments.find(
            (assignment) => assignment.id === kpiAssignmentId
        )
    }, [deliveryUnit?.data.kpiAssignments, kpiAssignmentId])

    const subKpis = kpiAssignment?.subKPIs || []
    const kpiName = kpiAssignment?.KPI.name || 'KPI'

    // Filter sub-KPIs based on search query
    const filteredSubKpis = useMemo(() => {
        if (!searchQuery.trim()) {
            return subKpis
        }

        const query = searchQuery.toLowerCase()
        return subKpis.filter((subKpi: SubKPI) => {
            const name = subKpi.name.toLowerCase() || ''
            const description = subKpi.description?.toLowerCase() || ''
            const functionType = subKpi.functionType?.toLowerCase() || ''
            const sdgNames =
                subKpi.SDGs.map((sdg) => sdg.name.toLowerCase()).join(' ') || ''

            return (
                name.includes(query) ||
                description.includes(query) ||
                functionType.includes(query) ||
                sdgNames.includes(query)
            )
        })
    }, [subKpis, searchQuery])

    if (isLoading) {
        return (
            <PageContainer
                title="Loading..."
                description="View sub-KPIs for this KPI assignment"
                backTo={`/planning/kpi-assignment-for-du/${kpiAssignmentId}`}
                backLabel="Back to KPI Assignment"
            >
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </PageContainer>
        )
    }

    if (error || !deliveryUnit?.data || !kpiAssignment) {
        return (
            <PageContainer
                title="Error Loading Data"
                description="View sub-KPIs for this KPI assignment"
                backTo={`/planning/kpi-assignment-for-du/${kpiAssignmentId}`}
                backLabel="Back to KPI Assignment"
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

    return (
        <PageContainer
            title={`Sub-KPIs: ${kpiName}`}
            description="View detailed information about sub-KPIs under this KPI assignment"
            backTo={`/planning/kpi-assignment-for-du/${kpiAssignmentId}`}
            backLabel="Back to KPI Assignment"
        >
            {/* Header with Search */}
            <div className="flex flex-col justify-between sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search sub-KPIs by name, description, function type, or SDG..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        aria-label="Search sub-KPIs by name, description, function type, or SDG"
                    />
                </div>
            </div>

            {/* Sub-KPI Cards */}
            {filteredSubKpis.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        {searchQuery
                            ? 'No sub-KPIs found matching your search.'
                            : 'No sub-KPIs found for this KPI assignment.'}
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
                    {filteredSubKpis.map((subKpi: SubKPI, index: number) => (
                        <SubKpiCard key={subKpi.id} subKpi={subKpi} index={index} />
                    ))}
                </div>
            )}

            {/* Summary Info */}
            {!searchQuery && filteredSubKpis.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredSubKpis.length} sub-KPI
                        {filteredSubKpis.length !== 1 ? 's' : ''} for <strong>{kpiName}</strong>
                    </p>
                </div>
            )}
        </PageContainer>
    )
}

export default SubKpiListPage
