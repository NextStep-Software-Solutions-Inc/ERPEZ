import type { ModeOfProcurement } from './types'

export const hasThresholdConfiguration = (mode: ModeOfProcurement) =>
  (mode.minThreshold ?? 0) > 0 ||
  (mode.maxThreshold !== null && mode.maxThreshold !== undefined)

export default hasThresholdConfiguration
