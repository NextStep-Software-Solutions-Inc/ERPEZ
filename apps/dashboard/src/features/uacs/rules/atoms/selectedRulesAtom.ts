import { atom } from 'jotai'

/**
 * Selected Rules Atom
 * For batch operations on validation rules
 */
export const selectedRulesAtom = atom<string[]>([])
