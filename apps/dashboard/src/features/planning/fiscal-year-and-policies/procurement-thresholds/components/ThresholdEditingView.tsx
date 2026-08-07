import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { ThresholdBoundary } from '@/lib/fiscal-year-and-policies/types';

interface ThresholdEditingViewProps {
  currentMin: number;
  currentMax: number;
  boundary: ThresholdBoundary;
  onSave: (newMin: number, newMax: number) => void;
  onCancel: () => void;
}

export function ThresholdEditingView({
  currentMin,
  currentMax,
  boundary,
  onSave,
  onCancel,
}: ThresholdEditingViewProps) {
  const [localMin, setLocalMin] = useState<string>(currentMin.toString());
  const [localMax, setLocalMax] = useState<string>(currentMax.toString());
  const [sliderMin, setSliderMin] = useState<number>(currentMin);
  const [sliderMax, setSliderMax] = useState<number>(currentMax);
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);

  // Sync inputs to slider on external changes
  useEffect(() => {
    setLocalMin(currentMin.toString());
    setLocalMax(currentMax.toString());
    setSliderMin(currentMin);
    setSliderMax(currentMax);
  }, [currentMin, currentMax]);

  // Validate min value
  const validateMin = useCallback(
    (value: number): string | null => {
      if (value < boundary.min) {
        return `Minimum cannot be less than ${boundary.min}`;
      }
      if (value > sliderMax) {
        return 'Minimum cannot exceed maximum';
      }
      return null;
    },
    [boundary.min, sliderMax]
  );

  // Validate max value
  const validateMax = useCallback(
    (value: number): string | null => {
      if (value > boundary.max) {
        return `Maximum cannot exceed ${boundary.max}`;
      }
      if (value < sliderMin) {
        return 'Maximum cannot be less than minimum';
      }
      return null;
    },
    [boundary.max, sliderMin]
  );

  // Handle min input change
  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalMin(inputValue);

      const value = parseInt(inputValue, 10);
      if (!Number.isNaN(value)) {
        const error = validateMin(value);
        setMinError(error);
        if (!error) {
          setSliderMin(value);
        }
      }
    },
    [validateMin]
  );

  // Handle max input change
  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalMax(inputValue);

      const value = parseInt(inputValue, 10);
      if (!Number.isNaN(value)) {
        const error = validateMax(value);
        setMaxError(error);
        if (!error) {
          setSliderMax(value);
        }
      }
    },
    [validateMax]
  );

  // Handle slider change - FIXED: Both min and max update independently
  const handleSliderChange = useCallback(
    (values: number[]) => {
      const [newMin, newMax] = values;

      // Validate and update min
      if (newMin !== sliderMin) {
        const minErr = validateMin(newMin);
        setMinError(minErr);
        if (!minErr) {
          setSliderMin(newMin);
          setLocalMin(newMin.toString());
        }
      }

      // Validate and update max
      if (newMax !== sliderMax) {
        const maxErr = validateMax(newMax);
        setMaxError(maxErr);
        if (!maxErr) {
          setSliderMax(newMax);
          setLocalMax(newMax.toString());
        }
      }
    },
    [sliderMin, sliderMax, validateMin, validateMax]
  );

  // Handle save
  const handleSave = useCallback(() => {
    const minValue = parseInt(localMin, 10);
    const maxValue = parseInt(localMax, 10);

    // Final validation before save
    const minErr = validateMin(minValue);
    const maxErr = validateMax(maxValue);

    setMinError(minErr);
    setMaxError(maxErr);

    if (!minErr && !maxErr) {
      onSave(minValue, maxValue);
    }
  }, [localMin, localMax, validateMin, validateMax, onSave]);

  // Check if there are any errors
  const hasErrors = minError !== null || maxError !== null;
  const isSaveDisabled = hasErrors || (sliderMin === currentMin && sliderMax === currentMax);

  return (
    <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5 transition-colors">
      {/* Min Input & Slider */}
      <div className="space-y-2">
        <Label htmlFor="threshold-min-input" className="text-sm font-medium text-foreground">
          Minimum Value
        </Label>
        <Input
          id="threshold-min-input"
          type="number"
          value={localMin}
          onChange={handleMinInputChange}
          min={boundary.min}
          max={boundary.max}
          variant="bordered"
          radius="md"
          color={minError ? 'destructive' : 'default'}
          className={minError ? 'border-destructive/50 focus:border-destructive' : ''}
          aria-invalid={minError ? 'true' : 'false'}
          aria-describedby={minError ? 'min-error' : undefined}
        />
        {minError && (
          <p id="min-error" className="text-xs text-destructive font-medium">
            {minError}
          </p>
        )}
      </div>

      {/* Max Input & Slider */}
      <div className="space-y-2">
        <Label htmlFor="threshold-max-input" className="text-sm font-medium text-foreground">
          Maximum Value
        </Label>
        <Input
          id="threshold-max-input"
          type="number"
          value={localMax}
          onChange={handleMaxInputChange}
          min={boundary.min}
          max={boundary.max}
          variant="bordered"
          radius="md"
          color={maxError ? 'destructive' : 'default'}
          className={maxError ? 'border-destructive/50 focus:border-destructive' : ''}
          aria-invalid={maxError ? 'true' : 'false'}
          aria-describedby={maxError ? 'max-error' : undefined}
        />
        {maxError && (
          <p id="max-error" className="text-xs text-destructive font-medium">
            {maxError}
          </p>
        )}
      </div>

      {/* Range Slider */}
      <div className="space-y-3 mt-4 pt-4 border-t border-default-200">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Range Slider
          </div>
          <div className="text-xs text-muted-foreground">
            {boundary.min} - {boundary.max}
          </div>
        </div>
        <Slider
          min={boundary.min}
          max={boundary.max}
          step={1}
          value={[sliderMin, sliderMax]}
          onValueChange={handleSliderChange}
          color="primary"
          size="md"
          radius="md"
          className="w-full"
          aria-label="Threshold range slider"
          aria-valuemin={boundary.min}
          aria-valuemax={boundary.max}
          aria-valuenow={sliderMin}
        />
      </div>

      {/* Slider Value Preview */}
      <div className="flex justify-between items-center px-3 py-2 rounded-md bg-background border border-default-200">
        <div className="text-xs font-semibold text-foreground">
          <span className="text-muted-foreground">Min: </span>
          <span className="text-primary">{sliderMin}</span>
        </div>
        <div className="h-1 w-12 bg-default-200 rounded-full" />
        <div className="text-xs font-semibold text-foreground">
          <span className="text-muted-foreground">Max: </span>
          <span className="text-primary">{sliderMax}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-default-200">
        <Button
          onClick={onCancel}
          variant="light"
          size="sm"
          className="flex-1"
          aria-label="Cancel editing threshold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          size="sm"
          className="flex-1"
          disabled={isSaveDisabled}
          aria-label="Save threshold changes"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
