'use client';

import { X, Maximize2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface RolloverProgressToastProps {
  isVisible: boolean;
  progress: number;
  sourceYearName: string;
  targetYearName: string;
  isRollingOver: boolean;
  onMaximize: () => void;
  onDismissWithConfirmation: () => void;
}

export default function RolloverProgressToast({
  isVisible,
  progress,
  sourceYearName,
  targetYearName,
  isRollingOver,
  onMaximize,
  onDismissWithConfirmation,
}: RolloverProgressToastProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isVisible) {
    return null;
  }

  const handleCloseClick = () => {
    if (isRollingOver) {
      setShowConfirmation(true);
    } else {
      onDismissWithConfirmation();
    }
  };

  return (
    <>
      {/* Toast Container - Fixed position, bottom-right */}
      <div className="fixed bottom-6 right-6 z-900 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden">
          {/* Toast Content */}
          <div className="p-4 space-y-3">
            {/* Header with title and close button */}
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h3 className="text-sm font-semibold text-foreground">Rollover in Progress</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  FY {sourceYearName} → FY {targetYearName}
                </p>
              </div>
              <button
                onClick={handleCloseClick}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close rollover progress toast"
                title={isRollingOver ? 'Close (confirmation required)' : 'Close'}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Processing...</span>
                </div>
                <span className="text-xs font-medium text-foreground">{progress}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onMaximize}
                className="flex-1 text-xs"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                View Progress
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog - Close toast while rolling over? */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close progress tracking?</AlertDialogTitle>
            <AlertDialogDescription>
              Rollover is still in progress. The process will continue in the background. Are you sure you want to close this toast?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmation(false);
                onDismissWithConfirmation();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Close Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
