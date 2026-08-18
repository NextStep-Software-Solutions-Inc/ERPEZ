import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WFPProcessFlowStepperProps {
  mode: 'OPCR' | 'External' | string
  opcrTitle?: string
  activityCount?: number
  timelineCount?: number
  expenditureCount?: number
  wfpId: string
  onGenerateDoc?: (format: 'Pdf' | 'Excel') => void
  isGenerating?: boolean
}

export const WFPProcessFlowStepper: React.FC<WFPProcessFlowStepperProps> = ({
  mode,
  activityCount = 0,
  timelineCount = 0,
  expenditureCount = 0,
  onGenerateDoc,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isOPCRMode = mode === 'OPCR'

  // Dynamic workflow completion evaluation
  const hasActivities = activityCount > 0
  const hasTimelines = timelineCount > 0
  const hasExpenditures = expenditureCount > 0
  const isWorkflowComplete = hasActivities && hasTimelines && hasExpenditures

  const steps = [
    {
      id: 1,
      title: 'Activity Binding',
      subtitle: isOPCRMode ? 'Linked from OPCR' : 'Standalone Objectives',
      badgeText: hasActivities ? `✓ ${activityCount} Activities Linked` : `⚠ 0 Activities Linked`,
      completed: hasActivities,
      icon: Target,
      accentBg: hasActivities ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 2,
      title: 'Quarterly Timelines',
      subtitle: 'Q1–Q4 % Distribution',
      badgeText: hasTimelines ? `✓ ${timelineCount} Timelines` : `⚠ ${timelineCount} Configured`,
      completed: hasTimelines,
      icon: Calendar,
      accentBg: hasTimelines ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 3,
      title: 'PPMP Expenditures',
      subtitle: 'Manual Budget Items',
      badgeText: hasExpenditures ? `✓ ${expenditureCount} PPMP Items` : `⚠ 0 PPMP Items`,
      completed: hasExpenditures,
      icon: DollarSign,
      accentBg: hasExpenditures ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 4,
      title: 'Document Generation',
      subtitle: 'PDF / Excel Output',
      badgeText: isWorkflowComplete ? '✓ Ready to Generate' : '🔒 Pending Setup',
      completed: isWorkflowComplete,
      icon: FileText,
      accentBg: isWorkflowComplete ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200',
    },
  ]

  const handleCTAClick = () => {
    if (isWorkflowComplete) {
      if (onGenerateDoc) onGenerateDoc('Pdf')
      return
    }

    // Deterministic scroll / navigation to next uncompleted step
    if (!hasActivities) {
      const el = document.getElementById('objectives-registry-section')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else if (!hasTimelines) {
      const el = document.getElementById('objectives-registry-section')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else if (!hasExpenditures) {
      const el = document.getElementById('objectives-registry-section')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Card className="mb-3.5 overflow-hidden border border-slate-200/80 bg-white shadow-xs hover:shadow-sm transition-all duration-300">
      <CardContent className="p-3.5 sm:p-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand workflow steps' : 'Collapse workflow steps'}
              className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                WFP Workflow & Document Pipeline
              </h2>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCTAClick}
              className={`h-7 px-3 text-xs font-semibold gap-1.5 shadow-2xs ${
                isWorkflowComplete
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isWorkflowComplete ? (
                <>
                  <FileText className="w-3.5 h-3.5" /> Generate Documents
                </>
              ) : (
                <>
                  Continue Setup <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Collapsible Process Flow Stepper Grid */}
        {!isCollapsed && (
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-100 overflow-x-auto pb-1 sm:pb-0">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className="min-w-[220px] sm:min-w-0 flex-1 relative group p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:border-indigo-300 hover:bg-white transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Step 0{step.id}
                      </span>
                      <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 ${step.accentBg}`}>
                        {step.badgeText}
                      </Badge>
                    </div>

                    <div className="flex items-start gap-1.5 mb-1">
                      <div className="p-1 rounded bg-white border border-slate-200/80 text-indigo-600 mt-0.5 shadow-2xs">
                        <Icon className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      {step.completed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-700 font-semibold">Configured</span>
                        </>
                      ) : idx === 3 ? (
                        <>
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">Locked</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-700 font-semibold">Needs setup</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
