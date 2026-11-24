import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(procurement)/manage-pos/')({
  component: ManagePosRoute,
})

function ManagePosRoute() {
  return <Navigate to="/v2/purchase-orders" replace />
}
