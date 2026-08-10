import { useState } from 'react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

/**
 * Initial LIB data (imported from constants in main component)
 */
export interface UseLibStateReturn {
  // Data
  libs: LIB[]

  // Dialogs
  showLibWizard: boolean
  viewDialogOpen: boolean
  viewingLib: LIB | null
  editingLib: LIB | null

  // Setters
  setLibs: (libs: LIB[]) => void
  setShowLibWizard: (show: boolean) => void
  setViewDialogOpen: (open: boolean) => void
  setViewingLib: (lib: LIB | null) => void
  setEditingLib: (lib: LIB | null) => void

  // Handlers
  addLib: (lib: LIB) => void
  updateLib: (lib: LIB) => void
  deleteLib: (libId: string) => void
  deleteMultiple: (libIds: Set<string>) => void
}

/**
 * Custom hook for managing LIB data and CRUD operations
 */
export const useLibState = (initialLibs?: LIB[]): UseLibStateReturn => {
  const [libs, setLibs] = useState<LIB[]>(initialLibs || [])
  const [showLibWizard, setShowLibWizard] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingLib, setViewingLib] = useState<LIB | null>(null)
  const [editingLib, setEditingLib] = useState<LIB | null>(null)

  const addLib = (lib: LIB) => {
    setLibs((prev) => [...prev, lib])
  }

  const updateLib = (libId: string, lib: LIB) => {
    setLibs((prev) => prev.map((l) => (l.id === libId ? lib : l)))
  }

  const deleteLib = (libId: string) => {
    setLibs((prev) => prev.filter((l) => l.id !== libId))
  }

  const deleteMultiple = (libIds: Set<string>) => {
    setLibs((prev) => prev.filter((l) => !libIds.has(l.id)))
  }

  return {
    libs,
    showLibWizard,
    viewDialogOpen,
    viewingLib,
    editingLib,
    setLibs,
    setShowLibWizard,
    setViewDialogOpen,
    setViewingLib,
    setEditingLib,
    addLib,
    // updateLib,
    updateLib: (lib: LIB) => updateLib(lib.id, lib),
    deleteLib,
    deleteMultiple,
  }
}
