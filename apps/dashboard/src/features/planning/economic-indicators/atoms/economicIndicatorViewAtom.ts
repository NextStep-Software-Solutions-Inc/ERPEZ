import { atomWithStorage } from 'jotai/utils'

export type EconomicIndicatorViewType = 'card' | 'table'

export const economicIndicatorViewAtom =
  atomWithStorage<EconomicIndicatorViewType>('economic-indicators-view', 'card')
