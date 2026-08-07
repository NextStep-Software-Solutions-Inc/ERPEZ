/**
 * APP Info Card - Displays basic APP information
 * Used in both metadata and PPMP selection steps
 */

import { Card, CardContent } from '@/components/ui/card'
import type { AppMaster } from '../types'

interface APPInfoCardProps {
  app: AppMaster
  label: string
}

export function APPInfoCard({ app, label }: APPInfoCardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4 text-sm">
        <p className="text-gray-600 font-medium mb-1">{label}</p>
        <p className="text-gray-900 font-semibold">{app.appName}</p>
        <p className="text-gray-600 text-xs mt-1">Code: {app.appCode}</p>
        <p className="text-gray-600 text-xs">
          Budget: ₱{app.aggregationResults?.totalAmount?.toLocaleString('en-PH', { maximumFractionDigits: 2 }) || '0'}
        </p>
      </CardContent>
    </Card>
  )
}
