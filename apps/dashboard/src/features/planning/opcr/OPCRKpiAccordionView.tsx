import { motion } from 'framer-motion'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { KPI } from '@/components/features/planning/kpi/types'
import { getSubKpisRequest } from '@/components/features/planning/kpi/subKpi/handlers/getSubKpisRequest'
import { getKpiTargetsRequest } from '@/components/features/planning/kpi-target/handlers/getKpiTargetsRequest'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { cardHoverVariants, cardVariants, containerVariants } from '@/utils/animation'
import { OPCRActivityListView } from './OPCRActivityListView.tsx'

const useSubKpis = createQueryHookFromTemplate(getSubKpisRequest)
const useKpiTargets = createQueryHookFromTemplate(getKpiTargetsRequest)

interface OPCRKpiAccordionViewProps {
    kpis: KPI[]
    deliveryUnitId: string
    opcrId: string
    prefersReducedMotion?: boolean
    isLoading?: boolean
}

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual Target']
const QUARTER_FILTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual']

export function OPCRKpiAccordionView({
    kpis,
    deliveryUnitId,
    opcrId,
    prefersReducedMotion = false,
    isLoading = false,
}: OPCRKpiAccordionViewProps) {

    if (isLoading) {
        return (
            <div className="space-y-4 px-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        )
    }

    if (!kpis || kpis.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No KPIs Available</h3>
                <p className="text-sm text-muted-foreground">No KPIs have been assigned to this OPCR.</p>
            </div>
        )
    }

    return (
        <div className="px-6 space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
                {kpis.map((kpi) => (
                    <OPCRKpiItem
                        key={kpi.id}
                        kpi={kpi}
                        deliveryUnitId={deliveryUnitId}
                        opcrId={opcrId}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                ))}
            </Accordion>
        </div>
    )
}

interface OPCRKpiItemProps {
    kpi: KPI
    deliveryUnitId: string
    opcrId: string
    prefersReducedMotion: boolean
}

