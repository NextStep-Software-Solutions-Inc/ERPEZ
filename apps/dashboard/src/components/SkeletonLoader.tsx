import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonTableRowProps {
  columns?: number
  className?: string
}

interface PageSkeletonProps {
  className?: string
}

/**
 * Utility function to get a random number between 1 and max
 */
function getRandomCount(max: number): number {
  return Math.floor(Math.random() * max) + 1
}

/**
 * Skeleton loader for a single table row
 */
export function SkeletonTableRow({
  columns = 5,
  className,
}: SkeletonTableRowProps) {
  return (
    <div className={cn('flex gap-4 py-3 px-4 border-b', className)}>
      <Skeleton className="h-5 w-5 rounded" />
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1 rounded" />
      ))}
      <Skeleton className="h-4 w-12 rounded" />
    </div>
  )
}

/**
 * Skeleton loader for table header
 */
export function SkeletonTableHeader({
  columns = 5,
  className,
}: SkeletonTableRowProps) {
  return (
    <div className={cn('flex gap-4 py-3 px-4 border-b bg-muted/50', className)}>
      <Skeleton className="h-4 w-5 rounded" />
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-20 rounded" />
      ))}
      <Skeleton className="h-4 w-12 rounded" />
    </div>
  )
}

/**
 * Skeleton loader for entire table
 */
export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  // Generate random number once for columns and reuse for header and all rows
  const randomColumns = getRandomCount(columns)
  const randomRows = getRandomCount(rows)

  return (
    <div className={cn('overflow-hidden mt-5', className)}>
      <div className="flex flex-row justify-between gap-4 items-center mb-4">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-45 rounded-md" />
          <Skeleton className="h-8 w-15 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="border rounded-lg">
        <SkeletonTableHeader columns={randomColumns} />
        {Array.from({ length: randomRows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={randomColumns} />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton loader for toolbar with action buttons
 */
export function SkeletonTableToolbar({
  buttons = 3,
  className,
}: { buttons?: number } & PageSkeletonProps) {
  const randomButtons = getRandomCount(buttons)
  return (
    <div className={cn('flex gap-2 mb-4 items-center', className)}>
      <Skeleton className="h-10 flex-1 rounded-md" />
      {Array.from({ length: randomButtons }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-md" />
      ))}
    </div>
  )
}

/**
 * Skeleton loader for search/filter bar
 */
export function SkeletonSearchBar({ className }: PageSkeletonProps) {
  return (
    <div className={cn('flex gap-2 mb-4', className)}>
      <Skeleton className="h-10 flex-1 rounded-md" />
      <Skeleton className="h-10 w-20 rounded-md" />
    </div>
  )
}

/**
 * Skeleton loader for page header with title and button
 */
export function SkeletonPageHeader({ className }: PageSkeletonProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for tabbed navigation
 */
export function SkeletonTabNavigation({
  tabs = 3,
  className,
}: { tabs?: number } & PageSkeletonProps) {
  return (
    <div className={cn('flex gap-4 border-b mb-4', className)}>
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-40 rounded-t-md" />
      ))}
    </div>
  )
}

/**
 * Skeleton loader for a details view/card
 */
export function SkeletonDetailsCard({ className }: PageSkeletonProps) {
  return (
    <div className={cn('border rounded-lg p-6 space-y-4', className)}>
      <Skeleton className="h-6 w-1/3 rounded" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-5 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ========== PAGE SKELETONS ==========
 * Complete page skeleton loaders for different layouts
 */

/**
 * Skeleton for a simple page with table
 * Layout: Header -> Search/Filter -> Table
 */
export function SkeletonPageWithTable({ className }: PageSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <SkeletonPageHeader />
      <SkeletonSearchBar />
      <SkeletonTable rows={5} columns={5} />
    </div>
  )
}

/**
 * Skeleton for a tabbed page with table
 * Layout: Header -> Tabs -> Toolbar -> Search/Filter -> Table
 */
export function SkeletonTabbedPageWithTable({
  tabs = 3,
  className,
}: { tabs?: number } & PageSkeletonProps) {
  return (
    <div className={cn('space-y-6 mt-6', className)}>
      <SkeletonPageHeader />
      <SkeletonTabNavigation tabs={tabs} />
      <SkeletonTableToolbar buttons={3} />
      <SkeletonSearchBar />
      <SkeletonTable rows={5} columns={5} />
    </div>
  )
}

/**
 * Skeleton for a page with details view
 * Layout: Header -> Details Card + Sidebar (optional)
 */
export function SkeletonPageWithDetails({ className }: PageSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonDetailsCard />
        </div>
        <div className="space-y-4">
          <SkeletonDetailsCard />
          <SkeletonDetailsCard />
        </div>
      </div>
    </div>
  )
}
