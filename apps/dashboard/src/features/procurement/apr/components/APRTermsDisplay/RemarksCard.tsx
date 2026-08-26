/**
 * Remarks Card Component
 * Displays additional remarks or notes in a clean read-only callout card
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface RemarksCardProps {
  remarks?: string
}

export function RemarksCard({ remarks }: RemarksCardProps) {
  if (!remarks) return null

  return (
    <Card className="border border-gray-200 shadow-xs bg-white">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Additional Remarks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="p-3.5 bg-slate-50 border rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
          {remarks}
        </div>
      </CardContent>
    </Card>
  )
}
