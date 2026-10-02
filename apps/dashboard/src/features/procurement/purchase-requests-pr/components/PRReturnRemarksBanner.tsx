import React from 'react'
import { format } from 'date-fns'
import { CornerDownLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface PRReturnRemarksBannerProps {
  displayStatus?: string
  prStatus: string
  returnedDate?: string
  returnedBy?: string
  returnRemarks?: string
  remarks?: string
}

export const PRReturnRemarksBanner: React.FC<PRReturnRemarksBannerProps> = ({
  displayStatus,
  prStatus,
  returnedDate,
  returnedBy,
  returnRemarks,
  remarks,
}) => {
  const isReturned =
    (displayStatus === 'returned' || prStatus === 'returned') &&
    prStatus !== 'approved' &&
    prStatus !== 'submitted'

  if (!isReturned) return null

  const formattedDate = (() => {
    if (!returnedDate) return null
    try {
      const d = new Date(returnedDate)
      return Number.isNaN(d.getTime()) ? null : format(d, 'MMM dd, yyyy h:mm a')
    } catch {
      return null
    }
  })()

  const remarksText = (returnRemarks || remarks)?.trim() || 'No specific return reason was provided.'

  return (
    <Card className="shadow-sm mt-6 border-l-4 border-l-destructive border-red-200 bg-gradient-to-r from-red-50/90 via-red-50/50 to-orange-50/30 dark:from-red-950/30 dark:to-red-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <CornerDownLeft className="h-4 w-4 text-red-700 dark:text-red-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-red-800 dark:text-red-300 text-base font-bold">
                Return Reason / Remarks
              </CardTitle>
              {formattedDate && (
                <span className="text-xs text-red-700/80 dark:text-red-400/80 font-medium">
                  {formattedDate}
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-red-600 dark:text-red-400">
              This PR was returned for revision{returnedBy ? ` by ${returnedBy}` : ' by the Approving Authority'}. Please address the remarks below before editing or re-submitting.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="p-3.5 bg-white/90 dark:bg-slate-900/80 rounded-md border border-red-200 dark:border-red-900/60 text-sm font-medium text-red-950 dark:text-red-100 whitespace-pre-wrap leading-relaxed">
          {remarksText}
        </div>
      </CardContent>
    </Card>
  )
}
