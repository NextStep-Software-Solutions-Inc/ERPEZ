/**
 * Select APP Form Component
 *
 * Main form handler for multi-APP selection and line item picking.
 * Pure React state with live backend APPs.
 */

import { useMemo, useState, useCallback } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { APPSelectField } from '../components/APPSelectField'
import { LineItemsSelectField } from '../components/LineItemsSelectField'
import { ValidationAlerts } from '../components/ValidationAlerts'
import { useApprovedAPPs, useAPPById, useAllocatedAPPItemIds } from '../handlers/hooks'
import { useAPPApprovalValidation } from '../hooks'
import { convertAppLineItemsToAPRItems, validateBudgetCeiling, isCSEItem } from '../utils'
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
  fiscalYear?: number
  fiscalYearId?: string
  initialAppId?: string
  initialSelectedLineItemIds?: string[]
  excludeAprId?: string
}

const APPROVED_APPS_QUERY_PARAMS = {
  PageSize: 100,
  Filters: 'Status==Approved',
}

export function SelectAPPForm({
  formId,
  onSubmit,
  fiscalYear = new Date().getFullYear(),
  fiscalYearId,
  initialAppId,
  initialSelectedLineItemIds,
  excludeAprId,
}: SelectAPPFormProps) {
  const { data: appsResponse, isLoading: appsLoading } = useApprovedAPPs({
    queryParams: {
      ...APPROVED_APPS_QUERY_PARAMS,
      ...(fiscalYearId ? { fiscalYearId } : {}),
    },
    enabled: true,
  } as any)

  const { data: allocatedIdsResponse } = useAllocatedAPPItemIds({
    queryParams: excludeAprId ? { excludeAprId } : {},
    enabled: true,
  } as any)

  const allocatedItemIds = useMemo(() => {
    if (!allocatedIdsResponse) return new Set<string>()
    const raw = Array.isArray(allocatedIdsResponse)
      ? allocatedIdsResponse
      : (allocatedIdsResponse as any)?.data || []
    return new Set<string>(raw.map((id: any) => String(id).toLowerCase()))
  }, [allocatedIdsResponse])

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
        // match
      } else {
        const fy =
          app.FiscalYear?.year ||
          app.fiscalYear?.year ||
          app.fiscalYear ||
          (app.fiscalYearName ? parseInt(app.fiscalYearName, 10) : undefined)
        if (fy && fy !== fiscalYear) return false
      }

      // Filter out APPs that have no remaining unallocated CSE line items
      const directItems = app.APPItems || app.appItems || app.items || []
      if (directItems.length === 0) {
        const appPmps = app.APPPPMPs || app.appppmPs || []
        if (appPmps.length === 0) return true
        const allExtractedIds: string[] = []
        appPmps.forEach((rel: any) => {
          const ppmp = rel.PPMP || rel.ppmp || rel
          const pItems = (ppmp?.PPMPItems || ppmp?.ppmpItems || ppmp?.items || []).filter(isCSEItem)
          pItems.forEach((pi: any) => allExtractedIds.push(String(pi.id).toLowerCase()))
        })
        return allExtractedIds.some((id) => !allocatedItemIds.has(id))
      }

      const unallocatedCount = directItems
        .filter(isCSEItem)
        .filter((item: any) => !allocatedItemIds.has(String(item.id).toLowerCase()))
        .length

      return unallocatedCount > 0
    })
  }, [apps, fiscalYear, fiscalYearId, allocatedItemIds])

  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(() =>
    initialAppId ? [initialAppId] : []
  )
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<string[]>(() =>
    initialSelectedLineItemIds || []
  )

  const selectedApps = useMemo(
    () => apps.filter((app: any) => selectedAppIds.includes(app.id)),
    [apps, selectedAppIds]
  )

  const primarySelectedApp = selectedApps[0] || null
  const selectedAppId = primarySelectedApp?.id || ''

  // Fetch detailed APP with full line items (APPItems & APPPPMPs) when an APP is selected
  const { data: appDetailResponse } = useAPPById({
    pathParams: { appId: selectedAppId },
    enabled: !!selectedAppId,
  } as any)

  const detailedApp = useMemo(() => {
    if (!appDetailResponse) return null
    if ((appDetailResponse as any).data) return (appDetailResponse as any).data
    return appDetailResponse as any
  }, [appDetailResponse])

  const rawLineItems: any[] = useMemo(() => {
    if (selectedApps.length === 0) return []
    return selectedApps.flatMap((app: any) => {
      const appCode = app.appNumber || app.appCode || `APP-${app.id.substring(0, 8)}`
      const targetApp = (detailedApp && (detailedApp.id === app.id || detailedApp.appNumber === app.appNumber)) ? detailedApp : app

      const directItems = targetApp.APPItems || targetApp.appItems || targetApp.items || targetApp.bac?.lineItems || []
      
      let items = directItems
      if (!items || items.length === 0) {
        const appPmps = targetApp.APPPPMPs || targetApp.appppmPs || []
        const extracted: any[] = []
        appPmps.forEach((rel: any) => {
          const ppmp = rel.PPMP || rel.ppmp || rel
          const pItems = ppmp?.PPMPItems || ppmp?.ppmpItems || ppmp?.items || []
          pItems.forEach((pi: any) => {
            extracted.push({
              id: pi.id,
              ppmpItemId: pi.id,
              ppmpItemName: pi.description || pi.ppmpItemName || 'Procurement Item',
              description: pi.description || pi.ppmpItemName || 'Procurement Item',
              unit: pi.unit || 'unit',
              quantity: pi.quantity ?? 1,
              unitCost: pi.unitCost ?? 0,
              totalAmount: pi.totalAmount ?? ((pi.quantity ?? 1) * (pi.unitCost ?? 0)),
              officeId: ppmp?.officeId || targetApp.officeId,
              officeName: ppmp?.officeName || targetApp.officeName,
              fundSourceId: ppmp?.fundSourceId,
              fundSourceName: ppmp?.fundSourceName,
              procurementModeName: pi.modeOfProcurement || pi.procurementModeName,
              cseItemId: pi.cseItemId,
              nonCSEItemId: pi.nonCSEItemId,
              isCSE: pi.cseItemId != null || pi.isCSE === true,
              isNonCSE: pi.nonCSEItemId != null || pi.isNonCSE === true,
            })
          })
        })
        items = extracted
      }

      // Filter out Non-CSE items: APRs are strictly for CSE items (Common-Use Supplies and Equipment from PS-DBM)
      const cseItems = items.filter(isCSEItem)

      // Filter out items already allocated to another APR
      const unallocatedItems = cseItems.filter(
        (item: any) => !allocatedItemIds.has(String(item.id).toLowerCase())
      )

      return unallocatedItems.map((item: any) => ({
        ...item,
        sourceAppId: app.id,
        sourceAppCode: appCode,
        sourceAppName: app.name || app.appName || '',
      }))
    })
  }, [selectedApps, detailedApp, allocatedItemIds])

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
    return selectedLineItems
      .map((item: any) => {
        const parentApp = selectedApps.find((a: any) => a.id === item.sourceAppId) || selectedApps[0]
        const converted = convertAppLineItemsToAPRItems(
          [item],
          parentApp?.id || '',
          parentApp?.bac?.id || ''
        )
        return converted?.[0] ?? null
      })
      .filter(Boolean) as ConsolidatedAPRItem[]
  }, [selectedApps, selectedLineItems])

  const aprTotalBudget = useMemo(
    () => aprItems.reduce((sum, item) => sum + item.totalAmount, 0),
    [aprItems]
  )

  const appTotalBudget = useMemo(() => {
    if (selectedApps.length === 0) return 0
    return selectedApps.reduce((appSum: number, app: any) => {
      if (app.totalBudget && app.totalBudget > 0) return appSum + app.totalBudget
      if (app.bac?.totalBudget && app.bac.totalBudget > 0) return appSum + app.bac.totalBudget
      
      const items = app.APPItems || app.appItems || app.items || []
      const itemsTotal = items.reduce(
        (sum: number, item: any) =>
          sum +
          (item.effectiveABC ||
            item.totalAmount ||
            item.originalPPMPBudget ||
            (item.quantity && item.unitCost ? item.quantity * item.unitCost : 0) ||
            0),
        0
      )
      if (itemsTotal > 0) return appSum + itemsTotal

      if (app.APPPPMPs?.[0]?.PPMP?.totalEstimatedBudget) {
        const ppmpTotal = app.APPPPMPs.reduce(
          (sum: number, p: any) => sum + (p.PPMP?.totalEstimatedBudget || 0),
          0
        )
        if (ppmpTotal > 0) return appSum + ppmpTotal
      }

      // Fallback: sum all available raw line items for this selected APP
      const appRawItems = rawLineItems.filter((item: any) => item.sourceAppId === app.id)
      const rawTotal = appRawItems.reduce((sum: number, item: any) => sum + (item.totalAmount || item.effectiveABC || 0), 0)
      return appSum + rawTotal
    }, 0)
  }, [selectedApps, rawLineItems])

  const budgetValidation = useMemo(() => {
    if (selectedApps.length === 0) return null
    return validateBudgetCeiling(aprTotalBudget, appTotalBudget, 5, 10)
  }, [selectedApps.length, aprTotalBudget, appTotalBudget])

  // -- Stable handlers ----------------------------------------------------------
  // All wrapped in useCallback so memoized children never re-render from ref churn.

  const handleToggleApp = useCallback((appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    )
  }, [])

  const handleSelectAllApps = useCallback(() => {
    setSelectedAppIds((prev) => {
      const allIds = filteredApps.map((a: any) => a.id)
      if (prev.length === allIds.length) {
        setSelectedLineItemIds([])
        return []
      }
      return allIds
    })
  }, [filteredApps])

  const handleToggleLineItem = useCallback((lineItemId: string) => {
    setSelectedLineItemIds((prev) =>
      prev.includes(lineItemId) ? prev.filter((id) => id !== lineItemId) : [...prev, lineItemId]
    )
  }, [])

  const handleSelectAllLineItems = useCallback(() => {
    setSelectedLineItemIds((prev) => {
      const allIds = rawLineItems.map((item: any) => item.id)
      return prev.length === allIds.length ? [] : allIds
    })
  }, [rawLineItems])

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedAppIds.length === 0) {
        toast.error('Please select at least one approved APP.')
        return
      }
      if (selectedLineItemIds.length === 0) {
        toast.error('Please select at least one line item to include in this APR.')
        return
      }
      if (validation.blockingErrors.length > 0) {
        toast.error(validation.blockingErrors[0].message)
        return
      }
      if (budgetValidation && budgetValidation.isBlocker) {
        toast.error(budgetValidation.message)
        return
      }
      onSubmit({
        selectedAppIds,
        selectedAppId: selectedAppIds[0] || '',
        selectedLineItemIds,
        consolidatedItems: aprItems,
        selectedApps,
        selectedApp: primarySelectedApp,
      })
    },
    [
      selectedAppIds,
      selectedLineItemIds,
      validation,
      budgetValidation,
      aprItems,
      selectedApps,
      primarySelectedApp,
      onSubmit,
    ]
  )

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
          There are no approved APPs available for FY {fiscalYear}. Please consolidate and approve
          an APP before creating an APR.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form id={formId} onSubmit={handleFormSubmit} className="space-y-4">
      <ValidationAlerts validation={validation} budgetValidation={budgetValidation} />
      <APPSelectField
        key={fiscalYear}
        apps={filteredApps}
        selectedAppIds={selectedAppIds}
        onToggleApp={handleToggleApp}
        onSelectAllApps={handleSelectAllApps}
        fiscalYear={fiscalYear}
        allocatedItemIds={allocatedItemIds}
      />
      <LineItemsSelectField
        apps={selectedApps}
        lineItems={rawLineItems}
        selectedLineItemIds={selectedLineItemIds}
        onToggleLineItem={handleToggleLineItem}
        onSelectAll={handleSelectAllLineItems}
      />
      {/* {selectedApps.length > 0 && selectedLineItemIds.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900 mb-3">
            ? Step 3: Preview Selected Items
          </h3>
          <APRItemsPreview
            appName={combinedAppNames}
            items={aprItems}
            appTotalBudget={appTotalBudget}
          />
        </div>
      )} */}
    </form>
  )
}
