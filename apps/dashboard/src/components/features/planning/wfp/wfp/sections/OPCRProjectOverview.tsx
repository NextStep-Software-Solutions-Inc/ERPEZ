import { Target, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'
import { formatDisplayDate } from '@/utils/formatters'

interface OPCRProjectOverviewProps {
  wfp: WFPDetails
}

export const OPCRProjectOverview = ({ wfp }: OPCRProjectOverviewProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-amber-50/20 to-orange-50/20 border-b">
        <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
          <FileText className="h-5 w-5 text-amber-600" />
          OPCR Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* OPCR Timeline */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Timeline
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
              <p className="text-lg font-bold text-gray-800">{formatDisplayDate(wfp.projectStartDate)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-50/50 border border-orange-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End Date</p>
              <p className="text-lg font-bold text-gray-800">{formatDisplayDate(wfp.projectEndDate)}</p>
            </div>
          </div>
        </div>

        {/* OPCR Objective */}
        <div className="space-y-3 pt-2 border-t">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            General Objective
          </div>
          <p className="text-gray-700 leading-relaxed text-base">{wfp.generalObjective || 'No objective specified'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
