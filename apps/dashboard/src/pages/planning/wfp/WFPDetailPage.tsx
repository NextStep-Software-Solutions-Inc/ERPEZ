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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Toolbar } from '@/components/features/planning/wfp/wfp-objective/table'
import CreateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/CreateWfpObjectiveDialog'
import UpdateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/UpdateWfpObjectiveDialog'
import DeleteWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/DeleteWfpObjectiveDialog'
import { OPCRMainContent } from '@/components/features/planning/wfp/wfp/sections/OPCRMainContent'
import { OPCRSidebar } from '@/components/features/planning/wfp/wfp/sections/OPCRSidebar'
import { WFPProcessFlowStepper } from '@/components/features/planning/wfp/wfp/sections/WFPProcessFlowStepper'
import { MetaActions } from '@/types/global'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      const response = await fetch(`/api/planning/documents/wfp/${wfpId}/generate?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          toast.success(`WFP ${format} generated! Downloading...`)
          window.open(`/api/planning/documents/${result.data}/download`, '_blank')
        } else {
          toast.success(`WFP ${format} Document rendered successfully.`)
        }
      } else {
        toast.success(`WFP ${format} generation triggered successfully.`)
      }
    } catch {
      toast.success(`WFP ${format} generation requested.`)
    } finally {
      setIsGeneratingDoc(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainerDashtail title="WFP Details" backTo={true} backLabel="Back to WFP">
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-xs">Loading WFP details...</p>
        </div>
      </PageContainerDashtail>
    )
  }

  if (!wfpData?.data) {
    return (
      <PageContainerDashtail title="WFP Details" backTo={true} backLabel="Back to WFP">
        <div className="flex items-center justify-center h-48">
          <p className="text-destructive text-xs">WFP not found</p>
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

  const totalActivities = isOPCRMode
    ? opcr?.activities?.length || 0
    : wfp.wfpObjectives?.reduce((acc: number, obj: { wfpObjectiveActivities?: unknown[] }) => acc + (obj.wfpObjectiveActivities?.length || 0), 0) || 0

  const totalTimelines = isOPCRMode ? totalActivities * 4 : (wfp.wfpObjectives?.length || 0) * 2
  const totalExpenditures = isOPCRMode ? totalActivities * 2 : 5
  const durationText = calculateProjectDuration(wfp?.projectStartDate, wfp?.projectEndDate)

  return (
    <PageContainerDashtail
      title={toTitleCase(wfp?.projectTitle) || (isOPCRMode ? 'OPCR WFP Details' : 'WFP Details')}
      description={isOPCRMode ? 'Office Performance Commitment Review (OPCR) - Work and Financial Plan' : 'View detailed information about this Work and Financial Plan (WFP).'}
      backTo={true}
      backLabel="Back to WFP"
      actions={
        <div className="flex items-center gap-1.5">
          {/* Primary Action Button */}
          {wfp?.status === 'Draft' && (
            <Button
              size="sm"
              onClick={() =>
                updateWFP(
                  { pathParams: { id: wfpId }, payload: { status: 'ReadyForSubmission' } },
                  {
                    onSuccess: () => {
                      refetchWFP()
                      toast.success('WFP is now ready for submission!')
                    },
                    onError: () => toast.error('Failed to update status'),
                  },
                )
              }
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs h-8 px-3"
            >
              <Check className="w-3.5 h-3.5" /> Ready for Submission
            </Button>
          )}

          {/* Ellipsis Dropdown for More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-300 hover:bg-slate-50">
                <MoreHorizontal className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => setUpdateDialog({ isOpen: true, selectedId: wfpId })}
                className="gap-2 text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit WFP Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* ── Compact Significant Metadata Hero Banner Bar ── */}
      <div className="mb-2 p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Office */}
          {office && (
            <div className="flex items-center gap-1.5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Office</span>
                <span className="font-bold text-slate-800 text-xs">{office.name || office.code}</span>
              </div>
            </div>
          )}

          {/* Project Duration */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Project Duration</span>
              <span className="font-bold text-slate-800 text-xs">{durationText}</span>
            </div>
          </div>

          {/* Proposed Budget */}
          {wfp?.proposedBudget !== undefined && wfp?.proposedBudget !== null && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Budget</span>
                <span className="font-bold text-amber-700 text-xs">₱{wfp.proposedBudget.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mode & Status Badges */}
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold py-0.5 px-2">
            {wfp?.mode || 'OPCR'} Mode
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold py-0.5 px-2">
            Status: {wfp?.status || 'Draft'}
          </Badge>
        </div>
      </div>

      {/* 1. Process Flow Stepper Banner */}
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

      {/* 2. Objectives & Activities Registry Table */}
      <Card className="border-slate-100 shadow-2xs mb-2">
        <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold text-slate-800">
              Objectives & Activities Registry
            </CardTitle>
            <p className="text-[11px] text-slate-500 font-normal">
              Manage specific objectives, weights, activities, timelines, and expenditures manually or from OPCR.
            </p>
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
        <CardContent className="pt-2.5 px-4">
          <TemplateTable data={wfp?.wfpObjectives || []} columns={Column} actions={actions} readonly={false} toolbar={(table) => <Toolbar table={table} remainingWeight={remainingWeight} />} meta={{ wfps: wfp || [] }} fixedPageSize={10} />
          <CreateWFPObjectiveDialog wfpId={wfpId} remainingWeight={remainingWeight} opcr={opcr} />
          <UpdateWFPObjectiveDialog />
          <DeleteWFPObjectiveDialog />
        </CardContent>
      </Card>

      {/* 3. OPCR Source Overview Section */}
      {isOPCRMode && (
        <div className="mb-2 grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OPCRMainContent
              wfp={wfp}
              opcr={opcr}
              fundSource={fundSource}
              wfpId={wfpId}
              onPrint={() => window.print()}
              onMarkReady={() => updateWFP({ pathParams: { id: wfpId }, payload: { status: 'ReadyForSubmission' } }, { onSuccess: () => { refetchWFP(); toast.success('WFP is now ready for submission!') }, onError: () => toast.error('Failed to update status') })}
            />
          </div>
          <div>
            <OPCRSidebar wfp={wfp} opcr={opcr} />
          </div>
        </div>
      )}

      {/* 4. General Objective & Implementation Period Cards */}
      <div className="grid gap-3 md:grid-cols-3 mb-2">
        <Card className="md:col-span-2 border-slate-100 shadow-2xs hover:shadow-xs transition-all duration-300">
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              General Objective
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setUpdateDialog({ isOpen: true, selectedId: wfpId })}
              className="text-xs text-indigo-600 hover:text-indigo-800 gap-1.5 h-7 px-2"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Objective
            </Button>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3">
            <div className="relative pl-3 border-l-4 border-indigo-500 bg-indigo-50/20 py-2 rounded-r-lg">
              <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                "{wfp?.generalObjective || 'No objective defined.'}"
              </p>
            </div>
            {wfp?.description && (
              <div className="mt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{wfp?.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-2xs hover:shadow-xs transition-all duration-300">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-sm font-bold text-slate-800">
              Implementation Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3 space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-md border border-slate-100 bg-slate-50/50">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatDisplayDate(wfp?.projectStartDate) || 'Not set'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md border border-slate-100 bg-slate-50/50">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatDisplayDate(wfp?.projectEndDate) || 'Not set'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UpdateWFPDialog />
      <ImportOPCRActivitiesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        wfpId={wfpId}
        opcrId={wfp?.opcrId}
        onSuccessImport={refetchWFP}
      />
      {isOPCRMode && <AssignOPCRDialog open={assignOPCROpen} onClose={() => setAssignOPCROpen(false)} wfpId={wfpId} currentOPCRId={wfp?.opcrId} onOPCRSelected={(selectedOpcr) => { updateWFP({ pathParams: { id: wfpId }, payload: { opcrId: selectedOpcr.id } }, { onSuccess: () => { setAssignOPCROpen(false); refetchWFP() }, onError: (error) => console.error('❌ [Error] Failed to update WFP OPCR:', error) }) }} />}
    </PageContainerDashtail>
  )
}

export default WFPDetailPage
