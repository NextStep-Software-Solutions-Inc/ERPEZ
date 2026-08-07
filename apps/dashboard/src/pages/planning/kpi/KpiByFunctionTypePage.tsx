import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useParams } from '@tanstack/react-router'
import type { KpiTargetAssignments } from '@/components/features/planning/kpi-assignment-for-du'
import {
    Accordion,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { splitPascalCase } from '@/lib/utils'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { PageContainer } from '@/components/PageContainer'
import { getOPCRRequest } from '@/features/planning/opcr'
import { getColorClasses } from '@/utils/functionTypeColor'
import { containerVariants, useReducedMotion } from '@/utils/animation'
import { filterUniqueKpis } from '@/utils/kpi'
import { KpiAccordionItem } from '@/components/KpiAccordionItem'

interface KpiByFunctionTypePageProps {
    functionType: string
}

const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)
const useOPCR = createQueryHookFromTemplate(getOPCRRequest)

interface KpiByFunctionTypePageProps {
    functionType: string
}
export default function KpiByFunctionTypePage({
    functionType,
}: KpiByFunctionTypePageProps) {
    const prefersReducedMotion = useReducedMotion()
    const { deliveryUnitId, opcrId } = useParams({ from: '/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/' })
    const { data: opcr } = useOPCR({
        pathParams: { id: opcrId },
        queryParams: {},
    })
    const { data: deliveryUnit, isLoading, error } = useDeliveryUnit({
        pathParams: {
            id: deliveryUnitId
        },
        queryParams: {},
    })


    const colors = getColorClasses(functionType)
    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading KPIs: {String(error) || 'Unknown error'}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
    return (
        <PageContainer
            title={splitPascalCase(functionType) + ' KPIs'}
            description={`List of KPIs for ${splitPascalCase(functionType)}.`}
            backTo={{ to: '/planning/$deliveryUnitId/opcr/$opcrId', params: { deliveryUnitId, opcrId } }} backLabel={`Back to ${opcr?.data.name || opcr?.data.deliveryUnit?.office.name} KPIs`}
        >

            <motion.div
                initial={prefersReducedMotion ? 'show' : 'hidden'}
                animate="show"
                variants={containerVariants}
            >
                <Accordion type="single" collapsible className="w-full space-y-2 py-2 overflow-y-auto">
                    {filterUniqueKpis(deliveryUnit?.data.kpiTargetAssignments || [])
                        .filter((assignment: KpiTargetAssignments) => assignment.KPI.functionType === functionType)
                        .map((kpi: KpiTargetAssignments, index: number) => (
                            <KpiAccordionItem
                                kpi={kpi.KPI}
                                index={index}
                                colors={colors}
                                prefersReducedMotion={prefersReducedMotion}
                            />
                        ))}
                </Accordion>
            </motion.div>
        </PageContainer >
    )
}
