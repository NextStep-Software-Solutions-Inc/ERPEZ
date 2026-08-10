/**
 * PPMP Detail Route Layout
 * Parent layout for PPMP detail routes
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/v2/(planning)/ppmp/_ppmp-detail')({
  component: PPMPDetailLayout,
})

function PPMPDetailLayout() {
  return <Outlet />
}
