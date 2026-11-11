import { useRouter } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'
import { Button } from './ui/button'
import type { ReactNode } from 'react'
import type { FileRoutesByTo } from '@/routeTree.gen'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  title?: string
  description?: string
  /** singular legacy prop */
  action?: ReactNode
  /** plural-friendly prop for passing multiple action elements */
  actions?: ReactNode
  children: ReactNode
  breadcrumbs?: ReactNode
  backTo?:
  | boolean
  | keyof FileRoutesByTo
  | { to: keyof FileRoutesByTo; search?: any; params?: any }
  backLabel?: string
  forTable?: boolean
  /** hide the default white header block */
  hideHeader?: boolean
}

export function PageContainer({
  title,
  description,
  action,
  actions,
  children,
  breadcrumbs,
  backTo,
  backLabel,
  forTable = false,
  hideHeader = false,
}: PageContainerProps) {
  const router = useRouter() 

  const actionNode = actions ?? action
  return (
    <div className={cn('p-2', forTable ? 'space-y-0' : 'space-y-6')}>
      {!hideHeader && (
        <div className="flex items-center justify-between bg-card text-card-foreground rounded-xl p-4 border border-border shadow-2xs transition-colors">
          <div className="min-w-0 flex-1">
            {breadcrumbs ? (
              <div className="mb-2.5">{breadcrumbs}</div>
            ) : backTo ? (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="mb-2.5 px-3 py-1.5 text-xs font-bold text-foreground border-border bg-background hover:bg-muted hover:text-foreground transition-all shadow-2xs gap-1.5 flex items-center cursor-pointer"
                  onClick={() => {
                    if (typeof backTo === 'string') {
                      router.navigate({ to: backTo }) 
                    } else if (typeof backTo === 'object') {
                      router.navigate(backTo as any)
                    } else {
                      router.navigate({ to: '..' })
                    }
                  }}
                >
                  <MoveLeft className="w-3.5 h-3.5 text-primary" />
                  {backLabel || 'Back to WFP'}
                </Button>
              </div>
            ) : null}
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground pt-1 font-normal">{description}</p>
            )}
          </div>
          {actionNode && <div>{actionNode}</div>}
        </div>
      )}
      <div className={cn(forTable ? 'px-0' : '')}>{children}</div>
    </div>
  )
}
