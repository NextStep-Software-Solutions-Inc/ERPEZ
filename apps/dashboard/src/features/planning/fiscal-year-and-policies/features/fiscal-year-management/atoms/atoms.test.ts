/**
 * Unit tests for Fiscal Year Management atoms
 * Using Vitest + Jotai testing patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAtomValue, useSetAtom } from 'jotai';
import { renderHook, act } from '@testing-library/react';
import {
  fiscalYearDialogAtom,
  editingFiscalYearIdAtom,
  fiscalYearFormAtom,
  fiscalYearTableAtom,
  resetFiscalYearDialogAtom,
  resetFiscalYearFormAtom,
  resetFiscalYearTableAtom,
  cleanupFiscalYearAtomsAtom,
} from './index';

// ============================================
// Dialog Atom Tests
// ============================================

describe('Fiscal Year Dialog Atoms', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize dialog as closed', () => {
    const { result } = renderHook(() => useAtomValue(fiscalYearDialogAtom));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.mode).toBe('create');
  });

  it('should toggle dialog open state', () => {
    const { result } = renderHook(() => {
      const dialog = useAtomValue(fiscalYearDialogAtom);
      const setDialog = useSetAtom(fiscalYearDialogAtom);
      return { dialog, setDialog };
    });

    expect(result.current.dialog.isOpen).toBe(false);

    act(() => {
      result.current.setDialog({ isOpen: true, mode: 'create' });
    });

    expect(result.current.dialog.isOpen).toBe(true);
  });

  it('should change dialog mode', () => {
    const { result } = renderHook(() => {
      const dialog = useAtomValue(fiscalYearDialogAtom);
      const setDialog = useSetAtom(fiscalYearDialogAtom);
      return { dialog, setDialog };
    });

    act(() => {
      result.current.setDialog({ isOpen: true, mode: 'edit' });
    });

    expect(result.current.dialog.mode).toBe('edit');
  });
});

// ============================================
// Editing ID Atom Tests
// ============================================

describe('Editing Fiscal Year ID Atom', () => {
  it('should initialize as null (create mode)', () => {
    const { result } = renderHook(() => useAtomValue(editingFiscalYearIdAtom));
    expect(result.current).toBe(null);
  });

  it('should set and update editing ID', () => {
    const { result } = renderHook(() => {
      const id = useAtomValue(editingFiscalYearIdAtom);
      const setId = useSetAtom(editingFiscalYearIdAtom);
      return { id, setId };
    });

    act(() => {
      result.current.setId('fy-2024');
    });

    expect(result.current.id).toBe('fy-2024');
  });

  it('should reset to null', () => {
    const { result } = renderHook(() => {
      const id = useAtomValue(editingFiscalYearIdAtom);
      const setId = useSetAtom(editingFiscalYearIdAtom);
      return { id, setId };
    });

    act(() => {
      result.current.setId('fy-2024');
    });

    expect(result.current.id).toBe('fy-2024');

    act(() => {
      result.current.setId(null);
    });

    expect(result.current.id).toBe(null);
  });
});

// ============================================
// Form Atom Tests
// ============================================

describe('Fiscal Year Form Atom (with localStorage)', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAtomValue(fiscalYearFormAtom));

    expect(result.current.yearNumber).toBe(new Date().getFullYear());
    expect(result.current.description).toBe('');
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
  });

  it('should update form values', () => {
    const { result } = renderHook(() => {
      const form = useAtomValue(fiscalYearFormAtom);
      const setForm = useSetAtom(fiscalYearFormAtom);
      return { form, setForm };
    });

    const newValues = {
      yearNumber: 2025,
      description: 'Test FY',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    act(() => {
      result.current.setForm(newValues);
    });

    expect(result.current.form).toEqual(newValues);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => {
      const form = useAtomValue(fiscalYearFormAtom);
      const setForm = useSetAtom(fiscalYearFormAtom);
      return { form, setForm };
    });

    const newValues = {
      yearNumber: 2026,
      description: 'Persistent FY',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };

    act(() => {
      result.current.setForm(newValues);
    });

    const stored = localStorage.getItem('fy_management_form');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual(newValues);
  });
});

// ============================================
// Table State Atom Tests
// ============================================

describe('Fiscal Year Table State Atom', () => {
  it('should initialize with default table state', () => {
    const { result } = renderHook(() => useAtomValue(fiscalYearTableAtom));

    expect(result.current.activeSort).toEqual({
      field: 'yearNumber',
      direction: 'desc',
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.filters.status).toBe(null);
    expect(result.current.filters.searchTerm).toBe('');
  });

  it('should update sort state', () => {
    const { result } = renderHook(() => {
      const table = useAtomValue(fiscalYearTableAtom);
      const setTable = useSetAtom(fiscalYearTableAtom);
      return { table, setTable };
    });

    act(() => {
      result.current.setTable({
        ...result.current.table,
        activeSort: { field: 'startDate', direction: 'asc' },
      });
    });

    expect(result.current.table.activeSort).toEqual({
      field: 'startDate',
      direction: 'asc',
    });
  });

  it('should update pagination state', () => {
    const { result } = renderHook(() => {
      const table = useAtomValue(fiscalYearTableAtom);
      const setTable = useSetAtom(fiscalYearTableAtom);
      return { table, setTable };
    });

    act(() => {
      result.current.setTable({
        ...result.current.table,
        currentPage: 2,
        pageSize: 25,
      });
    });

    expect(result.current.table.currentPage).toBe(2);
    expect(result.current.table.pageSize).toBe(25);
  });

  it('should update filters', () => {
    const { result } = renderHook(() => {
      const table = useAtomValue(fiscalYearTableAtom);
      const setTable = useSetAtom(fiscalYearTableAtom);
      return { table, setTable };
    });

    act(() => {
      result.current.setTable({
        ...result.current.table,
        filters: { status: 'active', searchTerm: 'FY' },
      });
    });

    expect(result.current.table.filters.status).toBe('active');
    expect(result.current.table.filters.searchTerm).toBe('FY');
  });
});

// ============================================
// Reset Action Tests
// ============================================

describe('Reset Action Atoms', () => {
  it('should reset dialog to initial state', () => {
    const { result: dialogResult } = renderHook(() => ({
      dialog: useAtomValue(fiscalYearDialogAtom),
      setDialog: useSetAtom(fiscalYearDialogAtom),
      reset: useSetAtom(resetFiscalYearDialogAtom),
    }));

    act(() => {
      dialogResult.current.setDialog({ isOpen: true, mode: 'edit' });
    });

    expect(dialogResult.current.dialog.isOpen).toBe(true);

    act(() => {
      dialogResult.current.reset();
    });

    expect(dialogResult.current.dialog.isOpen).toBe(false);
    expect(dialogResult.current.dialog.mode).toBe('create');
  });

  it('should reset form to default values', () => {
    const { result } = renderHook(() => ({
      form: useAtomValue(fiscalYearFormAtom),
      setForm: useSetAtom(fiscalYearFormAtom),
      reset: useSetAtom(resetFiscalYearFormAtom),
    }));

    act(() => {
      result.current.setForm({
        yearNumber: 2025,
        description: 'Test',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
    });

    expect(result.current.form.yearNumber).toBe(2025);

    act(() => {
      result.current.reset();
    });

    expect(result.current.form.yearNumber).toBe(new Date().getFullYear());
    expect(result.current.form.description).toBe('');
  });

  it('should clean up all atoms on cleanup', () => {
    const { result } = renderHook(() => ({
      dialog: useAtomValue(fiscalYearDialogAtom),
      table: useAtomValue(fiscalYearTableAtom),
      cleanup: useSetAtom(cleanupFiscalYearAtomsAtom),
    }));

    // Set some state
    const { result: setResult } = renderHook(() => ({
      setDialog: useSetAtom(fiscalYearDialogAtom),
      setTable: useSetAtom(fiscalYearTableAtom),
    }));

    act(() => {
      setResult.current.setDialog({ isOpen: true, mode: 'edit' });
      setResult.current.setTable({
        ...result.current.table,
        currentPage: 5,
      });
    });

    // Run cleanup
    act(() => {
      result.current.cleanup();
    });

    // Verify reset
    expect(result.current.dialog.isOpen).toBe(false);
    expect(result.current.table.currentPage).toBe(1);
  });
});
