import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataTableSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  disabled?: boolean
}

export function DataTableSearchInput({
  value: initialValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 350,
  className,
  disabled = false,
}: DataTableSearchInputProps) {
  const [value, setValue] = useState(initialValue)

  // Sync internal value if external value changes (e.g. on reset)
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [value, debounceMs, onChange, initialValue])

  const handleClear = () => {
    setValue('')
    onChange('')
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-8 pl-8 pr-8 w-full min-w-[200px] text-xs bg-background/80 hover:bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg transition-colors"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-full"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}
