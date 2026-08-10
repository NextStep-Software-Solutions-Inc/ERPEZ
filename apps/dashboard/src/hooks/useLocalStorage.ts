import { useCallback, useState } from 'react'

/**
 * Custom hook for managing localStorage with React state
 * Provides type-safe persistence and graceful fallback handling
 */
/**
 * A custom React hook for managing state synchronized with localStorage.
 * 
 * @template T - The type of the value stored in localStorage.
 * @param key - The localStorage key to store the value under.
 * @param initialValue - The initial value to use if no value is found in localStorage.
 * @returns A tuple containing:
 *   - The current stored value.
 *   - A setter function to update the value, which can accept a new value or a function that receives the current value and returns the new value.
 *   - A function that removes the value from localStorage and resets it to the initial value.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.warn(`Failed to read from localStorage (${key}):`, error)
            return initialValue
        }
    })

    // Update localStorage when state changes
    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value
                setStoredValue(valueToStore)

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore))
                }
            } catch (error) {
                console.warn(`Failed to write to localStorage (${key}):`, error)
            }
        },
        [key, storedValue],
    )

    // Remove value from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue)
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
            }
        } catch (error) {
            console.warn(`Failed to remove from localStorage (${key}):`, error)
        }
    }, [key, initialValue])

    return [storedValue, setValue, removeValue]
}
