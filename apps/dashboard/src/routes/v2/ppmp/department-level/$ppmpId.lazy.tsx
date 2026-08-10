/**
 * Department-level PPMP workspace route
 */

import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/v2/ppmp/department-level/$ppmpId')({
  component: DepartmentLevelWorkspaceRoute,
})

function DepartmentLevelWorkspaceRoute() {
  const { ppmpId } = Route.useParams()

  return <></>
}
