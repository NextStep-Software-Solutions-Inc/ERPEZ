import { useStore } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'

const getErrorMessage = (error: unknown): string | null => {
  if (typeof error === 'string') return error

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return null
}

export default function FieldInfo({
  field,
  showErrors = false,
}: {
  field: AnyFieldApi
  showErrors?: boolean
}) {
  const errors = useStore(field.store, (state) => state.meta.errors)
  const isTouched = useStore(field.store, (state) => state.meta.isTouched)
  const isValidating = useStore(field.store, (state) => state.meta.isValidating)

  const shouldShowErrors = showErrors || isTouched
  const errorMessages = errors
    .map(getErrorMessage)
    .filter((message): message is string => Boolean(message))

  const hasContent = (shouldShowErrors && errorMessages.length > 0) || isValidating

  if (!hasContent) return null

  return (
    <div className="pt-1 flex items-center">
      {shouldShowErrors && errorMessages.length > 0 ? (
        <em className="text-destructive text-xs">{errorMessages.join(', ')}</em>
      ) : null}
      {isValidating ? (
        <span className="text-muted-foreground text-xs">Validating...</span>
      ) : null}
    </div>
  )
}
