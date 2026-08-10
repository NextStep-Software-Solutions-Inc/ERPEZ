import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { TemplateTable } from '@/components/TemplateTable'
import { useBackendProjectDetails } from '../handlers/hooks'
import type { BiddingActivitySchedule } from '../handlers/getBackendProjectDetailsRequest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ScrollText, Calendar } from 'lucide-react'

interface ViewBacResolutionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolutionId?: string | null
}

export function ViewBacResolutionDetailsDialog({
  open,
  onOpenChange,
  resolutionId,
}: ViewBacResolutionDetailsDialogProps) {
  const scheduleColumns = useMemo(
    () => [
      {
        accessorKey: 'procurementActivityTypeName',
        header: 'Activity Type',
        cell: (info: any) => info.getValue() || 'N/A',
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
        cell: (info: any) => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: (info: any) => info.getValue() || 'N/A',
      },
    ],
    [],
  )

  const { data, isLoading, error } = useBackendProjectDetails({
    pathParams: { id: resolutionId || '' },
    enabled: open && !!resolutionId,
  })

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="BAC Project & Resolution Details"
      description="Detailed overview of the BAC resolution and its associated bidding activity schedules."
      size="xl"
      showCloseButton
      footer={
        <div className="flex justify-end w-full">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading details from backend...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error instanceof Error ? error.message : 'Failed to load project details.'}
          </div>
        ) : data ? (
          <div className="space-y-6 text-sm">
            {/* Project Overview */}
            <div className="grid gap-4 md:grid-cols-3 bg-muted/20 p-4 rounded-xl border border-default-200">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Title</p>
                <p className="font-semibold text-foreground text-base mt-0.5">{data.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved Budget (ABC)</p>
                <p className="font-semibold text-foreground text-base mt-0.5">
                  ₱{data.abc ? data.abc.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    color={data.status?.toLowerCase() === 'draft' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {data.status || 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Resolutions Section */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-foreground text-base mb-3 border-b pb-1.5">
                <ScrollText className="h-5 w-5 text-primary" />
                BAC Resolutions
              </h4>
              {!data.bacResolutions?.length ? (
                <p className="text-muted-foreground italic bg-default-50 p-3 rounded-lg border border-dashed text-center">
                  No resolutions found for this project.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.bacResolutions.map((res) => (
                    <div key={res.id} className="border border-default-200 rounded-xl p-4 space-y-3 bg-background">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                        <div>
                          <span className="font-semibold text-foreground">{res.resolutionNumber || 'N/A'}</span>
                          <Badge className="ml-2" variant="soft" color="secondary">
                            {res.resolutionType || 'Standard'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {res.dateResolved ? new Date(res.dateResolved).toLocaleDateString('en-PH', {
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">WHEREAS Clause Body</p>
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-xs max-h-40 overflow-y-auto bg-default-50 p-3 rounded-lg border border-default-100">
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
                <Calendar className="h-5 w-5 text-primary" />
                Bidding Activity Schedules
              </h4>
              {!data.biddingActivitySchedules?.length ? (
                <p className="text-muted-foreground italic bg-default-50 p-3 rounded-lg border border-dashed text-center">
                  No bidding schedules scheduled yet.
                </p>
              ) : (
                <TemplateTable<BiddingActivitySchedule>
                  title=""
                  description=""
                  columns={scheduleColumns}
                  data={data.biddingActivitySchedules}
                  actions={[]}
                  readonly
                  fixedPageSize={data.biddingActivitySchedules.length}
                  toolbar={() => null}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ResponsiveDialogDashtail>
  )
}
