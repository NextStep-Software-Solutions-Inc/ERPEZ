import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { BacResolutionLogEntry } from '../types'

interface BacResolutionActivityLogProps {
  entries: BacResolutionLogEntry[]
}

export function BacResolutionActivityLog({
  entries,
}: BacResolutionActivityLogProps) {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('en-PH')}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By {entry.actor}
                  </p>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
