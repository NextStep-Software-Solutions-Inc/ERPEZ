// NOTE:
// This file is intentionally left without any route/component exports.
// The `/v2/(planning)/annual-performance-planning` route is defined in
// `annual-performance-planning.tsx` at the same directory level.
//
// Keeping this file as a non-route placeholder avoids duplicate
// route definitions that can cause conflicts or ambiguous matches
// in file-based routing and satisfies the CodeQL rule that flagged
// both files defining the same route.

// Make this a TS module without exporting any route/component.
export {};
import AppFormPage from '@/pages/planning/app/AppFormPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v2/(planning)/annual-performance-planning/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AppFormPage />
}