function OPCRKpiItem({
    kpi,
    deliveryUnitId,
    opcrId,
    prefersReducedMotion,
}: OPCRKpiItemProps) {
    const navigate = useNavigate()
    const [selectedQuarter, setSelectedQuarter] = useState('Q1')

    // Fetch sub-KPIs
    const { data: subKpisData, isLoading: isLoadingSubKpis } = useSubKpis({
        pathParams: {},
        queryParams: {
            pageNumber: 1,
            pageSize: 999,
            filters: `parentKPIId==${kpi.id}`,
        },
    })

    // Fetch KPI targets
    const { data: kpiTargetsData } = useKpiTargets({
        pathParams: {},
        queryParams: {
            pageNumber: 1,
            pageSize: 999,
            filters: `kpiId==${kpi.id}`,
        },
    })

    const subKpis = subKpisData?.data || []
    const kpiTargets = kpiTargetsData?.data || []
    const hasSubKpis = subKpis.length > 0

    // Find target for selected quarter
    const selectedTargetFilter = QUARTER_FILTERS[QUARTER_LABELS.indexOf(selectedQuarter)]
    const targetForQuarter = kpiTargets.find(
        (target: any) => target.quarterName === selectedTargetFilter || 
                        (selectedTargetFilter === 'Annual' && target.period === 'Annual')
    )

    return (
        <motion.div
            initial={prefersReducedMotion ? 'show' : 'hidden'}
            animate="show"
            variants={cardVariants}
            whileHover={prefersReducedMotion ? {} : cardHoverVariants.hover}
        >
            <AccordionItem
                value={`kpi-${kpi.id}`}
                className={cn('border rounded-lg px-4 border-l-4 border-l-blue-500')}
            >
                <AccordionTrigger className="hover:no-underline flex-row-reverse justify-end">
                    <div className="flex items-start justify-between w-full pl-4">
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{kpi.name}</h3>
                            </div>
                            {kpi.description && (
                                <p className="text-sm text-muted-foreground">{kpi.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="border-blue-600 rounded-sm" variant="outline">
                                <p className="text-xs font-light text-blue-600">KPI</p>
                            </Badge>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent>
                    <div className="space-y-6 pt-4 pl-4 border-l-2 border-muted-foreground/20">
                        {/* Quarterly Targets Tabs */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Set Target | Add Activity</label>
                            <Tabs value={selectedQuarter} onValueChange={setSelectedQuarter} className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    {QUARTER_LABELS.map((label) => (
                                        <TabsTrigger key={label} value={label} className="text-xs">
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {QUARTER_LABELS.map((label) => (
                                    <TabsContent key={label} value={label} className="mt-4 space-y-3">
                                        {/* Target Value Display */}
                                        <div className="p-3 border rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground mb-2">Target Value</p>
                                            <p className="text-xl font-semibold">
                                                {targetForQuarter?.targetValue || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigate({
                                                        to: `/planning/${deliveryUnitId}/opcr/kpi/${kpi.id}`,
                                                    })
                                                }}
                                            >
                                                Edit Target
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigate({
                                                        to: `/planning/${deliveryUnitId}/opcr/kpi/${kpi.id}`,
                                                    })
                                                }}
                                            >
                                                Add Activity
                                            </Button>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        {/* Activities List */}
                        <OPCRActivityListView
                            kpiId={kpi.id}
                            opcrId={opcrId}
                            deliveryUnitId={deliveryUnitId}
                            selectedQuarter={selectedQuarter}
                        />

                        {/* Sub-KPIs */}
                        {isLoadingSubKpis ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : hasSubKpis ? (
                            <motion.div
                                initial={prefersReducedMotion ? 'show' : 'hidden'}
                                animate="show"
                                variants={containerVariants}
                                className="space-y-3 border-t pt-4"
                            >
                                <label className="text-sm font-semibold text-muted-foreground">Sub-KPIs</label>
                                <Accordion type="single" collapsible className="space-y-2">
                                    {subKpis.map((subKpi: KPI) => (
                                        <OPCRSubKpiItem
                                            key={subKpi.id}
                                            subKpi={subKpi}
                                            deliveryUnitId={deliveryUnitId}
                                            opcrId={opcrId}
                                            prefersReducedMotion={prefersReducedMotion}
                                        />
                                    ))}
                                </Accordion>
                            </motion.div>
                        ) : null}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </motion.div>
    )
}

interface OPCRSubKpiItemProps {
    subKpi: KPI
    deliveryUnitId: string
    opcrId: string
    prefersReducedMotion: boolean
}

function OPCRSubKpiItem({
    subKpi,
    deliveryUnitId,
    opcrId,
    prefersReducedMotion,
}: OPCRSubKpiItemProps) {
    const navigate = useNavigate()
    const [selectedQuarter, setSelectedQuarter] = useState('Q1')

    // Fetch KPI targets for sub-KPI
    const { data: kpiTargetsData } = useKpiTargets({
        pathParams: {},
        queryParams: {
            pageNumber: 1,
            pageSize: 999,
            filters: `kpiId==${subKpi.id}`,
        },
    })

    const kpiTargets = kpiTargetsData?.data || []

    // Find target for selected quarter
    const selectedTargetFilter = QUARTER_FILTERS[QUARTER_LABELS.indexOf(selectedQuarter)]
    const targetForQuarter = kpiTargets.find(
        (target: any) => target.quarterName === selectedTargetFilter || 
                        (selectedTargetFilter === 'Annual' && target.period === 'Annual')
    )

    return (
        <motion.div
            initial={prefersReducedMotion ? 'show' : 'hidden'}
            animate="show"
            variants={cardVariants}
        >
            <AccordionItem
                value={`sub-kpi-${subKpi.id}`}
                className={cn('border rounded-lg px-4 border-l-4 border-l-green-500')}
            >
                <AccordionTrigger className="hover:no-underline flex-row-reverse justify-end">
                    <div className="flex items-start justify-between w-full pl-4">
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{subKpi.name}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="border-green-600 rounded-sm" variant="outline">
                                <p className="text-xs font-light text-green-600">Sub-KPI</p>
                            </Badge>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent>
                    <div className="space-y-6 pt-4 pl-4 border-l-2 border-muted-foreground/20">
                        {/* Quarterly Targets Tabs */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Set Target | Add Activity</label>
                            <Tabs value={selectedQuarter} onValueChange={setSelectedQuarter} className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    {QUARTER_LABELS.map((label) => (
                                        <TabsTrigger key={label} value={label} className="text-xs">
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {QUARTER_LABELS.map((label) => (
                                    <TabsContent key={label} value={label} className="mt-4 space-y-3">
                                        {/* Target Value Display */}
                                        <div className="p-3 border rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground mb-2">Target Value</p>
                                            <p className="text-xl font-semibold">
                                                {targetForQuarter?.targetValue || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigate({
                                                        to: `/planning/${deliveryUnitId}/opcr/kpi/${subKpi.id}`,
                                                    })
                                                }}
                                            >
                                                Edit Target
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    navigate({
                                                        to: `/planning/${deliveryUnitId}/opcr/kpi/${subKpi.id}`,
                                                    })
                                                }}
                                            >
                                                Add Activity
                                            </Button>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        {/* Activities List */}
                        <OPCRActivityListView
                            kpiId={subKpi.id}
                            opcrId={opcrId}
                            deliveryUnitId={deliveryUnitId}
                            selectedQuarter={selectedQuarter}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </motion.div>
    )
}
