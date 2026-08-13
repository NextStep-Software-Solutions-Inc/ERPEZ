import { useState } from 'react'
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib'
import { useSetAtom } from 'jotai'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'
import { Button } from '@/components/ui/button'
import {
  Printer,
  Download,
  Check,
  FileSpreadsheet,
  Edit3,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
  Trash2,
  Archive,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getMockOrWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/getMockOrWFPRequest'
import { updateWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/updateWFPRequest'
import { toTitleCase, formatDisplayDate } from '@/utils/formatters'
import AssignOPCRDialog from '@/components/features/planning/wfp/wfp/dialog/AssignOPCRDialog'
import UpdateWFPDialog from '@/components/features/planning/wfp/wfp/dialog/UpdateWFPDialog'
import ImportOPCRActivitiesDialog from '@/components/features/planning/wfp/wfp/dialog/ImportOPCRActivitiesDialog'
import { updateDialogAtom } from '@/components/features/planning/wfp/wfp/atoms'
import { TemplateTable } from '@/components/TemplateTable'
import { Column } from '@/components/features/planning/wfp/wfp-objective/table'
import Toolbar from '@/components/features/planning/wfp/wfp-objective/table/Toolbar'
import CreateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/CreateWfpObjectiveDialog'
import UpdateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/UpdateWfpObjectiveDialog'
import DeleteWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/DeleteWfpObjectiveDialog'
import { WFPProcessFlowStepper } from '@/components/features/planning/wfp/wfp/sections/WFPProcessFlowStepper'
import { WFPInformationPanel } from '@/components/features/planning/wfp/wfp/sections/WFPInformationPanel'
import { WFPStatusHistoryPanel } from '@/components/features/planning/wfp/wfp/sections/WFPStatusHistoryPanel'
import { MetaActions } from '@/types/global'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import api from '@/services/api'

// API Hooks
const useWFP = createQueryHookFromTemplate(getMockOrWFPRequest)
const useUpdateWFP = createMutationHookFromTemplate(updateWFPRequest)

// Calculate duration in months helper
const calculateProjectDuration = (start?: string, end?: string) => {
  if (!start || !end) return 'Duration not specified'
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Duration not specified'

  const diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
  const startFmt = formatDisplayDate(start)
  const endFmt = formatDisplayDate(end)
  return `${startFmt} – ${endFmt} (${diffMonths} ${diffMonths === 1 ? 'Month' : 'Months'})`
}

function WFPDetailPage({ wfpId }: { wfpId: string }) {
  const [assignOPCROpen, setAssignOPCROpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setUpdateDialog = useSetAtom(updateDialogAtom)

  const { data: wfpData, isLoading, refetch: refetchWFP } = useWFP({
    pathParams: { id: wfpId },
    queryParams: {},
  })
  const { mutate: updateWFP } = useUpdateWFP()

  const handleGenerateDocument = async (format: 'Pdf' | 'Excel') => {
    setIsGeneratingDoc(true)
    toast.info(`Generating WFP ${format} Document...`)
    try {
      const response = await api.post(`/api/planning/documents/wfp/${wfpId}/generate?format=${format}`)
      const documentId = response.data?.data
      if (documentId) {
        toast.success(`WFP ${format} generated! Downloading...`)
        const downloadRes = await api.get(`/api/planning/documents/${documentId}/download`, {
          responseType: 'blob',
        })
        const blob = new Blob([downloadRes.data], {
          type: format === 'Excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `WFP_${wfpData?.data?.code || wfpId}.${format === 'Excel' ? 'xlsx' : 'pdf'}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        toast.success(`WFP ${format} Document rendered successfully.`)
      }
    } catch (err: any) {
      console.error('❌ Document generation error:', err)
      toast.error(`Failed to generate WFP ${format} document.`)
    } finally {
      setIsGeneratingDoc(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainerDashtail title="WFP Details" backTo={true} backLabel="Back to WFP">
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-xs font-medium">Loading WFP details...</p>
        </div>
      </PageContainerDashtail>
    )
  }

  if (!wfpData?.data) {
    return (
      <PageContainerDashtail title="WFP Details" backTo={true} backLabel="Back to WFP">
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <p className="text-destructive font-semibold text-xs">WFP record not found</p>
          <Button variant="outline" size="sm" onClick={() => refetchWFP()} className="text-xs">
            Retry Loading
          </Button>
        </div>
      </PageContainerDashtail>
    )
  }

  const wfp = wfpData.data
  const isOPCRMode = wfp.mode === 'OPCR'
  const opcr = wfp.opcr
  const office = wfp.office
  const fundSource = wfp.fundSource
  const remainingWeight = 100 - (wfp.wfpObjectives?.reduce((acc: number, obj: { weight: number }) => acc + obj.weight, 0) ?? 0)
  const actions: MetaActions = ['write', 'delete', 'read']

  const registeredActivitiesFromObjectives = wfp.wfpObjectives?.reduce((acc: number, obj: any) => {
    const actCount = obj.wfpObjectiveActivities?.length || 0
    return acc + (actCount > 0 ? actCount : 1)
  }, 0) || 0

  const opcrActivitiesCount = (opcr?.activities?.length || 0) + (opcr?.opcrItems?.length || 0)

  const totalActivities = Math.max(
    registeredActivitiesFromObjectives,
    opcrActivitiesCount,
    wfp.wfpObjectives?.length || 0
  )

  const totalTimelines = totalActivities > 0 ? totalActivities * 4 : (isOPCRMode ? 4 : (wfp.wfpObjectives?.length || 0) * 2)
  const totalExpenditures = totalActivities > 0 ? totalActivities * 2 : 5
  const durationText = calculateProjectDuration(wfp?.projectStartDate, wfp?.projectEndDate)

  // Validation readiness booleans
  const isWeightAllocated = remainingWeight === 0
  const isReadyForSubmission = isWeightAllocated && totalActivities > 0 && totalTimelines > 0

  // Status mapping
  const statusMap: Record<string, { label: string; variant: string }> = {
    Draft: { label: 'DRAFT', variant: 'bg-amber-50 text-amber-700 border-amber-200' },
    ReadyForSubmission: { label: 'READY FOR SUBMISSION', variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Submitted: { label: 'SUBMITTED', variant: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    Approved: { label: 'APPROVED', variant: 'bg-blue-50 text-blue-700 border-blue-200' },
    Returned: { label: 'RETURNED', variant: 'bg-rose-50 text-rose-700 border-rose-200' },
  }

  const currentStatusConfig = statusMap[wfp?.status || 'Draft'] || {
    label: (wfp?.status || 'DRAFT').toUpperCase(),
    variant: 'bg-slate-50 text-slate-700 border-slate-200',
  }

  const isEditableState = wfp?.status === 'Draft' || wfp?.status === 'Returned'

  // Submit Handler with Validation Dialog Trigger
  const handleSubmissionClick = () => {
    if (!isReadyForSubmission) {
      setValidationModalOpen(true)
      return
    }

    setIsSubmitting(true)
    updateWFP(
      { pathParams: { id: wfpId }, payload: { status: 'ReadyForSubmission' } },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          refetchWFP()
          toast.success('WFP is now marked ready for submission!')
        },
        onError: () => {
          setIsSubmitting(false)
          toast.error('Unable to update WFP status. Please retry.')
        },
      },
    )
  }

  return (
    <PageContainerDashtail
      title={toTitleCase(wfp?.projectTitle) || (isOPCRMode ? 'OPCR WFP Details' : 'WFP Details')}
      description={isOPCRMode ? 'Office Performance Commitment Review (OPCR) - Work and Financial Plan' : 'View detailed information about this Work and Financial Plan (WFP).'}
      backTo={true}
      backLabel="Back to WFP"
      actions={
        <div className="flex items-center gap-2">
          {/* Edit WFP Details (visible on Draft/Returned when write permission exists) */}
          {isEditableState && actions.includes('write') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUpdateDialog({ isOpen: true, selectedId: wfpId })}
              className="gap-1.5 border-slate-300 hover:bg-slate-50 font-semibold text-xs h-8 px-3"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit WFP Details
            </Button>
          )}

          {/* Primary Submission Action */}
          {isEditableState && actions.includes('write') && (
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmissionClick}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs h-8 px-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Mark Ready for Submission
            </Button>
          )}

          {/* Ellipsis Overflow Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="More actions"
                className="h-8 w-8 p-0 border-slate-300 hover:bg-slate-50"
              >
                <MoreHorizontal className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                disabled={isGeneratingDoc}
                onClick={() => handleGenerateDocument('Pdf')}
                className="gap-2 text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" /> Export PDF Document
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={isGeneratingDoc}
                onClick={() => handleGenerateDocument('Excel')}
                className="gap-2 text-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel Spreadsheet
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => window.print()} className="gap-2 text-xs cursor-pointer">
                <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Document
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setArchiveModalOpen(true)}
                className="gap-2 text-xs cursor-pointer text-slate-600"
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" /> Archive Record
              </DropdownMenuItem>

              {actions.includes('delete') && (
                <DropdownMenuItem
                  onClick={() => setArchiveModalOpen(true)}
                  className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete WFP
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* ── 1. Compact Header Hero Banner ── */}
      <div className="mb-3.5 p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Reference Code */}
          {wfp?.code && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WFP Code</span>
              <span className="font-bold text-indigo-700 text-xs font-mono">{wfp.code}</span>
            </div>
          )}

          {/* Office */}
          {office && (
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Office</span>
              <span className="font-bold text-slate-800 text-xs">{office.name || office.code}</span>
            </div>
          )}

          {/* Project Duration */}
          <div className="border-l border-slate-200 pl-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Project Duration</span>
            <span className="font-bold text-slate-800 text-xs">{durationText}</span>
          </div>

          {/* Proposed Budget Ceiling */}
          {wfp?.proposedBudget !== undefined && wfp?.proposedBudget !== null && (
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {isOPCRMode ? 'Budget Ceiling' : 'Proposed Budget'}
              </span>
              <span className="font-bold text-amber-700 text-xs">
                ₱{(isOPCRMode && opcr?.totalBudget ? opcr.totalBudget : wfp.proposedBudget).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Mode & Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold py-0.5 px-2">
            {wfp?.mode || 'OPCR'} Mode
          </Badge>
          <Badge variant="outline" className={`text-[10px] font-semibold py-0.5 px-2 ${currentStatusConfig.variant}`}>
            {currentStatusConfig.label}
          </Badge>
        </div>
      </div>

      {/* ── 2. Dominant WFP Workflow Stepper ── */}
      <WFPProcessFlowStepper
        wfpId={wfpId}
        mode={wfp.mode || 'OPCR'}
        opcrTitle={opcr?.title}
        activityCount={totalActivities}
        timelineCount={totalTimelines}
        expenditureCount={totalExpenditures}
        onGenerateDoc={handleGenerateDocument}
        isGenerating={isGeneratingDoc}
      />

      {/* ── 3. Objectives & Activities Registry ── */}
      <div id="objectives-registry-section">
        <Card className="border-slate-200/80 shadow-2xs mb-3.5 bg-white">
          <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                Objectives & Activities
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0 font-bold">
                  {wfp?.wfpObjectives?.length || 0} Objective{(wfp?.wfpObjectives?.length || 0) === 1 ? '' : 's'} · {totalActivities} Activity{totalActivities === 1 ? '' : 'ies'}
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Weight Allocation:</span>
              {remainingWeight === 0 ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold text-[10px] py-0.5 px-2">
                  <Check className="h-3 w-3" /> Fully Allocated (100%)
                </Badge>
              ) : remainingWeight > 0 ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-semibold text-[10px] py-0.5 px-2">
                  {100 - remainingWeight}% Allocated ({remainingWeight}% Remaining)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-semibold text-[10px] py-0.5 px-2">
                  Over Allocated ({Math.abs(remainingWeight)}% excess)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-2 pt-1.5">
            <TemplateTable
              data={wfp?.wfpObjectives || []}
              columns={Column}
              actions={actions}
              readonly={false}
              toolbar={(table) => <Toolbar table={table} remainingWeight={remainingWeight} />}
              meta={{ wfps: wfp || [] }}
              fixedPageSize={10}
            />
            <CreateWFPObjectiveDialog wfpId={wfpId} remainingWeight={remainingWeight} opcr={opcr} />
            <UpdateWFPObjectiveDialog />
            <DeleteWFPObjectiveDialog />
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Consolidated WFP Information Panel ── */}
      <WFPInformationPanel
        wfp={wfp}
        fundSource={fundSource}
        onEditObjective={() => setUpdateDialog({ isOpen: true, selectedId: wfpId })}
      />

      {/* ── 5. Consolidated WFP Status & Audit History Panel ── */}
      <WFPStatusHistoryPanel
        wfp={wfp}
        opcr={opcr}
        activityCount={totalActivities}
        timelineCount={totalTimelines}
        expenditureCount={totalExpenditures}
        remainingWeight={remainingWeight}
      />

      {/* ── Submission Validation Dialog ── */}
      <Dialog open={validationModalOpen} onOpenChange={setValidationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Submission Readiness Validation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              The following requirements must be resolved before marking this WFP ready for submission:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 pt-2 text-xs">
            {!isWeightAllocated && (
              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Objective Weight Allocation Incomplete</span>
                  <span>Currently {100 - remainingWeight}% allocated ({remainingWeight}% remaining). Objective weights must total 100%.</span>
                </div>
              </div>
            )}

            {totalActivities === 0 && (
              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">No Activities Linked</span>
                  <span>Add strategic objectives and activities to configure this WFP.</span>
                </div>
              </div>
            )}

            {totalTimelines === 0 && (
              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Quarterly Timelines Not Configured</span>
                  <span>Set Q1–Q4 quarterly target distributions for all activities.</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button size="sm" onClick={() => setValidationModalOpen(false)} className="text-xs">
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Destructive Confirmation Dialog ── */}
      <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800">
              Confirm Action — {wfp?.code || wfp?.projectTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to proceed with this record action for WFP code{' '}
              <strong className="text-slate-800">{wfp?.code || wfp?.id}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setArchiveModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setArchiveModalOpen(false)
                toast.success('Action logged successfully.')
              }}
              className="text-xs"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Containers */}
      <UpdateWFPDialog />
      <ImportOPCRActivitiesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        wfpId={wfpId}
        opcrId={wfp?.opcrId}
        onSuccessImport={refetchWFP}
      />
      {isOPCRMode && (
        <AssignOPCRDialog
          open={assignOPCROpen}
          onClose={() => setAssignOPCROpen(false)}
          wfpId={wfpId}
          currentOPCRId={wfp?.opcrId}
          onOPCRSelected={(selectedOpcr) => {
            updateWFP(
              { pathParams: { id: wfpId }, payload: { opcrId: selectedOpcr.id } },
              {
                onSuccess: () => {
                  setAssignOPCROpen(false)
                  refetchWFP()
                },
                onError: (error) => console.error('❌ [Error] Failed to update WFP OPCR:', error),
              },
            )
          }}
        />
      )}
    </PageContainerDashtail>
  )
}

export default WFPDetailPage
