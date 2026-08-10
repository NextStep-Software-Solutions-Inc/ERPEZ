import { CheckCircle2, CircleDot, Lock } from 'lucide-react'
import { BIDDING_DOCUMENT_PHASE_SCAFFOLD } from '../data/workspaceScaffold'
import type { BiddingDocumentPhaseKey, BiddingDocumentRecord } from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BiddingDocumentPhaseScaffoldProps {
  document: BiddingDocumentRecord
}

function resolvePhaseState(
  document: BiddingDocumentRecord,
  phase: BiddingDocumentPhaseKey,
) {
  switch (phase) {
    case 'prerequisites': {
      const complete =
        document.workspace.progress.prerequisites.complete ===
        document.workspace.progress.prerequisites.total

      return {
        complete,
        summary: `${document.workspace.progress.prerequisites.complete}/${document.workspace.progress.prerequisites.total} gates passed`,
      }
    }

    case 'structured-inputs': {
      const complete =
        document.workspace.progress.structuredInputs.complete ===
        document.workspace.progress.structuredInputs.total

      return {
        complete,
        summary: `${document.workspace.progress.structuredInputs.complete}/${document.workspace.progress.structuredInputs.total} required inputs complete`,
      }
    }

    case 'section-uploads': {
      const complete =
        document.workspace.progress.uploads.complete ===
        document.workspace.progress.uploads.total

      return {
        complete,
        summary: `${document.workspace.progress.uploads.complete}/${document.workspace.progress.uploads.total} required uploads complete`,
      }
    }

    case 'generation-review': {
      const complete =
        document.previewPages.length > 0 && !document.needsRegeneration

      return {
        complete,
        summary:
          document.previewPages.length === 0
            ? 'Preview not generated yet'
            : document.needsRegeneration
              ? 'Preview needs regeneration'
              : `${document.previewPages.length} preview page(s) ready`,
      }
    }

    case 'posting-lock': {
      const complete = document.status === 'posted'

      return {
        complete,
        summary: complete
          ? 'Posted and read-only'
          : 'Awaiting posting confirmation',
      }
    }
  }
}

export function BiddingDocumentPhaseScaffold({
  document,
}: BiddingDocumentPhaseScaffoldProps) {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Workspace Phases</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-5">
        {BIDDING_DOCUMENT_PHASE_SCAFFOLD.map((phase) => {
          const state = resolvePhaseState(document, phase.key)
          const isActive = document.workspace.activePhase === phase.key

          return (
            <div
              key={phase.key}
              className={[
                'rounded-xl border px-4 py-4 transition-colors',
                isActive
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-default-200 bg-default-50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {phase.title}
                  </p>
                  <p className="mt-1 font-medium text-default-900">
                    {phase.description}
                  </p>
                </div>
                {phase.key === 'posting-lock' &&
                document.status === 'posted' ? (
                  <Lock className="h-4 w-4 text-warning" />
                ) : state.complete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <CircleDot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  color={
                    state.complete ? 'success' : isActive ? 'info' : 'secondary'
                  }
                >
                  {state.complete
                    ? 'Complete'
                    : isActive
                      ? 'Current'
                      : 'Pending'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {state.summary}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
