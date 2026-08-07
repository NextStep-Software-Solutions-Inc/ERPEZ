import React, { useState } from 'react'
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  Calendar,
  DollarSign,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isOPCRMode = mode === 'OPCR'

  const steps = [
    {
      id: 1,
      title: 'Activity Binding',
      subtitle: isOPCRMode ? 'Linked from OPCR' : 'Standalone Objectives',
      badgeText: `${activityCount} Activities`,
      completed: activityCount > 0,
      icon: Target,
      accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 2,
      title: 'Quarterly Timelines',
      subtitle: 'Q1–Q4 % Distribution',
      badgeText: `${timelineCount} Timelines`,
      completed: timelineCount > 0,
      icon: Calendar,
      accentBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 3,
      title: 'PPMP Expenditures',
      subtitle: 'Manual Budget Items',
      badgeText: `${expenditureCount} PPMP Items`,
      completed: expenditureCount > 0,
      icon: DollarSign,
      accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 4,
      title: 'Document Generation',
      subtitle: 'PDF / Excel Output',
      badgeText: 'Ready to Render',
      completed: false,
      icon: FileText,
      accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ]

  return (
    <Card className="mb-3.5 overflow-hidden border border-slate-200/80 bg-white shadow-xs hover:shadow-sm transition-all duration-300">
      <CardContent className="p-3.5 sm:p-4">
        {/* Top Header Row with Metrics & Collapse Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
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

          {/* Metric Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px] px-2 py-0.5">
              {activityCount} Activities
            </Badge>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px] px-2 py-0.5">
              {timelineCount} Timelines
            </Badge>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] px-2 py-0.5">
              {expenditureCount} PPMP Items
            </Badge>
          </div>
        </div>

        {/* Collapsible Process Flow Stepper Grid */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-100">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className="relative group p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:border-indigo-300 hover:bg-white transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Desktop Flow Arrow */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}

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

                  <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[9px] text-slate-400 font-medium">
                    <span>{step.completed ? 'Complete' : 'Ready'}</span>
                    {step.completed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
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
