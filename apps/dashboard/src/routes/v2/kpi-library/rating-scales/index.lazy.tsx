/**
 * Rating Scale Template Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const RatingScaleTemplatePage = lazy(() =>
  import(
    '@/features/planning/rating-scale-template/pages/RatingScaleTemplatePage'
  ).then((m) => ({
    default: m.RatingScaleTemplatePage,
  })),
)

export const Route = createLazyFileRoute('/v2/kpi-library/rating-scales/')({
  component: () => (
    <Suspense fallback={<div>Loading Rating Scale Templates...</div>}>
      <RatingScaleTemplatePage />
    </Suspense>
  ),
})
