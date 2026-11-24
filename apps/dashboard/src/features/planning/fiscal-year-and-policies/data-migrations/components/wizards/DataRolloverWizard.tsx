'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Database, ChevronLeft, ChevronRight, Loader2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { FiscalYear, DataRolloverOptions } from '@/lib/fiscal-year-and-policies/types';
import { toast } from 'sonner';
import { useQueryClient } from 'erpez-shared-lib';
import { useRolloverFiscalYear } from '@/lib/fiscal-year-and-policies/requests/hooks/useRolloverFiscalYear';
import RolloverStep1 from './steps/RolloverStep1';
import RolloverStep2 from './steps/RolloverStep2';
import RolloverStep3 from './steps/RolloverStep3';
import RolloverProgressToast from './RolloverProgressToast';
import RolloverCompletionModal from './RolloverCompletionModal';

// Validation schema
const rolloverSchema = z.object({
  sourceYearId: z.string().min(1, 'Please select a source fiscal year'),
  targetYearId: z.string().min(1, 'Please select a target fiscal year'),
  copyOrgStructure: z.boolean().default(true),
  copyUACSLibrary: z.boolean().default(true),
  copyRecurringExpenses: z.boolean().default(false),
}).refine(
  (data) => data.sourceYearId !== data.targetYearId,
  {
    message: "Source and target years must be different",
    path: ["targetYearId"],
  }
).refine(
  (data) => data.copyOrgStructure || data.copyUACSLibrary || data.copyRecurringExpenses,
  {
    message: "Please select at least one option to copy",
    path: ["copyOrgStructure"],
  }
);

type RolloverFormData = z.infer<typeof rolloverSchema>;

interface DataRolloverWizardProps {
  fiscalYears: FiscalYear[];
  onRolloverComplete?: (sourceId: string, targetId: string, options: DataRolloverOptions) => Promise<void>;
}

interface ValidationErrors {
  sourceYearId?: string;
  targetYearId?: string;
  copyOrgStructure?: string;
}

