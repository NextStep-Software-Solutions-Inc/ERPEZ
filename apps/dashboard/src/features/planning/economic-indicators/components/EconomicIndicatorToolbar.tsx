import { useAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createEconomicIndicatorDialogOpenAtom } from '../atoms'
import { ReusableFiscalYearSelector } from '../../fiscal-year-and-policies/fiscal-year-management/components/ReusableFiscalYearSelector'

interface EconomicIndicatorToolbarProps {
  fiscalYearId: string
  onFiscalYearChange: (id: string) => void
}

export function EconomicIndicatorToolbar({
  fiscalYearId,
  onFiscalYearChange,
}: EconomicIndicatorToolbarProps) {
  const [, setCreateDialogOpen] = useAtom(createEconomicIndicatorDialogOpenAtom)

  const handleCreateClick = () => setCreateDialogOpen(true)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 items-center">
          <div className="w-full sm:w-64">
            <ReusableFiscalYearSelector
              onFiscalYearChange={(_, id) => onFiscalYearChange(id)}
              placeholder="Filter by Year"
              showAllOption={true}
              allOptionLabel="All Fiscal Years"
              autoSelectFirst={false}
              size="sm"
              value={fiscalYearId}
            />
          </div>

          {fiscalYearId === 'all' && (
            <p className="text-xs text-muted-foreground font-medium">
              Viewing all fiscal years' economic indicators
            </p>
          )}
        </div>

        <Button onClick={handleCreateClick} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Indicator
        </Button>
      </div>
    </div>
  )
}
