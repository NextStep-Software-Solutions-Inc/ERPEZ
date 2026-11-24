import { ReactNode } from 'react'
import { FieldDescriptionTooltip } from './FieldDescriptionTooltip'
import type { PPMPFieldKey } from '../lib/ppmpFieldDescriptions'

interface ItemDetailFieldProps {
  fieldKey: PPMPFieldKey
  label: string
  value: ReactNode
}

/**
 * ItemDetailField Component
 * Displays a PPMP item detail field with label, tooltip icon, and value
 */
export function ItemDetailField({
  fieldKey,
  label,
  value,
}: ItemDetailFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">
          {label}
        </span>
        <FieldDescriptionTooltip fieldKey={fieldKey} className="h-3.5 w-3.5" />
      </div>
      <div className="text-xs text-default-700">{value}</div>
    </div>
  )
}
