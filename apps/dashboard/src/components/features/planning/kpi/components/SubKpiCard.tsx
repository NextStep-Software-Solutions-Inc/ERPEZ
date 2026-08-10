/**
 * SubKpiCard Component
 * Displays a sub-KPI with key information in a card format
 * Used in the SubKpiListPage to show sub-KPIs under a KPI assignment
 */
import { motion } from 'framer-motion'
import { SdgPill } from './SdgPill'
import type { KPI } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SDGS } from '@/components/lib/sdgs'

interface SubKpiCardProps {
    subKpi: KPI
    index?: number
}

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.3 },
    },
}

/**
 * SubKpiCard Component
 * Renders a single sub-KPI with its details in a card layout
 */
export function SubKpiCard({ subKpi, index = 0 }: SubKpiCardProps) {
    const { name, description, functionType, SDGs } = subKpi

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover={{
                scale: 1.01,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: { duration: 0.2 },
            }}
            className="motion-reduce:transition-none motion-reduce:hover:scale-100"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <Card className="border-l-4 border-blue-500 shadow-none bg-gray-50 overflow-hidden">
                <CardContent className="p-4">
                    {/* Main Grid Layout */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Left Column - Sub-KPI Info */}
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs text-muted-foreground font-normal">
                                    Sub-KPI Name
                                </Label>
                                <div className="text-sm font-semibold mt-1">{name}</div>
                            </div>

                            {description && (
                                <div>
                                    <Label className="text-xs text-muted-foreground font-normal">
                                        Description
                                    </Label>
                                    <div className="text-sm mt-1">{description}</div>
                                </div>
                            )}

                            {functionType && (
                                <div>
                                    <Label className="text-xs text-muted-foreground font-normal">
                                        Function Type
                                    </Label>
                                    <div className="text-sm mt-1">{functionType}</div>
                                </div>
                            )}

                            {/* SDGs */}
                            {(SDGs || []).length > 0 && (
                                <div>
                                    <Label className="text-xs text-muted-foreground font-normal">
                                        Sustainable Development Goals
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(SDGs || []).map((sdg, idx: number) => {
                                            const sdgName = typeof sdg === 'string' ? sdg : sdg.name;
                                            const sdgData = SDGS.find((s) => s.name === sdgName || s.title === sdgName);
                                            return (
                                                <SdgPill
                                                    key={idx}
                                                    label={sdgName}
                                                    color={sdgData?.color || '#6B7280'}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Meta Info */}
                        <div className="space-y-3 md:text-right">
                            <div className="md:ml-auto md:w-fit">
                                <Label className="text-xs text-muted-foreground font-normal">
                                    Allocated Target Value
                                </Label>
                                <div className="text-2xl font-bold mt-1 text-blue-600">
                                    {/* {allocatedTargetValue} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
