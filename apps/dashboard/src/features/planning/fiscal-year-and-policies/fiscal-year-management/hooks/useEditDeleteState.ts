import { useState } from 'react';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

/**
 * Hook for managing edit fiscal year state
 */
export function useEditFiscalYearState() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingFiscalYear, setEditingFiscalYear] = useState<FiscalYear | null>(null);
  const [year, setYear] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const initiateEdit = (fiscalYear: FiscalYear) => {
    setEditingFiscalYear(fiscalYear);
    setYear(fiscalYear.year);
    setDescription(fiscalYear.description || '');
    setError(null);
    setRetryCount(0);
    setDialogOpen(true);
  };

  const reset = () => {
    setEditingFiscalYear(null);
    setYear(0);
    setDescription('');
    setError(null);
    setLoading(false);
    setRetryCount(0);
  };

  const cancel = () => {
    reset();
    setDialogOpen(false);
  };

  const incrementRetry = () => {
    setRetryCount(count => count + 1);
  };

  return {
    isDialogOpen,
    setDialogOpen,
    editingFiscalYear,
    year,
    setYear,
    description,
    setDescription,
    error,
    setError,
    isLoading,
    setLoading,
    retryCount,
    incrementRetry,
    initiateEdit,
    reset,
    cancel,
  };
}

/**
 * Hook for managing delete fiscal year state
 */
export function useDeleteFiscalYearState() {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deletingFiscalYear, setDeletingFiscalYear] = useState<FiscalYear | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const initiateDelete = (fiscalYear: FiscalYear) => {
    setDeletingFiscalYear(fiscalYear);
    setError(null);
    setRetryCount(0);
    setConfirmOpen(true);
  };

  const reset = () => {
    setDeletingFiscalYear(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  };

  const cancel = () => {
    reset();
    setConfirmOpen(false);
  };

  const incrementRetry = () => {
    setRetryCount(count => count + 1);
  };

  return {
    isConfirmOpen,
    setConfirmOpen,
    deletingFiscalYear,
    error,
    setError,
    isLoading,
    setLoading,
    retryCount,
    incrementRetry,
    initiateDelete,
    reset,
    cancel,
  };
}
