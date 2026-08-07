import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: 'default' | 'underline' | 'bordered' | 'soft' | 'rounded'
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default:
      'inline-flex h-10 items-center justify-center rounded-md bg-default-200 p-1 text-muted-foreground',
    underline:
      'inline-flex items-center justify-center bg-transparent p-0 border-b-2 border-border rounded-none h-auto',
    bordered:
      'inline-flex items-center justify-center rounded-lg border border-border bg-background p-1 text-muted-foreground',
    soft: 'inline-flex items-center justify-center rounded-lg bg-secondary/50 p-1 text-muted-foreground backdrop-blur-sm',
    rounded:
      'inline-flex items-center justify-center rounded-full bg-default-200 p-1 text-muted-foreground',
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: 'default' | 'underline' | 'bordered' | 'soft' | 'rounded'
  showIcon?: boolean
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = 'default', showIcon, ...props }, ref) => {
  const variantClasses = {
    default:
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 h-full text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    underline:
      'inline-flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 relative rounded-none h-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:text-foreground after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300 after:ease-out',
    bordered:
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-secondary/50',
    soft: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-secondary/70',
    rounded:
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:scale-105 transform-gpu',
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  animated?: boolean
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, animated = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      animated && 'animate-in fade-in duration-200',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsListProps, TabsTriggerProps, TabsContentProps }
