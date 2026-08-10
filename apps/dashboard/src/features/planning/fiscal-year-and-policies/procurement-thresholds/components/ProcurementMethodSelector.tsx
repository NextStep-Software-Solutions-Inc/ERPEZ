import { ChevronDown, Edit2, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { formatCurrency } from '@/lib/fiscal-year-and-policies/utils';
import type { ProcurementMethod } from '@/lib/fiscal-year-and-policies/types';

interface ProcurementMethodSelectorProps {
  methods: ProcurementMethod[];
  selectedMethodId: string;
  customThresholds: {
    minimumThreshold: number;
    maximumThreshold: number;
    thresholdValue: number;
  };
  onMethodChange: (methodId: string) => void;
  onThresholdChange: (
    field: 'thresholdValue',
    value: number
  ) => void;
}

export function ProcurementMethodSelector({
  methods,
  selectedMethodId,
  customThresholds,
  onMethodChange,
  onThresholdChange,
}: ProcurementMethodSelectorProps) {
  const [sliderValue, setSliderValue] = useState<string>(
    (customThresholds.thresholdValue ?? 0).toString()
  );
  const [inputValue, setInputValue] = useState<string>(
    (customThresholds.thresholdValue ?? 0).toString()
  );
  const [validationError, setValidationError] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Find selected method or default to first method
  let selectedMethod = methods.find((m) => m.id === selectedMethodId);

  // Fallback to first method if not found
  if (!selectedMethod && methods.length > 0) {
    selectedMethod = methods[0];
  }

  if (!selectedMethod || methods.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <p className="font-semibold">Configuration Error</p>
        <p className="text-sm mt-1">Procurement methods configuration is unavailable. Please refresh the page or contact support.</p>
      </div>
    );
  }

  // Validate threshold value
  const validateThreshold = (value: number): boolean => {
    const isAboveMin = value >= selectedMethod!.minimumThreshold;
    const isBelowMax =
      selectedMethod!.maximumThreshold === Infinity ||
      value <= selectedMethod!.maximumThreshold;

    if (!isAboveMin || !isBelowMax) {
      const min = formatCurrency(selectedMethod!.minimumThreshold);
      const max =
        selectedMethod!.maximumThreshold === Infinity
          ? 'No Limit'
          : formatCurrency(selectedMethod!.maximumThreshold);
      setValidationError(
        `Threshold must be within ${min} – ${max} for this procurement method`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSliderValue(value);
    setInputValue(value);

    const numValue = Number(value);
    if (validateThreshold(numValue)) {
      setPendingValue(numValue);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Allow partial input (don't validate until complete)
    if (value === '' || value === '-') return;

    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setSliderValue(value);
      if (validateThreshold(numValue)) {
        setPendingValue(numValue);
      }
    }
  };

  // Handle confirm changes
  const handleConfirmChanges = () => {
    if (pendingValue !== null) {
      onThresholdChange('thresholdValue', pendingValue);
      setPendingValue(null);
      setShowConfirmDialog(false);
      setIsEditMode(false);
    }
  };

  // Handle cancel changes
  const handleCancelChanges = () => {
    setSliderValue((customThresholds.thresholdValue ?? 0).toString());
    setInputValue((customThresholds.thresholdValue ?? 0).toString());
    setPendingValue(null);
    setIsEditMode(false);
    setValidationError('');
  };

  // Sync when customThresholds.thresholdValue changes externally
  useEffect(() => {
    setSliderValue((customThresholds.thresholdValue ?? 0).toString());
    setInputValue((customThresholds.thresholdValue ?? 0).toString());
  }, [customThresholds.thresholdValue]);

  // Reset validation error when method changes
  useEffect(() => {
    setValidationError('');
  }, [selectedMethodId]);

  const hasError = validationError !== '';
  const sliderMin = selectedMethod.minimumThreshold;
  const sliderMax =
    selectedMethod.maximumThreshold === Infinity
      ? selectedMethod.minimumThreshold * 10 // Fallback max for slider
      : selectedMethod.maximumThreshold;

  return (
    <div className="space-y-6">
      {/* Method Selection Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="procurement-method">Select Procurement Method</Label>
        <Select value={selectedMethodId} onValueChange={onMethodChange}>
          <SelectTrigger
            id="procurement-method"
            aria-label="Procurement method"
            aria-describedby="method-description"
          >
            <SelectValue placeholder="Select a procurement method" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{method.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(method.minimumThreshold)} -{' '}
                    {method.maximumThreshold === Infinity
                      ? '∞'
                      : formatCurrency(method.maximumThreshold)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          id="method-description"
          className="text-sm text-muted-foreground mt-2"
        >
          {selectedMethod.description}
        </p>
      </div>

      {/* Method Bounds Display (Read-Only) */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Method Bounds</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Minimum Threshold
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(selectedMethod.minimumThreshold)}
              </p>
              <p className="text-xs text-slate-500 mt-2">Read-only reference</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Maximum Threshold
              </p>
              <p className="text-lg font-bold text-slate-900">
                {selectedMethod.maximumThreshold === Infinity
                  ? 'No Limit'
                  : formatCurrency(selectedMethod.maximumThreshold)}
              </p>
              <p className="text-xs text-slate-500 mt-2">Read-only reference</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Threshold Value Input - Hybrid (Slider + Text) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900">
            Threshold Value
          </h4>
          {!isEditMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditMode(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelChanges}
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                disabled={pendingValue === null}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Range Slider (only if maxThreshold is not Infinity) */}
          {selectedMethod.maximumThreshold !== Infinity && (
            <div className="space-y-2">
              <Label htmlFor="threshold-slider" className="text-sm">
                Adjust using slider
              </Label>
              <input
                id="threshold-slider"
                type="range"
                min={sliderMin}
                max={sliderMax}
                step="1000"
                value={sliderValue}
                onChange={handleSliderChange}
                disabled={!isEditMode}
                aria-label="Threshold value slider"
                aria-valuemin={sliderMin}
                aria-valuemax={sliderMax}
                aria-valuenow={Number(sliderValue)}
                aria-describedby={hasError ? 'threshold-error' : undefined}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 ${
                  hasError ? 'opacity-50' : ''
                } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{formatCurrency(sliderMin)}</span>
                <span>{formatCurrency(sliderMax)}</span>
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="threshold-input" className="text-sm">
              {selectedMethod.maximumThreshold !== Infinity
                ? 'Or enter manually'
                : 'Enter threshold value'}
            </Label>
            <Input
              id="threshold-input"
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              disabled={!isEditMode}
              min={selectedMethod.minimumThreshold}
              max={
                selectedMethod.maximumThreshold === Infinity
                  ? undefined
                  : selectedMethod.maximumThreshold
              }
              step="1000"
              placeholder="Enter amount"
              aria-label="Threshold value text input"
              aria-describedby={hasError ? 'threshold-error' : 'threshold-formatted'}
              className={`${hasError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-slate-50 cursor-not-allowed' : ''}`}
            />
            <p id="threshold-formatted" className="text-xs text-muted-foreground">
              {inputValue && !isNaN(Number(inputValue))
                ? formatCurrency(Number(inputValue))
                : 'Enter a value'}
            </p>
          </div>

          {/* Validation Error */}
          {hasError && (
            <div
              id="threshold-error"
              className="p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
            >
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Method Metadata - Accordion */}
      <Accordion type="single" collapsible className="border rounded-lg">
        <AccordionItem value="metadata" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm font-semibold text-slate-900">
                Additional Details
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 border-t">
            <div className="space-y-4">
              {/* Applicable For */}
              <div>
                <h5 className="text-xs font-semibold text-slate-900 mb-2">
                  Applicable For
                </h5>
                <p className="text-sm text-slate-600">
                  {selectedMethod.applicableFor.join(', ')}
                </p>
              </div>

              {/* Required Documents */}
              <div>
                <h5 className="text-xs font-semibold text-slate-900 mb-2">
                  Required Documents
                </h5>
                <ul className="space-y-1">
                  {selectedMethod.requiredDocuments.map((doc, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-600 flex items-start gap-2"
                    >
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Threshold Change</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the procurement threshold value from{' '}
              <span className="font-semibold text-slate-900">
                {formatCurrency(customThresholds.thresholdValue)}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-900">
                {pendingValue !== null ? formatCurrency(pendingValue) : 'N/A'}
              </span>
              . This change will affect fiscal year assignments and procurement policies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChanges} className="bg-blue-600 hover:bg-blue-700">
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
