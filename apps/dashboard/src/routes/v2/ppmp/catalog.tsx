/**
 * Legacy route redirect.
 * The catalog workspace now lives under /v2/procurement-library?tab=catalog.
 */

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/ppmp/catalog')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/procurement-library',
      search: { tab: 'catalog' },
    })
  },
  component: CatalogRoute,
})

function CatalogRoute() {
  return null
}
