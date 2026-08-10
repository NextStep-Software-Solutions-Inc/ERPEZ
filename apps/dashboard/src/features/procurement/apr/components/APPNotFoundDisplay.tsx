/**
 * APP Not Found Error Display Component
 * Shows user-friendly error message when APP is unavailable
 */

import { AlertCircle } from 'lucide-react'
import type { APPNotFoundError } from '../utils/handleAPPNotFound'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export interface APPNotFoundDisplayProps {
  error: APPNotFoundError
  onDismiss?: () => void
  onSelectNewAPP?: () => void
  showAction?: boolean
}

/**
 * Display APP not found error with action buttons
 */
export function APPNotFoundDisplay({
  error,
  onDismiss,
  onSelectNewAPP,
  showAction = true,
}: APPNotFoundDisplayProps) {
  return (
    <Alert color="destructive" className="space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="text-base">{error.message}</AlertTitle>
          <AlertDescription className="mt-2">{error.recommendation}</AlertDescription>
        </div>
      </div>

      {showAction && (
        <div className="flex gap-2 pt-2">
          {onSelectNewAPP && (
            <Button onClick={onSelectNewAPP} className="bg-red-600 hover:bg-red-700">
              Select Another APP
            </Button>
          )}
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      )}
    </Alert>
  )
}
