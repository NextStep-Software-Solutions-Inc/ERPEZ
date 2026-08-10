import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface ReturnForRevisionsButtonProps {
  onReturn: () => void
  isSubmitting: boolean
}

export function ReturnForRevisionsButton({
  onReturn,
  isSubmitting,
}: ReturnForRevisionsButtonProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          Return for Revisions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-4">
          Send this APR back to the requester for corrections and revisions
        </p>
        <Button
          onClick={onReturn}
          disabled={isSubmitting}
          variant="outline"
          className="w-full border-amber-300 hover:bg-amber-50 text-amber-700"
        >
          {isSubmitting ? 'Processing...' : 'Return for Revisions'}
        </Button>
      </CardContent>
    </Card>
  )
}
