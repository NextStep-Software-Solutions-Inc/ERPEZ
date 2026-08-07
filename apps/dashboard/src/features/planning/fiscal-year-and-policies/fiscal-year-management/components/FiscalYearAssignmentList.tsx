import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { formatCurrency } from '@/lib/fiscal-year-and-policies/utils';
import type { FiscalYear, ProcurementMethod } from '@/lib/fiscal-year-and-policies/types';

interface FiscalYearAssignmentListProps {
  selectedMethod: ProcurementMethod | null;
  thresholdValue: number;
  assignedFiscalYears: FiscalYear[];
  unassignedCount: number;
  onAddClick: () => void;
  onRemove: (fiscalYearId: string) => void;
}

export function FiscalYearAssignmentList({
  selectedMethod,
  thresholdValue,
  assignedFiscalYears,
  unassignedCount,
  onAddClick,
  onRemove,
}: FiscalYearAssignmentListProps) {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmRemoveFY, setConfirmRemoveFY] = useState<FiscalYear | null>(null);

  const getStatusBadgeColor = (status: FiscalYear['status']) => {
    switch (status) {
      case 'Closed':
        return 'bg-red-100 text-red-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Setup':
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleRemoveClick = (fy: FiscalYear) => {
    setConfirmRemoveId(fy.id);
    setConfirmRemoveFY(fy);
  };

  const handleConfirmRemove = () => {
    if (confirmRemoveId) {
      onRemove(confirmRemoveId);
      setConfirmRemoveId(null);
      setConfirmRemoveFY(null);
    }
  };

  if (assignedFiscalYears.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Assigned Fiscal Years</CardTitle>
          <CardDescription>
            Fiscal years using this procurement method and threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <p className="text-center text-slate-500">
            No fiscal years assigned yet. Click the button below to get started.
          </p>
          <Button
            onClick={onAddClick}
            disabled={unassignedCount === 0}
            className="gap-2"
          >
            + Add to Fiscal Year(s)
          </Button>
          {unassignedCount === 0 && (
            <p className="text-xs text-slate-400 text-center">
              All fiscal years already assigned to this procurement method
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Assigned Fiscal Years</CardTitle>
            <CardDescription>
              Fiscal years using {selectedMethod?.name} with threshold {formatCurrency(thresholdValue)}
            </CardDescription>
          </div>
          <span className="text-2xl font-bold text-slate-400">
            {assignedFiscalYears.length}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table/List of Assigned FYs */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th
                      className="text-left px-4 py-3 font-semibold text-slate-900"
                      role="columnheader"
                    >
                      Fiscal Year
                    </th>
                    <th
                      className="text-left px-4 py-3 font-semibold text-slate-900"
                      role="columnheader"
                    >
                      Status
                    </th>
                    <th
                      className="text-right px-4 py-3 font-semibold text-slate-900"
                      role="columnheader"
                    >
                      Threshold Value
                    </th>
                    <th
                      className="text-center px-4 py-3 font-semibold text-slate-900"
                      role="columnheader"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignedFiscalYears.map((fy) => (
                    <tr
                      key={fy.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      role="row"
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium" role="cell">
                        FY{fy.year}
                      </td>
                      <td className="px-4 py-3" role="cell">
                        <Badge className={getStatusBadgeColor(fy.status)}>
                          {fy.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600" role="cell">
                        {formatCurrency(thresholdValue)}
                      </td>
                      <td className="px-4 py-3 text-center" role="cell">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveClick(fy)}
                          aria-label={`Remove FY${fy.year} from ${selectedMethod?.name || 'procurement method'}`}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add to Fiscal Year Button */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={onAddClick}
                disabled={unassignedCount === 0}
                variant="outline"
                className="gap-2"
              >
                + Add to Fiscal Year(s)
              </Button>
              {unassignedCount === 0 && (
                <p className="text-xs text-slate-400 flex items-center">
                  All fiscal years already assigned
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Remove */}
      <AlertDialog open={confirmRemoveId !== null} onOpenChange={(open) => {
        if (!open) {
          setConfirmRemoveId(null);
          setConfirmRemoveFY(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Fiscal Year Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove FY{confirmRemoveFY?.year} from {selectedMethod?.name}?
              <br />
              <span className="block text-sm text-slate-600 mt-2">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
