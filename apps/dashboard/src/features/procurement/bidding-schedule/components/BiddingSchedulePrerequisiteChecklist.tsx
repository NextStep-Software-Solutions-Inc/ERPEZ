import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Settings2,
  XCircle,
} from 'lucide-react'
import { USE_MOCK_BIDDING_SCHEDULE } from '../config'
import type {
  BiddingSchedule,
  MockPrerequisiteGates,
  PrerequisiteGateResult,
} from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

type GateKey = keyof MockPrerequisiteGates

interface GateItem {
  key: GateKey
  label: string
  description: string
  completeNowHref: string | null
}

// The generated route fullPath is `/v2/consolidate-prs` even though the file
// route declaration uses a trailing slash.
const CONSOLIDATE_PRS_ROUTE = '/v2/consolidate-prs'

const GATE_ITEMS: Array<GateItem> = [
  {
    key: 'consolidatedPrLinked',
    label: 'Consolidated PR linked',
    description:
      'A BAC Resolution must have exactly one linked Consolidated PR item.',
    completeNowHref: CONSOLIDATE_PRS_ROUTE,
  },
  {
    key: 'bacResolutionApproved',
    label: 'BAC Resolution approved',
    description:
      'Only approved BAC Resolutions can generate a bidding schedule.',
    completeNowHref: '/v2/bac-resolutions/',
  },
  {
    key: 'bacResolutionPublicBidding',
    label: 'Public Bidding mode set',
    description:
      'The owned Consolidated PR must be configured for Public Bidding.',
    completeNowHref: '/v2/consolidate-prs/',
  },
  {
    key: 'bacResolutionIssued',
    label: 'BAC Resolution issued',
    description:
      'The BAC Resolution must already be issued before schedule generation.',
    completeNowHref: '/v2/bac-resolutions/',
  },
  {
    key: 'intervalConfigExists',
    label: 'Interval config set by System Admin',
    description: 'Bidding intervals must be configured before generation.',
    completeNowHref: null,
  },
  {
    key: 'holidaysTableExists',
    label: 'Holidays table configured',
    description: 'Holiday data is required to skip non-working days correctly.',
    completeNowHref: null,
  },
]

/** Replacement gate list for PB draft mode — approval gates swapped for pbCprLinked. */
const PB_DRAFT_GATE_ITEMS: Array<GateItem> = [
  {
    key: 'consolidatedPrLinked',
    label: 'Consolidated PR linked',
    description:
      'A BAC Resolution must have exactly one linked Consolidated PR item.',
    completeNowHref: CONSOLIDATE_PRS_ROUTE,
  },
  {
    key: 'pbCprLinked',
    label: 'Public Bidding CPR linked',
    description:
      'The linked Consolidated PR must be configured for Public Bidding. This replaces the approval requirement for provisional draft schedules.',
    completeNowHref: '/v2/consolidate-prs/',
  },
  {
    key: 'bacResolutionPublicBidding',
    label: 'Public Bidding mode set',
    description:
      'The owned Consolidated PR must be configured for Public Bidding.',
    completeNowHref: '/v2/consolidate-prs/',
  },
  {
    key: 'intervalConfigExists',
    label: 'Interval config set by System Admin',
    description: 'Bidding intervals must be configured before generation.',
    completeNowHref: null,
  },
  {
    key: 'holidaysTableExists',
    label: 'Holidays table configured',
    description: 'Holiday data is required to skip non-working days correctly.',
    completeNowHref: null,
  },
]

interface BiddingSchedulePrerequisiteChecklistProps {
  gates: PrerequisiteGateResult
  schedule: BiddingSchedule | null
  onGenerate: () => void
  isGenerating: boolean
  mockGates: MockPrerequisiteGates
  onToggleGate: (gate: GateKey) => void
  isDraftPbMode?: boolean
}

export function BiddingSchedulePrerequisiteChecklist({
  gates,
  schedule,
  onGenerate,
  isGenerating,
  mockGates,
  onToggleGate,
  isDraftPbMode = false,
}: BiddingSchedulePrerequisiteChecklistProps) {
  const [devPanelOpen, setDevPanelOpen] = useState(false)
  const buttonLabel = schedule
    ? 'Regenerate Schedule'
    : 'Generate Bidding Schedule'
  const shouldShowGenerateButton =
    schedule?.status !== 'confirmed' && schedule?.status !== 'locked'

  const activeGateItems = isDraftPbMode ? PB_DRAFT_GATE_ITEMS : GATE_ITEMS

  return (
    <Card className="border border-default-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Prerequisite Checklist</CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify the workspace requirements before generating the bidding
          calendar.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {activeGateItems.map((item) => {
            const passed = gates[item.key] ?? false

            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-lg border border-default-200 bg-default-50 px-4 py-3"
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
                <div className="flex items-center gap-2">
                  {passed ? (
                    <Badge variant="outline" color="success">
                      Passed
                    </Badge>
                  ) : item.completeNowHref ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Link to={item.completeNowHref}>
                        Complete now
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="outline" color="secondary">
                      Coming soon
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {shouldShowGenerateButton && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-default-200 bg-white px-4 py-3">
            <div>
              <p className="font-medium text-default-900">
                {schedule
                  ? 'Existing draft schedule'
                  : 'No schedule generated yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {gates.allPassed
                  ? 'All prerequisites are satisfied and generation is available.'
                  : 'Resolve the checklist items above before generating.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={onGenerate}
              disabled={!gates.allPassed || isGenerating}
              className="gap-2"
            >
              {schedule ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Settings2 className="h-4 w-4" />
              )}
              {buttonLabel}
            </Button>
          </div>
        )}

        {USE_MOCK_BIDDING_SCHEDULE && (
          <Collapsible open={devPanelOpen} onOpenChange={setDevPanelOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-0">
                <span className="font-medium">Dev: Mock Gate Toggles</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {activeGateItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-default-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {mockGates[item.key] ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    checked={mockGates[item.key] ?? true}
                    onCheckedChange={() => onToggleGate(item.key)}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
