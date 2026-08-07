import { useMemo, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProcurementMethodListItem } from './ProcurementMethodListItem';
import FiscalYearSelector from './sections/FiscalYearSelector';
import type { ProcurementMethodThreshold, FiscalYear } from '@/lib/fiscal-year-and-policies/types';

export function ProcurementMethodsList() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<FiscalYear | null>(null);
  const [procurementThresholds, setProcurementThresholds] = useState<ProcurementMethodThreshold[]>([]);
  const [paginationState, setPaginationState] = useState({ pageSize: 10, currentPage: 1, totalPages: 1 });
  const [fiscalYears] = useState<FiscalYear[]>([]);
  const [procurementMethods] = useState<any[]>([]);

  // Initialize selected fiscal year to active if not set
  useEffect(() => {
    if (!selectedFiscalYear && fiscalYears.length > 0) {
      setSelectedFiscalYear(fiscalYears[0]);
    }
  }, [selectedFiscalYear, fiscalYears]);

  // Get current thresholds (always use saved, no draft mode)
  const currentThresholds = procurementThresholds;

  // Filter methods
  const filteredMethods = useMemo(() => {
    if (!selectedFiscalYear) return [];
    return procurementMethods;
  }, [selectedFiscalYear, procurementMethods]);

  // Pagination
  const totalPages = Math.ceil(filteredMethods.length / paginationState.pageSize);
  const paginatedMethods = useMemo(() => {
    const start = (paginationState.currentPage - 1) * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return filteredMethods.slice(start, end);
  }, [filteredMethods, paginationState.currentPage, paginationState.pageSize]);

  // Keep pagination state's totalPages in sync after render
  useEffect(() => {
    setPaginationState((prev) => {
      if (prev.totalPages === totalPages) {
        return prev;
      }
      return { ...prev, totalPages, currentPage: 1 };
    });
  }, [totalPages]);

  const handleThresholdChange = (updatedThreshold: ProcurementMethodThreshold) => {
    // Always directly update saved thresholds (individual inline save)
    const existingIndex = procurementThresholds.findIndex((t) =>
      t.procurementMethodId === updatedThreshold.procurementMethodId &&
      t.fiscalYearId === updatedThreshold.fiscalYearId
    );

    let newThresholds;
    if (existingIndex >= 0) {
      // Update existing threshold
      newThresholds = procurementThresholds.map((t, index) =>
        index === existingIndex ? updatedThreshold : t
      );
    } else {
      // Add new threshold
      newThresholds = [...procurementThresholds, updatedThreshold];
    }

    setProcurementThresholds(newThresholds);
  };

  const handlePreviousPage = () => {
    setPaginationState((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  };

  const handleNextPage = () => {
    setPaginationState((prev) => ({
      ...prev,
      currentPage: Math.min(totalPages, prev.currentPage + 1),
    }));
  };

  if (!selectedFiscalYear) {
    return (
      <div className="flex items-center justify-center min-h-96 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground font-medium">No Fiscal Year Selected</p>
          <p className="text-xs text-muted-foreground">Please select a fiscal year to view procurement methods.</p>
        </div>
      </div>
    );
  }

  if (filteredMethods.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground font-medium">No Procurement Methods Found</p>
          <p className="text-xs text-muted-foreground">No methods available for the selected fiscal year.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fiscal Year Selector */}
      <FiscalYearSelector
        fiscalYears={fiscalYears}
        selectedFiscalYearId={selectedFiscalYear?.id || null}
        onSelect={(fiscalYearId) => {
          const fy = fiscalYears.find(f => f.id === fiscalYearId);
          setSelectedFiscalYear(fy || null);
        }}
      />

      {/* Methods List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {paginatedMethods.map((method) => {
          const threshold = currentThresholds.find(
            (t) => t.procurementMethodId === method.id && t.fiscalYearId === selectedFiscalYear.id
          );

          // Create default threshold if none exists
          const defaultThreshold: ProcurementMethodThreshold = {
            procurementMethodId: method.id,
            fiscalYearId: selectedFiscalYear.id,
            min: null,
            max: null,
            isConfigured: false,
            isInherited: false,
          };

          const thresholdToUse = threshold || defaultThreshold;

          return (
            <ProcurementMethodListItem
              key={method.id}
              method={method}
              threshold={thresholdToUse}
              onThresholdChange={handleThresholdChange}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground font-medium">
            Page <span className="text-foreground font-semibold">{paginationState.currentPage}</span> of <span className="text-foreground font-semibold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={paginationState.currentPage <= 1}
              color="default"
              aria-label="Previous page"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={paginationState.currentPage >= totalPages}
              color="default"
              aria-label="Next page"
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
