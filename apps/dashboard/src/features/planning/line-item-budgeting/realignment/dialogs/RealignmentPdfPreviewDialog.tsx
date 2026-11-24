import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react'

interface RealignmentPdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  fileName?: string
  isLoading?: boolean
}

export function RealignmentPdfPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  fileName = 'Modification_of_Budget.pdf',
  isLoading = false,
}: RealignmentPdfPreviewDialogProps) {
  const handleDownload = () => {
    if (!pdfUrl) return
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    if (!pdfUrl) return
    window.open(pdfUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="h-[90vh] flex flex-col p-4 sm:p-6 gap-3">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b pr-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Modification of Budget Preview
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Official Realignment ISO Document (FM-SUC-FDP-002)
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pdfUrl && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenNewTab}
                  className="h-8 text-xs font-semibold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 text-xs font-semibold gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
              <p className="text-xs font-medium">Generating PDF preview...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title="Modification of Budget PDF Preview"
              className="w-full h-full border-0"
            />
          ) : (
            <p className="text-xs text-slate-400">No document to preview.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
