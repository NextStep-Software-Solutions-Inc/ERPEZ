import { Link } from '@tanstack/react-router'
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react'
import type { BiddingDocumentGateKey, BiddingDocumentRecord } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const GATE_ITEMS: Array<{
  key: BiddingDocumentGateKey
  label: string
  description: string
  href: string
}> = [
  {
    key: 'confirmedSchedule',
    label: 'TC-01 bidding schedule confirmed',
    description:
      'Calendar dates must already be confirmed before PBD finalization starts.',
    href: '',
  },
  {
    key: 'consolidatedPrApproved',
    label: 'Consolidated PR approved',
    description:
      'The source PR data must be approved and ready for public bidding assembly.',
    href: '/v2/consolidate-prs',
  },
  {
    key: 'bacResolutionIssued',
    label: 'BAC Resolution issued',
    description:
      'The BAC Resolution must already be issued before the PBD can be generated.',
    href: '/v2/bac-resolutions',
  },
  {
    key: 'gppbTemplatesAvailable',
    label: 'System Admin GPPB templates uploaded',
    description:
      'The official template files must already be available in the system library.',
    href: '/v2/procurement-library',
  },
]

interface BiddingDocumentPrerequisiteChecklistProps {
  document: BiddingDocumentRecord
  allGatesPassed: boolean
  onToggleGate: (gate: BiddingDocumentGateKey) => void
}

export function BiddingDocumentPrerequisiteChecklist({
  document,
  allGatesPassed,
  onToggleGate,
}: BiddingDocumentPrerequisiteChecklistProps) {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Prerequisite Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {GATE_ITEMS.map((item) => {
          const passed = document.gates[item.key]

          return (
            <div
              key={item.key}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-default-200 bg-default-50 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                {passed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 text-rose-600" />
                )}
                <div className="space-y-0.5">
                  <p className="font-medium text-default-900">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {passed ? (
                  <Badge variant="outline" color="success">
                    Passed
                  </Badge>
                ) : item.key === 'confirmedSchedule' ? (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link
                      to="/v2/bac-resolutions/$resolutionId/bidding-schedule"
                      params={{ resolutionId: document.bacResolutionId }}
                    >
                      Complete now
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to={item.href}>
                      Complete now
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Dev toggle</span>
                  <Switch
                    checked={passed}
                    onCheckedChange={() => onToggleGate(item.key)}
                    aria-label={`Toggle ${item.label}`}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {!allGatesPassed && (
          <Alert variant="outline" color="warning">
            <div>
              <AlertTitle>Phase 0 is blocked</AlertTitle>
              <AlertDescription>
                Structured inputs and upload slots stay inaccessible until all
                prerequisite gates are green.
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
