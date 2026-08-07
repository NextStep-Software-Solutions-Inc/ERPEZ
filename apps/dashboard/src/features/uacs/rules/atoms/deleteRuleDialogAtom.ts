import { atom } from 'jotai'
import type { RuleType } from '../types/commonRuleTypes'

/**
 * Delete Rule Dialog State Atom
 * Manages dialog open/close state for deleting validation rules
 */
export const deleteRuleDialogAtom = atom<{
  isOpen: boolean
  ruleType: RuleType | null
  id: string | null
}>({
  isOpen: false,
  ruleType: null,
  id: null,
})
