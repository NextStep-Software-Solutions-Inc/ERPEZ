import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NoticeOfAwardActionBarProps = {
  search: string
  onSearchChange: (value: string) => void
  primaryActionLabel?: string
  onPrimaryAction?: () => void
}

export function NoticeOfAwardActionBar({
  search,
  onSearchChange,
  primaryActionLabel,
  onPrimaryAction,
}: NoticeOfAwardActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search NOA number, supplier, or description..."
          className="pl-9 h-9 rounded-lg bg-card text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        {primaryActionLabel ? (
          <Button
            onClick={onPrimaryAction}
            size="sm"
            className="h-9 gap-1.5 font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            {primaryActionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}


