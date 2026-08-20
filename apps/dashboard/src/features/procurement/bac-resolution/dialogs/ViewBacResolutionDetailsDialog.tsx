import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { TemplateTable } from '@/components/TemplateTable'
import { useBackendProjectDetails } from '../handlers/hooks'
import type { BiddingActivitySchedule } from '../handlers/getBackendProjectDetailsRequest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ScrollText,
  Calendar,
  FilePlus,
  Building2,
  Tag,
  Wallet,
  CheckCircle2,
} from 'lucide-react'
import type { BacResolution } from '../types'

interface ViewBacResolutionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolutionId?: string | null
  onCreatePr?: (resolution: BacResolution) => void
}

export function ViewBacResolutionDetailsDialog({
  open,
  onOpenChange,
  resolutionId,
  onCreatePr,
}: ViewBacResolutionDetailsDialogProps) {
  const scheduleColumns = useMemo(
    () => [
      {
        accessorKey: 'procurementActivityTypeName',
        header: 'Activity Type',
        cell: (info: any) => (
          <span className="font-semibold text-foreground">
            {info.getValue() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: (info: any) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A',
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: (info: any) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A',
      },
      {
        accessorKey: 'venue',
        header: 'Venue',
        cell: (info: any) => info.getValue() || 'BAC Conference Room',
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: (info: any) => info.getValue() || 'Scheduled',
      },
    ],
    [],
  )

  const { data: apiData, isLoading } = useBackendProjectDetails({
    pathParams: { id: resolutionId || '' },
    enabled: open && !!resolutionId,
  })

  // Robust mock resolution resolution fallback
  const mockResolution = useMemo(() => {
    if (!resolutionId) return null
    return ([] as any[]).find((res) => res.id === resolutionId) || null
  }, [resolutionId, open])

  // Unified details view data
  const details = useMemo(() => {
    if (apiData && apiData.title) {
      return {
        title: apiData.title,
        abc: apiData.abc || 0,
        status: apiData.status || 'Draft',
        sourceType: mockResolution?.sourceType || 'APP_ITEM',
        officeName:
          mockResolution?.procurementProjectContext?.officeName ||
          mockResolution?.linkedConsolidatedPrs?.[0]?.endUser ||
          'Procurement Office',
        modeOfProcurement:
          mockResolution?.procurementProjectContext?.modeOfProcurement ||
          mockResolution?.linkedConsolidatedPrs?.[0]?.modeOfProcurement ||
          'Public Bidding',
        sourceOfFund:
          mockResolution?.procurementProjectContext?.sourceOfFund ||
          'GAA (General Appropriations Act)',
        bacResolutions: apiData.bacResolutions || [],
        schedules: (apiData.biddingActivitySchedules ||
          []) as BiddingActivitySchedule[],
        isApproved: apiData.status?.toLowerCase() === 'approved',
        isPrCreated: mockResolution?.isPrCreated,
        createdPrNumber: mockResolution?.createdPrNumber,
      }
    }

    if (mockResolution) {
      const context = mockResolution.procurementProjectContext
      const defaultSchedules: BiddingActivitySchedule[] = [
        {
          id: 'sched-1',
          procurementProjectId: mockResolution.id,
          procurementActivityTypeId: 'act-1',
          procurementActivityTypeName: 'Pre-Procurement Conference',
          startDate: '2026-06-01T09:00:00.000Z',
          endDate: '2026-06-01T12:00:00.000Z',
          venue: 'BAC Secretariat Hall',
          remarks: 'Mandatory for ABC >= 2M',
          status: 'COMPLETED',
        },
        {
          id: 'sched-2',
          procurementProjectId: mockResolution.id,
          procurementActivityTypeId: 'act-2',
          procurementActivityTypeName: 'Advertisement / Posting of IB',
          startDate: '2026-06-05T08:00:00.000Z',
          endDate: '2026-06-12T17:00:00.000Z',
          venue: 'PhilGEPS / Agency Portal',
          remarks: '7 calendar days min',
          status: 'COMPLETED',
        },
        {
          id: 'sched-3',
          procurementProjectId: mockResolution.id,
          procurementActivityTypeId: 'act-3',
          procurementActivityTypeName: 'Pre-Bid Conference',
          startDate: '2026-06-15T14:00:00.000Z',
          endDate: '2026-06-15T17:00:00.000Z',
          venue: 'Main BAC Conference Room & Zoom',
          remarks: 'Open to all prospective bidders',
          status: 'PENDING',
        },
        {
          id: 'sched-4',
          procurementProjectId: mockResolution.id,
          procurementActivityTypeId: 'act-4',
          procurementActivityTypeName: 'Submission & Opening of Bids',
          startDate: '2026-06-28T09:00:00.000Z',
          endDate: '2026-06-28T16:00:00.000Z',
          venue: 'BAC Secretariat Office',
          remarks: 'Public bid opening',
          status: 'PENDING',
        },
      ]

      return {
        title:
          context?.projectTitle ||
          mockResolution.description ||
          'Procurement Project',
        abc: context?.abc || mockResolution.totalAmount || 0,
        status: mockResolution.status,
        sourceType: mockResolution.sourceType || 'APP_ITEM',
        officeName:
          context?.officeName ||
          mockResolution.linkedConsolidatedPrs?.[0]?.endUser ||
          'ICT Office',
        modeOfProcurement:
          context?.modeOfProcurement ||
          mockResolution.linkedConsolidatedPrs?.[0]?.modeOfProcurement ||
          'Public Bidding',
        sourceOfFund:
          context?.sourceOfFund || 'GAA (General Appropriations Act)',
        bacResolutions: [
          {
            id: mockResolution.id,
            procurementProjectId: mockResolution.id,
            resolutionType: mockResolution.resolutionType || 'Standard',
            resolutionNumber: mockResolution.bacResolutionNumber,
            dateResolved: mockResolution.resolutionDate,
            status: mockResolution.status,
            whereasClause: mockResolution.whereasClauses
              .map((c) => `${c.name}: ${c.body}`)
              .join('\n\n'),
          },
        ],
        schedules: defaultSchedules,
        isApproved: mockResolution.status === 'approved',
        isPrCreated: mockResolution.isPrCreated,
        createdPrNumber: mockResolution.createdPrNumber,
      }
    }

    return null
  }, [apiData, mockResolution])

  const canCreatePr =
    details?.isApproved &&
    !details?.isPrCreated &&
    (mockResolution?.sourceType === 'APP_ITEM' || !mockResolution?.sourceType)

  const handleCreatePrClick = () => {
    if (mockResolution && onCreatePr) {
      onCreatePr(mockResolution)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="BAC Project & Resolution Details"
      description="Detailed overview of the BAC resolution, procurement context, and bidding activities."
      size="xl"
      showCloseButton
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2">
            {details?.isPrCreated ? (
              <Badge className="bg-emerald-600 text-white font-medium py-1 px-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                PR Created: {details.createdPrNumber}
              </Badge>
            ) : canCreatePr ? (
              <Button
                onClick={handleCreatePrClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                <FilePlus className="h-4 w-4" />
                Create Purchase Request (PR)
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {isLoading && !details ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading details...</p>
          </div>
        ) : details ? (
          <div className="space-y-6 text-sm">
            {/* Top Project Overview Card */}
            <div className="rounded-xl border border-default-200 bg-linear-to-r from-default-50 to-white p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-[70%]">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Procurement Project Title
                  </p>
                  <p className="font-bold text-foreground text-base">
                    {details.title}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    variant="outline"
                    className={`capitalize px-3 py-1 font-semibold ${
                      details.status.toLowerCase() === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : details.status.toLowerCase() === 'for-approval'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : details.status.toLowerCase() === 'returned'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-default-100 text-default-700 border-default-300'
                    }`}
                  >
                    {details.status}
                  </Badge>
                  {canCreatePr && (
                    <Button
                      size="sm"
                      onClick={handleCreatePrClick}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs h-7 px-2.5 mt-1"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                      Create PR
                    </Button>
                  )}
                </div>
              </div>

              {/* Context Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-default-100 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Implementing Unit
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{details.officeName}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Procurement Mode
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">
                      {details.modeOfProcurement}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Source of Fund
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{details.sourceOfFund}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Approved Budget (ABC)
                  </span>
                  <p className="font-bold text-emerald-700 text-sm">
                    ₱
                    {details.abc.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Resolutions Section */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-foreground text-base mb-3 border-b pb-1.5">
                <ScrollText className="h-4 w-4 text-primary" />
                BAC Resolution Clauses & Action
              </h4>
              {!details.bacResolutions?.length ? (
                <p className="text-muted-foreground italic bg-default-50 p-3 rounded-lg border border-dashed text-center">
                  No resolutions found for this project.
                </p>
              ) : (
                <div className="space-y-4">
                  {details.bacResolutions.map((res) => (
                    <div
                      key={res.id}
                      className="border border-default-200 rounded-xl p-4 space-y-3 bg-background"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                        <div>
                          <span className="font-bold text-foreground">
                            {res.resolutionNumber || 'N/A'}
                          </span>
                          <Badge className="ml-2" variant="secondary">
                            {res.resolutionType || 'Standard'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {res.dateResolved
                            ? new Date(res.dateResolved).toLocaleDateString(
                                'en-PH',
                                {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                },
                              )
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">
                          WHEREAS Clause Body & Recommendation
                        </p>
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-xs max-h-48 overflow-y-auto bg-default-50 p-3.5 rounded-lg border border-default-100 font-serif">
                          {res.whereasClause || 'No clauses specified.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bidding Activity Schedules Section */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-foreground text-base mb-3 border-b pb-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Bidding Activity Schedules & Timelines
              </h4>
              {!details.schedules?.length ? (
                <p className="text-muted-foreground italic bg-default-50 p-3 rounded-lg border border-dashed text-center">
                  No bidding schedules scheduled yet.
                </p>
              ) : (
                <TemplateTable<BiddingActivitySchedule>
                  title=""
                  description=""
                  columns={scheduleColumns}
                  data={details.schedules}
                  actions={[]}
                  readonly
                  fixedPageSize={details.schedules.length}
                  toolbar={() => null}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-default-50 text-muted-foreground text-sm text-center">
            No BAC resolution data available.
          </div>
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}
