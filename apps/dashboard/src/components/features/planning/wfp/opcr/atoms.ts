import { atom } from 'jotai'

export const createOPCRDialogAtom = atom({
  isOpen: false,
  selectedId: null as string | null,
})

export const updateOPCRDialogAtom = atom({
  isOpen: false,
  selectedId: null as string | null,
})

export const deleteOPCRDialogAtom = atom({
  isOpen: false,
  selectedId: null as string | null,
})
