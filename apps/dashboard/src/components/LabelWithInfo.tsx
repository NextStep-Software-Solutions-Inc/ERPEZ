import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface LabelWithInfoProps
  extends React.ComponentPropsWithoutRef<typeof Label> {
  label: string
  tooltip?: string
  required?: boolean
  className?: string
  infoClassName?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function LabelWithInfo({
  label,
  tooltip,
  required,
  className,
  infoClassName,
  side = 'right',
  ...props
}: LabelWithInfoProps) {
  return (
    <div className={cn('flex items-center gap-1.5 mb-2', className)}>
      <Label {...props} className="font-semibold cursor-help">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring rounded-full',
                  infoClassName,
                )}
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={side}
              align="center"
              className="max-w-[300px] text-xs"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
