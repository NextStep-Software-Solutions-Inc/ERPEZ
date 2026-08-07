/**
 * Step 3: KPI Office Assignment Review
 * 
 * Final step for Annual Performance Planning
 * Displays all KPI assignments to offices with distributed target values
 * User confirms and saves the active KPI assignments
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronRight, ChevronLeft, Info, Lock, LockOpen } from 'lucide-react'

interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  isLocked: boolean
}

interface KPIOfficeAssignmentPreviewProps {
  availableOffices: Array<{ id: string; name: string }>
  kpiOfficeAssignments: Array<{
    kpiId: string
    kpiCode: string
    kpiName: string
    assignedOfficeIds: Set<string>
    officeDistributions?: Map<string, number>
    officeQuarterlyDistributions?: Map<
      string,
      { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
    >
  }>
  baseTargets: BaseKPITarget[]
  onProceed: () => void
  onBack: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  onLockToggle?: (kpiId: string, isLocked: boolean) => void
}

export function KPIOfficeAssignmentPreview({
  availableOffices,
  kpiOfficeAssignments,
  baseTargets,
  onProceed,
  onBack,
  onCancel,
  isSubmitting = false,
  onLockToggle,
}: KPIOfficeAssignmentPreviewProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    kpiId: string
    currentLockState: boolean
  } | null>(null)

  // Create a mapping of baseTargets for easy lookup
  const baseTargetMap = new Map(baseTargets.map((t) => [t.kpiId, t]))

  // Build KPI-centric view (for planning officers to easily view by KPI)
  const kpiAssignments = kpiOfficeAssignments.map((assignment) => {
    const baseTarget = baseTargetMap.get(assignment.kpiId)
    const officeDistributions = assignment.officeDistributions || new Map<string, number>()
    const officeQuarterlyDistributions = assignment.officeQuarterlyDistributions || new Map<string, { q1: number | null; q2: number | null; q3: number | null; q4: number | null }>()

    const offices = Array.from(assignment.assignedOfficeIds)
      .map((officeId) => {
        const office = availableOffices.find((o) => o.id === officeId)
        // Use the distributed value for this office, not the total base target
        const distributedValue = officeDistributions.get(officeId) || 0
        const quarterly = officeQuarterlyDistributions.get(officeId) || { q1: null, q2: null, q3: null, q4: null }
        return {
          officeId,
          officeName: office?.name || 'Unknown',
          targetValue: distributedValue,
          q1: quarterly.q1,
          q2: quarterly.q2,
          q3: quarterly.q3,
          q4: quarterly.q4,
        }
      })
      .sort((a, b) => a.officeName.localeCompare(b.officeName))

    return {
      kpiId: assignment.kpiId,
      kpiCode: assignment.kpiCode,
      kpiName: assignment.kpiName,
      aggregationMethod: baseTarget?.aggregationMethod || 'SUM',
      isLocked: baseTarget?.isLocked || false,
      offices,
      totalAssigned: offices.reduce((sum, o) => sum + (o.targetValue || 0), 0),
    }
  })

  // Summary statistics (KPI-centric view)
  const totalKPIs = kpiAssignments.length
  const totalOffices = Array.from(new Set(kpiOfficeAssignments.flatMap((a) => Array.from(a.assignedOfficeIds)))).length
  const totalAssignments = kpiAssignments.reduce((sum, k) => sum + k.offices.length, 0)
  const totalBaseTarget = kpiAssignments.reduce((sum, k) => sum + k.totalAssigned, 0)

  const handleLockClick = (kpiId: string, isCurrentlyLocked: boolean) => {
    setConfirmDialog({ kpiId, currentLockState: isCurrentlyLocked })
  }

  const handleConfirmLockToggle = () => {
    if (confirmDialog) {
      onLockToggle?.(confirmDialog.kpiId, !confirmDialog.currentLockState)
      setConfirmDialog(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Review & Save KPI Assignments</h2>
        <p className="text-sm text-blue-700">
          Review all KPI assignments by office with their distributed annual targets. Click Save to finalize the active KPIs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalKPIs}</div>
          <div className="text-xs text-blue-700">KPIs Assigned</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{totalOffices}</div>
          <div className="text-xs text-green-700">Offices Receiving KPIs</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-50 border-amber-200">
          <div className="text-2xl font-bold text-amber-600">{totalAssignments}</div>
          <div className="text-xs text-amber-700">Total Assignments</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{totalBaseTarget}</div>
          <div className="text-xs text-purple-700">Total Base Target</div>
        </Card>
      </div>

      {/* KPI Assignments Table - KPI-Centric View */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">KPI Code</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">KPI Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Aggregation</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Office</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Annual Target</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {kpiAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Info className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                    No KPI assignments available
                  </td>
                </tr>
              ) : (
                kpiAssignments.map((kpi, kpiIdx) =>
                  kpi.offices.map((office, officeIdx) => (
                    <tr
                      key={`${kpi.kpiId}-${office.officeId}`}
                      className={`border-b transition-colors ${
                        kpiIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      {/* KPI Code (merged rows) */}
                      {officeIdx === 0 && (
                        <td
                          rowSpan={kpi.offices.length}
                          className="px-4 py-3 font-semibold text-gray-900 bg-blue-50 border-r-2 border-blue-200"
                        >
                          <div className="font-medium">{kpi.kpiCode}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {kpi.offices.length} office{kpi.offices.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                      )}

                      {/* KPI Name (merged rows) */}
                      {officeIdx === 0 && (
                        <td
                          rowSpan={kpi.offices.length}
                          className="px-4 py-3 text-gray-700 max-w-xs bg-blue-50"
                        >
                          {kpi.kpiName}
                        </td>
                      )}

                      {/* Aggregation (merged rows) */}
                      {officeIdx === 0 && (
                        <td rowSpan={kpi.offices.length} className="px-4 py-3 bg-blue-50">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              kpi.aggregationMethod === 'SUM'
                                ? 'bg-orange-50 border-orange-300 text-orange-700'
                                : ''
                            }`}
                          >
                            {kpi.aggregationMethod}
                          </Badge>
                        </td>
                      )}

                      {/* Office Name */}
                      <td className="px-4 py-3 font-medium text-gray-900">{office.officeName}</td>

                      {/* Target Value */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-semibold text-gray-900">{office.targetValue}</div>
                        {(office.q1 !== null || office.q2 !== null || office.q3 !== null || office.q4 !== null) && (
                          <div className="text-[10px] text-gray-500 mt-1 flex justify-center gap-1.5">
                            <span>Q1: {office.q1 ?? '-'}</span>
                            <span>Q2: {office.q2 ?? '-'}</span>
                            <span>Q3: {office.q3 ?? '-'}</span>
                            <span>Q4: {office.q4 ?? '-'}</span>
                          </div>
                        )}
                      </td>

                      {/* Status for KPI Assignment */}
                      {officeIdx === 0 && (
                        <td
                          rowSpan={kpi.offices.length}
                          className="px-4 py-3 text-center bg-blue-50"
                        >
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {kpi.isLocked ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold gap-1 px-2.5 py-0.5 whitespace-nowrap">
                                <Lock className="w-3.5 h-3.5 text-purple-600 inline" />
                                Locked
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium px-2 py-0.5 whitespace-nowrap">
                                {baseTargetMap.get(kpi.kpiId)?.status || 'Draft'}
                              </Badge>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">KPI Assignment Review Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>KPIs are grouped showing all offices assigned to receive each KPI</li>
              <li>Annual Target shows the base target value distributed to each office</li>
              <li>Status reflects the current KPI assignment status (Draft, TargetsSet, or Assigned) and overall lock state</li>
              <li>Locked KPIs are protected from changes during the active performance planning cycle</li>
              <li>Click Save Active KPIs to finalize and commit these office assignments</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={onProceed} 
            className="bg-green-600 hover:bg-green-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Saving...
              </>
            ) : (
              <>
                Save Active KPIs
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Lock Confirmation Dialog */}
      <AlertDialog open={confirmDialog !== null} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.currentLockState ? 'Unlock Target?' : 'Lock Target?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.currentLockState
                ? 'Are you sure you want to unlock this KPI target? It will be editable again.'
                : 'Are you sure you want to lock this KPI target? It will be protected from changes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLockToggle} className="bg-blue-600">
              {confirmDialog?.currentLockState ? 'Unlock' : 'Lock'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
