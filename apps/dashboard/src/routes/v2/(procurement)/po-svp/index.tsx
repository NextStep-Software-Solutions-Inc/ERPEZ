import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/po-svp/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/purchase-orders',
      search: { mode: 'svp' },
    })
  },
  component: () => null,
})