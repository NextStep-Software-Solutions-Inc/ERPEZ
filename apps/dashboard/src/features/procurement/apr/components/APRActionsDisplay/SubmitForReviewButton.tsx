import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface SubmitForReviewButtonProps {
  onSubmit: () => void
  isSubmitting: boolean
}

export function SubmitForReviewButton({
  onSubmit,
  isSubmitting,
}: SubmitForReviewButtonProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          Submit for Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-4">
          Send this APR to the approver for review and approval
        </p>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </CardContent>
    </Card>
  )
}
