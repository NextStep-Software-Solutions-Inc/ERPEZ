import { useCallback, useEffect, useRef, useState } from 'react'
import type { Table } from '@tanstack/react-table'

/**
 * Custom hook for debounced table column filtering
 * @param table - TanStack React Table instance
 * @param columnId - Column ID to filter on
 * @param debounceMs - Debounce delay in milliseconds
 * @returns { value, onChange } - Value and change handler for the input
 */
export function useDebouncedSearch<TData = any>(
    table: Table<TData>,
    columnId: string,
    debounceMs: number = 400,
) {
    const [value, setValue] = useState(
        (table.getColumn(columnId)?.getFilterValue() as string) ?? '',
    )
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Memoize the onChange handler to prevent unnecessary re-renders
    const onChange = useCallback(
        (newValue: string) => {
            setValue(newValue)

            // Clear existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            // Set new timer
            timerRef.current = setTimeout(() => {
                table.getColumn(columnId)?.setFilterValue(newValue)
            }, debounceMs)
        },
        [table, columnId, debounceMs],
    )

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    return { value, onChange }
}
