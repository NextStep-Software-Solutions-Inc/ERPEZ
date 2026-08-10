import { useMemo } from 'react';
import type { ProcurementModeThreshold } from '@/lib/fiscal-year-and-policies/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface AmountValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const useProcurementPolicyConfigValidation = () => {
  const validateAmounts = useMemo(() => {
    return (
      minAmount: number | string,
      maxAmount: number | string | null | undefined,
      threshold: ProcurementModeThreshold | null | undefined
    ): AmountValidationResult => {
      const errors: ValidationError[] = [];

      const min = typeof minAmount === 'string' ? parseFloat(minAmount) : minAmount;
      const max = typeof maxAmount === 'string' ? parseFloat(maxAmount) : maxAmount;

      // Check if min amount is a valid number
      if (isNaN(min)) {
        errors.push({ field: 'minAmount', message: 'Minimum amount must be a valid number' });
      } else if (min < 0) {
        errors.push({ field: 'minAmount', message: 'Minimum amount cannot be negative' });
      }

      // Check threshold constraints
      if (threshold) {
        if (min < threshold.minThreshold) {
          errors.push({
            field: 'minAmount',
            message: `Minimum amount must be at least ₱${threshold.minThreshold.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} (threshold minimum)`,
          });
        }

        // Check max amount only if it's provided
        if (max !== null && max !== undefined && !isNaN(max)) {
          if (threshold.maxThreshold !== null && threshold.maxThreshold !== undefined) {
            if (max > threshold.maxThreshold) {
              errors.push({
                field: 'maxAmount',
                message: `Maximum amount cannot exceed ₱${threshold.maxThreshold.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} (threshold maximum)`,
              });
            }
          }

          // Check that max >= min
          if (max < min) {
            errors.push({
              field: 'maxAmount',
              message: 'Maximum amount must be greater than or equal to minimum amount',
            });
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };
  }, []);

  return { validateAmounts };
};
