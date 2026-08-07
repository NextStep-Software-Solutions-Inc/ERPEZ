/**
 * AppExportDialog - Task 2.1 (Main Export Dialog)
 * Full-screen preview modal with Export to Excel and PDF buttons
 * Integrates all export formatting, calculations, and utilities
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Download, Loader2, FileText, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { generatePDFContent } from '../utils/pdfExporter'
import { prepareExcelData } from '../utils/excelExporter'
import type { AppMaster } from '../types'
import { AppDocumentTemplate } from '../components'
import { generateExportFilename } from '../utils/appExportEngine'

interface AppExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: AppMaster | null
}

export function AppExportDialog({ open, onOpenChange, app }: AppExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'preview' | 'excel' | 'pdf'>('preview')

  const handleExportToExcel = useCallback(async () => {
    if (!app) {
      toast.error('No APP selected')
      return
    }

    setIsExporting(true)
    try {
      // Mock export - prepare data structure
      const filename = generateExportFilename(app, 'xlsx')
      prepareExcelData(app) // Prepare but don't use in mock

      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock success
      toast.success(`APP export prepared: ${filename}`)
      toast.info('Ready for API integration: Connect to actual Excel export service')
    } catch (error) {
      console.error('Export preparation failed:', error)
      toast.error('Failed to prepare export')
    } finally {
      setIsExporting(false)
    }
  }, [app])

  const handleExportToPDF = useCallback(async () => {
    if (!app) {
      toast.error('No APP selected')
      return
    }

    setIsExporting(true)
    try {
      // Mock export - prepare HTML content
      generatePDFContent(app) // Prepare but don't use in mock
      const filename = generateExportFilename(app, 'pdf')

      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock success
      toast.success(`APP PDF export prepared: ${filename}`)
      toast.info('Ready for API integration: Connect to actual PDF export service')
    } catch (error) {
      console.error('Export preparation failed:', error)
      toast.error('Failed to prepare PDF export')
    } finally {
      setIsExporting(false)
    }
  }, [app])

  if (!app) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col z-[99999]" size='full'>
        <DialogHeader>
          <DialogTitle className="text-2xl">Export Annual Procurement Plan</DialogTitle>
          <DialogDescription>
            Preview and export your {app.appType} APP for submission to DBM and posting on PhilGEPS
          </DialogDescription>
        </DialogHeader>

        {/* Export Options */}
        <div className="flex gap-2 border-b pb-4">
          <Button
            variant={exportType === 'preview' ? 'default' : 'outline'}
            onClick={() => setExportType('preview')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={exportType === 'excel' ? 'default' : 'outline'}
            onClick={() => setExportType('excel')}
            className="flex items-center gap-2"
          >
            <Table2 className="h-4 w-4" />
            Excel Format
          </Button>
          <Button
            variant={exportType === 'pdf' ? 'default' : 'outline'}
            onClick={() => setExportType('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF Format
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 rounded-lg">
          {exportType === 'preview' && <AppDocumentTemplate app={app} showSignatories={true} />}

          {exportType === 'excel' && (
            <div className="bg-white p-8 rounded text-center py-20">
              <Table2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Export to Excel</h3>
              <p className="text-gray-600 mb-6">
                Download the APP in Excel format (XLSX) with all formatting and calculations preserved.
              </p>
              <Button
                onClick={handleExportToExcel}
                disabled={isExporting}
                className="flex items-center gap-2 mx-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Excel
                  </>
                )}
              </Button>
            </div>
          )}

          {exportType === 'pdf' && (
            <div className="bg-white p-8 rounded text-center py-20">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Export to PDF</h3>
              <p className="text-gray-600 mb-6">
                Generate a PDF document suitable for printing and submission to government agencies.
              </p>
              <Button
                onClick={handleExportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 mx-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
