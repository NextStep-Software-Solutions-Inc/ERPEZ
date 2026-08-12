import { useState } from 'react'
import { CheckCircle2, Edit2, FileCheck2, Pencil, Settings } from 'lucide-react'
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
        // Handle both single offices and comma-separated consolidated offices
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

  return (
    <div id="bac-section" className="mt-3 border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-orange-50/80 to-orange-100/40 border-t-4 border-t-orange-500">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-sm shadow-lg">
              6
            </div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Settings className="w-6 h-6 text-orange-600" />
              Budget Alignment & Procurement Details
            </h2>
            <div className="ml-auto flex items-center gap-2">
              {isDraft && itemCount > 0 && (
                <>
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    size="sm"
                    className="pointer-events-auto cursor-pointer hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit All
                  </Button>
                </>
              )}
              <div className="w-12 h-12 bg-orange-200/30 rounded-lg flex items-center justify-center">⚙️</div>
            </div>
          </div>
        </div>
        <CardContent className="px-6 pb-6 space-y-6">

          {/* Included Offices */}
          {includedOffices.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                Included Offices/Divisions ({includedOffices.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {includedOffices.map((office, idx) => (
                  <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                    {office}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Modes of Procurement */}
          {(app.bac?.modeOfProcurements ?? []).length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                Modes of Procurement
              </p>
              <div className="flex flex-wrap gap-2">
                {(app.bac?.modeOfProcurements ?? []).map((mop, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-300"
                  >
                    {mop}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project Checklist */}
          {checklist && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-blue-600" />
                    Project Checklist
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {checklist.profileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {checklist.profileDescription} loaded for {checklist.projectCategory}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    checklist.confirmed
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-amber-300 bg-amber-50 text-amber-700'
                  }
                >
                  {checklist.confirmed ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : null}
                  {checklist.confirmed ? 'Confirmed' : 'Pending'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    Envelope 1
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-900">
                    {envelopeOneCount}
                  </p>
                </div>
                <div className="rounded-md border border-purple-200 bg-purple-50 p-3">
                  <p className="text-xs font-semibold uppercase text-purple-700">
                    Envelope 2
                  </p>
                  <p className="mt-1 text-xl font-bold text-purple-900">
                    {envelopeTwoCount}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-700">
                    Active Requirements
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {activeChecklistRequirements.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activeChecklistRequirements.map((requirement) => (
                  <Badge
                    key={requirement.id}
                    variant="outline"
                    className={
                      requirement.source === 'custom'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }
                  >
                    {requirement.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Line Items Table */}
          {(app.bac?.lineItems ?? []).length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                Line Items Details ({app.bac?.lineItems?.length ?? 0})
              </p>
              <div className="space-y-6">
                {app.bac?.lineItems?.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-l-orange-500 pl-4 pb-4 last:pb-0 last:border-b-0 border-b">
                    {/* Item Header with Edit Button */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-500">({item.unit})</p>
                        </div>
                      </div>
                      {isDraft && (
                        <Button
                          onClick={() => handleEditItem(item, idx)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Item Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600 font-semibold">Qty</p>
                        <p className="font-bold text-gray-900">{item.quantity}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600 font-semibold">Unit Cost</p>
                        <p className="font-bold text-gray-900">₱{item.unitCost.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded border border-orange-200">
                        <p className="text-orange-600 font-semibold">Total</p>
                        <p className="font-bold text-orange-900">₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded border border-purple-200">
                        <p className="text-purple-600 font-semibold">MoP</p>
                        <p className="font-bold text-purple-900 text-xs">{item.modeOfProcurement || 'N/A'}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-green-600 font-semibold">Allotment Class</p>
                        <p className="font-bold text-green-900 text-xs">{item.allotmentClass || '—'}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-blue-600 font-semibold">Office</p>
                        <p className="font-bold text-blue-900 text-xs">{item.office || '—'}</p>
                      </div>
                    </div>

                    {/* Milestones */}
                    {item.milestones && Object.values(item.milestones).some(v => v) && (
                      <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          📅 Procurement Milestones
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {item.milestones.advertisementDate && (
                            <div><span className="font-semibold text-gray-700">📢 Advertisement:</span> <span className="text-gray-900">{getScheduleDisplayText(item.milestones.advertisementDate)}</span></div>
                          )}
                          {item.milestones.submissionDate && (
                            <div><span className="font-semibold text-gray-700">📋 Submission:</span> <span className="text-gray-900">{getScheduleDisplayText(item.milestones.submissionDate)}</span></div>
                          )}
                          {item.milestones.noticeOfAwardDate && (
                            <div><span className="font-semibold text-gray-700">🏆 Notice of Award:</span> <span className="text-gray-900">{getScheduleDisplayText(item.milestones.noticeOfAwardDate)}</span></div>
                          )}
                          {item.milestones.contractSigningDate && (
                            <div><span className="font-semibold text-gray-700">✍️ Contract Signing:</span> <span className="text-gray-900">{getScheduleDisplayText(item.milestones.contractSigningDate)}</span></div>
                          )}
                        </div>
                      </div>
                    )}


                    {/* Procurement Strategies */}
                    {item.procurementStrategies && item.procurementStrategies.length > 0 && (
                      <div className="mb-3 p-3 bg-indigo-50 rounded border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-700 mb-2">🛠️ Procurement Strategies</p>
                        <div className="flex flex-wrap gap-2">
                          {item.procurementStrategies.map((strategy) => (
                            <Badge
                              key={strategy}
                              variant="outline"
                              className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs"
                            >
                              {PROCUREMENT_STRATEGY_LABELS[strategy]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {item.remarks && (
                      <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-700 mb-1">💬 Remarks</p>
                        <p className="text-xs text-gray-700">{item.remarks}</p>
                      </div>
                    )}

                    {/* EPA */}
                    <div className="flex items-start gap-2">
                      {item.eligibleForEPA && (
                        <div className="p-2 bg-green-50 rounded border border-green-200 flex-1">
                          <p className="text-xs font-semibold text-green-700 mb-1">🌱 EPA Eligible</p>
                          {item.epaRemarks && <p className="text-xs text-gray-700">{item.epaRemarks}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
