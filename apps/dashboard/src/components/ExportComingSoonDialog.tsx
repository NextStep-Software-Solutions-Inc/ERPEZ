import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ExportComingSoonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityLabel?: string
  description?: string
  whatsNext?: string
}

/**
 * Shared dialog component for "Coming Soon" export functionality.
 * Used across multiple procurement pages to maintain consistent UX.
 */
export function ExportComingSoonDialog({
  open,
  onOpenChange,
  entityLabel = 'details',
  description,
  whatsNext,
}: ExportComingSoonDialogProps) {
  const defaultDescription =
    "Excel export functionality is being developed. We're connecting the xlsx/sheetjs library to provide powerful export capabilities."
  
  const defaultWhatsNext = `Soon you'll be able to export ${entityLabel} to Excel with custom formatting.`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Excel Export</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {/* Excel Chart Icon */}
          <div className="flex items-end gap-1 mb-2">
            <div className="w-4 h-8 bg-red-500 rounded-sm"></div>
            <div className="w-4 h-12 bg-yellow-500 rounded-sm"></div>
            <div className="w-4 h-16 bg-green-600 rounded-sm"></div>
            <div className="w-4 h-20 bg-blue-600 rounded-sm"></div>
          </div>

          <h3 className="text-lg font-semibold text-center">Coming Soon</h3>

          <p className="text-sm text-center text-muted-foreground px-4">
            {description || defaultDescription}
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 w-full">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">What's next:</span> {whatsNext || defaultWhatsNext}
            </p>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
