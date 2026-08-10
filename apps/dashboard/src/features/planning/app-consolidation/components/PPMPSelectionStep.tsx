/**
 * PPMP Selection Step - Second step in two-step workflow
 * Displays available amended PPMPs and allows user selection
 */

import { APPInfoCard } from './APPInfoCard'
import { PPMPVersionSelector } from './PPMPVersionSelector'
import type { AppMaster, PPMPItem } from '../types'

interface PPMPVersion {
  id: string
  ppmpId: string
  version: string
  label: string
  description: string
  items: PPMPItem[]
}

interface PPMPSelectionStepProps {
  app: AppMaster | null
  quarter?: string
  availableVersions: PPMPVersion[]
  selectedVersionIds: Set<string>
  onToggleVersion: (versionId: string) => void
  isDisabled?: boolean
}

export function PPMPSelectionStep({
  app,
  quarter,
  availableVersions,
  selectedVersionIds,
  onToggleVersion,
  isDisabled = false,
}: PPMPSelectionStepProps) {
  if (!app) {
    return <div className="py-6 text-center text-gray-500">No APP selected. Please select an APP first.</div>
  }

  if (availableVersions.length === 0) {
    return <div className="py-6 text-center text-gray-500">No amended PPMPs found for this APP.</div>
  }

  return (
    <div className="space-y-5 py-4">
      <APPInfoCard app={app} label="Supplementing" />
      <PPMPVersionSelector
        versions={availableVersions}
        selectedVersionIds={selectedVersionIds}
        onToggleVersion={onToggleVersion}
        isDisabled={isDisabled}
      />
    </div>
  )
}
