import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Download, Eye, Maximize2, FileDown, Loader2 } from 'lucide-react'
import type { PurchaseOrder } from '../types'
import {
  generatePurchaseOrderPrintHTML,
  printPurchaseOrder,
  downloadPurchaseOrderHtml,
} from '../utils/printPurchaseOrder'
import { downloadPurchaseOrderPdf } from '../handlers/generatePurchaseOrderDocumentRequest'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'
import { toast } from 'sonner'

type GeneratedPurchaseOrderPreviewCardProps = {
  purchaseOrder: PurchaseOrder
}

export function GeneratedPurchaseOrderPreviewCard({
  purchaseOrder,
}: GeneratedPurchaseOrderPreviewCardProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const { activeTenant } = useUnifiedAuth()

  const rawAgency = activeTenant?.name?.trim()
  const agencyName =
    rawAgency && !rawAgency.toLowerCase().includes('ustp')
      ? rawAgency
      : rawAgency || 'Agency Name'

  const poHtml = useMemo(
    () => generatePurchaseOrderPrintHTML(purchaseOrder, { entityName: agencyName }),
    [purchaseOrder, agencyName]
  )

  const handlePrint = () => {
    printPurchaseOrder(purchaseOrder, { entityName: agencyName })
  }

  const handleDownloadHtml = () => {
    downloadPurchaseOrderHtml(purchaseOrder, { entityName: agencyName })
  }

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true)
      await downloadPurchaseOrderPdf(purchaseOrder.id, `${purchaseOrder.poNumber || 'PO'}.pdf`)
      toast.success('Official Purchase Order PDF downloaded successfully!')
    } catch (err: any) {
      console.error('Failed to download official PO PDF:', err)
      toast.error(
        err?.message || 'Failed to download server-rendered PDF. You can also use Print / Save PDF.'
      )
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
      <CardHeader className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                Generated Purchase Order Document
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                COA GAM Appendix 61
              </span>
            </div>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Live document generated dynamically from PO details, supplier info, and line items.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setIsFullscreenOpen(true)}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Full Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={handleDownloadHtml}
            >
              <Download className="h-3.5 w-3.5" />
              Download HTML
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              Download PDF
            </Button>

            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handlePrint}
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/50">
        {/* Document Preview Frame */}
        <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white shadow-inner overflow-hidden">
          <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Interactive Document Preview (Appendix 61 Format)</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {purchaseOrder.poNumber || 'PO Document'}
            </span>
          </div>
          <iframe
            title={`Purchase Order Preview - ${purchaseOrder.poNumber}`}
            srcDoc={poHtml}
            className="w-full h-[650px] border-0 bg-white"
          />
        </div>
      </CardContent>

      {/* Fullscreen Dialog Preview */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-4">
          <DialogHeader className="pb-2 border-b">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-lg font-bold">
                Purchase Order Preview — {purchaseOrder.poNumber}
              </DialogTitle>
              <Button
                variant="default"
                size="sm"
                className="gap-2 h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full overflow-hidden mt-2 rounded border border-slate-200">
            <iframe
              title={`Fullscreen Purchase Order Preview - ${purchaseOrder.poNumber}`}
              srcDoc={poHtml}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
