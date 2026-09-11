import { useState } from 'react'
import { CheckCircle2, Edit2, FileCheck2, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AppMaster, BACLineItem } from '../types'
import { PROCUREMENT_STRATEGY_LABELS } from '../types'
import { EditBACItemDialog } from '../dialogs/EditBACItemDialog'
import { getScheduleDisplayText } from '../utils/scheduleParser'

interface BACDetailsSectionProps {
  app: AppMaster
  isDraft?: boolean
  onEdit?: () => void
  itemCount?: number
}

export function BACDetailsSection({ app, isDraft, onEdit, itemCount = 0 }: BACDetailsSectionProps) {
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<BACLineItem | null>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | undefined>(undefined)
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false)

  const handleEditItem = (item: BACLineItem, index: number) => {
    setSelectedItemForEdit(item)
    setSelectedItemIndex(index)
    setIsItemEditorOpen(true)
  }

  // Get unique offices
  const getIncludedOffices = () => {
    const offices = new Set<string>()
    app.bac.lineItems?.forEach((item) => {
      if (item.office) {
        const officeList = item.office.split(',').map(o => o.trim()).filter(o => o)
        officeList.forEach(office => offices.add(office))
      }
    })
    return Array.from(offices).sort()
  }

  const includedOffices = getIncludedOffices()
  const checklist = app.bac?.projectChecklist
  const checklistRequirements = checklist?.requirements ?? []
  const activeChecklistRequirements = checklistRequirements.filter(
    (requirement) => requirement.enabled,
  )
  const envelopeOneCount = activeChecklistRequirements.filter(
    (requirement) => requirement.envelope === 'Envelope 1',
  ).length
  const envelopeTwoCount = activeChecklistRequirements.filter(
    (requirement) => requirement.envelope === 'Envelope 2',
  ).length

  const formatProcurementDates = (item: BACLineItem) => {
    const startDate = item.effectiveStartOfProcurement || item.startOfProcurementOverride
    const endDate = item.effectiveEndOfProcurement || item.endOfProcurementOverride
    if (!startDate && !endDate) return 'Not set'

    const parseShortMonth = (dateStr?: string | null) => {
      if (!dateStr) return ''
      const trimmed = dateStr.trim().split('T')[0]
      try {
        const d = new Date(trimmed)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }
      } catch {}
      return dateStr
    }

    const startFormatted = parseShortMonth(startDate)
    const endFormatted = parseShortMonth(endDate)
    return `${startFormatted} → ${endFormatted}`
  }

  return (
    <div id="bac-section" className="mt-3 bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              Annual Procurement Plan Line Item Details
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Consolidated procurement items, mode configuration, schedules, and strategies
            </p>
          </div>

          {isDraft && itemCount > 0 && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold text-purple-800 border-purple-300 bg-purple-50 hover:bg-purple-100"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit All Items
            </Button>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Summary Badges: Included Offices & Modes of Procurement */}
          {(includedOffices.length > 0 || (app.bac?.modeOfProcurements ?? []).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
              {includedOffices.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                    Included Offices / Divisions ({includedOffices.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {includedOffices.map((office, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {office}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(app.bac?.modeOfProcurements ?? []).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                    Modes of Procurement
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(app.bac?.modeOfProcurements ?? []).map((mop, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200"
                      >
                        {mop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Checklist */}
          {checklist && (
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4.5 w-4.5 text-blue-700" />
                  <span className="text-sm font-semibold text-slate-900">
                    Project Checklist: {checklist.profileName}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    ({checklist.profileDescription || checklist.projectCategory})
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    checklist.confirmed
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                  }`}
                >
                  {checklist.confirmed ? <CheckCircle2 className="mr-1 h-3.5 w-3.5 inline" /> : null}
                  {checklist.confirmed ? 'Confirmed' : 'Pending'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs border-t border-slate-200 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Envelope 1:</span>
                  <span className="font-bold text-slate-900">{envelopeOneCount} requirements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Envelope 2:</span>
                  <span className="font-bold text-slate-900">{envelopeTwoCount} requirements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Active Total:</span>
                  <span className="font-bold text-slate-900">{activeChecklistRequirements.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Line Items List — Accessible Typography & High Contrast */}
          {(app.bac?.lineItems ?? []).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Consolidated Line Items ({app.bac?.lineItems?.length ?? 0})
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {app.bac?.lineItems?.map((item, idx) => {
                  const effectiveABC = (item.effectiveABC ?? item.estimatedBudgetOverride ?? item.totalAmount) || 0
                  const qty = (item.quantity && item.quantity > 0)
                    ? item.quantity
                    : (item.unitCost && effectiveABC > 0)
                      ? Math.round(effectiveABC / item.unitCost)
                      : (item.quantity ?? 1)
                  return (
                    <div
                      key={idx}
                      className="py-5 first:pt-0 last:pb-0 space-y-3 relative pl-4 border-l-4 border-l-purple-600"
                    >
                      {/* Item Header & Cost */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-[280px] space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-base font-semibold text-slate-900 leading-tight">
                              {item.description}
                            </h3>
                            {item.eligibleForEPA && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                EPA Eligible
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-700 flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5">
                            <span className="font-semibold text-slate-600 uppercase">{item.unit || 'unit'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900 text-base">
                              ₱{effectiveABC.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-700 font-medium">
                              {qty} {item.unit || 'units'} × ₱{item.unitCost?.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                            </span>
                            {item.estimatedBudgetOverride != null && (
                              <span className="text-xs text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                                ★ APP Override
                              </span>
                            )}
                          </div>
                        </div>

                        {isDraft && (
                          <Button
                            onClick={() => handleEditItem(item, idx)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-slate-700 hover:text-purple-800 hover:bg-purple-50"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1 text-purple-700" />
                            <span className="text-xs font-semibold">Edit</span>
                          </Button>
                        )}
                      </div>

                      {/* Compact Metadata Row with Accessible High Contrast */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 bg-slate-50/80 rounded-lg text-xs border border-slate-200">
                        {/* Procurement Mode (Blue) */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                            Procurement Mode
                          </span>
                          <span className="font-bold text-blue-800">
                            {item.modeOfProcurement || 'N/A'}
                          </span>
                        </div>

                        {/* Schedule (Teal / Green) */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                            Schedule
                          </span>
                          <span className="font-bold text-emerald-800">
                            {formatProcurementDates(item)}
                          </span>
                        </div>

                        {/* Office */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                            Office
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.office || '—'}
                          </span>
                        </div>

                        {/* Allotment Class */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">
                            Allotment Class
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.allotmentClass || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Milestones (if any) */}
                      {item.milestones && Object.values(item.milestones).some(v => v) && (
                        <div className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-lg border border-slate-200 space-y-1">
                          <span className="font-semibold text-slate-600 uppercase tracking-wider block">
                            Procurement Milestones:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {item.milestones.advertisementDate && (
                              <div><span className="text-slate-600">Ad:</span> <span className="font-semibold text-slate-900">{getScheduleDisplayText(item.milestones.advertisementDate)}</span></div>
                            )}
                            {item.milestones.submissionDate && (
                              <div><span className="text-slate-600">Submission:</span> <span className="font-semibold text-slate-900">{getScheduleDisplayText(item.milestones.submissionDate)}</span></div>
                            )}
                            {item.milestones.noticeOfAwardDate && (
                              <div><span className="text-slate-600">NOA:</span> <span className="font-semibold text-slate-900">{getScheduleDisplayText(item.milestones.noticeOfAwardDate)}</span></div>
                            )}
                            {item.milestones.contractSigningDate && (
                              <div><span className="text-slate-600">Signing:</span> <span className="font-semibold text-slate-900">{getScheduleDisplayText(item.milestones.contractSigningDate)}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Procurement Strategies (if any) */}
                      {item.procurementStrategies && item.procurementStrategies.length > 0 && (
                        <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-600 uppercase tracking-wider">Strategies:</span>
                          <span className="font-semibold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                            {item.procurementStrategies.map(s => PROCUREMENT_STRATEGY_LABELS[s] || s).join(' · ')}
                          </span>
                        </div>
                      )}

                      {/* Remarks (if any) */}
                      {item.remarks && (
                        <div className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-600 uppercase tracking-wider block mb-0.5">Remarks:</span>
                          <p className="text-slate-800">{item.remarks}</p>
                        </div>
                      )}

                      {/* EPA Remarks (if any) */}
                      {item.eligibleForEPA && item.epaRemarks && (
                        <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5">EPA Remarks:</span>
                          <p>{item.epaRemarks}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Item Editor Dialog */}
      <EditBACItemDialog
        open={isItemEditorOpen}
        onOpenChange={setIsItemEditorOpen}
        lineItem={selectedItemForEdit}
        itemIndex={selectedItemIndex}
      />
    </div>
  )
}
