import { atom } from 'jotai'

/**
 * Sync Status Atom
 * Tracks the synchronization status and last sync timestamp
 */
export const syncStatusAtom = atom<{
  isSyncing: boolean
  lastSyncTimestamp: string | null
}>({
  isSyncing: false,
  lastSyncTimestamp: null,
})
