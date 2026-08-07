import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

interface RemarksCardProps {
  remarks: string | undefined
}

export function RemarksCard({ remarks }: RemarksCardProps) {
  if (!remarks) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          Additional Remarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded border-l-2 border-blue-500">
          {remarks}
        </p>
      </CardContent>
    </Card>
  )
}
