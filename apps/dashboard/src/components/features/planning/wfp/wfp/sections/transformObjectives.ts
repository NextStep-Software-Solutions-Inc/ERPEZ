import type { WFPObjective } from '@/components/features/planning/wfp/wfp-objective/table/types'

interface WFPObjectiveData {
  id: string
  description: string
  outcome: string
  weight: number
  wfp?: { activityName?: string }
  wfpObjectiveTargets?: Array<{
    id: string
    activityName: string
    wfpObjectiveTimelines?: Array<{ id: string; month: string }>
  }>
}

/**
 * Transforms API WFPObjectiveData into WFPObjective format for table rendering
 */
export function transformWFPObjectives(
  objectives: WFPObjectiveData[] | undefined,
  wfpId: string
): WFPObjective[] {
  return (objectives || []).map((obj: WFPObjectiveData) => ({
    id: obj.id,
    wfpId,
    description: obj.description,
    weight: obj.weight,
    outcome: obj.outcome,
    wfpObjectiveTargets: (obj.wfpObjectiveTargets || []).map(target => ({
      id: target.id,
      activityName: target.activityName,
      weight: 0,
      indicator: '',
      timelineType: 'Monthly' as const,
      wfpObjective: {
        id: obj.id,
        description: obj.description,
        weight: obj.weight,
        outcome: obj.outcome,
        deliveryUnitId: '',
      },
      wfpObjectiveTargetExpenditures: [],
      wfpObjectiveTimelines: (target.wfpObjectiveTimelines || []).map(timeline => ({
        id: timeline.id,
        startDate: timeline.month,
        endDate: timeline.month,
        targetValue: 0,
        timelineType: 'Monthly',
      })),
    })),
    wfp: {
      id: obj.id,
      activityName: obj.wfp?.activityName || obj.description,
      indicator: '',
      weight: obj.weight,
      deliveryUnit: { id: '' },
      activityBudgetRequirement: [],
      wfpObjectiveTimelines: [],
    },
  }))
}
