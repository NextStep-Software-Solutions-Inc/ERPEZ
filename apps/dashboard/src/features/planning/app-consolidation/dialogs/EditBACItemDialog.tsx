import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
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
  const [initialData, setInitialData] = useState<BACLineItem | null>(lineItem)
  const [loading, setLoading] = useState(false)

  const [activityTypes, setActivityTypes] = useState<any[]>([])
  const [procurementModes, setProcurementModes] = useState<any[]>([])

  // Scroll tracking for right-side indicator
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 20
    setCanScrollDown(hasMore)
  }, [])

  const handleScroll = useCallback(() => {
    checkScroll()
  }, [checkScroll])

  // Observe resize and layout changes to dynamically update scroll indicator
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(checkScroll, 100)
    const el = scrollRef.current
    if (!el) return () => clearTimeout(timer)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        checkScroll()
      })
      observer.observe(el)
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild)
      }
    }

    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [open, checkScroll, formData])

  const handleScrollDown = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ top: 300, behavior: 'smooth' })
  }, [])

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
              description: apiData.itemNameOverride || apiData.ppmpItemName || apiData.PPMPItem?.name || lineItem.description || 'Procurement Item',
              name: apiData.PPMPItem?.name || apiData.ppmpItemName || lineItem.name || lineItem.description,
              itemDescription: apiData.PPMPItem?.description || apiData.description,
              itemNameOverride: apiData.itemNameOverride || lineItem.itemNameOverride || '',
              generalDescription: apiData.generalDescription || lineItem.generalDescription || '',
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
              startOfProcurementOverride: apiData.startOfProcurementOverride || '',
              endOfProcurementOverride: apiData.endOfProcurementOverride || '',
              effectiveStartOfProcurement: apiData.effectiveStartOfProcurement || '',
              effectiveEndOfProcurement: apiData.effectiveEndOfProcurement || '',
              isStartProcurementOverridden: apiData.isStartProcurementOverridden ?? !!apiData.startOfProcurementOverride,
              isEndProcurementOverridden: apiData.isEndProcurementOverridden ?? !!apiData.endOfProcurementOverride,
              isABCOverridden: apiData.isABCOverridden ?? (apiData.estimatedBudgetOverride !== null && apiData.estimatedBudgetOverride !== undefined),
              originalPPMPBudget: apiData.originalPPMPBudget ?? apiData.totalAmount,
              effectiveABC: apiData.effectiveABC ?? apiData.totalAmount,
              estimatedBudgetOverride: apiData.estimatedBudgetOverride !== undefined && apiData.estimatedBudgetOverride !== null ? apiData.estimatedBudgetOverride : null,
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
            setInitialData(mergedItem)
          } else {
            setFormData({ ...lineItem })
            setInitialData({ ...lineItem })
          }
        })
        .catch((error) => {
          console.error('Failed to fetch app item details:', error)
          // Fallback to local item
          setFormData({ ...lineItem })
          setInitialData({ ...lineItem })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, lineItem])

  // Track if form has unsaved changes
  const isDirty = useMemo(
    () => {
      if (!formData || !initialData) return false
      return JSON.stringify(formData) !== JSON.stringify(initialData)
    },
    [formData, initialData],
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
      const savedItem: BACLineItem = {
        ...formData,
        description: formData.itemNameOverride || formData.description,
        itemDescription: formData.generalDescription || formData.itemDescription,
      }
      updatedLineItems[itemIndex] = savedItem

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

        const toISODateTime = (val?: string | null): string | null => {
          if (!val || typeof val !== 'string') return null
          const trimmed = val.trim()
          if (!trimmed) return null
          if (/^\d{2}\/\d{4}$/.test(trimmed)) {
            const [m, y] = trimmed.split('/')
            return `${y}-${m.padStart(2, '0')}-01T00:00:00.000Z`
          }
          if (/^\d{4}-\d{2}$/.test(trimmed)) {
            return `${trimmed}-01T00:00:00.000Z`
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return `${trimmed}T00:00:00.000Z`
          }
          if (trimmed.includes('T')) return trimmed
          try {
            const d = new Date(trimmed)
            if (!isNaN(d.getTime())) return d.toISOString()
          } catch {
            // ignore
          }
          return null
        }

        return {
          bacItemCode: item.id,
          modeOfProcurementId: mopId || null,
          remarks: item.remarks || '',
          itemNameOverride: item.itemNameOverride?.trim() || null,
          generalDescription: item.generalDescription?.trim() || null,
          epaEligible: item.eligibleForEPA ?? false,
          epaRemarks: item.epaRemarks || '',
          startOfProcurementOverride: toISODateTime(item.startOfProcurementOverride),
          endOfProcurementOverride: toISODateTime(item.endOfProcurementOverride),
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
    setFormData(initialData || lineItem)
    onOpenChange(false)
  }, [initialData, lineItem, onOpenChange])

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
        description={`Unit: ${formData.unit} | Quantity: ${formData.quantity}`}
        className="z-[99999] pointer-events-auto sm:max-w-[950px] lg:max-w-[1080px] xl:max-w-[1140px] h-[85vh] max-h-[85vh]"
        hideScrollbar={false}
        bodyClassName="bac-dialog-scroll"
        bodyRef={scrollRef}
        onScroll={handleScroll}
        onPointerDownOutside={(e) => {
          if (isSaving) e.preventDefault()
        }}
        footer={
          <div className="flex items-center justify-between pt-3 pb-1 border-t bg-white w-full">
            <div className="flex items-center gap-3">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="text-xs text-slate-500">All changes saved</span>
              )}
              {canScrollDown && (
                <button
                  type="button"
                  onClick={handleScrollDown}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                  <span>More options below</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1 relative pb-2">
          {/* Component-scoped scrollbar styles avoiding any global file changes */}
          <style>{`
            .bac-dialog-scroll {
              scrollbar-width: thin;
              scrollbar-color: #94a3b8 #f1f5f9;
            }
            .bac-dialog-scroll::-webkit-scrollbar {
              width: 8px;
              display: block;
            }
            .bac-dialog-scroll::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 6px;
            }
            .bac-dialog-scroll::-webkit-scrollbar-thumb {
              background: #94a3b8;
              border-radius: 6px;
              border: 2px solid #f1f5f9;
            }
            .bac-dialog-scroll::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }
          `}</style>

          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quantity & Unit</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{formData.quantity} {formData.unit}</p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unit Cost</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                ₱{formData.unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total ABC</p>
                {formData.estimatedBudgetOverride !== null && formData.estimatedBudgetOverride !== undefined && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Override
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-blue-700 mt-0.5">
                ₱{(formData.estimatedBudgetOverride ?? (formData.originalPPMPBudget || formData.totalAmount)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Early Procurement</p>
              <div className="mt-1">
                {formData.eligibleForEPA ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ EPA Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Non-EPA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Editable BAC Configuration Tabs */}
          <Card className="border-slate-200/90 shadow-2xs">
            <CardContent className="pt-5 pb-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  BAC Configuration Workspace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a category below to configure procurement details, milestones, strategy, remarks, and EPA eligibility.
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

          {/* Floating Scroll Indicator on the right */}
          {canScrollDown && (
            <div className="sticky bottom-2 flex justify-end pr-1 pointer-events-none z-30 -mt-6 mb-1">
              <button
                type="button"
                onClick={handleScrollDown}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white/95 hover:bg-blue-50 border border-blue-200 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 animate-bounce cursor-pointer group hover:shadow-lg"
                title="Scroll down for more fields"
              >
                <span>Scroll for more</span>
                <ChevronDown className="h-3.5 w-3.5 text-blue-600 transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          )}
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
