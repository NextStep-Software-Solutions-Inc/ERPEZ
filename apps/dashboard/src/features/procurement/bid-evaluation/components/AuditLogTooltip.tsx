import { Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ComplianceEvent } from '../types';

interface AuditLogTooltipProps {
  complianceEvents: ComplianceEvent[];
  lcbNoticeSentDate?: string;
  postQualDocsReceivedDate?: string;
}

export function AuditLogTooltip({
  complianceEvents,
  lcbNoticeSentDate,
  postQualDocsReceivedDate,
}: AuditLogTooltipProps) {
  const formatDate = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'MMM dd, yyyy hh:mm:ss a');
    } catch {
      return isoString;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-muted-foreground hover:text-default-900 transition-colors focus:outline-none p-1 rounded-full hover:bg-default-100">
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent color="secondary" className="max-w-sm p-4 text-xs shadow-xl border border-default-200">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm border-b border-default-100 pb-1 text-default-950">
              Audit Trail & Compliance Log
            </h4>

            {/* Structured Milestones */}
            <div className="grid grid-cols-2 gap-2 text-default-700 bg-default-50 p-2 rounded border border-default-150">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">
                  LCB Notice Sent
                </p>
                <p className="font-medium">
                  {lcbNoticeSentDate ? formatDate(lcbNoticeSentDate) : 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">
                  Docs Received
                </p>
                <p className="font-medium">
                  {postQualDocsReceivedDate ? formatDate(postQualDocsReceivedDate) : 'Pending'}
                </p>
              </div>
            </div>

            {/* Timeline of events */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Event History ({complianceEvents.length})
              </p>
              {complianceEvents.length === 0 ? (
                <p className="text-muted-foreground italic text-center py-2">
                  No events recorded yet.
                </p>
              ) : (
                <div className="relative border-l border-default-200 pl-3 ml-1.5 space-y-3">
                  {complianceEvents.map((event, idx) => {
                    const isAlert =
                      event.type === 'BIDDER_SLA_EXPIRED' || event.type === 'BAC_SLA_EXPIRED';
                    return (
                      <div key={idx} className="relative">
                        {/* Timeline Bullet */}
                        <div
                          className={`absolute -left-[16.5px] top-1 h-2 w-2 rounded-full border ${
                            isAlert
                              ? 'bg-destructive border-destructive shadow-sm'
                              : 'bg-primary border-primary'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-semibold text-[10px] uppercase ${
                                isAlert ? 'text-destructive' : 'text-primary'
                              }`}
                            >
                              {event.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-default-700 leading-normal text-[11px]">
                            {event.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
