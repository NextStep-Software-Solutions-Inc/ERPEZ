/**
 * TanStack React Table module augmentation
 * Extends the ColumnMeta interface with additional properties used across the application
 */

import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    /** Human-readable label for the column, used in visibility toggles */
    label?: string
  }
}
