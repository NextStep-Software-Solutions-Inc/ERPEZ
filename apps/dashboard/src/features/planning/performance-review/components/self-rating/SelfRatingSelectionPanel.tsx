import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Calendar, ChevronRight, FileText, PlayCircle } from 'lucide-react'

import type { OPCRReference } from '../../types'

function getCommitmentStatusBadge(status?: string) {
  const normalized = status?.toLowerCase() || 'draft'
  const badgeColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return {
    label: labelMap[normalized] || status || 'Draft',
    className: badgeColors[normalized] || 'bg-slate-100 text-slate-700 border-slate-200',
  }
}

function getReviewStatusBadge(status?: string | number | null) {
  let normalized = 'pending'
  
  if (status !== null && status !== undefined) {
    if (typeof status === 'number') {
      const statusMap: Record<number, string> = {
        0: 'pending',
        1: 'draft',
        2: 'submitted',
        3: 'returned',
        4: 'finalized',
      }
      normalized = statusMap[status] || 'pending'
    } else {
      const parsed = Number(status)
      if (!isNaN(parsed) && status.trim() !== '') {
        const statusMap: Record<number, string> = {
          0: 'pending',
          1: 'draft',
          2: 'submitted',
          3: 'returned',
          4: 'finalized',
        }
        normalized = statusMap[parsed] || 'pending'
      } else {
        normalized = status.toLowerCase()
      }
    }
  }

  const badgeColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    returned: 'bg-red-100 text-red-700 border-red-200',
    finalized: 'bg-green-100 text-green-700 border-green-200',
  }
  const labelMap: Record<string, string> = {
    pending: 'Pending',
    draft: 'Draft',
    submitted: 'Submitted',
    returned: 'Returned',
    finalized: 'Finalized',
  }
  return {
    label: labelMap[normalized] || 'Pending',
    className: badgeColors[normalized] || 'bg-amber-100 text-amber-700 border-amber-200',
  }
}

function isEvaluationViewOnly(opcr: OPCRReference) {
  if (opcr.selfRatingDone) return true
  const status = opcr.reviewStatus
  if (status === null || status === undefined) return false
  const reviewBadge = getReviewStatusBadge(status)
  const normalized = reviewBadge.label.toLowerCase()
  return normalized === 'submitted' || normalized === 'finalized'
}

interface SelfRatingSelectionPanelProps {
  fiscalYears: string[]
  deliveryUnits: Array<{ id: string; name: string }>
  filteredOpcrs: OPCRReference[]
  selectedFiscalYear: string
  selectedDeliveryUnitId: string
  selectedOpcr: OPCRReference | null
  onChangeFiscalYear: (value: string) => void
  onChangeDeliveryUnit: (value: string) => void
  onSelectOpcr: (opcr: OPCRReference) => void
  onStartEvaluation: () => void
}

export function SelfRatingSelectionPanel({
  fiscalYears,
  deliveryUnits,
  filteredOpcrs,
  selectedFiscalYear,
  selectedDeliveryUnitId,
  selectedOpcr,
  onChangeFiscalYear,
  onChangeDeliveryUnit,
  onSelectOpcr,
  onStartEvaluation,
}: SelfRatingSelectionPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Step A — Select Rating Period & OPCR
          </CardTitle>
          <CardDescription>
            Choose the fiscal year and delivery unit, then load the approved
            OPCR to begin your self-rating. The system will pre-fill your
            committed targets, KPIs, and activities from the planning layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fy" className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" /> Fiscal Year
              </Label>
              <Select
                value={selectedFiscalYear || '_all'}
                onValueChange={(value) =>
                  onChangeFiscalYear(value === '_all' ? '' : value)
                }
              >
                <SelectTrigger id="fy">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Fiscal Years</SelectItem>
                  {fiscalYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="du" className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5" /> Delivery Unit
              </Label>
              <Select
                value={selectedDeliveryUnitId || '_all'}
                onValueChange={(value) =>
                  onChangeDeliveryUnit(value === '_all' ? '' : value)
                }
              >
                <SelectTrigger id="du">
                  <SelectValue placeholder="Select delivery unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Units</SelectItem>
                  {deliveryUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              OPCRs ({filteredOpcrs.length} found)
            </Label>
            {filteredOpcrs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No approved OPCRs for selected criteria.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        OPCR Title
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Delivery Unit
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        KPIs
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Commitment Status
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Review Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpcrs.map((opcr) => {
                      const commitmentBadge = getCommitmentStatusBadge(opcr.commitmentStatus)
                      const reviewBadge = getReviewStatusBadge(opcr.reviewStatus)
                      return (
                        <tr
                          key={opcr.id}
                          onClick={() => onSelectOpcr(opcr)}
                          className={`border-t cursor-pointer transition-colors ${
                            selectedOpcr?.id === opcr.id
                              ? 'bg-primary/5'
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium">{opcr.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {opcr.deliveryUnitName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className="text-xs">
                              {opcr.kpiCount} KPIs
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant="outline"
                              className={`${commitmentBadge.className} text-xs`}
                            >
                              {commitmentBadge.label}
                            </Badge>
                          </td>
                           <td className="px-4 py-3 text-center">
                             <Badge
                               variant="outline"
                               className={`${reviewBadge.className} text-xs`}
                             >
                               {reviewBadge.label}
                             </Badge>
                           </td>
                           <td className="px-4 py-3 text-right">
                             <Button
                               size="sm"
                               variant={
                                 selectedOpcr?.id === opcr.id ? 'soft' : 'outline'
                               }
                               onClick={(e) => {
                                 e.stopPropagation()
                                 onSelectOpcr(opcr)
                               }}
                             >
                               {selectedOpcr?.id === opcr.id
                                 ? '✓ Selected'
                                 : isEvaluationViewOnly(opcr)
                                   ? 'View'
                                   : 'Select'}
                             </Button>
                           </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedOpcr && (
            <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{selectedOpcr.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedOpcr.kpiCount} KPI items · FY {selectedOpcr.fiscalYear}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`${getReviewStatusBadge(selectedOpcr.reviewStatus).className} text-xs`}
              >
                {getReviewStatusBadge(selectedOpcr.reviewStatus).label}
              </Badge>
              <Button onClick={onStartEvaluation} className="gap-2">
                <PlayCircle className="h-4 w-4" />
                {isEvaluationViewOnly(selectedOpcr)
                  ? 'View Evaluation'
                  : 'Start Evaluation'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
