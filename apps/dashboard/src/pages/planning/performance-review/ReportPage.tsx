/**
 * Performance Review – Step 4: Report Page
 * WYSIWYG-style OPCR preview with QET scores, final rating, adjectival.
 * Export to PDF uses hidden OPCR-form template.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Sheet, Info, Printer } from 'lucide-react'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import { AdjectivalBadge } from '@/features/planning/performance-review/components/AdjectivalBadge'
import { WorkflowStatusBadge } from '@/features/planning/performance-review/components/WorkflowStatusBadge'
import { OPCRSelectionRequired } from '@/features/planning/performance-review/components/OPCRSelectionRequired'
import { usePerformanceCalculation } from '@/features/planning/performance-review/hooks/usePerformanceCalculation'
import {
  KPI_CATEGORY_LABELS,
  KPI_CATEGORY_WEIGHTS,
  type KPICategory,
  type KPILineItem,
} from '@/features/planning/performance-review/types'

const CATEGORIES: KPICategory[] = ['STRATEGIC', 'CORE', 'SUPPORT']

function formatScore(value: number | null) {
  return value === null ? '—' : value.toFixed(2)
}

function SignLine({ name, role }: { name: string, role: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">{role}</p>
      <div className="h-6 border-b border-black" />
      <p className="text-[11px] font-semibold uppercase tracking-wide">{name}</p>
      <p className="text-[10px] text-muted-foreground">Date:</p>
    </div>
  )
}

export default function ReportPage() {
  const { currentSession } = usePerformanceReviewStore()
  const calc = usePerformanceCalculation(currentSession)

  if (!currentSession) {
    return <OPCRSelectionRequired />
  }

  const groupedKPIs = useMemo(() => {
    const groups: Record<KPICategory, KPILineItem[]> = { STRATEGIC: [], CORE: [], SUPPORT: [] }
    for (const item of currentSession.kpiItems) {
      groups[item.category].push(item)
    }
    return groups
  }, [currentSession.kpiItems])

  const useRating: 'self' | 'final' =
    currentSession.status === 'FINALIZED'
      ? 'final'
      : 'self'

  const printableSections = CATEGORIES
    .map(category => ({
      category,
      items: groupedKPIs[category],
    }))
    .filter(section => section.items.length > 0)

  const finalScore = calc.finalRatingScore.final ?? calc.finalRatingScore.self
  const adjRating = calc.adjectivalRating.final ?? calc.adjectivalRating.self

  const handleExportPDF = () => {
    const report = document.getElementById('pr-report-print')
    if (!report) return

    const printWindow = window.open('', '_blank', 'width=1400,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>OPCR Report - ${currentSession.deliveryUnitName} FY ${currentSession.fiscalYear}</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              background: #fff;
              font-size: 11px;
            }
            .print-container {
              width: 100%;
            }
            .opcr-page {
              width: 100%;
              margin: 0 auto;
              page-break-inside: avoid;
            }
            .opcr-page-break {
              page-break-before: always;
              margin-top: 10mm;
            }
            .opcr-title {
              text-align: center;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 15px;
              margin: 0;
            }
            .opcr-subtitle {
              text-align: center;
              font-size: 14px;
              font-weight: 700;
              margin: 2px 0 12px;
            }
            .opcr-intro {
              line-height: 1.4;
              margin: 6px 0 14px;
            }
            .opcr-grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 18px;
              margin-bottom: 12px;
            }
            .opcr-sign-role {
              font-size: 11px;
              margin-bottom: 18px;
            }
            .opcr-sign-line {
              border-bottom: 1px solid #000;
              min-height: 14px;
              margin-bottom: 2px;
            }
            .opcr-sign-name {
              font-weight: 700;
              text-transform: uppercase;
              font-size: 11px;
            }
            .opcr-sign-date {
              margin-top: 2px;
              font-size: 11px;
            }
            .opcr-rating-legend {
              border: 1px solid #000;
              padding: 5px 8px;
              margin-top: 8px;
              font-size: 11px;
              line-height: 1.4;
            }
            .opcr-table-wrap {
              border: 1px solid #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              vertical-align: top;
              font-size: 10px;
              padding: 4px 5px;
            }
            th { font-weight: 700; }
            .opcr-center { text-align: center; }
            .opcr-right { text-align: right; }
            .opcr-bold { font-weight: 700; }
            .opcr-section-row td {
              font-weight: 700;
              text-transform: none;
              background: #fff;
            }
            .opcr-legend {
              margin-top: 10px;
              font-size: 11px;
              font-style: italic;
            }
            .opcr-grid-bottom {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 36px;
            }
            .opcr-bottom-left {
              display: flex;
              flex-direction: column;
              gap: 30px;
            }
            .opcr-bottom-mid {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }
            .opcr-bottom-right {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }
            tr, td, th { page-break-inside: avoid; }
            .text-muted-foreground,
            .text-primary,
            .bg-muted\/20,
            .bg-muted\/30,
            .bg-muted\/40,
            .bg-muted\/50,
            .bg-primary\/10,
            .border-primary\/20 {
              color: #000 !important;
              background: transparent !important;
              border-color: #000 !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">${report.innerHTML}</div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportExcel = () => {
    // Placeholder – wire to xlsx library in production
    alert('Excel export coming soon. Connect to xlsx / sheetjs library.')
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">OPCR Performance Report</h2>
          <p className="text-sm text-muted-foreground">
            {currentSession.deliveryUnitName} · FY {currentSession.fiscalYear}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
            <Printer className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
            <Sheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* ── On-screen UI (restored) ── */}
      <Card id="pr-report-preview" className="print:shadow-none print:border-0">
        <CardContent className="p-6 space-y-8">
          {/* Report Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              Office Performance Commitment and Review (OPCR)
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentSession.deliveryUnitName} — Fiscal Year {currentSession.fiscalYear}
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <WorkflowStatusBadge status={currentSession.status} />
              {currentSession.finalizedAt && (
                <span className="text-xs text-muted-foreground">
                  Finalized: {new Date(currentSession.finalizedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* KPI Sections */}
          {CATEGORIES.map(category => {
            const items = groupedKPIs[category]
            if (items.length === 0) return null
            const weight = KPI_CATEGORY_WEIGHTS[category]
            const catAvg = (useRating === 'final' ? calc.categoryAverages.final : calc.categoryAverages.self)[category]

            return (
              <div key={category} className="space-y-3">
                {/* Category header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {KPI_CATEGORY_LABELS[category]}
                    <span className="ml-2 normal-case text-xs">(Weight: {(weight * 100).toFixed(0)}%)</span>
                  </h3>
                  {catAvg !== null && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                      Category Avg: {catAvg.toFixed(2)}
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs">
                        <TableHead className="py-2">Success Indicator</TableHead>
                        <TableHead className="py-2 text-center">Actual</TableHead>
                        <TableHead className="py-2 text-center">Q</TableHead>
                        <TableHead className="py-2 text-center">E</TableHead>
                        <TableHead className="py-2 text-center">T</TableHead>
                        <TableHead className="py-2 text-center">Average</TableHead>
                        <TableHead className="py-2 text-center">MOV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => {
                        const rating = item[useRating === 'final' ? 'finalRating' : 'selfRating']
                        const effectiveRating = (rating.average !== null) ? rating : item.selfRating

                        return (
                          <TableRow key={item.id} className="text-xs align-top">
                            <TableCell className="py-2 max-w-[220px]">
                              <p className="font-medium text-sm leading-tight">{item.successIndicator}</p>
                            </TableCell>
                            <TableCell className="py-2 text-center">{item.actual || '—'}</TableCell>
                            <TableCell className="py-2 text-center">
                              {item.tags.includes('quality') ? (effectiveRating.quality?.toFixed(1) ?? '—') : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.tags.includes('efficiency') ? (effectiveRating.efficiency?.toFixed(1) ?? '—') : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.tags.includes('timeliness') ? (effectiveRating.timeliness?.toFixed(1) ?? '—') : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="py-2 text-center font-semibold text-primary">
                              {effectiveRating.average?.toFixed(2) ?? '—'}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.movFiles.length > 0 ? (
                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                  {item.movFiles.length} file{item.movFiles.length > 1 ? 's' : ''}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-[10px]">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })}

          <Separator />

          {/* Final Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Summary of Ratings</h3>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Function</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Weight</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Average</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => {
                    const weight = KPI_CATEGORY_WEIGHTS[cat]
                    const catAvg = (useRating === 'final' ? calc.categoryAverages.final : calc.categoryAverages.self)[cat]
                    const weighted = catAvg !== null ? catAvg * weight : null

                    return (
                      <tr key={cat} className="border-t">
                        <td className="px-3 py-2">{KPI_CATEGORY_LABELS[cat]}</td>
                        <td className="px-3 py-2 text-center">{(weight * 100).toFixed(0)}%</td>
                        <td className="px-3 py-2 text-center font-medium">{catAvg?.toFixed(2) ?? '—'}</td>
                        <td className="px-3 py-2 text-center font-semibold text-primary">{weighted?.toFixed(2) ?? '—'}</td>
                      </tr>
                    )
                  })}
                  <tr className="border-t bg-muted/30">
                    <td colSpan={3} className="px-3 py-2 font-bold text-right">Final Rating Score</td>
                    <td className="px-3 py-2 text-center font-black text-xl text-primary">{finalScore?.toFixed(2) ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Adjectival rating */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/20 p-6">
              <p className="text-sm text-muted-foreground">Overall Performance Rating</p>
              <p className="text-5xl font-black text-primary">{finalScore?.toFixed(2) ?? '—'}</p>
              <AdjectivalBadge rating={adjRating} />

              {currentSession.rateeName && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Ratee: <strong>{currentSession.rateeName}</strong>
                </p>
              )}
              {currentSession.finalizedBy && (
                <p className="text-xs text-muted-foreground">
                  Finalized by: <strong>{currentSession.finalizedBy}</strong>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Hidden print template used only for Export PDF ── */}
      <div id="pr-report-print" className="hidden">
        <div className="opcr-page">
          <h1 className="opcr-title">Office Performance Commitment and Review (OPCR)</h1>
          <p className="opcr-subtitle">FY {currentSession.fiscalYear}</p>

          <p className="opcr-intro">
            I, <span className="opcr-bold">{currentSession.rateeName || '________________________'}</span> of <span className="opcr-bold">{currentSession.deliveryUnitName}</span>, hereby declare that I have attained the following targets in accordance with the indicated measures.
          </p>

          <div className="opcr-grid-3">
            <div>
              <p className="opcr-sign-role">Submitted by:</p>
              <div className="opcr-sign-line" />
              <p className="opcr-sign-name">{currentSession.rateeName || 'Delivery Unit Head'}</p>
              <p className="opcr-sign-date">Date:</p>
            </div>
            <div>
              <p className="opcr-sign-role">Recommending Approval:</p>
              <div className="opcr-sign-line" />
              <p className="opcr-sign-name">Concerned Campus Vice President / Chancellor</p>
              <p className="opcr-sign-date">Date:</p>
            </div>
            <div>
              <p className="opcr-sign-role">Approved by:</p>
              <div className="opcr-sign-line" />
              <p className="opcr-sign-name">President / Concerned Chancellor</p>
              <p className="opcr-sign-date">Date:</p>
              <div className="opcr-rating-legend">
                <div>5 - Outstanding</div>
                <div>4 - Very Satisfactory</div>
                <div>3 - Satisfactory</div>
                <div>2 - Unsatisfactory</div>
                <div>1 - Poor</div>
              </div>
            </div>
          </div>

          <div className="opcr-table-wrap">
            <table>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '3.5%' }} />
                <col style={{ width: '3.5%' }} />
                <col style={{ width: '3.5%' }} />
                <col style={{ width: '3.5%' }} />
                <col style={{ width: '10.5%' }} />
                <col style={{ width: '16.5%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2}>SDA / Goals / PREXC</th>
                  <th rowSpan={2}>KPI</th>
                  <th rowSpan={2} className="opcr-center">Annual Target</th>
                  <th rowSpan={2} className="opcr-center">Actual Accomplishment</th>
                  <th colSpan={4} className="opcr-center">Rating</th>
                  <th rowSpan={2} className="opcr-center">Mode of Verification</th>
                  <th rowSpan={2} className="opcr-center">Remarks/Justification<br />(Use separate sheet if necessary)</th>
                </tr>
                <tr>
                  <th className="opcr-center">Q</th>
                  <th className="opcr-center">E</th>
                  <th className="opcr-center">T</th>
                  <th className="opcr-center">Ave</th>
                </tr>
              </thead>
              <tbody>
                {printableSections.map((section, sectionIndex) => (
                  <>
                    <tr key={`${section.category}-section`} className="opcr-section-row">
                      <td colSpan={10}>
                        {sectionIndex === 0 ? 'I.' : sectionIndex === 1 ? 'II.' : 'III.'}{' '}
                        {section.category === 'SUPPORT' ? 'Mandatory Support Functions' : KPI_CATEGORY_LABELS[section.category]}{' '}
                        ({(KPI_CATEGORY_WEIGHTS[section.category] * 100).toFixed(0)}%)
                      </td>
                    </tr>
                    {section.items.map(item => {
                      const rating = item[useRating === 'final' ? 'finalRating' : 'selfRating']
                      const effectiveRating = rating.average !== null ? rating : item.selfRating

                      return (
                        <tr key={item.id}>
                          <td>{item.functionDescription || ''}</td>
                          <td>{item.successIndicator}</td>
                          <td className="opcr-center">
                            {item.targetInfo?.assignedTargetAnnual !== null && item.targetInfo?.assignedTargetAnnual !== undefined
                              ? item.targetInfo.assignedTargetAnnual
                              : '—'}
                          </td>
                          <td className="opcr-center">{item.actual || '—'}</td>
                          <td className="opcr-center">{item.tags.includes('quality') ? formatScore(effectiveRating.quality) : ''}</td>
                          <td className="opcr-center">{item.tags.includes('efficiency') ? formatScore(effectiveRating.efficiency) : ''}</td>
                          <td className="opcr-center">{item.tags.includes('timeliness') ? formatScore(effectiveRating.timeliness) : ''}</td>
                          <td className="opcr-center opcr-bold">{formatScore(effectiveRating.average)}</td>
                          <td className="opcr-center">
                            {item.movFiles.length > 0 ? `${item.movFiles.length} file${item.movFiles.length > 1 ? 's' : ''}` : '—'}
                          </td>
                          <td>{item.justification || '—'}</td>
                        </tr>
                      )
                    })}
                  </>
                ))}

                {printableSections.map((section, index) => (
                  <tr key={`${section.category}-summary`}>
                    <td className="opcr-right opcr-bold" colSpan={7}>
                      {index === 0 ? 'I.' : index === 1 ? 'II.' : 'III.'}{' '}
                      {section.category === 'SUPPORT' ? 'Mandatory Support Functions' : KPI_CATEGORY_LABELS[section.category]}{' '}
                      ({(KPI_CATEGORY_WEIGHTS[section.category] * 100).toFixed(0)}%)
                    </td>
                    <td className="opcr-center opcr-bold">{formatScore(calc.categoryAverages[useRating][section.category])}</td>
                    <td colSpan={2} />
                  </tr>
                ))}

                <tr>
                  <td className="opcr-right opcr-bold" colSpan={7}>FINAL RATING</td>
                  <td className="opcr-center opcr-bold">{formatScore(finalScore)}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>

          <p className="opcr-legend">
            Legend: Q - Quantity, E - Efficiency, T - Timeliness, Ave - Average
          </p>

          <div className="opcr-page-break" />

          <div className="opcr-grid-bottom">
            <div className="opcr-bottom-left">
              <div>
                <p className="opcr-sign-role">Assessed by:</p>
                <div className="opcr-sign-line" />
                <p className="opcr-sign-name">Cluster Presiding Officer, PMT</p>
                <p className="opcr-sign-date">Date:</p>
              </div>
              <div>
                <p className="opcr-sign-role">Assisted by:</p>
                <div className="opcr-sign-line" />
                <p className="opcr-sign-name">Member, PMT</p>
                <p className="opcr-sign-date">Date:</p>
              </div>
            </div>

            <div className="opcr-bottom-mid">
              <div>
                <p className="opcr-sign-role">Reviewed by:</p>
                <div className="opcr-sign-line" />
                <p className="opcr-sign-name">PMT Chairman</p>
                <p className="opcr-sign-date">Date:</p>
              </div>
              <div>
                <div className="opcr-sign-line" />
                <p className="opcr-sign-name">PMT Co-Chairman</p>
                <p className="opcr-sign-date">Date:</p>
              </div>
            </div>

            <div className="opcr-bottom-right">
              <div>
                <p className="opcr-sign-role">Final Rating by:</p>
                <div className="opcr-sign-line" />
                <p className="opcr-sign-name">Head of the Agency</p>
                <p className="opcr-sign-date">Date:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
