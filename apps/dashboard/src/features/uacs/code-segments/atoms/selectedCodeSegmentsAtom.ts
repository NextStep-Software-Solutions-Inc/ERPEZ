import { atom } from 'jotai'

/**
 * Selected Code Segments Atom
 * For batch operations (e.g., bulk activate/deactivate)
 */
export const selectedCodeSegmentsAtom = atom<string[]>([])
