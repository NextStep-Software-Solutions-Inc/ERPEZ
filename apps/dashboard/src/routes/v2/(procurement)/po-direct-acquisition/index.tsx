import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/po-direct-acquisition/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/purchase-orders',
      search: { mode: 'direct-acquisition' },
    })
  },
  component: () => null,
})
