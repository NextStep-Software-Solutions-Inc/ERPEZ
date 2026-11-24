import type { Dispatch, SetStateAction } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { AdjectivalBadge } from '../../components/AdjectivalBadge'
import { KPI_CATEGORY_LABELS, KPI_CATEGORY_WEIGHTS } from '../../types'
import type { KPICategory, KPILineItem } from '../../types'
import {
  CATEGORY_COLORS,
  CATEGORY_DOT,
  SELF_RATING_CATEGORIES,
} from '../../utils/selfRating'
import { getAdjectivalRating } from '../../types'
import { SelfRatingKpiCard } from './SelfRatingKpiCard'
import type { OpcrItemRating } from '@/services/api/ratings'

interface SelfRatingKpiAccordionProps {
  groupedKPIs: Record<KPICategory, KPILineItem[]>
  openAccordions: string[]
  setOpenAccordions: Dispatch<SetStateAction<string[]>>
  isReadOnly: boolean
  customWeights?: Partial<Record<KPICategory, number>>
  calc: {
    kpiAverages: Record<string, { self: number | null; final: number | null }>
    categoryAverages: {
      self: Record<KPICategory, number | null>
      final: Record<KPICategory, number | null>
    }
    finalRatingScore: { self: number | null; final: number | null }
  }
  onUpdateSelfRating: (
    id: string,
    field: 'quality' | 'efficiency' | 'timeliness',
    v: number | null,
    fyActiveKPIMeasurementId: string | null | undefined,
  ) => void
  onUpdateActual: (id: string, v: string) => void
  onUpdateJustification: (id: string, v: string) => void
  syncItemRatings: (itemId: string, ratings: OpcrItemRating[]) => void
  onFilesChange?: (itemId: string, files: Map<number, File>) => void
}

export function SelfRatingKpiAccordion({
  groupedKPIs,
  openAccordions,
  setOpenAccordions,
  isReadOnly,
  customWeights,
  calc,
  onUpdateSelfRating,
  onUpdateActual,
  onUpdateJustification,
  syncItemRatings,
  onFilesChange,
}: SelfRatingKpiAccordionProps) {
  return (
    <Accordion
      type="multiple"
      value={openAccordions}
      onValueChange={setOpenAccordions}
      className="space-y-3"
    >
      {SELF_RATING_CATEGORIES.map((category) => {
        const items = groupedKPIs[category]
        const catAvg = calc.categoryAverages.self[category]
        const weight = customWeights?.[category] ?? KPI_CATEGORY_WEIGHTS[category]
        const completedCount = items.filter(
          (item) => calc.kpiAverages[item.id]?.self !== null,
        ).length
        const completionLabel =
          items.length === 0
            ? 'No KPI items assigned'
            : `${completedCount}/${items.length} rated`

        return (
          <AccordionItem
            key={category}
            value={category}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center justify-between w-full pr-2 gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[category]}`}
                  />
                  <span className="font-semibold text-sm">
                    {KPI_CATEGORY_LABELS[category]}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] border ${CATEGORY_COLORS[category]}`}
                  >
                    Weight: {(weight * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {completionLabel}
                  </span>
                  {catAvg !== null && (
                    <>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 font-bold text-xs"
                      >
                        Avg: {catAvg.toFixed(2)}
                      </Badge>
                      <AdjectivalBadge rating={getAdjectivalRating(catAvg)} />
                    </>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-2">
              <p className="text-xs text-muted-foreground mb-3 italic">
                {category === 'STRATEGIC' &&
                  "Targets aligned to the organization's strategic priorities and major final outputs (MFOs)."}
                {category === 'CORE' &&
                  "Primary operational functions that directly contribute to the delivery unit's mandate."}
                {category === 'SUPPORT' &&
                  'Mandatory administrative and support functions required for effective governance.'}
              </p>

              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  No KPI items have been assigned to{' '}
                  {KPI_CATEGORY_LABELS[category].toLowerCase()} yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <SelfRatingKpiCard
                      key={item.id}
                      item={item}
                      isReadOnly={isReadOnly}
                      onUpdateSelfRating={onUpdateSelfRating}
                      onUpdateActual={onUpdateActual}
                      onUpdateJustification={onUpdateJustification}
                      kpiAvg={calc.kpiAverages[item.id]?.self ?? null}
                      syncItemRatings={syncItemRatings}
                      onFilesChange={onFilesChange}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-6 flex-wrap">
              {SELF_RATING_CATEGORIES.map((cat) => {
                const avg = calc.categoryAverages.self[cat]
                const catWeight = customWeights?.[cat] ?? KPI_CATEGORY_WEIGHTS[cat]
                return (
                  <div key={cat} className="text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {KPI_CATEGORY_LABELS[cat].replace(' Functions', '')}
                    </p>
                    <p
                      className={`text-2xl font-black ${avg !== null ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {avg?.toFixed(2) ?? '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(catWeight * 100).toFixed(0)}% weight
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Self-Rated Final Score
              </p>
              <p className="text-4xl font-black text-primary">
                {calc.finalRatingScore.self !== null
                  ? calc.finalRatingScore.self.toFixed(2)
                  : '—'}
              </p>
              {calc.categoryAverages.self &&
              calc.finalRatingScore.self !== null ? (
                <AdjectivalBadge
                  rating={getAdjectivalRating(calc.finalRatingScore.self)}
                />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Accordion>
  )
}
