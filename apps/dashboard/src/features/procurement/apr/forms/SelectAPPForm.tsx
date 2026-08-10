/**
 * Select APP Form Component
 * 
 * Main form handler for APP selection and line item picking
 * Uses TanStack Form with Zod validation
 * No internal submit/cancel buttons (controlled by dialog footer)
 * Delegates UI responsibility to field components
 * Focused form logic only - <200 lines
 */

import { useMemo, useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { APPSelectField } from '../components/APPSelectField'
import { LineItemsSelectField } from '../components/LineItemsSelectField'
import { ValidationAlerts } from '../components/ValidationAlerts'
import { APRItemsPreview } from '../components/APRItemsPreview'
import { getApprovedAPPsRequest } from '../handlers/getApprovedAPPsRequest'
import { useAPPApprovalValidation } from '../hooks'
import { convertAppLineItemsToAPRItems, validateBudgetCeiling } from '../utils'
import type { ConsolidatedAPRItem } from '../types'

const useApprovedAPPs = createQueryHookFromTemplate(getApprovedAPPsRequest)

export type SelectAppFormValues = {
  selectedAppId: string
  selectedLineItemIds: string[]
  consolidatedItems: ConsolidatedAPRItem[]
}

interface SelectAPPFormProps {
  formId: string
  onSubmit: (values: SelectAppFormValues) => void
  onValidationChange?: (isValid: boolean) => void
  fiscalYear?: number
}

export function SelectAPPForm({
  formId,
  onSubmit,
  onValidationChange,
  fiscalYear = new Date().getFullYear(),
}: SelectAPPFormProps) {
  const { data: appsResponse, isLoading: appsLoading } = useApprovedAPPs({
    enabled: true,
  })

  const apps = useMemo(() => appsResponse?.data || [], [appsResponse])
  const filteredApps = useMemo(
    () => apps.filter((app) => app.fiscalYear === fiscalYear),
    [apps, fiscalYear]
  )

  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<string[]>([])

  const form = useForm({
    defaultValues: {
      selectedAppId: '',
      selectedLineItemIds: [] as string[],
      consolidatedItems: [] as ConsolidatedAPRItem[],
    },
    onSubmit: async (values) => {
      onSubmit({
        selectedAppId: values.value.selectedAppId,
        selectedLineItemIds: values.value.selectedLineItemIds,
        consolidatedItems: aprItems,
      })
    },
  })

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === selectedAppId),
    [apps, selectedAppId]
  )

  // Validation logic
  const validation = useAPPApprovalValidation({
    app: selectedApp || null,
    selectedLineItemCount: selectedLineItemIds.length,
    totalLineItemCount: selectedApp?.bac.lineItems.length || 0,
  })

  const selectedLineItems = useMemo(
    () => selectedApp?.bac.lineItems.filter((item) => selectedLineItemIds.includes(item.id)) || [],
    [selectedApp, selectedLineItemIds]
  )

  const aprItems = useMemo(
    () => {
      if (!selectedApp || selectedLineItems.length === 0) return []
      return convertAppLineItemsToAPRItems(selectedLineItems, selectedApp.id, selectedApp.bac.id)
    },
    [selectedApp, selectedLineItems]
  )

  const aprTotalBudget = useMemo(
    () => aprItems.reduce((sum, item) => sum + item.totalAmount, 0),
    [aprItems]
  )

  const budgetValidation = useMemo(() => {
    if (!selectedApp) return null
    return validateBudgetCeiling(
      aprTotalBudget,
      selectedApp.bac.totalBudget,
      5,
      10
    )
  }, [selectedApp, aprTotalBudget])

  // Report validation state to parent
  useEffect(() => {
    if (onValidationChange) {
      const isValid =
        !!selectedAppId &&
        selectedLineItemIds.length > 0 &&
        validation.blockingErrors.length === 0 &&
        !(budgetValidation && budgetValidation.isBlocker)
      onValidationChange(isValid)
    }
  }, [selectedAppId, selectedLineItemIds, validation, budgetValidation, onValidationChange])

  // Event handlers
  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId)
    setSelectedLineItemIds([])
    form.setFieldValue('selectedAppId', appId)
    form.setFieldValue('selectedLineItemIds', [])
  }

  const handleToggleLineItem = (lineItemId: string) => {
    const newIds = selectedLineItemIds.includes(lineItemId)
      ? selectedLineItemIds.filter((id) => id !== lineItemId)
      : [...selectedLineItemIds, lineItemId]
    setSelectedLineItemIds(newIds)
    form.setFieldValue('selectedLineItemIds', newIds)
  }

  const handleSelectAllLineItems = () => {
    const allIds =
      selectedLineItemIds.length === selectedApp?.bac.lineItems.length
        ? []
        : selectedApp?.bac.lineItems.map((item) => item.id) || []
    setSelectedLineItemIds(allIds)
    form.setFieldValue('selectedLineItemIds', allIds)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppId || selectedLineItemIds.length === 0) return
    if (validation.blockingErrors.length > 0 || (budgetValidation && budgetValidation.isBlocker)) return
    onSubmit({
      selectedAppId,
      selectedLineItemIds,
      consolidatedItems: aprItems,
    })
  }

  if (appsLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading APPs...</div>
  }

  if (filteredApps.length === 0) {
    return (
      <Alert color="info">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Approved APPs Found</AlertTitle>
        <AlertDescription>
          There are no approved APPs available for FY {fiscalYear}. Please consolidate and approve an APP before creating an APR.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form id={formId} onSubmit={handleFormSubmit} className="space-y-4">
      <ValidationAlerts validation={validation} budgetValidation={budgetValidation} />
      <APPSelectField apps={filteredApps} selectedAppId={selectedAppId} onAppSelect={handleAppSelect} fiscalYear={fiscalYear} />
      <LineItemsSelectField app={selectedApp || null} selectedLineItemIds={selectedLineItemIds} onToggleLineItem={handleToggleLineItem} onSelectAll={handleSelectAllLineItems} />
      {selectedApp && selectedLineItemIds.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-3">✅ Step 3: Preview Selected Items</h3>
          <APRItemsPreview
            appId={selectedApp.id}
            appBACId={selectedApp.bac.id}
            appName={selectedApp.appCode}
            lineItems={selectedApp.bac.lineItems.filter((item) => selectedLineItemIds.includes(item.id))}
            appTotalBudget={selectedApp.bac.totalBudget}
          />
        </div>
      )}
    </form>
  )
}
