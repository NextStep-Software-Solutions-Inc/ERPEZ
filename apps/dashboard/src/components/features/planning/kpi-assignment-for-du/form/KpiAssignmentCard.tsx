import { Trash } from 'lucide-react'
import TargetAllocationCard from './TargetAllocationCard'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { TargetSummary } from '../types/kpiAssignment.types'
import type { FormType } from './CreateDuKpiAssignmentForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { Label } from '@/components/ui/label'

interface Kpi {
    id: string
    name: string
    isTargetValueAllocable?: boolean
    isPercentage?: boolean
}

interface KpiAssignmentCardProps {
    assignmentIndex: number
    kpiId: string
    canRemove: boolean
    onRemove: () => void
    availableKpis: Array<Kpi>
    targetSummaries: Array<TargetSummary>
    isFetchingTargets: boolean
    form: FormType
}

// Helper to check if all targets have zero remaining value
const allTargetsExhausted = (summaries: Array<TargetSummary>): boolean => {
    if (summaries.length === 0) return false
    return summaries.every(s => s.remainingValue === 0)
}

export default function KpiAssignmentCard({
    assignmentIndex,
    kpiId,
    canRemove,
    onRemove,
    availableKpis,
    targetSummaries,
    isFetchingTargets,
    form,
}: KpiAssignmentCardProps) {
    const selectedKpi = availableKpis.find(k => k.id === kpiId)
    return (
        <Card className="p-6 -space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-base">{assignmentIndex + 1}. Key Performance Indicator</h4>
                    <p className="text-xs text-muted-foreground mt-1">Configure KPI and target details</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={!canRemove}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
            <>
                <form.Field name={`kpiTargets[${assignmentIndex}].kpiId`}>
                    {(field: AnyFieldApi) => (
                        <div>
                            <Label className="font-medium pb-2">Select KPI</Label>
                        <Select value={field.state.value}
                                onValueChange={(value) => { 
                                field.handleChange(value)
                                form.setFieldValue(`kpiTargets[${assignmentIndex}].allocations`, [])
                            }}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select a KPI" /></SelectTrigger>
                            <SelectContent>
                                {availableKpis.map((kpi) => (<SelectItem key={kpi.id} value={kpi.id}>{kpi.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                            <FieldInfo field={field} /> 
                    </div>
                )}
            </form.Field>

                <div className="">
                {kpiId ? (
                    isFetchingTargets ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            Loading targets...
                        </div>
                    ) : allTargetsExhausted(targetSummaries) ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-sm font-medium text-amber-900">This KPI is no longer target allocable</p>
                        </div>
                    ) : targetSummaries.length > 0 ? (
                            <form.Field name={`kpiTargets[${assignmentIndex}].allocations`} mode="array">
                                        {(allocationsField: AnyFieldApi) => {
                                    // Wait for allocations to be populated by useEffect
                                    const allocations = allocationsField.state.value || []
                                    if (allocations.length === 0 || allocations.length !== targetSummaries.length) {
                                        return (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                                                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                Initializing targets...
                                            </div>
                                        )
                                    }
                                    return (
                                        <div>
                                            {targetSummaries.map((summary, idx) => (
                                                <form.Field key={summary.id} name={`kpiTargets[${assignmentIndex}].allocations[${idx}].allocatedTargetValue`}>
                                                    {(field: AnyFieldApi) => (
                                                        <TargetAllocationCard isPercentage={selectedKpi?.isPercentage} summary={summary} targetIndex={idx} field={field} />
                                                    )}
                                                </form.Field>
                                            ))}
                                        </div>
                                    )
                                }}
                            </form.Field>
                    ) : (
                                        <Label className="text-xs text-muted-foreground mt-3">No target breakdown available for this KPI.</Label>
                    )
                ) : (
                            <div className="flex flex-row justify-center items-center">
                                <Label className="text-sm text-muted-foreground">Select a KPI to preview the available targets.</Label>
                            </div>
                )}
            </div>
            </>
        </Card>
    )
}
