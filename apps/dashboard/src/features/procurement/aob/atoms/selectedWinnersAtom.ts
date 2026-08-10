/**
 * Selected Winners Atom
 * Tracks selected winners per line item in the bid matrix
 * Used to prevent accidental submissions without winner selection
 */

import { atom } from 'jotai'

export interface SelectedWinner {
  lineItemId: string
  winningSupplierId: string
  supplierName: string
}

export const selectedWinnersAtom = atom<SelectedWinner[]>([])
