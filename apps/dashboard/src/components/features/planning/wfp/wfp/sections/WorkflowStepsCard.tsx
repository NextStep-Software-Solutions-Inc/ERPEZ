import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Calendar, DollarSign, FileText } from 'lucide-react'
import type { OPCR } from '../../opcr/table/types'

interface WorkflowStepsCardProps {
  opcr: OPCR | undefined
}

export const WorkflowStepsCard = ({ opcr }: WorkflowStepsCardProps) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          OPCR WFP Process & Document Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" /> Activities Linked from OPCR
              </p>
              <p className="text-xs text-slate-500">
                {opcr?.activityCount || 0} activities available from linked OPCR via OPCRActivityId.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Quarterly Timeline % Distribution
              </p>
              <p className="text-xs text-slate-500">
                Quarterly targets (Q1–Q4) set as direct percentage values totaling 100%.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Manual PPMP Expenditure Items
              </p>
              <p className="text-xs text-slate-500">
                Attach UACS budget nodes, item descriptions, quantity, and unit costs per activity.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Document Generation (PDF/Excel)
              </p>
              <p className="text-xs text-slate-500">
                Generates physical Work Plan document via QuestPDF/ClosedXML pipeline.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
