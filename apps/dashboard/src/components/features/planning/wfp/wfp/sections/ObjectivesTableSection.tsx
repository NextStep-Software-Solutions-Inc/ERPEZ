import { Target } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import { Column, Toolbar } from '@/components/features/planning/wfp/wfp-objective/table'
import type { WFPObjective } from '@/components/features/planning/wfp/wfp-objective/table/types'
import type { WFPDetails } from '../table/types'
import type { MetaActions } from '@/types/global'

interface ObjectivesTableSectionProps {
  wfpData: WFPDetails
  transformedObjectives: WFPObjective[]
  remainingWeight: number
  actions: MetaActions
}

export const ObjectivesTableSection = ({
  wfpData,
  transformedObjectives,
  remainingWeight,
  actions,
}: ObjectivesTableSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/10 rounded-lg">
            <Target className="h-5 w-5 text-[#10B981]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Objectives
            </h2>
            <p className="text-sm text-gray-500">
              {wfpData?.data.wfpObjectives?.length || 0} objectives defined
            </p>
          </div>
        </div>
        {remainingWeight > 0 && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700">
              Remaining Weight: <span className="text-lg">{remainingWeight}%</span>
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <TemplateTable  
          data={transformedObjectives}
          columns={Column}
          actions={actions}
          readonly={false}
          toolbar={(table) => (
            <Toolbar 
              table={table} 
              remainingWeight={remainingWeight}
            />
          )}
          meta={{ wfps: wfpData?.data || [] }}
          fixedPageSize={10}
        />
      </div>
    </div>
  )
}
