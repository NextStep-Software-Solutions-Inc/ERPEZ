import { TargetDistributionBehavior } from '../types'

const distributionBehaviorLabelMap: Record<TargetDistributionBehavior, string> =
  {
    [TargetDistributionBehavior.DIVISIBLE_SUMMATIVE]: 'Divisible',
    [TargetDistributionBehavior.UNIFORM_AVERAGE]: 'Uniform',
    [TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE]: 'Milestone',
    [TargetDistributionBehavior.SUMMATION]: 'Summation',
    [TargetDistributionBehavior.MAXIMUM]: 'Maximum',
    [TargetDistributionBehavior.MINIMUM]: 'Minimum',
  }

export function getDistributionBehaviorLabel(
  behavior: TargetDistributionBehavior | null | undefined,
): string {
  return behavior ? distributionBehaviorLabelMap[behavior] : ''
}
