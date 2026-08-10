import { Lock } from 'lucide-react'
import { getOverAllocationTextColor, getProgressColor } from '../types/kpiAssignment.types'
import type { TargetSummary } from '../types/kpiAssignment.types';
import type { AnyFieldApi } from '@tanstack/react-form';
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import DebouncedInput from '@/components/ui/DebouncedInput'
import FieldInfo from '@/components/FieldInfo'

interface TargetAllocationCardProps {
    summary: TargetSummary
    targetIndex: number
    field: AnyFieldApi
    isPercentage?: boolean
}

export default function TargetAllocationCard({ summary, field, isPercentage }: TargetAllocationCardProps) {
    // If no remaining value, show fallback card
    if (summary.remainingValue === 0) {
        const message = summary.targetType === 'quarterly' ? 'This quarter has 0 remaining value' : 'This year has no remaining value'
        return (
            <Card className="w-full p-4 mb-4 border border-gray-300 bg-gray-50 shadow-sm">
                <div className="space-y-0">
                    <Label className="font-medium text-muted-foreground">{summary.label}</Label>
                    <p className="text-sm text-muted-foreground mt-2">{message}</p>
                </div>
            </Card>
        )
    }

    const currentInput = Number(field.state.value) || 0 
    const totalTarget = summary.targetValue
    const currentAllocated = summary.targetValue - summary.remainingValue
    const newAllocated = currentAllocated + currentInput

    const rawProgress = totalTarget > 0 ? (newAllocated / totalTarget) * 100 : 0
    const displayProgress = Math.min(100, Math.max(0, rawProgress))

    const isOverAllocated = currentInput > summary.remainingValue
    const remainingAfterInput = Math.max(0, summary.remainingValue - currentInput)

    const progressColor = getProgressColor(currentInput, summary.remainingValue, rawProgress)
    const textColor = getOverAllocationTextColor(currentInput, summary.remainingValue)

    const handleValueChange = (value: string) => {
        // Don't allow changes if read-only (non-allocable KPIs)
        if (summary.isReadOnly) return

        const numValue = Number(value)
        // Allow values from 0 to remainingValue, but don't hard clamp - show warning instead
        const sanitizedValue = Math.max(0, numValue)
        field.handleChange(sanitizedValue)
    }


    return (
        <Card className="w-full p-4 mb-4 border border-gray-200/80 bg-white/70 shadow-sm">
            <div className="space-y-0">
                <div className="flex flex-row justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <Label className="font-medium">{summary.label}</Label>
                        {summary.isReadOnly && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Lock className="h-3 w-3" />
                                Auto-filled
                            </span>
                        )}
                    </div>
                    <div className="flex flex-row gap-4">
                        <Label className="text-xs text-muted-foreground">Total: {summary.targetValue} {isPercentage ? '%' : ''}</Label>
                        <Label className={`text-xs ${textColor}`}>
                            Remaining: {remainingAfterInput} {isPercentage ? '%' : ''}
                            {isOverAllocated && <span className="text-red-600 ml-1">(exceeded!)</span>}
                        </Label>
                    </div>
                </div>

                {summary.isReadOnly ? (
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700 cursor-not-allowed">
                        {currentInput.toLocaleString()} {isPercentage ? '%' : ''}
                    </div>
                ) : (
                        <DebouncedInput
                            value={String(field.state.value || '')}
                            onChange={handleValueChange}
                            type="number"
                            min={0}
                            max={summary.remainingValue}
                            placeholder={`Enter value (max: ${summary.remainingValue} ${isPercentage ? '%' : ''})`}
                            className={isOverAllocated ? 'border-red-500 focus:ring-red-500' : ''}
                        />
                )}
                <FieldInfo field={field} />

                <div className="flex flex-row items-center">
                    <Progress value={displayProgress} className={progressColor} />
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium px-2 ${textColor}`}>{rawProgress.toFixed(1)}%</span>
                    </div>
                </div>

                {isOverAllocated && !summary.isReadOnly && (
                    <p className="text-xs text-red-600 mt-1">Value exceeds remaining capacity. Max allowed: {summary.remainingValue} {isPercentage ? '%' : ''}</p>
                )}
            </div>
        </Card>
    )
}
