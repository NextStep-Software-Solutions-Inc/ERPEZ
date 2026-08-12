import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { BACLineItem } from '../types'
import { currentAppAtom, appListAtom } from '../atoms'
import { useQueryClient } from '@tanstack/react-query'
import { BACWorkspaceItemEditor } from '../components'
import api from '@/services/api'

interface EditBACItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItem: BACLineItem | null
  itemIndex?: number
}

/**
 * EditBACItemDialog - Single BAC Line Item Editor
 *
 * Provides a focused interface for editing a single line item's:
 * - Mode of Procurement
 * - Procurement Milestones (4 dates)
 * - Remarks and Notes
 * - EPA Eligibility Tags
 *
 * Features:
 * - Unsaved changes protection with warning dialog
 * - Real-time validation and state tracking
 * - Tab-based organization mirroring the full dialog
 * - Maintains context about which item is being edited
 */
export function EditBACItemDialog({
  open,
  onOpenChange,
  lineItem,
  itemIndex,
}: EditBACItemDialogProps) {
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const [appList, setAppList] = useAtom(appListAtom)
  const queryClient = useQueryClient()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<BACLineItem | null>(lineItem)
  const [loading, setLoading] = useState(false)

  const [activityTypes, setActivityTypes] = useState<any[]>([])
  const [procurementModes, setProcurementModes] = useState<any[]>([])

  // Fetch activity types and procurement modes when open
  useEffect(() => {
    if (open) {
      api.get('/procurement-activity-types', {
        params: { page: 1, pageSize: 100, filters: 'isActive==true' }
      })
        .then((res) => {
          setActivityTypes(res.data?.data || [])
        })
        .catch((err) => {
          console.error('Failed to load activity types in EditBACItemDialog:', err)
        })

      api.get('/procurement-modes', {
        params: { PageNumber: 1, PageSize: 1000 }
      })
        .then((res) => {
          setProcurementModes(res.data?.data || [])
        })
        .catch((err) => {
          console.error('Failed to load procurement modes in EditBACItemDialog:', err)
        })
    }
  }, [open])

  // Sync form data and fetch latest item details when line item changes
  useEffect(() => {
    if (open && lineItem) {
      setLoading(true)
      api.get(`/app-items/${lineItem.id}`)
        .then((response) => {
          const apiData = response.data?.data || response.data
          if (apiData) {
            // Helper function to normalize strategies
            const normalizeStrategy = (strat: string): any => {
              const s = strat.toUpperCase().replace(/[^A-Z]/g, '')
              if (s.includes('LCA') || s.includes('LCCA')) return 'LCA_LCCA'
              if (s.includes('SUBCONTRACTING')) return 'SUBCONTRACTING'
              if (s.includes('MULTIYEAR') || s.includes('MULTI_YEAR')) return 'MULTI_YEAR'
              if (s.includes('DESIGNBUILD') || s.includes('DESIGN_BUILD')) return 'DESIGN_BUILD'
              if (s.includes('PROCUREMENTAGENT') || s.includes('PROCUREMENT_AGENT')) return 'PROCUREMENT_AGENT'
              if (s.includes('FRAMEWORKAGREEMENT') || s.includes('FRAMEWORK_AGREEMENT')) return 'FRAMEWORK_AGREEMENT'
              if (s.includes('POOLEDPROCUREMENT') || s.includes('POOLED_PROCUREMENT')) return 'POOLED_PROCUREMENT'
              if (s.includes('RENEWALOFSERVICES') || s.includes('RENEWAL_SERVICES')) return 'RENEWAL_SERVICES'
              if (s.includes('WAREHOUSINGINVENTORY') || s.includes('WAREHOUSING_INVENTORY')) return 'WAREHOUSING_INVENTORY'
              if (s === 'NA' || s.includes('NOTAPPLICABLE')) return 'NA'
              return strat
            }

            const strats = Array.isArray(apiData.procurementStrategies)
              ? apiData.procurementStrategies.map((s: string) => normalizeStrategy(s))
              : []

            const schedules = Array.isArray(apiData.Schedules) ? apiData.Schedules : []
            
            // Map schedules to milestones
            const milestones = {
              advertisementDate: lineItem.milestones?.advertisementDate || '',
              submissionDate: lineItem.milestones?.submissionDate || '',
              noticeOfAwardDate: lineItem.milestones?.noticeOfAwardDate || '',
              contractSigningDate: lineItem.milestones?.contractSigningDate || '',
            }

            schedules.forEach((sch: any) => {
              const name = (sch.procurementActivityTypeName || '').toUpperCase()
              const dateVal = sch.scheduledDate ? sch.scheduledDate.split('T')[0] : ''
              
              if (!dateVal) return

              if (name.includes('ADVERTISEMENT') || name.includes('POSTING') || name.includes('IAEB') || name.includes('IB/REI') || name.includes('PRE-PROCUREMENT') || name.includes('ADS')) {
                milestones.advertisementDate = dateVal
              } else if (name.includes('SUBMISSION') || name.includes('OPENING') || name.includes('BID')) {
                milestones.submissionDate = dateVal
              } else if (name.includes('NOTICE OF AWARD') || name.includes('AWARD') || name.includes('NOA')) {
                milestones.noticeOfAwardDate = dateVal
              } else if (name.includes('CONTRACT SIGNING') || name.includes('SIGNING')) {
                milestones.contractSigningDate = dateVal
              }
            })

            const mergedItem: BACLineItem = {
              ...lineItem,
              id: apiData.id || lineItem.id,
              code: apiData.papCode || apiData.ppmpItemName || lineItem.code,
              description: apiData.PPMPItem?.description || apiData.description || lineItem.description,
              unit: apiData.PPMPItem?.unit || apiData.unit || lineItem.unit,
              quantity: apiData.quantity || lineItem.quantity,
              unitCost: apiData.PPMPItem?.unitPrice || apiData.unitCost || lineItem.unitCost,
              totalAmount: apiData.effectiveABC || apiData.totalAmount || (apiData.quantity ? apiData.quantity * (apiData.PPMPItem?.unitPrice || 0) : lineItem.totalAmount),
              modeOfProcurement: apiData.procurementModeName || apiData.ProcurementMode?.name || lineItem.modeOfProcurement,
              office: apiData.officeName || apiData.Office?.name || lineItem.office,
              fundSource: apiData.fundSourceName || apiData.FundSource?.name || lineItem.fundSource,
              remarks: apiData.remarks !== undefined ? apiData.remarks : lineItem.remarks,
              epaRemarks: apiData.epaRemarks !== undefined ? apiData.epaRemarks : lineItem.epaRemarks,
              eligibleForEPA: apiData.isEarlyProcurementActivity !== undefined ? apiData.isEarlyProcurementActivity : lineItem.eligibleForEPA,
              startOfProcurementOverride: apiData.startOfProcurementOverride || (apiData.effectiveStartOfProcurement ? apiData.effectiveStartOfProcurement.split('T')[0] : lineItem.startOfProcurementOverride || ''),
              endOfProcurementOverride: apiData.endOfProcurementOverride || (apiData.effectiveEndOfProcurement ? apiData.effectiveEndOfProcurement.split('T')[0] : lineItem.endOfProcurementOverride || ''),
              estimatedBudgetOverride: apiData.estimatedBudgetOverride !== undefined && apiData.estimatedBudgetOverride !== null ? apiData.estimatedBudgetOverride : lineItem.estimatedBudgetOverride,
              isOutsourced: apiData.isOutsourced !== undefined ? apiData.isOutsourced : lineItem.isOutsourced,
              procurementStrategies: strats,
              milestones: milestones,
            }

            if (schedules.length > 0) {
              mergedItem.schedules = schedules.map((sch: any) => ({
                id: sch.id,
                period: sch.procurementActivityTypeName || '',
                scheduledDate: sch.scheduledDate || '',
                quantity: sch.quantity || mergedItem.quantity,
              }))
            }

            setFormData(mergedItem)
          } else {
            setFormData({ ...lineItem })
          }
        })
        .catch((error) => {
          console.error('Failed to fetch app item details:', error)
          // Fallback to local item
          setFormData({ ...lineItem })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, lineItem])

  // Track if form has unsaved changes
  const isDirty = useMemo(
    () => {
      if (!formData || !lineItem) return false
      return JSON.stringify(formData) !== JSON.stringify(lineItem)
    },
    [formData, lineItem],
  )

  /**
   * Handle saving single item BAC configuration
   * Updates the current APP with new item data, replacing just this line item
   */
  const handleSave = useCallback(async () => {
    if (!formData || !currentApp || isSaving || itemIndex === undefined) return

    setIsSaving(true)
    try {
      const toScheduleString = (value: any): string => {
        if (!value) return ''
        if (typeof value === 'string') return value
        if (value instanceof Date) return value.toISOString().split('T')[0]
        return String(value)
      }

      // Create updated app line items array
      const updatedApp = { ...currentApp }
      const updatedLineItems = [...(updatedApp.bac?.lineItems || []).map(item => ({ ...item }))]
      updatedLineItems[itemIndex] = formData

      // Construct PUT payload (only for the single edited item)
      const payload = [formData].map((item) => {
        // Find procurement mode ID by name
        let mopId = ''
        const matchedMop = procurementModes.find(
          (m) => m.name.toLowerCase() === (item.modeOfProcurement || '').toLowerCase()
        )
        if (matchedMop) {
          mopId = matchedMop.id
        }

        // Parse schedules
        const payloadSchedules: any[] = []

        if (Array.isArray(item.schedules)) {
          item.schedules.forEach((sch) => {
            const matchedType = activityTypes.find(
              (t) => t.name.toLowerCase() === (sch.period || '').toLowerCase()
            )
            
            if (matchedType) {
              const val = sch.scheduledDate || ''
              const isDate = /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{4}-\d{2}-\d{2}T/.test(val)

              const schObj: any = {
                procurementActivityTypeId: matchedType.id,
              }

              if (isDate) {
                schObj.scheduledDate = val.includes('T') ? val : `${val}T00:00:00.000Z`
              } else if (val) {
                schObj.customDateText = val
              } else {
                schObj.customDateText = ''
              }

              payloadSchedules.push(schObj)
            }
          })
        }

        // Legacy compatibility milestones fallback check
        const milestoneMappings = [
          { name: 'Advertisement/Posting of IB/REI', value: item.milestones?.advertisementDate },
          { name: 'Submission/Opening of Bids', value: item.milestones?.submissionDate },
          { name: 'Notice of Award', value: item.milestones?.noticeOfAwardDate },
          { name: 'Contract Signing', value: item.milestones?.contractSigningDate },
        ]

        milestoneMappings.forEach((m) => {
          if (!m.value) return

          const matchedType = activityTypes.find((t) => t.name.toLowerCase() === m.name.toLowerCase())
          if (matchedType) {
            const alreadyExists = payloadSchedules.some(
              (s) => s.procurementActivityTypeId === matchedType.id
            )
            if (!alreadyExists) {
              const val = toScheduleString(m.value)
              const isDate = /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{4}-\d{2}-\d{2}T/.test(val)

              const schObj: any = {
                procurementActivityTypeId: matchedType.id,
              }

              if (isDate) {
                schObj.scheduledDate = val.includes('T') ? val : `${val}T00:00:00.000Z`
              } else {
                schObj.customDateText = val
              }

              payloadSchedules.push(schObj)
            }
          }
        })

        return {
          bacItemCode: item.id,
          modeOfProcurementId: mopId || null,
          remarks: item.remarks || '',
          epaEligible: item.eligibleForEPA ?? false,
          epaRemarks: item.epaRemarks || '',
          startOfProcurementOverride: item.startOfProcurementOverride || null,
          endOfProcurementOverride: item.endOfProcurementOverride || null,
          estimatedBudgetOverride: item.estimatedBudgetOverride !== undefined && item.estimatedBudgetOverride !== null ? item.estimatedBudgetOverride : null,
          bidEvaluationCriteria: item.bidEvaluationCriteria || null,
          procurementStrategies: item.procurementStrategies || null,
          isOutsourced: item.isOutsourced ?? null,
          schedules: payloadSchedules,
        }
      })

      // Call API PUT endpoint
      await api.put(`/apps/${currentApp.id}/bac/line-items`, payload)

      updatedApp.bac = {
        ...updatedApp.bac,
        lineItems: updatedLineItems,
      }

      // Update both currentApp and appList for real-time and persistent updates
      setCurrentApp(updatedApp)
      setAppList(
        appList.map((app) =>
          app.id === updatedApp.id ? updatedApp : app
        )
      )

      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
      })

      toast.success(`${formData.description} updated successfully!`)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update BAC line item:', error)
      toast.error('Failed to update BAC line item')
    } finally {
      setIsSaving(false)
    }
  }, [formData, currentApp, isSaving, itemIndex, setCurrentApp, setAppList, appList, onOpenChange, activityTypes, procurementModes])

  /**
   * Wrap onOpenChange to intercept all close attempts (backdrop click, ESC, etc)
   * and show unsaved changes warning if needed
   */
  const handleDialogOpenChange = useCallback(
    (newOpen: boolean) => {
      // Attempting to close while dirty
      if (newOpen === false && isDirty) {
        setShowUnsavedWarning(true)
        return
      }
      // Either opening or closing without unsaved changes
      onOpenChange(newOpen)
    },
    [isDirty, onOpenChange],
  )

  /**
   * Handle Cancel button click
   * Show warning if dirty, otherwise close
   */
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true)
    } else {
      onOpenChange(false)
    }
  }, [isDirty, onOpenChange])

  /**
   * Confirm discard of unsaved changes
   */
  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedWarning(false)
    setFormData(lineItem)
    onOpenChange(false)
  }, [lineItem, onOpenChange])

  if (loading || !formData) {
    // Loading state - show minimal dialog while syncing
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Loading item..."
        description="Preparing to edit"
        className="z-[998]"
      >
        <div className="p-6 text-center">
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </ResponsiveDialog>
    )
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showUnsavedWarning}
        onOpenChange={handleDialogOpenChange}
        title={`Edit BAC Item: ${formData.description}`}
        description={`Unit: ${formData.unit} | Qty: ${formData.quantity}`}
        className="z-[99999] pointer-events-auto sm:max-w-[700px] lg:max-w-[800px]"
        onPointerDownOutside={(e) => {
          if (isSaving) e.preventDefault()
        }}
      >
        <div className="flex flex-col h-[calc(100vh-240px)] relative z-[99999]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide relative z-[99999]">
            <div className="space-y-6 pr-4">
              {/* Editable BAC Configuration Tabs */}
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      BAC Configuration
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Use the tabs below to edit procurement details, milestones, remarks, and EPA eligibility
                    </p>
                  </div>
                  <BACWorkspaceItemEditor
                    lineItem={formData}
                    onUpdate={(updatedItem: BACLineItem) => {
                      setFormData(updatedItem)
                    }}
                    readOnly={false}
                  />
                </CardContent>
              </Card>

              {/* Item Overview Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Item Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Item ID</p>
                        <p className="font-mono text-sm font-bold text-gray-900">{formData.id}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-100 md:col-span-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Description</p>
                        <p className="text-sm font-semibold text-gray-900">{formData.description}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Unit</p>
                        <p className="text-sm font-bold text-gray-900">{formData.unit}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Quantity</p>
                        <p className="text-sm font-bold text-gray-900">{formData.quantity}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Unit Cost</p>
                        <p className="text-sm font-bold text-gray-900">₱{formData.unitCost.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border-2 border-orange-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-orange-900">
                            ₱{formData.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">EPA Eligible</p>
                          <p className="text-xl font-bold">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${formData.eligibleForEPA ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                              {formData.eligibleForEPA ? '✓ Yes' : '✗ No'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t bg-white relative z-[99999]">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have made changes to this line item. Are you sure you want to discard these changes?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={handleDiscardChanges}
        onCancel={() => setShowUnsavedWarning(false)}
      />
    </>
  )
}
