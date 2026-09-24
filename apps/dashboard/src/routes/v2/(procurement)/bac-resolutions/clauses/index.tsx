import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/clauses/',
)({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/procurement-library',
      search: { tab: 'ResolutionClauses' },
      replace: true,
    })
  },
  component: () => null,
})
