import type { RatingScaleItem, RatingValidationResult, RatingValidationError } from './types';

const DECIMAL_BOUNDS = { min: 1.0, max: 5.0 };
const PERCENTAGE_BOUNDS = { min: 0, max: 100 };

/**
 * Determine if a rating scale is using decimal or percentage format
 */
function detectFormat(scale: RatingScaleItem[]): 'decimal' | 'percentage' {
  if (scale.length === 0) return 'decimal';
  const maxValue = Math.max(...scale.map(r => Math.max(r.min, r.max)));
  return maxValue > 10 ? 'percentage' : 'decimal';
}

/**
 * Get the valid bounds based on format
 */
function getBounds(format: 'decimal' | 'percentage'): typeof DECIMAL_BOUNDS {
  return format === 'decimal' ? DECIMAL_BOUNDS : PERCENTAGE_BOUNDS;
}

/**
 * Check if min < max for a rating
 */
function isValidMinMax(item: RatingScaleItem): boolean {
  return item.min < item.max;
}

/**
 * Check if two ranges overlap (allowing boundaries to touch)
 * Ranges can share a boundary point (e.g., 1.0-1.50 and 1.51-2.00 don't overlap)
 */
function rangesOverlap(range1: { min: number; max: number }, range2: { min: number; max: number }): boolean {
  // Allow ranges to touch at boundaries with a small tolerance for floating point
  return range1.min < range2.max - 0.01 && range2.min < range1.max - 0.01;
}

/**
 * Validate that rating scale has exactly 5 items
 */
function validateCount(scale: RatingScaleItem[]): RatingValidationError | null {
  if (scale.length !== 5) {
    return {
      type: 'countMismatch',
      message: `You must have exactly 5 ratings in the scale. Current count: ${scale.length}.`,
      details: { currentCount: scale.length, expectedCount: 5 },
    };
  }
  return null;
}

/**
 * Validate that min < max for all ratings
 */
function validateMinMaxOrder(scale: RatingScaleItem[]): RatingValidationError[] {
  return scale
    .filter(item => !isValidMinMax(item))
    .map(item => ({
      type: 'minMaxInvalid' as const,
      message: `Rating "${item.label}": Minimum (${item.min}) must be less than Maximum (${item.max}).`,
      details: { ratingLabel: item.label, min: item.min, max: item.max },
    }));
}

/**
 * Validate that all values are within bounds
 */
function validateBounds(scale: RatingScaleItem[], format: 'decimal' | 'percentage'): RatingValidationError[] {
  const bounds = getBounds(format);
  const errors: RatingValidationError[] = [];

  scale.forEach(item => {
    if (item.min < bounds.min || item.min > bounds.max) {
      errors.push({
        type: 'outOfBounds',
        message: `Rating "${item.label}": Minimum value (${item.min}) is outside valid range (${bounds.min}–${bounds.max}).`,
        details: { ratingLabel: item.label, value: item.min, bounds },
      });
    }
    if (item.max < bounds.min || item.max > bounds.max) {
      errors.push({
        type: 'outOfBounds',
        message: `Rating "${item.label}": Maximum value (${item.max}) is outside valid range (${bounds.min}–${bounds.max}).`,
        details: { ratingLabel: item.label, value: item.max, bounds },
      });
    }
  });

  return errors;
}

/**
 * Validate that no two ratings have overlapping ranges
 */
function validateNoOverlaps(scale: RatingScaleItem[]): RatingValidationError[] {
  const errors: RatingValidationError[] = [];

  for (let i = 0; i < scale.length; i++) {
    for (let j = i + 1; j < scale.length; j++) {
      if (rangesOverlap(scale[i], scale[j])) {
        errors.push({
          type: 'overlapping',
          message: `Range overlap: Ratings "${scale[i].label}" and "${scale[j].label}" have overlapping ranges.`,
          details: {
            rating1: { label: scale[i].label, min: scale[i].min, max: scale[i].max },
            rating2: { label: scale[j].label, min: scale[j].min, max: scale[j].max },
          },
        });
      }
    }
  }

  return errors;
}

