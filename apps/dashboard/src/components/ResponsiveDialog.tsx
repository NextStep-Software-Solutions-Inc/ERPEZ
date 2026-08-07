import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Hoisted constants to avoid re-creating on every render
export const RESPONSIVE_DIALOG_SIZE_MAP: Record<string, string> = {
  xs: 'sm:max-w-[320px]',
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[900px]',
  xl: 'sm:max-w-[1024px]',
  '2xl': 'sm:max-w-[1200px]',
  '3xl': 'sm:max-w-[1400px]',
  '4xl': 'sm:max-w-[1600px]',
  '5xl': 'sm:max-w-[1800px]',
  full: 'w-full max-w-none',
}

export const MAX_WIDTH_REGEX = /\b(?:(?:[^\s:]+:)?max-w-[^\s]+|w-full|max-w-none)\b/

interface ResponsiveDialogProps {
  open: boolean
  showCloseButton?: boolean
  onOpenChange?: (state: boolean) => void
  title: string
  description?: string
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
  overlayClass?: string
  onPointerDownOutside?: (event: Event) => void
  fitContent?: boolean // when true, dialog height will fit its content instead of using max-h and flex layout
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"
}
export function ResponsiveDialog({
  children,
  open,
  onOpenChange,
  title,
  description,
  trigger,
  showCloseButton = false,
  footer,
  className,
  overlayClass,
  onPointerDownOutside,
  fitContent = false,
  size,
}: ResponsiveDialogProps) {
  const sizeMap = RESPONSIVE_DIALOG_SIZE_MAP
  const defaultSizeClass = size ? sizeMap[size] ?? '' : RESPONSIVE_DIALOG_SIZE_MAP['md']

  // Detect whether caller provided any max-width-related class (including breakpoint prefixes)
  const hasMaxWidthClass = (cls?: string) => Boolean(cls && MAX_WIDTH_REGEX.test(cls))

  // Only apply the default size class when the caller did NOT provide any max-width class.
  const appliedSizeClass = hasMaxWidthClass(className) ? '' : defaultSizeClass

  // If fitContent is true, avoid forcing a flex column with a scrollable center.
  // This lets the dialog size naturally to its content (no large empty bottom space).
  // Allow non-portaled, absolutely-positioned overlays (e.g. Combobox dropdowns) to escape the dialog
  // by keeping the content container overflow-visible. Inner scrolling is still handled by the
  // inner "flex-1 overflow-y-auto" element.
  const contentBaseClass = fitContent
    ? 'overflow-visible'
    : 'max-h-[90vh] overflow-visible flex flex-col'

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        hiddenCloseIcon={!showCloseButton}
        size={size}
        overlayClass={overlayClass}
        className={cn(
          appliedSizeClass,
          contentBaseClass,
          className,
        )}
        onPointerDownOutside={onPointerDownOutside}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {fitContent ? (
          // natural height
          <div className="">{children}</div>
        ) : (
          // constrained height with scroll
          <div className={cn('flex-1 overflow-y-auto pr-4 scrollbar-hide')}>{children}</div>
        )}
        {footer && <div className="shrink-0">{footer}</div>}
      </DialogContent>
    </Dialog>
  )
}
