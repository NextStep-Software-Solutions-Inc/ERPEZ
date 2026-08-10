import { useRef } from 'react'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { documentRegistry } from '../documents/documentRegistry'

interface BACDocumentViewerProps {
  docId: string
}

/**
 * Full-page document viewer for bid documents.
 * Renders the HTML document in a paper-like container with a sticky toolbar
 * that includes a back button and a print-to-download action.
 */
export function BACDocumentViewer({ docId }: BACDocumentViewerProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const doc = documentRegistry[docId]

  const handleDownload = () => {
    if (!printRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc?.title ?? 'Document'}</title>
          <style>
            body { margin: 0; padding: 0; background: #fff; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
          <script>
            window.onload = () => { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-medium">Document not found</p>
          <p className="text-xs text-slate-400">The document with ID "{docId}" does not exist in the registry.</p>
            <button
            onClick={() => {
              // Prefer navigating back in history when possible (in-app navigation)
              if (window.history.length > 1) {
              window.history.back()
              return
              }
              // If the tab was opened via window.open, try closing it
              if (window.opener) {
              window.close()
              return
              }
              // Fallback: navigate to app root so the button is never a no-op
              window.location.href = '/'
            }}
            className="text-sm text-blue-600 hover:underline"
            >
            Close this tab
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky top toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => {
              // Prefer navigating back in history when possible (in-app navigation)
              if (window.history.length > 1) {
                window.history.back()
                return
              }
              // If the tab was opened via window.open, try closing it
              if (window.opener) {
                window.close()
                return
              }
              // Fallback: navigate to app root so the button is never a no-op
              window.location.href = '/'
            }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Close
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{doc.title}</p>
            <p className="text-xs text-slate-400 truncate">{doc.description}</p>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download / Print
          </button>
        </div>
      </div>

      {/* Document paper */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          ref={printRef}
          className="bg-white shadow-lg rounded-sm"
          style={{ minHeight: '1120px' }}
        >
          {doc.component}
        </div>
      </div>
    </div>
  )
}