export default function DataRolloverWizard({ fiscalYears, onRolloverComplete }: DataRolloverWizardProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: executeRollover } = useRolloverFiscalYear();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isRollingOver, setIsRollingOver] = useState(false);
  const [rolloverProgress, setRolloverProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toastDismissedButRollingOver, setToastDismissedButRollingOver] = useState(false);

  const [formData, setFormData] = useState<RolloverFormData>({
    sourceYearId: '',
    targetYearId: '',
    copyOrgStructure: true,
    copyUACSLibrary: true,
    copyRecurringExpenses: false,
  });

  // Effect: Show completion modal when rollover finishes
  useEffect(() => {
    if (rolloverProgress === 100 && !isRollingOver) {
      setShowCompletionModal(true);
      // Hide toast if it was visible
      setIsMinimized(false);
      setToastDismissedButRollingOver(false);
    }
  }, [rolloverProgress, isRollingOver]);

  const validateStep = (step: number): boolean => {
    const errors: ValidationErrors = {};

    if (step === 1) {
      if (!formData.sourceYearId) {
        errors.sourceYearId = 'Please select a source fiscal year';
      }
      if (!formData.targetYearId) {
        errors.targetYearId = 'Please select a target fiscal year';
      }
      if (formData.sourceYearId && formData.targetYearId && formData.sourceYearId === formData.targetYearId) {
        errors.targetYearId = 'Source and target years must be different';
      }
    } else if (step === 2) {
      if (!formData.copyOrgStructure && !formData.copyUACSLibrary && !formData.copyRecurringExpenses) {
        errors.copyOrgStructure = 'Please select at least one option to copy';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsDialogOpen(false);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setIsDialogOpen(true);
    setToastDismissedButRollingOver(false);
  };

  const handleToastDismiss = () => {
    setToastDismissedButRollingOver(true);
    // Toast is hidden, but rollover continues in background
  };

  const handleCompletionModalClose = () => {
    // Reset everything when user confirms completion
    setShowCompletionModal(false);
    setIsDialogOpen(false);
    setCurrentStep(1);
    setRolloverProgress(0);
    setIsMinimized(false);
    setToastDismissedButRollingOver(false);
    setFormData({
      sourceYearId: '',
      targetYearId: '',
      copyOrgStructure: true,
      copyUACSLibrary: true,
      copyRecurringExpenses: false,
    });
    setValidationErrors({});
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      // Opening dialog
      setIsDialogOpen(true);
    } else {
      // Dialog closing - if rollover is active, minimize instead
      if (isRollingOver) {
        handleMinimize();
      } else {
        setIsDialogOpen(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsRollingOver(true);
    setRolloverProgress(20);
    setIsMinimized(false);
    setToastDismissedButRollingOver(false);

    try {
      setRolloverProgress(40);
      const response = await executeRollover({
        pathParams: { id: formData.targetYearId },
        payload: {
          sourceFiscalYearId: formData.sourceYearId,
          includeOrgStructure: formData.copyOrgStructure,
          includeUACSLibrary: formData.copyUACSLibrary,
          includeRecurringExpenses: formData.copyRecurringExpenses,
        },
      });

      setRolloverProgress(85);

      // Invalidate relevant queries so data refresh happens across views
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return (
            typeof key === 'string' &&
            (key.startsWith('/fiscal-years') ||
              key.startsWith('/fund-sources') ||
              key.startsWith('/uacs') ||
              key.startsWith('/mfo-pap') ||
              key.startsWith('/organizations'))
          );
        },
      });

      if (onRolloverComplete) {
        await onRolloverComplete(formData.sourceYearId, formData.targetYearId, {
          copyOrgStructure: formData.copyOrgStructure,
          copyUACSLibrary: formData.copyUACSLibrary,
          copyRecurringExpenses: formData.copyRecurringExpenses,
        });
      }

      setRolloverProgress(100);
      setIsRollingOver(false);

      const result = response?.data;
      const copiedSummary = result
        ? `${result.totalRecordsCopied} total records copied (${result.fundSourcesCopied} fund sources, ${result.mfopapsCopied} MFO/PAPs, ${result.uacsCombinationsCopied} UACS combinations)`
        : 'Data transfer completed successfully.';

      toast.success('Rollover Completed', {
        description: copiedSummary,
      });
    } catch (error) {
      console.error('Rollover failed:', error);
      setIsRollingOver(false);
      setRolloverProgress(0);
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to execute fiscal year rollover';
      toast.error('Rollover Failed', {
        description: errorMsg,
      });
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'Select Fiscal Years';
      case 2:
        return 'Choose Data to Copy';
      case 3:
        return 'Confirm & Execute';
      default:
        return '';
    }
  };

  const sourceYear = formData.sourceYearId
    ? fiscalYears.find((fy) => fy.id === formData.sourceYearId)
    : null;
  const targetYear = formData.targetYearId
    ? fiscalYears.find((fy) => fy.id === formData.targetYearId)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Year-to-Year Data Migration
        </CardTitle>
        <CardDescription>
          Copy organizational data, UACS library, and recurring expenses from one fiscal year to another
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Launch Rollover Wizard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" hidden={isMinimized}>
            {/* Step Indicator with Dashtail Design */}
            <div className="mb-8">
              <div className="mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Launch Rollover Wizard</h3>
              </div>
              
              <div className="grid grid-cols-5 items-center gap-0 px-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center col-span-1 relative z-10 ">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      1 === currentStep
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                        : 1 < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-current={1 === currentStep ? 'step' : undefined}
                  >
                    {1 < currentStep ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      1
                    )}
                  </div>
                  <span className={`text-xs font-semibold mt-2 text-center transition-colors line-clamp-1 ${
                    1 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Select Fiscal
                  </span>
                </div>

                {/* Connector 1 */}
                <div className="flex items-center col-span-1 h-1 w-28 relative z-0 -translate-x-7 -translate-y-3">
                  <div
                    className={`w-full h-full rounded-full transition-all ${
                      1 < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center col-span-1 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      2 === currentStep
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                        : 2 < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-current={2 === currentStep ? 'step' : undefined}
                  >
                    {2 < currentStep ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      2
                    )}
                  </div>
                  <span className={`text-xs font-semibold mt-2 text-center transition-colors text-wrap ${
                    2 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Choose Data
                  </span>
                </div>

                {/* Connector 2 */}
                <div className="flex items-center col-span-1 h-1 w-28 relative z-0 -translate-x-7 -translate-y-3">
                  <div
                    className={`w-full h-full rounded-full transition-all ${
                      2 < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center col-span-1 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      3 === currentStep
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                        : 3 < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-current={3 === currentStep ? 'step' : undefined}
                  >
                    {3 < currentStep ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      3
                    )}
                  </div>
                  <span className={`text-xs font-semibold mt-2 text-center transition-colors  ${
                    3 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Confirm
                  </span>
                </div>
              </div>
            </div>

            <DialogHeader>
              <DialogTitle>{getStepTitle(currentStep)}</DialogTitle>
              <DialogDescription>
                Transfer data from one fiscal year to another
              </DialogDescription>
            </DialogHeader>

            {currentStep === 1 && (
              <RolloverStep1
                formData={formData}
                setFormData={setFormData}
                fiscalYears={fiscalYears}
                errors={validationErrors}
              />
            )}

            {currentStep === 2 && (
              <RolloverStep2
                formData={formData}
                setFormData={setFormData}
                errors={validationErrors}
              />
            )}

            {currentStep === 3 && (
              <RolloverStep3
                formData={formData}
                sourceYear={sourceYear!}
                targetYear={targetYear!}
                isRollingOver={isRollingOver}
                rolloverProgress={rolloverProgress}
              />
            )}

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && !isRollingOver && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                {isRollingOver && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMinimize}
                    className="gap-2"
                  >
                    <Minimize2 className="h-4 w-4" />
                    Minimize
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isRollingOver}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isRollingOver}
                  >
                    {isRollingOver ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Rollover'
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollover Progress Toast - Shows when minimized or after dismissal */}
        <RolloverProgressToast
          isVisible={isRollingOver && (isMinimized || toastDismissedButRollingOver)}
          progress={rolloverProgress}
          sourceYearName={sourceYear?.year.toString() || 'N/A'}
          targetYearName={targetYear?.year.toString() || 'N/A'}
          isRollingOver={isRollingOver}
          onMaximize={handleMaximize}
          onDismissWithConfirmation={handleToastDismiss}
        />

        {/* Rollover Completion Modal - Shows when rollover finishes */}
        <RolloverCompletionModal
          isOpen={showCompletionModal}
          sourceYear={sourceYear ?? null}
          targetYear={targetYear ?? null}
          options={formData}
          onClose={handleCompletionModalClose}
        />
      </CardContent>
    </Card>
  );
}
