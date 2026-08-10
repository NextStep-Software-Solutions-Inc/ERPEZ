// Constants and hooks for EditPerformanceMeasuresForm

import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getPerformanceMeasuresRequest } from '../../performance-measure/handlers/getPerformanceMeasuresRequest'

// Numerical ratings scale (1-5)
export const NUMERICAL_RATINGS = [
    { value: 5, label: 'Excellent' },
    { value: 4, label: 'Very Good' },
    { value: 3, label: 'Good' },
    { value: 2, label: 'Fair' },
    { value: 1, label: 'Poor' },
] as const

export const usePerformanceMeasures = createQueryHookFromTemplate(getPerformanceMeasuresRequest)