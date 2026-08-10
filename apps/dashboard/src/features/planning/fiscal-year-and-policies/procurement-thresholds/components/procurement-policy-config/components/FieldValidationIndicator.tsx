import { Check, AlertCircle, Loader2 } from 'lucide-react'

interface FieldValidationIndicatorProps {
  isValid?: boolean
  isError?: boolean
  isLoading?: boolean
}

/**
 * FieldValidationIndicator
 * 
 * A reusable component that displays validation state icons for form fields.
 * - Shows a spinning loader when validating
 * - Shows an error icon when validation fails
 * - Shows a check icon when validation succeeds
 * - Returns null when field state is not set
 * 
 * Used in forms to provide immediate visual feedback on field validation status.
 */
export function FieldValidationIndicator({
  isValid,
  isError,
  isLoading,
}: FieldValidationIndicatorProps) {
  if (isLoading) {
    return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
  }
  if (isError) {
    return <AlertCircle className="h-4 w-4 text-destructive" />
  }
  if (isValid) {
    return <Check className="h-4 w-4 text-green-500" />
  }
  return null
}
