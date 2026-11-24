import React from 'react'
import {
  ListChecks,
  Target,
  Building2,
  ClipboardCheck,
  ChevronRight,
  Check,
  Home,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

export type AppStepId = 1 | 2 | 3 | 4

export interface AppWorkflowStepperProps {
  currentStep: AppStepId
  onStepClick: (step: AppStepId) => void
  selectedFY?: AppFiscalYear
  kpiCount?: number
  targetsCount?: number
  assignmentsCount?: number
  isLocked?: boolean
  maxAccessibleStep?: AppStepId
}

export interface StepDefinition {
  id: AppStepId
  number: number
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

export const APP_STEPS: StepDefinition[] = [
  {
    id: 1,
    number: 1,
    title: 'Active KPIs',
    subtitle: 'Activate & configure KPIs',
    icon: ListChecks,
  },
  {
    id: 2,
    number: 2,
    title: 'Target Setting',
    subtitle: 'Define agency base targets',
    icon: Target,
  },
  {
    id: 3,
    number: 3,
    title: 'Office Assignment',
    subtitle: 'Distribute targets to offices',
    icon: Building2,
  },
  {
    id: 4,
    number: 4,
    title: 'Review & Finalize',
    subtitle: 'Verify & commit assignments',
    icon: ClipboardCheck,
  },
]

export const AppWorkflowStepper: React.FC<AppWorkflowStepperProps> = ({
  currentStep,
  onStepClick,
  selectedFY,
  kpiCount = 0,
  targetsCount = 0,
  assignmentsCount = 0,
  isLocked = false,
  maxAccessibleStep = 4,
}) => {
  const currentStepDef = APP_STEPS.find((s) => s.id === currentStep) || APP_STEPS[0]

  return (
    <div className="space-y-4">
      {/* ── Breadcrumb Bar ── */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-muted-foreground flex-wrap gap-1.5">
        <div className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer" onClick={() => onStepClick(1)}>
          <Home className="w-3.5 h-3.5" />
          <span>Planning</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onStepClick(1)}>
          Annual Performance Planning
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="flex items-center gap-1 font-semibold text-primary">
          <Calendar className="w-3.5 h-3.5" />
          {selectedFY ? `FY ${selectedFY.year}` : 'Fiscal Year'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-bold">{currentStepDef.title}</span>
      </nav>

      {/* ── Workflow Stepper Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {APP_STEPS.map((step) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep
          const isClickable = step.id <= maxAccessibleStep || isCompleted

          let stepBadgeText = ''
          if (step.id === 1) {
            stepBadgeText = kpiCount > 0 ? `${kpiCount} Active KPIs` : 'No KPIs'
          } else if (step.id === 2) {
            stepBadgeText = targetsCount > 0 ? `${targetsCount} Targets Set` : 'Base Targets'
          } else if (step.id === 3) {
            stepBadgeText = assignmentsCount > 0 ? `${assignmentsCount} Offices` : 'Distribution'
          } else if (step.id === 4) {
            stepBadgeText = isLocked ? 'Locked' : 'Ready to Save'
          }

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (isClickable) {
                  onStepClick(step.id)
                }
              }}
              disabled={!isClickable}
              className={cn(
                'relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 outline-none',
                isCurrent &&
                  'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30 cursor-default',
                isCompleted &&
                  'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer',
                isUpcoming && isClickable &&
                  'bg-card border-border/70 hover:bg-accent/50 hover:border-border cursor-pointer',
                isUpcoming && !isClickable &&
                  'bg-muted/30 border-dashed border-border/50 opacity-60 cursor-not-allowed',
              )}
            >
              {/* Step Circle Indicator */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-colors',
                  isCurrent && 'bg-primary text-primary-foreground shadow',
                  isCompleted && 'bg-emerald-600 text-white',
                  isUpcoming && 'bg-muted text-muted-foreground border border-border',
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              {/* Step Texts */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Step {step.number}
                  </span>
                  {stepBadgeText && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 font-medium border-0',
                        isCurrent && 'bg-primary/10 text-primary',
                        isCompleted && 'bg-emerald-100 text-emerald-800',
                        isUpcoming && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {stepBadgeText}
                    </Badge>
                  )}
                </div>
                <div
                  className={cn(
                    'text-sm font-bold truncate',
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">{step.subtitle}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AppWorkflowStepper
