/**
 * Performance Review – Step 2: Ratee Workspace
 * Self-rating page: grouped KPIs, QET inputs, MOV upload, justification, submit.
 * Aligns with Procurement Library table patterns.
 */

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Send, AlertTriangle, Info } from 'lucide-react'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import { QETInputRow } from '@/features/planning/performance-review/components/QETInputRow'
import { MOVUploader } from '@/features/planning/performance-review/components/MOVUploader'
import { WorkflowStatusBadge } from '@/features/planning/performance-review/components/WorkflowStatusBadge'
import { usePerformanceCalculation } from '@/features/planning/performance-review/hooks/usePerformanceCalculation'
import { useKeycloak } from '@/providers/KeycloakProvider'
import {
  KPI_CATEGORY_LABELS,
  type KPICategory,
  type KPILineItem,
} from '@/features/planning/performance-review/types'

const CATEGORIES: KPICategory[] = ['STRATEGIC', 'CORE', 'SUPPORT']

export default function RateeWorkspacePage() {
  const { keycloak, userName, email, firstName, lastName } = useKeycloak()
  const currentUser = useMemo(() => {
    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()

    return {
      id: keycloak?.subject ?? email ?? userName ?? 'current-user',
      name: displayName || userName || email || 'Current User',
    }
  }, [email, firstName, keycloak?.subject, lastName, userName])

  const {
    currentSession,
    updateSelfRating,
    updateActual,
    updateJustification,
    addMOVFile,
    removeMOVFile,
    submitForReview,
  } = usePerformanceReviewStore()

  const calc = usePerformanceCalculation(currentSession)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const groupedKPIs = useMemo(() => {
    const groups: Record<KPICategory, KPILineItem[]> = {
      STRATEGIC: [],
      CORE: [],
      SUPPORT: [],
    }
    if (!currentSession) return groups

    for (const item of currentSession.kpiItems) {
      groups[item.category].push(item)
    }
    return groups
  }, [currentSession?.kpiItems])

  if (!currentSession) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Info className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p>
            No active evaluation session. Go back to Step 1 and select an OPCR.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isReadOnly =
    currentSession.status !== 'OPEN_FOR_RATING' &&
    currentSession.status !== 'REJECTED_FOR_REVISION'

  const validateAndSubmit = () => {
    // Guard: all KPIs must have at least one rating dimension filled
    const incomplete = currentSession.kpiItems.filter((item) => {
      const avg = calc.kpiAverages[item.id]?.self
      return avg === null
    })
    if (incomplete.length > 0) {
      setSubmitError(
        `Please complete ratings for: ${incomplete.map((i) => i.successIndicator).join(', ')}`,
      )
      return
    }

    // Guard: all KPIs must have at least 1 MOV
    const missingMov = currentSession.kpiItems.filter(
      (i) => i.movFiles.length === 0,
    )
    if (missingMov.length > 0) {
      setSubmitError(
        `Missing MOV for: ${missingMov.map((i) => i.successIndicator).join(', ')}`,
      )
      return
    }

    setSubmitError(null)
    submitForReview(currentUser.id, currentUser.name)
  }

  return (
    <div className="space-y-6">
      {/* Session header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-xl">
                {currentSession.deliveryUnitName}
              </CardTitle>
              <CardDescription className="mt-1">
                Fiscal Year: {currentSession.fiscalYear} · Ratee:{' '}
                {currentSession.rateeName}
              </CardDescription>
            </div>
            <WorkflowStatusBadge status={currentSession.status} />
          </div>
        </CardHeader>
      </Card>

      {/* Rejection notice */}
      {currentSession.status === 'REJECTED_FOR_REVISION' &&
        currentSession.rejectionComment && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <strong>Returned for Revision:</strong>{' '}
              {currentSession.rejectionComment}
            </AlertDescription>
          </Alert>
        )}

      {/* KPI Groups */}
      {CATEGORIES.map((category) => {
        const items = groupedKPIs[category]
        if (items.length === 0) return null
        const catAvg = calc.categoryAverages.self[category]

        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {KPI_CATEGORY_LABELS[category]}
                </CardTitle>
                {catAvg !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Category Average:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 font-semibold"
                    >
                      {catAvg.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[30%] min-w-[200px]">
                        Success Indicator
                      </TableHead>
                      <TableHead className="w-[15%]">Target</TableHead>
                      <TableHead className="w-[15%]">Actual</TableHead>
                      <TableHead className="w-[20%]">
                        Self Rating (Q / E / T)
                      </TableHead>
                      <TableHead className="w-[12%]">MOV</TableHead>
                      <TableHead className="w-[8%] text-right">Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const avg = calc.kpiAverages[item.id]?.self
                      return (
                        <>
                          <TableRow key={item.id} className="align-top">
                            <TableCell className="py-3">
                              <p className="font-medium text-sm">
                                {item.successIndicator}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.functionDescription}
                              </p>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="text-xs text-muted-foreground">
                                {item.target}
                              </p>
                            </TableCell>
                            <TableCell className="py-3">
                              <Textarea
                                rows={2}
                                placeholder="Actual accomplishment"
                                value={item.actual}
                                onChange={(e) =>
                                  updateActual(item.id, e.target.value)
                                }
                                disabled={isReadOnly}
                                className="text-xs min-h-0 resize-none"
                              />
                            </TableCell>
                            <TableCell className="py-3">
                              <QETInputRow
                                item={item}
                                ratingKey="selfRating"
                                onUpdate={updateSelfRating}
                                disabled={isReadOnly}
                                showAverage={false}
                              />
                            </TableCell>
                            <TableCell className="py-3">
                              <MOVUploader
                                kpiId={item.id}
                                movFiles={item.movFiles}
                                onAdd={addMOVFile}
                                onRemove={removeMOVFile}
                                disabled={isReadOnly}
                                preferredName={item.configuredMOVs?.[0]}
                              />
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <span
                                className={`text-sm font-semibold ${avg !== null ? 'text-primary' : 'text-muted-foreground'}`}
                              >
                                {avg !== null ? avg.toFixed(2) : '—'}
                              </span>
                            </TableCell>
                          </TableRow>
                          {/* Justification row */}
                          {!isReadOnly && (
                            <TableRow
                              key={`${item.id}-just`}
                              className="bg-muted/20"
                            >
                              <TableCell colSpan={6} className="py-2 px-4">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs text-muted-foreground mt-0.5 min-w-fit">
                                    Justification (if actual &lt; target):
                                  </span>
                                  <Input
                                    placeholder="Explain variance from target..."
                                    value={item.justification}
                                    onChange={(e) =>
                                      updateJustification(
                                        item.id,
                                        e.target.value,
                                      )
                                    }
                                    className="h-7 text-xs"
                                    disabled={isReadOnly}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          {isReadOnly && item.justification && (
                            <TableRow
                              key={`${item.id}-just-ro`}
                              className="bg-muted/20"
                            >
                              <TableCell colSpan={6} className="py-2 px-4">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">
                                    Justification:
                                  </span>{' '}
                                  {item.justification}
                                </p>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Summary row */}
      {calc.finalRatingScore.self !== null && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {KPI_CATEGORY_LABELS[cat]}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {calc.categoryAverages.self[cat]?.toFixed(2) ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Final Rating</p>
                <p className="text-3xl font-black text-primary">
                  {calc.finalRatingScore.self?.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation error */}
      {submitError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Submit button */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button onClick={validateAndSubmit} className="gap-2 min-w-[180px]">
            <Send className="h-4 w-4" />
            Submit for Review
          </Button>
        </div>
      )}

      {currentSession.status === 'SUBMITTED_FOR_REVIEW' && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your evaluation has been submitted. Awaiting PMT review.
            {currentSession.submittedAt && (
              <span className="ml-2 text-xs">
                Submitted:{' '}
                {new Date(currentSession.submittedAt).toLocaleString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
