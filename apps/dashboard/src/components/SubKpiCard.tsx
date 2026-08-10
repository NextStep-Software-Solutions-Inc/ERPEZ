import { motion } from 'framer-motion'
import { KpiActionMenu } from './KpiActionMenu'
import type { KPI } from '@/components/features/planning/kpi/types'
import { Badge } from '@/components/ui/badge'
import { itemVariants, subKpiHoverVariants } from '@/utils/animation'

interface SubKpiCardProps {
    subKpi: KPI
    prefersReducedMotion: boolean
    onView: () => void
    onAddActivity: () => void
    onDelete: () => void
}

export function SubKpiCard({ subKpi, prefersReducedMotion, onView, onAddActivity, onDelete }: SubKpiCardProps) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={prefersReducedMotion ? {} : subKpiHoverVariants.hover}
            className="border rounded-md p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">

                        <h5 className="font-medium text-sm">{subKpi.name}</h5>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="border-green-600 rounded-sm w-14" variant={'outline'}>
                        <p className="text-xs font-light text-green-600">Sub-KPI</p>
                    </Badge>
                    <KpiActionMenu
                        size="sm"
                        onView={onView}
                        onAddActivity={onAddActivity}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        </motion.div>
    )
}
