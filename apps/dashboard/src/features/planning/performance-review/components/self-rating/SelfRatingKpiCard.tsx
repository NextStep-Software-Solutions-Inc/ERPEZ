import { useEffect } from 'react'

import { AlertTriangle, Lock, Unlock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useGetOpcrItemRatings } from '../../hooks/useRatingsAPI'
import type { OpcrItemRating } from '@/services/api/ratings'
import type { KPILineItem } from '../../types'
import { KPI_LEFT_BORDER, formatMetaDisplay } from '../../utils/selfRating'
import { getAdjectivalRating, ADJECTIVAL_COLOR } from '../../types'
import { SelfRatingKpiScaleTargetSection } from './SelfRatingKpiScaleTargetSection'
import { QETScoreInput } from './QETScoreInput'
import { MOVFileUploadSection } from './MOVFileUploadSection'
import { usePerformanceReviewStore } from '../../store/performanceReviewStore'

const EMPTY_RATINGS: OpcrItemRating[] = []

interface SelfRatingKpiCardProps {
  item: KPILineItem
  isReadOnly: boolean
  onUpdateSelfRating: (
    id: string,
    field: 'quality' | 'efficiency' | 'timeliness',
    v: number | null,
    fyActiveKPIMeasurementId: string | null | undefined,
  ) => void
  onUpdateActual: (id: string, v: string) => void
  onUpdateJustification: (id: string, v: string) => void
  kpiAvg: number | null
  syncItemRatings: (itemId: string, ratings: OpcrItemRating[]) => void
  onFilesChange?: (itemId: string, files: Map<number, File>) => void
}

