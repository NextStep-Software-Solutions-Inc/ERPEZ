import { Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'

interface OPCRStatusCardProps {
  wfp: WFPDetails
}

export const OPCRStatusCard = ({ wfp }: OPCRStatusCardProps) => {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-600 mb-1">Current State</p>
            <Badge
              variant={wfp?.status === 'Draft' ? 'outline' : undefined}
              className="text-xs"
            >
              {wfp?.status}
            </Badge>
          </div>
          <div className="pt-3 border-t text-xs space-y-2">
            <div className="flex items-center gap-2">
              {wfp?.status === 'Draft' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-gray-600">Ready for editing</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Submitted</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
