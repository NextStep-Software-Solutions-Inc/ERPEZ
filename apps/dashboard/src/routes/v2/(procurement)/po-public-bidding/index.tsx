import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/po-public-bidding/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/purchase-orders',
      search: { mode: 'public-bidding' },
    })
  },
  component: () => null,
})