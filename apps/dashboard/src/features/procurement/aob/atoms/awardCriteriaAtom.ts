/**
 * Award Criteria Selection Atom
 * Tracks the selected award criterion (LCRB, MEARB, MARB)
 * Used to dynamically render columns in bid matrix
 */

import { atom } from 'jotai'
import type { AwardCriterion } from '../types/aobTypes'

export const awardCriteriaAtom = atom<AwardCriterion | null>(null)
