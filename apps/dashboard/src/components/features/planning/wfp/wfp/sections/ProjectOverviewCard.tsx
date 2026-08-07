import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Target, FileText, Clock } from 'lucide-react'
import type { WFPDetails } from '../table/types'
import { formatDisplayDate } from '@/utils/formatters'

interface ProjectOverviewCardProps {
  wfp: WFPDetails
}

export const ProjectOverviewCard = ({ wfp }: ProjectOverviewCardProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-[#10B981]/10 to-blue-50/10 border-b">
        <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
          <FileText className="h-5 w-5 text-[#10B981]" />
          Project Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Implementation Dates */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#10B981]" />
            Implementation Timeline
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
              <p className="text-lg font-bold text-gray-800">{formatDisplayDate(wfp.projectStartDate)}</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-50/50 border border-green-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End Date</p>
              <p className="text-lg font-bold text-gray-800">{formatDisplayDate(wfp.projectEndDate)}</p>
            </div>
          </div>
        </div>

        {/* General Objective */}
        <div className="space-y-3 pt-2 border-t">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#10B981]" />
            General Objective
          </div>
          <p className="text-gray-700 leading-relaxed text-base">{wfp.generalObjective || 'No objective specified'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
