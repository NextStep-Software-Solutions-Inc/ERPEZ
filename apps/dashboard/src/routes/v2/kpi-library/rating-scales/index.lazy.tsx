/**
 * Rating Scale Template Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const RatingScaleTemplatePage = lazy(() =>
  import(
    '@/features/planning/rating-scale-template/pages/RatingScaleTemplatePage'
  ).then((m) => ({
    default: m.RatingScaleTemplatePage,
  })),
)

export const Route = createLazyFileRoute('/v2/kpi-library/rating-scales/')({
  component: () => (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to view Rating Scale Templates."
    >
      <Suspense fallback={<div>Loading Rating Scale Templates...</div>}>
        <RatingScaleTemplatePage />
      </Suspense>
    </RoutePermissionGuard>
  ),
})
