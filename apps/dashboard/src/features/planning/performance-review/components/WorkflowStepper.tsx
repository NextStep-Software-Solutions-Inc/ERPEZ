/**
 * Performance Review – Workflow Stepper
 * Visual progress indicator for the 5-step pipeline.
 */

import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Select OPCR', description: 'Choose period & unit' },
  { label: 'Self Rating', description: 'Ratee workspace' },
  { label: 'PMT Review', description: 'Finalization' },
  { label: 'Report', description: 'OPCR preview' },
  { label: 'Ranking', description: 'Leaderboard' },
]

interface WorkflowStepperProps {
  activeStep: number  // 0-indexed
  className?: string
}

export function WorkflowStepper({ activeStep, className }: WorkflowStepperProps) {
  return (
    <nav aria-label="Performance Review workflow steps" className={cn('w-full', className)}>
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeStep
          const isCurrent = index === activeStep
          const isUpcoming = index > activeStep

          return (
            <li key={step.label} className="flex flex-1 flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2',
                    isCompleted || isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                  style={{ width: 'calc(100% - 2rem)', right: '50%', left: '-50%' }}
                />
              )}

              {/* Step circle */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border-2',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 border-primary text-primary',
                  isUpcoming && 'bg-background border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>

              {/* Step label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium leading-tight',
                    isCurrent && 'text-primary',
                    isUpcoming && 'text-muted-foreground',
                    isCompleted && 'text-primary/70'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">{step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
