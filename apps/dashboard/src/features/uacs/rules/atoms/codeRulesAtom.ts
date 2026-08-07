import { atom } from 'jotai'
import type { CodeCombinationRule } from '../types/codeCombinationRuleTypes'
import { mockCodeCombinationRules } from '../../utils/mockData'

/**
 * Rule Builder State Atoms
 */

export const codeRulesAtom = atom<CodeCombinationRule[]>(mockCodeCombinationRules)

export const ruleBuilderDialogOpenAtom = atom<boolean>(false)

export const selectedRuleAtom = atom<CodeCombinationRule | undefined>(undefined)

export const ruleBuilderLoadingAtom = atom<boolean>(false)

export const ruleValidationErrorsAtom = atom<string[]>([])
