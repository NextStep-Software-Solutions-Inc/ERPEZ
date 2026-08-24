import { useState } from 'react'
import {
  FileText,
  ScrollText,
  ShieldCheck,
  Users,
  Send,
  Printer,
  Sparkles,
  Layers,
  FilePlus,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BacResolutionStatusBadge } from './index'
import type {
  BacResolutionRole,

} from '../types'
import { useBacResolution } from '../handlers/hooks'

interface DetailsPanelProps {
  selectedId: string | null
  role: BacResolutionRole
  isLoading?: boolean
  onLinkPrs?: () => void
  onPrint?: () => void | Promise<void>
  onSubmit?: () => void | Promise<void>
  onViewDocument?: () => void
  onCreatePr?: () => void
}

export function DetailsPanel({
  selectedId,
  role,
  isLoading = false,
  onPrint,
  onSubmit,
  onViewDocument,
  onCreatePr,
}: DetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: responseData, isPending: isFetching } = useBacResolution(
    {
      pathParams: { id: selectedId || '' },
      queryParams: {},
      enabled: !!selectedId
    },

  )

  if (!selectedId) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/50 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <ScrollText className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-foreground">No BAC Resolution Selected</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select a BAC resolution from the queue on the left to view its complete
              specifications, WHEREAS clauses, signatories, linked PRs, and audit trail.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isFetching) {
    return (
      <Card className="border border-default-200 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <div className="space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Loading BAC Project details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedProject = responseData?.data || (responseData as any)

  if (!selectedProject) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/50 shadow-sm h-full">
        <CardContent className="flex min-h-[500px] items-center justify-center p-8 text-center">
          <p className="text-xs text-muted-foreground">Project details not found.</p>
        </CardContent>
      </Card>
    )
  }

  const title =
    selectedProject.title ||
    selectedProject.APPItem?.ppmpItemName ||
    selectedProject.consolidatedPR?.projectName ||
    'Procurement Project'
  const status = selectedProject.status || 'draft'
  const resolutionNumber = selectedProject.resolutionNumber || 'Unassigned'
  const abc = selectedProject.abc || 0
  const isDraft = status === 'draft'
  const isApproved = status === 'approved'
  const isReturned = status === 'returned'

  const officeName =
    selectedProject.APPItem?.officeName ||
    selectedProject.consolidatedPR?.endUser ||
    'N/A'
  const procurementMode =
    selectedProject.APPItem?.procurementModeName ||
    selectedProject.consolidatedPR?.modeOfProcurement ||
    'N/A'
  const fundSource = selectedProject.APPItem?.fundSourceName || 'GAA'

  const endUserRep = selectedProject.endUserRepresentative
    ? `${selectedProject.endUserRepresentative.firstName} ${selectedProject.endUserRepresentative.lastName}`
    : 'N/A'
  const techRep = selectedProject.techRepresentative
    ? `${selectedProject.techRepresentative.firstName} ${selectedProject.techRepresentative.lastName}`
    : 'N/A'

  return (
    <div className="space-y-4">
      {/* Sticky Top Header Banner */}
      <Card className="border border-default-200 shadow-sm bg-linear-to-r from-default-50 to-white">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-primary flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {resolutionNumber}
                </span>
                <BacResolutionStatusBadge status={status as any} />
              </div>
              <h2 className="text-lg font-bold text-foreground line-clamp-2">
                {title}
              </h2>
            </div>

            {/* Quick Actions in Header Banner */}
            <div className="flex flex-wrap items-center gap-2">
              {isApproved && onCreatePr && (
                <Button
                  size="sm"
                  onClick={onCreatePr}
                  disabled={isLoading}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                  Create PR
                </Button>
              )}

              {onViewDocument && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewDocument}
                  disabled={isLoading}
                  className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Preview Doc
                </Button>
              )}

              {onPrint && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPrint}
                  disabled={isLoading}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print PDF
                </Button>
              )}

              {role === 'procurement-staff' && (isDraft || isReturned) && onSubmit && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit for Approval
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-default-100 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Approved Budget (ABC)
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Implementing Unit
              </span>
              <span className="font-medium text-foreground truncate block">
                {officeName}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Procurement Mode
              </span>
              <span className="font-semibold text-primary truncate block">
                {procurementMode}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Source of Fund
              </span>
              <span className="font-medium text-foreground truncate block">
                {fundSource}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 5 Structured Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-default-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs py-2">
            <Sparkles className="h-3.5 w-3.5" />
            Overview & Actions
          </TabsTrigger>
          <TabsTrigger value="source" className="gap-1.5 text-xs py-2">
            <Layers className="h-3.5 w-3.5" />
            Procurement Source
          </TabsTrigger>
          <TabsTrigger value="representatives" className="gap-1.5 text-xs py-2">
            <Users className="h-3.5 w-3.5" />
            Representatives
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & ACTIONS */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Resolution Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-default-100">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Number</span>
                    <span className="font-bold text-foreground">{resolutionNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Resolution Type</span>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">
                      {selectedProject.resolutionType || 'Standard'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Resolved Date & Location</span>
                  <p className="font-medium text-foreground">
                    {selectedProject.dateResolved
                      ? new Date(selectedProject.dateResolved).toLocaleDateString()
                      : 'N/A'}{' '}
                    at {selectedProject.resolvedLocation || 'BAC Office'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Approval & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1 pb-2 border-b border-default-100">
                  <span className="text-muted-foreground block text-[11px]">Current Status</span>
                  <div className="flex items-center gap-2 font-semibold">
                    <BacResolutionStatusBadge status={status as any} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PROCUREMENT SOURCE */}
        <TabsContent value="source" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Authoritative Procurement Source Information
                </CardTitle>
                <Badge className="bg-primary text-white text-[10px]">
                  {selectedProject.sourceType === 'APPItem' ? 'APP Item' : 'Consolidated PR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-default-50 border border-default-200">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Office / Unit</span>
                  <span className="font-semibold text-foreground text-sm">
                    {officeName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Procurement Mode</span>
                  <span className="font-semibold text-primary text-sm">
                    {procurementMode}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Source of Fund</span>
                  <span className="font-semibold text-foreground text-sm">
                    {fundSource}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Approved Budget (ABC)</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-default-200 p-3 bg-white space-y-1">
                <p className="font-bold text-default-900">{title}</p>
                <p className="text-muted-foreground text-[11px]">
                  Full Allocation: ₱{abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REPRESENTATIVES */}
        <TabsContent value="representatives" className="space-y-4">
          <Card className="border border-default-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Designated Representatives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">
                    End-User Representative
                  </span>
                  <p className="font-bold text-default-900">{endUserRep}</p>
                  {selectedProject.endUserRepresentative?.email && (
                    <p className="text-muted-foreground text-[11px]">
                      {selectedProject.endUserRepresentative.email}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">
                    Technical Representative
                  </span>
                  <p className="font-bold text-default-900">{techRep}</p>
                  {selectedProject.techRepresentative?.email && (
                    <p className="text-muted-foreground text-[11px]">
                      {selectedProject.techRepresentative.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DetailsPanel
