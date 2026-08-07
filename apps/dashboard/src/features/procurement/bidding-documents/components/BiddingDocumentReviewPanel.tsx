import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  FileCheck2,
  FileCog,
  Lock,
  RefreshCw,
} from 'lucide-react'
import type { BiddingDocumentRecord } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface BiddingDocumentReviewPanelProps {
  document: BiddingDocumentRecord
  canGenerate: boolean
  isPosted: boolean
  currentPage: number
  onGenerate: () => void
  onDownload: (extension: 'docx' | 'pdf') => void
  onMarkPosted: () => void
  onSelectPage: (pageIndex: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function BiddingDocumentReviewPanel({
  document,
  canGenerate,
  isPosted,
  currentPage,
  onGenerate,
  onDownload,
  onMarkPosted,
  onSelectPage,
  onPreviousPage,
  onNextPage,
}: BiddingDocumentReviewPanelProps) {
  const activePage = document.previewPages[currentPage]
  const [pageInputValue, setPageInputValue] = useState(
    (currentPage + 1).toString(),
  )

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPageInputValue(value)
    const pageNum = parseInt(value, 10)
    if (
      !Number.isNaN(pageNum) &&
      pageNum > 0 &&
      pageNum <= document.previewPages.length
    ) {
      onSelectPage(pageNum - 1)
    }
  }

  useEffect(() => {
    setPageInputValue((currentPage + 1).toString())
  }, [currentPage])

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base">
            Phase 1 to 3 - Generate, Review, Download, Post
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate stays disabled until all required fields and uploads are
            complete.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isPosted}
            className="gap-2"
          >
            {document.status === 'generated' ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <FileCog className="h-4 w-4" />
            )}
            {document.status === 'generated'
              ? 'Regenerate PBD'
              : 'Generate PBD'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onDownload('docx')}
            disabled={
              document.previewPages.length === 0 || document.needsRegeneration
            }
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download .docx
          </Button>
          <Button
            variant="outline"
            onClick={() => onDownload('pdf')}
            disabled={
              document.previewPages.length === 0 || document.needsRegeneration
            }
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={onMarkPosted}
            disabled={
              isPosted ||
              document.previewPages.length === 0 ||
              document.needsRegeneration
            }
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Mark as Posted
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link
              to="/v2/bidding-documents/$bacResolutionId"
              params={{ bacResolutionId: document.bacResolutionId }}
            >
              <CircleAlert className="h-3.5 w-3.5" />
              Edit form
            </Link>
          </Button>
          <Badge variant="outline" color={canGenerate ? 'success' : 'warning'}>
            {canGenerate
              ? 'Generate enabled'
              : 'Complete Phase 0A and 0B first'}
          </Badge>
        </div>

        {document.previewPages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-6 text-sm text-muted-foreground">
            Generate the PBD to assemble a paginated preview for review and
            download.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
            <Card className="border border-default-200 shadow-none h-fit">
              <CardHeader>
                <CardTitle className="text-sm">Pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="space-y-1">
                    {document.previewPages.map((page, index) => (
                      <Button
                        key={page.id}
                        type="button"
                        variant={index === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => onSelectPage(index)}
                      >
                        <span className="text-default-500">p.</span>
                        <span className="font-medium">{index + 1}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-default-200 pt-2 text-xs text-muted-foreground">
                  <p className="font-medium">
                    {currentPage + 1} of {document.previewPages.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-default-200 bg-white shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Preview</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activePage.title}
                  </p>
                </div>
                <Badge variant="outline" color="info">
                  Page {currentPage + 1} / {document.previewPages.length}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document preview area */}
                <div className="min-h-[420px] rounded-xl border border-default-200 bg-default-50 p-6">
                  <div className="mx-auto flex min-h-[360px] max-w-3xl flex-col gap-3 rounded-lg bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-2 text-default-900">
                      <FileCheck2 className="h-4 w-4" />
                      <span className="font-medium">{activePage.title}</span>
                    </div>
                    <div className="space-y-2 text-sm leading-6 text-default-700">
                      {activePage.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Document-like pagination footer */}
                <div className="flex flex-col gap-3 border-t border-default-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPreviousPage}
                      disabled={currentPage === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNextPage}
                      disabled={currentPage >= document.previewPages.length - 1}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="page-input"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Go to page:
                    </label>
                    <Input
                      id="page-input"
                      type="number"
                      min="1"
                      max={document.previewPages.length}
                      value={pageInputValue}
                      onChange={handlePageInputChange}
                      className="h-8 w-12 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      of {document.previewPages.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
