import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { OPCR } from '../../opcr/table/types'

interface OPCROverviewCardProps {
  opcr: OPCR | undefined
}

export const OPCROverviewCard = ({ opcr }: OPCROverviewCardProps) => {
  if (!opcr) return null

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{opcr.name}</CardTitle>
            <CardDescription className="mt-1">{opcr.code}</CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">{opcr.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Counts & Timeline */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-600 mb-1">Activities</p>
                <p className="text-xl font-bold text-blue-600">{opcr.activityCount || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">KPI Targets</p>
                <p className="text-xl font-bold text-blue-600">{opcr.kpiAssignmentCount || 0}</p>
              </div>
            </div>
            {opcr.fiscalYear && (
              <div className="pt-3 border-t text-sm">
                <p className="text-xs text-gray-600 mb-2">Fiscal Year</p>
                <p className="font-semibold text-gray-900">{opcr.fiscalYear.year}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(opcr.fiscalYear.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(opcr.fiscalYear.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Budget Ceiling */}
          <div className="bg-white rounded p-4 border border-blue-200">
            <p className="text-xs text-gray-600 mb-2">Budget Ceiling</p>
            <p className="text-2xl font-bold text-orange-600">₱{(opcr.totalBudget || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-3">All financial items must not exceed this limit</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
