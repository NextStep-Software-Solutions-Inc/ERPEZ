import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

/**
 * Creates a debounced duplicate year validation function
 * Checks if a year already exists among existing fiscal years with 500ms debounce
 */
export function createDebouncedYearValidation(
  existingYears: FiscalYear[],
  excludeYearId?: string,
  onError?: (error: string | null) => void
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (year: number) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (!year || year < 2000 || year > 2100) {
        onError?.(null);
        return;
      }

      const isDuplicate = existingYears.some(fy => 
        fy.year === year && (!excludeYearId || fy.id !== excludeYearId)
      );

      if (isDuplicate) {
        onError?.(`Fiscal year ${year} already exists`);
      } else {
        onError?.(null);
      }
    }, 500);
  };
}

/**
 * Validates fiscal year input
 */
export function validateFiscalYear(
  year: number,
  existingYears: FiscalYear[]
): { isValid: boolean; error: string | null } {
  if (year < 2000 || year > 2100) {
    return {
      isValid: false,
      error: 'Fiscal year must be between 2000 and 2100',
    };
  }

  if (existingYears.some(fy => fy.year === year)) {
    return {
      isValid: false,
      error: `Fiscal year ${year} already exists`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates fiscal year input for editing (excludes current fiscal year from duplicate check)
 */
export function validateFiscalYearForEdit(
  year: number,
  existingYears: FiscalYear[],
  currentFiscalYearId: string
): { isValid: boolean; error: string | null } {
  if (year < 2000 || year > 2100) {
    return {
      isValid: false,
      error: 'Fiscal year must be between 2000 and 2100',
    };
  }

  if (existingYears.some(fy => fy.year === year && fy.id !== currentFiscalYearId)) {
    return {
      isValid: false,
      error: `Fiscal year ${year} already exists`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Checks if "Active" status is disabled for a fiscal year
 */
export function isActiveStatusDisabled(fiscalYear: FiscalYear, fiscalYears: FiscalYear[]): boolean {
  return fiscalYear.status !== 'active' && fiscalYears.some(fy => fy.status === 'active');
}

/**
 * Gets warning message for status transitions
 */
export function getStatusTransitionWarning(
  fiscalYear: FiscalYear,
  newStatus: FiscalYear['status']
): string {
  if (newStatus === 'active') {
    return `Setting FY ${fiscalYear.year} to Active will automatically close the current active fiscal year.`;
  }
  if (newStatus === 'closed') {
    return `Setting FY ${fiscalYear.year} to Closed will lock all associated months. This action cannot be undone directly.`;
  }

  return '';
}

/**
 * Formats status text for display
 */
export function formatStatusText(status: FiscalYear['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
