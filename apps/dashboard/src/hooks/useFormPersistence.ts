import { useCallback, useEffect, useMemo } from 'react'
import { atom, useAtom, useSetAtom  } from 'jotai'
import { atomWithStorage } from 'jotai/utils'


// Generic storage key generator
const createStorageKey = (formId: string, suffix: string) =>
  `${formId}_${suffix}`

// Factory function to create form persistence atoms
export function createFormPersistenceAtoms<TFormValues>(
  formId: string,
  defaultValues: TFormValues,
) {
  const valuesAtom = atomWithStorage<TFormValues>(
    createStorageKey(formId, 'data'),
    defaultValues,
  )

  const stepAtom = atomWithStorage<number>(createStorageKey(formId, 'step'), 1)

  const resetAtom = atom(null, (_get, set) => {
    set(valuesAtom, defaultValues)
    set(stepAtom, 1)
  })

  const clearStorageAtom = atom(null, () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(createStorageKey(formId, 'data'))
        localStorage.removeItem(createStorageKey(formId, 'step'))
      } catch {
        console.warn(`Failed to clear localStorage for form: ${formId}`)
      }
    }
  })

  return {
    valuesAtom,
    stepAtom,
    resetAtom,
    clearStorageAtom,
  }
}

// Hook for using form persistence
export function useFormPersistence<TFormValues>(
  formId: string,
  defaultValues: TFormValues,
) {
  // Create atoms dynamically based on formId
  const atoms = useMemo(
    () => createFormPersistenceAtoms<TFormValues>(formId, defaultValues),
    [formId],
  )

  const [values, setValues] = useAtom(atoms.valuesAtom)
  const [step, setStep] = useAtom(atoms.stepAtom)
  const reset = useSetAtom(atoms.resetAtom)
  const clearStorage = useSetAtom(atoms.clearStorageAtom)

  const updateValues = useCallback(
    (newValues: Partial<TFormValues>) => {
      setValues((prev) => ({ ...prev, ...newValues }))
    },
    [setValues],
  )

  const resetForm = useCallback(() => {
    reset()
    clearStorage()
  }, [reset, clearStorage])

  return {
    values,
    setValues,
    updateValues,
    step,
    setStep,
    resetForm,
    clearStorage,
  }
}

// Debounce utility for form field changes
export function useDebouncedCallback<T extends (...args: Array<any>) => any>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useMemo(
    () => ({ current: null as NodeJS.Timeout | null }),
    [],
  )

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}
