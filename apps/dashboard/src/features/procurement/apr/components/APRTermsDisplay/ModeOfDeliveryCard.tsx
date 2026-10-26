/**
 * Mode of Delivery Card Component
 * Clean neutral display of delivery configuration
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import type { ModeOfDelivery } from '@/features/procurement/apr/types'

interface ModeOfDeliveryCardProps {
  mode: ModeOfDelivery | string | undefined
}

const MODE_LABELS: Record<string, { label: string; description: string }> = {
  FAST_LANE: { label: 'Fast Lane Delivery', description: 'Priority dispatch directly via PS-DBM Fast Lane' },
  FastLane: { label: 'Fast Lane Delivery', description: 'Priority dispatch directly via PS-DBM Fast Lane' },
  SCHEDULED_PICKUP: { label: 'Scheduled Pick-up', description: 'Designated agency representative to pick up items at warehouse' },
  ScheduledPickUp: { label: 'Scheduled Pick-up', description: 'Designated agency representative to pick up items at warehouse' },
  ScheduledPickup: { label: 'Scheduled Pick-up', description: 'Designated agency representative to pick up items at warehouse' },
  DOOR_TO_DOOR: { label: 'Door-to-Door Delivery', description: 'Direct logistics delivery to agency premises' },
  DoorToDoor: { label: 'Door-to-Door Delivery', description: 'Direct logistics delivery to agency premises' },
}

export function ModeOfDeliveryCard({ mode }: ModeOfDeliveryCardProps) {
  const current = (mode && MODE_LABELS[mode]) ? MODE_LABELS[mode] : { label: mode || 'Fast Lane', description: 'How items will be delivered from PS-DBM' }

  return (
    <Card className="border border-gray-200 shadow-xs bg-white">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-primary" />
          Mode of Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-1">
        <p className="font-semibold text-sm text-gray-900">{current.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {current.description}
        </p>
      </CardContent>
    </Card>
  )
}
