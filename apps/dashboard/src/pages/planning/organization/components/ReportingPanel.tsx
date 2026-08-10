import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCog, Users, ChevronRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ReportingChainFilter } from '@/components/features/planning/organizational-structure/components/ReportingChainFilter'
import ManualOverrideDialog from './ManualOverrideDialog'
import type { OrgUnit } from '@/services/mock/orgUnits'

interface ReportingPanelProps {
  units?: OrgUnit[]
  unitId?: string | null
  selectedReportingChainOfficeId: string | null
  onSelectReportingChainOffice: (id: string | null) => void
  isManualOverrideEnabled: boolean
  onManualOverrideChange: (newState: boolean) => void
  onOpenPMTDialog: () => void
}

export default function ReportingPanel({
  units = [],
  unitId,
  selectedReportingChainOfficeId,
  onSelectReportingChainOffice,
  isManualOverrideEnabled,
  onManualOverrideChange,
  onOpenPMTDialog,
}: ReportingPanelProps) {
  const [manualOverrideConfirmOpen, setManualOverrideConfirmOpen] = useState(false)
  const [pendingOverrideState, setPendingOverrideState] = useState(false)

  const selectedReportingChainOffice = selectedReportingChainOfficeId
    ? units.find((u) => u.id === selectedReportingChainOfficeId)
    : null


  const handleManualOverrideToggle = (newState: boolean) => {
    setPendingOverrideState(newState)
    setManualOverrideConfirmOpen(true)
  }

  const confirmManualOverride = (confirmedState: boolean) => {
    onManualOverrideChange(confirmedState)
    setManualOverrideConfirmOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-default-200 bg-card overflow-hidden">
        <CardHeader className="bg-default-50/50 border-b py-4">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-default-500 flex items-center gap-2">
            <UserCog className="h-4 w-4 text-primary" /> Filter by Office
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ReportingChainFilter
            offices={units}
            selectedOfficeId={selectedReportingChainOfficeId}
            onSelectOffice={onSelectReportingChainOffice}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-default-200 bg-card overflow-hidden">
        <CardHeader className="bg-default-50/50 border-b py-4">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-default-500 flex items-center gap-2">
            <UserCog className="h-4 w-4 text-primary" /> SPMS Reporting Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div className="bg-default-50/50 p-5 rounded-lg space-y-5 border border-default-200">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-default-400 uppercase tracking-wider">Reporting Context</span>
              <span className="text-sm font-semibold text-default-900 leading-tight">
                {selectedReportingChainOffice
                  ? selectedReportingChainOffice.name
                  : unitId
                    ? units?.find((u) => u.id === unitId)?.name
                    : 'CLUSTERING NOT DEFINED'}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold text-default-400">
                <span className="bg-card px-1.5 py-0.5 rounded border border-default-200 shadow-sm">
                  UACS: {selectedReportingChainOffice?.uacsCode || units?.find((u) => u.id === unitId)?.uacsCode || 'PENDING'}
                </span>
              </div>
            </div>

            <div className="relative py-1 flex flex-col gap-4">
              <div className="bg-card p-4 rounded-lg border border-default-200 shadow-sm relative hover:border-primary/30 transition-all">
                <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ring-2 ring-card shadow-sm">
                  Level I Rater
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-default-900">Section / Division Chief</span>
                  {selectedReportingChainOffice && units ? (
                    <div className="text-[9px] text-default-600 bg-default-100/50 px-2 py-1.5 rounded border border-default-200 space-y-1">
                      <p className="font-medium text-default-700">
                        {selectedReportingChainOffice.parentId
                          ? units.find((u) => u.id === selectedReportingChainOffice.parentId)?.name || 'Parent Office'
                          : 'No parent office defined'}
                      </p>
                      <p className="text-[8px] text-default-500">Reports to parent organizational unit</p>
                    </div>
                  ) : (
                    <p className="text-[9px] font-medium text-default-400 uppercase">Rating Validation Only</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center -my-2.5 z-10">
                <div className="bg-primary/10 text-primary p-1 rounded-full border border-primary/20 shadow-sm">
                  <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border border-primary/20 shadow-sm relative hover:border-primary/50 transition-all">
                <div className="absolute -top-2.5 left-4 bg-success text-success-foreground text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ring-2 ring-card shadow-sm">
                  Level II Approver
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-default-900">Regional / Bureau Director</span>
                  {selectedReportingChainOffice && units ? (
                    <div className="space-y-1">
                      <p className="text-[9px] text-default-600 bg-default-100/50 px-2 py-1.5 rounded border border-default-200 font-medium">
                        {selectedReportingChainOffice.name}
                      </p>
                      {units.filter((u) => u.parentId === selectedReportingChainOfficeId).length > 0 && (
                        <details className="cursor-pointer">
                          <summary className="text-[9px] font-semibold text-primary hover:text-primary/80 uppercase tracking-wider cursor-pointer py-1">
                            Child Divisions ({units.filter((u) => u.parentId === selectedReportingChainOfficeId).length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {units
                              .filter((u) => u.parentId === selectedReportingChainOfficeId)
                              .map((child) => (
                                <div key={child.id} className="text-[9px] text-default-600 bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                  • {child.name}
                                </div>
                              ))}
                          </div>
                        </details>
                      )}
                      <p className="text-[8px] text-default-500">Final Calibration Approval</p>
                    </div>
                  ) : (
                    <p className="text-[9px] font-medium text-default-400 uppercase">Final Calibration Approval</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-default-600 tracking-tight">Manual Workflow Override</label>
                  <span className="text-[9px] text-default-400 font-medium">Admin Privileges Required</span>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={isManualOverrideEnabled}
                    onChange={(e) => handleManualOverrideToggle(e.currentTarget.checked)}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-1">
            <h4 className="text-[10px] font-semibold uppercase text-default-400 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Oversight Compliance
            </h4>
            <div className="p-4 border border-default-200 rounded-lg bg-default-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-card h-9 w-9 rounded-md flex items-center justify-center border border-default-200 shadow-sm">
                  <Users className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-default-700 uppercase tracking-tight">PMT Body</p>
                  <p className="text-[9px] text-default-400 font-medium uppercase tracking-wider leading-none mt-1">4 Seats Authorized</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[9px] font-semibold uppercase"
                onClick={onOpenPMTDialog}
              >
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ManualOverrideDialog
        open={manualOverrideConfirmOpen}
        onOpenChange={setManualOverrideConfirmOpen}
        pendingState={pendingOverrideState}
        onConfirm={confirmManualOverride}
      />

    </div>
  )
}
