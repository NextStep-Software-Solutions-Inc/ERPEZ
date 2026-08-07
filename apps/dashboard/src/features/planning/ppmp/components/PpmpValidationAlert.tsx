import { AlertTriangle, Link2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface ValidationError {
  type: string
  message: string
}

export interface PpmpValidationAlertProps {
  validationErrors: ValidationError[]
  rejectionReason?: string | null
  canEdit: boolean
  isReadyForSubmission: boolean
}

/**
 * PpmpValidationAlert
 * Displays validation errors and rejection reasons for PPMP submission.
 * Separates MSF-related errors for prominent display.
 */
export function PpmpValidationAlert({
  validationErrors,
  rejectionReason,
  canEdit,
  isReadyForSubmission,
}: PpmpValidationAlertProps) {
  const hasValidationIssues =
    canEdit && !isReadyForSubmission && validationErrors.length > 0
  const hasMsfErrors = validationErrors.some((e) => e.type === 'missing-msf')
  const hasOtherErrors = validationErrors.some((e) => e.type !== 'missing-msf')

  return (
    <>
      {hasValidationIssues && (
        <div className="pt-4">
          <Alert variant="outline" className="border-amber-200 bg-amber-50/70">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="space-y-2 text-amber-900">
              <div className="font-medium">
                {validationErrors.length} validation issue
                {validationErrors.length === 1 ? '' : 's'} need to be resolved
                before submission.
              </div>

              {/* MSF missing errors — highlighted separately */}
              {hasMsfErrors && (
                <div className="rounded-md border border-amber-300 bg-amber-100/60 px-3 py-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <Link2 className="h-3.5 w-3.5" />
                    Missing Market Scoping Form Links (RA 12009 Sec. 10)
                  </div>
                  <ul className="space-y-0.5 text-xs text-amber-800">
                    {validationErrors
                      .filter((e) => e.type === 'missing-msf')
                      .map((e) => (
                        <li key={e.message}>• {e.message}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Other validation errors */}
              {hasOtherErrors && (
                <ul className="space-y-1 text-sm">
                  {validationErrors
                    .filter((e) => e.type !== 'missing-msf')
                    .slice(0, 3)
                    .map((error) => (
                      <li key={`${error.type}-${error.message}`}>
                        • {error.message}
                      </li>
                    ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {rejectionReason && (
        <div className="pt-4">
          <Alert variant="soft">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Returned for revision:</strong> {rejectionReason}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}
