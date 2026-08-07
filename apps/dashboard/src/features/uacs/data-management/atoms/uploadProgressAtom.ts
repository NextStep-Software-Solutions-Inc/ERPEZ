import { atom } from 'jotai'

/**
 * Upload Progress Atom
 * For tracking file upload progress (0-100)
 */
export const uploadProgressAtom = atom<number>(0)
