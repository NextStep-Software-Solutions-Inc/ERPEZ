import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { ProcurementPolicyConfigTable } from './ProcurementPolicyConfigTable';
import { ProcurementPolicyConfigCard } from './ProcurementPolicyConfigCard';
import type { ProcurementPolicyConfig, ProcurementMode, ProcurementModeThreshold } from '@/lib/fiscal-year-and-policies/types';

type ViewMode = 'table' | 'card';

interface ProcurementPolicyConfigViewProps {
  configs: ProcurementPolicyConfig[];
  modes: ProcurementMode[];
  thresholds: ProcurementModeThreshold[];
  isLoading?: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (config: ProcurementPolicyConfig) => void;
  onDelete: (config: ProcurementPolicyConfig) => void;
}

export function ProcurementPolicyConfigView({
  configs,
  modes,
  thresholds,
  isLoading,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ProcurementPolicyConfigViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const commonProps = {
    configs,
    modes,
    thresholds,
    isLoading,
    currentPage,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
          className="gap-2"
        >
          <LayoutList className="h-4 w-4" />
          Table
        </Button>
        <Button
          variant={viewMode === 'card' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('card')}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Card
        </Button>
      </div>

      {/* Render Selected View */}
      {viewMode === 'table' ? (
        <ProcurementPolicyConfigTable {...commonProps} />
      ) : (
        <ProcurementPolicyConfigCard {...commonProps} />
      )}
    </div>
  );
}
