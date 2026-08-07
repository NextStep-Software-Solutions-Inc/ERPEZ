/**
 * KPI Details Dialog
 * Step 2: Configure activated KPIs - View details with API integration
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'
import {
  Info,
  Layers,
  Clock,
  Target,
  FileText,
  Building,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react'
import type { ActivatedKPIRow } from '../table/types'

interface KPIDetailsDialogProps {
  isOpen: boolean
  kpi?: ActivatedKPIRow
  onClose: () => void
  onSave?: (kpi: ActivatedKPIRow) => void
  readOnly?: boolean
}

export function KPIDetailsDialog({
  isOpen,
  kpi,
  onClose,
}: KPIDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [activeKpiDetails, setActiveKpiDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'assignments'>('overview')

  useEffect(() => {
    if (isOpen && kpi?.id) {
      setLoading(true)
      setError(null)
      api.get(`/fy-active-kpis/${kpi.id}`)
        .then((response) => {
          if (response.data?.succeeded) {
            setActiveKpiDetails(response.data.data)
          } else {
            setError(response.data?.message || 'Failed to load details')
          }
        })
        .catch((err) => {
          console.error(err)
          setError('Error loading KPI details')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setActiveKpiDetails(null)
      setActiveTab('overview')
    }
  }, [isOpen, kpi?.id])

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="h-[700px] flex flex-col overflow-hidden" size='lg'>
        <DialogHeader className="pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 font-mono py-0.5 px-2 rounded text-xs border border-purple-200">
                {activeKpiDetails?.code || kpi?.code || 'KPI'}
              </span>
              <span>{activeKpiDetails?.name || kpi?.name || 'KPI Details'}</span>
            </DialogTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {activeKpiDetails?.isGAD && (
              <Badge className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-150 text-[10px]">
                GAD Active
              </Badge>
            )}
            {activeKpiDetails?.isOptInAvailable && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-150 text-[10px]">
                Opt-In Allowed
              </Badge>
            )}
            {activeKpiDetails?.isLocked && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-150 text-[10px] flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Locked</span>
              </Badge>
            )}
            {activeKpiDetails?.status && (
              <Badge className={`text-[10px] ${
                activeKpiDetails.status === 'Assigned'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {activeKpiDetails.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 flex-1">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-500 font-medium">Loading KPI details...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 my-6 bg-red-50 text-red-700 border border-red-200 rounded-lg flex-1">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : activeKpiDetails ? (
          <div className="flex-1 py-4 flex flex-col overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('measurements')}
                className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'measurements'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Measurements & MOVs
                <Badge variant="outline" className="text-[10px] py-0 px-1 border-gray-300 bg-gray-55 text-gray-650">
                  {activeKpiDetails.measurements?.length || 0}
                </Badge>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'assignments'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Office Assignments
                <Badge variant="outline" className="text-[10px] py-0 px-1 border-gray-300 bg-gray-55 text-gray-650">
                  {activeKpiDetails.assignments?.length || 0}
                </Badge>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto pr-1">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {activeKpiDetails.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <Layers className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <span className="block text-xs font-medium text-gray-400">Function Category</span>
                        <span className="text-sm font-semibold text-gray-900">{activeKpiDetails.functionCategory || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <span className="block text-xs font-medium text-gray-400">Monitoring Frequency</span>
                        <span className="text-sm font-semibold text-gray-900">{activeKpiDetails.monitoringFrequency || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <span className="block text-xs font-medium text-gray-400">Measurement Unit</span>
                        <span className="text-sm font-semibold text-gray-900">{activeKpiDetails.measurementUnit || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <Info className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <span className="block text-xs font-medium text-gray-400">Distribution Behavior</span>
                        <span className="text-sm font-semibold text-gray-900">{activeKpiDetails.distributionBehavior || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* MFO / PAP & Fiscal Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="block text-xs font-medium text-gray-400 mb-1">MFO / PAP</span>
                      {activeKpiDetails.mfopap ? (
                        <div>
                          <Badge variant="outline" className="mb-1 text-xs font-mono text-purple-700 bg-purple-50 border-purple-200">
                            {activeKpiDetails.mfopap.code}
                          </Badge>
                          <span className="block text-sm font-semibold text-gray-900 leading-tight">{activeKpiDetails.mfopap.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">None assigned</span>
                      )}
                    </div>

                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="block text-xs font-medium text-gray-400 mb-1">Fiscal Year</span>
                      {activeKpiDetails.fiscalYear ? (
                        <div>
                          <span className="block text-sm font-semibold text-gray-900 mb-1">Year {activeKpiDetails.fiscalYear.year}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-gray-600 capitalize font-medium">{activeKpiDetails.fiscalYear.status}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Target Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agency Targets</h4>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] font-semibold text-purple-600 mb-1">Annual Target</span>
                        <span className="text-lg font-bold text-purple-900">{activeKpiDetails.agencyTargetAnnual !== null ? activeKpiDetails.agencyTargetAnnual : 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] font-semibold text-gray-500 mb-1">Q1 Target</span>
                        <span className="text-lg font-bold text-gray-800">{activeKpiDetails.agencyTargetQ1 !== null ? activeKpiDetails.agencyTargetQ1 : '-'}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] font-semibold text-gray-500 mb-1">Q2 Target</span>
                        <span className="text-lg font-bold text-gray-800">{activeKpiDetails.agencyTargetQ2 !== null ? activeKpiDetails.agencyTargetQ2 : '-'}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] font-semibold text-gray-500 mb-1">Q3 Target</span>
                        <span className="text-lg font-bold text-gray-800">{activeKpiDetails.agencyTargetQ3 !== null ? activeKpiDetails.agencyTargetQ3 : '-'}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] font-semibold text-gray-500 mb-1">Q4 Target</span>
                        <span className="text-lg font-bold text-gray-800">{activeKpiDetails.agencyTargetQ4 !== null ? activeKpiDetails.agencyTargetQ4 : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'measurements' && (
                <div className="space-y-6">
                  {activeKpiDetails.measurements && activeKpiDetails.measurements.length > 0 ? (
                    activeKpiDetails.measurements.map((measurement: any, index: number) => (
                      <div key={measurement.id || index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
                        <div>
                          <span className="text-xs font-bold text-purple-600 tracking-wider uppercase block mb-1">Measurement #{index + 1}</span>
                          <h4 className="text-base font-bold text-gray-900">{measurement.name}</h4>
                          {measurement.statement && (
                            <p className="text-sm text-gray-600 italic mt-1">"{measurement.statement}"</p>
                          )}
                        </div>

                        {/* Dimensions */}
                        {measurement.dimensions && measurement.dimensions.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-400 block">Dimensions</span>
                            <div className="flex flex-wrap gap-1.5">
                              {measurement.dimensions.map((dim: string, dIdx: number) => (
                                <Badge key={dIdx} variant="soft" className="text-xs font-medium bg-blue-50 border-blue-150 text-blue-800">
                                  {dim}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Means of Verification */}
                        {measurement.moVs && measurement.moVs.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-medium text-gray-400 block">Means of Verification (MOVs)</span>
                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                              {measurement.moVs.map((mov: string, mIdx: number) => (
                                <li key={mIdx} className="leading-tight">{mov}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-455 border border-dashed border-gray-200 rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <span className="text-sm">No measurements defined for this KPI.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  {activeKpiDetails.assignments && activeKpiDetails.assignments.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Office Name</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Target</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q1</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q2</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q3</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q4</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lock State</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeKpiDetails.assignments.map((assignment: any, index: number) => (
                            <tr key={assignment.id || index} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                                <Building className="h-4 w-4 text-purple-400" />
                                <span>{assignment.officeName}</span>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-purple-700 bg-purple-50/30">
                                {assignment.assignedTargetAnnual}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                {assignment.assignedTargetQ1 !== null ? assignment.assignedTargetQ1 : '-'}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                {assignment.assignedTargetQ2 !== null ? assignment.assignedTargetQ2 : '-'}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                {assignment.assignedTargetQ3 !== null ? assignment.assignedTargetQ3 : '-'}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                {assignment.assignedTargetQ4 !== null ? assignment.assignedTargetQ4 : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {assignment.isLocked ? (
                                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[10px] py-0 px-1.5 flex items-center justify-center w-fit mx-auto gap-1">
                                    <Lock className="h-3 w-3" />
                                    <span>Locked</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-800 text-[10px] py-0 px-1.5 flex items-center justify-center w-fit mx-auto gap-1">
                                    <Unlock className="h-3 w-3" />
                                    <span>Unlocked</span>
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <span className="text-sm">No office assignments registered.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 font-medium flex-1">
            No KPI information found.
          </div>
        )}

        <DialogFooter className="border-t pt-4 flex-shrink-0">
          <Button type="button" onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
