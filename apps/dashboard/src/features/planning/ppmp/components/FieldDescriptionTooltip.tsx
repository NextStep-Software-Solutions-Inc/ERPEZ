import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import type { PPMPFieldKey } from '../lib/ppmpFieldDescriptions'
import { getFieldDescription } from '../lib/ppmpFieldDescriptions'

interface FieldDescriptionTooltipProps {
  fieldKey: PPMPFieldKey
  className?: string
  showIcon?: boolean
}

/**
 * FieldDescriptionTooltip
 * Displays a help icon with tooltip containing field description, examples, and guidance
 * Keyboard accessible and screen-reader friendly with proper ARIA labeling
 */
export function FieldDescriptionTooltip({
  fieldKey,
  className = 'h-4 w-4',
  showIcon = true,
}: FieldDescriptionTooltipProps) {
  const fieldDesc = getFieldDescription(fieldKey)

  if (!fieldDesc || !showIcon) return null

  const ariaLabel = `Help: ${fieldDesc.label}`

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto w-auto p-0 hover:bg-transparent"
            aria-label={ariaLabel}
            tabIndex={0}
          >
            <HelpCircle
              className={`${className} text-default-400 hover:text-primary cursor-help transition-colors`}
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="z-999 max-w-sm bg-default-900 text-default-50 border-default-700 p-3"
        >
          <div className="space-y-2">
            <div>
              <p className="text-xs font-bold text-primary mb-1">
                {fieldDesc.label}
              </p>
              <p className="text-xs leading-relaxed text-default-100">
                {fieldDesc.description}
              </p>
            </div>
            {fieldDesc.examples && (
              <div className="border-t border-default-700 pt-2">
                <p className="text-[10px] font-semibold text-default-300 mb-0.5">
                  Examples:
                </p>
                <p className="text-[10px] text-default-300 italic">
                  {fieldDesc.examples}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
