import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: Array<ComboboxOption>
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue === value ? '' : optionValue)
    setOpen(false)
    setSearchValue('')
  }

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-full min-w-0', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        title={selectedOption ? selectedOption.label : placeholder}
        className="w-full max-w-full overflow-hidden justify-between bg-white text-left px-3 font-normal"
        onClick={() => {
          setOpen(!open)
          if (!open) {
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
        disabled={disabled}
      >
        <span
          className="truncate min-w-0 flex-1 text-left"
          title={selectedOption ? selectedOption.label : placeholder}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full min-w-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  className={cn(
                    'w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center justify-between gap-2',
                    value === option.value && 'bg-blue-50 text-blue-600 font-semibold'
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="truncate min-w-0 flex-1" title={option.label}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}