/**
 * Validate that there are no gaps in the rating scale
 */
function validateNoGaps(scale: RatingScaleItem[], format: 'decimal' | 'percentage'): RatingValidationError[] {
  if (scale.length < 2) return [];

  const bounds = getBounds(format);
  const sorted = [...scale].sort((a, b) => a.min - b.min);
  const errors: RatingValidationError[] = [];

  // Check if minimum starts at or near the lower bound
  if (sorted[0].min > bounds.min + 0.01) {
    errors.push({
      type: 'gap',
      message: `Gap at the start: Range from ${bounds.min} to ${sorted[0].min} is not covered.`,
      details: { gapMin: bounds.min, gapMax: sorted[0].min },
    });
  }

  // Check gaps between consecutive ratings
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentMax = sorted[i].max;
    const nextMin = sorted[i + 1].min;

    // Allow for small floating-point tolerance and intentional small gaps between ranges
    if (Math.abs(currentMax - nextMin) > 0.01) {
      errors.push({
        type: 'gap',
        message: `Gap detected: Range from ${currentMax} to ${nextMin} is not covered by any rating.`,
        details: { gapMin: currentMax, gapMax: nextMin },
      });
    }
  }

  // Check if maximum ends at or near the upper bound
  if (sorted[sorted.length - 1].max < bounds.max - 0.01) {
    errors.push({
      type: 'gap',
      message: `Gap at the end: Range from ${sorted[sorted.length - 1].max} to ${bounds.max} is not covered.`,
      details: { gapMin: sorted[sorted.length - 1].max, gapMax: bounds.max },
    });
  }

  return errors;
}

/**
 * Comprehensive validation of the entire rating scale
 */
export function validateRatingScale(scale: RatingScaleItem[]): RatingValidationResult {
  const errors: RatingValidationError[] = [];
  const format = detectFormat(scale);

  // Check count first
  const countError = validateCount(scale);
  if (countError) {
    errors.push(countError);
  }

  // Validate min/max order
  errors.push(...validateMinMaxOrder(scale));

  // If we have valid count and min/max order, check bounds and overlaps
  if (errors.length === 0) {
    errors.push(...validateBounds(scale, format));
    errors.push(...validateNoOverlaps(scale));
    errors.push(...validateNoGaps(scale, format));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convert a value from decimal to percentage
 * Assumes 5.0 = 100%, 0 = 0%
 */
export function decimalToPercentage(value: number): number {
  return Math.round(value * 20);
}

/**
 * Convert a value from percentage to decimal
 * Assumes 100% = 5.0, 0% = 0
 */
export function percentageToDecimal(value: number): number {
  return Math.round((value / 20) * 100) / 100;
}

/**
 * Convert an entire rating scale from decimal to percentage
 */
export function scaleDecimalToPercentage(scale: RatingScaleItem[]): RatingScaleItem[] {
  return scale.map(item => ({
    ...item,
    min: decimalToPercentage(item.min),
    max: decimalToPercentage(item.max),
  }));
}

/**
 * Convert an entire rating scale from percentage to decimal
 */
export function scalePercentageToDecimal(scale: RatingScaleItem[]): RatingScaleItem[] {
  return scale.map(item => ({
    ...item,
    min: percentageToDecimal(item.min),
    max: percentageToDecimal(item.max),
  }));
}

/**
 * Format a value for display based on format type
 */
export function formatRatingValue(value: number, format: 'decimal' | 'percentage'): string {
  if (format === 'percentage') {
    return `${Math.round(value)}%`;
  }
  return value.toFixed(2);
}

/**
 * Format a range for display
 */
export function formatRatingRange(min: number, max: number, format: 'decimal' | 'percentage'): string {
  return `${formatRatingValue(min, format)} - ${formatRatingValue(max, format)}`;
}
