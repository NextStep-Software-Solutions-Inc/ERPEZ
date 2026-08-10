import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'

interface SubmissionActionsCardProps {
  wfp: WFPDetails
  onPrint: () => void
  onMarkReady: () => void
}

export const SubmissionActionsCard = ({
  wfp,
  onPrint,
  onMarkReady,
}: SubmissionActionsCardProps) => {
  if (wfp?.status !== 'Draft') return null

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-base">Submission Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="gap-2 justify-center"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 justify-center"
            onClick={onMarkReady}
          >
            <Download className="w-4 h-4" />
            Mark Ready
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
