import { z } from 'zod'

// API Types
export type ApiKpiTarget = {
    id: string
    kpiId?: string
    targetValue?: number
    remainingTargetValue?: number
    period?: string
    quarterName?: string | null
    kpi?: { id?: string; isTargetValueAllocable?: boolean }
    isTargetValueAllocable?: boolean
}

export type TargetSummary = {
    id: string
    label: string
    periodLabel: string
    targetValue: number
    allocatedValue: number
    remainingValue: number
    progress: number
    isReadOnly: boolean // true if the associated KPI's isTargetValueAllocable === false (auto-filled)
    targetType: 'annual' | 'quarterly' // determined by period/quarterName
    quarterIndex?: number // 0-3 for quarterly targets
}

// Target type enum for clarity
export type TargetType = 'annual' | 'quarterly'

// Single target allocation schema
export const targetAllocationSchema = z.object({
    targetId: z.string().min(1, 'Target is required'),
    allocatedTargetValue: z.number().min(0, 'Value must be 0 or greater'),
})

export type TargetAllocation = z.infer<typeof targetAllocationSchema>

// Schema for KPI Assignment with multiple target allocations
export const createKpiAssignmentSchema = z.object({
    deliveryUnitId: z.string().min(1, 'Delivery Unit is required'),
    kpiTargets: z.array(
        z.object({
            kpiId: z.string().min(1, 'KPI is required'),
            allocations: z.array(targetAllocationSchema).min(1, 'At least one target allocation is required'),
        }).refine(
            (kpiTarget) => kpiTarget.allocations.some((alloc) => alloc.allocatedTargetValue > 0),
            { message: 'At least one target must have a value greater than 0' }
        ),
    ).min(1, 'At least one KPI assignment is required'),
})

export type CreateKpiAssignmentFormValues = z.infer<typeof createKpiAssignmentSchema>

// Submission payload type (flattened for API - matches backend exactly)
export type KpiAssignmentSubmissionPayload = {
    deliveryUnitId: string
    kpiTargets: Array<{
        kpiId: string
        targetId: string
        allocatedTargetValue: number
    }>
}

export const QUARTER_LABELS = [
    '1st Quarter',
    '2nd Quarter',
    '3rd Quarter',
    '4th Quarter',
    'Annual',
] as const

export const defaultKpiAssignment: CreateKpiAssignmentFormValues = {
    deliveryUnitId: '',
    kpiTargets: [{ kpiId: '', allocations: [] }],
}

// Transform form values to API payload (flatten allocations)
export const transformToSubmissionPayload = (
    formValues: CreateKpiAssignmentFormValues
): KpiAssignmentSubmissionPayload => ({
    deliveryUnitId: formValues.deliveryUnitId,
    kpiTargets: formValues.kpiTargets.flatMap((kpiTarget) =>
        kpiTarget.allocations.map((allocation) => ({
            kpiId: kpiTarget.kpiId,
            targetId: allocation.targetId,
            allocatedTargetValue: allocation.allocatedTargetValue,
        }))
    ),
})

// Helper to determine target type from period/quarterName
export const determineTargetType = (period?: string, quarterName?: string | null): TargetType => {
    const periodLower = period?.toLowerCase() ?? ''

    // If period indicates annual or no quarter info, it's annual
    if (periodLower.includes('annual') || periodLower.includes('yearly')) {
        return 'annual'
    }

    // If quarterName exists and is not null/empty, it's quarterly
    if (quarterName && quarterName.trim().length > 0) {
        return 'quarterly'
    }

    // If period contains quarter-related terms
    if (periodLower.includes('quarter') || periodLower.includes('q1') ||
        periodLower.includes('q2') || periodLower.includes('q3') || periodLower.includes('q4')) {
        return 'quarterly'
    }

    // Default to annual if unclear
    return 'annual'
}

// Helper to get quarter index from quarterName
export const getQuarterIndex = (quarterName?: string | null): number | undefined => {
    if (!quarterName) return undefined
    const lower = quarterName.toLowerCase()
    if (lower.includes('1st') || lower.includes('first') || lower.includes('q1')) return 0
    if (lower.includes('2nd') || lower.includes('second') || lower.includes('q2')) return 1
    if (lower.includes('3rd') || lower.includes('third') || lower.includes('q3')) return 2
    if (lower.includes('4th') || lower.includes('fourth') || lower.includes('q4')) return 3
    return undefined
}

// Check if KPI is allocable (user can input values) or auto-filled
export const isKpiAllocable = (
    kpi?: { isTargetValueAllocable?: boolean },
    targets?: Array<ApiKpiTarget>
): boolean => {
    // Check KPI level first
    if (kpi?.isTargetValueAllocable === false) return false

    // Check any target has isTargetValueAllocable set
    if (targets?.some(t => t.isTargetValueAllocable === false || t.kpi?.isTargetValueAllocable === false)) {
        return false
    }

    return true
}

// Helper to get progress bar color based on allocation status
export const getProgressColor = (
    currentInput: number,
    remainingValue: number,
    progressPercentage: number
): string => {
    if (currentInput > remainingValue) return '[&>div]:bg-red-600' // Over-allocated
    if (progressPercentage >= 100) return '[&>div]:bg-amber-500' // Fully allocated
    return '[&>div]:bg-green-600' // Normal
}

// Helper to get text color for over-allocation
export const getOverAllocationTextColor = (
    currentInput: number,
    remainingValue: number
): string => {
    return currentInput > remainingValue ? 'text-red-600' : 'text-muted-foreground'
}
