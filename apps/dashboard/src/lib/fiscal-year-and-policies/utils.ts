import type { RatingScaleItem, User, UserDepartment } from './types';

/**
 * Format a number as Philippine Peso currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

/**
 * Format a number with specified decimal places
 */
export function formatDecimal(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
}

/**
 * Calculate time remaining until a deadline
 */
export function calculateTimeRemaining(deadline: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  if (typeof deadline === 'string') {
    deadline = new Date(deadline);
  }
  
  if (!(deadline instanceof Date) || isNaN(deadline.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isExpired: false };
}

/**
 * Validate procurement mode based on amount
 */
export function validateProcurementMode(
  amount: number,
  thresholds: { shopping: number; smallValue: number; biddingFloor: number }
): string {
  if (amount <= thresholds.shopping) {
    return 'Shopping';
  } else if (amount <= thresholds.smallValue) {
    return 'Small Value Procurement';
  } else if (amount < thresholds.biddingFloor) {
    return 'Public Bidding (Below Threshold)';
  } else {
    return 'Public Bidding';
  }
}

/**
 * Calculate net of tax amount
 */
export function calculateNetOfTax(
  grossAmount: number,
  vatRate: number,
  incomeTaxRate: number
): {
  netAmount: number;
  vat: number;
  incomeTax: number;
} {
  const vat = grossAmount * (vatRate / 100);
  const incomeTax = grossAmount * (incomeTaxRate / 100);
  const netAmount = grossAmount - vat - incomeTax;
  
  return { netAmount, vat, incomeTax };
}

/**
 * Validate rating scale ranges for overlaps
 */
export function validateRatingScaleRanges(scales: RatingScaleItem[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const sortedScales = [...scales].sort((a, b) => a.min - b.min);
  
  for (let i = 0; i < sortedScales.length - 1; i++) {
    const current = sortedScales[i];
    const next = sortedScales[i + 1];
    
    if (current.max >= next.min) {
      errors.push(`Overlap detected: "${current.label}" (${current.min}-${current.max}) overlaps with "${next.label}" (${next.min}-${next.max})`);
    }
    
    if (current.min >= current.max) {
      errors.push(`Invalid range for "${current.label}": min (${current.min}) must be less than max (${current.max})`);
    }
  }
  
  // Check last item
  const last = sortedScales[sortedScales.length - 1];
  if (last && last.min >= last.max) {
    errors.push(`Invalid range for "${last.label}": min (${last.min}) must be less than max (${last.max})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a UUID-like string
 */
// export function generateId(): string {
//   return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// }

/**
 * Format date for datetime-local input
 */
export function formatDateTimeLocal(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Validate SPMS weights
 */
export function validateSPMSWeights(weights: {
  strategicMin: number;
  strategicMax: number;
  coreMin: number;
  coreMax: number;
  supportMin: number;
  supportMax: number;
  fullyRequired: {
    strategic: boolean;
    core: boolean;
    support: boolean;
  };
}): {
  isValid: boolean;
  errors: {
    strategic: string[];
    core: string[];
    support: string[];
  };
} {
  const errors = {
    strategic: [] as string[],
    core: [] as string[],
    support: [] as string[],
  };
  
  // Only validate min/max if NOT fully required for each function type
  if (!weights.fullyRequired.strategic) {
    if (weights.strategicMin > weights.strategicMax) {
      errors.strategic.push('Min cannot be greater than Max');
    }
  }
  
  if (!weights.fullyRequired.core) {
    if (weights.coreMin > weights.coreMax) {
      errors.core.push('Min cannot be greater than Max');
    }
  }
  
  if (!weights.fullyRequired.support) {
    if (weights.supportMin > weights.supportMax) {
      errors.support.push('Min cannot be greater than Max');
    }
  }
  
  // Only check totals if at least one category is not fully required
  const hasNonFullyRequired =
    !weights.fullyRequired.strategic ||
    !weights.fullyRequired.core ||
    !weights.fullyRequired.support;

  if (hasNonFullyRequired) {
    // Calculate totals excluding fully required categories
    const totalMin =
      (weights.fullyRequired.strategic ? 0 : weights.strategicMin) +
      (weights.fullyRequired.core ? 0 : weights.coreMin) +
      (weights.fullyRequired.support ? 0 : weights.supportMin);
    
    const totalMax =
      (weights.fullyRequired.strategic ? 100 : weights.strategicMax) +
      (weights.fullyRequired.core ? 100 : weights.coreMax) +
      (weights.fullyRequired.support ? 100 : weights.supportMax);

    // Check if total min percentages <= 100
    if (totalMin > 100) {
      const msg = `Total minimum percentages (${totalMin}%) cannot exceed 100%`;
      if (weights.fullyRequired.strategic) errors.core.push(msg);
      else if (weights.fullyRequired.core) errors.support.push(msg);
      else errors.strategic.push(msg);
    }

    // Check if total max percentages >= 100
    if (totalMax < 100) {
      const msg = `Total maximum percentages (${totalMax}%) must be at least 100%`;
      if (weights.fullyRequired.strategic) errors.core.push(msg);
      else if (weights.fullyRequired.core) errors.support.push(msg);
      else errors.strategic.push(msg);
    }
  }

  const isValid =
    errors.strategic.length === 0 &&
    errors.core.length === 0 &&
    errors.support.length === 0;

  return {
    isValid,
    errors,
  };
}

/**
 * Get all users eligible for a specific department
 * @param departmentId - The department ID to filter by
 * @param users - Array of all users
 * @param userDepartments - Array of user-department relationships
 * @returns Array of users belonging to the specified department
 */
export function getUsersForDepartment(
  departmentId: string,
  users: User[],
  userDepartments: UserDepartment[]
): User[] {
  const userIdsForDept = userDepartments
    .filter(ud => ud.departmentId === departmentId)
    .map(ud => ud.userId);

  return users.filter(user => userIdsForDept.includes(user.id));
}

/**
 * Generate a unique ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @returns Generated unique ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${randomStr}`;
}
// ==================== GENERAL RATING SCALE UTILITIES ====================

import type { GeneralRatingScale, ValidationError, OverlapConflict } from './types';

/**
 * Convert decimal score (0.00-5.00) to percentage (0-100)
 */
export function decimalToPercentage(decimal: number): number {
  const percentage = (decimal / 5.0) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert percentage (0-100) to decimal score (0.00-5.00)
 */
export function percentageToDecimal(percentage: number): number {
  const decimal = (percentage / 100) * 5.0;
  return Math.round(decimal * 100) / 100; // Round to 2 decimal places
}

/**
 * Format decimal score for display
 * @param decimal - Score in decimal format (0.00-5.00)
 * @returns Formatted string like "4.51"
 */
export function formatDecimalScore(decimal: number): string {
  return decimal.toFixed(2);
}

/**
 * Validate a single rating scale range
 */
export function validateSingleRatingScale(scale: Partial<GeneralRatingScale>): ValidationError[] {
  const errors: ValidationError[] = [];
  const { minScore, maxScore, adjectivalRatingName } = scale;

  if (typeof minScore !== 'number' || typeof maxScore !== 'number') {
    return errors;
  }

  // Check boundaries
  if (minScore < 0 || minScore > 5.0) {
    errors.push({
      type: 'boundaryError',
      message: `Minimum score must be between 0.00 and 5.00, got ${formatDecimalScore(minScore)}`,
    });
  }

  if (maxScore < 0 || maxScore > 5.0) {
    errors.push({
      type: 'boundaryError',
      message: `Maximum score must be between 0.00 and 5.00, got ${formatDecimalScore(maxScore)}`,
    });
  }

  // Check min < max
  if (minScore >= maxScore) {
    errors.push({
      type: 'rangeInvalid',
      message: `Minimum score (${formatDecimalScore(minScore)}) must be less than maximum score (${formatDecimalScore(maxScore)})`,
    });
  }

  return errors;
}

/**
 * Detect overlapping ranges between rating scales
 */
export function detectOverlappingRanges(
  scales: GeneralRatingScale[],
  newOrUpdatedScale: Partial<GeneralRatingScale>,
  currentScaleId?: string
): OverlapConflict | null {
  const { minScore, maxScore } = newOrUpdatedScale;

  if (typeof minScore !== 'number' || typeof maxScore !== 'number') {
    return null;
  }

  // Check against all other scales
  for (const scale of scales) {
    // Skip the scale being edited
    if (currentScaleId && scale.id === currentScaleId) {
      continue;
    }

    // Check for overlap
    const overlaps =
      (minScore >= scale.minScore && minScore <= scale.maxScore) || // New min falls within existing
      (maxScore >= scale.minScore && maxScore <= scale.maxScore) || // New max falls within existing
      (minScore < scale.minScore && maxScore > scale.maxScore); // New range encloses existing

    if (overlaps) {
      return {
        scaleId: scale.id,
        scaleName: scale.adjectivalRatingName,
        minScore: scale.minScore,
        maxScore: scale.maxScore,
        suggestion: suggestAlternativeRange(scales, minScore, maxScore, currentScaleId),
      };
    }
  }

  return null;
}

/**
 * Suggest an alternative non-overlapping range
 */
export function suggestAlternativeRange(
  scales: GeneralRatingScale[],
  attemptedMin: number,
  attemptedMax: number,
  currentScaleId?: string
): string {
  // Get all occupied ranges (excluding the current scale being edited)
  const occupiedRanges = scales
    .filter(s => !currentScaleId || s.id !== currentScaleId)
    .sort((a, b) => a.minScore - b.minScore);

  const rangeSize = attemptedMax - attemptedMin;

  // Try to find gaps that fit the range size
  // Check gap at the beginning
  if (occupiedRanges.length > 0 && occupiedRanges[0].minScore > 0) {
    const maxAvailableAtStart = occupiedRanges[0].minScore;
    if (maxAvailableAtStart >= rangeSize) {
      const suggestedMax = Math.min(rangeSize, maxAvailableAtStart);
      const suggestedMin = suggestedMax - rangeSize;
      return `${formatDecimalScore(suggestedMin)}–${formatDecimalScore(suggestedMax)} (${formatDecimalScore(decimalToPercentage(suggestedMin))}–${formatDecimalScore(decimalToPercentage(suggestedMax))}%)`;
    }
  }

  // Check gaps between existing ranges
  for (let i = 0; i < occupiedRanges.length - 1; i++) {
    const gapStart = occupiedRanges[i].maxScore;
    const gapEnd = occupiedRanges[i + 1].minScore;
    const gapSize = gapEnd - gapStart;

    if (gapSize >= rangeSize) {
      const suggestedMin = gapStart;
      const suggestedMax = suggestedMin + rangeSize;
      return `${formatDecimalScore(suggestedMin)}–${formatDecimalScore(suggestedMax)} (${formatDecimalScore(decimalToPercentage(suggestedMin))}–${formatDecimalScore(decimalToPercentage(suggestedMax))}%)`;
    }
  }

  // Check gap at the end
  if (occupiedRanges.length > 0) {
    const lastRange = occupiedRanges[occupiedRanges.length - 1];
    const maxAvailableAtEnd = 5.0 - lastRange.maxScore;
    if (maxAvailableAtEnd >= rangeSize) {
      const suggestedMin = lastRange.maxScore;
      const suggestedMax = suggestedMin + rangeSize;
      return `${formatDecimalScore(suggestedMin)}–${formatDecimalScore(suggestedMax)} (${formatDecimalScore(decimalToPercentage(suggestedMin))}–${formatDecimalScore(decimalToPercentage(suggestedMax))}%)`;
    }
  }

  // If no gap found large enough, suggest merging or truncating
  return `Unable to find a suitable range. Consider adjusting the range size or modifying existing scales.`;
}

/**
 * Validate contiguity: all ranges should be non-overlapping and cover 0.00-5.00 continuously
 */
export function validateContiguity(scales: GeneralRatingScale[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (scales.length === 0) {
    errors.push({
      type: 'gap',
      message: 'At least one rating scale is required',
    });
    return errors;
  }

  // Sort by min score
  const sorted = [...scales].sort((a, b) => a.minScore - b.minScore);

  // Check if first scale starts at 0.00
  if (sorted[0].minScore !== 0.0) {
    errors.push({
      type: 'gap',
      message: `First scale must start at 0.00, but starts at ${formatDecimalScore(sorted[0].minScore)}`,
    });
  }

  // Check if last scale ends at 5.00
  const lastScale = sorted[sorted.length - 1];
  if (lastScale.maxScore !== 5.0) {
    errors.push({
      type: 'gap',
      message: `Last scale must end at 5.00, but ends at ${formatDecimalScore(lastScale.maxScore)}`,
    });
  }

  // Check for overlaps and gaps between consecutive scales
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.maxScore > next.minScore) {
      errors.push({
        type: 'overlapping',
        message: `"${current.adjectivalRatingName}" (${formatDecimalScore(current.minScore)}–${formatDecimalScore(current.maxScore)}) overlaps with "${next.adjectivalRatingName}" (${formatDecimalScore(next.minScore)}–${formatDecimalScore(next.maxScore)})`,
      });
    } else if (current.maxScore < next.minScore) {
      errors.push({
        type: 'gap',
        message: `Gap between "${current.adjectivalRatingName}" (ends at ${formatDecimalScore(current.maxScore)}) and "${next.adjectivalRatingName}" (starts at ${formatDecimalScore(next.minScore)})`,
      });
    }
  }

  return errors;
}

/**
 * Comprehensive validation of all rating scales for a fiscal year
 */
export function validateAllRatingScales(scales: GeneralRatingScale[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check count
  if (scales.length !== 5) {
    errors.push({
      type: 'countMismatch',
      message: `Expected exactly 5 rating scales, but found ${scales.length}`,
    });
  }

  // Validate individual scales
  scales.forEach(scale => {
    const scaleErrors = validateSingleRatingScale(scale);
    errors.push(...scaleErrors);
  });

  // Validate contiguity
  const contiguityErrors = validateContiguity(scales);
  errors.push(...contiguityErrors);

  return errors;
}