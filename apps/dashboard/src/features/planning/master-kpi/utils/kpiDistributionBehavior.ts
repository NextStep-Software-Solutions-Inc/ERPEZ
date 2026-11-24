import { TargetDistributionBehavior } from '../types'

export const SELECTABLE_DISTRIBUTION_BEHAVIORS: TargetDistributionBehavior[] = [
  TargetDistributionBehavior.SUMMATION,
  TargetDistributionBehavior.UNIFORM_AVERAGE,
  TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE,
  TargetDistributionBehavior.MAXIMUM,
  TargetDistributionBehavior.MINIMUM,
]

const distributionBehaviorLabelMap: Record<TargetDistributionBehavior, string> =
  {
    [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]: 'Summation',
    [TargetDistributionBehavior.UNIFORM_AVERAGE]: 'Uniform',
    [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]: 'Milestone',
    [TargetDistributionBehavior.SUMMATION]: 'Summation',
    [TargetDistributionBehavior.MAXIMUM]: 'Maximum',
    [TargetDistributionBehavior.MINIMUM]: 'Minimum',
  }

export function getDistributionBehaviorLabel(
  behavior: TargetDistributionBehavior | string | null | undefined,
): string {
  return behavior
    ? distributionBehaviorLabelMap[behavior as TargetDistributionBehavior] ||
        String(behavior)
    : ''
}

