import { Search } from 'lucide-react'
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
    <div className="flex flex-col gap-3 rounded-2xl border border-default-200 bg-background p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search NOA number, supplier, or description"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {primaryActionLabel ? (
          <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
        ) : null}
      </div>
    </div>
  )
}
