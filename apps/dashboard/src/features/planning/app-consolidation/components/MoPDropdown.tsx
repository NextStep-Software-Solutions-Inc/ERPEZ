import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * Mode of Procurement Options
 * Based on Philippine Procurement Regulations (RA 9184)
 */
export const MOP_OPTIONS = [
  {
    value: 'Competitive Bidding',
    label: 'Competitive Bidding',
    description: 'Open invitation to bid',
    icon: '📢',
  },
  {
    value: 'Utility Recontracting',
    label: 'Utility Recontracting',
    description: 'Repeat contracts for utilities',
    icon: '🔄',
  },
  {
    value: 'Agency-to-Agency',
    label: 'Agency-to-Agency',
    description: 'Procurement from other government agencies',
    icon: '🏛️',
  },
  {
    value: 'Maintenance',
    label: 'Maintenance',
    description: 'Spare parts and maintenance services',
    icon: '🔧',
  },
  {
    value: 'Shopping',
    label: 'Shopping',
    description: 'Direct purchase from market',
    icon: '🛒',
  },
  {
    value: 'Direct Contracting',
    label: 'Direct Contracting',
    description: 'Direct engagement of contractor',
    icon: '📝',
  },
]

interface MoPDropdownProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  className?: string
  showDescription?: boolean
}

/**
 * MoPDropdown - Mode of Procurement Selector Component
 *
 * Provides a dropdown for selecting the mode of procurement for BAC line items.
 * Supports all Philippine RA 9184 procurement modes.
 *
 * Usage:
 * ```tsx
 * <MoPDropdown
 *   value={item.modeOfProcurement}
 *   onChange={(mop) => updateItem('modeOfProcurement', mop)}
 * />
 * ```
 */
export function MoPDropdown({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = 'Select mode of procurement...',
  className,
  showDescription = false,
}: MoPDropdownProps) {
  if (readOnly) {
    const selected = MOP_OPTIONS.find((opt) => opt.value === value)
    return (
      <div
        className={cn(
          'px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm',
          className,
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <span>{selected.icon}</span>
            <span>{selected.label}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
    )
  }

  return (
    <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {MOP_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span>{option.icon}</span>
              <div>
                <p className="font-medium">{option.label}</p>
                {showDescription && (
                  <p className="text-xs text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * MoPBadge - Display Mode of Procurement as a Badge
 * Useful for read-only display in tables and summaries
 */
export function MoPBadge({ value }: { value?: string }) {
  const option = MOP_OPTIONS.find((opt) => opt.value === value)

  if (!option) return null

  const colorMap: Record<string, string> = {
    'Competitive Bidding': 'bg-blue-100 text-blue-800',
    'Utility Recontracting': 'bg-green-100 text-green-800',
    'Agency-to-Agency': 'bg-purple-100 text-purple-800',
    'Maintenance': 'bg-yellow-100 text-yellow-800',
    'Shopping': 'bg-orange-100 text-orange-800',
    'Direct Contracting': 'bg-red-100 text-red-800',
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium', colorMap[value] || 'bg-gray-100 text-gray-800')}>
      <span>{option.icon}</span>
      <span>{option.label}</span>
    </span>
  )
}
