import { useEffect, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { motion } from 'framer-motion'
import { getOPCRRequest } from '@/features/planning/opcr'
import { PageContainer } from '@/components/PageContainer'
import LoadingSpinner from '@/components/LoadingSpinner'
import KPITargetAssignmentsDisplay from '@/components/KPITargetAssignmentsDisplay'
import {
    Card, 
    CardContent,
} from '@/components/ui/card' 

const useOpcr = createQueryHookFromTemplate(getOPCRRequest)

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
}

function DeliveryUnitOPCRDetailsPage({ opcrId, role, deliveryUnitId }: { opcrId: string; role?: string; deliveryUnitId: string }) { 
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    const {
        data: opcr,
        isLoading: isOpcrLoading,
        error: opcrError,
    } = useOpcr({
        pathParams: {
            id: opcrId,
        },
        queryParams: {},
    })

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        const handler = (e: MediaQueryListEvent) =>
            setPrefersReducedMotion(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    // Loading state
    if (isOpcrLoading) {
        return (
            <PageContainer
                title={`OPCR Details`}
                description="Loading OPCR details..."
                backTo={true}
            >
                <LoadingSpinner size="lg" message="Loading OPCR details..." />
            </PageContainer>
        )
    }

    // Error state
    if (opcrError) {
        return (
            <PageContainer
                title="Delivery Unit OPCR Details"
                description="Error loading data"
                backTo={true}
            >
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">
                            Failed to load delivery unit details. Please try again.
                        </p>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    // No data state
    if (!opcr?.data) {
        return (
            <PageContainer
                title="OPCR Details"
                description="No data available"
                backTo={true}
            >
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">
                            details not found.
                        </p>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    const effectiveDeliveryUnitId = deliveryUnitId
    return ( 
        <PageContainer
            title={opcr.data.name ?? `OPCR - ${opcr.data.deliveryUnit?.office.name} ${opcr.data.fiscalYear.year}`}
            description={`List of KPIs for the delivery unit in OPCR ${opcr.data.fiscalYear.year}`}
            backTo 
        >
            <div className="grid grid-cols-1 gap-6">
                <motion.div
                    variants={prefersReducedMotion ? undefined : cardVariants}
                    initial="hidden"
                    animate="show"
                >
                    <KPITargetAssignmentsDisplay kpiTargetAssignments={opcr.data.deliveryUnit?.kpiTargetAssignments || []} deliveryUnitId={effectiveDeliveryUnitId} opcrId={opcrId} />
                    {/* <KPIAssignmentsDisplay kpiTargetAssignments={opcr.data.deliveryUnit?.kpiTargetAssignments || []} deliveryUnitId={effectiveDeliveryUnitId} opcrId={opcrId} />  */}
                </motion.div>
            </div>
        </PageContainer>
    )
}

export default DeliveryUnitOPCRDetailsPage
