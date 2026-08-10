/**
 * PPMP Version Selector - Displays amended PPMP options with checkboxes
 * Allows users to select which amended PPMPs to include in supplemental
 */

import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { PPMPVersion } from '../types'

interface PPMPVersionSelectorProps {
  versions: PPMPVersion[]
  selectedVersionIds: Set<string>
  onToggleVersion: (versionId: string) => void
  isDisabled?: boolean
}

export function PPMPVersionSelector({
  versions,
  selectedVersionIds,
  onToggleVersion,
  isDisabled = false,
}: PPMPVersionSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Amended PPMP Version(s) *</Label>
      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
        {versions.map((ppmp) => (
          <label key={ppmp.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={selectedVersionIds.has(ppmp.id)}
              onChange={() => onToggleVersion(ppmp.id)}
              disabled={isDisabled}
              className="mt-1 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{ppmp.label}</p>
              <p className="text-xs text-gray-600 mt-1">{ppmp.description}</p>
            </div>
          </label>
        ))}
      </div>

      {selectedVersionIds.size > 0 && (
        <Card className="mt-3 border-green-200 bg-green-50">
          <CardContent className="pt-4 text-sm">
            <p className="text-green-900 font-medium">{selectedVersionIds.size} PPMP version(s) selected</p>
            <p className="text-green-700 text-xs mt-1">Selected amendments will be combined into one supplemental APP</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
