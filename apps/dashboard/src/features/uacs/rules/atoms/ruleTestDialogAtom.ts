import { atom } from 'jotai'

/**
 * Rule Test Dialog Atom
 * Manages the rule testing interface
 */
export const ruleTestDialogAtom = atom<{
  isOpen: boolean
  ruleId: string | null
}>({
  isOpen: false,
  ruleId: null,
})
