import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BiddingMasterCalendarLegend() {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Legend</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline" color="warning">
          Hard conflict
        </Badge>
        <Badge variant="outline" color="info">
          Overloaded day
        </Badge>
        <Badge variant="outline" color="secondary">
          APP target month
        </Badge>
        <Badge variant="outline" color="warning">
          Due soon
        </Badge>
        <Badge variant="outline" color="destructive">
          Overdue
        </Badge>
        <Badge variant="outline" color="success">
          Locked schedule
        </Badge>
      </CardContent>
    </Card>
  )
}
