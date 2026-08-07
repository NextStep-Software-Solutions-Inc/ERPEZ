import { Plus, TrendingUp, DollarSign } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDisplayDate } from '@/utils/formatters'
import { createDialogAtom } from '@/components/features/planning/wfp/wfp-expenditure/atoms'
import CreateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/CreateWFPObjectiveTargetExpenditureDialog'
import UpdateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/UpdateWFPObjectiveTargetExpenditureDialog'
import DeleteWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/DeleteWFPObjectiveTargetExpenditureDialog'

interface ActivityData {
  id: string
  name: string
  description: string
  indicator: string
  weight: number
  quarterlyTargets?: {
    q1?: number
    q2?: number
    q3?: number
    q4?: number
  }
}

interface ExpenditureRecord {
  id: string
  activityId: string
  description: string
  amount: number
  quarter: string
  date: string
}

function WFPOPCRActivityExpenditureDetailPage({
  wfpId,
  activityId,
  activityName,
}: {
  wfpId: string
  activityId: string
  activityName?: string
}) {
  const setCreateDialog = useSetAtom(createDialogAtom)

  // Mock activity data - in real implementation, fetch from WFP/OPCR
  const mockActivity: ActivityData = {
    id: activityId,
    name: activityName || 'Develop Core Features',
    description: 'Build and implement core product features',
    indicator: 'Features Completed',
    weight: 40,
    quarterlyTargets: { q1: 2, q2: 3, q3: 4, q4: 3 },
  }

  // Mock expenditures for this activity
  const mockExpenditures: ExpenditureRecord[] = [
    {
      id: 'exp-1',
      activityId: activityId,
      description: 'Developer Resources - Q1',
      amount: 25000,
      quarter: 'Q1',
      date: new Date(2026, 0, 15).toISOString().split('T')[0],
    },
    {
      id: 'exp-2',
      activityId: activityId,
      description: 'Testing Tools License',
      amount: 5000,
      quarter: 'Q1',
      date: new Date(2026, 0, 20).toISOString().split('T')[0],
    },
  ]

  const totalExpenditure = mockExpenditures.reduce((sum, exp) => sum + exp.amount, 0)
  const budgetAllocation = (mockActivity.quarterlyTargets?.q1 ?? 0) * 10000 // Assume 10k per unit as mock

  return (
    <PageContainer
      title={`Manage Expenditures - ${mockActivity.name}`}
      backTo={{
        to: '/v2/wfp/$wfpId',
        params: { wfpId },
      }}
      backLabel="Back to WFP Details"
    >
      <div className="space-y-4 mx-auto">
        {/* Activity Header - Green Theme */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 pt-4 pb-0 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            Activity Details
          </div>
          <div className="p-4 pt-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{mockActivity.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{mockActivity.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md border border-emerald-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">Performance Indicator</p>
                <p className="text-sm font-semibold text-gray-700">{mockActivity.indicator}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-emerald-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">Weight</p>
                <p className="text-sm font-bold text-emerald-700">{mockActivity.weight}%</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-emerald-100">
                <p className="text-[11px] text-gray-500 font-medium mb-1">Q1 Target</p>
                <p className="text-sm font-bold text-gray-900">{mockActivity.quarterlyTargets?.q1 ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Allocation Card - Blue Theme */}
        <div className="rounded-lg border border-blue-100 bg-blue-50/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
              <DollarSign className="h-4 w-4" />
              Budget Status
            </div>
          </div>
          <div className="p-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Budget Allocation</p>
                <p className="text-lg font-bold text-blue-700">${budgetAllocation.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Expenditure</p>
                <p className="text-lg font-bold text-amber-700">${totalExpenditure.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Remaining Budget</p>
                <p
                  className={`text-lg font-bold ${totalExpenditure > budgetAllocation ? 'text-red-700' : 'text-green-700'}`}
                >
                  ${Math.max(0, budgetAllocation - totalExpenditure).toLocaleString()}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${totalExpenditure > budgetAllocation ? 'bg-red-500' : totalExpenditure > budgetAllocation * 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (totalExpenditure / budgetAllocation) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {((totalExpenditure / budgetAllocation) * 100).toFixed(1)}% utilized
            </p>
          </div>
        </div>

        {/* Expenditures Header */}
        <div className="flex items-center justify-between pt-4">
          <h2 className="text-xl font-bold text-gray-900">Expenditures</h2>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex gap-2"
            onClick={() =>
              setCreateDialog({
                isOpen: true,
                showUnsavedWarning: false,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add Expenditure
          </Button>
        </div>

        {/* Expenditures List */}
        <div className="space-y-4">
          {mockExpenditures.length > 0 ? (
            mockExpenditures.map((expenditure, index) => (
              <div key={expenditure.id} className="relative pl-3 py-0">
                {/* Left Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                <Card className="shadow-none border-gray-100">
                  <CardContent className="py-4 px-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-start flex-1">
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-800">{expenditure.description}</h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDisplayDate(expenditure.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-700">${expenditure.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{expenditure.quarter}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No expenditures recorded for this activity yet.</p>
          )}
        </div>

        {/* Quarterly Breakdown */}
        {mockExpenditures.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quarterly Breakdown</h3>
            <div className="grid grid-cols-4 gap-3">
              {['q1', 'q2', 'q3', 'q4'].map((quarter) => (
                <div key={quarter} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">{quarter.toUpperCase()} Target</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockActivity.quarterlyTargets?.[quarter as keyof typeof mockActivity.quarterlyTargets] ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Est. Budget: ${((mockActivity.quarterlyTargets?.[quarter as keyof typeof mockActivity.quarterlyTargets] ?? 0) * 10000).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateWFPObjectiveTargetExpenditureDialog wfpObjectiveId={activityId} />
      <UpdateWFPObjectiveTargetExpenditureDialog />
      <DeleteWFPObjectiveTargetExpenditureDialog />
    </PageContainer>
  )
}

export default WFPOPCRActivityExpenditureDetailPage
