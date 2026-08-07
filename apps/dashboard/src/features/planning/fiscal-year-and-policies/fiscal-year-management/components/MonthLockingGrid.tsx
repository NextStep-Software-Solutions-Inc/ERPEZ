import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { FiscalMonth } from '@/lib/fiscal-year-and-policies/types';

interface MonthLockingGridProps {
  months: FiscalMonth[];
  fiscalYearStatus: 'Setup' | 'Planning' | 'Active' | 'Closed';
  onMonthLockToggle: (monthId: string) => void;
}

export function MonthLockingGrid({ months, fiscalYearStatus, onMonthLockToggle }: MonthLockingGridProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    monthId: string | null;
    monthName: string;
    isCurrentlyLocked: boolean;
  }>({
    isOpen: false,
    monthId: null,
    monthName: '',
    isCurrentlyLocked: false,
  });

  const isDisabled = fiscalYearStatus === 'Closed';

  const handleMonthLockClick = (month: FiscalMonth) => {
    if (isDisabled) {
      toast.error('Cannot modify locked months', {
        description: 'Fiscal year is closed. Month operations are disabled.',
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      monthId: month.id,
      monthName: month.name,
      isCurrentlyLocked: month.isLocked,
    });
  };

  const handleConfirmLockToggle = () => {
    if (confirmDialog.monthId === null) return;

    const { monthId, monthName, isCurrentlyLocked } = confirmDialog;
    const action = isCurrentlyLocked ? 'unlocked' : 'locked';
    const actionVerb = isCurrentlyLocked ? 'Unlocked' : 'Locked';

    // Execute the lock toggle
    onMonthLockToggle(monthId);

    // Close the dialog
    setConfirmDialog({
      isOpen: false,
      monthId: null,
      monthName: '',
      isCurrentlyLocked: false,
    });

    // Show success toast
    toast.success(`${actionVerb} ${monthName}`, {
      description: `${monthName} has been ${action}.`,
      duration: 3500,
    }); 
  };

  const handleCancelLockToggle = () => {
    setConfirmDialog({
      isOpen: false,
      monthId: null,
      monthName: '',
      isCurrentlyLocked: false,
    });
  };

  return (
    <>
      <Card className="mt-2 flex-col justify-center items-center">
        <CardHeader>
          <CardTitle className="text-base">Month Locking Control</CardTitle>
          <CardDescription>
            {isDisabled 
              ? 'This fiscal year is closed. Month operations are disabled.'
              : 'Lock or unlock individual months to control transaction entry'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {months.map((month) => (
              <div
                key={month.id}
                className={`flex items-center justify-between p-3 border rounded-lg gap-5 ${
                  isDisabled ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {month.isLocked ? (
                    <Lock className="h-4 w-4 text-destructive" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-medium">{month.name}</span>
                </div>
                <Switch
                  checked={month.isLocked}
                  onCheckedChange={() => handleMonthLockClick(month)}
                  disabled={isDisabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={handleCancelLockToggle}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.isCurrentlyLocked ? 'Unlock' : 'Lock'} Month
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.isCurrentlyLocked ? 'unlock' : 'lock'}{' '}
              <span className="font-semibold text-foreground">{confirmDialog.monthName}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {confirmDialog.isCurrentlyLocked
                ? 'This will allow entries to be made in this month again.'
                : 'This will prevent any entries from being made in this month.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLockToggle}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLockToggle}>
              {confirmDialog.isCurrentlyLocked ? 'Unlock' : 'Lock'} Month
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
