import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/manage-bac-resolutions/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/bac-resolutions',
      search: { id: undefined },
      replace: true,
    })
  },
  component: () => null,
})

