import {
  FileText,
  User,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useBacResolution } from '@/features/procurement/bac-resolution/handlers/hooks'
import { formatCurrencyPHP, formatDateV2 } from '@/utils/formatters'
import { extractErrorMessage } from '@/services/utils/messages'
import type { AxiosError } from 'erpez-shared-lib'

export interface BacProjectTabProps {
  bacProjectId: string
  fallbackTitle?: string
  fallbackAbc?: number
}

export function BacProjectTab({
  bacProjectId,
  fallbackTitle,
  fallbackAbc = 0,
}: BacProjectTabProps) {
  const {
    data: bacProjectResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useBacResolution({
    pathParams: { id: bacProjectId },
    queryParams: {},
    enabled: !!bacProjectId,
  })

  const bacProject = bacProjectResponse?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !bacProject) {
    return (
      <Card className="shadow-sm p-6 text-center text-sm border-dashed">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        <h4 className="font-semibold text-foreground mb-1">
          Unable to Load BAC Project Information
        </h4>
        <p className="text-muted-foreground mb-4 text-xs">
          {error
            ? extractErrorMessage(error as AxiosError)
            : `Could not retrieve details for BAC Project ID: ${bacProjectId || 'N/A'}`}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Retry Fetching
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* BAC Project Overview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">
                BAC Procurement Project Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Project metadata and procurement timeline
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Resolution Reference
            </span>
            <p className="font-mono font-bold text-foreground">
              {bacProject.resolutionNumber || fallbackTitle || 'BAC Project Ref'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Project Title
            </span>
            <p className="font-semibold text-foreground">
              {bacProject.title || fallbackTitle}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Approved Budget (ABC)
            </span>
            <p className="font-mono font-bold text-primary">
              {formatCurrencyPHP(bacProject.abc || fallbackAbc)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Source Type & Status
            </span>
            <p className="font-medium text-foreground capitalize">
              {bacProject.sourceType || 'APP Item'} • {bacProject.status || 'Active'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* BAC Resolution & Justification Details */}
      {bacProject.bacResolutions && bacProject.bacResolutions.length > 0 ? (
        bacProject.bacResolutions.map((res, idx) => (
          <Card key={res.id || idx} className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    BAC Resolution #{res.resolutionNumber || res.bacResolutionNumber || 'Direct Contracting Resolution'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Resolved on {res.dateResolved ? formatDateV2(res.dateResolved) : '—'} at{' '}
                    {res.resolvedLocation || 'BAC Secretariat Office'}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {res.resolutionType || 'Direct Contracting Recommendation'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {/* Representatives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg border text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      End-User Representative
                    </span>
                    <span className="font-semibold text-foreground">
                      {res.endUserRepresentative
                        ? `${res.endUserRepresentative.firstName} ${res.endUserRepresentative.lastName}`
                        : 'Assigned End-User'}
                    </span>
                    {res.endUserRepresentative?.email && (
                      <span className="text-xs text-muted-foreground block">
                        {res.endUserRepresentative.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Technical Representative
                    </span>
                    <span className="font-semibold text-foreground">
                      {res.techRepresentative
                        ? `${res.techRepresentative.firstName} ${res.techRepresentative.lastName}`
                        : 'Assigned Tech Specialist'}
                    </span>
                    {res.techRepresentative?.email && (
                      <span className="text-xs text-muted-foreground block">
                        {res.techRepresentative.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Whereas Clauses / Statutory Justification */}
              {res.whereasClauses && res.whereasClauses.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Legal Basis & Whereas Clauses (RA 12009 Rule XVI)
                  </h4>
                  <div className="space-y-2">
                    {res.whereasClauses.map((clause, cIdx) => (
                      <div
                        key={clause.id || cIdx}
                        className="p-3 bg-background border rounded-md text-xs space-y-1"
                      >
                        {clause.name && (
                          <span className="font-semibold text-primary block">
                            {clause.name}
                          </span>
                        )}
                        <p className="text-muted-foreground leading-relaxed">
                          {clause.body || 'Statutory justification for proprietary procurement source.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="shadow-sm p-6 text-center text-muted-foreground text-sm">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          <p>No specific BAC Resolution clauses attached to this project.</p>
        </Card>
      )}

      {/* Linked Annual Procurement Plan (APP) Items Table */}
      {bacProject.appItemLinks && bacProject.appItemLinks.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-semibold">
              Linked Annual Procurement Plan (APP) Line Items
            </CardTitle>
            <CardDescription className="text-xs">
              Official budgetary line items earmarked for this procurement project
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-xs">Item #</TableHead>
                    <TableHead className="font-semibold text-xs">Description</TableHead>
                    <TableHead className="font-semibold text-xs">Office</TableHead>
                    <TableHead className="font-semibold text-xs">APP Ref</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Effective ABC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bacProject.appItemLinks.map((appItem, idx) => (
                    <TableRow key={appItem.id || idx}>
                      <TableCell className="font-mono text-xs font-medium">
                        {appItem.itemNumber || idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {appItem.description}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {appItem.officeName || '—'}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {appItem.appNumber || appItem.appName || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground">
                        {formatCurrencyPHP(appItem.effectiveABC || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
