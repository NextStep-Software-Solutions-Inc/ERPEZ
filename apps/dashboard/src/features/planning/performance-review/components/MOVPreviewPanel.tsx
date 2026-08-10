/**
 * Performance Review – MOV Preview Panel
 * Shows the selected MOV file inline (PDF iframe or image).
 */

import { FileText, Image, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MOVFile } from '../types'

interface MOVPreviewPanelProps {
  file: MOVFile | null
}

export function MOVPreviewPanel({ file }: MOVPreviewPanelProps) {
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Select an MOV file to preview</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open
          </a>
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border bg-muted/10 min-h-[300px] flex items-center justify-center">
        {file.fileType === 'image' ? (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-[500px] object-contain"
          />
        ) : file.fileType === 'pdf' ? (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full h-[500px]"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground p-8">
            <FileText className="h-16 w-16 opacity-30" />
            <p className="text-sm">{file.name}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                Download to View
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
