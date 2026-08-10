import { Card, CardContent } from '@/components/ui/card'
import { BriefcaseIcon, UserCheck, UserMinus, AlertCircle } from 'lucide-react'
import { usePositionsStatistics } from '../hooks/usePositionsStatistics'

export default function PlantillaKPICards() {
  const { data, isLoading, error } = usePositionsStatistics()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm border border-default-200 bg-card">
            <CardContent className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-3 bg-default-200 rounded w-24" />
                <div className="h-6 bg-default-200 rounded w-12" />
                <div className="h-1 bg-default-200 rounded w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm border border-destructive/20 bg-destructive/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Failed to load statistics</p>
              <p className="text-xs text-default-500 mt-1">Unable to fetch positions statistics from the server</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalAuthorized = data?.totalPositions || 0
  const filledPositions = data?.filledPositions || 0
  const vacancyRate = Math.round(data?.vacancyVariance || 0)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm border border-default-200 bg-card">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-default-500 tracking-wider">Total Authorized Items</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-default-900">{totalAuthorized}</h3>
              <span className="text-[10px] font-medium text-default-400">Positions</span>
            </div>
            <div className="mt-2 h-1 w-24 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <BriefcaseIcon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-default-200 bg-card">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-default-500 tracking-wider">Active Incumbents</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-default-900">{filledPositions}</h3>
              <span className="text-[10px] font-medium text-default-400">On-Duty</span>
            </div>
            <div className="mt-2 h-1 w-24 bg-success/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full transition-all" 
                style={{ width: `${totalAuthorized > 0 ? (filledPositions / totalAuthorized * 100) : 0}%` }} 
              />
            </div>
          </div>
          <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success">
            <UserCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-default-200 bg-card">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-default-500 tracking-wider">Vacancy Variance</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-default-900">{vacancyRate}%</h3>
              <span className="text-[10px] font-medium text-default-400">Unfilled</span>
            </div>
            <div className="mt-2 h-1 w-24 bg-warning/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning rounded-full transition-all" 
                style={{ width: `${Math.min(vacancyRate, 100)}%` }} 
              />
            </div>
          </div>
          <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center text-warning">
            <UserMinus className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
