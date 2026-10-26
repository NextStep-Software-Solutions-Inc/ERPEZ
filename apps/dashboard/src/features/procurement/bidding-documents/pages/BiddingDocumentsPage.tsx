import { Link } from '@tanstack/react-router'
import { FileCheck2, FolderOpenDot, Lock } from 'lucide-react'
import { PROCUREMENT_CATEGORY_LABELS } from '../../bidding-schedule/types'
import {
  areAllGatesPassed,
  canGenerateBiddingDocument,
  formatCurrency,
  getOverallProgress,
} from '../data/mockBiddingDocumentsData'
import { useBiddingDocumentsStore } from '../store/biddingDocumentsStore'
import { PageContainerDashtail } from '@/components/v2'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const STATUS_BADGE: Record<
  string,
  { label: string; color: 'secondary' | 'info' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', color: 'secondary' },
  generated: { label: 'Generated', color: 'info' },
  posted: { label: 'Posted', color: 'success' },
}

export function BiddingDocumentsPage() {
  const documents = useBiddingDocumentsStore((state) => state.documents)

  const draftCount = documents.filter(
    (document) => document.status === 'draft',
  ).length
  const generatedCount = documents.filter(
    (document) => document.status === 'generated',
  ).length
  const postedCount = documents.filter(
    (document) => document.status === 'posted',
  ).length

  return (
    <PageContainerDashtail
      title="Bidding Documents"
      description="Track auto-filled PBD drafts, complete the remaining inputs, and prepare PhilGEPS-ready downloads."
      headerVariant="branded"
      headerSize="large"
      actions={
        <Badge variant="outline" className="h-fit">
          PBD
        </Badge>
      }
      contentClassName="space-y-4 pt-4"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {draftCount}
          </CardContent>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Generated Previews
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {generatedCount}
          </CardContent>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posted to PhilGEPS
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {postedCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {documents.map((document) => {
          const progress = getOverallProgress(document)
          const gatesPassed = areAllGatesPassed(document.gates)
          const readyToGenerate = canGenerateBiddingDocument(document)
          const status = STATUS_BADGE[document.status]

          return (
            <Card
              key={document.id}
              className="border border-default-200 shadow-sm"
            >
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {document.bacResolutionNumber} — {document.projectTitle}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {
                        PROCUREMENT_CATEGORY_LABELS[
                          document.procurementCategory
                        ]
                      }
                    </p>
                  </div>
                  <Badge variant="outline" color={status.color}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Contract ID: {document.contractId}</span>
                  <span>ABC: {formatCurrency(document.abc)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall completion</span>
                    <span>
                      {progress.complete}/{progress.total}
                    </span>
                  </div>
                  <Progress
                    value={progress.percent}
                    color="success"
                    size="sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    color={gatesPassed ? 'success' : 'warning'}
                  >
                    {gatesPassed
                      ? 'Prerequisites passed'
                      : 'Prerequisites blocked'}
                  </Badge>
                  <Badge
                    variant="outline"
                    color={readyToGenerate ? 'info' : 'secondary'}
                  >
                    {readyToGenerate
                      ? 'Ready to generate'
                      : 'Needs more inputs'}
                  </Badge>
                  {document.needsRegeneration && (
                    <Badge variant="outline" color="warning">
                      Needs regeneration
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="gap-2">
                    <Link
                      to="/v2/bidding-documents/$bacResolutionId"
                      params={{ bacResolutionId: document.bacResolutionId }}
                    >
                      <FolderOpenDot className="h-4 w-4" />
                      Open workspace
                    </Link>
                  </Button>
                  {document.status !== 'draft' && (
                    <Badge variant="outline" className="gap-2">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      Preview available
                    </Badge>
                  )}
                  {document.status === 'posted' && (
                    <Badge variant="outline" className="gap-2" color="success">
                      <Lock className="h-3.5 w-3.5" />
                      Read-only
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageContainerDashtail>
  )
}
