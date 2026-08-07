/**
 * Supplemental APP Metadata Step - First step in two-step workflow
 * Collects quarter, reference memo, and approval document
 */

import { APPInfoCard } from './APPInfoCard'
import { SupplementalAPPMetadataForm, type SupplementalMetadataFormValues } from '../forms/SupplementalAPPMetadataForm'
import type { AppMaster } from '../types'

interface MetadataStepProps {
  app: AppMaster | null
  onSubmit: (values: SupplementalMetadataFormValues) => Promise<void>
  isLoading?: boolean
}

export function MetadataStep({ app, onSubmit, isLoading = false }: MetadataStepProps) {
  if (!app) {
    return <div className="py-6 text-center text-gray-500">No APP selected. Please select an APP first.</div>
  }

  return (
    <div className="space-y-6 py-4">
      <APPInfoCard app={app} label="Creating Supplemental For" />
      <SupplementalAPPMetadataForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  )
}
