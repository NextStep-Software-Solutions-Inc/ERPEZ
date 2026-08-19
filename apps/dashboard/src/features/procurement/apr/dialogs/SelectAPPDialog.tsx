/**
 * Select APP Dialog Component
 * 
 * Compatibility wrapper for SelectAPPDialog.
 * Delegated to the consolidated CreateAPRDialog wizard.
 */

import { ConsolidatedAPRItem } from '../types'

interface SelectAPPDialogProps {
  onSelectAPP?: (
    appId: string,
    lineItemIds: string[],
    consolidatedItems: ConsolidatedAPRItem[],
    selectedApp?: any,
    selectedAppIds?: string[],
    selectedApps?: any[]
  ) => void
}

export function SelectAPPDialog(_props: SelectAPPDialogProps) {
  // Legacy stub: APP selection is now integrated directly in the CreateAPRDialog Stepper Wizard
  return null
}
