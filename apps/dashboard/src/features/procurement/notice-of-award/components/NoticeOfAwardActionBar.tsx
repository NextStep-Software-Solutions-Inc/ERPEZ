import { Plus, RefreshCw, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type NoticeOfAwardActionBarProps = {
  search: string
  onSearchChange: (value: string) => void
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

export function NoticeOfAwardActionBar({
  search,
  onSearchChange,
  primaryActionLabel,
  onPrimaryAction,
  onRefresh,
  isLoading,
}: NoticeOfAwardActionBarProps) {
  return (
    <Card className="border border-default-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
      <CardHeader className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold text-default-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Notice of Award Controls
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Search NOA records by number, supplier, or PR, trigger new award drafts, and refresh dataset.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search NOA, supplier, PR..."
              className="pl-9 h-10 rounded-lg bg-white border-default-300 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {primaryActionLabel && onPrimaryAction ? (
            <Button
              onClick={onPrimaryAction}
              className="h-10 gap-1.5 font-bold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {primaryActionLabel}
            </Button>
          ) : null}

          {onRefresh ? (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              title="Refresh NOA Records"
              className="bg-default-50 hover:bg-default-100 border-default-250 hover:border-default-300 text-default-600 h-10 w-10 transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  )
}


