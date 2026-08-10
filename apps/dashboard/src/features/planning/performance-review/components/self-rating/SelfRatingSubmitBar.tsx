import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Info, Send } from 'lucide-react'

interface SelfRatingSubmitBarProps {
  isReadOnly: boolean
  submitError: string | null
  onSubmit: () => void
}

export function SelfRatingSubmitBar({
  isReadOnly,
  submitError,
  onSubmit,
}: SelfRatingSubmitBarProps) {
  return (
    <>
      {submitError && (
        <Alert
          color="default"
          variant="soft"
          className="bg-primary text-primary-foreground border-primary"
        >
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {!isReadOnly && (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              Once submitted, your inputs will be locked for PMT posting. Ensure
              all ratings and evidence are complete.
            </span>
          </div>
          <Button onClick={onSubmit} size="lg" className="gap-2 shrink-0">
            <Send className="h-4 w-4" />
            Submit for PMT Review
          </Button>
        </div>
      )}
    </>
  )
}
