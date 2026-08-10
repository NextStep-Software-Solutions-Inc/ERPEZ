import { atom } from 'jotai'

/**
 * Fiscal Year Context Atom
 * Global fiscal year selection that affects all UACS listings
 */
export const fiscalYearContextAtom = atom<number>(new Date().getFullYear())
