// AddPerformanceMeasureDropdown component

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddPerformanceMeasureDropdownProps {
  showAddMenu: boolean
  setShowAddMenu: (show: boolean) => void
  availableMeasures: Array<{ id: string; name: string }>
  onAddMeasure: (measureId: string) => void
  isLoading?: boolean
}

export default function AddPerformanceMeasureDropdown({
  showAddMenu,
  setShowAddMenu,
  availableMeasures,
  onAddMeasure,
  isLoading = false,
}: AddPerformanceMeasureDropdownProps) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowAddMenu(!showAddMenu)}
        disabled={isLoading}
        className="gap-2"
      >
        Add Performance Measure
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Dropdown menu for available measures */}
      {showAddMenu && (
        <div className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            {availableMeasures.map((measure) => (
              <button
                key={measure.id}
                type="button"
                onClick={() => onAddMeasure(measure.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium text-sm">{measure.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}