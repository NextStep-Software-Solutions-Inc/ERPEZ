import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import type { AppMaster } from '../types'
import { BACWorkspace } from '../components/BACWorkspace'
import { appDetailsDialogOpenAtom, currentAppAtom, appListAtom } from '../atoms'
import { transformAPPItemsToBACLineItems, extractBACMetadata } from '../utils/transformBACItems'
import { useQueryClient } from '@tanstack/react-query'
import { getAPPDetailRequest } from '../handlers/getAPPDetailRequest'
import api from '@/services/api'

/**
 * EditAPPBACDialog - Budget Alignment & Procurement Configuration Editor
 *
 * Manages the BAC setup and editing for Annual Procurement Plans (APP).
 * Provides a comprehensive interface for:
 * - Editing Mode of Procurement
 * - Configuring Bidding Schedule Milestones
 * - Adding Remarks and Notes
 * - Managing EPA Eligibility Tags
 *
 * Features:
 * - Unsaved changes protection with warning dialog
 * - Real-time validation and state tracking
 * - Tab-based organization for different BAC configurations
 * - Lock/unlock user-editable columns
 *
 * See: documentations/bac-dialog-implementation.md
 */
interface EditAPPBACDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditAPPBACDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditAPPBACDialogProps) {
  const [dialogOpen, setDialogOpen] = useAtom(appDetailsDialogOpenAtom)
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const [appList, setAppList] = useAtom(appListAtom)
  const queryClient = useQueryClient()
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<AppMaster | null>(currentApp)

  const [activityTypes, setActivityTypes] = useState<any[]>([])
  const [procurementModes, setProcurementModes] = useState<any[]>([])

  const isOpen = controlledOpen !== undefined ? controlledOpen : dialogOpen
  const handleOpenChange = controlledOnOpenChange || setDialogOpen

  // Fetch activity types and procurement modes when open
  useEffect(() => {
    if (isOpen) {
      api.get('/procurement-activity-types', {
        params: { page: 1, pageSize: 100, filters: 'isActive==true' }
      })
        .then((res) => {
          setActivityTypes(res.data?.data || [])
        })
        .catch((err) => {
          console.error('Failed to load activity types in EditAPPBACDialog:', err)
        })

      api.get('/procurement-modes', {
        params: { PageNumber: 1, PageSize: 1000 }
      })
        .then((res) => {
          setProcurementModes(res.data?.data || [])
        })
        .catch((err) => {
          console.error('Failed to load procurement modes in EditAPPBACDialog:', err)
        })
    }
  }, [isOpen])

  // Sync form data with current app when dialog opens
  // Auto-populate BAC with mock data from aggregated items if empty
  useEffect(() => {
    if (isOpen && currentApp) {
      console.log('📋 EditAPPBACDialog: currentApp updated, syncing formData...')
      console.log('📊 Current BAC lineItems count:', currentApp.bac?.lineItems?.length || 0)
      
      const appCopy = { ...currentApp }

      // Ensure BAC object exists
      if (!appCopy.bac) {
        appCopy.bac = {
          id: `bac-${currentApp.id}`,
          appId: currentApp.id,
          lineItems: [],
          sourceFunds: [],
          modeOfProcurements: [],
          totalBudget: 0,
        }
      }

      // If BAC line items are empty, populate from APP items or aggregated items
      if (!appCopy.bac?.lineItems || appCopy.bac?.lineItems?.length === 0) {
        const lineItems = transformAPPItemsToBACLineItems(appCopy)
        const { sourceFunds, modeOfProcurements } = extractBACMetadata(appCopy)

        appCopy.bac = {
          ...appCopy.bac,
          lineItems,
          sourceFunds,
          modeOfProcurements,
          totalBudget: appCopy.aggregationResults.totalAmount,
        }
      }

      console.log('✅ Setting formData with BAC lineItems:', appCopy.bac?.lineItems?.length || 0)
      setFormData(appCopy)
    }
  }, [isOpen, currentApp])

  // Track if form has unsaved changes
  const isDirty = useMemo(
    () => {
      if (!formData || !currentApp) return false
      return JSON.stringify(formData.bac) !== JSON.stringify(currentApp.bac)
    },
    [formData, currentApp],
  )

  /**
   * Handle saving BAC configuration
   * Updates the current APP with new BAC data
   * Also updates the app list for persistence
   */
  const handleSave = useCallback(async () => {
    if (!formData || isSaving) return

    setIsSaving(true)
    try {
      const toScheduleString = (value: any): string => {
        if (!value) return ''
        if (typeof value === 'string') return value
        if (value instanceof Date) return value.toISOString().split('T')[0]
        return String(value)
      }

      // Construct PUT payload
      const payload = formData.bac.lineItems.map((item) => {
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

      // Call dynamic PUT endpoint
      await api.put(`/apps/${formData.id}/bac/line-items`, payload)

      // Update both currentApp and appList for real-time and persistent updates
      setCurrentApp(formData)
      setAppList(
        appList.map((app) =>
          app.id === formData.id ? formData : app
        )
      )

      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
      })

      toast.success('BAC configuration updated successfully!')
      handleOpenChange(false)
    } catch (error) {
      console.error('Failed to update BAC configuration:', error)
      toast.error('Failed to update BAC configuration')
    } finally {
      setIsSaving(false)
    }
  }, [formData, isSaving, setCurrentApp, setAppList, appList, handleOpenChange, activityTypes, procurementModes, queryClient])

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
      handleOpenChange(newOpen)
    },
    [isDirty, handleOpenChange],
  )

  /**
   * Handle Cancel button click
   * Show warning if dirty, otherwise close
   */
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowUnsavedWarning(true)
    } else {
      handleOpenChange(false)
    }
  }, [isDirty, handleOpenChange])

  /**
   * Confirm discard of unsaved changes
   */
  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedWarning(false)
    setFormData(currentApp)
    handleOpenChange(false)
  }, [currentApp, handleOpenChange])

  if (!formData || !formData.bac) return null

  return (
    <>
      <ResponsiveDialog
        open={isOpen && !showUnsavedWarning}
        onOpenChange={handleDialogOpenChange}
        title="Edit Budget Alignment & Procurement (BAC)"
        description="Configure BAC details, milestones, procurement modes, remarks, and EPA eligibility."
        className="z-[999] pointer-events-auto sm:max-w-[900px] lg:max-w-[1000px]"
        onPointerDownOutside={(e) => {
          if (isSaving) e.preventDefault()
        }}
      >
        <div className="flex flex-col h-[calc(100vh-240px)]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="space-y-6 pr-4">
              {/* BAC Configuration Component */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                    ⚙️
                  </span>
                  BAC Configuration
                </h3>
                <Card className="pt-6">
                  <BACWorkspace
                    workspace={formData.bac}
                    onUpdate={(bac) => {
                      setFormData({ ...formData, bac })
                    }}
                    readOnly={false}
                  />
                </Card>
              </div>

              {/* Summary Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Total Line Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formData.bac?.lineItems?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Total Budget
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{formData.bac?.totalBudget?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t bg-white">
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
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent className="z-[99999] pointer-events-auto" style={{ zIndex: 99999 }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have made changes to the BAC configuration. Are you sure you want to discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel 
              onClick={() => setShowUnsavedWarning(false)}
              className="bg-white"
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
