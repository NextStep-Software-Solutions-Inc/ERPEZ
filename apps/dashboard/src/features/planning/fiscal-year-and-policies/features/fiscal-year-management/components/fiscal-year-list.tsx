/**
 * Fiscal Year Management - Main Container
 * Orchestrates list, dialog, and form components
 */

import { useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { FiscalYearDialog } from '../dialogs/fiscal-year-dialog';
import { FiscalYearTable } from '../../tables/fiscal-year-table';
import {
  fiscalYearDialogAtom,
  editingFiscalYearIdAtom,
  fiscalYearTableAtom,
  cleanupFiscalYearAtomsAtom,
} from '../atoms';
import { mockFiscalYears, type FiscalYear } from '@/lib/fiscal-year-and-policies/shared';

export function FiscalYearList() {
  const setDialog = useSetAtom(fiscalYearDialogAtom);
  const setEditingId = useSetAtom(editingFiscalYearIdAtom);
  const tableState = useAtomValue(fiscalYearTableAtom);
  const cleanup = useSetAtom(cleanupFiscalYearAtomsAtom);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // TODO: Replace mockFiscalYears with useFiscalYears hook
  const fiscalYears = mockFiscalYears;

  // Filter data based on search term and status
  const filteredData = useMemo(() => {
    let filtered = fiscalYears;

    if (tableState.filters.searchTerm) {
      filtered = filtered.filter(
        (fy) =>
          fy.yearNumber.toString().includes(tableState.filters.searchTerm) ||
          fy.description?.toLowerCase().includes(tableState.filters.searchTerm.toLowerCase())
      );
    }

    if (tableState.filters.status) {
      filtered = filtered.filter((fy) => fy.status === tableState.filters.status);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const field = tableState.activeSort.field;
      const direction = tableState.activeSort.direction === 'asc' ? 1 : -1;

      if (field === 'yearNumber') {
        return (a.yearNumber - b.yearNumber) * direction;
      }
      if (field === 'startDate') {
        return (
          (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) *
          direction
        );
      }
      return 0;
    });

    return sorted;
  }, [fiscalYears, tableState]);

  const handleCreate = () => {
    setEditingId(null);
    setDialog({ isOpen: true, mode: 'create' });
  };

  const handleEdit = (fiscalYear: FiscalYear) => {
    setEditingId(fiscalYear.id);
    setDialog({ isOpen: true, mode: 'edit' });
  };

  const handleDelete = async (fiscalYear: FiscalYear) => {
    // TODO: Add confirmation dialog and mutation
    console.log('Delete:', fiscalYear.id);
  };

  const handleSuccess = () => {
    // Refresh list - TODO: Invalidate React Query
    console.log('Fiscal year saved');
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fiscal Years</CardTitle>
              <CardDescription>Manage fiscal years and their configurations</CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4" />
              New Fiscal Year
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by year or description..."
              className="pl-8"
              onChange={(e) => {
                // TODO: Update atom with debounce
              }}
            />
          </div>

          {/* Table */}
          <FiscalYearTable
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalItems={filteredData.length}
            pageSize={tableState.pageSize}
            currentPage={tableState.currentPage}
          />
        </CardContent>
      </Card>

      {/* Dialog & Form */}
      <FiscalYearDialog onSuccess={handleSuccess} />
    </>
  );
}
