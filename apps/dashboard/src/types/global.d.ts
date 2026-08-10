import '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'

declare type MetaActions = Array<
  | 'write'
  | 'delete'
  | 'read'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'submit'
  | 'lock'
>

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    readonly: boolean
    actions?: MetaActions
    role?: string
    deliveryUnitId?: string
  }
}
