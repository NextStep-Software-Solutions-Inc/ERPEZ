/**
 * Step 3.3: Target Distribution Form
 * 
 * Offices distribute base targets to KPI-Office combinations
 * and make adjustments. One row per KPI-Office combination.
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Lock, Unlock, Info, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivatedKPI } from '@/features/planning/annual-performance-planning/appTypes'

interface TargetRow {
  id: string
  kpiId: string
  kpiCode: string
  kpiName: string
  officeId: string
  officeName: string
  aggregationMethod: string
  targetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  status: 'draft' | 'proposed' | 'negotiating' | 'agreed'
  isLocked: boolean
  isShoppedByOffice?: boolean
}

interface OfficeTargetDistributionFormProps {
  activeKPIs: ActivatedKPI[]
  availableOffices: Array<{ id: string; name: string }>
  kpiOfficeAssignments: Array<{ kpiId: string; kpiCode: string; kpiName: string; assignedOfficeIds: Set<string> }>
  baseTargets?: Array<{ kpiId: string; baseTargetValue: number | null; q1: number | null; q2: number | null; q3: number | null; q4: number | null; isLocked?: boolean }>
  onSubmit: (targets: TargetRow[]) => void
  onBack?: () => void
  onCancel?: () => void
}

export function OfficeTargetDistributionForm({
  activeKPIs,
  availableOffices,
  kpiOfficeAssignments,
  baseTargets = [],
  onSubmit,
  onBack,
  onCancel,
}: OfficeTargetDistributionFormProps) {
  const [targetRows, setTargetRows] = useState<TargetRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [addKPIDialogOpen, setAddKPIDialogOpen] = useState(false)
  const [selectedShopKPIs, setSelectedShopKPIs] = useState<Set<string>>(new Set())

  // Get KPIs that are assigned to any office
  const assignedKPIs = useMemo(
    () =>
      new Set(
        kpiOfficeAssignments.flatMap((a) =>
          Array.from(a.assignedOfficeIds).map(() => a.kpiId)
        )
      ),
    [kpiOfficeAssignments]
  )

  // Get available KPIs for shopping (not assigned to any office)
  const shoppableKPIs = useMemo(
    () => activeKPIs.filter((kpi) => !assignedKPIs.has(kpi.id)),
    [activeKPIs, assignedKPIs]
  )

  // Initialize target rows on mount or when assignments change
  useMemo(() => {
    const rows: TargetRow[] = []
    const baseTargetMap = new Map(baseTargets.map((t) => [t.kpiId, t]))

    kpiOfficeAssignments.forEach((assignment) => {
      const kpi = activeKPIs.find((k) => k.id === assignment.kpiId)
      const baseTarget = baseTargetMap.get(assignment.kpiId)
      if (!kpi) return

      assignment.assignedOfficeIds.forEach((officeId) => {
        const office = availableOffices.find((o) => o.id === officeId)
        if (!office) return

        rows.push({
          id: `target-${assignment.kpiId}-${officeId}`,
          kpiId: assignment.kpiId,
          kpiCode: assignment.kpiCode,
          kpiName: assignment.kpiName,
          officeId,
          officeName: office.name,
          aggregationMethod: kpi.aggregationMethod || 'SUM',
          targetValue: baseTarget?.baseTargetValue || null,
          q1: baseTarget?.q1 || null,
          q2: baseTarget?.q2 || null,
          q3: baseTarget?.q3 || null,
          q4: baseTarget?.q4 || null,
          status: 'draft' as const,
          isLocked: false,
        })
      })
    })

    setTargetRows(rows)
  }, [kpiOfficeAssignments, activeKPIs, availableOffices, baseTargets])

  const updateRow = (rowId: string, updates: Partial<TargetRow>) => {
    setTargetRows(
      targetRows.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    )
  }

  const addShoppedKPI = (kpiId: string, officeId: string) => {
    const kpi = activeKPIs.find((k) => k.id === kpiId)
    const office = availableOffices.find((o) => o.id === officeId)

    if (!kpi || !office) return

    // Check if already added
    const exists = targetRows.some(
      (r) => r.kpiId === kpiId && r.officeId === officeId
    )
    if (exists) return

    const newRow: TargetRow = {
      id: `target-${kpiId}-${officeId}-shopped-${Date.now()}`,
      kpiId,
      kpiCode: kpi.kpiCode || '',
      kpiName: kpi.kpiName,
      officeId,
      officeName: office.name,
      aggregationMethod: kpi.aggregationMethod || 'SUM',
      targetValue: null,
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      status: 'draft' as const,
      isLocked: false,
      isShoppedByOffice: true,
    }

    setTargetRows([...targetRows, newRow])
  }

  const removeShoppedKPI = (rowId: string) => {
    setTargetRows(targetRows.filter((r) => r.id !== rowId))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate save
      onSubmit(targetRows)
    } finally {
      setIsSaving(false)
    }
  }

  const stats = useMemo(() => {
    const totalRows = targetRows.length
    const withTargets = targetRows.filter((r) => r.targetValue !== null && r.targetValue > 0).length
    const locked = targetRows.filter((r) => r.isLocked).length

    return { totalRows, withTargets, locked }
  }, [targetRows])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">Step 3.3: Distribute & Adjust Targets by KPI</h2>
        <p className="text-sm text-purple-700">
          Organize and edit office targets grouped by KPI. Set annual and quarterly targets for each office-KPI combination.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRows}</div>
          <div className="text-xs text-blue-700">Total Target Rows</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.withTargets}</div>
          <div className="text-xs text-green-700">With Targets</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-50 border-amber-200">
          <div className="text-2xl font-bold text-amber-600">{stats.locked}</div>
          <div className="text-xs text-amber-700">Locked</div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
        <div className="text-sm text-gray-600">
          {shoppableKPIs.length > 0 && (
            <span>{shoppableKPIs.length} KPI{shoppableKPIs.length !== 1 ? 's' : ''} available to add</span>
          )}
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setAddKPIDialogOpen(true)}
          disabled={shoppableKPIs.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add KPI
        </Button>
      </div>

      {/* Target Rows - KPI-Centric Table View */}
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
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q1</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q2</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q3</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Q4</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Lock</th>
                <th className="px-4 py-2 text-center font-semibold text-gray-700">Remove</th>
              </tr>
            </thead>

            {/* Rows - Grouped by KPI */}
            <tbody>
              {targetRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    <Info className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                    No target rows to assign (go back to assign offices)
                  </td>
                </tr>
              ) : (
                (() => {
                  // Group rows by KPI
                  const groupedByKPI = new Map<string, TargetRow[]>()
                  targetRows.forEach((row) => {
                    if (!groupedByKPI.has(row.kpiId)) {
                      groupedByKPI.set(row.kpiId, [])
                    }
                    groupedByKPI.get(row.kpiId)!.push(row)
                  })

                  const rows: React.ReactNode[] = []
                  let kpiIndex = 0

                  groupedByKPI.forEach((officeRows, kpiId) => {
                    const firstRow = officeRows[0]
                    const baseTarget = baseTargets.find((t) => t.kpiId === kpiId)
                    const kpiGroup = kpiOfficeAssignments.find((a) => a.kpiId === kpiId)
                    const aggregationMethod = kpiGroup ? firstRow.aggregationMethod : 'SUM'

                    officeRows.forEach((row, officeIdx) => (
                      <tr
                        key={row.id}
                        className={cn(
                          'border-b transition-colors',
                          row.isLocked ? 'bg-amber-50' : row.isShoppedByOffice ? 'bg-purple-50' : kpiIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                          'hover:bg-blue-50'
                        )}
                      >
                        {/* KPI Code (merged rows) */}
                        {officeIdx === 0 && (
                          <td
                            rowSpan={officeRows.length}
                            className="px-4 py-3 font-semibold text-gray-900 bg-blue-50 border-r-2 border-blue-200"
                          >
                            <div className="flex items-center gap-2">
                              <span>{firstRow.kpiCode}</span>
                              {firstRow.isShoppedByOffice && (
                                <Badge className="text-xs bg-purple-600">Shopped</Badge>
                              )}
                            </div>
                          </td>
                        )}

                        {/* KPI Name (merged rows) */}
                        {officeIdx === 0 && (
                          <td
                            rowSpan={officeRows.length}
                            className="px-4 py-3 text-gray-700 max-w-xs bg-blue-50"
                          >
                            {firstRow.kpiName}
                          </td>
                        )}

                        {/* Aggregation (merged rows) */}
                        {officeIdx === 0 && (
                          <td rowSpan={officeRows.length} className="px-4 py-3 bg-blue-50">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                aggregationMethod === 'SUM'
                                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                                  : ''
                              }`}
                            >
                              {aggregationMethod}
                            </Badge>
                          </td>
                        )}

                        {/* Office */}
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <Badge variant="outline">{row.officeName}</Badge>
                        </td>

                        {/* Annual Target */}
                        <td className="px-4 py-3">
                          {(() => {
                            const isFieldLocked =
                              baseTarget?.isLocked &&
                              baseTarget?.baseTargetValue !== null &&
                              baseTarget?.baseTargetValue > 0
                            return (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row.targetValue ?? ''}
                                onChange={(e) =>
                                  updateRow(row.id, {
                                    targetValue:
                                      e.target.value === '' ? null : Number(e.target.value),
                                  })
                                }
                                disabled={row.isLocked || isFieldLocked}
                                className="w-20 text-sm h-8 text-center"
                                placeholder="0.00"
                                title={
                                  isFieldLocked
                                    ? 'This field is locked by planning'
                                    : row.isLocked
                                      ? 'This row is locked'
                                      : 'Enter annual target'
                                }
                              />
                            )
                          })()}
                        </td>

                        {/* Q1-Q4 */}
                        {['q1', 'q2', 'q3', 'q4'].map((quarter) => {
                          const quarterValue = baseTarget?.[quarter as 'q1' | 'q2' | 'q3' | 'q4']
                          const isFieldLocked =
                            baseTarget?.isLocked &&
                            quarterValue !== null &&
                            quarterValue !== undefined &&
                            quarterValue > 0
                          return (
                            <td key={quarter} className="px-4 py-3">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={row[quarter as 'q1' | 'q2' | 'q3' | 'q4'] ?? ''}
                                onChange={(e) =>
                                  updateRow(row.id, {
                                    [quarter]:
                                      e.target.value === '' ? null : Number(e.target.value),
                                  })
                                }
                                disabled={row.isLocked || isFieldLocked}
                                className="w-16 text-sm h-8 text-center"
                                placeholder="0"
                                title={
                                  isFieldLocked
                                    ? 'This field is locked by planning'
                                    : row.isLocked
                                      ? 'This row is locked'
                                      : `Enter ${quarter.toUpperCase()}`
                                }
                              />
                            </td>
                          )
                        })}

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Select
                            value={row.status}
                            onValueChange={(value) =>
                              updateRow(row.id, {
                                status: value as TargetRow['status'],
                              })
                            }
                            disabled={row.isLocked}
                          >
                            <SelectTrigger className="w-28 text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="proposed">Proposed</SelectItem>
                              <SelectItem value="negotiating">Negotiating</SelectItem>
                              <SelectItem value="agreed">Agreed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Lock Toggle */}
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => updateRow(row.id, { isLocked: !row.isLocked })}
                            disabled={row.targetValue === null || row.targetValue === 0}
                            title={
                              row.isLocked
                                ? 'Unlock'
                                : row.targetValue === null || row.targetValue === 0
                                  ? 'Set a target to lock'
                                  : 'Lock this office target'
                            }
                          >
                            {row.isLocked ? (
                              <Lock className="w-4 h-4 text-red-600" />
                            ) : (
                              <Unlock className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </td>

                        {/* Remove if Shopped */}
                        <td className="px-4 py-3 text-center">
                          {row.isShoppedByOffice && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                              onClick={() => removeShoppedKPI(row.id)}
                              title="Remove this shopped KPI"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))

                    kpiIndex++
                  })

                  return rows
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add KPI Dialog */}
      {addKPIDialogOpen && (
        <Card className="border border-purple-200 bg-purple-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-purple-900">Select KPIs to Add</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAddKPIDialogOpen(false)
                  setSelectedShopKPIs(new Set())
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {shoppableKPIs.length === 0 ? (
              <p className="text-sm text-purple-700 py-3">
                All active KPIs are already assigned. No additional KPIs available to add.
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {shoppableKPIs.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="flex items-center gap-3 p-3 border border-purple-200 rounded hover:bg-white cursor-pointer transition-colors"
                      onClick={() => {
                        const updated = new Set(selectedShopKPIs)
                        if (updated.has(kpi.id)) {
                          updated.delete(kpi.id)
                        } else {
                          updated.add(kpi.id)
                        }
                        setSelectedShopKPIs(updated)
                      }}
                    >
                      <Checkbox
                        checked={selectedShopKPIs.has(kpi.id)}
                        onChange={() => {
                          const updated = new Set(selectedShopKPIs)
                          if (updated.has(kpi.id)) {
                            updated.delete(kpi.id)
                          } else {
                            updated.add(kpi.id)
                          }
                          setSelectedShopKPIs(updated)
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{kpi.kpiCode}</span>
                          <Badge variant="outline" className="text-xs">
                            {kpi.aggregationMethod}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{kpi.kpiName}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAddKPIDialogOpen(false)
                      setSelectedShopKPIs(new Set())
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      selectedShopKPIs.forEach((kpiId) => {
                        availableOffices.forEach((office) => {
                          addShoppedKPI(kpiId, office.id)
                        })
                      })
                      setAddKPIDialogOpen(false)
                      setSelectedShopKPIs(new Set())
                    }}
                    disabled={selectedShopKPIs.size === 0}
                  >
                    Add {selectedShopKPIs.size > 0 ? `${selectedShopKPIs.size} KPI${selectedShopKPIs.size > 1 ? 's' : ''}` : 'KPIs'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Target Assignment Guide:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Assigned KPIs (top rows) are set by planning - locked KPIs cannot be edited</li>
              <li>Use the "Add KPI" button above the table to add unassigned KPIs</li>
              <li>Each row represents one office's target for one KPI</li>
              <li>Enter annual target - quarters auto-calculate if needed</li>
              <li>Lock targets to prevent changes after approval</li>
              <li>Update status as negotiations progress</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to KPI Assignment
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || stats.totalRows === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? 'Saving...' : 'Save All Targets'}
        </Button>
      </div>
    </div>
  )
}
