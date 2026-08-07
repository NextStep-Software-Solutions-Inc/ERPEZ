import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import type { ModeOfDelivery } from '@/features/procurement/apr/types'

interface ModeOfDeliveryCardProps {
  mode: ModeOfDelivery | undefined
}

const MODE_LABELS: Record<string, string> = {
  FAST_LANE: 'Fast Lane Delivery',
  SCHEDULED_PICKUP: 'Scheduled Pickup',
  DOOR_TO_DOOR: 'Door-to-Door Delivery',
}

export function ModeOfDeliveryCard({ mode }: ModeOfDeliveryCardProps) {
  if (!mode) return null

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-blue-600" />
          Mode of Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-blue-900">{MODE_LABELS[mode] || mode}</p>
        <p className="text-xs text-blue-700 mt-1">How items will be delivered</p>
      </CardContent>
    </Card>
  )
}
