import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface ApproveAPRButtonProps {
  onApprove: () => void
  isSubmitting: boolean
}

export function ApproveAPRButton({
  onApprove,
  isSubmitting,
}: ApproveAPRButtonProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Approve APR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-4">
          Approve this APR and optionally upload a signed copy of the document
        </p>
        <Button
          onClick={onApprove}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? 'Processing...' : 'Approve APR'}
        </Button>
      </CardContent>
    </Card>
  )
}
