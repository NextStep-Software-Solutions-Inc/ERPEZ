import { atom } from 'jotai'
import type { RuleType } from '../types/commonRuleTypes'

/**
 * Update Rule Dialog State Atom
 * Manages dialog open/close state for updating existing validation rules
 */
export const updateRuleDialogAtom = atom<{
  isOpen: boolean
  ruleType: RuleType | null
  id: string | null
}>({
  isOpen: false,
  ruleType: null,
  id: null,
})
