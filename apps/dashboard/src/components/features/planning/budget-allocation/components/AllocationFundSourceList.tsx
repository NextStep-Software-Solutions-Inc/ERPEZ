import { Plus } from 'lucide-react'
import { FundSourceCard } from './FundSourceCard'
import { Button } from '@/components/ui/button'
import { formatCurrencyPHP } from '@/utils/formatters'

interface AllocationFundSourceListProps {
  allocations: Array<{ fundSourceId: string; allocations: Record<string, number> }>
  totalAllocated: number
  targetAmount: number
  isLoading: boolean
  fsData: any
  remainingAmount: number
  onAddFundSource: () => void
  onUpdateReceivingAmount: (aIdx: number, receivedFundId: string, val: number) => void
  onFundSourceChange: (aIdx: number, fundSourceId: string) => void
  onRemoveAllocation: (index: number) => void
  onRemoveFundReceiving: (aIdx: number, rId: string) => void
}

export function AllocationFundSourceList({
  allocations,
  totalAllocated,
  targetAmount,
  isLoading,
  fsData,
  remainingAmount,
  onAddFundSource,
  onUpdateReceivingAmount,
  onFundSourceChange,
  onRemoveAllocation,
}: AllocationFundSourceListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-t pt-3">
        <div className="flex flex-col">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-600">
            Fund Sources
          </label>
          {allocations.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Total Allocated: {formatCurrencyPHP(totalAllocated)} / {formatCurrencyPHP(targetAmount)}
              {totalAllocated < targetAmount && (
                <span className="text-orange-500 ml-1">
                  ({formatCurrencyPHP(Math.abs(totalAllocated - targetAmount))} remaining)
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={onAddFundSource}
          disabled={isLoading || !targetAmount}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Fund Source
        </Button>
      </div>

      <div className="space-y-2">
        {allocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No fund sources added yet.</p>
            <p className="text-xs mt-1">Set an Amount above, then click "Add Fund Source" to begin allocation.</p>
          </div>
        ) : (
          allocations.map((allocation, idx) => (
            <FundSourceCard
              key={idx}
              index={idx}
              fundSources={fsData?.data || []}
              fundSourceId={allocation.fundSourceId}
              allocations={allocation.allocations}
              selectedFundSources={allocations
                .map((a) => a.fundSourceId)
                .filter((id) => id !== allocation.fundSourceId)}
              maxAvailableAmount={remainingAmount}
              onUpdate={onUpdateReceivingAmount}
              onFundSourceChange={onFundSourceChange}
              onRemove={onRemoveAllocation}
            />
          ))
        )}
      </div>
    </div>
  )
}
