/**
 * AppExportDialog — Export APP as PDF or Excel via the backend DocumentController.
 *
 * Flow:
 *   1. POST /api/planning/documents/app/{appId}/generate?format=Pdf|Excel
 *      → returns { data: documentId }
 *   2. GET /api/planning/documents/{documentId}/download
 *      → streams the binary file
 *
 * Both Preview and Download use the canonical backend QuestPDF generator.
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Download, Loader2, FileText, Table2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { generateAppDocument, fetchAppPdfBlobUrl } from '../handlers/generateAppDocumentRequest'
import { generateExportFilename } from '../utils/appExportEngine'
import type { AppMaster } from '../types'

interface AppExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: AppMaster | null
}

export function AppExportDialog({ open, onOpenChange, app }: AppExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'preview' | 'excel' | 'pdf'>('preview')
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const loadPdfPreview = useCallback(async () => {
    if (!app) return
    setIsPreviewLoading(true)
    setPreviewError(null)

    try {
      const { blobUrl } = await fetchAppPdfBlobUrl(app.id)
      setPreviewPdfUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl)
        return blobUrl
      })
    } catch (error) {
      console.error('Failed to generate preview PDF:', error)
      setPreviewError('Failed to load PDF document preview from backend renderer.')
    } finally {
      setIsPreviewLoading(false)
    }
  }, [app])

  useEffect(() => {
    if (open && app && exportType === 'preview' && !previewPdfUrl && !isPreviewLoading) {
      loadPdfPreview()
    }
  }, [open, app, exportType, previewPdfUrl, isPreviewLoading, loadPdfPreview])

  // Cleanup object URL when modal closes
  useEffect(() => {
    if (!open && previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(null)
    }
  }, [open, previewPdfUrl])

  const handleExportToPDF = useCallback(async () => {
    if (!app) { toast.error('No APP selected'); return }

    setIsExporting(true)
    try {
      await generateAppDocument({
        appId: app.id,
        format: 'Pdf',
        filename: generateExportFilename(app, 'pdf'),
      })
      toast.success('APP PDF downloaded successfully')
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('Failed to generate PDF — please try again')
    } finally {
      setIsExporting(false)
    }
  }, [app])

  const handleExportToExcel = useCallback(async () => {
    if (!app) { toast.error('No APP selected'); return }

    setIsExporting(true)
    try {
      await generateAppDocument({
        appId: app.id,
        format: 'Excel',
        filename: generateExportFilename(app, 'xlsx'),
      })
      toast.success('APP Excel file downloaded successfully')
    } catch (error) {
      console.error('Excel export failed:', error)
      toast.error('Failed to generate Excel file — please try again')
    } finally {
      setIsExporting(false)
    }
  }, [app])

  if (!app) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col z-[99999] max-w-5xl w-full" size='full'>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Export Annual Procurement Plan</DialogTitle>
              <DialogDescription>
                Preview and export official NGPA-formatted document ({app.appType} APP — FY {app.fiscalYear})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Export Mode Tabs */}
        <div className="flex gap-2 border-b pb-3">
          <Button
            variant={exportType === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setExportType('preview')
              if (!previewPdfUrl) loadPdfPreview()
            }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF Preview
          </Button>
          <Button
            variant={exportType === 'excel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setExportType('excel')}
            className="flex items-center gap-2"
          >
            <Table2 className="h-4 w-4" />
            Excel Format
          </Button>
          <Button
            variant={exportType === 'pdf' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setExportType('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF Download
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 rounded-lg flex flex-col min-h-0">
          {/* PDF Preview Mode */}
          {exportType === 'preview' && (
            <div className="flex-1 flex flex-col bg-white rounded-lg p-2 shadow-xs border min-h-0">
              <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded mb-2 border text-xs">
                <span className="font-semibold text-slate-700">
                  Official NGPA APP PDF Document Preview
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadPdfPreview}
                  disabled={isPreviewLoading}
                  className="h-6 gap-1 text-slate-600 hover:text-slate-900 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${isPreviewLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <p className="text-sm font-medium">Generating official NGPA PDF document...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center py-12 text-red-600 gap-3">
                  <p className="text-sm font-medium">{previewError}</p>
                  <Button size="sm" variant="outline" onClick={loadPdfPreview}>
                    Retry Preview Generation
                  </Button>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-[480px] border-0 rounded"
                  title="Official NGPA APP PDF Preview"
                />
              ) : null}
            </div>
          )}

          {/* Excel Export Mode */}
          {exportType === 'excel' && (
            <div className="bg-white p-8 rounded-lg text-center py-20 my-auto border shadow-xs">
              <Table2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-slate-800">Export to Excel (XLSX)</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
                Download the official Annual Procurement Plan formatted for Microsoft Excel with all 12 NGPA columns, calculations, and formulas.
              </p>
              <Button
                onClick={handleExportToExcel}
                disabled={isExporting}
                className="flex items-center gap-2 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Excel File...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Excel Document
                  </>
                )}
              </Button>
            </div>
          )}

          {/* PDF Download Mode */}
          {exportType === 'pdf' && (
            <div className="bg-white p-8 rounded-lg text-center py-20 my-auto border shadow-xs">
              <FileText className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-slate-800">Export to PDF</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
                Generate and download the official NGPA-compliant PDF suitable for printing, agency submission, and PhilGEPS posting.
              </p>
              <Button
                onClick={handleExportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 mx-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF Document...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Official PDF Document
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-between items-center border-t pt-3">
          <div className="text-xs text-slate-500">
            Official NGPA Form • 12 Columns • QuestPDF Document Engine
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
