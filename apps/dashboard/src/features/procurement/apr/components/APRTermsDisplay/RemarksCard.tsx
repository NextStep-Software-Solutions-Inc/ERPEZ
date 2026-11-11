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
    <Card className="border border-border shadow-xs bg-card text-card-foreground rounded-2xl overflow-hidden">
      <CardHeader className="py-3 px-5 border-b border-border/70 bg-slate-50/60 dark:bg-slate-900/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Additional Remarks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-border rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
          {remarks}
        </div>
      </CardContent>
    </Card>
  )
}
