import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { documentRegistry } from '../documents/documentRegistry'

/**
 * Opens the browser's native print/save dialog for a given docId.
 * Renders the document component to static HTML, opens a new window,
 * writes the content, then immediately triggers window.print().
 * The user sees the browser's Print Preview and can Save as PDF.
 */
export function printDocument(docId: string): void {
  const doc = documentRegistry[docId]
  if (!doc) return

  const html = renderToStaticMarkup(doc.component as ReactElement)

  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${doc.title}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #fff;
        font-family: Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @media print {
        body { margin: 0; }
        @page { margin: 1.5cm; }
      }
    </style>
  </head>
  <body>
    ${html}
    <script>
      window.onload = function () {
        setTimeout(function () { window.print(); }, 300);
      };
    <\/script>
  </body>
</html>`)
  printWindow.document.close()
}
