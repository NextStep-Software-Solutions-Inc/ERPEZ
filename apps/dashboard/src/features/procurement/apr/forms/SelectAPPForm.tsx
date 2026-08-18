/**
 * Select APP Form Component
 * 
 * Main form handler for multi-APP selection and line item picking
 * Uses TanStack Form with live backend APPs
 */

import { useMemo, useState, useEffect, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { APPSelectField } from '../components/APPSelectField'
import { LineItemsSelectField } from '../components/LineItemsSelectField'
import { ValidationAlerts } from '../components/ValidationAlerts'
import { APRItemsPreview } from '../components/APRItemsPreview'
import { useApprovedAPPs } from '../handlers/hooks'
import { useAPPApprovalValidation } from '../hooks'
import { convertAppLineItemsToAPRItems, validateBudgetCeiling } from '../utils'
import type { ConsolidatedAPRItem } from '../types'

export type SelectAppFormValues = {
  selectedAppIds: string[]
  selectedAppId: string
  selectedLineItemIds: string[]
  consolidatedItems: ConsolidatedAPRItem[]
  selectedApps?: any[]
  selectedApp?: any
}

interface SelectAPPFormProps {
  formId: string
  onSubmit: (values: SelectAppFormValues) => void
  onValidationChange?: (isValid: boolean) => void
  fiscalYear?: number
  fiscalYearId?: string
}

export function SelectAPPForm({
  formId,
  onSubmit,
  onValidationChange,
  fiscalYear = new Date().getFullYear(),
  fiscalYearId,
}: SelectAPPFormProps) {
  const { data: appsResponse, isLoading: appsLoading } = useApprovedAPPs({
    queryParams: {
      PageSize: 100,
      Filters: 'Status==Approved',
    },
    enabled: true,
  } as any)

  // Extract APPs array from PaginationResponse
  const apps = useMemo(() => {
    if (!appsResponse) return []
    if (Array.isArray(appsResponse)) return appsResponse
    if (Array.isArray((appsResponse as any).data)) return (appsResponse as any).data
    if (Array.isArray((appsResponse as any).items)) return (appsResponse as any).items
    return []
  }, [appsResponse])

  const filteredApps = useMemo(() => {
    return apps.filter((app: any) => {
      if (fiscalYearId && (app.fiscalYearId === fiscalYearId || app.FiscalYear?.id === fiscalYearId)) {
        return true
      }
      const fy =
        app.FiscalYear?.year ||
        app.fiscalYear?.year ||
        app.fiscalYear ||
        (app.fiscalYearName ? parseInt(app.fiscalYearName, 10) : undefined)
      return !fy || fy === fiscalYear
    })
  }, [apps, fiscalYear, fiscalYearId])

  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([])
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<string[]>([])

  // Reset selections safely only when fiscal year actually changes
  const prevFyRef = useRef({ fiscalYear, fiscalYearId })
  useEffect(() => {
    if (
      prevFyRef.current.fiscalYear !== fiscalYear ||
      prevFyRef.current.fiscalYearId !== fiscalYearId
    ) {
      prevFyRef.current = { fiscalYear, fiscalYearId }
      setSelectedAppIds([])
      setSelectedLineItemIds([])
    }
  }, [fiscalYear, fiscalYearId])

  const selectedApps = useMemo(
    () => apps.filter((app: any) => selectedAppIds.includes(app.id)),
    [apps, selectedAppIds]
  )

  const primarySelectedApp = selectedApps[0] || null

  const rawLineItems: any[] = useMemo(() => {
    if (selectedApps.length === 0) return []
    return selectedApps.flatMap((app: any) => {
      const appCode = app.appNumber || app.appCode || `APP-${app.id.substring(0, 8)}`
      const items = app.APPItems || app.appItems || app.items || app.bac?.lineItems || []
      return items.map((item: any) => ({
        ...item,
        sourceAppId: app.id,
        sourceAppCode: appCode,
        sourceAppName: app.name || app.appName || '',
      }))
    })
  }, [selectedApps])

  const form = useForm({
    defaultValues: {
      selectedAppIds: [] as string[],
      selectedLineItemIds: [] as string[],
      consolidatedItems: [] as ConsolidatedAPRItem[],
    },
    onSubmit: async (values) => {
      onSubmit({
        selectedAppIds: values.value.selectedAppIds,
        selectedAppId: values.value.selectedAppIds[0] || '',
        selectedLineItemIds: values.value.selectedLineItemIds,
        consolidatedItems: aprItems,
        selectedApps,
        selectedApp: primarySelectedApp,
      })
    },
  })

  // Validation logic
  const validation = useAPPApprovalValidation({
    app: primarySelectedApp,
    selectedLineItemCount: selectedLineItemIds.length,
    totalLineItemCount: rawLineItems.length,
  })

  const selectedLineItems = useMemo(
    () => rawLineItems.filter((item: any) => selectedLineItemIds.includes(item.id)),
    [rawLineItems, selectedLineItemIds]
  )

  const aprItems = useMemo(() => {
    if (selectedApps.length === 0 || selectedLineItems.length === 0) return []
    return selectedLineItems.map((item: any) => {
      const parentApp = selectedApps.find((a: any) => a.id === item.sourceAppId) || selectedApps[0]
      return convertAppLineItemsToAPRItems(
        [item],
        parentApp?.id || '',
        parentApp?.bac?.id || ''
      )[0]
    })
  }, [selectedApps, selectedLineItems])

  const aprTotalBudget = useMemo(
    () => aprItems.reduce((sum, item) => sum + item.totalAmount, 0),
    [aprItems]
  )

  const appTotalBudget = useMemo(() => {
    if (selectedApps.length === 0) return 0
    return selectedApps.reduce((appSum: number, app: any) => {
      if (app.bac?.totalBudget) return appSum + app.bac.totalBudget
      if (app.APPPPMPs?.[0]?.PPMP?.totalEstimatedBudget) {
        const ppmpTotal = app.APPPPMPs.reduce(
          (sum: number, p: any) => sum + (p.PPMP?.totalEstimatedBudget || 0),
          0
        )
        return appSum + ppmpTotal
      }
      const items = app.APPItems || app.appItems || app.items || []
      const itemsTotal = items.reduce(
        (sum: number, item: any) =>
          sum +
          (item.totalAmount ||
            item.quantity * item.unitCost ||
            item.originalPPMPBudget ||
            item.effectiveABC ||
            0),
        0
      )
      return appSum + itemsTotal
    }, 0)
  }, [selectedApps])

  const budgetValidation = useMemo(() => {
    if (selectedApps.length === 0) return null
    return validateBudgetCeiling(
      aprTotalBudget,
      appTotalBudget,
      5,
      10
    )
  }, [selectedApps, aprTotalBudget, appTotalBudget])

  // Boolean validation flag to prevent re-render cascades
  const isValid = useMemo(() => {
    return (
      selectedAppIds.length > 0 &&
      selectedLineItemIds.length > 0 &&
      validation.blockingErrors.length === 0 &&
      !(budgetValidation && budgetValidation.isBlocker)
    )
  }, [
    selectedAppIds.length,
    selectedLineItemIds.length,
    validation.blockingErrors.length,
    budgetValidation,
  ])

  // Report validation state to parent only when boolean value changes
  useEffect(() => {
    onValidationChange?.(isValid)
  }, [isValid, onValidationChange])

  // Multi-APP toggle handler
  const handleToggleApp = (appId: string) => {
    const isAlreadySelected = selectedAppIds.includes(appId)
    const newAppIds = isAlreadySelected
      ? selectedAppIds.filter((id) => id !== appId)
      : [...selectedAppIds, appId]

    setSelectedAppIds(newAppIds)
    form.setFieldValue('selectedAppIds', newAppIds)

    // Remove line item IDs that belonged exclusively to unselected APP
    if (isAlreadySelected) {
      const appBeingRemoved = apps.find((a: any) => a.id === appId)
      const removedItemIds = (appBeingRemoved?.APPItems || appBeingRemoved?.appItems || appBeingRemoved?.items || []).map(
        (i: any) => i.id
      )
      const newSelectedLineItemIds = selectedLineItemIds.filter((id) => !removedItemIds.includes(id))
      setSelectedLineItemIds(newSelectedLineItemIds)
      form.setFieldValue('selectedLineItemIds', newSelectedLineItemIds)
    }
  }

  // Select all / Deselect all APPs
  const handleSelectAllApps = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([])
      setSelectedLineItemIds([])
      form.setFieldValue('selectedAppIds', [])
      form.setFieldValue('selectedLineItemIds', [])
    } else {
      const allAppIds = filteredApps.map((a: any) => a.id)
      setSelectedAppIds(allAppIds)
      form.setFieldValue('selectedAppIds', allAppIds)
    }
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
      selectedLineItemIds.length === rawLineItems.length
        ? []
        : rawLineItems.map((item: any) => item.id)
    setSelectedLineItemIds(allIds)
    form.setFieldValue('selectedLineItemIds', allIds)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAppIds.length === 0 || selectedLineItemIds.length === 0) return
    if (validation.blockingErrors.length > 0 || (budgetValidation && budgetValidation.isBlocker)) return
    onSubmit({
      selectedAppIds,
      selectedAppId: selectedAppIds[0] || '',
      selectedLineItemIds,
      consolidatedItems: aprItems,
      selectedApps,
      selectedApp: primarySelectedApp,
    })
  }

  if (appsLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading Approved APPs...</span>
      </div>
    )
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

  const combinedAppNames = selectedApps
    .map((a: any) => a.appNumber || a.appCode || a.name)
    .join(', ')

  return (
    <form id={formId} onSubmit={handleFormSubmit} className="space-y-4">
      <ValidationAlerts validation={validation} budgetValidation={budgetValidation} />
      <APPSelectField
        apps={filteredApps}
        selectedAppIds={selectedAppIds}
        onToggleApp={handleToggleApp}
        onSelectAllApps={handleSelectAllApps}
        fiscalYear={fiscalYear}
      />
      <LineItemsSelectField
        apps={selectedApps}
        selectedLineItemIds={selectedLineItemIds}
        onToggleLineItem={handleToggleLineItem}
        onSelectAll={handleSelectAllLineItems}
      />
      {selectedApps.length > 0 && selectedLineItemIds.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-3">✅ Step 3: Preview Selected Items</h3>
          <APRItemsPreview
            appId={selectedApps[0]?.id}
            appBACId={selectedApps[0]?.bac?.id}
            appName={combinedAppNames}
            lineItems={selectedLineItems}
            appTotalBudget={appTotalBudget}
          />
        </div>
      )}
    </form>
  )
}
