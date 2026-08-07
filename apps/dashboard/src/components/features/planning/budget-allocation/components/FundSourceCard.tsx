import { X } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFundReceivingsRequest } from '../../fund-receiving/handlers/getFundReceivingsRequest'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrencyPHP, toTitleCase } from '@/utils/formatters'
import LoadingSpinner from '@/components/LoadingSpinner'

const useFundReceivings = createQueryHookFromTemplate(getFundReceivingsRequest)
interface FundSource {
  id: string
  name: string
}
interface FundSourceCardProps {
  index: number
  fundSources: Array<FundSource>
  fundSourceId?: string
  allocations?: Record<string, number>
  selectedFundSources?: Array<string>
  maxAvailableAmount?: number
  onRemove: (index: number) => void
  onRemoveFundReceiving?: (
    allocationIndex: number,
    receivedFundId: string,
  ) => void
  onUpdate: (index: number, receivedFundId: string, value: number) => void
  onFundSourceChange?: (index: number, fundSourceId: string) => void
}

export function FundSourceCard({
  index,
  fundSources,
  fundSourceId = '',
  allocations = {},
  selectedFundSources = [],
  maxAvailableAmount = Infinity,
  onRemove,
  onUpdate,
  onFundSourceChange,
}: FundSourceCardProps) {
  const {
    data: fundReceivings,
    isLoading,
    error,
  } = useFundReceivings({
    pathParams: {},
    queryParams: {
      filters: `fundSourceId==${fundSourceId}`,
      pageNumber: 1,
      pageSize: 1000,
    },
    enabled: !!fundSourceId,
  })

  const totalAllocated =
    fundReceivings?.data.reduce(
      (sum, r) => sum + (allocations[r.id] || 0),
      0,
    ) || 0

  const fundSourcesList = fundSources
    .filter(
      (fs) => !selectedFundSources.includes(fs.id) || fs.id === fundSourceId,
    )
    .map((fs) => (
      <SelectItem key={fs.id} value={fs.id.toString()}>
        {toTitleCase(fs.name)}
      </SelectItem>
    ))
  return (
    <Card className="p-3 gap-0 border border-gray-200 shadow-sm bg-white">
      <div className="flex justify-between items-center border-b border-gray-50 mb-2 pb-1">
        <h4 className="font-bold text-blue-700">Source {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-6 w-6 text-red-500"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mb-2">
        <div className="space-y-1">
          <label className="text-sm uppercase font-medium text-gray-500">
            Select Fund Source
          </label>
          <Select
            value={fundSourceId}
            disabled={isLoading}
            onValueChange={(v) => {
              onFundSourceChange?.(index, v)
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Choose source..." />
            </SelectTrigger>
            <SelectContent>{fundSourcesList}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm uppercase font-medium text-gray-500">
            Total allocated
          </label>
          <Input
            value={formatCurrencyPHP(totalAllocated)}
            readOnly
            className="h-8 bg-gray-50 font-mono"
          />
        </div>
      </div>

      <div className="rounded-md border border-blue-50 bg-blue-50/30 p-2">
        {isLoading ? (
          <div className="py-2 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : error ? (
          <div className="py-2 text-sm text-red-600 text-center">
            Error loading fund receivings: {String(error)}
          </div>
        ) : fundReceivings?.data.length === 0 ? (
          <div className="py-1 text-sm text-gray-400 text-center italic">
            No items available.
          </div>
        ) : (
          <>
            {fundReceivings?.data.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-center gap-2 py-1 border-b border-blue-100 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-700 leading-tight">
                    {toTitleCase(r.description)}
                  </span>
                  <span className="text-sm text-gray-400">
                    Available: {formatCurrencyPHP(Number(r.remainingBalance))}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ₱
                  </span>
                  <Input
                    type="number"
                    className="h-7 pl-5"
                    min="0"
                    max={Math.min(
                      Number(r.remainingBalance) || 0,
                      maxAvailableAmount + (allocations[r.id] || 0),
                    )}
                    step="0.01"
                    value={allocations[r.id] || ''}
                    onChange={(e) => {
                      const currentVal = allocations[r.id] || 0
                      const maxAllowed = Math.min(
                        Number(r.remainingBalance) || 0,
                        maxAvailableAmount + currentVal,
                      )
                      const val = Math.min(Number(e.target.value) || 0, maxAllowed)
                      onUpdate(index, r.id, val)
                    }}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100"
                  onClick={() => {
                    const currentVal = allocations[r.id] || 0
                    const maxAllowed = Math.min(
                      Number(r.remainingBalance) || 0,
                      maxAvailableAmount + currentVal,
                    )
                    onUpdate(index, r.id, maxAllowed)
                  }}
                  disabled={isLoading || Number(r.remainingBalance) <= 0}
                >
                  Max
                </Button>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  )
}
