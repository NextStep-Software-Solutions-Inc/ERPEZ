// DeliveryUnitCell.tsx
import type { Office } from '../table/types'
import type { Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'

export type DeliveryUnitCellProps = {
  row: Row<Office>
}

export default function DeliveryUnitCell({ row }: DeliveryUnitCellProps) {
  return <Checkbox checked={!!row.original.isDeliveryUnit} aria-readonly />
}
