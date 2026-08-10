import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Size =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '7xl'
  | 'full'

interface ResponsiveDialogDashtailProps {
  open: boolean
  showCloseButton?: boolean
  onOpenChange?: (state: boolean) => void
  title: string
  description?: string
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: React.HTMLAttributes<HTMLDivElement>['className']
  size?: Size
  onPointerDownOutside?: (event: Event) => void
}

export function ResponsiveDialogDashtail({
  children,
  open,
  onOpenChange,
  title,
  description,
  trigger,
  footer,
  className,
  size = 'md',
  onPointerDownOutside,
}: ResponsiveDialogDashtailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        size={size}
        className={cn('max-h-[90vh] overflow-hidden flex flex-col', className)}
        onPointerDownOutside={onPointerDownOutside}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">{children}</div>

        {footer && <DialogFooter className="shrink-0">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
