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
  backTo,
  backLabel,
  forTable = false,
  hideHeader = false,
}: PageContainerProps) {
  const router = useRouter() 

  const actionNode = actions ?? action
  return (
    <div className={cn('p-2', forTable ? 'space-y-0' : 'space-y-8')}>
      {!hideHeader && (
        <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-100">
          <div>
            {backTo && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="mb-2 p-2 text-sm"
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
                  {backLabel ? (
                    <>
                      <MoveLeft /> {backLabel}
                    </>
                  ) : (
                    <>
                      <MoveLeft /> Back
                    </>
                  )}
                </Button>
              </div>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground pt-2">{description}</p>
            )}
          </div>
          {actionNode && <div>{actionNode}</div>}
        </div>
      )}
      <div className={cn(forTable ? 'px-0' : '')}>{children}</div>
    </div>
  )
}
