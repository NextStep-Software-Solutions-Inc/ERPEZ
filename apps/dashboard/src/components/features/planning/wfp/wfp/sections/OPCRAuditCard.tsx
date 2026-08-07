import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'

interface OPCRAuditCardProps {
  wfp: WFPDetails
}

export const OPCRAuditCard = ({ wfp }: OPCRAuditCardProps) => {
  return (
    <Card className="border-gray-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-xs">
          <div>
            <p className="text-gray-600 mb-1">Created</p>
            <p className="font-semibold text-gray-900">
              {new Date(wfp?.createdAt || '').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="pt-3 border-t text-gray-600 italic">
            <span className="text-xs">No modifications yet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
