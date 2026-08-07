/**
 * Jotai atoms for Fiscal Year Management feature
 * Handles global state for dialogs, forms, and table UI
 */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { CreateFiscalYearPayload } from '@/lib/fiscal-year-and-policies/shared';

// ============================================
// DIALOG STATE (ephemeral - session only)
// ============================================

interface FiscalYearDialogState {
  isOpen: boolean;
  mode: 'create' | 'edit';
}

export const fiscalYearDialogAtom = atom<FiscalYearDialogState>({
  isOpen: false,
  mode: 'create',
});

/**
 * ID of the fiscal year being edited (null = create mode)
 */
export const editingFiscalYearIdAtom = atom<string | null>(null);

// ============================================
// FORM STATE (persisted to localStorage)
// ============================================

const defaultFormValues: CreateFiscalYearPayload = {
  yearNumber: new Date().getFullYear(),
  description: '',
  startDate: '',
  endDate: '',
};

/**
 * Form values with localStorage persistence
 * Survives page reloads within the same session
 */
export const fiscalYearFormAtom = atomWithStorage<CreateFiscalYearPayload>(
  'fy_management_form',
  defaultFormValues,
  {
    getItem: (key) => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultFormValues;
      } catch {
        return defaultFormValues;
      }
    },
    setItem: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  }
);

// ============================================
// TABLE STATE (ephemeral - session only)
// ============================================

interface FiscalYearTableState {
  activeSort: {
    field: 'yearNumber' | 'startDate' | 'status';
    direction: 'asc' | 'desc';
  };
  currentPage: number;
  pageSize: number;
  filters: {
    status: string | null;
    searchTerm: string;
  };
}

const defaultTableState: FiscalYearTableState = {
  activeSort: { field: 'yearNumber', direction: 'desc' },
  currentPage: 1,
  pageSize: 10,
  filters: {
    status: null,
    searchTerm: '',
  },
};

export const fiscalYearTableAtom = atom<FiscalYearTableState>(defaultTableState);

// ============================================
// RESET ATOMS (action triggers)
// ============================================

/**
 * Reset dialog to closed state
 * Use: const resetDialog = useSetAtom(resetFiscalYearDialogAtom); resetDialog();
 */
export const resetFiscalYearDialogAtom = atom(
  null,
  (_get, set) => {
    set(fiscalYearDialogAtom, { isOpen: false, mode: 'create' });
    set(editingFiscalYearIdAtom, null);
  }
);

/**
 * Reset form to default values
 * Use: const resetForm = useSetAtom(resetFiscalYearFormAtom); resetForm();
 */
export const resetFiscalYearFormAtom = atom(
  null,
  (_get, set) => {
    set(fiscalYearFormAtom, defaultFormValues);
  }
);

/**
 * Reset table state to defaults
 * Use: const resetTable = useSetAtom(resetFiscalYearTableAtom); resetTable();
 */
export const resetFiscalYearTableAtom = atom(
  null,
  (_get, set) => {
    set(fiscalYearTableAtom, defaultTableState);
  }
);

/**
 * Clear all fiscal year management atoms
 * Use on page unmount to clean up state
 */
export const cleanupFiscalYearAtomsAtom = atom(
  null,
  (_get, set) => {
    set(fiscalYearDialogAtom, { isOpen: false, mode: 'create' });
    set(editingFiscalYearIdAtom, null);
    set(fiscalYearFormAtom, defaultFormValues);
    set(fiscalYearTableAtom, defaultTableState);
  }
);
