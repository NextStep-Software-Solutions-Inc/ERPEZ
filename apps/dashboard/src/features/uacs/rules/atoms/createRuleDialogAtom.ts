import { atom } from 'jotai'
import type { RuleType } from '../types/commonRuleTypes'

/**
 * Create Rule Dialog State Atom
 * Manages dialog open/close state for creating new validation rules
 */
export const createRuleDialogAtom = atom<{
  isOpen: boolean
  ruleType: RuleType | null
}>({
  isOpen: false,
  ruleType: null,
})
