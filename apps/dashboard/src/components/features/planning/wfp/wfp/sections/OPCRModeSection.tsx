import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'
import type { OPCR } from '../../opcr/table/types'
import { BudgetConstraintTracker } from '@/components/features/planning/wfp/wfp/components/BudgetConstraintTracker'
import { OPCRProjectOverview } from './OPCRProjectOverview'
import { OPCRActivitiesCard } from './OPCRActivitiesCard'
import { OPCRDetailCard } from './OPCRDetailCard'

interface OPCRModeSectionProps {
  wfp: WFPDetails
  linkedOPCR: OPCR
  wfpId: string
  opcrsLoading: boolean
  isLoading: boolean
  onAssignOPCROpen: () => void
}

export const OPCRModeSection = ({
  wfp,
  linkedOPCR,
  wfpId,
  opcrsLoading,
  isLoading,
  onAssignOPCROpen,
}: OPCRModeSectionProps) => {
  const [showActivities, setShowActivities] = useState(false)

  return (
    <div className="space-y-8">
      <OPCRProjectOverview wfp={wfp} />

      {/* SPMS: Assign OPCR or Show Assigned OPCR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {linkedOPCR ? 'Assigned OPCR' : 'Select OPCR for Planning'}
              </h2>
              {linkedOPCR && (
                <p className="text-sm text-gray-500">
                  This WFP is linked to this OPCR
                </p>
              )}
            </div>
          </div>
        </div>

        {opcrsLoading || isLoading ? (
          <Card className="shadow-sm border border-amber-100">
            <CardContent className="pt-8 pb-8 flex items-center justify-center gap-4">
              <p className="text-muted-foreground">Loading OPCR details...</p>
            </CardContent>
          </Card>
        ) : !linkedOPCR ? (
          <Card className="shadow-sm border-2 border-amber-200 bg-amber-50/50">
            <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center gap-6">
              <Target className="h-16 w-16 text-amber-400" />
              <div className="text-center space-y-2">
                <p className="text-gray-800 font-semibold text-lg">No OPCR Assigned Yet</p>
                <p className="text-gray-600">
                  To complete the WFP planning process, select an existing OPCR to link to this WFP
                </p>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white mt-4"
                onClick={onAssignOPCROpen}
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign OPCR
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <OPCRDetailCard
              linkedOPCR={linkedOPCR}
              showActivities={showActivities}
              onToggleActivities={() => setShowActivities(!showActivities)}
            />

            {showActivities && linkedOPCR && (
              <OPCRActivitiesCard linkedOPCR={linkedOPCR} wfpId={wfpId} />
            )}

            {showActivities && linkedOPCR?.activities?.length > 0 && (
              <BudgetConstraintTracker
                budgetCeiling={linkedOPCR?.totalBudget || 0}
                currentExpenditure={0}
                labels={{
                  ceiling: 'OPCR Total Budget',
                  current: 'Total OPCR Expenditures',
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
