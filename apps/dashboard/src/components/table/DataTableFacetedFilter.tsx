import * as React from 'react'
import { Check, PlusCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export interface DataTableFacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface DataTableFacetedFilterProps {
  title: string
  options: DataTableFacetedFilterOption[]
  selectedValues?: string[] | Set<string> | string
  onSelect: (values: string[]) => void
  multiSelect?: boolean
  className?: string
  disabled?: boolean
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues: rawSelectedValues,
  onSelect,
  multiSelect = true,
  className,
  disabled = false,
}: DataTableFacetedFilterProps) {
  const selectedValues = React.useMemo(() => {
    if (!rawSelectedValues) return new Set<string>()
    if (rawSelectedValues instanceof Set) return rawSelectedValues
    if (Array.isArray(rawSelectedValues)) return new Set(rawSelectedValues)
    return new Set([rawSelectedValues])
  }, [rawSelectedValues])

  const handleSelectOption = (value: string) => {
    if (multiSelect) {
      const next = new Set(selectedValues)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      onSelect(Array.from(next))
    } else {
      // Single select: toggle or select
      if (selectedValues.has(value)) {
        onSelect([])
      } else {
        onSelect([value])
      }
    }
  }

  const handleClear = () => {
    onSelect([])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-8 border-dashed text-xs font-medium hover:bg-muted/50 transition-colors',
            selectedValues.size > 0 && 'border-primary/50 bg-primary/5 text-primary',
            className,
          )}
        >
          <PlusCircle className="mr-2 h-3.5 w-3.5" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden text-[10px]"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1.5 font-normal text-[10px]"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1.5 font-normal text-[10px]"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} className="text-xs" />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelectOption(option.value)}
                    className="text-xs cursor-pointer py-1.5"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/40',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {typeof option.count === 'number' && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-[10px] text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center text-xs text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
