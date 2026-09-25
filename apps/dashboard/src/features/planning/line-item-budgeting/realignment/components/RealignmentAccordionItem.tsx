import { useState } from 'react'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Edit2,
  X,
  History,
  FileText,
  Download,
  FileJson,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useRealignmentStore } from '../store/realignmentStore'
import { DraftAmendmentActivityView } from './DraftAmendmentActivityView'
import { DraftAmendmentProjectView } from './DraftAmendmentProjectView'
import { AmendmentEditPanel } from './AmendmentEditPanel'
import type { LIB } from '../../line-item-budget/types'
import type { LIBAmendment } from '../../line-item-budget/types/type'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RealignmentAccordionItemProps {
  lib: LIB
  activeAmendment?: LIBAmendment
  isExpanded: boolean
  isLoading: boolean
  isError: boolean
  isCurrentYear: boolean
  editMode: boolean
  onEditClick: () => void
  onDoneClick: () => void
  onSubmitClick: () => void
  onExportCSV: () => void
  onExportExcel: () => void
  onExportPDF: () => void
  onExportRealignmentPDF?: () => void
  onHistoryClick: () => void
  historyCount: number
}

export function RealignmentAccordionItem({
  lib,
  activeAmendment,
  isExpanded,
  isLoading,
  isError,
  isCurrentYear,
  editMode,
  onEditClick,
  onDoneClick,
  onSubmitClick,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onExportRealignmentPDF,
  onHistoryClick,
  historyCount,
}: RealignmentAccordionItemProps) {
  const [isAmendmentExpanded, setIsAmendmentExpanded] = useState(true)
  const [isBaselineExpanded, setIsBaselineExpanded] = useState(false)
  const activeLib = useRealignmentStore((state) => state.activeLib)
  const approvedProjectGroups = useRealignmentStore((state) => state.projectGroups)
  const approvedActivities = useRealignmentStore((state) => state.activities)
  const activeOpcrData = useRealignmentStore((state) => state.activeOpcrData)
  const activeWfpData = useRealignmentStore((state) => state.activeWfpData)

  // Render Premium Skeleton
  const renderSkeleton = () => (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="flex items-center justify-between pb-3 border-b">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-10 rounded-lg w-full" />
        <Skeleton className="h-8 rounded-lg w-[95%] ml-auto" />
        <Skeleton className="h-8 rounded-lg w-[90%] ml-auto" />
      </div>
    </div>
  )

  const getStatusBadgeVariant = (status: LIB['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Submitted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Returned':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <AccordionItem
      value={lib.id}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50/50 transition-all">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4 mr-4 text-left">
          {/* Main info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {lib.libNumber}
              </span>
              <span className="text-slate-600 text-sm font-medium">
                — {lib.name}
              </span>
              <Badge
                variant="outline"
                className={getStatusBadgeVariant(lib.status)}
              >
                {lib.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Office: {lib.office?.name || 'N/A'}</span>
              <span>•</span>
              <span>Fund cluster: {lib.fundSource?.name || 'N/A'}</span>
            </div>
          </div>

          {/* Badges and Totals */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 animate-none">
              <Badge
                variant="outline"
                className={
                  lib.sourceType === 'WFP'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }
              >
                {lib.sourceType}
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-700 border-slate-300"
              >
                {lib.scope === 'Project' ? 'Project-scoped' : 'Activity-scoped'}
              </Badge>

              {/* Conditionally rendered buttons next to badges when accordion is expanded */}
              {isExpanded && (
                <div 
                  className="flex items-center gap-1.5 ml-2 border-l pl-2 border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Export Options dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="xs"
                        className="gap-1 h-7 text-[10px] font-semibold shadow-xs border-slate-300 hover:bg-slate-50 px-2 rounded-lg"
                      >
                        <Download className="w-3 h-3" /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem
                        onClick={onExportCSV}
                        className="cursor-pointer"
                      >
                        <FileJson className="w-3.5 h-3.5 mr-2 text-slate-500" />{' '}
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onExportExcel}
                        className="cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 mr-2 text-slate-500" />{' '}
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onExportPDF}
                        className="cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 mr-2 text-slate-500" />{' '}
                        Export Original LIB as PDF
                      </DropdownMenuItem>
                      {activeAmendment && onExportRealignmentPDF && (
                        <DropdownMenuItem
                          onClick={onExportRealignmentPDF}
                          className="cursor-pointer font-medium text-red-600 focus:text-red-700"
                        >
                          <FileText className="w-3.5 h-3.5 mr-2 text-red-500" />{' '}
                          Export Realignment PDF (FM-USTP-FDP-002)
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* History Logs Toggle */}
                  <Button
                    onClick={onHistoryClick}
                    variant="outline"
                    size="xs"
                    className="gap-1 h-7 text-[10px] font-semibold shadow-xs border-slate-300 hover:bg-slate-50 px-2 rounded-lg"
                  >
                    <History className="w-3.5 h-3.5" />
                    History ({historyCount})
                  </Button>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {lib.scope === 'Project' ? 'Group Total' : 'Activity Budget'}
              </p>
              <p className="font-extrabold text-slate-900 text-sm">
                ₱
                {lib.totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="border-t border-slate-100 bg-slate-50/30">
        {isLoading ? (
          renderSkeleton()
        ) : isError ? (
          <div className="p-8 text-center text-red-500 font-medium text-xs">
            Failed to fetch budget details. Please try again.
          </div>
        ) : isExpanded ? (
          <div className="p-5">
            {/* Layout Order: If there is an active realignment request, show sandbox proposal at the top, original budget at the bottom collapsible */}
            {activeAmendment ? (
              <div className="space-y-6">
                {/* 1. Proposed Realignment Request Sandbox at the Top */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      Active Realignment Proposal
                    </h4>
                    <div className="flex items-center gap-2">
                      {/* Relocated Edit Budget Controls */}
                      {!editMode &&
                        isCurrentYear &&
                        ['Draft', 'Proposed', 'Returned'].includes(lib.status) && (
                          <Button
                            onClick={onEditClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-7 text-[10px] font-bold shadow-xs transition-all rounded-lg px-2.5"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Budget
                          </Button>
                        )}
                      {editMode && (
                        <Button
                          onClick={onDoneClick}
                          className="bg-blue-650 hover:bg-blue-700 text-white gap-1.5 h-7 text-[10px] font-bold shadow-xs transition-all rounded-lg px-2.5"
                        >
                          <X className="w-3 h-3" /> Done Editing
                        </Button>
                      )}

                      <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-0.5 select-none">
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-650"></span>
                        </span>
                        <span className="text-[9px] text-indigo-700 font-extrabold uppercase tracking-wider">
                          Active Realignment Draft
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-indigo-200 rounded-xl bg-gradient-to-r from-indigo-50/[0.04] to-violet-50/[0.02] overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-300">
                    <div
                      className="p-4 flex items-center justify-between bg-indigo-50/20 cursor-pointer border-b border-indigo-100 hover:bg-indigo-55/[0.06] transition-all"
                      onClick={() => setIsAmendmentExpanded(!isAmendmentExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        {isAmendmentExpanded ? (
                          <ChevronUp className="w-4 h-4 text-indigo-655" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-indigo-655" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-indigo-950">
                              Proposed Realignment Request
                            </span>
                            <Badge
                              className={
                                activeAmendment.status === 'Draft'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-55 text-[10px] font-bold px-2 py-0.5'
                                  : activeAmendment.status === 'Returned'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 text-[10px] font-bold px-2 py-0.5'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-50 text-[10px] font-bold px-2 py-0.5'
                              }
                            >
                              {activeAmendment.status}
                            </Badge>
                          </div>
                          {activeAmendment.justification && (
                            <p className="text-[11px] text-slate-600 mt-1 italic font-medium">
                              Justification: &ldquo;{activeAmendment.justification}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAmendmentExpanded && (
                      <div className="p-5 bg-white border-t border-indigo-50">
                        <AmendmentEditPanel
                          amendment={activeAmendment}
                          originalLib={lib}
                          approvedActivities={approvedActivities}
                          approvedProjectGroups={approvedProjectGroups}
                        />
                      </div>
                    )}
                  </div>
                </div>
 
                {/* 2. Original Baseline Approved Reference at the Bottom (Collapsible, collapsed by default) */}
                {activeLib && activeLib.id && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div
                      className="p-4 flex items-center justify-between bg-slate-50 cursor-pointer hover:bg-slate-100/85 transition-all"
                      onClick={() => setIsBaselineExpanded(!isBaselineExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        {isBaselineExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                        <div>
                          <span className="font-bold text-xs text-slate-700">
                            Baseline Approved Reference (Read-Only)
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            Click to expand and view original approved budget allocation reference.
                          </p>
                        </div>
                      </div>
                    </div>
                    {isBaselineExpanded && (
                      <div className="p-5 bg-slate-50/10 border-t border-slate-205">
                        {lib.scope === 'Project' ? (
                          <DraftAmendmentProjectView
                            draftLibId={activeLib.id}
                            draftLib={activeLib}
                            approvedProjectGroups={approvedProjectGroups}
                            readOnly={true}
                          />
                        ) : (
                          <DraftAmendmentActivityView
                            draftLibId={activeLib.id}
                            draftLib={activeLib}
                            approvedActivities={approvedActivities}
                            opcrData={activeOpcrData}
                            wfpData={activeWfpData}
                            readOnly={true}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Fallback Layout: No active amendment request - show baseline reference directly
              activeLib &&
              activeLib.id && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Original Approved Budget Reference
                    </h4>
                    {/* Realign Budget button shown on baseline reference */}
                    {lib.status === 'Approved' && !activeAmendment && !editMode && isCurrentYear && (
                      <Button
                        onClick={onSubmitClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-7 text-[10px] font-bold shadow-xs transition-all rounded-lg px-3"
                      >
                        <FileText className="w-3 h-3" /> Realign Budget
                      </Button>
                    )}
                  </div>
                  {lib.scope === 'Project' ? (
                    <DraftAmendmentProjectView
                      draftLibId={activeLib.id}
                      draftLib={activeLib}
                      approvedProjectGroups={approvedProjectGroups}
                      readOnly={true}
                    />
                  ) : (
                    <DraftAmendmentActivityView
                      draftLibId={activeLib.id}
                      draftLib={activeLib}
                      approvedActivities={approvedActivities}
                      opcrData={activeOpcrData}
                      wfpData={activeWfpData}
                      readOnly={true}
                    />
                  )}
                </div>
              )
            )}
          </div>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  )
}
