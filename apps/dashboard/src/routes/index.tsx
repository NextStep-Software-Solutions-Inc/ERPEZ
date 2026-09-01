import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/dashboard',
    })
  },
  component: () => null,
})
