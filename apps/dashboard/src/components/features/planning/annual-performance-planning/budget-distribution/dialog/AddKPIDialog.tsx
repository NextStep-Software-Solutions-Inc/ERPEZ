/**
 * Add KPI Dialog
 * Allows users to select and add KPIs from the active list
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, Check } from 'lucide-react'
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'
import { AGGREGATION_TYPE_LABELS } from '../constants'

interface AddKPIDialogProps {
  open: boolean
  activeKPIs?: ActivatedKPI[]
  existingKPIIds: Set<string>
  onSelect: (selectedKPIs: ActivatedKPI[]) => void
  onOpenChange: (open: boolean) => void
}

export function AddKPIDialog({ open, activeKPIs = [], existingKPIIds, onSelect, onOpenChange }: AddKPIDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [aggregationFilter, setAggregationFilter] = useState('all')
  const [selectedKPIIds, setSelectedKPIIds] = useState<Set<string>>(new Set())

  const filteredKPIs = (activeKPIs || []).filter((kpi) => {
    // Exclude already added KPIs
    if (existingKPIIds.has(kpi.id)) return false

    // Search filter
    const searchLower = searchQuery.toLowerCase()
    if (!kpi.kpiName.toLowerCase().includes(searchLower) && !kpi.kpiCode?.toLowerCase().includes(searchLower)) {
      return false
    }

    // Aggregation filter
    if (aggregationFilter !== 'all' && kpi.aggregationMethod !== aggregationFilter) {
      return false
    }

    return true
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKPIIds(new Set(filteredKPIs.map((kpi) => kpi.id)))
    } else {
      setSelectedKPIIds(new Set())
    }
  }

  const handleSelectKPI = (kpiId: string, checked: boolean) => {
    const newSelected = new Set(selectedKPIIds)
    if (checked) {
      newSelected.add(kpiId)
    } else {
      newSelected.delete(kpiId)
    }
    setSelectedKPIIds(newSelected)
  }

  const handleAddSelected = () => {
    const selected = activeKPIs.filter((kpi) => selectedKPIIds.has(kpi.id))
    onSelect(selected)
    setSelectedKPIIds(new Set())
    onOpenChange(false)
  }

  const allSelected = filteredKPIs.length > 0 && filteredKPIs.every((kpi) => selectedKPIIds.has(kpi.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span>Add KPIs to OPCR</span>
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select additional KPIs marked as "Available for Shopping" to add to your performance plan.
            These will be negotiable targets that planning will approve.
          </p>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4 pr-4">
            {/* Search Bar */}
            <div className="flex gaps-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              {searchQuery && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  Clear
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter by Type:</label>
                <Select value={aggregationFilter} onValueChange={setAggregationFilter}>
                  <SelectTrigger className="w-40 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SUM">Sum</SelectItem>
                    <SelectItem value="AVERAGE">Average</SelectItem>
                    <SelectItem value="NON_CUMULATIVE">Non-Cumulative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPI List */}
            <div className="border rounded-lg p-3 space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border-b pb-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
                <label htmlFor="select-all" className="flex-1 cursor-pointer text-sm font-semibold">
                  Select All ({filteredKPIs.length} items)
                </label>
              </div>

              {/* Individual KPIs */}
              {filteredKPIs.length > 0 ? (
                filteredKPIs.map((kpi) => (
                  <div key={kpi.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox
                      id={`kpi-${kpi.id}`}
                      checked={selectedKPIIds.has(kpi.id)}
                      onCheckedChange={(checked) => handleSelectKPI(kpi.id, checked as boolean)}
                    />
                    <label htmlFor={`kpi-${kpi.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{kpi.kpiName}</div>
                          <div className="text-xs text-gray-600">{kpi.kpiCode}</div>
                        </div>
                        <Badge className="text-xs">
                          {AGGREGATION_TYPE_LABELS[kpi.aggregationMethod]}
                        </Badge>
                      </div>
                    </label>
                    {selectedKPIIds.has(kpi.id) && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No active KPIs available</p>
                  {searchQuery && <p className="text-xs mt-1">Try adjusting your search</p>}
                </div>
              )}
            </div>

            {/* Selection Count */}
            {filteredKPIs.length > 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                Showing {filteredKPIs.length} of {activeKPIs.length} available KPIs
                {selectedKPIIds.size > 0 && <span className="font-semibold text-blue-700 ml-2">{selectedKPIIds.size} selected</span>}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 border-t pt-4 mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddSelected}
            disabled={selectedKPIIds.size === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Add {selectedKPIIds.size > 0 ? `${selectedKPIIds.size} KPI${selectedKPIIds.size > 1 ? 's' : ''}` : 'KPIs'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