export function SelfRatingKpiCard({
  item,
  isReadOnly,
  onUpdateSelfRating,
  onUpdateActual,
  onUpdateJustification,
  kpiAvg,
  syncItemRatings,
  onFilesChange,
}: SelfRatingKpiCardProps) {
  const currentSession = usePerformanceReviewStore((state) => state.currentSession)
  const adjRating = kpiAvg !== null ? getAdjectivalRating(kpiAvg) : null
  const hasActual = item.actual.trim().length > 0
  const cardTitle = item.kpiName || item.successIndicator
  const metaFields = [
    { label: 'Office', value: item.officeName },
    { label: 'FY', value: item.opcrFiscalYear },
    { label: 'Unit', value: item.measurementUnit },
    { label: 'Behavior', value: item.distributionBehavior },
  ].filter(
    (field) =>
      field.value !== null && field.value !== undefined && field.value !== '',
  )

  const { data: ratingsResponse } = useGetOpcrItemRatings(item.id)
  const ratings = ratingsResponse ?? EMPTY_RATINGS

  useEffect(() => {
    if (ratings) {
      syncItemRatings(item.id, ratings)
    }
  }, [item.id, ratings, syncItemRatings])

  const qualityRating = ratings.find(
    (rating) =>
      rating.dimension?.toLowerCase() === 'quality' ||
      rating.dimension?.toLowerCase() === 'q',
  )
  const efficiencyRating = ratings.find(
    (rating) =>
      rating.dimension?.toLowerCase() === 'efficiency' ||
      rating.dimension?.toLowerCase() === 'e',
  )
  const timelinessRating = ratings.find(
    (rating) =>
      rating.dimension?.toLowerCase() === 'timeliness' ||
      rating.dimension?.toLowerCase() === 't',
  )

  const pmtScores = [
    qualityRating?.pmtRating,
    efficiencyRating?.pmtRating,
    timelinessRating?.pmtRating,
  ].filter((v): v is number => v !== null && v !== undefined)

  const pmtAvg = pmtScores.length > 0
    ? pmtScores.reduce((a, b) => a + b, 0) / pmtScores.length
    : null

  const pmtRemarks = ratings
    .map((r) => r.pmtRemark)
    .filter((remark): remark is string => Boolean(remark && remark.trim().length > 0))

  return (
    <div
      className={`border border-l-4 rounded-lg overflow-hidden mb-3 bg-white shadow-sm ${KPI_LEFT_BORDER[item.category]} transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3 px-4 py-3 bg-white border-b">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{cardTitle}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {metaFields.map((field) => (
              <Badge
                key={`${item.id}-${field.label}`}
                variant="outline"
                className="text-[10px] font-normal bg-slate-50 text-slate-600"
              >
                {field.label}: {formatMetaDisplay(field.value)}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isReadOnly ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Unlock className="h-3.5 w-3.5 text-muted-foreground/40" />
          )}
        </div>
      </div>

      <SelfRatingKpiScaleTargetSection item={item} />

      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-[2fr_2.2fr] gap-4 items-start">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Actual Accomplishment
          </Label>
          <Textarea
            rows={2}
            placeholder="Describe actual accomplishment…"
            value={item.actual}
            onChange={(e) => onUpdateActual(item.id, e.target.value)}
            disabled={isReadOnly}
            className="text-sm resize-none min-h-[64px] p-2 bg-white border rounded"
          />
          {hasActual && (
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                Justification
                {!isReadOnly && (
                  <span className="text-amber-500 font-semibold">*</span>
                )}
              </Label>
              <Input
                placeholder="Explain variance from target…"
                value={item.justification}
                onChange={(e) => onUpdateJustification(item.id, e.target.value)}
                disabled={isReadOnly}
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Self-Rating (Q / E / T)
          </Label>
          <div className="flex items-end gap-2">
            {item.tags.includes('quality') && (
              <QETScoreInput
                label="Q"
                value={item.selfRating.quality}
                onChange={(v) =>
                  onUpdateSelfRating(
                    item.id,
                    'quality',
                    v,
                    qualityRating?.fyActiveKPIMeasurementId ||
                      item.fyActiveKPIMeasurementId,
                  )
                }
                disabled={isReadOnly}
                pmtRating={qualityRating?.pmtRating}
                pmtRemark={qualityRating?.pmtRemark}
              />
            )}
            {item.tags.includes('efficiency') && (
              <QETScoreInput
                label="E"
                value={item.selfRating.efficiency}
                onChange={(v) =>
                  onUpdateSelfRating(
                    item.id,
                    'efficiency',
                    v,
                    efficiencyRating?.fyActiveKPIMeasurementId ||
                      item.fyActiveKPIMeasurementId,
                  )
                }
                disabled={isReadOnly}
                pmtRating={efficiencyRating?.pmtRating}
                pmtRemark={efficiencyRating?.pmtRemark}
              />
            )}
            {item.tags.includes('timeliness') && (
              <QETScoreInput
                label="T"
                value={item.selfRating.timeliness}
                onChange={(v) =>
                  onUpdateSelfRating(
                    item.id,
                    'timeliness',
                    v,
                    timelinessRating?.fyActiveKPIMeasurementId ||
                      item.fyActiveKPIMeasurementId,
                  )
                }
                disabled={isReadOnly}
                pmtRating={timelinessRating?.pmtRating}
                pmtRemark={timelinessRating?.pmtRemark}
              />
            )}
            <div className="flex flex-col items-center gap-1 min-w-[72px] ml-6">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Avg
              </span>
              <div
                className={`h-10 w-20 flex items-center justify-center rounded-md border font-bold text-sm ${
                  kpiAvg !== null
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-dashed bg-muted/20 text-muted-foreground'
                }`}
              >
                {kpiAvg !== null ? kpiAvg.toFixed(2) : '—'}
              </div>
              {adjRating && (
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${ADJECTIVAL_COLOR[adjRating]}`}
                >
                  {adjRating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <MOVFileUploadSection
        itemId={item.id}
        configuredMOVs={item.configuredMOVs}
        existingFiles={item.movFiles}
        isReadOnly={isReadOnly}
        onFilesChange={(files) => onFilesChange?.(item.id, files)}
      />

      {/* PMT Evaluation Results Section */}
      {(pmtScores.length > 0 || pmtRemarks.length > 0 || currentSession?.status === 'FINALIZED' || currentSession?.status === 'REJECTED_FOR_REVISION') && (
        <div className="border-t bg-slate-50/50 px-4 py-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              PMT Evaluation
            </span>
            {/* Status badge */}
            {currentSession?.status === 'FINALIZED' && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[10px] font-semibold">
                Approved (Success)
              </Badge>
            )}
            {currentSession?.status === 'REJECTED_FOR_REVISION' && (
              <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 text-[10px] font-semibold">
                Returned for Revision
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PMT Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {item.tags.includes('quality') && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase">Q</span>
                    <span className="text-xs font-bold text-slate-700 bg-white border px-2 py-0.5 rounded min-w-[28px] text-center">
                      {qualityRating?.pmtRating !== null && qualityRating?.pmtRating !== undefined
                        ? qualityRating.pmtRating.toFixed(1)
                        : '—'}
                    </span>
                  </div>
                )}
                {item.tags.includes('efficiency') && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase">E</span>
                    <span className="text-xs font-bold text-slate-700 bg-white border px-2 py-0.5 rounded min-w-[28px] text-center">
                      {efficiencyRating?.pmtRating !== null && efficiencyRating?.pmtRating !== undefined
                        ? efficiencyRating.pmtRating.toFixed(1)
                        : '—'}
                    </span>
                  </div>
                )}
                {item.tags.includes('timeliness') && (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase">T</span>
                    <span className="text-xs font-bold text-slate-700 bg-white border px-2 py-0.5 rounded min-w-[28px] text-center">
                      {timelinessRating?.pmtRating !== null && timelinessRating?.pmtRating !== undefined
                        ? timelinessRating.pmtRating.toFixed(1)
                        : '—'}
                    </span>
                  </div>
                )}
              </div>

              {pmtAvg !== null && (
                <div className="flex items-center gap-2 border-l pl-3 ml-1">
                  <div className="text-center">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase block font-semibold leading-tight">PMT Avg</span>
                    <span className="text-sm font-extrabold text-purple-700 leading-tight">
                      {pmtAvg.toFixed(2)}
                    </span>
                  </div>
                  {getAdjectivalRating(pmtAvg) && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${ADJECTIVAL_COLOR[getAdjectivalRating(pmtAvg)]}`}>
                      {getAdjectivalRating(pmtAvg)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PMT Remarks */}
            <div className="text-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-0.5">PMT Remarks / Justification</span>
              {pmtRemarks.length > 0 ? (
                <div className="bg-white border rounded p-1.5 text-slate-600 italic">
                  {pmtRemarks.map((remark, idx) => (
                    <p key={idx} className="leading-snug">"{remark}"</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No remarks provided.</p>
              )}
            </div>
          </div>

          {/* Return reason box if status is REJECTED_FOR_REVISION */}
          {currentSession?.status === 'REJECTED_FOR_REVISION' && currentSession.rejectionComment && (
            <div className="bg-red-50/50 border border-red-100 rounded-md p-2 text-xs text-red-800">
              <span className="font-semibold block mb-0.5 text-red-900">Reason for Return:</span>
              <p className="italic">"{currentSession.rejectionComment}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
